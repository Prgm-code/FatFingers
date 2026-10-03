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

/// Language of the final text, independent from the writing action.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TargetLanguage {
    #[default]
    Original,
    En,
    Es,
}

impl WritingAction {
    /// Maps legacy translate actions to `Correct` plus a target language.
    pub fn normalize(self, target_language: TargetLanguage) -> (Self, TargetLanguage) {
        match self {
            Self::TranslateEnglish => (Self::Correct, TargetLanguage::En),
            Self::TranslateSpanish => (Self::Correct, TargetLanguage::Es),
            action => (action, target_language),
        }
    }
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
    #[serde(rename = "minimax")]
    MiniMax,
    #[serde(rename = "openrouter")]
    OpenRouter,
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
    #[serde(default)]
    pub target_language: TargetLanguage,
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
    #[serde(default)]
    pub target_language: TargetLanguage,
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
