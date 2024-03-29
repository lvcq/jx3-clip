use image::io::Reader as ImageReader;
use image::{
    imageops::{self, FilterType},
    DynamicImage,
};
use image::{GenericImageView, ImageFormat};
use std::thread;

use super::project_config::{PartConfig, ProjectBrief, ProjectConfig, ProjectDetail};
use crate::tools::datetime::now;
use crate::tools::file_opts::{unzip_file_to_directory, zip_dir};
use crate::tools::image_tools::{image_clip, save_image};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use threadpool::ThreadPool;
/// 项目相关操作

pub fn clip_project_imgs(
    sources: Vec<String>,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    radius: u32,
) -> Vec<String> {
    let mut cliped_imgs: Vec<String> = vec![];
    let n_workers = 6;
    let pool = ThreadPool::new(n_workers);
    let count = sources.len();
    let (sx, rx) = mpsc::channel::<Option<String>>();
    for source in sources {
        let sxc = sx.clone();
        pool.execute(
            move || match image_clip(&source, top, right, bottom, left, radius) {
                Ok(img) => match save_image(&img, "images_tmp") {
                    Ok(file_path) => {
                        let store_path = String::from(file_path.to_string_lossy());
                        sxc.send(Some(store_path)).unwrap();
                    }
                    Err(err_str) => {
                        print!("{}", err_str);
                        sxc.send(None).unwrap();
                    }
                },
                Err(_) => sxc.send(None).unwrap(),
            },
        );
    }
    for _ in 0..count {
        let received = rx.recv().unwrap();
        if received.is_some() {
            cliped_imgs.push(received.unwrap());
        }
    }
    cliped_imgs
}

/// 创建预览图片
pub fn crate_preview(config: ProjectConfig) -> Result<String, String> {
    let (hair, clothes) = create_part_image_with_thread(&config.hair, &config.clothes)?;
    let vpd = if let Some(central) = config.central {
        central.v_padding
    } else {
        0u32
    };
    let result_img = match (hair, clothes) {
        (Some(hair), Some(clothes)) => Some(concat_images(&hair, &clothes, vpd)),
        (Some(hair), None) => Some(hair),
        (None, Some(clothes)) => Some(clothes),
        (None, None) => None,
    };

    if result_img.is_some() {
        let tmp_path = save_image(result_img.as_ref().unwrap(), "images_tmp")?;
        return Ok(String::from(tmp_path.to_string_lossy()));
    } else {
        Ok("".to_string())
    }
}

#[derive(Debug, Clone)]
struct PartMessage {
    part: String,
    image: Option<DynamicImage>,
}

#[derive(Debug, Clone)]
struct PartConfigItem {
    part: String,
    config: PartConfig,
}

fn create_part_image_with_thread(
    hair_config: &Option<PartConfig>,
    clothes_config: &Option<PartConfig>,
) -> Result<(Option<DynamicImage>, Option<DynamicImage>), String> {
    let mut configs: Vec<PartConfigItem> = vec![];
    if hair_config.is_none() && clothes_config.is_none() {
        return Ok((None, None));
    }
    if hair_config.is_some() {
        configs.push(PartConfigItem {
            part: String::from("hair"),
            config: hair_config.as_ref().unwrap().clone(),
        });
    }
    if clothes_config.is_some() {
        configs.push(PartConfigItem {
            part: String::from("clothes"),
            config: clothes_config.as_ref().unwrap().clone(),
        });
    }
    let count = configs.len();
    let (sx, rx) = mpsc::channel::<PartMessage>();
    for item in configs {
        let sxc = sx.clone();
        thread::spawn(move || {
            let img = match create_part_image(&item.config) {
                Ok(ig) => Some(ig),
                Err(_) => None,
            };
            sxc.send(PartMessage {
                part: item.part,
                image: img,
            })
            .unwrap();
        });
    }
    let mut hair: Option<DynamicImage> = None;
    let mut clothes: Option<DynamicImage> = None;

    for _ in 0..count {
        let msg = rx.recv().unwrap();
        if msg.part.eq("hair") {
            hair = msg.image;
        } else if msg.part.eq("clothes") {
            clothes = msg.image;
        }
    }
    Ok((hair, clothes))
}

#[derive(Debug, Clone)]
struct RowMessage {
    order: usize,
    img: DynamicImage,
}

/// 创建部位图片
fn create_part_image(config: &PartConfig) -> Result<DynamicImage, String> {
    let image_width = config.width;
    let image_height = config.height;

    let (item_width, item_height, offset_top, offset_left, frame_img) = match &config.frame_config {
        Some(frame_config) => {
            let inner_width = frame_config.right - frame_config.left;
            let inner_height = frame_config.bottom - frame_config.top;
            let h_factor = (image_width as f64) / (inner_width as f64);
            let i_width = (h_factor * (frame_config.width as f64)) as u32;
            let o_left = ((frame_config.left as f64) * h_factor) as u32;
            let v_factor = (image_height as f64) / (inner_height as f64);
            let i_height = ((frame_config.height as f64) * v_factor) as u32;
            let o_top = ((frame_config.top as f64) * v_factor) as u32;
            let mut frame_img = read_image(&frame_config.source)?;
            frame_img = frame_img.resize_exact(i_width, i_height, FilterType::Gaussian);
            (i_width, i_height, o_top, o_left, Some(frame_img))
        }
        None => (image_width, image_height, 0 as u32, 0 as u32, None),
    };
    let image_count = config.images.len();
    let col_count = if image_count as u32 > config.cols {
        config.cols
    } else {
        config.images.len() as u32
    };

    let render_width = if col_count >= 1 {
        item_width * col_count + (col_count - 1) * config.colgap
    } else {
        item_width
    };
    let row_count = ((image_count as f64) / (col_count as f64)).ceil() as u32;
    let render_height = if row_count >= 1 {
        item_height * row_count + (row_count - 1) * config.rowgap
    } else {
        item_height
    };

    let mut result = DynamicImage::new_rgba8(render_width, render_height);
    let (sx, rx) = mpsc::channel::<RowMessage>();
    let center = config.center;
    for row in 0..row_count {
        let start = (row * col_count) as usize;
        let end = if ((row + 1) * col_count - 1) as usize >= image_count {
            image_count - 1
        } else {
            ((row + 1) * col_count - 1) as usize
        };
        let row_list: Vec<String> = (&config.images[start..=end]).to_vec();
        let order = row.clone() as usize;
        let sxc = sx.clone();
        let gap = config.colgap;
        let frame_img = frame_img.clone();
        let col_count = config.cols;
        thread::spawn(move || {
            let img = concat_image_row(
                row_list,
                render_width,
                item_width,
                item_height,
                gap,
                offset_top,
                offset_left,
                col_count,
                frame_img,
                center,
            );
            sxc.send(RowMessage { order, img }).unwrap();
        });
    }

    for _ in 0..row_count {
        let received = rx.recv().unwrap();
        let row = received.order;
        let img = received.img;
        let start_y = (item_height + config.rowgap) * (row as u32);
        imageops::overlay(&mut result, &img, 0, start_y as i64);
    }

    Ok(result)
}

fn concat_image_row(
    sources: Vec<String>,
    render_width: u32,
    width: u32,
    height: u32,
    gap: u32,
    offset_top: u32,
    offset_left: u32,
    col_count: u32,
    frame_img: Option<DynamicImage>,
    center: bool,
) -> DynamicImage {
    let count = sources.len();
    let mut result = DynamicImage::new_rgba8(render_width, height);
    let mut index = 0;
    let origin_x: u32 = if (count as u32) < col_count && center {
        let i_width = (count as u32) * width + (count as u32 - 1) * gap;
        (render_width - i_width) / 2
    } else {
        0
    };
    while index < count {
        let source = sources.get(index).unwrap();
        let item_image = read_image(source).expect("");
        let start_x = (index as u32) * (width + gap) + origin_x;
        imageops::overlay(
            &mut result,
            &item_image,
            (offset_left + start_x).into(),
            offset_top.into(),
        );
        if frame_img.is_some() {
            imageops::overlay(&mut result, frame_img.as_ref().unwrap(), start_x.into(), 0);
        }
        index += 1;
    }
    result
}

fn read_image(src: &str) -> Result<DynamicImage, String> {
    let reader = match ImageReader::open(src) {
        Ok(re) => re,
        Err(_) => {
            return Err("Read image fail.".to_string());
        }
    };
    match reader.decode() {
        Ok(img) => Ok(img),
        Err(_) => {
            return Err("Read image fail.".to_string());
        }
    }
}

fn concat_images(source1: &DynamicImage, source2: &DynamicImage, vd: u32) -> DynamicImage {
    let (width_1, height_1) = source1.dimensions();
    let (width_2, height_2) = source2.dimensions();
    let min_width = u32::min(width_1, width_2);
    let render_1 = if width_1 > min_width {
        let mut cp = source1.clone();
        cp = cp.resize(min_width, height_1, FilterType::Gaussian);
        cp
    } else {
        source1.clone()
    };
    let render_2 = if width_2 > min_width {
        let mut cp = source2.clone();
        cp = cp.resize(min_width, height_2, FilterType::Gaussian);
        cp
    } else {
        source2.clone()
    };

    let (_n_width_1, n_height_1) = render_1.dimensions();
    let (_n_width_2, n_height_2) = render_2.dimensions();
    let mut result = DynamicImage::new_rgba8(min_width, n_height_1 + n_height_2 + vd);
    imageops::overlay(&mut result, &render_1, 0, 0);
    imageops::overlay(&mut result, &render_2, 0, (n_height_1 + vd).into());
    return result;
}

pub fn export_image(source: String, target: String, format: String) -> Result<(), String> {
    let fmt = match format.as_str() {
        "jpg" | "jpeg" => ImageFormat::Jpeg,
        _ => ImageFormat::Png,
    };
    if fmt.eq(&ImageFormat::Png) {
        copy_image(source, target)?;
    } else {
        copy_image_with_format(source, target, fmt)?;
    }
    Ok(())
}

fn copy_image(source: String, target: String) -> Result<(), String> {
    let source_path = Path::new(&source);
    let target_path = Path::new(&target);
    match fs::copy(source_path, target_path) {
        Ok(_) => Ok(()),
        Err(_) => Err("Copy file error.".to_string()),
    }
}

fn copy_image_with_format(
    source: String,
    target: String,
    format: ImageFormat,
) -> Result<(), String> {
    let source_img = read_image(&source)?;
    match source_img.save_with_format(&target, format) {
        Ok(_) => Ok(()),
        Err(_) => Err("Copy file error.".to_string()),
    }
}

pub fn clear_project_tmp_dir() {
    let mut temp_dir = env::current_dir().unwrap();
    temp_dir.push("images_tmp");
    if temp_dir.exists() {
        fs::remove_dir_all(&temp_dir).unwrap();
        fs::create_dir(&temp_dir).unwrap();
    }
}

pub fn save_project(detail: ProjectDetail, cover: bool) -> Result<(), String> {
    let project_dir = create_project_dir(&detail.name, cover)?;
    let tmp_dir = create_project_images_tmp_dir()?;
    match write_project_detail_to_file(&project_dir, &tmp_dir, &detail) {
        Ok(_) => {
            remove_dir(tmp_dir.parent().unwrap());
            Ok(())
        }
        Err(err) => {
            // todo "保存失败删除项目文件"
            remove_dir(project_dir.as_path());
            remove_dir(tmp_dir.parent().unwrap());
            Err(err)
        }
    }
}

pub fn remove_dir(dir_path: &Path) {
    if dir_path.exists() && dir_path.is_dir() {
        fs::remove_dir_all(dir_path).unwrap();
    }
}

/// 项目配置保存到 `{APP}/projects/{project_name}project.toml` 文件
fn write_project_detail_to_file(
    project_dir: &PathBuf,
    tmp_dir: &PathBuf,
    detail: &ProjectDetail,
) -> Result<(), String> {
    let mut config_path = project_dir.clone();
    config_path.push("project.toml");
    save_config_file(&detail, config_path)?;
    copy_images_and_zip(&detail.config, project_dir, &tmp_dir)?;
    Ok(())
}

fn copy_images_and_zip(
    config: &ProjectConfig,
    project_dir: &PathBuf,
    tmp_dir: &PathBuf,
) -> Result<(), String> {
    copy_images_to_tmp_dir(config, tmp_dir)?;
    compress_tmp_dir(&tmp_dir, project_dir)?;
    Ok(())
}

fn copy_images_to_tmp_dir(config: &ProjectConfig, tmp_dir: &PathBuf) -> Result<(), String> {
    let n_workers: usize = 6;
    let mut images: Vec<String> = Vec::new();
    if config.hair.is_some() {
        let hair_images: Vec<String> = config
            .hair
            .as_ref()
            .unwrap()
            .images
            .iter()
            .map(|st| st.clone())
            .collect();
        images.extend(hair_images);
    }
    if config.clothes.is_some() {
        let clothes_images: Vec<String> = config
            .clothes
            .as_ref()
            .unwrap()
            .images
            .iter()
            .map(|st| st.clone())
            .collect();
        images.extend(clothes_images);
    }
    let count = images.len();
    let pool = ThreadPool::new(n_workers);
    let (sx, rx) = mpsc::channel::<()>();
    for img_path in images {
        let sxc = sx.clone();
        let mut target = tmp_dir.clone();
        let source = PathBuf::from(&img_path);
        let file_name = source.file_name().unwrap();
        target.push(file_name);
        pool.execute(move || {
            fs::copy(&source, &target).unwrap();
            sxc.send(()).unwrap();
        })
    }
    for _ in 0..count {
        rx.recv().unwrap();
    }
    Ok(())
}

fn compress_tmp_dir(tmp_dir: &PathBuf, project_dir: &PathBuf) -> Result<(), String> {
    let target = project_dir.clone();
    // target.push("images.zip");
    zip_dir(tmp_dir, &target)?;
    Ok(())
}

fn create_project_dir(name: &str, cover: bool) -> Result<PathBuf, String> {
    let current = env::current_dir().unwrap();
    let mut project_dir = current.clone();
    project_dir.push(format!("projects/{}", name));
    if project_dir.exists() {
        if cover {
            remove_dir(project_dir.as_path());
        } else {
            return Err("Project exists.".to_string());
        }
    }
    match fs::create_dir_all(&project_dir) {
        Ok(_) => Ok(project_dir),
        Err(_) => Err("Create prject dir fail.".to_string()),
    }
}

fn create_project_images_tmp_dir() -> Result<PathBuf, String> {
    let current = env::current_dir().unwrap();
    let mut images_tmp_dir = current.clone();
    images_tmp_dir.push(format!("images_tmp/tmp_{}/images", now()));
    if images_tmp_dir.exists() {
        fs::remove_dir_all(&images_tmp_dir).unwrap();
    }
    match fs::create_dir_all(&images_tmp_dir) {
        Ok(_) => Ok(images_tmp_dir),
        Err(_) => Err("Create project image tmp dir fail.".to_string()),
    }
}

fn save_config_file(detail: &ProjectDetail, path: PathBuf) -> Result<(), String> {
    let mut saved_detail = detail.clone();
    if saved_detail.config.hair.is_some() {
        let mut hair_ref = saved_detail.config.hair.as_mut().unwrap();
        hair_ref.images = hair_ref
            .images
            .iter()
            .map(|img_path| {
                let tmp_path = Path::new(img_path);
                let img_name = String::from(tmp_path.file_name().unwrap().to_str().unwrap());
                return img_name;
            })
            .collect();
    }
    if saved_detail.config.clothes.is_some() {
        let mut clothes_ref = saved_detail.config.clothes.as_mut().unwrap();
        clothes_ref.images = clothes_ref
            .images
            .iter()
            .map(|img_path| {
                let tmp_path = Path::new(img_path);
                let img_name = String::from(tmp_path.file_name().unwrap().to_str().unwrap());
                return img_name;
            })
            .collect();
    }
    let config_str = match toml::to_string(&saved_detail) {
        Ok(re) => re,
        Err(_) => return Err("Stringify project detail to string fail.".to_string()),
    };
    match fs::write(path, config_str) {
        Ok(_) => Ok(()),
        Err(_) => Err("Write to file fail.".to_string()),
    }
}

pub fn get_all_projects() -> Result<Vec<ProjectBrief>, String> {
    let current = env::current_dir().unwrap();
    let mut projects_dir = current.clone();
    projects_dir.push("projects");
    let mut result: Vec<ProjectBrief> = Vec::new();
    if projects_dir.exists() && projects_dir.is_dir() {
        for entry in projects_dir.read_dir().unwrap() {
            let entry = entry.unwrap();
            let sub_path = entry.path();
            if sub_path.is_dir() {
                let mut config_file_path = sub_path.clone();
                config_file_path.push("project.toml");
                if config_file_path.exists() {
                    let project_name = sub_path.iter().last().unwrap();
                    result.push(ProjectBrief {
                        name: String::from(project_name.to_string_lossy()),
                        path: String::from(sub_path.to_string_lossy()),
                    })
                }
            }
        }
    }
    Ok(result)
}

pub fn load_project(dir_path: String) -> Result<ProjectConfig, String> {
    let project_path = PathBuf::from(&dir_path);
    if project_path.exists() && project_path.is_dir() {
        unzip_files_to_tmp(&project_path)?;
        read_project_config_file(&project_path)
    } else {
        return Err("Projet directory not exists.".to_string());
    }
}

fn unzip_files_to_tmp(project_path: &PathBuf) -> Result<(), String> {
    let tmp_dir = get_tmp_dir();
    let mut img_zip_path = project_path.clone();
    img_zip_path.push("images.zip");
    unzip_file_to_directory(&img_zip_path, tmp_dir)?;
    Ok(())
}

fn read_project_config_file(project_path: &PathBuf) -> Result<ProjectConfig, String> {
    let mut config_file_path = project_path.clone();
    config_file_path.push("project.toml");
    let config_str = fs::read_to_string(&config_file_path).unwrap();
    let tmp_dir = get_tmp_dir();
    if let Ok(detail) = toml::from_str::<ProjectDetail>(&config_str) {
        let mut copied_config = detail.config;
        if copied_config.hair.is_some() {
            let mut hair_ref = copied_config.hair.as_mut().unwrap();
            hair_ref.images = hair_ref
                .images
                .iter()
                .map(|img_name| {
                    let mut img_path = tmp_dir.clone();
                    img_path.push(img_name);
                    return String::from(img_path.to_string_lossy());
                })
                .collect();
        }
        if copied_config.clothes.is_some() {
            let mut clothes_ref = copied_config.clothes.as_mut().unwrap();
            clothes_ref.images = clothes_ref
                .images
                .iter()
                .map(|img_name| {
                    let mut img_path = tmp_dir.clone();
                    img_path.push(img_name);
                    return String::from(img_path.to_string_lossy());
                })
                .collect();
        }
        Ok(copied_config)
    } else {
        Err("Load config file error".to_string())
    }
}

fn get_tmp_dir() -> PathBuf {
    let mut tmp_dir = env::current_dir().unwrap();
    tmp_dir.push("images_tmp");
    tmp_dir
}
