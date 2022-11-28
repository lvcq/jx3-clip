use crate::database::clip_config::ClipConfig;

#[tauri::command]
pub async fn create_clip_config(
    name: String,
    body_type: i8,
    part: i8,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    radius: u32,
    source: String,
) -> Result<(), String> {
    let new_config = ClipConfig::new(
        body_type, part, &name, top, right, bottom, left, radius, &source,
    );
    new_config.insert()?;
    Ok(())
}

#[tauri::command]
pub fn get_all_clip_config() -> Result<Vec<ClipConfig>, String> {
    let configs = ClipConfig::get_all()?;
    Ok(configs)
}

#[tauri::command]
pub fn get_clip_config_detail(id: i64) -> Result<ClipConfig, String> {
    ClipConfig::get_detail(id)
}

#[tauri::command]
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
    ClipConfig::update_clip_config(
        id, name, body_type, part, top, right, bottom, left, radius, source,
    )
}

#[tauri::command]
pub fn delete_clip_config(id: i64) -> Result<(), String> {
    ClipConfig::delete(id)
}
