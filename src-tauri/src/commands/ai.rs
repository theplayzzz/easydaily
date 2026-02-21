use std::sync::{Arc, Mutex};
use std::time::Instant;

use chrono::Utc;
use tauri::State;

use crate::models::{AiProvider, AiUsageEntry, AiUsageStats};
use crate::services::storage::StorageService;

const SYSTEM_PROMPT: &str = "Você é um assistente especializado em resumos de produtividade profissional. Gere resumos concisos em português do Brasil. As notas podem conter tags entre colchetes (ex: [Tags: Reunião, Tarefa]) — use essa informação para agrupar e categorizar as atividades.";

fn build_daily_summary_prompt(notes: &[String]) -> String {
    let notes_text = notes
        .iter()
        .enumerate()
        .map(|(i, n)| format!("{}. {}", i + 1, n))
        .collect::<Vec<_>>()
        .join("\n");

    format!(
        "Gere um resumo do dia com base nas seguintes notas:\n\n{}\n\nOrganize por categorias (usando as tags quando disponíveis). Inclua seções: Principais atividades, Destaques e Próximos passos. Use markdown com ## para títulos e - para listas.",
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
        "Gere um resumo combinado de ontem e hoje.\n\n## Notas de Ontem:\n{}\n\n## Notas de Hoje:\n{}\n\nOrganize em duas seções (Ontem e Hoje), agrupando atividades por categoria/tag quando possível. Use markdown com ## para títulos e - para listas.",
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
        "Gere um resumo no formato de daily standup.\n\nNotas de ontem:\n{}\n\nPlano para hoje:\n{}\n\nFormate em três seções:\n## O que fiz ontem\n## O que vou fazer hoje\n## Bloqueios\n\nAgrupe atividades por categoria/tag quando disponível. Se não houver bloqueios aparentes, escreva \"Sem bloqueios no momento.\". Use markdown com ## para títulos e - para listas.",
        yesterday_text, today_plan
    )
}

fn compute_cost(provider: &str, _model: &str, prompt_tokens: u64, completion_tokens: u64) -> f64 {
    // Prices per 1M tokens (input / output)
    let (input_price, output_price) = match provider {
        "openai" => (0.40, 1.60),   // gpt-4.1-mini
        "grok" => (2.00, 10.00),    // grok-2-1212
        _ => (0.0, 0.0),
    };
    (prompt_tokens as f64 * input_price / 1_000_000.0)
        + (completion_tokens as f64 * output_price / 1_000_000.0)
}

#[tauri::command]
pub async fn generate_summary(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    summary_type: String,
    notes: Vec<String>,
    yesterday_notes: Option<Vec<String>>,
    today_plan: Option<String>,
) -> Result<String, String> {
    let total_start = Instant::now();
    log::info!(
        "[AI:{}] === START === notes={}, yesterday_notes={}, today_plan={}",
        summary_type,
        notes.len(),
        yesterday_notes.as_ref().map_or(0, |v| v.len()),
        today_plan.as_ref().map_or(0, |s| s.len())
    );

    // Lock mutex only to read config, release before HTTP call
    let config_start = Instant::now();
    let (api_key, base_url, model, provider_name) = {
        let storage = storage
            .lock()
            .map_err(|e| format!("Lock error: {}", e))?;
        let config = storage.load_config()?;

        let (key, url, mdl, name) = match config.active_provider {
            AiProvider::Openai => (
                config.api_keys.openai.clone(),
                "https://api.openai.com/v1".to_string(),
                "gpt-4.1-mini".to_string(),
                "openai",
            ),
            AiProvider::Grok => (
                config.api_keys.grok.clone(),
                "https://api.x.ai/v1".to_string(),
                "grok-2-1212".to_string(),
                "grok",
            ),
        };

        if key.is_empty() {
            log::warn!("[AI:{}] API key is empty for provider {}", summary_type, name);
            return Err("INVALID_API_KEY".to_string());
        }

        log::info!(
            "[AI:{}] Config loaded in {:?} — provider={}, model={}, key={}...{}",
            summary_type,
            config_start.elapsed(),
            name,
            mdl,
            &key[..key.len().min(4)],
            &key[key.len().saturating_sub(4)..]
        );

        (key, url, mdl, name)
    }; // mutex released here

    // Build prompt
    let prompt_start = Instant::now();
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
        _ => {
            log::error!("[AI] Invalid summary_type: {}", summary_type);
            return Err("INVALID_SUMMARY_TYPE".to_string());
        }
    };
    log::info!(
        "[AI:{}] Prompt built in {:?} — {} chars",
        summary_type,
        prompt_start.elapsed(),
        user_message.len()
    );
    log::debug!("[AI:{}] System prompt: {}", summary_type, SYSTEM_PROMPT);
    log::debug!("[AI:{}] User message: {}", summary_type, user_message);

    // Call AI API
    log::info!(
        "[AI:{}] Calling {} API at {} with model {}...",
        summary_type,
        provider_name,
        base_url,
        model
    );
    let api_start = Instant::now();
    let result =
        crate::services::ai::call_ai(&api_key, &base_url, &model, SYSTEM_PROMPT, &user_message)
            .await;

    match &result {
        Ok(call_result) => {
            log::info!(
                "[AI:{}] === SUCCESS === API: {:?}, Total: {:?}, Response: {} chars",
                summary_type,
                api_start.elapsed(),
                total_start.elapsed(),
                call_result.content.len()
            );

            // Record AI usage
            let cost = compute_cost(provider_name, &model, call_result.prompt_tokens, call_result.completion_tokens);
            let entry = AiUsageEntry {
                timestamp: Utc::now().to_rfc3339(),
                provider: provider_name.to_string(),
                model: model.clone(),
                prompt_tokens: call_result.prompt_tokens,
                completion_tokens: call_result.completion_tokens,
                total_tokens: call_result.total_tokens,
                estimated_cost_usd: cost,
            };

            if let Ok(storage) = storage.lock() {
                if let Err(e) = storage.append_ai_usage_entry(entry) {
                    log::error!("[AI:{}] Failed to record usage: {}", summary_type, e);
                }
            }
        }
        Err(err) => {
            log::error!(
                "[AI:{}] === FAILED === API: {:?}, Total: {:?}, Error: {}",
                summary_type,
                api_start.elapsed(),
                total_start.elapsed(),
                err
            );
        }
    }

    result.map(|r| r.content)
}

#[tauri::command]
pub fn get_ai_usage_stats(
    storage: State<'_, Arc<Mutex<StorageService>>>,
    period: String,
) -> Result<AiUsageStats, String> {
    let storage = storage.lock().map_err(|e| format!("Lock error: {}", e))?;
    let data = storage.load_ai_usage()?;

    let cutoff = match period.as_str() {
        "7d" => Some(Utc::now() - chrono::Duration::days(7)),
        "30d" => Some(Utc::now() - chrono::Duration::days(30)),
        _ => None, // "all"
    };

    let filtered: Vec<_> = data
        .entries
        .iter()
        .filter(|e| {
            if let Some(cutoff) = cutoff {
                chrono::DateTime::parse_from_rfc3339(&e.timestamp)
                    .map(|dt| dt >= cutoff)
                    .unwrap_or(false)
            } else {
                true
            }
        })
        .collect();

    Ok(AiUsageStats {
        total_prompt_tokens: filtered.iter().map(|e| e.prompt_tokens).sum(),
        total_completion_tokens: filtered.iter().map(|e| e.completion_tokens).sum(),
        total_tokens: filtered.iter().map(|e| e.total_tokens).sum(),
        total_cost_usd: filtered.iter().map(|e| e.estimated_cost_usd).sum(),
        call_count: filtered.len() as u32,
    })
}
