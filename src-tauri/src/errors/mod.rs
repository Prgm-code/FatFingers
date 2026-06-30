use serde::Serialize;
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum AppErrorKind {
    MissingApiKey,
    InvalidApiKey,
    ProviderTimeout,
    NetworkUnavailable,
    ModelUnavailable,
    EmptyInput,
    ShortcutUnavailable,
    ClipboardUnavailable,
    SecureStorageUnavailable,
    InvalidSettings,
    ProviderError,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppError {
    pub code: AppErrorKind,
    pub message: String,
}

impl AppError {
    pub fn new(code: AppErrorKind, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
        }
    }

    pub fn missing_api_key() -> Self {
        Self::new(
            AppErrorKind::MissingApiKey,
            "No API key configured. Open Settings to add one.",
        )
    }

    pub fn timeout() -> Self {
        Self::new(
            AppErrorKind::ProviderTimeout,
            "The AI provider did not respond before the timeout. Try again or increase the timeout in Settings.",
        )
    }

    pub fn shortcut_unavailable() -> Self {
        Self::new(
            AppErrorKind::ShortcutUnavailable,
            "This shortcut could not be registered. It may already be used by another app.",
        )
    }

    pub fn secure_storage() -> Self {
        Self::new(
            AppErrorKind::SecureStorageUnavailable,
            "Secure storage is unavailable on this system.",
        )
    }
}

impl Display for AppError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{:?}: {}", self.code, self.message)
    }
}

impl std::error::Error for AppError {}
