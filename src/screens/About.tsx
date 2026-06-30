import type { AppSettings } from "../types/app";

type AboutProps = {
  settings: AppSettings;
  onBack: () => void;
};

export function About({ settings, onBack }: AboutProps) {
  return (
    <main className="settings-shell">
      <header className="topbar">
        <div>
          <h1>About</h1>
          <p className="muted">{settings.appName}</p>
        </div>
        <button onClick={onBack} type="button">
          Back
        </button>
      </header>
      <section className="settings-section">
        <h2>Privacy</h2>
        <p className="privacy-note">Your text is sent only to the AI provider you configure.</p>
      </section>
    </main>
  );
}
