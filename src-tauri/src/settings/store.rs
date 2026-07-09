use super::{validate_settings, AppSettings};
use crate::errors::{AppError, AppErrorKind};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const SETTINGS_FILE: &str = "settings.json";

pub fn load_settings(app: &AppHandle) -> Result<AppSettings, AppError> {
    let path = settings_path(app)?;

    if !path.exists() {
        return Ok(AppSettings::default());
    }

    let contents = fs::read_to_string(path).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Settings could not be read from disk.",
        )
    })?;

    let settings = serde_json::from_str::<AppSettings>(&contents).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Settings file is invalid. Reset settings from Privacy.",
        )
    })?;

    validate_settings(&settings)?;
    Ok(settings)
}

pub fn has_saved_settings(app: &AppHandle) -> Result<bool, AppError> {
    settings_path(app).map(|path| path.is_file())
}

pub fn save_settings(app: &AppHandle, settings: &AppSettings) -> Result<(), AppError> {
    validate_settings(settings)?;

    let path = settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|_| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Settings directory could not be created.",
            )
        })?;
    }

    let contents = serde_json::to_string_pretty(settings).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Settings could not be serialized.",
        )
    })?;

    fs::write(path, contents).map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Settings could not be written to disk.",
        )
    })
}

pub fn clear_settings(app: &AppHandle) -> Result<(), AppError> {
    let path = settings_path(app)?;

    if path.exists() {
        fs::remove_file(path).map_err(|_| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Settings could not be removed.",
            )
        })?;
    }

    Ok(())
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, AppError> {
    app.path()
        .app_config_dir()
        .map(|dir| dir.join(SETTINGS_FILE))
        .map_err(|_| {
            AppError::new(
                AppErrorKind::InvalidSettings,
                "Settings directory could not be resolved.",
            )
        })
}
