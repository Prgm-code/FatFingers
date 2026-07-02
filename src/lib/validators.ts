import type { AppSettings } from "../types/app";
import type { AppLanguage } from "../types/app";
import { t } from "./i18n";

export function validateInput(input: string, language: AppLanguage = "en"): string | null {
  if (input.trim().length === 0) {
    return t(language, "enterTextBeforeRunning");
  }

  return null;
}

export function validateSettings(settings: AppSettings, language: AppLanguage = "en"): string | null {
  if (settings.appName.trim().length === 0) {
    return t(language, "validationAppName");
  }

  if (settings.hotkey.trim().length === 0) {
    return t(language, "validationShortcut");
  }

  if (settings.model.trim().length === 0) {
    return t(language, "validationModel");
  }

  if (settings.formalityLevel < 0 || settings.formalityLevel > 100) {
    return t(language, "validationFormality");
  }

  if (settings.creativityLevel < 0 || settings.creativityLevel > 100) {
    return t(language, "validationCreativity");
  }

  if (settings.temperature < 0 || settings.temperature > 2) {
    return t(language, "validationTemperature");
  }

  if (settings.maxOutputTokens < 1) {
    return t(language, "validationMaxOutputTokens");
  }

  if (settings.timeoutSeconds < 1) {
    return t(language, "validationTimeout");
  }

  if (
    settings.provider !== "openai" &&
    settings.provider !== "minimax" &&
    settings.provider !== "openrouter" &&
    (!settings.baseUrl || settings.baseUrl.trim().length === 0)
  ) {
    return t(language, "validationBaseUrlRequired");
  }

  if (settings.provider !== "openai" && settings.provider !== "openrouter" && settings.baseUrl) {
    try {
      new URL(settings.baseUrl);
    } catch {
      return t(language, "validationBaseUrlInvalid");
    }
  }

  return null;
}

export function toNullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
