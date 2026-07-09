use crate::errors::{AppError, AppErrorKind};
use crate::settings::store;
use tauri::{
    webview::PageLoadEvent, AppHandle, Emitter, LogicalSize, Manager, Size, WebviewUrl,
    WebviewWindowBuilder,
};

pub const HELPER_LABEL: &str = "helper";
pub const SETTINGS_LABEL: &str = "settings";
pub const ONBOARDING_LABEL: &str = "onboarding";
const HELPER_WIDTH: f64 = 600.0;
const HELPER_HEIGHT: f64 = 220.0;
const HELPER_MIN_WIDTH: f64 = 460.0;
const HELPER_MIN_HEIGHT: f64 = 160.0;
// The first-launch onboarding gets its own framed, opaque window; toggling
// decorations on the transparent helper window breaks its titlebar hit-testing.
const ONBOARDING_WIDTH: f64 = 860.0;
const ONBOARDING_HEIGHT: f64 = 820.0;
const ONBOARDING_MIN_WIDTH: f64 = 680.0;
const ONBOARDING_MIN_HEIGHT: f64 = 680.0;
const SETTINGS_WIDTH: f64 = 920.0;
const SETTINGS_HEIGHT: f64 = 720.0;
const SETTINGS_MIN_WIDTH: f64 = 760.0;
const SETTINGS_MIN_HEIGHT: f64 = 560.0;

pub fn show_helper(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(HELPER_LABEL) {
        let _ = window.set_min_size(Some(Size::Logical(LogicalSize {
            width: HELPER_MIN_WIDTH,
            height: HELPER_MIN_HEIGHT,
        })));
        let _ = window.set_size(Size::Logical(LogicalSize {
            width: HELPER_WIDTH,
            height: HELPER_HEIGHT,
        }));
        window
            .show()
            .map_err(|_| window_error("FatFingers window could not be shown."))?;
        window
            .set_focus()
            .map_err(|_| window_error("FatFingers window could not receive focus."))?;
        let _ = window.emit("fatfingers://focus-input", ());
        return Ok(());
    }

    WebviewWindowBuilder::new(app, HELPER_LABEL, WebviewUrl::App("index.html".into()))
        .title("FatFingers")
        .inner_size(HELPER_WIDTH, HELPER_HEIGHT)
        .min_inner_size(HELPER_MIN_WIDTH, HELPER_MIN_HEIGHT)
        .resizable(true)
        .always_on_top(true)
        .decorations(false)
        .transparent(true)
        .skip_taskbar(true)
        .shadow(false)
        .center()
        .visible(false)
        .on_page_load(|window, payload| {
            if matches!(payload.event(), PageLoadEvent::Finished) {
                let _ = window.show();
                let _ = window.set_focus();
            }
        })
        .build()
        .map_err(|_| window_error("FatFingers window could not be created."))?;

    Ok(())
}

pub fn show_onboarding(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(ONBOARDING_LABEL) {
        window
            .show()
            .map_err(|_| window_error("Onboarding window could not be shown."))?;
        return window
            .set_focus()
            .map_err(|_| window_error("Onboarding window could not receive focus."));
    }

    WebviewWindowBuilder::new(
        app,
        ONBOARDING_LABEL,
        WebviewUrl::App("index.html?view=onboarding".into()),
    )
    .title("FatFingers")
    .inner_size(ONBOARDING_WIDTH, ONBOARDING_HEIGHT)
    .min_inner_size(ONBOARDING_MIN_WIDTH, ONBOARDING_MIN_HEIGHT)
    .resizable(true)
    .center()
    .visible(false)
    .on_page_load(|window, payload| {
        if matches!(payload.event(), PageLoadEvent::Finished) {
            let _ = window.show();
            let _ = window.set_focus();
        }
    })
    .build()
    .map_err(|_| window_error("Onboarding window could not be created."))?;

    Ok(())
}

pub fn close_onboarding(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(ONBOARDING_LABEL) {
        let _ = window.close();
    }

    Ok(())
}

pub fn show_settings(app: &AppHandle) -> Result<(), AppError> {
    if let Some(window) = app.get_webview_window(SETTINGS_LABEL) {
        window
            .show()
            .map_err(|_| window_error("Settings window could not be shown."))?;
        return window
            .set_focus()
            .map_err(|_| window_error("Settings window could not receive focus."));
    }

    WebviewWindowBuilder::new(
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
    .visible(false)
    .on_page_load(|window, payload| {
        if matches!(payload.event(), PageLoadEvent::Finished) {
            let _ = window.show();
            let _ = window.set_focus();
        }
    })
    .build()
    .map_err(|_| window_error("Settings window could not be created."))?;

    Ok(())
}

pub fn show_startup(app: &AppHandle) -> Result<(), AppError> {
    let has_valid_settings = store::has_saved_settings(app)
        .and_then(|saved| {
            if saved {
                store::load_settings(app).map(|_| true)
            } else {
                Ok(false)
            }
        })
        .unwrap_or(false);

    if has_valid_settings {
        show_helper(app)
    } else {
        show_settings(app)
    }
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

fn window_error(message: &str) -> AppError {
    AppError::new(AppErrorKind::ProviderError, message)
}
