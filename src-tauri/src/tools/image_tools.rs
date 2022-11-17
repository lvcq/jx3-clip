use image::io::Reader as ImageReader;
use image::{DynamicImage, GenericImageView, ImageBuffer, ImageError};
use std::cmp::min;

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
    let mut clip_img = ImageBuffer::from_fn(width, height, |x, y| {
        source_img.get_pixel(x + left, y + top)
    });
    if radius > 0 {
        let radius_x = min(radius, width / 2) ;
        let radius_y = min(radius, height / 2);
        let mut row: u32 = 0;
        let mut col: u32 = 0;
        // left top
        while row < radius_y {
            let y = radius_y - row;
            let x = ellipsoid_d(radius_y, radius_x, y);
            while col < radius_x - x {
                clip_img.put_pixel(row, col, image::Rgba([0,0,0,0]));
                col += 1;
            }
            row += 1;
        }
    }
    Ok(clip_img.into())
}

fn ellipsoid_d(x: u32, y: u32, dx: u32) -> u32 {
    let x_2 = x * x;
    let y_2 = y * y;
    let dx_2 = dx * dx;
    let fy_2 = ((x_2 * y_2 - y_2 * dx_2) as f64) / (x_2 as f64);
    let fy = fy_2.sqrt().round();
    fy as u32
}
