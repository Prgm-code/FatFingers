import { useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { ProviderForm } from "../components/ProviderForm";
import { ShortcutRecorder } from "../components/ShortcutRecorder";
import {
  APP_LANGUAGES,
  EXTENDED_WRITING_ACTIONS,
  FALLBACK_SETTINGS,
  MINIMAX_BASE_URL,
  SECRET_CUSTOM_HEADERS,
  SECRET_PROVIDER_API_KEY,
  WRITING_MODES,
} from "../lib/settings";
import { t, writingActionLabel, writingModeLabel } from "../lib/i18n";
import {
  clearAllLocalData,
  clearLocalHistory,
  deleteSecret,
  hasSecret,
  normalizeError,
  saveSecret,
  saveSettings,
  testUserHotkey,
  testProviderConnection,
} from "../lib/tauri";
import { toNullableText, validateCustomHeadersJson, validateSettings } from "../lib/validators";
import type { AppSettings } from "../types/app";

type SettingsProps = {
  settings: AppSettings;
  hasApiKey: boolean;
  onBack: () => void;
  onSettingsSaved: (settings: AppSettings) => void;
  onApiKeyChanged: (hasApiKey: boolean) => void;
  onDataCleared: () => void;
};

export function Settings({
  settings,
  hasApiKey,
  onBack,
  onSettingsSaved,
  onApiKeyChanged,
  onDataCleared,
}: SettingsProps) {
  const [draft, setDraft] = useState(settings);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [customHeadersDraft, setCustomHeadersDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const language = draft.language;

  async function persistSettings(nextSettings = draft): Promise<AppSettings | null> {
    const normalized: AppSettings = {
      ...nextSettings,
      baseUrl:
        nextSettings.provider === "openai"
          ? null
          : nextSettings.provider === "openrouter"
            ? null
          : nextSettings.provider === "minimax"
            ? (toNullableText(nextSettings.baseUrl ?? "") ?? MINIMAX_BASE_URL)
            : toNullableText(nextSettings.baseUrl ?? ""),
    };
    const settingsError = validateSettings(normalized, language);

    if (settingsError) {
      setError(settingsError);
      return null;
    }

    setIsSaving(true);
    setError(null);
    try {
      await saveSettings(normalized);
      setDraft(normalized);
      onSettingsSaved(normalized);
      setStatus(t(language, "settingsSaved"));
      return normalized;
    } catch (saveError) {
      setError(normalizeError(saveError).message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function persistApiKeyDraft(): Promise<boolean> {
    if (apiKeyDraft.trim().length === 0) {
      const stored = await hasSecret(SECRET_PROVIDER_API_KEY);
      onApiKeyChanged(stored);
      return stored;
    }

    await saveSecret(SECRET_PROVIDER_API_KEY, apiKeyDraft);
    const stored = await hasSecret(SECRET_PROVIDER_API_KEY);

    if (!stored) {
      throw new Error(t(language, "apiKeySecureStorageReadFailed"));
    }

    setApiKeyDraft("");
    onApiKeyChanged(true);
    return true;
  }

  async function saveApiKey() {
    setError(null);
    try {
      await persistApiKeyDraft();
      setStatus(t(language, "apiKeySaved"));
    } catch (secretError) {
      setError(normalizeError(secretError).message);
    }
  }

  async function clearApiKey() {
    setError(null);
    try {
      await deleteSecret(SECRET_PROVIDER_API_KEY);
      setApiKeyDraft("");
      onApiKeyChanged(false);
      setStatus(t(language, "apiKeyCleared"));
    } catch (secretError) {
      setError(normalizeError(secretError).message);
    }
  }

  async function saveCustomHeaders() {
    setError(null);
    try {
      const headersError = validateCustomHeadersJson(customHeadersDraft, language);
      if (headersError) {
        setError(headersError);
        return;
      }
      await saveSecret(SECRET_CUSTOM_HEADERS, customHeadersDraft);
      setCustomHeadersDraft("");
      setStatus(t(language, "customHeadersSaved"));
    } catch (headersError) {
      setError(normalizeError(headersError).message);
    }
  }

  async function clearCustomHeaders() {
    setError(null);
    try {
      await deleteSecret(SECRET_CUSTOM_HEADERS);
      setCustomHeadersDraft("");
      setStatus(t(language, "customHeadersCleared"));
    } catch (headersError) {
      setError(normalizeError(headersError).message);
    }
  }

  async function testConnection() {
    setIsTesting(true);
    setError(null);
    try {
      const saved = await persistSettings();
      if (!saved) {
        return;
      }
      await persistApiKeyDraft();
      const response = await testProviderConnection();
      setStatus(response.message);
    } catch (testError) {
      setError(normalizeError(testError).message);
    } finally {
      setIsTesting(false);
    }
  }

  async function testShortcut() {
    setError(null);
    try {
      await testUserHotkey(draft.hotkey);
      setStatus(t(language, "shortcutRegistered"));
    } catch (shortcutError) {
      setError(normalizeError(shortcutError).message);
    }
  }

  return (
    <main className="settings-shell">
      <header className="topbar">
        <div>
          <h1>{t(language, "settings")}</h1>
          <p className="muted">{draft.appName}</p>
        </div>
        <button onClick={onBack} type="button">
          {t(language, "back")}
        </button>
      </header>

      <ErrorBanner message={error} />
      {status ? <div className="status-banner">{status}</div> : null}

      <section className="settings-section">
        <h2>{t(language, "general")}</h2>
        <div className="settings-grid">
          <label className="checkbox-row">
            <input
              checked={draft.launchAtLogin}
              onChange={(event) =>
                setDraft({ ...draft, launchAtLogin: event.currentTarget.checked })
              }
              type="checkbox"
            />
            {t(language, "launchAtLogin")}
          </label>
          <label>
            {t(language, "defaultAction")}
            <select
              onChange={(event) =>
                setDraft({
                  ...draft,
                  defaultAction: event.currentTarget.value as AppSettings["defaultAction"],
                })
              }
              value={draft.defaultAction}
            >
              {EXTENDED_WRITING_ACTIONS.map((action) => (
                <option key={action.value} value={action.value}>
                  {writingActionLabel(language, action.value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t(language, "defaultLanguageBehavior")}
            <select disabled value="preserve">
              <option value="preserve">{t(language, "preserveInputLanguage")}</option>
            </select>
          </label>
          <label>
            {t(language, "interfaceLanguage")}
            <select
              onChange={(event) =>
                setDraft({
                  ...draft,
                  language: event.currentTarget.value as AppSettings["language"],
                })
              }
              value={draft.language}
            >
              {APP_LANGUAGES.map((appLanguage) => (
                <option key={appLanguage.value} value={appLanguage.value}>
                  {appLanguage.label}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-row">
            <input
              checked={draft.autoCopy}
              onChange={(event) => setDraft({ ...draft, autoCopy: event.currentTarget.checked })}
              type="checkbox"
            />
            {t(language, "autoCopy")}
          </label>
          <label className="checkbox-row">
            <input
              checked={draft.autoCloseAfterCopy}
              onChange={(event) =>
                setDraft({ ...draft, autoCloseAfterCopy: event.currentTarget.checked })
              }
              type="checkbox"
            />
            {t(language, "closeWindowAfterCopy")}
          </label>
          <label>
            {t(language, "theme")}
            <select
              onChange={(event) =>
                setDraft({ ...draft, theme: event.currentTarget.value as AppSettings["theme"] })
              }
              value={draft.theme}
            >
              <option value="system">{t(language, "themeSystem")}</option>
              <option value="light">{t(language, "themeLight")}</option>
              <option value="dark">{t(language, "themeDark")}</option>
            </select>
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h2>{t(language, "shortcut")}</h2>
        <ShortcutRecorder
          language={language}
          onChange={(hotkey) => setDraft({ ...draft, hotkey })}
          onReset={() => setDraft({ ...draft, hotkey: FALLBACK_SETTINGS.hotkey })}
          onTest={() => void testShortcut()}
          value={draft.hotkey}
        />
      </section>

      <section className="settings-section">
        <h2>{t(language, "aiProvider")}</h2>
        <ProviderForm
          apiKeyDraft={apiKeyDraft}
          customHeadersDraft={customHeadersDraft}
          hasApiKey={hasApiKey}
          isTesting={isTesting}
          onApiKeyDraftChange={setApiKeyDraft}
          onClearApiKey={() => void clearApiKey()}
          onClearCustomHeaders={() => void clearCustomHeaders()}
          onCustomHeadersDraftChange={setCustomHeadersDraft}
          onSaveApiKey={() => void saveApiKey()}
          onSaveCustomHeaders={() => void saveCustomHeaders()}
          onSettingsChange={setDraft}
          onTestConnection={() => void testConnection()}
          settings={draft}
        />
      </section>

      <section className="settings-section">
        <h2>{t(language, "writingBehavior")}</h2>
        <div className="settings-grid">
          <label>
            {t(language, "correctionMode")}
            <select
              onChange={(event) =>
                setDraft({
                  ...draft,
                  correctionMode: event.currentTarget.value as AppSettings["correctionMode"],
                })
              }
              value={draft.correctionMode}
            >
              {WRITING_MODES.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {writingModeLabel(language, mode.value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t(language, "formalityLevel")}
            <input
              max={100}
              min={0}
              onChange={(event) =>
                setDraft({ ...draft, formalityLevel: Number(event.currentTarget.value) })
              }
              type="range"
              value={draft.formalityLevel}
            />
            <span className="muted">{draft.formalityLevel}</span>
          </label>
          <label>
            {t(language, "creativityLevel")}
            <input
              max={100}
              min={0}
              onChange={(event) =>
                setDraft({ ...draft, creativityLevel: Number(event.currentTarget.value) })
              }
              type="range"
              value={draft.creativityLevel}
            />
            <span className="muted">{draft.creativityLevel}</span>
          </label>
          <label>
            {t(language, "temperature")}
            <input
              max={2}
              min={0}
              onChange={(event) =>
                setDraft({ ...draft, temperature: Number(event.currentTarget.value) })
              }
              step={0.1}
              type="number"
              value={draft.temperature}
            />
          </label>
          <label>
            {t(language, "maxOutputTokens")}
            <input
              min={1}
              onChange={(event) =>
                setDraft({ ...draft, maxOutputTokens: Number(event.currentTarget.value) })
              }
              type="number"
              value={draft.maxOutputTokens}
            />
          </label>
          <label>
            {t(language, "timeoutSeconds")}
            <input
              min={1}
              onChange={(event) =>
                setDraft({ ...draft, timeoutSeconds: Number(event.currentTarget.value) })
              }
              type="number"
              value={draft.timeoutSeconds}
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h2>{t(language, "privacy")}</h2>
        <p className="privacy-note">{t(language, "privacyNotice")}</p>
        <div className="settings-grid">
          <label className="checkbox-row">
            <input
              checked={draft.storeHistory}
              onChange={(event) =>
                setDraft({ ...draft, storeHistory: event.currentTarget.checked })
              }
              type="checkbox"
            />
            {t(language, "storeHistoryLocally")}
          </label>
          <label className="checkbox-row">
            <input checked={false} disabled type="checkbox" />
            {t(language, "optionalTelemetry")}
          </label>
          <div className="button-row">
            <button
              onClick={async () => {
                try {
                  await clearLocalHistory();
                  setStatus(t(language, "localHistoryCleared"));
                } catch (historyError) {
                  setError(normalizeError(historyError).message);
                }
              }}
              type="button"
            >
              {t(language, "clearLocalHistory")}
            </button>
            <button onClick={() => void clearApiKey()} type="button">
              {t(language, "clearApiKey")}
            </button>
            <button
              onClick={async () => {
                try {
                  await clearAllLocalData();
                  onDataCleared();
                } catch (clearError) {
                  setError(normalizeError(clearError).message);
                }
              }}
              type="button"
            >
              {t(language, "clearAllLocalData")}
            </button>
          </div>
        </div>
      </section>

      <footer className="settings-footer">
        <button disabled={isSaving} onClick={() => void persistSettings()} type="button">
          {isSaving ? t(language, "saving") : t(language, "saveSettings")}
        </button>
      </footer>
    </main>
  );
}
