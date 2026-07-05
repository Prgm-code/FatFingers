import { t } from "../lib/i18n";
import type { AppLanguage } from "../types/app";

type SettingsButtonProps = {
  onClick: () => void;
  language?: AppLanguage;
};

export function SettingsButton({ onClick, language = "en" }: SettingsButtonProps) {
  const label = t(language, "openSettings");

  return (
    <button
      aria-label={label}
      className="icon-button"
      onClick={onClick}
      title={label}
      type="button"
    >
      <span aria-hidden="true">⚙</span>
    </button>
  );
}
