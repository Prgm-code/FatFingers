import { t } from "../lib/i18n";
import type { AppSettings } from "../types/app";

type AboutProps = {
  settings: AppSettings;
  onBack: () => void;
};

export function About({ settings, onBack }: AboutProps) {
  const language = settings.language;

  return (
    <main className="settings-shell">
      <header className="topbar">
        <div>
          <h1>{t(language, "about")}</h1>
          <p className="muted">{settings.appName}</p>
        </div>
        <button onClick={onBack} type="button">
          {t(language, "back")}
        </button>
      </header>
      <section className="settings-section">
        <h2>{t(language, "privacy")}</h2>
        <p className="privacy-note">{t(language, "privacyNotice")}</p>
      </section>
    </main>
  );
}
