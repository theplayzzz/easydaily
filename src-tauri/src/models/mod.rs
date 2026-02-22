use serde::{Deserialize, Serialize};

// --- Enums ---

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
pub enum SummaryType {
    Daily,
    Combined,
    Standup,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "lowercase")]
pub enum AiProvider {
    Openai,
    Grok,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum Language {
    #[serde(rename = "pt-BR")]
    PtBr,
    #[serde(rename = "en-US")]
    EnUs,
}

// --- Core Models ---

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Attachment {
    pub id: String,
    pub filename: String,
    #[serde(rename = "type")]
    pub file_type: String,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    pub created_at: String,
    pub updated_at: String,
    pub content: String,
    pub content_html: String,
    pub tags: Vec<String>,
    pub attachments: Vec<Attachment>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Summary {
    pub id: String,
    pub created_at: String,
    #[serde(rename = "type")]
    pub summary_type: SummaryType,
    pub content: String,
    pub provider: AiProvider,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DayData {
    pub date: String,
    pub notes: Vec<Note>,
    pub summaries: Vec<Summary>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub is_default: bool,
}

// --- Configuration ---

fn default_false() -> bool {
    false
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeys {
    pub openai: String,
    pub grok: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SoundConfig {
    pub enabled: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WindowPosition {
    pub x: f64,
    pub y: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub cycle_interval: u32,
    pub active_provider: AiProvider,
    pub api_keys: ApiKeys,
    pub sound: SoundConfig,
    pub language: Language,
    pub onboarding_completed: bool,
    pub last_session_date: String,
    pub window_position: WindowPosition,
    #[serde(default = "default_false")]
    pub autostart: bool,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            cycle_interval: 30,
            active_provider: AiProvider::Openai,
            api_keys: ApiKeys {
                openai: String::new(),
                grok: String::new(),
            },
            sound: SoundConfig { enabled: true },
            language: Language::PtBr,
            onboarding_completed: false,
            last_session_date: String::new(),
            window_position: WindowPosition { x: 0.0, y: 0.0 },
            autostart: false,
        }
    }
}

// --- AI Usage Tracking ---

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AiUsageEntry {
    pub timestamp: String,
    pub provider: String,
    pub model: String,
    pub prompt_tokens: u64,
    pub completion_tokens: u64,
    pub total_tokens: u64,
    pub estimated_cost_usd: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AiUsageData {
    pub entries: Vec<AiUsageEntry>,
}

impl Default for AiUsageData {
    fn default() -> Self {
        AiUsageData { entries: vec![] }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AiUsageStats {
    pub total_prompt_tokens: u64,
    pub total_completion_tokens: u64,
    pub total_tokens: u64,
    pub total_cost_usd: f64,
    pub call_count: u32,
}

pub fn default_tags() -> Vec<Tag> {
    vec![
        Tag {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Tarefa".to_string(),
            color: "#39FF14".to_string(),
            is_default: true,
        },
        Tag {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Reunião".to_string(),
            color: "#00D4FF".to_string(),
            is_default: true,
        },
        Tag {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Estudo".to_string(),
            color: "#BF40FF".to_string(),
            is_default: true,
        },
    ]
}
