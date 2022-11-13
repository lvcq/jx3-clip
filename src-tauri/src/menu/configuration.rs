use super::MenuKeys;
use tauri::{CustomMenuItem, Menu, Submenu};

pub fn create_configuration_menu() -> Submenu {
    let clip_config_menu = CustomMenuItem::new(MenuKeys::ClipConfig, "裁剪配置");
    let config_menu = Menu::new().add_item(clip_config_menu);
    Submenu::new("配置", config_menu)
}
