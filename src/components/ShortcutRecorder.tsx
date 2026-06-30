import { useEffect, useState } from "react";
import { isLikelyHotkey, normalizeHotkey } from "../lib/hotkeys";
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
  const [draft, setDraft] = useState(value);
  const isValid = isLikelyHotkey(draft);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="shortcut-recorder">
      <label>
        {t(language, "currentShortcut")}
        <input
          onBlur={() => {
            const normalized = normalizeHotkey(draft);
            setDraft(normalized);
            onChange(normalized);
          }}
          onChange={(event) => setDraft(event.currentTarget.value)}
          value={draft}
        />
      </label>
      <div className="button-row">
        <button
          disabled={!isValid}
          onClick={() => onChange(normalizeHotkey(draft))}
          type="button"
        >
          {t(language, "changeShortcut")}
        </button>
        <button disabled={!isValid} onClick={onTest} type="button">
          {t(language, "testShortcut")}
        </button>
        <button onClick={onReset} type="button">
          {t(language, "resetShortcut")}
        </button>
      </div>
    </div>
  );
}
