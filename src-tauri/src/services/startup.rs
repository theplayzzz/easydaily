use std::time::Duration;

use tauri::{AppHandle, Emitter};
use winreg::enums::*;
use winreg::RegKey;

const APP_NAME: &str = "EasyDaily";
const RUN_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";

pub fn register_autostart() -> Result<(), String> {
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let (run_key, _) = hkcu
        .create_subkey(RUN_KEY)
        .map_err(|e| format!("Failed to open registry key: {}", e))?;

    run_key
        .set_value(APP_NAME, &exe_path.to_string_lossy().to_string())
        .map_err(|e| format!("Failed to set registry value: {}", e))?;

    log::info!("Autostart registered");
    Ok(())
}

pub fn unregister_autostart() -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run_key = hkcu
        .open_subkey_with_flags(RUN_KEY, KEY_WRITE)
        .map_err(|e| format!("Failed to open registry key: {}", e))?;

    // Ignore error if value doesn't exist
    let _ = run_key.delete_value(APP_NAME);

    log::info!("Autostart unregistered");
    Ok(())
}

pub fn run_startup_sequence(app_handle: AppHandle) {
    tauri::async_runtime::spawn(async move {
        // Wait 2 seconds then prompt for summary
        tokio::time::sleep(Duration::from_secs(2)).await;
        let _ = app_handle.emit("startup:summary-prompt", ());
        log::info!("Startup: summary prompt emitted");
    });
}
