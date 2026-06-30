use super::openai::{map_openai_status, map_reqwest_error};
use super::prompts::build_prompt;
use super::types::{LlmError, LlmRequest, LlmResponse};
use super::{LlmProvider, ProviderConfig};
use crate::errors::{AppError, AppErrorKind};
use async_trait::async_trait;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::{json, Value};
use std::str::FromStr;
use std::time::Instant;

pub struct OpenAiCompatibleProvider {
    client: reqwest::Client,
    config: ProviderConfig,
    endpoint: String,
}

impl OpenAiCompatibleProvider {
    pub fn new(config: ProviderConfig) -> Result<Self, AppError> {
        if config
            .api_key
            .as_deref()
            .is_none_or(|key| key.trim().is_empty())
        {
            return Err(AppError::missing_api_key());
        }

        let base_url = config.base_url.as_deref().ok_or_else(|| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Base URL is required for this provider.",
            )
        })?;

        let endpoint = chat_completions_endpoint(base_url)?;
        let client = reqwest::Client::builder()
            .timeout(config.timeout)
            .build()
            .map_err(|_| {
                AppError::new(
                    AppErrorKind::ProviderError,
                    "The AI provider client could not be created.",
                )
            })?;

        Ok(Self {
            client,
            config,
            endpoint,
        })
    }
}

#[async_trait]
impl LlmProvider for OpenAiCompatibleProvider {
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
            .post(&self.endpoint)
            .headers(headers(api_key, &self.config)?)
            .json(&build_chat_completions_body(&request))
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

        let output_text = extract_chat_completion_text(&body).ok_or_else(|| {
            AppError::new(
                AppErrorKind::ProviderError,
                "The AI provider returned an empty response.",
            )
        })?;

        Ok(LlmResponse {
            output_text,
            provider: "openai_compatible".to_string(),
            model: request.model,
            latency_ms: started.elapsed().as_millis(),
        })
    }
}

pub(crate) fn build_chat_completions_body(request: &LlmRequest) -> Value {
    let prompt = build_prompt(request);
    let temperature = request.temperature.unwrap_or(0.2);
    let max_output_tokens = request.max_output_tokens.unwrap_or(800);

    json!({
        "model": request.model,
        "messages": [
            {
                "role": "system",
                "content": prompt.instruction
            },
            {
                "role": "user",
                "content": request.input_text
            }
        ],
        "temperature": temperature,
        "max_tokens": max_output_tokens,
        "stream": false
    })
}

pub(crate) fn extract_chat_completion_text(value: &Value) -> Option<String> {
    value
        .get("choices")?
        .as_array()?
        .first()?
        .get("message")?
        .get("content")?
        .as_str()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToString::to_string)
}

fn chat_completions_endpoint(base_url: &str) -> Result<String, AppError> {
    let trimmed = base_url.trim().trim_end_matches('/');
    let endpoint = if trimmed.ends_with("/chat/completions") {
        trimmed.to_string()
    } else if trimmed.ends_with("/v1") {
        format!("{trimmed}/chat/completions")
    } else {
        format!("{trimmed}/v1/chat/completions")
    };

    url::Url::parse(&endpoint).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Base URL is not valid for this provider.",
        )
    })?;

    Ok(endpoint)
}

fn headers(api_key: &str, config: &ProviderConfig) -> Result<HeaderMap, LlmError> {
    let mut headers = HeaderMap::new();
    let value = HeaderValue::from_str(&format!("Bearer {api_key}")).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidApiKey,
            "The configured API key is invalid.",
        )
    })?;

    headers.insert(AUTHORIZATION, value);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    for (key, value) in &config.custom_headers {
        let header_name = HeaderName::from_str(key).map_err(|_| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Custom headers contain an invalid header name.",
            )
        })?;
        let header_value = HeaderValue::from_str(value).map_err(|_| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Custom headers contain an invalid header value.",
            )
        })?;
        headers.insert(header_name, header_value);
    }

    Ok(headers)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::llm::types::{WritingAction, WritingMode};

    fn request() -> LlmRequest {
        LlmRequest {
            action: WritingAction::Professional,
            input_text: "hey can you check this".to_string(),
            custom_instruction: None,
            model: "model".to_string(),
            temperature: Some(0.3),
            max_output_tokens: Some(500),
            correction_mode: WritingMode::Balanced,
            formality_level: Some(70),
            creativity_level: Some(20),
        }
    }

    #[test]
    fn builds_chat_completion_body() {
        let body = build_chat_completions_body(&request());

        assert_eq!(body["model"], "model");
        assert_eq!(body["stream"], false);
        assert_eq!(body["messages"][1]["content"], "hey can you check this");
    }

    #[test]
    fn appends_chat_completions_path() {
        assert_eq!(
            chat_completions_endpoint("https://example.test/v1").unwrap(),
            "https://example.test/v1/chat/completions"
        );
    }

    #[test]
    fn extracts_choice_content() {
        let body = json!({
            "choices": [
                { "message": { "content": "Done" } }
            ]
        });

        assert_eq!(
            extract_chat_completion_text(&body),
            Some("Done".to_string())
        );
    }
}
