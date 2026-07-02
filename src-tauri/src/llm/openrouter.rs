use super::openai::{map_openai_status, map_reqwest_error};
use super::openai_compatible::{
    build_chat_completions_body, chat_completions_endpoint, extract_chat_completion_text,
};
use super::types::{LlmError, LlmRequest, LlmResponse};
use super::{LlmProvider, ProviderConfig};
use crate::errors::{AppError, AppErrorKind};
use async_trait::async_trait;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::Value;
use std::str::FromStr;
use std::time::Instant;

pub const DEFAULT_OPENROUTER_BASE_URL: &str = "https://openrouter.ai/api/v1";
#[cfg(test)]
pub const DEFAULT_OPENROUTER_MODEL: &str = "openrouter/auto";

pub struct OpenRouterProvider {
    client: reqwest::Client,
    config: ProviderConfig,
    endpoint: String,
}

impl OpenRouterProvider {
    pub fn new(config: ProviderConfig) -> Result<Self, AppError> {
        if config
            .api_key
            .as_deref()
            .is_none_or(|key| key.trim().is_empty())
        {
            return Err(AppError::missing_api_key());
        }

        let base_url = config
            .base_url
            .as_deref()
            .filter(|base_url| !base_url.trim().is_empty())
            .unwrap_or(DEFAULT_OPENROUTER_BASE_URL);
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
impl LlmProvider for OpenRouterProvider {
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
        let response_model = body
            .get("model")
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|model| !model.is_empty())
            .unwrap_or(&request.model)
            .to_string();

        Ok(LlmResponse {
            output_text,
            provider: "openrouter".to_string(),
            model: response_model,
            latency_ms: started.elapsed().as_millis(),
        })
    }
}

fn headers(api_key: &str, config: &ProviderConfig) -> Result<HeaderMap, LlmError> {
    let mut headers = HeaderMap::new();
    let auth_value = HeaderValue::from_str(&format!("Bearer {api_key}")).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidApiKey,
            "The configured API key is invalid.",
        )
    })?;
    let title_value = HeaderValue::from_str(&config.app_name).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "App name cannot be used as an OpenRouter header value.",
        )
    })?;

    headers.insert(AUTHORIZATION, auth_value);
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(HeaderName::from_static("x-title"), title_value);

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
    use std::collections::HashMap;
    use std::time::Duration;

    fn request() -> LlmRequest {
        LlmRequest {
            action: WritingAction::Correct,
            input_text: "helo".to_string(),
            custom_instruction: None,
            model: DEFAULT_OPENROUTER_MODEL.to_string(),
            temperature: Some(0.2),
            max_output_tokens: Some(200),
            correction_mode: WritingMode::PlainText,
            formality_level: Some(50),
            creativity_level: Some(20),
        }
    }

    #[test]
    fn builds_openrouter_auto_chat_completion_body() {
        let body = build_chat_completions_body(&request());

        assert_eq!(body["model"], DEFAULT_OPENROUTER_MODEL);
        assert_eq!(body["stream"], false);
        assert_eq!(body["messages"][1]["content"], "helo");
    }

    #[test]
    fn includes_openrouter_title_and_custom_headers() {
        let mut custom_headers = HashMap::new();
        custom_headers.insert(
            "HTTP-Referer".to_string(),
            "https://example.test".to_string(),
        );
        let config = ProviderConfig {
            app_name: "FatFingers".to_string(),
            base_url: None,
            api_key: Some("sk-or-test".to_string()),
            custom_headers,
            timeout: Duration::from_secs(30),
        };

        let headers = headers("sk-or-test", &config).unwrap();

        assert_eq!(headers.get("x-title").unwrap(), "FatFingers");
        assert_eq!(headers.get("http-referer").unwrap(), "https://example.test");
    }
}
