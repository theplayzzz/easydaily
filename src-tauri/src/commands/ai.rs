use std::sync::{Arc, Mutex};

use tauri::State;

use crate::models::AiProvider;
use crate::services::storage::StorageService;

const SYSTEM_PROMPT: &str = "Você é um assistente especializado em resumos de produtividade profissional. Gere resumos concisos em português do Brasil.";

fn build_daily_summary_prompt(notes: &[String]) -> String {
    let notes_text = notes
        .iter()
        .enumerate()
        .map(|(i, n)| format!("{}. {}", i + 1, n))
        .collect::<Vec<_>>()
        .join("\n");

    format!(
        "Gere um resumo do dia com base nas seguintes notas:\n\n{}\n\nOrganize por categorias (Principais atividades, Destaques, Próximos passos). Use markdown com ## para títulos e - para listas.",
        notes_text
    )
}

fn build_combined_summary_prompt(yesterday_notes: &[String], today_notes: &[String]) -> String {
    let yesterday_text = if yesterday_notes.is_empty() {
        "Nenhuma nota registrada.".to_string()
    } else {
        yesterday_notes
            .iter()
            .enumerate()
            .map(|(i, n)| format!("{}. {}", i + 1, n))
            .collect::<Vec<_>>()
            .join("\n")
    };

    let today_text = if today_notes.is_empty() {
        "Nenhuma nota registrada.".to_string()
    } else {
        today_notes
            .iter()
            .enumerate()
            .map(|(i, n)| format!("{}. {}", i + 1, n))
            .collect::<Vec<_>>()
            .join("\n")
    };

    format!(
        "Gere um resumo combinado de ontem e hoje.\n\n## Ontem:\n{}\n\n## Hoje:\n{}\n\nOrganize em duas seções separadas (Ontem e Hoje), cada uma com principais atividades. Use markdown com ## para títulos e - para listas.",
        yesterday_text, today_text
    )
}

fn build_standup_prompt(yesterday_notes: &[String], today_plan: &str) -> String {
    let yesterday_text = if yesterday_notes.is_empty() {
        "Nenhuma nota registrada.".to_string()
    } else {
        yesterday_notes
            .iter()
            .enumerate()
            .map(|(i, n)| format!("{}. {}", i + 1, n))
            .collect::<Vec<_>>()
            .join("\n")
    };

    format!(
        "Gere um resumo no formato de daily standup.\n\nNotas de ontem:\n{}\n\nPlano para hoje:\n{}\n\nFormate em três seções:\n## O que fiz ontem\n## O que vou fazer hoje\n## Bloqueios\n\nSe não houver bloqueios aparentes, escreva \"Sem bloqueios no momento.\". Use markdown com ## para títulos e - para listas.",
        yesterday_text, today_plan
    )
}

#[tauri::command]
pub async fn generate_summary(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    summary_type: String,
    notes: Vec<String>,
    yesterday_notes: Option<Vec<String>>,
    today_plan: Option<String>,
) -> Result<String, String> {
    // Lock mutex only to read config, release before HTTP call
    let (api_key, base_url, model) = {
        let storage = storage
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        let config = storage.load_config()?;

        let (key, url, mdl) = match config.active_provider {
            AiProvider::Openai => (
                config.api_keys.openai.clone(),
                "https://api.openai.com/v1".to_string(),
                "gpt-4o-mini".to_string(),
            ),
            AiProvider::Grok => (
                config.api_keys.grok.clone(),
                "https://api.x.ai/v1".to_string(),
                "grok-2-1212".to_string(),
            ),
        };

        if key.is_empty() {
            return Err("INVALID_API_KEY".to_string());
        }

        (key, url, mdl)
    }; // mutex released here

    let user_message = match summary_type.as_str() {
        "daily_summary" => build_daily_summary_prompt(&notes),
        "combined_summary" => {
            let yesterday = yesterday_notes.unwrap_or_default();
            build_combined_summary_prompt(&yesterday, &notes)
        }
        "standup" => {
            let yesterday = yesterday_notes.unwrap_or_default();
            let plan = today_plan.unwrap_or_default();
            build_standup_prompt(&yesterday, &plan)
        }
        _ => return Err("INVALID_SUMMARY_TYPE".to_string()),
    };

    log::info!("Generating {} summary via {}", summary_type, model);

    let result =
        crate::services::ai::call_ai(&api_key, &base_url, &model, SYSTEM_PROMPT, &user_message)
            .await?;

    log::info!("Summary generated successfully");
    Ok(result)
}
