import { useEffect, useRef, useState } from "react";
import { ActionSelector } from "../components/ActionSelector";
import { ErrorBanner } from "../components/ErrorBanner";
import { ResultPanel } from "../components/ResultPanel";
import { SettingsButton } from "../components/SettingsButton";
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
  const [result, setResult] = useState("");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    setAction(settings.defaultAction);
  }, [settings.defaultAction]);

  async function runAction() {
    const inputError = validateInput(input);
    if (inputError) {
      setError(inputError);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await onRun(input, action);
      setResult(response.outputText);
      setLatencyMs(response.latencyMs);

      if (settings.autoCopy) {
        await onCopy(response.outputText);
        if (settings.autoCloseAfterCopy) {
          onClose();
        }
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "The action failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyResult() {
    if (!result) {
      return;
    }

    try {
      await onCopy(result);
      if (settings.autoCloseAfterCopy) {
        onClose();
      }
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Clipboard is unavailable.");
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    const command = event.metaKey || event.ctrlKey;

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (command && event.key === "Enter") {
      event.preventDefault();
      void runAction();
      return;
    }

    if (command && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      void copyResult();
      return;
    }

    if (command && event.key.toLowerCase() === "n") {
      event.preventDefault();
      setInput("");
      setResult("");
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
        </div>
        <SettingsButton onClick={onOpenSettings} />
      </header>

      <ErrorBanner message={error} />

      <section className="editor-section" aria-label="Floating editor">
        <div className="panel-header">
          <h2>Input</h2>
          <span className="muted">{input.length} chars</span>
        </div>
        <textarea
          aria-label="Text to rewrite"
          className="input-editor"
          onChange={(event) => setInput(event.currentTarget.value)}
          placeholder="Write or paste text"
          ref={textareaRef}
          value={input}
        />
        <div className="helper-controls">
          <ActionSelector disabled={isLoading} onChange={setAction} value={action} />
          <button disabled={isLoading} onClick={() => void runAction()} type="button">
            {isLoading ? "Working" : "Run"}
          </button>
        </div>
      </section>

      <ResultPanel
        isLoading={isLoading}
        latencyMs={latencyMs}
        onClose={onClose}
        onCopy={() => void copyResult()}
        onNew={() => {
          setInput("");
          setResult("");
          setLatencyMs(null);
          setError(null);
          textareaRef.current?.focus();
        }}
        onReplaceInput={() => {
          setInput(result);
          textareaRef.current?.focus();
        }}
        onTryAgain={() => void runAction()}
        result={result}
      />
    </main>
  );
}
