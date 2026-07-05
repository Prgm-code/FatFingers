use crate::errors::{AppError, AppErrorKind};
use keyring::{Entry, Error as KeyringError};
use serde_json::Value;

pub const PROVIDER_API_KEY: &str = "provider_api_key";
pub const CUSTOM_HEADERS: &str = "custom_headers";

const SERVICE_NAME: &str = "FatFingers";

pub fn save_secret(name: &str, value: &str) -> Result<(), AppError> {
    validate_secret_name(name)?;

    if value.trim().is_empty() {
        return delete_secret(name);
    }

    if name == CUSTOM_HEADERS {
        validate_custom_headers(value)?;
    }

    entry(name)?
        .set_password(value)
        .map_err(map_keyring_error)?;

    match entry(name)?.get_password() {
        Ok(saved_value) if saved_value == value => Ok(()),
        Ok(_) | Err(KeyringError::NoEntry) => Err(AppError::secure_storage()),
        Err(error) => Err(map_keyring_error(error)),
    }
}

pub fn get_secret(name: &str) -> Result<Option<String>, AppError> {
    validate_secret_name(name)?;

    match entry(name)?.get_password() {
        Ok(value) => Ok(Some(value)),
        Err(KeyringError::NoEntry) => Ok(None),
        Err(error) => Err(map_keyring_error(error)),
    }
}

pub fn has_secret(name: &str) -> Result<bool, AppError> {
    get_secret(name).map(|value| value.is_some_and(|secret| !secret.trim().is_empty()))
}

pub fn delete_secret(name: &str) -> Result<(), AppError> {
    validate_secret_name(name)?;

    match entry(name)?.delete_credential() {
        Ok(()) | Err(KeyringError::NoEntry) => Ok(()),
        Err(error) => Err(map_keyring_error(error)),
    }
}

pub fn clear_all_secrets() -> Result<(), AppError> {
    delete_secret(PROVIDER_API_KEY)?;
    delete_secret(CUSTOM_HEADERS)
}

fn validate_secret_name(name: &str) -> Result<(), AppError> {
    match name {
        PROVIDER_API_KEY | CUSTOM_HEADERS => Ok(()),
        _ => Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Unknown secret name.",
        )),
    }
}

fn entry(name: &str) -> Result<Entry, AppError> {
    Entry::new(SERVICE_NAME, name).map_err(map_keyring_error)
}

fn validate_custom_headers(value: &str) -> Result<(), AppError> {
    let parsed = serde_json::from_str::<Value>(value).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Custom headers must be a JSON object with string values.",
        )
    })?;

    let Some(object) = parsed.as_object() else {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Custom headers must be a JSON object with string values.",
        ));
    };

    if object.values().any(|value| !value.is_string()) {
        return Err(AppError::new(
            AppErrorKind::InvalidSettings,
            "Custom headers must be a JSON object with string values.",
        ));
    }

    Ok(())
}

fn map_keyring_error(_error: KeyringError) -> AppError {
    AppError::secure_storage()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_unknown_secret_names_before_keyring_access() {
        let error = has_secret("unexpected_secret").unwrap_err();

        assert_eq!(error.code, AppErrorKind::InvalidSettings);
    }

    #[test]
    fn validates_custom_headers_shape_before_keyring_access() {
        let error = save_secret(CUSTOM_HEADERS, r#"{"X-Test":true}"#).unwrap_err();

        assert_eq!(error.code, AppErrorKind::InvalidSettings);
        assert!(error.message.contains("Custom headers"));
    }
}
