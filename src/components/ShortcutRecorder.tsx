import { useEffect, useRef, useState } from "react";
import { hotkeyFromKeyboardEvent, isLikelyHotkey } from "../lib/hotkeys";
import { t } from "../lib/i18n";
import type { AppLanguage } from "../types/app";

type ShortcutRecorderProps = {
  value: string;
  language?: AppLanguage;
  onChange: (value: string) => void;
  onTest: () => void;
  onReset: () => void;
};

export function ShortcutRecorder({
  value,
  language = "en",
  onChange,
  onTest,
  onReset,
}: ShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [candidate, setCandidate] = useState("");
  const captureRef = useRef<HTMLDivElement>(null);
  const isValid = isLikelyHotkey(candidate);

  useEffect(() => {
    if (isRecording) captureRef.current?.focus();
  }, [isRecording]);

  function closeRecorder() {
    setIsRecording(false);
    setCandidate("");
  }

  function captureShortcut(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeRecorder();
      return;
    }
    if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.repeat) return;

    const hotkey = hotkeyFromKeyboardEvent(event.nativeEvent);
    if (hotkey) setCandidate(hotkey);
  }

  function confirmShortcut() {
    if (!isValid) return;
    onChange(candidate);
    closeRecorder();
  }

  return (
    <div className="shortcut-recorder">
      <label>
        {t(language, "currentShortcut")}
        <input readOnly value={value} />
      </label>
      <div className="button-row">
        <button onClick={() => setIsRecording(true)} type="button">
          {t(language, "changeShortcut")}
        </button>
        <button disabled={!isLikelyHotkey(value)} onClick={onTest} type="button">
          {t(language, "testShortcut")}
        </button>
        <button onClick={onReset} type="button">
          {t(language, "resetShortcut")}
        </button>
      </div>

      {isRecording ? (
        <div
          className="shortcut-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeRecorder();
          }}
        >
          <div
            aria-describedby="shortcut-capture-help"
            aria-labelledby="shortcut-dialog-title"
            aria-modal="true"
            className="shortcut-dialog"
            role="dialog"
          >
            <div className="shortcut-dialog-heading">
              <h2 id="shortcut-dialog-title">{t(language, "shortcutDialogTitle")}</h2>
              <p className="muted" id="shortcut-capture-help">
                {t(language, "shortcutCaptureHint")}
              </p>
            </div>

            <div
              aria-label={t(language, "shortcutCaptureHint")}
              className="shortcut-capture-area"
              onKeyDown={captureShortcut}
              ref={captureRef}
              tabIndex={0}
            >
              {candidate ? (
                <div className="shortcut-keys" aria-live="polite">
                  {candidate.split("+").map((part) => (
                    <kbd key={part}>{part}</kbd>
                  ))}
                </div>
              ) : (
                <span>{t(language, "shortcutCapturePlaceholder")}</span>
              )}
            </div>

            <p className="shortcut-requirement">{t(language, "shortcutNeedsModifier")}</p>
            <div className="button-row shortcut-dialog-actions">
              <button onClick={closeRecorder} type="button">
                {t(language, "cancel")}
              </button>
              <button disabled={!isValid} onClick={confirmShortcut} type="button">
                {t(language, "useShortcut")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
