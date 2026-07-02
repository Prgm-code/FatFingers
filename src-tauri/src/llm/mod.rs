pub mod custom_http;
pub mod minimax;
pub mod openai;
pub mod openai_compatible;
pub mod openrouter;
pub mod prompts;
pub mod types;

use crate::errors::{AppError, AppErrorKind};
use crate::settings::AppSettings;
use async_trait::async_trait;
use serde_json::Value;
use std::collections::HashMap;
use std::time::Duration;
use types::{LlmError, LlmRequest, LlmResponse, ProviderType};

#[async_trait]
pub trait LlmProvider {
    async fn generate(&self, request: LlmRequest) -> Result<LlmResponse, LlmError>;
}

#[derive(Debug, Clone)]
pub struct ProviderConfig {
    pub app_name: String,
    pub base_url: Option<String>,
    pub api_key: Option<String>,
    pub custom_headers: HashMap<String, String>,
    pub timeout: Duration,
}

pub fn provider_from_settings(
    settings: &AppSettings,
    api_key: Option<String>,
    custom_headers: Option<String>,
) -> Result<Box<dyn LlmProvider + Send + Sync>, AppError> {
    let headers = parse_custom_headers(custom_headers)?;
    let config = ProviderConfig {
        app_name: settings.app_name.clone(),
        base_url: settings.base_url.clone(),
        api_key,
        custom_headers: headers,
        timeout: Duration::from_secs(settings.timeout_seconds),
    };

    match settings.provider {
        ProviderType::OpenAi => Ok(Box::new(openai::OpenAiProvider::new(config)?)),
        ProviderType::MiniMax => Ok(Box::new(minimax::MiniMaxProvider::new(config)?)),
        ProviderType::OpenRouter => Ok(Box::new(openrouter::OpenRouterProvider::new(config)?)),
        ProviderType::OpenAiCompatible => Ok(Box::new(
            openai_compatible::OpenAiCompatibleProvider::new(config)?,
        )),
        ProviderType::CustomHttp => Ok(Box::new(custom_http::CustomHttpProvider::new(config)?)),
    }
}

pub(crate) fn parse_custom_headers(
    custom_headers: Option<String>,
) -> Result<HashMap<String, String>, AppError> {
    let Some(raw_headers) = custom_headers else {
        return Ok(HashMap::new());
    };

    if raw_headers.trim().is_empty() {
        return Ok(HashMap::new());
    }

    let value = serde_json::from_str::<Value>(&raw_headers).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Custom headers must be a JSON object.",
        )
    })?;

    let Some(object) = value.as_object() else {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Custom headers must be a JSON object.",
        ));
    };

    let mut headers = HashMap::new();
    for (key, value) in object {
        let Some(value) = value.as_str() else {
            return Err(AppError::new(
                AppErrorKind::InvalidSettings,
                "Custom header values must be strings.",
            ));
        };
        headers.insert(key.to_string(), value.to_string());
    }

    Ok(headers)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_custom_headers_json_object() {
        let headers = parse_custom_headers(Some(r#"{"X-Test":"yes"}"#.to_string())).unwrap();

        assert_eq!(headers.get("X-Test"), Some(&"yes".to_string()));
    }

    #[test]
    fn rejects_non_string_custom_header_values() {
        let error = parse_custom_headers(Some(r#"{"X-Test": true}"#.to_string())).unwrap_err();

        assert_eq!(error.code, AppErrorKind::InvalidSettings);
    }
}
