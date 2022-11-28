use crate::database::frame_config::FrameConfig;

#[tauri::command]
pub async fn create_frame_config(
    name: String,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    source: String,
) -> Result<(), String> {
    let new_config = FrameConfig::new(&name, top, right, bottom, left, &source);
    new_config.insert()?;
    Ok(())
}

#[tauri::command]
pub async fn get_all_frame_config() -> Result<Vec<FrameConfig>, String> {
    let configs = FrameConfig::get_all()?;
    Ok(configs)
}

#[tauri::command]
pub async fn get_frame_config_detail(id: i64) -> Result<FrameConfig, String> {
    FrameConfig::get_detail(id)
}

#[tauri::command]
pub async fn update_frame_config(
    id: i64,
    name: &str,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    source: &str,
) -> Result<bool, String> {
    FrameConfig::update_frame_config(id, name, top, right, bottom, left, source)
}

#[tauri::command]
pub async fn delete_frame_config(id: i64) -> Result<(), String> {
    FrameConfig::delete(id)
}
