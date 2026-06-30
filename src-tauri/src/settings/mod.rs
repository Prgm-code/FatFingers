pub mod history;
pub mod secrets;
pub mod store;

use crate::errors::{AppError, AppErrorKind};
use crate::llm::types::{ProviderType, WritingAction, WritingMode};
use serde::{Deserialize, Serialize};

pub const APP_NAME: &str = "FatFingers";
pub const DEFAULT_OPENAI_MODEL: &str = "gpt-5.4-mini";

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub app_name: String,
    #[serde(default)]
    pub language: AppLanguage,
    pub hotkey: String,
    pub provider: ProviderType,
    pub base_url: Option<String>,
    pub model: String,
    pub default_action: WritingAction,
    pub correction_mode: WritingMode,
    pub formality_level: u8,
    pub creativity_level: u8,
    pub temperature: f32,
    pub max_output_tokens: u32,
    pub timeout_seconds: u64,
    pub auto_copy: bool,
    pub auto_close_after_copy: bool,
    pub launch_at_login: bool,
    pub theme: Theme,
    pub store_history: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Theme {
    System,
    Light,
    Dark,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AppLanguage {
    En,
    Es,
}

impl Default for AppLanguage {
    fn default() -> Self {
        Self::En
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            app_name: APP_NAME.to_string(),
            language: AppLanguage::En,
            hotkey: default_hotkey().to_string(),
            provider: ProviderType::OpenAi,
            base_url: None,
            model: DEFAULT_OPENAI_MODEL.to_string(),
            default_action: WritingAction::Correct,
            correction_mode: WritingMode::PlainText,
            formality_level: 50,
            creativity_level: 20,
            temperature: 0.2,
            max_output_tokens: 800,
            timeout_seconds: 30,
            auto_copy: false,
            auto_close_after_copy: false,
            launch_at_login: false,
            theme: Theme::System,
            store_history: false,
        }
    }
}

pub fn default_hotkey() -> &'static str {
    if cfg!(target_os = "macos") {
        "Command+Shift+Space"
    } else {
        "Ctrl+Shift+Space"
    }
}

pub fn validate_settings(settings: &AppSettings) -> Result<(), AppError> {
    if settings.app_name.trim().is_empty() {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "App name cannot be empty.",
        ));
    }

    if settings.hotkey.trim().is_empty() {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Shortcut cannot be empty.",
        ));
    }

    if settings.model.trim().is_empty() {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Model cannot be empty.",
        ));
    }

    if settings.formality_level > 100 || settings.creativity_level > 100 {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Writing behavior levels must be between 0 and 100.",
        ));
    }

    if !(0.0..=2.0).contains(&settings.temperature) {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Temperature must be between 0.0 and 2.0.",
        ));
    }

    if settings.max_output_tokens == 0 {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Max output tokens must be greater than zero.",
        ));
    }

    if settings.timeout_seconds == 0 {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Timeout must be greater than zero.",
        ));
    }

    match settings.provider {
        ProviderType::OpenAi => {}
        ProviderType::MiniMax => {
            if let Some(base_url) = settings.base_url.as_deref() {
                if !base_url.trim().is_empty() {
                    url::Url::parse(base_url).map_err(|_| {
                        AppError::new(AppErrorKind::InvalidSettings, "Base URL is not valid.")
                    })?;
                }
            }
        }
        ProviderType::OpenAiCompatible | ProviderType::CustomHttp => {
            let Some(base_url) = settings.base_url.as_deref() else {
                return Err(AppError::new(
                    AppErrorKind::InvalidSettings,
                    "Base URL is required for this provider.",
                ));
            };

            if base_url.trim().is_empty() {
                return Err(AppError::new(
                    AppErrorKind::InvalidSettings,
                    "Base URL is required for this provider.",
                ));
            }

            url::Url::parse(base_url).map_err(|_| {
                AppError::new(AppErrorKind::InvalidSettings, "Base URL is not valid.")
            })?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::llm::minimax::DEFAULT_MINIMAX_BASE_URL;

    #[test]
    fn defaults_match_mvp_writing_behavior() {
        let settings = AppSettings::default();

        assert_eq!(settings.app_name, APP_NAME);
        assert_eq!(settings.language, AppLanguage::En);
        assert_eq!(settings.model, DEFAULT_OPENAI_MODEL);
        assert_eq!(settings.correction_mode, WritingMode::PlainText);
        assert_eq!(settings.formality_level, 50);
        assert_eq!(settings.creativity_level, 20);
        assert_eq!(settings.temperature, 0.2);
        assert!(!settings.store_history);
    }

    #[test]
    fn rejects_invalid_temperature() {
        let mut settings = AppSettings::default();
        settings.temperature = 2.1;

        let error = validate_settings(&settings).unwrap_err();

        assert_eq!(error.code, AppErrorKind::InvalidSettings);
    }

    #[test]
    fn defaults_language_when_loading_legacy_settings() {
        let json = serde_json::json!({
            "appName": APP_NAME,
            "hotkey": default_hotkey(),
            "provider": "openai",
            "baseUrl": null,
            "model": DEFAULT_OPENAI_MODEL,
            "defaultAction": "correct",
            "correctionMode": "plain_text",
            "formalityLevel": 50,
            "creativityLevel": 20,
            "temperature": 0.2,
            "maxOutputTokens": 800,
            "timeoutSeconds": 30,
            "autoCopy": false,
            "autoCloseAfterCopy": false,
            "launchAtLogin": false,
            "theme": "system",
            "storeHistory": false
        });

        let settings: AppSettings = serde_json::from_value(json).unwrap();

        assert_eq!(settings.language, AppLanguage::En);
    }

    #[test]
    fn serializes_spanish_language_setting() {
        let mut settings = AppSettings::default();
        settings.language = AppLanguage::Es;

        let json = serde_json::to_value(settings).unwrap();

        assert_eq!(json["language"], "es");
    }

    #[test]
    fn compatible_provider_requires_base_url() {
        let mut settings = AppSettings::default();
        settings.provider = ProviderType::OpenAiCompatible;
        settings.base_url = None;

        let error = validate_settings(&settings).unwrap_err();

        assert_eq!(error.code, AppErrorKind::InvalidSettings);
    }

    #[test]
    fn minimax_provider_allows_default_base_url() {
        let mut settings = AppSettings::default();
        settings.provider = ProviderType::MiniMax;
        settings.base_url = None;
        settings.model = "MiniMax-M3".to_string();

        validate_settings(&settings).unwrap();
    }

    #[test]
    fn minimax_provider_accepts_configured_base_url() {
        let mut settings = AppSettings::default();
        settings.provider = ProviderType::MiniMax;
        settings.base_url = Some(DEFAULT_MINIMAX_BASE_URL.to_string());
        settings.model = "MiniMax-M3".to_string();

        validate_settings(&settings).unwrap();
    }
}
