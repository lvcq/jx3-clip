use std::collections::HashMap;

use image::io::Reader as ImageReader;
use image::DynamicImage;

use crate::server::project_config::PartConfig;

use self::{object::Object, state::State, vertex::Vertex};

pub mod object;
pub mod state;
pub mod texture;
pub mod vertex;

struct ItemPosCache {
    item_start: f32,
    item_end: f32,
    frame_start: f32,
    frame_end: f32,
}

pub async fn concat_part(config: &PartConfig) -> Result<DynamicImage, String> {
    let image_width = config.width;
    let image_height = config.height;

    let (item_width, item_height, offset_top, offset_left) = match &config.frame_config {
        Some(frame_config) => {
            let inner_width = frame_config.right - frame_config.left;
            let inner_height = frame_config.bottom - frame_config.top;
            let h_factor = (image_width as f64) / (inner_width as f64);
            let i_width = (h_factor * (frame_config.width as f64)) as u32;
            let o_left = ((frame_config.left as f64) * h_factor) as u32;
            let v_factor = (image_height as f64) / (inner_height as f64);
            let i_height = ((frame_config.height as f64) * v_factor) as u32;
            let o_top = ((frame_config.top as f64) * v_factor) as u32;
            (i_width, i_height, o_top, o_left)
        }
        None => (image_width, image_height, 0 as u32, 0 as u32),
    };
    let image_count = config.images.len();
    let col_count = if image_count as u32 > config.cols {
        config.cols
    } else {
        config.images.len() as u32
    };

    let render_width = if col_count > 1 {
        item_width * col_count + (col_count - 1) * config.colgap
    } else {
        item_width
    };
    let row_count = ((image_count as f64) / (col_count as f64)).ceil() as u32;
    let render_height = if row_count > 1 {
        item_height * row_count + (row_count - 1) * config.rowgap
    } else {
        item_height
    };
    let (img_width, img_height) = part_image_size(render_width, render_height);
    let mut st = State::new(img_width, img_height).await;
    let mut objects: Vec<Object> = vec![];
    let mut start_y_cache: HashMap<u32, ItemPosCache> = HashMap::new();
    let mut start_x_cache: HashMap<u32, ItemPosCache> = HashMap::new();
    for row in 0..row_count {
        let f_start = (row * (item_height + config.rowgap)) as f32;
        start_y_cache.insert(
            row,
            ItemPosCache {
                item_start: 1.0 - (f_start + offset_top as f32) * 2.0 / (render_height as f32),
                item_end: 1.0
                    - (f_start + offset_top as f32 + config.height as f32) * 2.0
                        / (render_height as f32),
                frame_start: 1.0 - f_start * 2.0 / (render_height as f32),
                frame_end: 1.0 - (f_start + item_height as f32) * 2.0 / (render_height as f32),
            },
        );
    }
    for col in 0..col_count {
        let f_start = (col * (item_width + config.colgap)) as f32;
        start_x_cache.insert(
            col,
            ItemPosCache {
                item_start: (f_start + offset_left as f32) * 2.0 / (render_width as f32) - 1.0,
                item_end: (f_start + offset_left as f32 + config.width as f32) * 2.0
                    / (render_width as f32)
                    - 1.0,
                frame_start: f_start * 2.0 / (render_width as f32) - 1.0,
                frame_end: (f_start + item_width as f32) * 2.0 / (render_width as f32) - 1.0,
            },
        );
    }
    let last_line_offset = if (image_count as u32) % col_count != 0 {
        let last_line_count = (image_count as u32) % col_count;
        let last_line_width = item_width * last_line_count + (last_line_count - 1) * config.colgap;
        (render_width - last_line_width) as f32 / (render_width as f32)
    } else {
        0.0
    };

    let indices: Vec<u16> = vec![0, 1, 3, 1, 2, 3];
    for row in 0..row_count {
        let x_offset = if row == row_count - 1 {
            last_line_offset
        } else {
            0.0
        };
        for col in 0..col_count {
            let index = row * col_count + col;
            if index < image_count as u32 {
                let x_pos = start_x_cache.get(&col).unwrap();
                let y_pos = start_y_cache.get(&row).unwrap();
                let vertices: Vec<Vertex> = vec![
                    Vertex {
                        position: [x_pos.item_start + x_offset, y_pos.item_start, 0.0],
                        tex_coords: [0.0, 0.0],
                    },
                    Vertex {
                        position: [x_pos.item_start + x_offset, y_pos.item_end, 0.0],
                        tex_coords: [0.0, 1.0],
                    },
                    Vertex {
                        position: [x_pos.item_end + x_offset, y_pos.item_end, 0.0],
                        tex_coords: [1.0, 1.0],
                    },
                    Vertex {
                        position: [x_pos.item_end + x_offset, y_pos.item_start, 0.0],
                        tex_coords: [1.0, 0.0],
                    },
                ];
                let img_path = config.images.get(index as usize).unwrap();
                let img = ImageReader::open(img_path).unwrap().decode().unwrap();
                let tex =
                    texture::Texture::from_image(&st.device, &st.queue, &img, Some("")).unwrap();
                let obj = Object::new()
                    .set_index_buffer(&st.device, indices.clone())
                    .set_vertex_buffer(&st.device, vertices)
                    .set_texture(Some(tex))
                    .create_bind_group(&st.device)
                    .create_render_pipeline(&st.device, wgpu::TextureFormat::Rgba8UnormSrgb);
                objects.push(obj);
            }
        }
    }

    if config.frame_config.is_some() {
        let mut f_vertices: Vec<Vertex> = vec![];
        let mut f_indices: Vec<u16> = vec![];
        for row in 0..row_count {
            let x_offset = if row == row_count - 1 {
                last_line_offset
            } else {
                0.0
            };
            for col in 0..col_count {
                let index = row * col_count + col;
                if index < image_count as u32 {
                    let x_pos = start_x_cache.get(&col).unwrap();
                    let y_pos = start_y_cache.get(&row).unwrap();
                    f_vertices.push(Vertex {
                        position: [x_pos.frame_start + x_offset, y_pos.frame_start, 0.0],
                        tex_coords: [0.0, 0.0],
                    });
                    f_vertices.push(Vertex {
                        position: [x_pos.frame_start + x_offset, y_pos.frame_end, 0.0],
                        tex_coords: [0.0, 1.0],
                    });
                    f_vertices.push(Vertex {
                        position: [x_pos.frame_end + x_offset, y_pos.frame_end, 0.0],
                        tex_coords: [1.0, 1.0],
                    });
                    f_vertices.push(Vertex {
                        position: [x_pos.frame_end + x_offset, y_pos.frame_start, 0.0],
                        tex_coords: [1.0, 0.0],
                    });
                    let i = index as u16;
                    f_indices.extend_from_slice(&[
                        i * 4,
                        i * 4 + 1,
                        i * 4 + 3,
                        i * 4 + 1,
                        i * 4 + 2,
                        i * 4 + 3,
                    ]);
                }
            }
        }
        let img_path = config.frame_config.as_ref().unwrap().source.as_str();
        let img = ImageReader::open(img_path).unwrap().decode().unwrap();
        let tex = texture::Texture::from_image(&st.device, &st.queue, &img, Some("")).unwrap();
        let obj = Object::new()
            .set_index_buffer(&st.device, f_indices)
            .set_vertex_buffer(&st.device, f_vertices)
            .set_texture(Some(tex))
            .create_bind_group(&st.device)
            .create_render_pipeline(&st.device, wgpu::TextureFormat::Rgba8UnormSrgb);
        objects.push(obj);
    }

    st.set_objects(objects);
    let result = st.render().await;

    Ok(result)
}

/// calculate output image size
/// * min width 64
/// * max width 8192
/// * width must 64*n
fn part_image_size(width: u32, height: u32) -> (u32, u32) {
    let r_w = if width < 64 {
        64u32
    } else if width > 8192 {
        8192u32
    } else {
        (width / 64) * 64
    };
    let factor = (r_w as f32) / (width as f32);
    let r_h = (height as f32 * factor) as u32;
    (r_w, r_h)
}
