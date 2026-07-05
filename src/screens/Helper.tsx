import { useEffect, useRef, useState } from "react";
import { ActionSelector } from "../components/ActionSelector";
import { ErrorBanner } from "../components/ErrorBanner";
import { SettingsButton } from "../components/SettingsButton";
import {
  MINIMAX_BASE_URL,
  OPENAI_RESPONSES_URL,
  OPENROUTER_CHAT_COMPLETIONS_URL,
  WRITING_ACTIONS,
} from "../lib/settings";
import { formatMessage, t } from "../lib/i18n";
import { validateInput } from "../lib/validators";
import type { AppSettings, PasteBackOutcome } from "../types/app";
import type { CorrectTextResponse, WritingAction } from "../types/llm";

type HelperPhase = "compose" | "improving" | "review";

type HelperProps = {
  settings: AppSettings;
  sessionId: number;
  onRun: (input: string, action: WritingAction) => Promise<CorrectTextResponse>;
  onCopy: (text: string) => Promise<void>;
  onPaste: (text: string) => Promise<PasteBackOutcome>;
  onClose: () => void;
  onOpenSettings: () => void;
};

const NOTICE_CLOSE_DELAY_MS = 1200;

const isMac = navigator.platform.toLowerCase().includes("mac");
const MOD_LABEL = isMac ? "⌘" : "Ctrl";
const PASTE_SHORTCUT_LABEL = isMac ? "⌘V" : "Ctrl+V";

export function Helper({
  settings,
  sessionId,
  onRun,
  onCopy,
  onPaste,
  onClose,
  onOpenSettings,
}: HelperProps) {
  const [input, setInput] = useState("");
  const [action, setAction] = useState<WritingAction>(settings.defaultAction);
  const [phase, setPhase] = useState<HelperPhase>("compose");
  const [previousInput, setPreviousInput] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastResponse, setLastResponse] = useState<{
    provider: string;
    model: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const language = settings.language;

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  useEffect(() => {
    textareaRef.current?.focus();
    return clearCloseTimer;
  }, []);

  useEffect(() => {
    clearCloseTimer();
    setInput("");
    setPhase("compose");
    setPreviousInput(null);
    setLatencyMs(null);
    setLastResponse(null);
    setError(null);
    setNotice(null);
    textareaRef.current?.focus();
  }, [sessionId]);

  useEffect(() => {
    setAction(settings.defaultAction);
  }, [settings.defaultAction]);

  useEffect(() => {
    setLastResponse(null);
  }, [settings.provider, settings.model]);

  const effectiveBaseUrl =
    settings.provider === "openai"
      ? OPENAI_RESPONSES_URL
      : settings.provider === "openrouter"
        ? OPENROUTER_CHAT_COMPLETIONS_URL
      : settings.provider === "minimax"
        ? (settings.baseUrl ?? MINIMAX_BASE_URL)
        : (settings.baseUrl ?? "not configured");
  const showDevDebug = import.meta.env.DEV && import.meta.env.MODE !== "test";

  async function runAction() {
    if (phase === "improving") {
      return;
    }

    const inputError = validateInput(input, language);
    if (inputError) {
      setError(inputError);
      return;
    }

    setError(null);
    setNotice(null);
    setPhase("improving");
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
      setPhase("review");

      if (settings.autoCopy) {
        await onCopy(response.outputText);
        if (settings.autoCloseAfterCopy) {
          onClose();
        }
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : t(language, "actionFailed"));
      setPhase(previousInput !== null ? "review" : "compose");
    }
  }

  function scheduleNoticeClose() {
    setNotice(
      formatMessage(language, "copiedPressPaste", { shortcut: PASTE_SHORTCUT_LABEL }),
    );
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, NOTICE_CLOSE_DELAY_MS);
  }

  // Second Enter: paste into the previously focused app when enabled, or copy
  // to the clipboard. The confirmed text is whatever is in the textarea,
  // including manual edits made during review.
  async function confirmResult() {
    if (!input) {
      return;
    }

    try {
      if (settings.pasteBehavior === "auto_paste") {
        const outcome = await onPaste(input);
        if (outcome.method === "simulated") {
          // The backend already hid the helper; the next session resets state.
          return;
        }
        scheduleNoticeClose();
        return;
      }

      await onCopy(input);
      scheduleNoticeClose();
    } catch (confirmError) {
      setError(
        confirmError instanceof Error ? confirmError.message : t(language, "pasteFailed"),
      );
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

  function undo() {
    if (previousInput === null) {
      return;
    }

    setInput(previousInput);
    setPreviousInput(null);
    setLatencyMs(null);
    setError(null);
    setNotice(null);
    setPhase("compose");
    textareaRef.current?.focus();
  }

  function startNew() {
    clearCloseTimer();
    setInput("");
    setPreviousInput(null);
    setLatencyMs(null);
    setError(null);
    setNotice(null);
    setPhase("compose");
    textareaRef.current?.focus();
  }

  function cycleAction(direction: 1 | -1) {
    const index = WRITING_ACTIONS.findIndex((entry) => entry.value === action);
    const nextIndex =
      (index + direction + WRITING_ACTIONS.length) % WRITING_ACTIONS.length;
    setAction(WRITING_ACTIONS[nextIndex].value);
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
      if (phase === "review" && !command) {
        void confirmResult();
        return;
      }
      void runAction();
      return;
    }

    if (event.key === "Tab" && !command && !event.altKey) {
      event.preventDefault();
      cycleAction(event.shiftKey ? -1 : 1);
      return;
    }

    if (
      command &&
      !event.shiftKey &&
      event.key >= "1" &&
      event.key <= String(WRITING_ACTIONS.length)
    ) {
      event.preventDefault();
      setAction(WRITING_ACTIONS[Number(event.key) - 1].value);
      return;
    }

    if (command && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      void copyInput();
      return;
    }

    if (command && event.key.toLowerCase() === "z" && phase === "review") {
      event.preventDefault();
      undo();
      return;
    }

    if (command && event.key.toLowerCase() === "n") {
      event.preventDefault();
      startNew();
      return;
    }

    if (command && event.key === ",") {
      event.preventDefault();
      onOpenSettings();
    }
  }

  const confirmHint =
    settings.pasteBehavior === "auto_paste"
      ? t(language, "hintPaste")
      : t(language, "hintCopyClose");

  return (
    <main className="helper-shell" onKeyDown={handleKeyDown}>
      <section
        aria-label={t(language, "floatingEditor")}
        className="helper-card"
        data-phase={phase}
      >
        <div className="helper-drag" data-tauri-drag-region="" />
        <button
          aria-label={t(language, "close")}
          className="helper-close"
          onClick={onClose}
          title={t(language, "close")}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
        <ErrorBanner message={error} />
        {notice ? (
          <p className="helper-notice" role="status">
            {notice}
          </p>
        ) : null}
        <textarea
          aria-label={t(language, "writeOrPasteText")}
          className="input-editor"
          onChange={(event) => setInput(event.currentTarget.value)}
          placeholder={t(language, "writeOrPasteText")}
          ref={textareaRef}
          value={input}
        />
        <footer className="status-line">
          <ActionSelector
            disabled={phase === "improving"}
            language={language}
            onChange={setAction}
            value={action}
          />
          <div className="status-hints">
            {phase === "improving" ? (
              <span className="loading-state">
                <span className="loading-dot" />
                {t(language, "working")}…
              </span>
            ) : phase === "review" ? (
              <>
                {latencyMs ? <span className="muted">{latencyMs} ms</span> : null}
                <span className="hint">
                  <kbd>↵</kbd> {confirmHint}
                </span>
                <span className="hint">
                  <kbd>{MOD_LABEL}↵</kbd> {t(language, "hintAgain")}
                </span>
                <span className="hint">
                  <kbd>{MOD_LABEL}Z</kbd> {t(language, "undo")}
                </span>
              </>
            ) : (
              <>
                {input ? (
                  <span className="muted">
                    {input.length} {t(language, "chars")}
                  </span>
                ) : null}
                <span className="hint">
                  <kbd>↵</kbd> {t(language, "hintImprove")}
                </span>
                <span className="hint">
                  <kbd>Esc</kbd> {t(language, "close")}
                </span>
              </>
            )}
            <SettingsButton language={language} onClick={onOpenSettings} />
          </div>
        </footer>
        {showDevDebug ? (
          <p className="dev-debug" data-testid="dev-debug">
            dev request: provider={settings.provider} model={settings.model} baseUrl=
            {effectiveBaseUrl}
            {lastResponse
              ? ` · last response: ${lastResponse.provider} · ${lastResponse.model}`
              : ""}
          </p>
        ) : null}
      </section>
    </main>
  );
}
