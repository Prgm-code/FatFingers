use super::prompts::build_prompt;
use super::types::{LlmError, LlmRequest, LlmResponse};
use super::{LlmProvider, ProviderConfig};
use crate::errors::{AppError, AppErrorKind};
use async_trait::async_trait;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::{json, Value};
use std::time::Instant;

const OPENAI_RESPONSES_URL: &str = "https://api.openai.com/v1/responses";

pub struct OpenAiProvider {
    client: reqwest::Client,
    config: ProviderConfig,
}

impl OpenAiProvider {
    pub fn new(config: ProviderConfig) -> Result<Self, AppError> {
        if config
            .api_key
            .as_deref()
            .is_none_or(|key| key.trim().is_empty())
        {
            return Err(AppError::missing_api_key());
        }

        let client = reqwest::Client::builder()
            .timeout(config.timeout)
            .build()
            .map_err(|_| {
                AppError::new(
                    AppErrorKind::ProviderError,
                    "The AI provider client could not be created.",
                )
            })?;

        Ok(Self { client, config })
    }
}

#[async_trait]
impl LlmProvider for OpenAiProvider {
    async fn generate(&self, request: LlmRequest) -> Result<LlmResponse, LlmError> {
        let api_key = self
            .config
            .api_key
            .as_deref()
            .filter(|key| !key.trim().is_empty())
            .ok_or_else(AppError::missing_api_key)?;

        let started = Instant::now();
        let response = self
            .client
            .post(OPENAI_RESPONSES_URL)
            .headers(auth_headers(api_key)?)
            .json(&build_responses_body(&request))
            .send()
            .await
            .map_err(map_reqwest_error)?;

        let status = response.status();
        if !status.is_success() {
            return Err(map_openai_status(status).into());
        }

        let body = response.json::<Value>().await.map_err(|_| {
            AppError::new(
                AppErrorKind::ProviderError,
                "The AI provider returned an unreadable response.",
            )
        })?;

        let output_text = extract_responses_text(&body).ok_or_else(|| {
            AppError::new(
                AppErrorKind::ProviderError,
                "The AI provider returned an empty response.",
            )
        })?;

        Ok(LlmResponse {
            output_text,
            provider: "openai".to_string(),
            model: request.model,
            latency_ms: started.elapsed().as_millis(),
        })
    }
}

pub(crate) fn build_responses_body(request: &LlmRequest) -> Value {
    let prompt = build_prompt(request);
    let temperature = request.temperature.unwrap_or(0.2);
    let max_output_tokens = request.max_output_tokens.unwrap_or(800);

    json!({
        "model": request.model,
        "input": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "input_text",
                        "text": prompt.instruction
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": request.input_text
                    }
                ]
            }
        ],
        "temperature": temperature,
        "max_output_tokens": max_output_tokens,
        "store": false
    })
}

pub(crate) fn extract_responses_text(value: &Value) -> Option<String> {
    if let Some(output_text) = value.get("output_text").and_then(Value::as_str) {
        let output_text = output_text.trim();
        if !output_text.is_empty() {
            return Some(output_text.to_string());
        }
    }

    let output = value.get("output")?.as_array()?;
    let mut parts = Vec::new();

    for item in output {
        let Some(content) = item.get("content").and_then(Value::as_array) else {
            continue;
        };

        for content_item in content {
            let text = content_item
                .get("text")
                .or_else(|| content_item.get("output_text"))
                .and_then(Value::as_str);

            if let Some(text) = text {
                let trimmed = text.trim();
                if !trimmed.is_empty() {
                    parts.push(trimmed.to_string());
                }
            }
        }
    }

    if parts.is_empty() {
        None
    } else {
        Some(parts.join("\n"))
    }
}

fn auth_headers(api_key: &str) -> Result<HeaderMap, LlmError> {
    let mut headers = HeaderMap::new();
    let value = HeaderValue::from_str(&format!("Bearer {api_key}")).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidApiKey,
            "The configured API key is invalid.",
        )
    })?;

    headers.insert(AUTHORIZATION, value);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    Ok(headers)
}

pub(crate) fn map_reqwest_error(error: reqwest::Error) -> LlmError {
    if error.is_timeout() {
        return AppError::timeout().into();
    }

    if error.is_connect() {
        return AppError::new(
            AppErrorKind::NetworkUnavailable,
            "The AI provider could not be reached. Check your network and endpoint.",
        )
        .into();
    }

    AppError::new(
        AppErrorKind::ProviderError,
        "The AI provider request failed.",
    )
    .into()
}

pub(crate) fn map_openai_status(status: reqwest::StatusCode) -> AppError {
    match status.as_u16() {
        401 | 403 => AppError::new(
            AppErrorKind::InvalidApiKey,
            "The configured API key was rejected by the AI provider.",
        ),
        404 => AppError::new(
            AppErrorKind::ModelUnavailable,
            "The configured model or endpoint is not available.",
        ),
        408 | 429 | 500..=599 => AppError::new(
            AppErrorKind::ProviderError,
            "The AI provider is unavailable. Try again shortly.",
        ),
        _ => AppError::new(
            AppErrorKind::ProviderError,
            "The AI provider returned an error.",
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::llm::types::{WritingAction, WritingMode};

    fn request() -> LlmRequest {
        LlmRequest {
            action: WritingAction::Correct,
            input_text: "helo".to_string(),
            custom_instruction: None,
            model: "gpt-test".to_string(),
            temperature: Some(0.2),
            max_output_tokens: Some(200),
            correction_mode: WritingMode::PlainText,
            formality_level: Some(50),
            creativity_level: Some(20),
        }
    }

    #[test]
    fn responses_body_uses_store_false() {
        let body = build_responses_body(&request());

        assert_eq!(body["store"], false);
        assert_eq!(body["model"], "gpt-test");
        assert_eq!(body["input"][1]["content"][0]["text"], "helo");
    }

    #[test]
    fn extracts_output_text_shortcut() {
        let body = json!({ "output_text": "Fixed text" });

        assert_eq!(
            extract_responses_text(&body),
            Some("Fixed text".to_string())
        );
    }

    #[test]
    fn extracts_nested_output_text() {
        let body = json!({
            "output": [
                {
                    "content": [
                        { "type": "output_text", "text": "Fixed text" }
                    ]
                }
            ]
        });

        assert_eq!(
            extract_responses_text(&body),
            Some("Fixed text".to_string())
        );
    }
}
