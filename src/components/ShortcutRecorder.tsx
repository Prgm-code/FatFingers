import { useEffect, useState } from "react";
import { isLikelyHotkey, normalizeHotkey } from "../lib/hotkeys";

type ShortcutRecorderProps = {
  value: string;
  onChange: (value: string) => void;
  onTest: () => void;
  onReset: () => void;
};

export function ShortcutRecorder({
  value,
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
        Current shortcut
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
          Change shortcut
        </button>
        <button disabled={!isValid} onClick={onTest} type="button">
          Test shortcut
        </button>
        <button onClick={onReset} type="button">
          Reset shortcut
        </button>
      </div>
    </div>
  );
}
