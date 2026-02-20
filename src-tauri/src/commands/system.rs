use tauri::{AppHandle, Manager};
use winapi::um::winuser::{MessageBeep, MB_ICONINFORMATION};

use crate::services::fullscreen;
use crate::services::idle::IdleDetector;

#[tauri::command]
pub fn show_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Main window not found")?;
    window.show().map_err(|e| format!("Failed to show window: {}", e))?;
    window.set_focus().map_err(|e| format!("Failed to focus window: {}", e))?;
    log::info!("Window shown");
    Ok(())
}

#[tauri::command]
pub fn hide_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or("Main window not found")?;
    window.hide().map_err(|e| format!("Failed to hide window: {}", e))?;
    log::info!("Window hidden");
    Ok(())
}

#[tauri::command]
pub fn get_idle_seconds() -> u64 {
    IdleDetector::get_idle_seconds()
}

#[tauri::command]
pub fn play_notification_sound() -> Result<(), String> {
    unsafe {
        MessageBeep(MB_ICONINFORMATION);
    }
    Ok(())
}

#[tauri::command]
pub fn is_fullscreen_app_active() -> bool {
    fullscreen::is_fullscreen_app_active()
}
