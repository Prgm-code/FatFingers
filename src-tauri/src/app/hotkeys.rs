use crate::app::windows;
use crate::errors::AppError;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::AppHandle;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

static SHORTCUT_ENABLED: AtomicBool = AtomicBool::new(false);

pub fn register_user_hotkey(app: &AppHandle, hotkey: &str) -> Result<(), AppError> {
    let shortcut = parse_shortcut(hotkey)?;
    let manager = app.global_shortcut();

    manager
        .unregister_all()
        .map_err(|_| AppError::shortcut_unavailable())?;
    SHORTCUT_ENABLED.store(false, Ordering::SeqCst);
    manager
        .register(shortcut)
        .map_err(|_| AppError::shortcut_unavailable())?;
    SHORTCUT_ENABLED.store(true, Ordering::SeqCst);
    Ok(())
}

pub fn disable_user_hotkey(app: &AppHandle) -> Result<(), AppError> {
    app.global_shortcut()
        .unregister_all()
        .map_err(|_| AppError::shortcut_unavailable())?;
    SHORTCUT_ENABLED.store(false, Ordering::SeqCst);
    Ok(())
}

pub fn toggle_user_hotkey(app: &AppHandle, hotkey: &str) -> Result<bool, AppError> {
    if is_user_hotkey_enabled() {
        disable_user_hotkey(app)?;
        Ok(false)
    } else {
        register_user_hotkey(app, hotkey)?;
        Ok(true)
    }
}

pub fn is_user_hotkey_enabled() -> bool {
    SHORTCUT_ENABLED.load(Ordering::SeqCst)
}

pub fn handle_shortcut(app: &AppHandle, event: ShortcutState) {
    if is_user_hotkey_enabled() && event == ShortcutState::Pressed {
        let _ = windows::show_helper(app);
    }
}

fn parse_shortcut(hotkey: &str) -> Result<Shortcut, AppError> {
    hotkey
        .replace("Ctrl", "Control")
        .replace("Cmd", "Command")
        .parse::<Shortcut>()
        .map_err(|_| AppError::shortcut_unavailable())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_default_shortcuts() {
        assert!(parse_shortcut("Ctrl+Shift+Space").is_ok());
        assert!(parse_shortcut("Command+Shift+Space").is_ok());
    }

    #[test]
    fn rejects_invalid_shortcut() {
        assert!(parse_shortcut("Ctrl+Shift").is_err());
    }
}
