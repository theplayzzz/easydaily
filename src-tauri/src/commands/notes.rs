use std::sync::{Arc, Mutex};

use tauri::State;

use crate::models::{AiProvider, DayData, Note, Summary, SummaryType};
use crate::services::storage::StorageService;

#[tauri::command]
pub fn create_note(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
    content: String,
    content_html: String,
    tags: Vec<String>,
) -> Result<Note, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut day_data = storage.load_day_data(&date)?;

    let now = chrono::Utc::now().to_rfc3339();
    let note = Note {
        id: uuid::Uuid::new_v4().to_string(),
        created_at: now.clone(),
        updated_at: now,
        content,
        content_html,
        tags,
        attachments: vec![],
    };

    day_data.notes.push(note.clone());
    storage.save_day_data(&day_data)?;

    log::info!("Created note {} for date {}", note.id, date);
    Ok(note)
}

#[tauri::command]
pub fn update_note(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
    note_id: String,
    content: Option<String>,
    content_html: Option<String>,
    tags: Option<Vec<String>>,
) -> Result<Note, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut day_data = storage.load_day_data(&date)?;

    let note = day_data
        .notes
        .iter_mut()
        .find(|n| n.id == note_id)
        .ok_or_else(|| format!("Note {} not found", note_id))?;

    if let Some(c) = content {
        note.content = c;
    }
    if let Some(ch) = content_html {
        note.content_html = ch;
    }
    if let Some(t) = tags {
        note.tags = t;
    }
    note.updated_at = chrono::Utc::now().to_rfc3339();

    let updated = note.clone();
    storage.save_day_data(&day_data)?;

    log::info!("Updated note {} for date {}", note_id, date);
    Ok(updated)
}

#[tauri::command]
pub fn delete_note(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
    note_id: String,
) -> Result<(), String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut day_data = storage.load_day_data(&date)?;

    // Find the note to delete its attachments
    if let Some(note) = day_data.notes.iter().find(|n| n.id == note_id) {
        for attachment in &note.attachments {
            let _ = storage.delete_attachment(&date, &attachment.filename);
        }
    }

    let before = day_data.notes.len();
    day_data.notes.retain(|n| n.id != note_id);

    if day_data.notes.len() == before {
        return Err(format!("Note {} not found", note_id));
    }

    storage.save_day_data(&day_data)?;
    log::info!("Deleted note {} for date {}", note_id, date);
    Ok(())
}

#[tauri::command]
pub fn get_day_data(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
) -> Result<DayData, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    storage.load_day_data(&date)
}

#[tauri::command]
pub fn list_days(
    storage: State<'_, Arc<Mutex<StorageService>>>,
) -> Result<Vec<String>, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    storage.list_days()
}

#[tauri::command]
pub fn save_summary(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    date: String,
    summary_type: String,
    content: String,
    provider: String,
) -> Result<Summary, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let mut day_data = storage.load_day_data(&date)?;

    // Parse summary type
    let summary_type_enum = match summary_type.as_str() {
        "daily_summary" => SummaryType::Daily,
        "combined_summary" => SummaryType::Combined,
        "standup" => SummaryType::Standup,
        _ => return Err(format!("Invalid summary type: {}", summary_type)),
    };

    // Parse provider
    let provider_enum = match provider.as_str() {
        "openai" => AiProvider::Openai,
        "grok" => AiProvider::Grok,
        _ => return Err(format!("Invalid provider: {}", provider)),
    };

    let now = chrono::Utc::now().to_rfc3339();
    let summary = Summary {
        id: uuid::Uuid::new_v4().to_string(),
        created_at: now,
        summary_type: summary_type_enum,
        content,
        provider: provider_enum,
    };

    day_data.summaries.push(summary.clone());
    storage.save_day_data(&day_data)?;

    log::info!("[Storage] Saved summary {} for date {}", summary.id, date);
    Ok(summary)
}
