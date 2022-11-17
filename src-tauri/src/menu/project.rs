use tauri::{CustomMenuItem, Menu, Submenu};

use super::MenuKeys;

pub fn create_project_menu() -> Submenu {
    let create_new_project_menu = CustomMenuItem::new(MenuKeys::CreateNewProject, "新建项目");
    let project_menu = Menu::new().add_item(create_new_project_menu);
    return Submenu::new("项目", project_menu);
}
