import type { AppSettings } from "../types/app";
import type { AppLanguage } from "../types/app";
import type { ProviderType, WritingAction, WritingMode } from "../types/llm";

export const SECRET_PROVIDER_API_KEY = "provider_api_key";
export const SECRET_CUSTOM_HEADERS = "custom_headers";
export const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const DEFAULT_OPENAI_MODEL = "gpt-5.4-mini";
export const MINIMAX_BASE_URL = "https://api.minimax.io/v1";
export const MINIMAX_RESPONSES_URL = `${MINIMAX_BASE_URL}/responses`;
export const DEFAULT_MINIMAX_MODEL = "MiniMax-M3";
export const MINIMAX_CONTEXT_WINDOW = 1_000_000;
export const CUSTOM_MODEL_VALUE = "__custom_model__";

export const OPENAI_MODEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "gpt-5.5", label: "GPT-5.5" },
  { value: "gpt-5.4", label: "GPT-5.4" },
  { value: "gpt-5.4-mini", label: "GPT-5.4 mini" },
  { value: "gpt-5.4-nano", label: "GPT-5.4 nano" },
];

export const WRITING_ACTIONS: Array<{ value: WritingAction; label: string }> = [
  { value: "correct", label: "Correct" },
  { value: "professional", label: "Professional" },
  { value: "shorten", label: "Shorten" },
  { value: "friendly", label: "Friendly" },
  { value: "quick_reply", label: "Quick reply" },
];

export const EXTENDED_WRITING_ACTIONS: Array<{ value: WritingAction; label: string }> = [
  ...WRITING_ACTIONS,
  { value: "translate_english", label: "Translate EN" },
  { value: "translate_spanish", label: "Translate ES" },
  { value: "custom", label: "Custom" },
];

export const WRITING_MODES: Array<{ value: WritingMode; label: string }> = [
  { value: "plain_text", label: "Plain text" },
  { value: "balanced", label: "Balanced" },
  { value: "formal", label: "Formal" },
  { value: "creative", label: "Creative" },
];

export const PROVIDERS: Array<{ value: ProviderType; label: string }> = [
  { value: "openai", label: "OpenAI" },
  { value: "minimax", label: "MiniMax" },
  { value: "openai_compatible", label: "OpenAI-compatible" },
  { value: "custom_http", label: "Custom HTTP" },
];

export const APP_LANGUAGES: Array<{ value: AppLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export const FALLBACK_SETTINGS: AppSettings = {
  appName: "FatFingers",
  language: "en",
  hotkey: navigator.platform.toLowerCase().includes("mac")
    ? "Command+Shift+Space"
    : "Ctrl+Shift+Space",
  provider: "openai",
  baseUrl: null,
  model: DEFAULT_OPENAI_MODEL,
  defaultAction: "correct",
  correctionMode: "plain_text",
  formalityLevel: 50,
  creativityLevel: 20,
  temperature: 0.2,
  maxOutputTokens: 800,
  timeoutSeconds: 30,
  autoCopy: false,
  autoCloseAfterCopy: false,
  launchAtLogin: false,
  theme: "system",
  storeHistory: false,
};
