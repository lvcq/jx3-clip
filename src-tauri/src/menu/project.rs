use tauri::{Menu, Submenu};

pub fn create_project_menu() -> Submenu {
    return Submenu::new("项目", Menu::new());
}
