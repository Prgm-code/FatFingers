import { t } from "../lib/i18n";
import type { AppLanguage } from "../types/app";

type TrayHintProps = {
  language?: AppLanguage;
};

export function TrayHint({ language = "en" }: TrayHintProps) {
  return (
    <p className="muted">
      {t(language, "trayHint")}
    </p>
  );
}
