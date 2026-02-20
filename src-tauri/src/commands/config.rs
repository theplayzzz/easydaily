use std::sync::{Arc, Mutex};

use tauri::State;

use crate::models::Config;
use crate::services::scheduler::Scheduler;
use crate::services::storage::StorageService;

#[tauri::command]
pub fn get_config(
    storage: State<'_, Arc<Mutex<StorageService>>>,
) -> Result<Config, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    storage.load_config()
}

#[tauri::command]
pub fn update_config(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    scheduler_state: State<'_, Arc<Scheduler>>,
    config: Config,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;

    // Update scheduler interval if it changed
    let current_config = storage.load_config()?;
    if current_config.cycle_interval != config.cycle_interval {
        scheduler_state.update_interval(config.cycle_interval);
        log::info!("Scheduler interval updated to {} minutes", config.cycle_interval);
    }

    storage.save_config(&config)?;
    log::info!("Config updated");
    Ok(())
}
