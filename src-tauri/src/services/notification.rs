use std::ptr;

use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use winapi::um::playsoundapi::PlaySoundW;

const NOTIFICATION_WIDTH: f64 = 360.0;
const NOTIFICATION_HEIGHT: f64 = 140.0;
const SND_ASYNC: u32 = 0x0001;
const SND_ALIAS: u32 = 0x0001_0000;

/// Creates a notification popup window from the backend.
/// This works regardless of whether the main window is visible or hidden.
pub fn show_notification(app: &AppHandle, notification_type: &str, play_sound: bool) {
    // Close existing notification if any
    if let Some(existing) = app.get_webview_window("notification") {
        let _ = existing.destroy();
    }

    let (x, y) = get_notification_position(app);
    let url = format!("/?notification={}", notification_type);

    match WebviewWindowBuilder::new(
        app,
        "notification",
        WebviewUrl::App(url.into()),
    )
    .title("EasyDaily")
    .inner_size(NOTIFICATION_WIDTH, NOTIFICATION_HEIGHT)
    .position(x, y)
    .decorations(false)
    .always_on_top(true)
    .skip_taskbar(true)
    .resizable(false)
    .focused(false)
    .build()
    {
        Ok(_) => log::info!("Notification window created: {}", notification_type),
        Err(e) => log::error!("Failed to create notification window: {}", e),
    }

    if play_sound {
        let alias: Vec<u16> = "SystemNotification\0".encode_utf16().collect();
        unsafe {
            PlaySoundW(alias.as_ptr(), ptr::null_mut(), SND_ALIAS | SND_ASYNC);
        }
    }
}

fn get_notification_position(app: &AppHandle) -> (f64, f64) {
    // Try to get screen dimensions from the primary monitor
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(Some(monitor)) = window.primary_monitor() {
            let size = monitor.size();
            let scale = monitor.scale_factor();
            let width = size.width as f64 / scale;
            let height = size.height as f64 / scale;
            let x = width - NOTIFICATION_WIDTH - 16.0;
            let y = height - NOTIFICATION_HEIGHT - 16.0;
            return (x, y);
        }
    }

    // Fallback position
    (1000.0, 700.0)
}
