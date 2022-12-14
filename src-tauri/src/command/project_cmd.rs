use crate::server::{
    project,
    project_config::{ProjectBrief, ProjectConfig, ProjectDetail},
};

#[tauri::command]
pub fn clip_img_api(
    sources: Vec<String>,
    top: u32,
    right: u32,
    bottom: u32,
    left: u32,
    radius: u32,
) -> Result<Vec<String>, String> {
    Ok(project::clip_project_imgs(
        sources, top, right, bottom, left, radius,
    ))
}

#[tauri::command]
pub fn create_preview_img_api(config: ProjectConfig) -> Result<String, String> {
    project::crate_preview(config)
}

#[tauri::command]
pub fn export_project_image(source: String, target: String, format: String) -> Result<(), String> {
    project::export_image(source, target, format)
}

#[tauri::command]
pub fn save_project_api(detail: ProjectDetail, cover: bool) -> Result<(), String> {
    project::save_project(detail, cover)
}

#[tauri::command]
pub fn get_all_projects_api() -> Result<Vec<ProjectBrief>, String> {
    project::get_all_projects()
}

#[tauri::command]
pub fn load_project_api(path: String) -> Result<ProjectConfig, String> {
    project::load_project(path)
}
