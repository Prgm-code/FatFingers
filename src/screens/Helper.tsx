import { useEffect, useRef, useState } from "react";
import { ActionSelector } from "../components/ActionSelector";
import { ErrorBanner } from "../components/ErrorBanner";
import { SettingsButton } from "../components/SettingsButton";
import { MINIMAX_BASE_URL, OPENAI_RESPONSES_URL } from "../lib/settings";
import { t } from "../lib/i18n";
import { validateInput } from "../lib/validators";
import type { AppSettings } from "../types/app";
import type { CorrectTextResponse, WritingAction } from "../types/llm";

type HelperProps = {
  settings: AppSettings;
  onRun: (input: string, action: WritingAction) => Promise<CorrectTextResponse>;
  onCopy: (text: string) => Promise<void>;
  onClose: () => void;
  onOpenSettings: () => void;
};

export function Helper({ settings, onRun, onCopy, onClose, onOpenSettings }: HelperProps) {
  const [input, setInput] = useState("");
  const [action, setAction] = useState<WritingAction>(settings.defaultAction);
  const [previousInput, setPreviousInput] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastResponse, setLastResponse] = useState<{
    provider: string;
    model: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const language = settings.language;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    setAction(settings.defaultAction);
  }, [settings.defaultAction]);

  useEffect(() => {
    setLastResponse(null);
  }, [settings.provider, settings.model]);

  const effectiveBaseUrl =
    settings.provider === "openai"
      ? OPENAI_RESPONSES_URL
      : settings.provider === "minimax"
        ? (settings.baseUrl ?? MINIMAX_BASE_URL)
        : (settings.baseUrl ?? "not configured");
  const showDevDebug = import.meta.env.DEV && import.meta.env.MODE !== "test";

  async function runAction() {
    const inputError = validateInput(input, language);
    if (inputError) {
      setError(inputError);
      return;
    }

    setError(null);
    setIsLoading(true);
    const originalInput = input;
    try {
      if (showDevDebug) {
        console.debug("[FatFingers] LLM request", {
          action,
          provider: settings.provider,
          model: settings.model,
          baseUrl: effectiveBaseUrl,
        });
      }

      const response = await onRun(input, action);
      if (showDevDebug) {
        console.debug("[FatFingers] LLM response", {
          provider: response.provider,
          model: response.model,
          latencyMs: response.latencyMs,
        });
      }

      setPreviousInput(originalInput);
      setInput(response.outputText);
      setLatencyMs(response.latencyMs);
      setLastResponse({ provider: response.provider, model: response.model });

      if (settings.autoCopy) {
        await onCopy(response.outputText);
        if (settings.autoCloseAfterCopy) {
          onClose();
        }
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : t(language, "actionFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  async function copyInput() {
    if (!input) {
      return;
    }

    try {
      await onCopy(input);
      if (settings.autoCloseAfterCopy) {
        onClose();
      }
    } catch (copyError) {
      setError(
        copyError instanceof Error ? copyError.message : t(language, "clipboardUnavailable"),
      );
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const command = event.metaKey || event.ctrlKey;

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void runAction();
      return;
    }

    if (command && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      void copyInput();
      return;
    }

    if (command && event.key.toLowerCase() === "n") {
      event.preventDefault();
      setInput("");
      setPreviousInput(null);
      setLatencyMs(null);
      setError(null);
      textareaRef.current?.focus();
      return;
    }

    if (command && event.key === ",") {
      event.preventDefault();
      onOpenSettings();
    }
  }

  return (
    <main className="helper-shell" onKeyDown={handleKeyDown}>
      <header className="topbar">
        <div>
          <h1>{settings.appName}</h1>
          <p className="muted">
            {settings.provider} · {settings.model}
          </p>
          {showDevDebug ? (
            <p className="dev-debug" data-testid="dev-debug">
              dev request: provider={settings.provider} model={settings.model} baseUrl=
              {effectiveBaseUrl}
              {lastResponse
                ? ` · last response: ${lastResponse.provider} · ${lastResponse.model}`
                : ""}
            </p>
          ) : null}
        </div>
        <SettingsButton language={language} onClick={onOpenSettings} />
      </header>

      <ErrorBanner message={error} />

      <section className="editor-section" aria-label={t(language, "floatingEditor")}>
        <div className="panel-header">
          <h2>{t(language, "input")}</h2>
          <span className="muted">
            {latencyMs ? `${latencyMs} ms · ` : null}
            {input.length} {t(language, "chars")}
          </span>
        </div>
        <textarea
          aria-label={t(language, "writeOrPasteText")}
          className="input-editor"
          onChange={(event) => setInput(event.currentTarget.value)}
          placeholder={t(language, "writeOrPasteText")}
          ref={textareaRef}
          value={input}
        />
        <div className="helper-controls">
          <ActionSelector
            disabled={isLoading}
            language={language}
            onChange={setAction}
            value={action}
          />
          {previousInput ? (
            <button
              disabled={isLoading}
              onClick={() => {
                setInput(previousInput);
                setPreviousInput(null);
                setLatencyMs(null);
                setError(null);
                textareaRef.current?.focus();
              }}
              type="button"
            >
              {t(language, "undo")}
            </button>
          ) : null}
          <button disabled={!input || isLoading} onClick={() => void copyInput()} type="button">
            {t(language, "copy")}
          </button>
          <button disabled={isLoading} onClick={() => void runAction()} type="button">
            {isLoading ? t(language, "working") : t(language, "run")}
          </button>
        </div>
      </section>
    </main>
  );
}
