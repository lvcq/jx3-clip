#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use jx3_clip::command::{
    __cmd__create_clip_config, __cmd__create_frame_config, __cmd__delete_clip_config,
    __cmd__delete_frame_config, __cmd__get_all_clip_config, __cmd__get_all_frame_config,
    __cmd__get_clip_config_detail, __cmd__get_frame_config_detail, __cmd__update_clip_config,
    __cmd__update_frame_config, create_clip_config, create_frame_config, delete_clip_config,
    delete_frame_config, get_all_clip_config, get_all_frame_config, get_clip_config_detail,
    get_frame_config_detail, update_clip_config, update_frame_config,
};
use jx3_clip::database;
use jx3_clip::menu;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    env_logger::init();
    database::initialize_database().expect("Initialize database fail.");

    tauri::Builder::default()
        .menu(menu::create_menu())
        .on_menu_event(menu::menu_handler)
        .invoke_handler(tauri::generate_handler![
            greet,
            create_clip_config,
            get_all_clip_config,
            delete_clip_config,
            get_clip_config_detail,
            update_clip_config,
            create_frame_config,
            delete_frame_config,
            get_all_frame_config,
            get_frame_config_detail,
            update_frame_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
