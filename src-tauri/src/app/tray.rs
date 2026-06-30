use crate::app::{hotkeys, windows};
use crate::settings::store::{load_settings, save_settings};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::App;
use tauri_plugin_autostart::ManagerExt;

pub fn build_tray(app: &mut App) -> tauri::Result<()> {
    let open_helper = MenuItem::with_id(app, "open_helper", "Open helper", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let enable_shortcut = MenuItem::with_id(
        app,
        "enable_shortcut",
        "Disable shortcut",
        true,
        None::<&str>,
    )?;
    let start_at_login = MenuItem::with_id(
        app,
        "start_at_login",
        "Toggle start at login",
        true,
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let menu = Menu::with_items(
        app,
        &[
            &open_helper,
            &settings,
            &separator,
            &enable_shortcut,
            &start_at_login,
            &separator,
            &quit,
        ],
    )?;

    TrayIconBuilder::new()
        .tooltip("FatFingers")
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "open_helper" => {
                let _ = windows::show_helper(app);
            }
            "settings" => {
                let _ = windows::show_settings(app);
            }
            "enable_shortcut" => {
                if let Ok(settings) = load_settings(app) {
                    if let Ok(enabled) = hotkeys::toggle_user_hotkey(app, &settings.hotkey) {
                        let _ = enable_shortcut.set_text(if enabled {
                            "Disable shortcut"
                        } else {
                            "Enable shortcut"
                        });
                    }
                }
            }
            "start_at_login" => {
                if let Ok(mut settings) = load_settings(app) {
                    settings.launch_at_login = !settings.launch_at_login;
                    let autostart = app.autolaunch();
                    let launch_result = if settings.launch_at_login {
                        autostart.enable()
                    } else {
                        autostart.disable()
                    };

                    if launch_result.is_ok() {
                        let _ = save_settings(app, &settings);
                    }
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let _ = windows::show_helper(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}
