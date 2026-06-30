import { WRITING_ACTIONS } from "../lib/settings";
import { t, writingActionLabel } from "../lib/i18n";
import type { AppLanguage } from "../types/app";
import type { WritingAction } from "../types/llm";

type ActionSelectorProps = {
  value: WritingAction;
  onChange: (value: WritingAction) => void;
  disabled?: boolean;
  language?: AppLanguage;
};

export function ActionSelector({
  value,
  onChange,
  disabled = false,
  language = "en",
}: ActionSelectorProps) {
  return (
    <label className="action-select-label">
      <span className="visually-hidden">{t(language, "writingAction")}</span>
      <select
        aria-label={t(language, "writingAction")}
        className="action-select"
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value as WritingAction)}
        value={value}
      >
      {WRITING_ACTIONS.map((action) => (
        <option key={action.value} value={action.value}>
          {writingActionLabel(language, action.value)}
        </option>
      ))}
      </select>
    </label>
  );
}
