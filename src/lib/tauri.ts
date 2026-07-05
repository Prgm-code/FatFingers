import { invoke } from "@tauri-apps/api/core";
import type {
  AppError,
  AppSettings,
  PasteBackOutcome,
  PasteCapability,
  RuntimeStatus,
} from "../types/app";
import type {
  CorrectTextRequest,
  CorrectTextResponse,
  TestProviderResponse,
} from "../types/llm";

export async function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>("get_settings");
}

export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  return invoke<RuntimeStatus>("get_runtime_status");
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return invoke("save_settings", { settings });
}

export async function saveSecret(name: string, value: string): Promise<void> {
  return invoke("save_secret", { name, value });
}

export async function hasSecret(name: string): Promise<boolean> {
  return invoke<boolean>("has_secret", { name });
}

export async function deleteSecret(name: string): Promise<void> {
  return invoke("delete_secret", { name });
}

export async function correctText(
  request: CorrectTextRequest,
): Promise<CorrectTextResponse> {
  return invoke<CorrectTextResponse>("correct_text", { request });
}

export async function testProviderConnection(): Promise<TestProviderResponse> {
  return invoke<TestProviderResponse>("test_provider_connection");
}

export async function copyToClipboard(text: string): Promise<void> {
  return invoke("copy_to_clipboard", { text });
}

export async function readClipboardText(): Promise<string> {
  return invoke<string>("read_clipboard_text");
}

export async function pasteBack(text: string): Promise<PasteBackOutcome> {
  return invoke<PasteBackOutcome>("paste_back", { text });
}

export async function getPasteCapability(): Promise<PasteCapability> {
  return invoke<PasteCapability>("get_paste_capability");
}

export async function registerUserHotkey(hotkey: string): Promise<void> {
  return invoke("register_user_hotkey", { hotkey });
}

export async function testUserHotkey(hotkey: string): Promise<void> {
  return invoke("test_user_hotkey", { hotkey });
}

export async function showOnboardingWindow(): Promise<void> {
  return invoke("show_onboarding_window");
}

export async function closeOnboardingWindow(): Promise<void> {
  return invoke("close_onboarding_window");
}

export async function showHelperWindow(): Promise<void> {
  return invoke("show_helper_window");
}

export async function hideHelperWindow(): Promise<void> {
  return invoke("hide_helper_window");
}

export async function showSettingsWindow(): Promise<void> {
  return invoke("show_settings_window");
}

export async function hideSettingsWindow(): Promise<void> {
  return invoke("hide_settings_window");
}

export async function clearLocalHistory(): Promise<void> {
  return invoke("clear_local_history");
}

export async function clearAllLocalData(): Promise<void> {
  return invoke("clear_all_local_data");
}

export async function setLaunchAtLogin(enabled: boolean): Promise<void> {
  return invoke("set_launch_at_login", { enabled });
}

export function normalizeError(error: unknown): AppError {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return error as AppError;
  }

  if (typeof error === "string") {
    return { code: "provider_error", message: error };
  }

  return {
    code: "provider_error",
    message: "Unexpected error. Try again.",
  };
}
