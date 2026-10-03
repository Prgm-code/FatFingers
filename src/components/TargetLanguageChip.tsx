import { formatMessage, targetLanguageLabel } from "../lib/i18n";
import type { AppLanguage } from "../types/app";
import type { TargetLanguage } from "../types/llm";

type TargetLanguageChipProps = {
  value: TargetLanguage;
  onCycle: () => void;
  shortcutLabel: string;
  disabled?: boolean;
  language?: AppLanguage;
};

const CHIP_TEXT: Record<TargetLanguage, string> = {
  original: "Aa",
  en: "→ EN",
  es: "→ ES",
};

export function TargetLanguageChip({
  value,
  onCycle,
  shortcutLabel,
  disabled = false,
  language = "en",
}: TargetLanguageChipProps) {
  const label = formatMessage(language, "targetLanguageLabel", {
    language: targetLanguageLabel(language, value),
  });

  return (
    <button
      aria-label={label}
      aria-pressed={value !== "original"}
      className="target-language-chip"
      disabled={disabled}
      onClick={onCycle}
      title={`${label} (${shortcutLabel})`}
      type="button"
    >
      {CHIP_TEXT[value]}
    </button>
  );
}
