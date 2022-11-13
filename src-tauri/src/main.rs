#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
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
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
