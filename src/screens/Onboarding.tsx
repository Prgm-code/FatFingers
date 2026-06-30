import { useEffect, useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { ProviderForm } from "../components/ProviderForm";
import { ShortcutRecorder } from "../components/ShortcutRecorder";
import {
  APP_LANGUAGES,
  FALLBACK_SETTINGS,
  MINIMAX_BASE_URL,
  SECRET_CUSTOM_HEADERS,
  SECRET_PROVIDER_API_KEY,
} from "../lib/settings";
import { t } from "../lib/i18n";
import {
  deleteSecret,
  hasSecret,
  normalizeError,
  registerUserHotkey,
  saveSecret,
  saveSettings,
  testProviderConnection,
} from "../lib/tauri";
import { toNullableText, validateSettings } from "../lib/validators";
import type { AppSettings } from "../types/app";

type OnboardingProps = {
  settings: AppSettings;
  hasApiKey: boolean;
  onFinish: (settings: AppSettings, hasApiKey: boolean) => void;
};

export function Onboarding({ settings, hasApiKey, onFinish }: OnboardingProps) {
  const [draft, setDraft] = useState(settings);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [hasSavedApiKey, setHasSavedApiKey] = useState(hasApiKey);
  const [customHeadersDraft, setCustomHeadersDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const language = draft.language;

  useEffect(() => {
    setHasSavedApiKey(hasApiKey);
  }, [hasApiKey]);

  async function persistApiKeyDraft(): Promise<boolean> {
    if (apiKeyDraft.trim().length === 0) {
      const stored = await hasSecret(SECRET_PROVIDER_API_KEY);
      setHasSavedApiKey(stored);
      return stored;
    }

    await saveSecret(SECRET_PROVIDER_API_KEY, apiKeyDraft);
    const stored = await hasSecret(SECRET_PROVIDER_API_KEY);

    if (!stored) {
      throw new Error(t(language, "apiKeySecureStorageReadFailed"));
    }

    setApiKeyDraft("");
    setHasSavedApiKey(true);
    return true;
  }

  async function persistDraft(): Promise<{ settings: AppSettings; hasApiKey: boolean } | null> {
    const normalized: AppSettings = {
      ...draft,
      baseUrl:
        draft.provider === "openai"
          ? null
          : draft.provider === "minimax"
            ? (toNullableText(draft.baseUrl ?? "") ?? MINIMAX_BASE_URL)
            : toNullableText(draft.baseUrl ?? ""),
    };
    const settingsError = validateSettings(normalized, language);

    if (settingsError) {
      setError(settingsError);
      return null;
    }

    try {
      await saveSettings(normalized);
      const nextHasApiKey = await persistApiKeyDraft();
      if (customHeadersDraft.trim().length > 0) {
        JSON.parse(customHeadersDraft);
        await saveSecret(SECRET_CUSTOM_HEADERS, customHeadersDraft);
      }
      setDraft(normalized);
      return { settings: normalized, hasApiKey: nextHasApiKey };
    } catch (saveError) {
      setError(
        saveError instanceof SyntaxError
          ? t(language, "customHeadersValidJson")
          : normalizeError(saveError).message,
      );
      return null;
    }
  }

  async function testConnection() {
    setIsTesting(true);
    setError(null);
    const saved = await persistDraft();

    if (!saved) {
      setIsTesting(false);
      return;
    }

    try {
      const response = await testProviderConnection();
      setStatus(response.message);
    } catch (testError) {
      setError(normalizeError(testError).message);
      setStatus(t(language, "providerConnectionLater"));
    } finally {
      setIsTesting(false);
    }
  }

  async function saveCustomHeaders() {
    setError(null);
    try {
      if (customHeadersDraft.trim().length > 0) {
        JSON.parse(customHeadersDraft);
      }
      await saveSecret(SECRET_CUSTOM_HEADERS, customHeadersDraft);
      setCustomHeadersDraft("");
      setStatus(t(language, "customHeadersSaved"));
    } catch (headersError) {
      setError(
        headersError instanceof SyntaxError
          ? t(language, "customHeadersValidJson")
          : normalizeError(headersError).message,
      );
    }
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
      setHasSavedApiKey(false);
      setStatus(t(language, "apiKeyCleared"));
    } catch (secretError) {
      setError(normalizeError(secretError).message);
    }
  }

  async function testShortcut() {
    setError(null);
    try {
      await registerUserHotkey(draft.hotkey);
      setStatus(t(language, "shortcutRegistered"));
    } catch (shortcutError) {
      setError(normalizeError(shortcutError).message);
    }
  }

  async function finish() {
    const saved = await persistDraft();
    if (saved) {
      onFinish(saved.settings, saved.hasApiKey);
    }
  }

  return (
    <main className="onboarding-shell">
      <header className="topbar">
        <div>
          <h1>{draft.appName}</h1>
          <p className="muted">{t(language, "quickWritingHelper")}</p>
        </div>
      </header>

      <ErrorBanner message={error} />
      {status ? <div className="status-banner">{status}</div> : null}

      <section className="settings-section">
        <h2>{t(language, "general")}</h2>
        <div className="settings-grid">
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
        </div>
      </section>

      <section className="settings-section">
        <h2>{t(language, "provider")}</h2>
        <ProviderForm
          apiKeyDraft={apiKeyDraft}
          customHeadersDraft={customHeadersDraft}
          hasApiKey={hasSavedApiKey}
          isTesting={isTesting}
          onApiKeyDraftChange={setApiKeyDraft}
          onClearApiKey={() => void clearApiKey()}
          onCustomHeadersDraftChange={setCustomHeadersDraft}
          onSaveApiKey={() => void saveApiKey()}
          onSaveCustomHeaders={() => void saveCustomHeaders()}
          onSettingsChange={setDraft}
          onTestConnection={() => void testConnection()}
          settings={draft}
        />
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

      <footer className="settings-footer">
        <button disabled={isTesting} onClick={() => void testConnection()} type="button">
          {isTesting ? t(language, "testing") : t(language, "testConnection")}
        </button>
        <button onClick={() => void finish()} type="button">
          {t(language, "finish")}
        </button>
      </footer>
    </main>
  );
}
