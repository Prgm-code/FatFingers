use crate::errors::{AppError, AppErrorKind};
use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

pub const HELPER_LABEL: &str = "helper";

pub fn show_helper(app: &AppHandle) -> Result<(), AppError> {
    let window = match app.get_webview_window(HELPER_LABEL) {
        Some(window) => window,
        None => WebviewWindowBuilder::new(app, HELPER_LABEL, WebviewUrl::App("index.html".into()))
            .title("FatFingers")
            .inner_size(680.0, 420.0)
            .min_inner_size(520.0, 360.0)
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
    show_helper(app)?;
    app.emit("fatfingers://open-settings", ())
        .map_err(|_| AppError::new(AppErrorKind::ProviderError, "Settings could not be opened."))
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
