use std::sync::{Arc, Mutex};

use tauri::State;

use crate::models::Tag;
use crate::services::storage::StorageService;

#[tauri::command]
pub fn get_tags(
    storage: State<'_, Arc<Mutex<StorageService>>>,
) -> Result<Vec<Tag>, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    storage.load_tags()
}

#[tauri::command]
pub fn create_tag(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    name: String,
    color: String,
) -> Result<Tag, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut tags = storage.load_tags()?;

    let tag = Tag {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        color,
        is_default: false,
    };

    tags.push(tag.clone());
    storage.save_tags(&tags)?;

    log::info!("Created tag {}", tag.id);
    Ok(tag)
}

#[tauri::command]
pub fn update_tag(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    id: String,
    name: Option<String>,
    color: Option<String>,
) -> Result<Tag, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut tags = storage.load_tags()?;

    let tag = tags
        .iter_mut()
        .find(|t| t.id == id)
        .ok_or_else(|| format!("Tag {} not found", id))?;

    if let Some(n) = name {
        tag.name = n;
    }
    if let Some(c) = color {
        tag.color = c;
    }

    let updated = tag.clone();
    storage.save_tags(&tags)?;

    log::info!("Updated tag {}", id);
    Ok(updated)
}

#[tauri::command]
pub fn delete_tag(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    id: String,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut tags = storage.load_tags()?;

    let before = tags.len();
    tags.retain(|t| t.id != id);

    if tags.len() == before {
        return Err(format!("Tag {} not found", id));
    }

    storage.save_tags(&tags)?;
    log::info!("Deleted tag {}", id);
    Ok(())
}
