// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_window_state::StateFlags;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_window_state::Builder::default().with_state_flags(StateFlags::all()).build())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            // وقتی instance جدید باز می‌شود، پنجره اصلی را فوکوس می‌کنیم
            let windows = app.webview_windows();
            if let Some(window) = windows.values().next() {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            // تنظیمات اولیه برنامه
            let window = app.get_webview_window("main").unwrap();

            // تنظیم اندازه پنجره
            window.set_min_size(Some(tauri::PhysicalSize::new(800, 600)))?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // اینجا می‌توان توابع Rust اضافه کرد که از جاوااسکریپت قابل فراخوانی هستند
        ])
        .run(tauri::generate_context!())
        .expect("خطا در اجرای برنامه Tauri");
}
