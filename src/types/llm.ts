export type WritingAction =
  | "correct"
  | "professional"
  | "shorten"
  | "friendly"
  | "translate_english"
  | "translate_spanish"
  | "quick_reply"
  | "custom";

export type TargetLanguage = "original" | "en" | "es";

export type WritingMode = "plain_text" | "balanced" | "formal" | "creative";

export type ProviderType =
  | "openai"
  | "minimax"
  | "openrouter"
  | "openai_compatible"
  | "custom_http";

export type CorrectTextRequest = {
  action: WritingAction;
  inputText: string;
  customInstruction?: string | null;
  targetLanguage: TargetLanguage;
};

export type CorrectTextResponse = {
  outputText: string;
  provider: string;
  model: string;
  latencyMs: number;
};

export type TestProviderResponse = {
  ok: boolean;
  message: string;
  latencyMs?: number | null;
};
