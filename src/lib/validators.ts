import type { AppSettings } from "../types/app";

export function validateInput(input: string): string | null {
  if (input.trim().length === 0) {
    return "Enter text before running an action.";
  }

  return null;
}

export function validateSettings(settings: AppSettings): string | null {
  if (settings.appName.trim().length === 0) {
    return "App name cannot be empty.";
  }

  if (settings.hotkey.trim().length === 0) {
    return "Shortcut cannot be empty.";
  }

  if (settings.model.trim().length === 0) {
    return "Model cannot be empty.";
  }

  if (settings.formalityLevel < 0 || settings.formalityLevel > 100) {
    return "Formality must be between 0 and 100.";
  }

  if (settings.creativityLevel < 0 || settings.creativityLevel > 100) {
    return "Creativity must be between 0 and 100.";
  }

  if (settings.temperature < 0 || settings.temperature > 2) {
    return "Temperature must be between 0.0 and 2.0.";
  }

  if (settings.maxOutputTokens < 1) {
    return "Max output tokens must be greater than zero.";
  }

  if (settings.timeoutSeconds < 1) {
    return "Timeout must be greater than zero.";
  }

  if (
    settings.provider !== "openai" &&
    (!settings.baseUrl || settings.baseUrl.trim().length === 0)
  ) {
    return "Base URL is required for this provider.";
  }

  if (settings.provider !== "openai" && settings.baseUrl) {
    try {
      new URL(settings.baseUrl);
    } catch {
      return "Base URL is not valid.";
    }
  }

  return null;
}

export function toNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
