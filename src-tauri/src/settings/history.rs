use crate::errors::{AppError, AppErrorKind};
use crate::llm::types::{CorrectTextRequest, LlmResponse, WritingAction};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const HISTORY_FILE: &str = "history.jsonl";

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct HistoryEntry<'a> {
    created_at_ms: u128,
    action: WritingAction,
    input_text: &'a str,
    output_text: &'a str,
    provider: &'a str,
    model: &'a str,
    latency_ms: u128,
}

pub fn append_history(
    app: &AppHandle,
    request: &CorrectTextRequest,
    response: &LlmResponse,
) -> Result<(), AppError> {
    append_history_to_path(&history_path(app)?, request, response)
}

pub fn clear_history(app: &AppHandle) -> Result<(), AppError> {
    clear_history_at_path(&history_path(app)?)
}

fn append_history_to_path(
    path: &Path,
    request: &CorrectTextRequest,
    response: &LlmResponse,
) -> Result<(), AppError> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|_| history_error("History directory could not be created."))?;
    }

    let entry = HistoryEntry {
        created_at_ms: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_millis())
            .unwrap_or_default(),
        action: request.action,
        input_text: &request.input_text,
        output_text: &response.output_text,
        provider: &response.provider,
        model: &response.model,
        latency_ms: response.latency_ms,
    };
    let line = serde_json::to_string(&entry)
        .map_err(|_| history_error("History entry could not be serialized."))?;
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|_| history_error("History file could not be opened."))?;

    writeln!(file, "{line}").map_err(|_| history_error("History entry could not be saved."))
}

fn clear_history_at_path(path: &Path) -> Result<(), AppError> {
    if path.exists() {
        fs::remove_file(path).map_err(|_| history_error("History file could not be removed."))?;
    }

    Ok(())
}

fn history_path(app: &AppHandle) -> Result<PathBuf, AppError> {
    app.path()
        .app_config_dir()
        .map(|dir| dir.join(HISTORY_FILE))
        .map_err(|_| history_error("History directory could not be resolved."))
}

fn history_error(message: &'static str) -> AppError {
    AppError::new(AppErrorKind::InvalidSettings, message)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::llm::types::WritingAction;

    #[test]
    fn appends_and_clears_history_file() {
        let path = std::env::temp_dir().join(format!(
            "fatfingers-history-{}-{}.jsonl",
            std::process::id(),
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let request = CorrectTextRequest {
            action: WritingAction::Correct,
            input_text: "helo".to_string(),
            custom_instruction: None,
        };
        let response = LlmResponse {
            output_text: "hello".to_string(),
            provider: "test".to_string(),
            model: "model".to_string(),
            latency_ms: 12,
        };

        append_history_to_path(&path, &request, &response).unwrap();
        let contents = fs::read_to_string(&path).unwrap();
        assert!(contents.contains("\"inputText\":\"helo\""));
        assert!(contents.contains("\"outputText\":\"hello\""));

        clear_history_at_path(&path).unwrap();
        assert!(!path.exists());
    }
}
