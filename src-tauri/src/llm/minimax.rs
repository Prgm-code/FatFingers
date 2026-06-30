use super::openai::{
    build_responses_body, extract_responses_text, map_openai_status, map_reqwest_error,
};
use super::types::{LlmError, LlmRequest, LlmResponse};
use super::{LlmProvider, ProviderConfig};
use crate::errors::{AppError, AppErrorKind};
use async_trait::async_trait;
use reqwest::header::{HeaderMap, HeaderName, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use std::str::FromStr;
use std::time::Instant;

pub const DEFAULT_MINIMAX_BASE_URL: &str = "https://api.minimax.io/v1";

pub struct MiniMaxProvider {
    client: reqwest::Client,
    config: ProviderConfig,
    endpoint: String,
}

impl MiniMaxProvider {
    pub fn new(config: ProviderConfig) -> Result<Self, AppError> {
        if config
            .api_key
            .as_deref()
            .is_none_or(|key| key.trim().is_empty())
        {
            return Err(AppError::missing_api_key());
        }

        let endpoint = responses_endpoint(
            config
                .base_url
                .as_deref()
                .unwrap_or(DEFAULT_MINIMAX_BASE_URL),
        )?;
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
impl LlmProvider for MiniMaxProvider {
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
            .json(&build_responses_body(&request))
            .send()
            .await
            .map_err(map_reqwest_error)?;

        let status = response.status();
        if !status.is_success() {
            return Err(map_openai_status(status).into());
        }

        let body = response.json::<serde_json::Value>().await.map_err(|_| {
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
            provider: "minimax".to_string(),
            model: request.model,
            latency_ms: started.elapsed().as_millis(),
        })
    }
}

fn responses_endpoint(base_url: &str) -> Result<String, AppError> {
    let trimmed = base_url.trim().trim_end_matches('/');
    let endpoint = if trimmed.ends_with("/responses") {
        trimmed.to_string()
    } else if trimmed.ends_with("/v1") {
        format!("{trimmed}/responses")
    } else {
        format!("{trimmed}/v1/responses")
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

    #[test]
    fn appends_responses_path_to_default_base_url() {
        assert_eq!(
            responses_endpoint(DEFAULT_MINIMAX_BASE_URL).unwrap(),
            "https://api.minimax.io/v1/responses"
        );
    }

    #[test]
    fn accepts_full_responses_endpoint() {
        assert_eq!(
            responses_endpoint("https://api.minimax.io/v1/responses").unwrap(),
            "https://api.minimax.io/v1/responses"
        );
    }
}
