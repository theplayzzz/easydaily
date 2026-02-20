use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

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
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

pub async fn call_ai(
    api_key: &str,
    base_url: &str,
    model: &str,
    system_prompt: &str,
    user_message: &str,
) -> Result<String, String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("NO_CONNECTION: {}", e))?;

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

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            if e.is_timeout() {
                "TIMEOUT".to_string()
            } else if e.is_connect() {
                "NO_CONNECTION".to_string()
            } else {
                format!("NO_CONNECTION: {}", e)
            }
        })?;

    let status = response.status();

    if status == 401 || status == 403 {
        return Err("INVALID_API_KEY".to_string());
    }

    if status == 429 {
        return Err("RATE_LIMITED".to_string());
    }

    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("API_ERROR: {} - {}", status, body));
    }

    let chat_response: ChatResponse = response
        .json()
        .await
        .map_err(|e| format!("PARSE_ERROR: {}", e))?;

    chat_response
        .choices
        .first()
        .map(|c| c.message.content.clone())
        .ok_or_else(|| "PARSE_ERROR: No choices in response".to_string())
}
