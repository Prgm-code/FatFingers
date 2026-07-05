use crate::app::{clipboard, windows};
use crate::errors::{AppError, AppErrorKind};
use enigo::{Direction, Enigo, Key, Keyboard, Settings as EnigoSettings};
use serde::Serialize;
use std::thread;
use std::time::Duration;
use tauri::AppHandle;

// Delay between hiding the helper and synthesizing the paste shortcut, so the
// OS has time to return focus to the previously active window. Tune within
// 150-300ms during QA if pastes land in the wrong window.
const PASTE_FOCUS_DELAY_MS: u64 = 200;
// Delay before restoring the user's previous clipboard text. Target apps read
// the clipboard synchronously on Ctrl+V, so a short wait is enough.
const CLIPBOARD_RESTORE_DELAY_MS: u64 = 500;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum PasteCapability {
    Simulated,
    ClipboardOnly,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PasteBackOutcome {
    pub method: PasteCapability,
}

fn paste_unavailable() -> AppError {
    AppError::new(
        AppErrorKind::PasteUnavailable,
        "Automatic paste is not available on this system.",
    )
}

#[cfg(target_os = "macos")]
fn accessibility_trusted(prompt: bool) -> bool {
    use macos_accessibility_client::accessibility;

    if prompt {
        accessibility::application_is_trusted_with_prompt()
    } else {
        accessibility::application_is_trusted()
    }
}

// `prompt` only matters on macOS, where the first real paste attempt should
// trigger the system Accessibility permission dialog.
fn build_simulator(prompt: bool) -> Option<Enigo> {
    #[cfg(target_os = "macos")]
    if !accessibility_trusted(prompt) {
        return None;
    }
    #[cfg(not(target_os = "macos"))]
    let _ = prompt;

    Enigo::new(&EnigoSettings::default()).ok()
}

fn send_paste_shortcut(simulator: &mut Enigo) -> bool {
    let modifier = if cfg!(target_os = "macos") {
        Key::Meta
    } else {
        Key::Control
    };

    if simulator.key(modifier, Direction::Press).is_err() {
        return false;
    }
    let pressed = simulator.key(Key::Unicode('v'), Direction::Click).is_ok();
    let released = simulator.key(modifier, Direction::Release).is_ok();
    pressed && released
}

pub async fn detect_paste_capability() -> PasteCapability {
    tauri::async_runtime::spawn_blocking(|| {
        if build_simulator(false).is_some() {
            PasteCapability::Simulated
        } else {
            PasteCapability::ClipboardOnly
        }
    })
    .await
    .unwrap_or(PasteCapability::ClipboardOnly)
}

// Writes `text` to the clipboard and, when simulation is available, hides the
// helper (focus returns to the previously active app) and synthesizes
// Ctrl/Cmd+V. Falls back to clipboard-only without failing: the caller shows
// the "copied" hint and closes the helper itself in that case.
pub async fn paste_back(app: AppHandle, text: String) -> Result<PasteBackOutcome, AppError> {
    let previous_text = clipboard::read_clipboard_text(&app)
        .ok()
        .filter(|previous| !previous.is_empty());
    clipboard::copy_to_clipboard(&app, text)?;

    let app_for_simulation = app.clone();
    let simulated = tauri::async_runtime::spawn_blocking(move || {
        // Build the simulator before hiding: construction is the failure point
        // on Wayland and on macOS without Accessibility, and the helper must
        // stay visible for the frontend fallback hint in that case.
        let Some(mut simulator) = build_simulator(true) else {
            return false;
        };

        if windows::hide_helper(&app_for_simulation).is_err() {
            return false;
        }

        thread::sleep(Duration::from_millis(PASTE_FOCUS_DELAY_MS));
        send_paste_shortcut(&mut simulator)
    })
    .await
    .map_err(|_| paste_unavailable())?;

    if !simulated {
        return Ok(PasteBackOutcome {
            method: PasteCapability::ClipboardOnly,
        });
    }

    if let Some(previous) = previous_text {
        // Best-effort, text-only restore; races with clipboard managers are
        // acceptable and non-text clipboard content is not preserved.
        let app_for_restore = app.clone();
        tauri::async_runtime::spawn_blocking(move || {
            thread::sleep(Duration::from_millis(CLIPBOARD_RESTORE_DELAY_MS));
            let _ = clipboard::copy_to_clipboard(&app_for_restore, previous);
        });
    }

    Ok(PasteBackOutcome {
        method: PasteCapability::Simulated,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn capability_serializes_snake_case() {
        assert_eq!(
            serde_json::to_value(PasteCapability::Simulated).unwrap(),
            "simulated"
        );
        assert_eq!(
            serde_json::to_value(PasteCapability::ClipboardOnly).unwrap(),
            "clipboard_only"
        );
    }

    #[test]
    fn outcome_serializes_camel_case_method() {
        let outcome = PasteBackOutcome {
            method: PasteCapability::ClipboardOnly,
        };

        let json = serde_json::to_value(outcome).unwrap();

        assert_eq!(json["method"], "clipboard_only");
    }
}
