import { WRITING_ACTIONS } from "../lib/settings";
import type { WritingAction } from "../types/llm";

type ActionSelectorProps = {
  value: WritingAction;
  onChange: (value: WritingAction) => void;
  disabled?: boolean;
};

export function ActionSelector({ value, onChange, disabled = false }: ActionSelectorProps) {
  return (
    <div className="segmented-control" role="radiogroup" aria-label="Writing action">
      {WRITING_ACTIONS.map((action) => (
        <button
          aria-checked={value === action.value}
          className="segment-button"
          disabled={disabled}
          key={action.value}
          onClick={() => onChange(action.value)}
          role="radio"
          type="button"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
