use tauri::{CustomMenuItem, Menu, Submenu};

use super::MenuKeys;

pub fn create_project_menu() -> Submenu {
    let create_new_project_menu = CustomMenuItem::new(MenuKeys::CreateNewProject, "新建项目");
    let open_project_menu = CustomMenuItem::new(MenuKeys::OpenProject, "打开项目");
    let clear_project_tmp_menu = CustomMenuItem::new(MenuKeys::ClearProjectTmp, "删除临时数据");
    let project_menu = Menu::new()
        .add_item(create_new_project_menu)
        .add_item(open_project_menu)
        .add_item(clear_project_tmp_menu);
    return Submenu::new("项目", project_menu);
}
