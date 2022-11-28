use image::io::Reader as ImageReader;

use crate::tools::{datetime, file_opts::copy_file};
use serde::Serialize;
use sqlite::Row;
use std::env;

use super::connect::get_database_connection;

#[derive(Debug, Clone, Serialize)]
pub struct FrameConfig {
    id: Option<i64>,
    name: String,
    width: u32,
    height: u32,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    source: String,
    create_at: Option<String>,
}

impl FrameConfig {
    /// 新建裁剪配置
    pub fn new(name: &str, top: u32, right: u32, bottom: u32, left: u32, source: &str) -> Self {
        let store_source_path = FrameConfig::copy_source_file(&source);
        let (width, height) = FrameConfig::get_img_size(&source);
        Self {
            id: None,
            name: name.to_string(),
            width,
            height,
            top,
            right,
            bottom,
            left,
            source: store_source_path,
            create_at: Some(datetime::now().to_string()),
        }
    }

    pub fn insert(&self) -> Result<(), String> {
        let conn = get_database_connection()?;
        let stmt = format!("INSERT INTO FRAME_CONFIG ( NAME, WIDTH, HEIGHT, TOP, RIGHT, BOTTOM, LEFT, CREATE_AT, SOURCE) VAlUES ('{}',{},{},{},{},{},{},'{}','{}');",
        &self.name,
        &self.width,
        &self.height,
        &self.top,
        &self.right,
        &self.bottom,
        &self.left,
        &self.create_at.as_ref().unwrap(),
        &self.source);
        match conn.execute(&stmt) {
            Ok(_) => Ok(()),
            Err(err) => {
                error!("Insert frame config table fail: {},\n{:?}", &stmt, err);
                Err("Insert fail".to_string())
            }
        }
    }

    pub fn get_all() -> Result<Vec<FrameConfig>, String> {
        let conn = get_database_connection()?;
        let query = "SELECT ID,NAME,WIDTH,HEIGHT, TOP, RIGHT, BOTTOM, LEFT,CREATE_AT,SOURCE FROM FRAME_CONFIG WHERE 1=1;";
        let rows: Vec<Row> = conn
            .prepare(query)
            .unwrap()
            .into_iter()
            .map(|row| row.unwrap())
            .collect();
        Ok(FrameConfig::trans_to_instances(rows)?)
    }

    pub fn get_detail(id: i64) -> Result<FrameConfig, String> {
        let conn = get_database_connection()?;
        let query = "SELECT ID,NAME,WIDTH,HEIGHT, TOP, RIGHT, BOTTOM, LEFT,SOURCE,CREATE_AT FROM FRAME_CONFIG WHERE id=?;";
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
        let configs = FrameConfig::trans_to_instances(rows)?;
        Ok(configs[0].clone())
    }

    pub fn delete(id: i64) -> Result<(), String> {
        let _config = FrameConfig::get_detail(id)?;
        let conn = get_database_connection()?;
        let stmt = format!("DELETE FROM FRAME_CONFIG WHERE id={}", &id);
        match conn.execute(stmt) {
            Ok(_) => Ok(()),
            Err(_) => Err("Delete error.".to_string()),
        }
    }

    fn trans_to_instances(rows: Vec<Row>) -> Result<Vec<FrameConfig>, String> {
        let mut result: Vec<FrameConfig> = vec![];
        let current_dir = env::current_dir().expect("");
        for row in rows {
            let id = row.read::<i64, _>("ID");
            let name = row.read::<&str, _>("NAME");
            let width = row.read::<i64, _>("WIDTH");
            let height = row.read::<i64, _>("HEIGHT");
            let top = row.read::<i64, _>("TOP");
            let right = row.read::<i64, _>("RIGHT");
            let bottom = row.read::<i64, _>("BOTTOM");
            let left = row.read::<i64, _>("LEFT");
            let create_at = row.read::<&str, _>("CREATE_AT");
            let source = row.read::<&str, _>("SOURCE");
            let mut source_path = current_dir.clone();
            source_path.push(source);
            result.push(FrameConfig {
                id: Some(id),
                name: name.to_string(),
                width: width as u32,
                height: height as u32,
                top: top as u32,
                right: right as u32,
                bottom: bottom as u32,
                left: left as u32,
                source: String::from(source_path.to_string_lossy()),
                create_at: Some(create_at.to_string()),
            });
        }
        Ok(result)
    }

    pub fn update_frame_config(
        id: i64,
        name: &str,
        top: u32,
        right: u32,
        bottom: u32,
        left: u32,
        source: &str,
    ) -> Result<bool, String> {
        let origin = FrameConfig::get_detail(id.clone())?;
        let mut update_list: Vec<String> = vec![];
        if origin.name.as_str() != name {
            update_list.push(format!("NAME='{}'", name));
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
        let current_dir = env::current_dir().expect("");
        let mut origin_path = current_dir.clone();
        origin_path.push(origin.source);
        if source != String::from(origin_path.to_string_lossy()) {
            let new_source_path = FrameConfig::copy_source_file(&source);
            let (width, height) = FrameConfig::get_img_size(&source);
            update_list.push(format!("SOURCE='{}'", new_source_path));
            update_list.push(format!("WIDTH={}", width));
            update_list.push(format!("HEIGHT={}", height));
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
        let source_cache_path = copy_file("frame_source/", &source).expect("Copy fail.");
        let current_dir = env::current_dir().expect("Get current dir fail.");
        let relative_path = source_cache_path.strip_prefix(current_dir).unwrap();
        String::from(relative_path.to_string_lossy())
    }

    fn get_img_size(source: &str) -> (u32, u32) {
        let img = ImageReader::open(source).unwrap().decode().expect("");
        (img.width(), img.height())
    }
}
