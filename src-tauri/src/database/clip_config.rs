use std::io::Cursor;

use crate::tools::{datetime, file_opts::copy_file, image_tools::image_clip};
use image::ImageError;
use serde::Serialize;
use sqlite::Row;
use std::env;

use super::connect::get_database_connection;

#[derive(Debug, Clone, Serialize)]
pub struct ClipConfig {
    id: Option<i64>,
    body_type: i8,
    part: i8,
    name: String,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    radius: u32,
    thumbnail: Vec<u8>,
    source: String,
    create_at: Option<String>,
}

impl ClipConfig {
    /// 新建裁剪配置
    pub fn new(
        body_type: i8,
        part: i8,
        name: &str,
        top: u32,
        right: u32,
        bottom: u32,
        left: u32,
        radius: u32,
        source: &str,
    ) -> Self {
        let thumbnail =
            ClipConfig::create_thumbnail(source, top, right, bottom, left, radius).unwrap();
        let relative_path_str = ClipConfig::copy_source_file(&source);
        Self {
            id: None,
            body_type,
            part,
            name: name.to_string(),
            top,
            right,
            bottom,
            left,
            radius,
            thumbnail,
            source: relative_path_str,
            create_at: Some(datetime::now().to_string()),
        }
    }

    /// 裁剪生成缩略图
    fn create_thumbnail(
        source: &str,
        top: u32,
        right: u32,
        bottom: u32,
        left: u32,
        radius: u32,
    ) -> Result<Vec<u8>, ImageError> {
        let mut bytes: Vec<u8> = Vec::new();
        let img = image_clip(source, top, right, bottom, left, radius)?;
        img.write_to(&mut Cursor::new(&mut bytes), image::ImageOutputFormat::Png)?;
        Ok(bytes)
    }

    pub fn insert(&self) -> Result<(), String> {
        let conn = get_database_connection()?;
        let stmt = format!("INSERT INTO CLIP_CONFIG (BODY_TYPE, PART, NAME, TOP, RIGHT, BOTTOM, LEFT, RADIUS, THUMBNAIL, CREATE_AT, SOURCE) VAlUES ({},{},'{}',{},{},{},{},{},'{}','{}','{}');",
        &self.body_type,
        &self.part,
        &self.name,
        &self.top,
        &self.right,
        &self.bottom,
        &self.left,
        &self.radius,
        serde_json::to_string(&self.thumbnail).unwrap(),
        &self.create_at.as_ref().unwrap(),
        &self.source);
        match conn.execute(&stmt) {
            Ok(_) => Ok(()),
            Err(err) => {
                error!("Insert clip config table fail: {},\n{:?}", &stmt, err);
                Err("Insert fail".to_string())
            }
        }
    }

    pub fn get_all() -> Result<Vec<ClipConfig>, String> {
        let conn = get_database_connection()?;
        let query = "SELECT ID,BODY_TYPE,NAME,PART,TOP,RIGHT,BOTTOM,LEFT,RADIUS,SOURCE,THUMBNAIL,CREATE_AT,SOURCE FROM CLIP_CONFIG WHERE 1=1;";
        let rows: Vec<Row> = conn
            .prepare(query)
            .unwrap()
            .into_iter()
            .map(|row| row.unwrap())
            .collect();
        Ok(ClipConfig::trans_to_instances(rows)?)
    }

    pub fn get_detail(id: i64) -> Result<ClipConfig, String> {
        let conn = get_database_connection()?;
        let query = "SELECT ID,BODY_TYPE,NAME,PART,TOP,RIGHT,BOTTOM,LEFT,RADIUS,THUMBNAIL,SOURCE,CREATE_AT FROM CLIP_CONFIG WHERE id=?;";
        let rows: Vec<Row> = conn
            .prepare(query)
            .unwrap()
            .into_iter()
            .bind((1, id))
            .unwrap()
            .map(|row| row.unwrap())
            .collect();
        if rows.len() != 1 {
            return Err("Not exists.".to_string());
        }
        let configs = ClipConfig::trans_to_instances(rows)?;
        Ok(configs[0].clone())
    }

    pub fn delete(id: i64) -> Result<(), String> {
        let _config = ClipConfig::get_detail(id)?;
        let conn = get_database_connection()?;
        let stmt = format!("DELETE FROM CLIP_CONFIG WHERE id={}", &id);
        match conn.execute(stmt) {
            Ok(_) => Ok(()),
            Err(_) => Err("Delete error.".to_string()),
        }
    }

    fn trans_to_instances(rows: Vec<Row>) -> Result<Vec<ClipConfig>, String> {
        let mut result: Vec<ClipConfig> = vec![];
        let current_dir = env::current_dir().expect("");
        for row in rows {
            let id = row.read::<i64, _>("ID");
            let body_type = row.read::<i64, _>("BODY_TYPE");
            let part = row.read::<i64, _>("PART");
            let name = row.read::<&str, _>("NAME");
            let top = row.read::<i64, _>("TOP");
            let right = row.read::<i64, _>("RIGHT");
            let bottom = row.read::<i64, _>("BOTTOM");
            let left = row.read::<i64, _>("LEFT");
            let radius = row.read::<i64, _>("RADIUS");
            let thumbnail = row.read::<&str, _>("THUMBNAIL");
            let create_at = row.read::<&str, _>("CREATE_AT");
            let source = row.read::<&str, _>("SOURCE");
            let mut source_path = current_dir.clone();
            source_path.push(source);
            result.push(ClipConfig {
                id: Some(id),
                body_type: body_type as i8,
                part: part as i8,
                name: name.to_string(),
                top: top as u32,
                right: right as u32,
                bottom: bottom as u32,
                left: left as u32,
                radius: radius as u32,
                source: String::from(source_path.to_string_lossy()),
                thumbnail: serde_json::from_str(thumbnail).unwrap(),
                create_at: Some(create_at.to_string()),
            });
        }
        Ok(result)
    }

    pub fn update_clip_config(
        id: i64,
        name: &str,
        body_type: i8,
        part: i8,
        top: u32,
        right: u32,
        bottom: u32,
        left: u32,
        radius: u32,
        source: &str,
    ) -> Result<bool, String> {
        let origin = ClipConfig::get_detail(id.clone())?;
        let mut update_list: Vec<String> = vec![];
        if origin.name.as_str() != name {
            update_list.push(format!("NAME='{}'", name));
        }
        if body_type != origin.body_type {
            update_list.push(format!("BODY_TYPE={}", body_type));
        }
        if part != origin.part {
            update_list.push(format!("PART={}", part));
        }
        if top != origin.top {
            update_list.push(format!("TOP={}", top));
        }
        if right != origin.right {
            update_list.push(format!("RIGHT={}", right));
        }
        if bottom != origin.bottom {
            update_list.push(format!("BOTTOM={}", bottom));
        }
        if left != origin.left {
            update_list.push(format!("LEFT={}", left));
        }
        if radius != origin.radius {
            update_list.push(format!("RADIUS={}", radius));
        }
        let current_dir = env::current_dir().expect("");
        let mut origin_path = current_dir.clone();
        origin_path.push(origin.source);
        if source != String::from(origin_path.to_string_lossy()) {
            let new_source_path = ClipConfig::copy_source_file(&source);
            update_list.push(format!("SOURCE='{}'", new_source_path));
        }
        if (source != String::from(origin_path.to_string_lossy()))
            || (top != origin.top)
            || (right != origin.right)
            || (bottom != origin.bottom)
            || (left != origin.left)
            || (radius != origin.radius)
        {
            let thumbnail =
                ClipConfig::create_thumbnail(source, top, right, bottom, left, radius).unwrap();
            update_list.push(format!(
                "THUMBNAIL='{}'",
                serde_json::to_string(&thumbnail).unwrap()
            ));
        }
        if update_list.len() == 0 {
            return Ok(true);
        }
        let stmt = format!(
            "UPDATE CLIP_CONFIG SET {} WHERE id={};",
            update_list.join(","),
            &id
        );
        let conn = get_database_connection()?;
        info!("Update clip config: {}", &id);
        match conn.execute(stmt) {
            Ok(_) => {
                if source != String::from(origin_path.to_string_lossy()) {
                    std::fs::remove_file(&origin_path).expect("Delete origin fail.");
                }
                Ok(true)
            }
            Err(_) => Err("Update fail.".to_string()),
        }
    }

    fn copy_source_file(source: &str) -> String {
        let source_cache_path = copy_file("clip_source/", &source).expect("Copy fail.");
        let current_dir = env::current_dir().expect("Get current dir fail.");
        let relative_path = source_cache_path.strip_prefix(current_dir).unwrap();
        String::from(relative_path.to_string_lossy())
    }
}
