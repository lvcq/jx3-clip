use std::path::PathBuf;
use std::{env, fs};
use image::io::Reader as ImageReader;
use image::{DynamicImage, GenericImageView, ImageBuffer, ImageError, ImageFormat};
use sha2::{Digest, Sha256};

pub fn image_clip(
    source: &str,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    radius: u32,
) -> Result<DynamicImage, ImageError> {
    let source_img = ImageReader::open(&source)?.decode()?;
    let width = right - left;
    let height = bottom - top;
    let clip_img = ImageBuffer::from_fn(width, height, |x, y| {
        source_img.get_pixel(x + left, y + top)
    });
    Ok(clip_img.into())
}

/// 保存图片到文件夹
pub fn save_image(img: &DynamicImage, dir: &str) -> Result<PathBuf, String> {
    let mut target = env::current_dir().expect("Path error");
    target.push(dir);
    if !target.exists() {
        fs::create_dir_all(&target).expect("Create directory fail.")
    }
    let mut hasher = Sha256::new();
    hasher.update(img.as_bytes());
    target.push(format!("{:X}.png", hasher.finalize()));
    match img.save_with_format(&target, ImageFormat::Png) {
        Ok(_) => {}
        Err(_) => return Err("save image error.".to_string()),
    };
    Ok(target)
}
