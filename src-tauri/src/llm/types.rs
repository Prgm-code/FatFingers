use crate::errors::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WritingAction {
    Correct,
    Professional,
    Shorten,
    Friendly,
    TranslateEnglish,
    TranslateSpanish,
    QuickReply,
    Custom,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WritingMode {
    PlainText,
    Balanced,
    Formal,
    Creative,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProviderType {
    #[serde(rename = "openai")]
    OpenAi,
    #[serde(rename = "openai_compatible")]
    OpenAiCompatible,
    #[serde(rename = "custom_http")]
    CustomHttp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LlmRequest {
    pub action: WritingAction,
    pub input_text: String,
    pub custom_instruction: Option<String>,
    pub model: String,
    pub temperature: Option<f32>,
    pub max_output_tokens: Option<u32>,
    pub correction_mode: WritingMode,
    pub formality_level: Option<u8>,
    pub creativity_level: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LlmResponse {
    pub output_text: String,
    pub provider: String,
    pub model: String,
    pub latency_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CorrectTextRequest {
    pub action: WritingAction,
    pub input_text: String,
    pub custom_instruction: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CorrectTextResponse {
    pub output_text: String,
    pub provider: String,
    pub model: String,
    pub latency_ms: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestProviderResponse {
    pub ok: bool,
    pub message: String,
    pub latency_ms: Option<u128>,
}

#[derive(Debug, Clone)]
pub struct LlmError {
    pub app_error: AppError,
}

impl LlmError {
    pub fn new(app_error: AppError) -> Self {
        Self { app_error }
    }
}

impl From<AppError> for LlmError {
    fn from(value: AppError) -> Self {
        Self::new(value)
    }
}
