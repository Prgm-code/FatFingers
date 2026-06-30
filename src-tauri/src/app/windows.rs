use crate::errors::{AppError, AppErrorKind};
use tauri::{AppHandle, Emitter, LogicalSize, Manager, Size, WebviewUrl, WebviewWindowBuilder};

pub const HELPER_LABEL: &str = "helper";
pub const SETTINGS_LABEL: &str = "settings";
const HELPER_WIDTH: f64 = 620.0;
const HELPER_HEIGHT: f64 = 380.0;
const HELPER_MIN_WIDTH: f64 = 520.0;
const HELPER_MIN_HEIGHT: f64 = 340.0;
const SETTINGS_WIDTH: f64 = 920.0;
const SETTINGS_HEIGHT: f64 = 720.0;
const SETTINGS_MIN_WIDTH: f64 = 760.0;
const SETTINGS_MIN_HEIGHT: f64 = 560.0;

pub fn show_helper(app: &AppHandle) -> Result<(), AppError> {
    let window = match app.get_webview_window(HELPER_LABEL) {
        Some(window) => window,
        None => WebviewWindowBuilder::new(app, HELPER_LABEL, WebviewUrl::App("index.html".into()))
            .title("FatFingers")
            .inner_size(HELPER_WIDTH, HELPER_HEIGHT)
            .min_inner_size(HELPER_MIN_WIDTH, HELPER_MIN_HEIGHT)
            .resizable(true)
            .always_on_top(true)
            .center()
            .build()
            .map_err(|_| {
                AppError::new(
                    AppErrorKind::ProviderError,
                    "FatFingers window could not be created.",
                )
            })?,
    };

    let _ = window.set_min_size(Some(Size::Logical(LogicalSize {
        width: HELPER_MIN_WIDTH,
        height: HELPER_MIN_HEIGHT,
    })));
    let _ = window.set_size(Size::Logical(LogicalSize {
        width: HELPER_WIDTH,
        height: HELPER_HEIGHT,
    }));

    window.show().map_err(|_| {
        AppError::new(
            AppErrorKind::ProviderError,
            "FatFingers window could not be shown.",
        )
    })?;
    window.set_focus().map_err(|_| {
        AppError::new(
            AppErrorKind::ProviderError,
            "FatFingers window could not receive focus.",
        )
    })?;
    let _ = window.emit("fatfingers://focus-input", ());

    Ok(())
}

pub fn show_settings(app: &AppHandle) -> Result<(), AppError> {
    let window = match app.get_webview_window(SETTINGS_LABEL) {
        Some(window) => window,
        None => WebviewWindowBuilder::new(
            app,
            SETTINGS_LABEL,
            WebviewUrl::App("index.html?view=settings".into()),
        )
        .title("FatFingers Settings")
        .inner_size(SETTINGS_WIDTH, SETTINGS_HEIGHT)
        .min_inner_size(SETTINGS_MIN_WIDTH, SETTINGS_MIN_HEIGHT)
        .resizable(true)
        .always_on_top(false)
        .center()
        .build()
        .map_err(|_| {
            AppError::new(
                AppErrorKind::ProviderError,
                "Settings window could not be created.",
            )
        })?,
    };

    window.show().map_err(|_| {
        AppError::new(
            AppErrorKind::ProviderError,
            "Settings window could not be shown.",
        )
    })?;
    window.set_focus().map_err(|_| {
        AppError::new(
            AppErrorKind::ProviderError,
            "Settings window could not receive focus.",
        )
    })
}

pub fn hide_helper(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(HELPER_LABEL) {
        window.hide().map_err(|_| {
            AppError::new(
                AppErrorKind::ProviderError,
                "FatFingers window could not be hidden.",
            )
        })?;
    }

    Ok(())
}

pub fn hide_settings(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(SETTINGS_LABEL) {
        window.hide().map_err(|_| {
            AppError::new(
                AppErrorKind::ProviderError,
                "Settings window could not be hidden.",
            )
        })?;
    }

    Ok(())
}
