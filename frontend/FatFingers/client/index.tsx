import { useEffect, useState } from "preact/hooks";
import { COPY, TICKER, type AssetKind, type Copy, type Language } from "./copy";
import { Headline } from "./Headline";
import { HeroScene } from "./HeroScene";
import { IS_MAC, installHead, useReducedMotion, useReveal, useScrolled } from "./hooks";
import { HowSection } from "./How";
import { ArrowRightIcon, ArrowUpRightIcon, DownloadIcon, GitHubIcon } from "./icons";
import { Combo } from "./Keycap";
import { Playground } from "./Playground";
import {
  ASSET_GROUPS,
  CHANGELOG_URL,
  LICENSE_URL,
  RELEASE_BADGE_URL,
  RELEASES_URL,
  REPO_URL,
  detectPlatform,
  resolveRelease,
  type Platform,
  type ResolvedRelease,
} from "./release";
import { PrinciplesSection, SettingsSection, SetupSection } from "./sections";
import { styles } from "./styles";

installHead();

type DownloadState = { status: "loading" | "ready" | "error"; release: ResolvedRelease | null };

type DownloadView = {
  platform: Platform;
  release: ResolvedRelease | null;
  url: string;
  label: string;
  detail: string;
};

function detectLanguage(): Language {
  const saved = window.localStorage.getItem("fatfingers-language");
  if (saved === "es" || saved === "en") return saved;
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  return preferences.some((language) => language.toLowerCase().startsWith("es")) ? "es" : "en";
}

function setMeta(name: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function useDownload(platform: Platform): DownloadState {
  const [state, setState] = useState<DownloadState>({ status: "loading", release: null });

  useEffect(() => {
    let active = true;
    resolveRelease(platform).then(
      (release) => {
        if (active) setState({ status: "ready", release });
      },
      () => {
        if (active) setState({ status: "error", release: null });
      },
    );
    return () => {
      active = false;
    };
  }, [platform]);

  return state;
}

function downloadView(copy: Copy, platform: Platform, state: DownloadState): DownloadView {
  const release = state.release;
  const primary = release?.primary ?? null;
  const directUrl = primary ? release?.links[primary] : undefined;
  const label = platform === "unknown" ? copy.hero.seeDownloads : `${copy.hero.downloadFor} ${copy.platforms[platform]}`;
  let detail = `${copy.release.latest} · ${copy.release.fallback}`;
  if (state.status === "loading") detail = copy.release.loading;
  else if (release) detail = `${release.version} · ${primary ? copy.kinds[primary].detail : copy.release.fallback}`;

  return {
    platform,
    release,
    url: directUrl ?? release?.pageUrl ?? RELEASES_URL,
    label,
    detail,
  };
}

export function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [platform] = useState<Platform>(detectPlatform);
  const copy = COPY[language];
  const reduceMotion = useReducedMotion();
  const scrolled = useScrolled();
  const downloadState = useDownload(platform);
  const download = downloadView(copy, platform, downloadState);
  useReveal(language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = copy.meta.title;
    setMeta("description", copy.meta.description);
    setMeta("theme-color", "#f3f0e8");
  }, [language, copy]);

  function toggleLanguage() {
    const next = language === "es" ? "en" : "es";
    window.localStorage.setItem("fatfingers-language", next);
    setLanguage(next);
  }

  return (
    <div className="site">
      <style>{styles}</style>
      <div aria-hidden="true" className="grain" />
      <a className="skip" href="#contenido">
        {copy.skip}
      </a>

      <Nav copy={copy} downloadUrl={download.url} language={language} onToggleLanguage={toggleLanguage} scrolled={scrolled} />

      <main id="contenido" tabIndex={-1}>
        <Hero copy={copy} download={download} language={language} reduceMotion={reduceMotion} />
        <Ticker />
        <HowSection copy={copy} mac={IS_MAC} />
        <Playground copy={copy} key={language} reduceMotion={reduceMotion} />
        <SetupSection copy={copy} />
        <SettingsSection copy={copy} />
        <PrinciplesSection copy={copy} />
        <Cta copy={copy} download={download} />
      </main>

      <Footer copy={copy} />
    </div>
  );
}

type NavProps = {
  copy: Copy;
  language: Language;
  scrolled: boolean;
  downloadUrl: string;
  onToggleLanguage: () => void;
};

function Nav({ copy, language, scrolled, downloadUrl, onToggleLanguage }: NavProps) {
  const nav = copy.nav;

  return (
    <header className="nav" data-scrolled={scrolled ? "" : undefined}>
      <div className="nav-inner">
        <a aria-label={nav.home} className="brand" href="#top">
          <span aria-hidden="true" className="brand-key">
            Ff
          </span>
          <span className="brand-name">FatFingers</span>
        </a>
        <nav aria-label={nav.label} className="nav-links">
          <a href="#como-funciona">{nav.how}</a>
          <a href="#idiomas">{nav.languages}</a>
          <a href="#configuracion">{nav.settings}</a>
          <a href="#privacidad">{nav.privacy}</a>
          <a href={REPO_URL} rel="noreferrer" target="_blank">
            {nav.github}
            <ArrowUpRightIcon />
          </a>
        </nav>
        <div className="nav-actions">
          <button aria-label={nav.switchLanguage} className="lang-switch" onClick={onToggleLanguage} type="button">
            <span className={language === "es" ? "is-active" : ""}>ES</span>
            <span className={language === "en" ? "is-active" : ""}>EN</span>
          </button>
          <a className="nav-download" href={downloadUrl}>
            <DownloadIcon />
            <span>{nav.download}</span>
          </a>
        </div>
      </div>
      <span aria-hidden="true" className="nav-progress" />
    </header>
  );
}

type HeroProps = { copy: Copy; download: DownloadView; language: Language; reduceMotion: boolean };

function Hero({ copy, download, language, reduceMotion }: HeroProps) {
  const release = download.release;
  const linuxKinds: AssetKind[] =
    download.platform === "linux" && release ? (["appimage", "deb", "rpm"] as AssetKind[]).filter((kind) => release.links[kind]) : [];
  const altMac =
    download.platform === "macos" && release?.primary
      ? release.primary === "mac-arm"
        ? "mac-intel"
        : "mac-arm"
      : null;
  const altMacUrl = altMac ? release?.links[altMac] : undefined;

  return (
    <section aria-labelledby="hero-title" className="hero" id="top">
      <div className="hero-top">
        <p className="eyebrow">
          <i aria-hidden="true" />
          {copy.hero.eyebrow}
        </p>
        {release ? (
          <a className="release-tag" href={release.pageUrl} rel="noreferrer" target="_blank">
            {copy.hero.latest} <b>{release.version}</b>
            <ArrowUpRightIcon />
          </a>
        ) : null}
      </div>

      <Headline
        id="hero-title"
        key={language}
        language={language}
        line1={copy.hero.line1}
        line2={copy.hero.line2}
        reduceMotion={reduceMotion}
      />

      <div className="hero-body">
        <div className="hero-copy">
          <p className="hero-lead">{copy.hero.lead}</p>
          <a className="dl-main" href={download.url}>
            <span className="dl-icon">
              <DownloadIcon />
            </span>
            <span className="dl-text">
              <strong>{download.label}</strong>
              <small>{download.detail}</small>
            </span>
          </a>
          <div className="dl-secondary">
            <a className="text-link" href={RELEASES_URL} rel="noreferrer" target="_blank">
              {copy.hero.allDownloads}
              <ArrowUpRightIcon />
            </a>
            {altMac && altMacUrl ? (
              <a className="text-link" href={altMacUrl}>
                {copy.hero.altMac[altMac]}
              </a>
            ) : null}
          </div>
          {release && linuxKinds.length > 0 ? (
            <div aria-label={copy.hero.otherFormats} className="formats" role="group">
              <span className="formats-label">{copy.hero.otherFormats}</span>
              {linuxKinds.map((kind) => (
                <a className={kind === release.primary ? "format is-recommended" : "format"} href={release.links[kind]} key={kind}>
                  <strong>{copy.kinds[kind].short}</strong>
                  <small>{copy.kinds[kind].hint}</small>
                </a>
              ))}
            </div>
          ) : null}
          <ul className="hero-meta">
            {copy.hero.meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="hero-scene">
          <HeroScene copy={copy} key={language} mac={IS_MAC} reduceMotion={reduceMotion} />
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER];

  return (
    <div aria-hidden="true" className="ticker">
      <div className="ticker-track">
        {items.map(([wrong, right], index) => (
          <span className="ticker-item" key={index}>
            <s>{wrong}</s>
            <ArrowRightIcon />
            <b>{right}</b>
            <i className="ticker-sep" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Cta({ copy, download }: { copy: Copy; download: DownloadView }) {
  const cta = copy.cta;
  const links: Partial<Record<AssetKind, string>> = download.release?.links ?? {};
  const groups = ASSET_GROUPS.map((group) => ({
    name: group.name,
    kinds: group.kinds.filter((kind) => links[kind]),
  })).filter((group) => group.kinds.length > 0);

  return (
    <section aria-labelledby="cta-title" className="cta-wrap">
      <div className="cta" data-reveal>
        <div className="cta-copy">
          <h2 className="h2" id="cta-title">
            {cta.title}
          </h2>
          <p className="cta-then">
            {cta.then}
            <Combo mac={IS_MAC} size="sm" tokens={["mod", "shift", "space"]} />
          </p>
        </div>
        <a className="cta-key" href={download.url}>
          <DownloadIcon />
          <strong>{download.label}</strong>
          <small>{download.detail}</small>
        </a>
        <div className="cta-platforms">
          <span className="mini-label">{cta.platformsLabel}</span>
          {groups.length > 0 ? (
            groups.map((group) => (
              <div className="cta-group" key={group.name}>
                <span>{group.name}</span>
                {group.kinds.map((kind) => (
                  <a href={links[kind]} key={kind}>
                    {copy.kinds[kind].short}
                  </a>
                ))}
              </div>
            ))
          ) : (
            <div className="cta-group">
              <a href={RELEASES_URL} rel="noreferrer" target="_blank">
                {cta.releases}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer({ copy }: { copy: Copy }) {
  const footer = copy.footer;

  return (
    <footer className="footer-wrap">
      <div className="footer">
        <div className="footer-brand">
          <a aria-label={copy.nav.home} className="brand" href="#top">
            <span aria-hidden="true" className="brand-key">
              Ff
            </span>
            <span className="brand-name">FatFingers</span>
          </a>
          <p>{footer.tagline}</p>
        </div>
        <nav aria-label={footer.label} className="footer-links">
          <a href={REPO_URL} rel="noreferrer" target="_blank">
            <GitHubIcon />
            GitHub
          </a>
          <a href={RELEASES_URL} rel="noreferrer" target="_blank">
            Releases
          </a>
          <a href={CHANGELOG_URL} rel="noreferrer" target="_blank">
            {footer.changelog}
          </a>
          <a href={LICENSE_URL} rel="noreferrer" target="_blank">
            {footer.license}
          </a>
        </nav>
        <div className="footer-meta">
          <a aria-label={footer.badgeLabel} className="release-badge" href={RELEASES_URL} rel="noreferrer" target="_blank">
            <img alt={footer.badgeAlt} height="20" src={RELEASE_BADGE_URL} />
          </a>
          <small>{footer.rights}</small>
        </div>
      </div>
    </footer>
  );
}
