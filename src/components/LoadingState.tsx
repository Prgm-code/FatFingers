import { t } from "../lib/i18n";
import type { AppLanguage } from "../types/app";

type LoadingStateProps = {
  label?: string;
  language?: AppLanguage;
};

export function LoadingState({ label, language = "en" }: LoadingStateProps) {
  return (
    <div className="loading-state" aria-live="polite">
      <span className="loading-dot" />
      {label ?? t(language, "generating")}
    </div>
  );
}
