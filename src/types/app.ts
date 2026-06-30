import type { ProviderType, WritingAction, WritingMode } from "./llm";

export type Theme = "system" | "light" | "dark";
export type AppLanguage = "en" | "es";

export type AppSettings = {
  appName: string;
  language: AppLanguage;
  hotkey: string;
  provider: ProviderType;
  baseUrl?: string | null;
  model: string;
  defaultAction: WritingAction;
  correctionMode: WritingMode;
  formalityLevel: number;
  creativityLevel: number;
  temperature: number;
  maxOutputTokens: number;
  timeoutSeconds: number;
  autoCopy: boolean;
  autoCloseAfterCopy: boolean;
  launchAtLogin: boolean;
  theme: Theme;
  storeHistory: boolean;
};

export type AppError = {
  code: string;
  message: string;
};

export type View = "onboarding" | "helper" | "settings" | "about";
