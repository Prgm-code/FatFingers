mod app;
mod errors;
mod llm;
mod settings;

use app::{clipboard, hotkeys, lifecycle, tray, windows};
use errors::{AppError, AppErrorKind};
use llm::types::{
    CorrectTextRequest, CorrectTextResponse, LlmRequest, TestProviderResponse, WritingAction,
};
use settings::history;
use settings::secrets::{self, CUSTOM_HEADERS, PROVIDER_API_KEY};
use settings::store;
use settings::{validate_settings, AppSettings};
use tauri::{AppHandle, Emitter};

#[tauri::command]
fn get_settings(app: AppHandle) -> Result<AppSettings, AppError> {
    store::load_settings(&app)
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), AppError> {
    validate_settings(&settings)?;
    let previous_settings = store::load_settings(&app).unwrap_or_default();

    if previous_settings.hotkey != settings.hotkey || !hotkeys::is_user_hotkey_enabled() {
        hotkeys::register_user_hotkey(&app, &settings.hotkey)?;
    }

    if previous_settings.launch_at_login != settings.launch_at_login {
        sync_launch_at_login(&app, settings.launch_at_login)?;
    }

    store::save_settings(&app, &settings)?;
    let _ = app.emit("fatfingers://settings-updated", &settings);
    Ok(())
}

#[tauri::command]
fn save_secret(name: String, value: String) -> Result<(), AppError> {
    secrets::save_secret(&name, &value)
}

#[tauri::command]
fn has_secret(name: String) -> Result<bool, AppError> {
    secrets::has_secret(&name)
}

#[tauri::command]
fn delete_secret(name: String) -> Result<(), AppError> {
    secrets::delete_secret(&name)
}

#[tauri::command]
async fn correct_text(
    app: AppHandle,
    request: CorrectTextRequest,
) -> Result<CorrectTextResponse, AppError> {
    if request.input_text.trim().is_empty() {
        return Err(AppError::new(
            AppErrorKind::EmptyInput,
            "Enter text before running an action.",
        ));
    }

    let settings = store::load_settings(&app)?;
    let history_request = request.clone();
    let response = run_llm_request(&settings, request).await?;

    if settings.store_history {
        history::append_history(&app, &history_request, &response)?;
    }

    Ok(CorrectTextResponse {
        output_text: response.output_text,
        provider: response.provider,
        model: response.model,
        latency_ms: response.latency_ms,
    })
}

#[tauri::command]
async fn test_provider_connection(app: AppHandle) -> Result<TestProviderResponse, AppError> {
    let settings = store::load_settings(&app)?;
    let test_request = CorrectTextRequest {
        action: WritingAction::Custom,
        input_text: "Reply with OK.".to_string(),
        custom_instruction: Some("Return only OK.".to_string()),
    };

    let response = run_llm_request(&settings, test_request).await?;

    Ok(TestProviderResponse {
        ok: true,
        message: "Provider connection succeeded.".to_string(),
        latency_ms: Some(response.latency_ms),
    })
}

#[tauri::command]
fn copy_to_clipboard(app: AppHandle, text: String) -> Result<(), AppError> {
    clipboard::copy_to_clipboard(&app, text)
}

#[tauri::command]
fn read_clipboard_text(app: AppHandle) -> Result<String, AppError> {
    clipboard::read_clipboard_text(&app)
}

#[tauri::command]
fn register_user_hotkey(app: AppHandle, hotkey: String) -> Result<(), AppError> {
    let mut settings = store::load_settings(&app)?;
    hotkeys::register_user_hotkey(&app, &hotkey)?;
    settings.hotkey = hotkey;
    store::save_settings(&app, &settings)
}

#[tauri::command]
fn show_helper_window(app: AppHandle) -> Result<(), AppError> {
    windows::show_helper(&app)
}

#[tauri::command]
fn hide_helper_window(app: AppHandle) -> Result<(), AppError> {
    windows::hide_helper(&app)
}

#[tauri::command]
fn show_settings_window(app: AppHandle) -> Result<(), AppError> {
    windows::show_settings(&app)
}

#[tauri::command]
fn hide_settings_window(app: AppHandle) -> Result<(), AppError> {
    windows::hide_settings(&app)
}

#[tauri::command]
fn clear_local_history(app: AppHandle) -> Result<(), AppError> {
    history::clear_history(&app)
}

#[tauri::command]
fn clear_all_local_data(app: AppHandle) -> Result<(), AppError> {
    store::clear_settings(&app)?;
    history::clear_history(&app)?;
    secrets::clear_all_secrets()
}

#[tauri::command]
fn set_launch_at_login(app: AppHandle, enabled: bool) -> Result<(), AppError> {
    let mut settings = store::load_settings(&app)?;
    settings.launch_at_login = enabled;
    sync_launch_at_login(&app, enabled)?;
    store::save_settings(&app, &settings)
}

async fn run_llm_request(
    settings: &AppSettings,
    request: CorrectTextRequest,
) -> Result<llm::types::LlmResponse, AppError> {
    let api_key = secrets::get_secret(PROVIDER_API_KEY)?;
    let custom_headers = secrets::get_secret(CUSTOM_HEADERS)?;
    let provider = llm::provider_from_settings(settings, api_key, custom_headers)?;
    let llm_request = LlmRequest {
        action: request.action,
        input_text: request.input_text,
        custom_instruction: request.custom_instruction,
        model: settings.model.clone(),
        temperature: Some(settings.temperature),
        max_output_tokens: Some(settings.max_output_tokens),
        correction_mode: settings.correction_mode,
        formality_level: Some(settings.formality_level),
        creativity_level: Some(settings.creativity_level),
    };

    provider
        .generate(llm_request)
        .await
        .map_err(|error| error.app_error)
}

fn sync_launch_at_login(app: &AppHandle, enabled: bool) -> Result<(), AppError> {
    use tauri_plugin_autostart::ManagerExt;

    let autostart = app.autolaunch();
    let result = if enabled {
        autostart.enable()
    } else {
        autostart.disable()
    };

    result.map_err(|_| {
        AppError::new(
            AppErrorKind::InvalidSettings,
            "Launch at login could not be updated on this system.",
        )
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            let _ = windows::show_helper(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    hotkeys::handle_shortcut(app, event.state());
                })
                .build(),
        )
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let label = window.label();
                if label == windows::HELPER_LABEL || label == windows::SETTINGS_LABEL {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            tray::build_tray(app)?;

            let handle = app.handle().clone();
            if let Ok(settings) = store::load_settings(&handle) {
                let _ = hotkeys::register_user_hotkey(&handle, &settings.hotkey);
                let _ = sync_launch_at_login(&handle, settings.launch_at_login);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_settings,
            save_secret,
            has_secret,
            delete_secret,
            correct_text,
            test_provider_connection,
            copy_to_clipboard,
            read_clipboard_text,
            register_user_hotkey,
            show_helper_window,
            hide_helper_window,
            show_settings_window,
            hide_settings_window,
            clear_local_history,
            clear_all_local_data,
            set_launch_at_login
        ])
        .build(tauri::generate_context!())
        .expect("error while building FatFingers")
        .run(|_app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if !lifecycle::is_quit_requested() {
                    api.prevent_exit();
                }
            }
        });
}
