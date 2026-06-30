use super::openai::map_reqwest_error;
use super::prompts::build_prompt;
use super::types::{LlmError, LlmRequest, LlmResponse};
use super::{LlmProvider, ProviderConfig};
use crate::errors::{AppError, AppErrorKind};
use async_trait::async_trait;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::{json, Value};
use std::str::FromStr;
use std::time::Instant;

pub struct CustomHttpProvider {
    client: reqwest::Client,
    config: ProviderConfig,
    endpoint: String,
}

impl CustomHttpProvider {
    pub fn new(config: ProviderConfig) -> Result<Self, AppError> {
        let endpoint = config.base_url.as_deref().ok_or_else(|| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Base URL is required for this provider.",
            )
        })?;

        url::Url::parse(endpoint).map_err(|_| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Base URL is not valid for this provider.",
            )
        })?;

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
            endpoint: endpoint.to_string(),
            config,
        })
    }
}

#[async_trait]
impl LlmProvider for CustomHttpProvider {
    async fn generate(&self, request: LlmRequest) -> Result<LlmResponse, LlmError> {
        let started = Instant::now();
        let response = self
            .client
            .post(&self.endpoint)
            .headers(headers(&self.config)?)
            .json(&build_custom_http_body(&request))
            .send()
            .await
            .map_err(map_reqwest_error)?;

        let status = response.status();
        if !status.is_success() {
            return Err(AppError::new(
                AppErrorKind::ProviderError,
                "The custom AI provider returned an error.",
            )
            .into());
        }

        let body = response.json::<Value>().await.map_err(|_| {
            AppError::new(
                AppErrorKind::ProviderError,
                "The AI provider returned an unreadable response.",
            )
        })?;

        let output_text = body
            .get("output_text")
            .and_then(Value::as_str)
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(ToString::to_string)
            .ok_or_else(|| {
                AppError::new(
                    AppErrorKind::ProviderError,
                    "The AI provider returned an empty response.",
                )
            })?;

        Ok(LlmResponse {
            output_text,
            provider: "custom_http".to_string(),
            model: request.model,
            latency_ms: started.elapsed().as_millis(),
        })
    }
}

pub(crate) fn build_custom_http_body(request: &LlmRequest) -> Value {
    let prompt = build_prompt(request);

    json!({
        "model": request.model,
        "instruction": prompt.instruction,
        "input": request.input_text,
        "temperature": request.temperature.unwrap_or(0.2),
        "max_output_tokens": request.max_output_tokens.unwrap_or(800)
    })
}

fn headers(config: &ProviderConfig) -> Result<HeaderMap, LlmError> {
    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    if let Some(api_key) = config
        .api_key
        .as_deref()
        .filter(|key| !key.trim().is_empty())
    {
        let value = HeaderValue::from_str(&format!("Bearer {api_key}")).map_err(|_| {
            AppError::new(
                AppErrorKind::InvalidApiKey,
                "The configured API key is invalid.",
            )
        })?;
        headers.insert(AUTHORIZATION, value);
    }

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

    #[test]
    fn custom_body_matches_spec() {
        let request = LlmRequest {
            action: WritingAction::Shorten,
            input_text: "Please make this shorter".to_string(),
            custom_instruction: None,
            model: "local-model".to_string(),
            temperature: Some(0.2),
            max_output_tokens: Some(300),
            correction_mode: WritingMode::PlainText,
            formality_level: Some(50),
            creativity_level: Some(20),
        };

        let body = build_custom_http_body(&request);

        assert_eq!(body["model"], "local-model");
        assert_eq!(body["input"], "Please make this shorter");
        assert_eq!(body["max_output_tokens"], 300);
        assert!(body["instruction"]
            .as_str()
            .unwrap()
            .contains("make the text shorter"));
    }
}
