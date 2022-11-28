use super::MenuKeys;
use tauri::{CustomMenuItem, Menu, Submenu};

pub fn create_configuration_menu() -> Submenu {
    let clip_config_menu = CustomMenuItem::new(MenuKeys::ClipConfig, "裁剪配置管理");
    let frame_config_menu = CustomMenuItem::new(MenuKeys::FrameConfig, "边框管理");
    let config_menu = Menu::new()
        .add_item(clip_config_menu)
        .add_item(frame_config_menu);
    Submenu::new("资源管理", config_menu)
}
