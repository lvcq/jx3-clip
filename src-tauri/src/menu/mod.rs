use configuration::create_configuration_menu;
pub use menu_keys::MenuKeys;
use project::create_project_menu;
use serde::Serialize;
use tauri::{Menu, WindowMenuEvent};

pub mod configuration;
pub mod menu_keys;
pub mod project;

#[derive(Debug, Clone, Serialize)]
struct MenuMessage {
    event_type: String,
    next: String,
}

pub fn create_menu() -> Menu {
    Menu::new()
        .add_submenu(create_project_menu())
        .add_submenu(create_configuration_menu())
}

pub fn menu_handler(event: WindowMenuEvent) {
    let window = event.window();
    match event.menu_item_id().parse::<MenuKeys>().unwrap() {
        MenuKeys::ClipConfig => {
            window
                .emit::<MenuMessage>(
                    "backMessage",
                    MenuMessage {
                        event_type: "menuChange".to_string(),
                        next: MenuKeys::ClipConfig.into(),
                    },
                )
                .unwrap();
        }
        _ => {}
    }
}
