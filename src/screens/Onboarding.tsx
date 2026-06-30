import { useEffect, useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { ProviderForm } from "../components/ProviderForm";
import { ShortcutRecorder } from "../components/ShortcutRecorder";
import {
  FALLBACK_SETTINGS,
  SECRET_CUSTOM_HEADERS,
  SECRET_PROVIDER_API_KEY,
} from "../lib/settings";
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
      throw new Error("API key could not be read from secure storage after saving.");
    }

    setApiKeyDraft("");
    setHasSavedApiKey(true);
    return true;
  }

  async function persistDraft(): Promise<{ settings: AppSettings; hasApiKey: boolean } | null> {
    const normalized: AppSettings = {
      ...draft,
      baseUrl: draft.provider === "openai" ? null : toNullableText(draft.baseUrl ?? ""),
    };
    const settingsError = validateSettings(normalized);

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
          ? "Custom headers must be valid JSON."
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
      setStatus("You can continue and fix the provider later.");
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
      setStatus("Custom headers saved.");
    } catch (headersError) {
      setError(
        headersError instanceof SyntaxError
          ? "Custom headers must be valid JSON."
          : normalizeError(headersError).message,
      );
    }
  }

  async function saveApiKey() {
    setError(null);
    try {
      await persistApiKeyDraft();
      setStatus("API key saved.");
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
      setStatus("API key cleared.");
    } catch (secretError) {
      setError(normalizeError(secretError).message);
    }
  }

  async function testShortcut() {
    setError(null);
    try {
      await registerUserHotkey(draft.hotkey);
      setStatus("Shortcut registered.");
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
          <p className="muted">Quick writing helper</p>
        </div>
      </header>

      <ErrorBanner message={error} />
      {status ? <div className="status-banner">{status}</div> : null}

      <section className="settings-section">
        <h2>Provider</h2>
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
        <h2>Shortcut</h2>
        <ShortcutRecorder
          onChange={(hotkey) => setDraft({ ...draft, hotkey })}
          onReset={() => setDraft({ ...draft, hotkey: FALLBACK_SETTINGS.hotkey })}
          onTest={() => void testShortcut()}
          value={draft.hotkey}
        />
      </section>

      <footer className="settings-footer">
        <button disabled={isTesting} onClick={() => void testConnection()} type="button">
          {isTesting ? "Testing" : "Test connection"}
        </button>
        <button onClick={() => void finish()} type="button">
          Finish
        </button>
      </footer>
    </main>
  );
}
