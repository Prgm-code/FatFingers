import { useState } from "react";
import { ErrorBanner } from "../components/ErrorBanner";
import { ProviderForm } from "../components/ProviderForm";
import { ShortcutRecorder } from "../components/ShortcutRecorder";
import {
  EXTENDED_WRITING_ACTIONS,
  FALLBACK_SETTINGS,
  SECRET_CUSTOM_HEADERS,
  SECRET_PROVIDER_API_KEY,
  WRITING_MODES,
} from "../lib/settings";
import {
  clearAllLocalData,
  clearLocalHistory,
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

  async function persistSettings(nextSettings = draft): Promise<AppSettings | null> {
    const normalized: AppSettings = {
      ...nextSettings,
      baseUrl:
        nextSettings.provider === "openai" ? null : toNullableText(nextSettings.baseUrl ?? ""),
    };
    const settingsError = validateSettings(normalized);

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
      setStatus("Settings saved.");
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
      throw new Error("API key could not be read from secure storage after saving.");
    }

    setApiKeyDraft("");
    onApiKeyChanged(true);
    return true;
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
      onApiKeyChanged(false);
      setStatus("API key cleared.");
    } catch (secretError) {
      setError(normalizeError(secretError).message);
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
      await registerUserHotkey(draft.hotkey);
      setStatus("Shortcut registered.");
    } catch (shortcutError) {
      setError(normalizeError(shortcutError).message);
    }
  }

  return (
    <main className="settings-shell">
      <header className="topbar">
        <div>
          <h1>Settings</h1>
          <p className="muted">{draft.appName}</p>
        </div>
        <button onClick={onBack} type="button">
          Back
        </button>
      </header>

      <ErrorBanner message={error} />
      {status ? <div className="status-banner">{status}</div> : null}

      <section className="settings-section">
        <h2>General</h2>
        <div className="settings-grid">
          <label className="checkbox-row">
            <input
              checked={draft.launchAtLogin}
              onChange={(event) =>
                setDraft({ ...draft, launchAtLogin: event.currentTarget.checked })
              }
              type="checkbox"
            />
            Launch at login
          </label>
          <label>
            Default action
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
                  {action.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Default language behavior
            <select disabled value="preserve">
              <option value="preserve">Preserve input language</option>
            </select>
          </label>
          <label className="checkbox-row">
            <input
              checked={draft.autoCopy}
              onChange={(event) => setDraft({ ...draft, autoCopy: event.currentTarget.checked })}
              type="checkbox"
            />
            Auto-copy result after generation
          </label>
          <label className="checkbox-row">
            <input
              checked={draft.autoCloseAfterCopy}
              onChange={(event) =>
                setDraft({ ...draft, autoCloseAfterCopy: event.currentTarget.checked })
              }
              type="checkbox"
            />
            Close window after copy
          </label>
          <label>
            Theme
            <select
              onChange={(event) =>
                setDraft({ ...draft, theme: event.currentTarget.value as AppSettings["theme"] })
              }
              value={draft.theme}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
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

      <section className="settings-section">
        <h2>AI Provider</h2>
        <ProviderForm
          apiKeyDraft={apiKeyDraft}
          customHeadersDraft={customHeadersDraft}
          hasApiKey={hasApiKey}
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
        <h2>Writing Behavior</h2>
        <div className="settings-grid">
          <label>
            Correction mode
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
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Formality level
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
            Creativity level
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
            Temperature
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
            Max output tokens
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
            Timeout seconds
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
        <h2>Privacy</h2>
        <p className="privacy-note">Your text is sent only to the AI provider you configure.</p>
        <div className="settings-grid">
          <label className="checkbox-row">
            <input
              checked={draft.storeHistory}
              onChange={(event) =>
                setDraft({ ...draft, storeHistory: event.currentTarget.checked })
              }
              type="checkbox"
            />
            Store history locally
          </label>
          <label className="checkbox-row">
            <input checked={false} disabled type="checkbox" />
            Optional telemetry
          </label>
          <div className="button-row">
            <button
              onClick={async () => {
                try {
                  await clearLocalHistory();
                  setStatus("Local history cleared.");
                } catch (historyError) {
                  setError(normalizeError(historyError).message);
                }
              }}
              type="button"
            >
              Clear local history
            </button>
            <button onClick={() => void clearApiKey()} type="button">
              Clear API key
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
              Clear all local data
            </button>
          </div>
        </div>
      </section>

      <footer className="settings-footer">
        <button disabled={isSaving} onClick={() => void persistSettings()} type="button">
          {isSaving ? "Saving" : "Save settings"}
        </button>
      </footer>
    </main>
  );
}
