import { PROVIDERS, type Copy } from "./copy";
import { ChevronIcon, LockIcon } from "./icons";

export function SetupSection({ copy }: { copy: Copy }) {
  const setup = copy.setup;

  return (
    <section aria-labelledby="setup-title" className="setup section-ink" id="proveedor">
      <div className="setup-grid">
        <div className="setup-copy" data-reveal>
          <p className="kicker">{setup.kicker}</p>
          <h2 className="h2" id="setup-title">
            {setup.title} <em>{setup.titleAccent}</em>
          </h2>
          <p className="lead">{setup.body}</p>
          <ol className="setup-steps">
            {setup.steps.map(([before, strong, after], index) => (
              <li key={strong}>
                <span aria-hidden="true">{index + 1}</span>
                <p>
                  {before}
                  <strong>{strong}</strong>
                  {after}
                </p>
              </li>
            ))}
          </ol>
          <p className="mini-label">{setup.providersLabel}</p>
          <ul className="providers">
            {PROVIDERS.map((provider) => (
              <li key={provider}>{provider}</li>
            ))}
          </ul>
          <p className="secure">
            <LockIcon />
            <span>{setup.secure}</span>
          </p>
        </div>

        <div aria-hidden="true" className="fake" data-reveal>
          <div className="win-bar">
            <span className="win-dots">
              <i />
              <i />
              <i />
            </span>
            <span>{setup.window}</span>
          </div>
          <div className="fake-body">
            <div className="fake-side">
              {setup.sections.map((section, index) => (
                <span className={index === 4 ? "is-active" : ""} key={section}>
                  {section}
                </span>
              ))}
            </div>
            <div className="fake-main">
              <h3>{setup.pane}</h3>
              <div className="fake-field">
                <span className="fake-label">{setup.fields.provider}</span>
                <div className="fake-input">
                  OpenRouter
                  <ChevronIcon />
                </div>
              </div>
              <div className="fake-field">
                <span className="fake-label">{setup.fields.model}</span>
                <div className="fake-input mono">openrouter/auto</div>
              </div>
              <div className="fake-field">
                <span className="fake-label">{setup.fields.key}</span>
                <div className="fake-input mono">
                  <span className="fake-key">sk-or-v1-••••••••••••••••</span>
                </div>
                <span className="fake-keyring">
                  <LockIcon />
                  {setup.keyring}
                </span>
              </div>
              <div className="fake-actions">
                <span className="fake-button">{setup.test}</span>
                <span className="fake-status">
                  <i>✓</i>
                  {setup.ok} · 412 ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SettingsSection({ copy }: { copy: Copy }) {
  const settings = copy.settings;

  return (
    <section aria-labelledby="settings-title" className="settings" id="configuracion">
      <h2 className="kicker section-label" id="settings-title">
        {settings.title}
      </h2>
      <ol className="index" data-reveal>
        {settings.items.map((item, index) => (
          <li key={item.label}>
            <span className="index-num">0{index + 1}</span>
            <h3>{item.label}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PrinciplesSection({ copy }: { copy: Copy }) {
  const principles = copy.principles;

  return (
    <section aria-labelledby="principles-title" className="principles section-ink" id="privacidad">
      <div className="section-head" data-reveal>
        <p className="kicker">{principles.kicker}</p>
        <h2 className="h2 h2-sm" id="principles-title">
          {principles.title}
        </h2>
      </div>
      <ul className="stats" data-reveal>
        {principles.stats.map((stat, index) => (
          <li className="stat" key={stat.label} style={{ "--i": index }}>
            <span aria-hidden="true" className="stat-value">
              <span>{stat.value}</span>
            </span>
            <span className="stat-label">
              <span className="sr-only">{stat.value} </span>
              {stat.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
