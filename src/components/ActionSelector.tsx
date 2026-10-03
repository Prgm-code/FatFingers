import { EXTENDED_WRITING_ACTIONS, WRITING_ACTIONS } from "../lib/settings";
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
  // A default action outside the quick list (e.g. custom) must still be shown.
  const options = WRITING_ACTIONS.some((action) => action.value === value)
    ? WRITING_ACTIONS
    : [...WRITING_ACTIONS, ...EXTENDED_WRITING_ACTIONS.filter((action) => action.value === value)];

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
      {options.map((action) => (
        <option key={action.value} value={action.value}>
          {writingActionLabel(language, action.value)}
        </option>
      ))}
      </select>
    </label>
  );
}
