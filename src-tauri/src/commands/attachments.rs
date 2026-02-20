use std::sync::{Arc, Mutex};

use tauri::State;

use crate::models::Attachment;
use crate::services::storage::StorageService;

#[tauri::command]
pub fn save_attachment(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
    filename: String,
    data: Vec<u8>,
) -> Result<Attachment, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;

    let size = data.len() as u64;
    let stored_name = storage.save_attachment(&date, &filename, &data)?;

    // Infer file type from extension
    let file_type = filename
        .rsplit('.')
        .next()
        .unwrap_or("unknown")
        .to_lowercase();

    let attachment = Attachment {
        id: uuid::Uuid::new_v4().to_string(),
        filename: stored_name,
        file_type,
        size,
    };

    log::info!("Saved attachment {} for date {}", attachment.id, date);
    Ok(attachment)
}

#[tauri::command]
pub fn delete_attachment(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
    filename: String,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    storage.delete_attachment(&date, &filename)?;
    log::info!("Deleted attachment {} for date {}", filename, date);
    Ok(())
}

#[tauri::command]
pub fn get_attachment_path(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
    filename: String,
) -> Result<String, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let path = storage.get_attachment_path(&date, &filename)?;
    Ok(path.to_string_lossy().to_string())
}
