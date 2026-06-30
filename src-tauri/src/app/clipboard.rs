use crate::errors::{AppError, AppErrorKind};
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

pub fn copy_to_clipboard(app: &AppHandle, text: String) -> Result<(), AppError> {
    app.clipboard().write_text(text).map_err(|_| {
        AppError::new(
            AppErrorKind::ClipboardUnavailable,
            "Clipboard is unavailable. Copy the result manually.",
        )
    })
}

pub fn read_clipboard_text(app: &AppHandle) -> Result<String, AppError> {
    app.clipboard().read_text().map_err(|_| {
        AppError::new(
            AppErrorKind::ClipboardUnavailable,
            "Clipboard text could not be read.",
        )
    })
}
