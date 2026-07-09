use crate::app::windows;
use crate::errors::AppError;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::AppHandle;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

static SHORTCUT_ENABLED: AtomicBool = AtomicBool::new(false);

pub fn register_user_hotkey(app: &AppHandle, hotkey: &str) -> Result<(), AppError> {
    replace_user_hotkey(app, hotkey, None)
}

pub fn replace_user_hotkey(
    app: &AppHandle,
    hotkey: &str,
    fallback_hotkey: Option<&str>,
) -> Result<(), AppError> {
    let shortcut = parse_shortcut(hotkey)?;
    let fallback_shortcut = fallback_hotkey.and_then(|value| parse_shortcut(value).ok());
    let manager = app.global_shortcut();

    manager
        .unregister_all()
        .map_err(|_| AppError::shortcut_unavailable())?;
    SHORTCUT_ENABLED.store(false, Ordering::SeqCst);

    if manager.register(shortcut).is_err() {
        if let Some(fallback) = fallback_shortcut {
            let _ = manager.unregister_all();
            if manager.register(fallback).is_ok() {
                SHORTCUT_ENABLED.store(true, Ordering::SeqCst);
            }
        }

        return Err(AppError::shortcut_unavailable());
    }

    SHORTCUT_ENABLED.store(true, Ordering::SeqCst);
    Ok(())
}

pub fn test_user_hotkey(
    app: &AppHandle,
    hotkey: &str,
    fallback_hotkey: Option<&str>,
) -> Result<(), AppError> {
    let shortcut = parse_shortcut(hotkey)?;
    let fallback_shortcut = fallback_hotkey.and_then(|value| parse_shortcut(value).ok());
    let same_as_fallback = fallback_hotkey
        .map(|value| comparable_hotkey(value) == comparable_hotkey(hotkey))
        .unwrap_or(false);
    let manager = app.global_shortcut();

    manager
        .unregister_all()
        .map_err(|_| AppError::shortcut_unavailable())?;
    SHORTCUT_ENABLED.store(false, Ordering::SeqCst);

    let test_result = manager.register(shortcut);
    if same_as_fallback {
        if test_result.is_ok() {
            SHORTCUT_ENABLED.store(true, Ordering::SeqCst);
            return Ok(());
        }

        return Err(AppError::shortcut_unavailable());
    }

    let test_succeeded = test_result.is_ok();
    let _ = manager.unregister_all();
    if let Some(fallback) = fallback_shortcut {
        if manager.register(fallback).is_ok() {
            SHORTCUT_ENABLED.store(true, Ordering::SeqCst);
        }
    }

    if test_succeeded {
        Ok(())
    } else {
        Err(AppError::shortcut_unavailable())
    }
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
        let _ = windows::show_startup(app);
    }
}

fn parse_shortcut(hotkey: &str) -> Result<Shortcut, AppError> {
    hotkey
        .replace("Ctrl", "Control")
        .replace("Cmd", "Command")
        .parse::<Shortcut>()
        .map_err(|_| AppError::shortcut_unavailable())
}

fn comparable_hotkey(hotkey: &str) -> String {
    hotkey
        .replace("Ctrl", "Control")
        .replace("Cmd", "Command")
        .split('+')
        .map(|part| part.trim().to_ascii_lowercase())
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("+")
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
