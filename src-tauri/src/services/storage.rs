use std::fs;
use std::path::PathBuf;

use crate::models::{default_tags, Config, DayData, Tag};

pub struct StorageService {
    base_dir: PathBuf,
}

impl StorageService {
    pub fn new() -> Result<Self, String> {
        let base_dir = dirs::data_dir()
            .ok_or("Could not determine data directory")?
            .join("EasyDaily");

        let service = StorageService { base_dir };
        service.ensure_dirs()?;
        Ok(service)
    }

    fn ensure_dirs(&self) -> Result<(), String> {
        let dirs = ["data", "attachments", "logs"];
        for dir in &dirs {
            let path = self.base_dir.join(dir);
            if !path.exists() {
                fs::create_dir_all(&path)
                    .map_err(|e| format!("Failed to create directory {}: {}", path.display(), e))?;
            }
        }
        Ok(())
    }

    // --- Day Data ---

    pub fn load_day_data(&self, date: &str) -> Result<DayData, String> {
        let path = self.base_dir.join("data").join(format!("{}.json", date));
        if !path.exists() {
            return Ok(DayData {
                date: date.to_string(),
                notes: vec![],
                summaries: vec![],
            });
        }
        let content =
            fs::read_to_string(&path).map_err(|e| format!("Failed to read day data: {}", e))?;
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse day data: {}", e))
    }

    pub fn save_day_data(&self, data: &DayData) -> Result<(), String> {
        let path = self
            .base_dir
            .join("data")
            .join(format!("{}.json", data.date));
        let content = serde_json::to_string_pretty(data)
            .map_err(|e| format!("Failed to serialize day data: {}", e))?;
        fs::write(&path, content).map_err(|e| format!("Failed to write day data: {}", e))
    }

    pub fn list_days(&self) -> Result<Vec<String>, String> {
        let data_dir = self.base_dir.join("data");
        if !data_dir.exists() {
            return Ok(vec![]);
        }
        let mut days: Vec<String> = fs::read_dir(&data_dir)
            .map_err(|e| format!("Failed to read data directory: {}", e))?
            .filter_map(|entry| {
                let entry = entry.ok()?;
                let name = entry.file_name().to_string_lossy().to_string();
                if name.ends_with(".json") {
                    Some(name.trim_end_matches(".json").to_string())
                } else {
                    None
                }
            })
            .collect();
        days.sort_by(|a, b| b.cmp(a)); // descending
        Ok(days)
    }

    // --- Config ---

    pub fn load_config(&self) -> Result<Config, String> {
        let path = self.base_dir.join("config.json");
        if !path.exists() {
            let config = Config::default();
            self.save_config(&config)?;
            return Ok(config);
        }
        let content =
            fs::read_to_string(&path).map_err(|e| format!("Failed to read config: {}", e))?;
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse config: {}", e))
    }

    pub fn save_config(&self, config: &Config) -> Result<(), String> {
        let path = self.base_dir.join("config.json");
        let content = serde_json::to_string_pretty(config)
            .map_err(|e| format!("Failed to serialize config: {}", e))?;
        fs::write(&path, content).map_err(|e| format!("Failed to write config: {}", e))
    }

    // --- Tags ---

    pub fn load_tags(&self) -> Result<Vec<Tag>, String> {
        let path = self.base_dir.join("tags.json");
        if !path.exists() {
            let tags = default_tags();
            self.save_tags(&tags)?;
            return Ok(tags);
        }
        let content =
            fs::read_to_string(&path).map_err(|e| format!("Failed to read tags: {}", e))?;
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse tags: {}", e))
    }

    pub fn save_tags(&self, tags: &Vec<Tag>) -> Result<(), String> {
        let path = self.base_dir.join("tags.json");
        let content = serde_json::to_string_pretty(tags)
            .map_err(|e| format!("Failed to serialize tags: {}", e))?;
        fs::write(&path, content).map_err(|e| format!("Failed to write tags: {}", e))
    }

    // --- Attachments ---

    pub fn save_attachment(
        &self,
        date: &str,
        filename: &str,
        data: &[u8],
    ) -> Result<String, String> {
        let dir = self.base_dir.join("attachments").join(date);
        if !dir.exists() {
            fs::create_dir_all(&dir)
                .map_err(|e| format!("Failed to create attachment dir: {}", e))?;
        }
        let stored_name = format!("{}_{}", uuid::Uuid::new_v4(), filename);
        let path = dir.join(&stored_name);
        fs::write(&path, data).map_err(|e| format!("Failed to write attachment: {}", e))?;
        Ok(stored_name)
    }

    pub fn delete_attachment(&self, date: &str, filename: &str) -> Result<(), String> {
        let path = self.base_dir.join("attachments").join(date).join(filename);
        if path.exists() {
            fs::remove_file(&path)
                .map_err(|e| format!("Failed to delete attachment: {}", e))?;
        }
        Ok(())
    }

    pub fn get_attachment_path(&self, date: &str, filename: &str) -> Result<PathBuf, String> {
        let path = self.base_dir.join("attachments").join(date).join(filename);
        Ok(path)
    }
}
