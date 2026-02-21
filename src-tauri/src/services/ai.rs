use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

#[derive(Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: ChatResponseMessage,
}

#[derive(Deserialize)]
struct ChatResponseMessage {
    content: String,
}

#[derive(Deserialize)]
struct ChatResponseUsage {
    prompt_tokens: Option<u32>,
    completion_tokens: Option<u32>,
    total_tokens: Option<u32>,
}

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
    usage: Option<ChatResponseUsage>,
}

pub struct AiCallResult {
    pub content: String,
    pub prompt_tokens: u64,
    pub completion_tokens: u64,
    pub total_tokens: u64,
}

pub async fn call_ai(
    api_key: &str,
    base_url: &str,
    model: &str,
    system_prompt: &str,
    user_message: &str,
) -> Result<AiCallResult, String> {
    let build_start = Instant::now();
    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| {
            log::error!("[AI:HTTP] Failed to build HTTP client: {}", e);
            format!("NO_CONNECTION: {}", e)
        })?;

    let request_body = ChatRequest {
        model: model.to_string(),
        messages: vec![
            ChatMessage {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: user_message.to_string(),
            },
        ],
        temperature: 0.7,
        max_tokens: 1024,
    };

    let url = format!("{}/chat/completions", base_url);
    log::info!(
        "[AI:HTTP] Sending POST to {} — model={}, system_prompt={} chars, user_message={} chars",
        url,
        model,
        system_prompt.len(),
        user_message.len()
    );
    log::debug!("[AI:HTTP] Client built in {:?}", build_start.elapsed());

    let send_start = Instant::now();
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            let elapsed = send_start.elapsed();
            if e.is_timeout() {
                log::error!("[AI:HTTP] Request timed out after {:?}", elapsed);
                "TIMEOUT".to_string()
            } else if e.is_connect() {
                log::error!("[AI:HTTP] Connection failed after {:?}: {}", elapsed, e);
                "NO_CONNECTION".to_string()
            } else {
                log::error!("[AI:HTTP] Request failed after {:?}: {}", elapsed, e);
                format!("NO_CONNECTION: {}", e)
            }
        })?;

    let status = response.status();
    let send_elapsed = send_start.elapsed();
    log::info!(
        "[AI:HTTP] Response received — status={}, time={:?}",
        status,
        send_elapsed
    );

    if status == 401 || status == 403 {
        log::error!("[AI:HTTP] Authentication failed — status={}", status);
        return Err("INVALID_API_KEY".to_string());
    }

    if status == 429 {
        log::warn!("[AI:HTTP] Rate limited — status=429");
        return Err("RATE_LIMITED".to_string());
    }

    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        log::error!("[AI:HTTP] API error — status={}, body={}", status, body);
        return Err(format!("API_ERROR: {} - {}", status, body));
    }

    let parse_start = Instant::now();
    let chat_response: ChatResponse = response
        .json()
        .await
        .map_err(|e| {
            log::error!("[AI:HTTP] Failed to parse response JSON: {}", e);
            format!("PARSE_ERROR: {}", e)
        })?;

    let (prompt_tokens, completion_tokens, total_tokens) = if let Some(usage) = &chat_response.usage {
        let pt = usage.prompt_tokens.unwrap_or(0) as u64;
        let ct = usage.completion_tokens.unwrap_or(0) as u64;
        let tt = usage.total_tokens.unwrap_or(0) as u64;
        log::info!(
            "[AI:HTTP] Token usage — prompt={}, completion={}, total={}",
            pt, ct, tt
        );
        (pt, ct, tt)
    } else {
        (0, 0, 0)
    };

    log::debug!("[AI:HTTP] Response parsed in {:?}", parse_start.elapsed());

    chat_response
        .choices
        .first()
        .map(|c| {
            log::info!(
                "[AI:HTTP] Response content: {} chars",
                c.message.content.len()
            );
            AiCallResult {
                content: c.message.content.clone(),
                prompt_tokens,
                completion_tokens,
                total_tokens,
            }
        })
        .ok_or_else(|| {
            log::error!("[AI:HTTP] No choices in response");
            "PARSE_ERROR: No choices in response".to_string()
        })
}
