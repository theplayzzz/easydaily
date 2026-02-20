use std::ptr;

use tauri::{AppHandle, Manager};
use winapi::um::playsoundapi::PlaySoundW;

use crate::services::fullscreen;
use crate::services::idle::IdleDetector;

const SND_ASYNC: u32 = 0x0001;
const SND_ALIAS: u32 = 0x0001_0000;

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
    // Play the Windows system "SystemNotification" sound via PlaySoundW.
    // This is more reliable than MessageBeep which is often silent.
    let alias: Vec<u16> = "SystemNotification\0".encode_utf16().collect();
    unsafe {
        PlaySoundW(alias.as_ptr(), ptr::null_mut(), SND_ALIAS | SND_ASYNC);
    }
    Ok(())
}

#[tauri::command]
pub fn is_fullscreen_app_active() -> bool {
    fullscreen::is_fullscreen_app_active()
}
