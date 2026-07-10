import { useEffect, useState } from "preact/hooks";
import type { GitHubRelease, ReleaseAsset } from "../shared/release";

const RELEASES_URL = "https://github.com/Prgm-code/FatFingers/releases";
const RELEASES_API = "https://api.github.com/repos/Prgm-code/FatFingers/releases?per_page=5";
const RELEASE_BADGE_URL = "https://img.shields.io/github/v/release/Prgm-code/FatFingers?include_prereleases&sort=date";

type Platform = "macos" | "windows" | "linux" | "unknown";
type Language = "es" | "en";

type Download = {
  platform: Platform;
  platformLabel: string;
  version: string;
  url: string;
  detail: string;
  isDirect: boolean;
  linuxPackages: Array<{
    label: string;
    detail: string;
    url: string;
    recommended?: boolean;
  }>;
};

type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string }>;
  };
};

const DEMO_EXAMPLES = {
  es: [
    {
      label: "Ortografía",
      action: "Corregir",
      input: "Hpla, te envuo el repprte mañama por la mañaba.",
      output: "Hola, te envío el reporte mañana por la mañana.",
    },
    {
      label: "Tono",
      action: "Profesional",
      input: "Buebas, no alcanso a termonar el infrome oi. Te lo mandp mañama.",
      output: "Hola, no alcanzaré a terminar el informe hoy. Te lo enviaré mañana.",
    },
    {
      label: "Brevedad",
      action: "Acortar",
      input: "Solo qeria preguntarte si podrias, cuando tengas un rato, mandarme el acrhivo de ayer por favpr.",
      output: "¿Puedes enviarme el archivo de ayer, por favor?",
    },
  ],
  en: [
    {
      label: "Spelling",
      action: "Correct",
      input: "Helo, I'll senf you the repprt tomorroe mornimg.",
      output: "Hello, I'll send you the report tomorrow morning.",
    },
    {
      label: "Tone",
      action: "Professional",
      input: "Hey, I cant fnish the repotr today. Ill send it tomorroe.",
      output: "Hello, I won't be able to finish the report today. I'll send it tomorrow.",
    },
    {
      label: "Brevity",
      action: "Shorten",
      input: "I just wanted to aks if maybe, whenever you have a momemt, you could send me yesterdays flie please.",
      output: "Could you send me yesterday's file, please?",
    },
  ],
} as const;

const COPY = {
  es: {
    metaDescription: "Asistente de escritura de escritorio para corregir, acortar y mejorar textos sin romper tu flujo.",
    navHow: "Cómo funciona", navSettings: "Configuración", navGithub: "GitHub", languageLabel: "Cambiar idioma a inglés",
    eyebrow: "Asistente de escritura para escritorio", heroLine: "Escribe rápido.", heroAccent: "Sin fat fingers.",
    heroLead: "Corrige, acorta y mejora cualquier texto desde un helper flotante. Sin abrir otra pestaña. Sin romper tu ritmo.",
    downloadFor: "Descargar para", loading: "Buscando última versión…", latest: "Última versión disponible",
    githubFiles: "Ver archivos disponibles en GitHub", viewReleases: "Ver releases",
    alpha: "MVP alpha · Código abierto · macOS, Windows y Linux", linuxFormats: "Formatos Linux",
    visualCaption: "Invócalo en cualquier momento",
    howKicker: "Un flujo mínimo", howTitle1: "Del borrador a lo que", howTitle2: "realmente querías decir.",
    setupLabel: "Antes de usarlo", setupTitle: "Conecta tu proveedor de IA.",
    setupBody: "FatFingers no incluye una API key propia. Necesitas la key de uno de los proveedores compatibles.",
    setup1: "Abre", setup1Strong: "Configuración → Proveedor de IA", setup2: "Elige proveedor y modelo, y pega tu", setup2Strong: "API key", setup3: "Pulsa", setup3Strong: "Probar conexión", setup3End: "y luego guarda.",
    secure: "La key se guarda en Keychain, Credential Manager o Secret Service; nunca en el archivo de configuración.",
    stepOpen: "Abre", stepOpenBody: "Usa tu atajo global. FatFingers aparece encima de lo que estés haciendo.",
    stepImprove: "Mejora", stepImproveBody: "Pega o escribe tu texto y elige el tono: correcto, profesional, corto o amable.",
    stepContinue: "Continúa", stepContinueBody: "Copia el resultado o pégalo de vuelta en la app de origen con un segundo Enter.",
    settingsKicker: "Configúralo a tu manera", settingsTitle1: "Pequeño por fuera.", settingsTitle2: "Flexible por dentro.",
    cards: [
      ["General", "Tu flujo", "Idioma ES/EN, tema, acción inicial, abrir al iniciar, autocopia y comportamiento del segundo Enter."],
      ["Atajo", "Siempre a mano", "Graba y prueba tu shortcut global. Por defecto usa Cmd/Ctrl + Shift + Space."],
      ["Escritura", "El tono correcto", "Modos texto plano, balanceado, formal o creativo; ajusta formalidad, creatividad y temperatura."],
      ["Acciones", "Más que corregir", "Corrige, profesionaliza, acorta, suaviza, traduce, redacta una respuesta rápida o usa una instrucción custom."],
      ["Proveedor", "Sin bloqueo", "Elige modelo, endpoint, timeout, tokens máximos y headers personalizados; prueba la conexión antes de empezar."],
      ["Privacidad", "Tú decides", "Sin telemetría. Historial desactivado por defecto y controles para borrar key, historial o todos los datos locales."],
    ],
    principlesKicker: "Hecho para desaparecer", principlesTitle1: "Tu texto. Tu proveedor.", principlesTitle2: "Tu flujo de trabajo.",
    principles: ["Elige OpenAI, MiniMax, OpenRouter, OpenAI-compatible o Custom HTTP.", "Tu API key se guarda en el almacén seguro de tu sistema.", "Sin telemetría y sin historial por defecto."],
    ctaKicker: "Menos fricción. Mejores palabras.", ctaTitle1: "Tu próximo texto", ctaTitle2: "puede sonar mejor.", download: "Descargar",
    footer: "Asistente de escritura open source.", releaseAlt: "Última release de FatFingers", releaseAria: "Ver la última release de FatFingers",
    demo: { copied: "Copiado — pulsa Ctrl+V para pegar", working: "Trabajando…", copyClose: "Copiar y cerrar", undo: "Deshacer", chars: "caracteres", improve: "Mejorar", close: "Cerrar", friendly: "Más amable", quick: "Respuesta rápida", type: "Escribe", enter: "Enter", ready: "Listo", aria: "Demostración animada: se escribe un texto con errores, se presiona Enter y FatFingers lo corrige", examplesAria: "Ejemplos de transformación" },
  },
  en: {
    metaDescription: "A desktop writing assistant to correct, shorten, and improve text without breaking your flow.",
    navHow: "How it works", navSettings: "Settings", navGithub: "GitHub", languageLabel: "Cambiar idioma a español",
    eyebrow: "Desktop writing assistant", heroLine: "Write fast.", heroAccent: "Without fat fingers.",
    heroLead: "Correct, shorten, and improve any text from a floating helper. No extra tab. No broken focus.",
    downloadFor: "Download for", loading: "Finding latest release…", latest: "Latest release available",
    githubFiles: "View available files on GitHub", viewReleases: "View releases",
    alpha: "MVP alpha · Open source · macOS, Windows, and Linux", linuxFormats: "Linux formats",
    visualCaption: "Call it up whenever you need it",
    howKicker: "A minimal flow", howTitle1: "From a rough draft to what", howTitle2: "you actually meant to say.",
    setupLabel: "Before you start", setupTitle: "Connect your AI provider.",
    setupBody: "FatFingers does not include its own API key. You need a key from one of the supported providers.",
    setup1: "Open", setup1Strong: "Settings → AI Provider", setup2: "Choose a provider and model, then paste your", setup2Strong: "API key", setup3: "Select", setup3Strong: "Test connection", setup3End: "and save your settings.",
    secure: "Your key is stored in Keychain, Credential Manager, or Secret Service; never in the settings file.",
    stepOpen: "Open", stepOpenBody: "Use your global shortcut. FatFingers appears on top of whatever you are doing.",
    stepImprove: "Improve", stepImproveBody: "Paste or type your text and choose a style: correct, professional, shorter, or friendlier.",
    stepContinue: "Continue", stepContinueBody: "Copy the result or paste it back into the previous app with a second Enter.",
    settingsKicker: "Make it yours", settingsTitle1: "Small on the outside.", settingsTitle2: "Flexible on the inside.",
    cards: [
      ["General", "Your workflow", "Interface language, theme, default action, launch at login, auto-copy, and second-Enter behavior."],
      ["Shortcut", "Always at hand", "Record and test your global shortcut. The default is Cmd/Ctrl + Shift + Space."],
      ["Writing", "The right tone", "Plain text, balanced, formal, or creative modes; tune formality, creativity, and temperature."],
      ["Actions", "More than corrections", "Correct, professionalize, shorten, soften, translate, draft a quick reply, or use a custom instruction."],
      ["Provider", "No lock-in", "Choose the model, endpoint, timeout, output tokens, and custom headers; test the connection before starting."],
      ["Privacy", "You decide", "No telemetry. History is off by default, with controls to delete your key, history, or all local data."],
    ],
    principlesKicker: "Designed to disappear", principlesTitle1: "Your text. Your provider.", principlesTitle2: "Your workflow.",
    principles: ["Choose OpenAI, MiniMax, OpenRouter, OpenAI-compatible, or Custom HTTP.", "Your API key stays in your operating system's secure storage.", "No telemetry and no history by default."],
    ctaKicker: "Less friction. Better words.", ctaTitle1: "Your next message", ctaTitle2: "can sound better.", download: "Download",
    footer: "Open-source writing assistant.", releaseAlt: "Latest FatFingers release", releaseAria: "View the latest FatFingers release",
    demo: { copied: "Copied — press Ctrl+V to paste", working: "Working…", copyClose: "Copy & close", undo: "Undo", chars: "characters", improve: "Improve", close: "Close", friendly: "Friendly", quick: "Quick reply", type: "Type", enter: "Enter", ready: "Done", aria: "Animated demo: a mistyped sentence is entered, Enter is pressed, and FatFingers corrects it", examplesAria: "Transformation examples" },
  },
} as const;

function detectLanguage(): Language {
  const saved = window.localStorage.getItem("fatfingers-language");
  if (saved === "es" || saved === "en") return saved;
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  return preferences.some((language) => language.toLowerCase().startsWith("es")) ? "es" : "en";
}

function platformCopy(language: Language, platform: Platform): { label: string; detail: string } {
  const copies: Record<Language, Record<Platform, { label: string; detail: string }>> = {
    es: {
      macos: { label: "macOS", detail: "Imagen DMG" }, windows: { label: "Windows", detail: "Instalador de 64 bits" },
      linux: { label: "Linux", detail: "AppImage de 64 bits" }, unknown: { label: "tu sistema", detail: "Elige el archivo correcto en GitHub" },
    },
    en: {
      macos: { label: "macOS", detail: "DMG image" }, windows: { label: "Windows", detail: "64-bit installer" },
      linux: { label: "Linux", detail: "64-bit AppImage" }, unknown: { label: "your system", detail: "Choose the right file on GitHub" },
    },
  };
  return copies[language][platform];
}

function detectPlatform(): Platform {
  const nav = navigator as NavigatorWithUAData;
  const value = `${nav.userAgentData?.platform ?? ""} ${navigator.platform ?? ""} ${navigator.userAgent}`.toLowerCase();

  if (value.includes("mac")) return "macos";
  if (value.includes("win")) return "windows";
  if (value.includes("linux") || value.includes("x11")) return "linux";
  return "unknown";
}

async function detectArchitecture(): Promise<string> {
  const nav = navigator as NavigatorWithUAData;
  try {
    const values = await nav.userAgentData?.getHighEntropyValues?.(["architecture"]);
    return values?.architecture?.toLowerCase() ?? "";
  } catch {
    return "";
  }
}

function findAsset(assets: ReleaseAsset[], platform: Platform, architecture: string): ReleaseAsset | undefined {
  if (platform === "windows") {
    return assets.find((asset) => /windows.*setup\.exe$/i.test(asset.name));
  }

  if (platform === "linux") {
    return assets.find((asset) => /linux.*\.appimage$/i.test(asset.name));
  }

  if (platform === "macos") {
    const wantsIntel = architecture.includes("x86");
    const preferred = wantsIntel ? /darwin-x64\.dmg$/i : /darwin-aarch64\.dmg$/i;
    return assets.find((asset) => preferred.test(asset.name)) ?? assets.find((asset) => /darwin.*\.dmg$/i.test(asset.name));
  }

  return undefined;
}

function findLinuxPackages(assets: ReleaseAsset[], language: Language): Download["linuxPackages"] {
  const formats = [
    { label: "AppImage", detail: language === "es" ? "Universal" : "Universal", pattern: /linux.*\.appimage$/i, recommended: true },
    { label: ".deb", detail: "Debian / Ubuntu", pattern: /linux.*\.deb$/i },
    { label: ".rpm", detail: "Fedora / RHEL", pattern: /linux.*\.rpm$/i },
  ];

  return formats.flatMap((format) => {
    const asset = assets.find((candidate) => format.pattern.test(candidate.name));
    return asset ? [{
      label: format.label,
      detail: format.detail,
      url: asset.browser_download_url,
      recommended: format.recommended,
    }] : [];
  });
}

function releaseFromTag(tag: string): GitHubRelease {
  const assetNames = [
    `FatFingers-${tag}-darwin-aarch64.dmg`,
    `FatFingers-${tag}-darwin-x64.dmg`,
    `FatFingers-${tag}-linux-amd64.AppImage`,
    `FatFingers-${tag}-linux-amd64.deb`,
    `FatFingers-${tag}-linux-x86_64.rpm`,
    `FatFingers-${tag}-windows-x64-setup.exe`,
  ];

  return {
    tag_name: tag,
    html_url: `${RELEASES_URL}/tag/${encodeURIComponent(tag)}`,
    assets: assetNames.map((name) => ({
      name,
      browser_download_url: `${RELEASES_URL}/download/${encodeURIComponent(tag)}/${encodeURIComponent(name)}`,
    })),
  };
}

async function releaseFromBadge(): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(RELEASE_BADGE_URL);
    if (!response.ok) return null;

    const badge = await response.text();
    const tag = badge.match(/aria-label="release: ([^"]+)"/)?.[1]?.trim();
    if (!tag || !/^v?\d/.test(tag)) return null;
    return releaseFromTag(tag);
  } catch {
    return null;
  }
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="M10 3v11m0 0 4-4m-4 4-4-4M4 17h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.92-1.3 2.76-1.02 2.76-1.02.54 1.37.2 2.39.1 2.64.64.7 1.02 1.59 1.02 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function ProductDemo({ language }: { language: Language }) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [exampleIndex, setExampleIndex] = useState(0);
  const [restartId, setRestartId] = useState(0);
  const examples = DEMO_EXAMPLES[language];
  const demoCopy = COPY[language].demo;
  const example = examples[exampleIndex];
  const [phase, setPhase] = useState<"selecting" | "typing" | "ready" | "working" | "corrected" | "confirmed">(
    reduceMotion ? "corrected" : "typing",
  );
  const [text, setText] = useState(reduceMotion ? examples[0].output : "");

  useEffect(() => {
    let intervalId: number | undefined;
    let timeoutId: number | undefined;

    if (reduceMotion) {
      setText(example.output);
      return;
    }

    if (phase === "selecting") {
      timeoutId = window.setTimeout(() => setPhase("typing"), 1500);
    } else if (phase === "typing") {
      let index = 0;
      setText("");
      intervalId = window.setInterval(() => {
        index += 1;
        setText(example.input.slice(0, index));
        if (index >= example.input.length) {
          window.clearInterval(intervalId);
          timeoutId = window.setTimeout(() => setPhase("ready"), 650);
        }
      }, 42);
    } else if (phase === "ready") {
      timeoutId = window.setTimeout(() => setPhase("working"), 900);
    } else if (phase === "working") {
      timeoutId = window.setTimeout(() => {
        setText(example.output);
        setPhase("corrected");
      }, 1150);
    } else if (phase === "corrected") {
      timeoutId = window.setTimeout(() => setPhase("confirmed"), 2100);
    } else {
      timeoutId = window.setTimeout(() => {
        setExampleIndex((current) => (current + 1) % examples.length);
        setPhase("selecting");
      }, 1200);
    }

    return () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [example.input, example.output, phase, reduceMotion, restartId]);

  const isReview = phase === "corrected" || phase === "confirmed";

  function selectExample(index: number) {
    setExampleIndex(index);
    setRestartId((current) => current + 1);
    if (reduceMotion) {
      setText(examples[index].output);
      setPhase("corrected");
    } else {
      setPhase("selecting");
    }
  }

  return (
    <div
      aria-label={demoCopy.aria}
      className={`demo-shell demo-${phase}`}
      role="group"
    >
      <div className="demo-drag" />
      <span className="demo-close">×</span>
      <div className="demo-body">
        {phase === "confirmed" ? (
          <div className="demo-notice"><span>✓</span> {demoCopy.copied}</div>
        ) : null}
        <p className={`demo-editor ${isReview ? "is-corrected" : ""}`}>
          {text}<span className="typing-caret" />
        </p>
        {phase === "selecting" ? (
          <div className="demo-select-menu" aria-hidden="true">
            {examples.map((item) => (
              <span className={item.action === example.action ? "active" : ""} key={item.action}>
                {item.action}<i>{item.action === example.action ? "✓" : ""}</i>
              </span>
            ))}
            <span>{demoCopy.friendly}<i /></span>
            <span>{demoCopy.quick}<i /></span>
          </div>
        ) : null}
        <div className="demo-footer">
          <span className={`demo-select ${phase === "selecting" ? "is-open" : ""}`}>{example.action} <span>⌄</span></span>
          <div className="demo-hints">
            {phase === "working" ? (
              <span className="working-hint"><i /> {demoCopy.working}</span>
            ) : isReview ? (
              <>
                <span className="demo-latency">846 ms</span>
                <span><kbd className={phase === "corrected" ? "key-press" : ""}>↵</kbd> {demoCopy.copyClose}</span>
                <span><kbd>Ctrl Z</kbd> {demoCopy.undo}</span>
              </>
            ) : (
              <>
                <span className="demo-count">{text.length} {demoCopy.chars}</span>
                <span><kbd className={phase === "ready" ? "key-press" : ""}>↵</kbd> {demoCopy.improve}</span>
                <span><kbd>Esc</kbd> {demoCopy.close}</span>
              </>
            )}
            <span className="demo-settings">⚙</span>
          </div>
        </div>
      </div>
      <div className="demo-stage">
        <div className="demo-cases" aria-label={demoCopy.examplesAria}>
          {examples.map((item, index) => (
            <button
              aria-pressed={exampleIndex === index}
              className={exampleIndex === index ? "active" : ""}
              key={item.label}
              onClick={() => selectExample(index)}
              type="button"
            >
              <span>0{index + 1}</span> {item.label}
            </button>
          ))}
        </div>
        <div className="demo-progress" aria-hidden="true">
          <span className={phase === "selecting" || phase === "typing" ? "active" : ""}>{demoCopy.type}</span>
          <i />
          <span className={phase === "ready" || phase === "working" ? "active" : ""}>Enter</span>
          <i />
          <span className={isReview ? "active" : ""}>{demoCopy.ready}</span>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const copy = COPY[language];
  const [download, setDownload] = useState<Download>(() => {
    const platform = detectPlatform();
    const platformText = platformCopy(language, platform);
    return {
      platform,
      platformLabel: platformText.label,
      version: copy.loading,
      url: RELEASES_URL,
      detail: platformText.detail,
      isDirect: false,
      linuxPackages: [],
    };
  });

  useEffect(() => {
    let active = true;

    document.documentElement.lang = language;
    document.title = language === "es" ? "FatFingers — Escribe rápido. Sin fat fingers." : "FatFingers — Write fast. Without fat fingers.";
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = copy.metaDescription;

    async function loadLatestRelease() {
      const platform = detectPlatform();
      const platformText = platformCopy(language, platform);

      try {
        const architecture = await detectArchitecture();
        const badgeRelease = await releaseFromBadge();
        let releases = badgeRelease ? [badgeRelease] : [];

        if (releases.length === 0) {
          const response = await fetch(RELEASES_API, {
            headers: { Accept: "application/vnd.github+json" },
          });
          if (!response.ok) throw new Error("GitHub release unavailable");
          releases = (await response.json()) as GitHubRelease[];
        }

        const resolved = releases
          .map((release) => ({ release, asset: findAsset(release.assets, platform, architecture) }))
          .find((entry) => entry.asset);
        const release = resolved?.release ?? releases[0];
        const asset = resolved?.asset;
        if (!release) throw new Error("No releases found");

        if (active) {
          setDownload({
            platform,
            platformLabel: platformText.label,
            version: release.tag_name.replace(/^v/, ""),
            url: asset?.browser_download_url ?? release.html_url,
            detail: asset ? platformText.detail : copy.githubFiles,
            isDirect: Boolean(asset),
            linuxPackages: platform === "linux" ? findLinuxPackages(release.assets, language) : [],
          });
        }
      } catch {
        if (active) {
          setDownload({
            platform,
            platformLabel: platformText.label,
            version: copy.latest,
            url: RELEASES_URL,
            detail: copy.githubFiles,
            isDirect: false,
            linuxPackages: [],
          });
        }
      }
    }

    void loadLatestRelease();
    return () => {
      active = false;
    };
  }, [copy.githubFiles, copy.latest, copy.loading, copy.metaDescription, language]);

  function toggleLanguage() {
    const nextLanguage = language === "es" ? "en" : "es";
    window.localStorage.setItem("fatfingers-language", nextLanguage);
    setLanguage(nextLanguage);
  }

  return (
    <div className="site-shell">
      <style>{styles}</style>
      <header className="nav-wrap">
        <a className="brand" href="#top" aria-label={language === "es" ? "FatFingers, inicio" : "FatFingers, home"}>
          <span className="brand-mark">Ff</span>
          <span>FatFingers</span>
        </a>
        <nav aria-label={language === "es" ? "Navegación principal" : "Main navigation"}>
          <a href="#como-funciona">{copy.navHow}</a>
          <a href="#configuracion">{copy.navSettings}</a>
          <a href="https://github.com/Prgm-code/FatFingers" target="_blank" rel="noreferrer">{copy.navGithub}</a>
          <button aria-label={copy.languageLabel} className="language-switch" onClick={toggleLanguage} type="button">
            <span className={language === "es" ? "active" : ""}>ES</span><i /><span className={language === "en" ? "active" : ""}>EN</span>
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span />{copy.eyebrow}</div>
            <h1>{copy.heroLine}<br /><em>{copy.heroAccent}</em></h1>
            <p className="hero-lead">{copy.heroLead}</p>

            <div className="download-group">
              <a className="download-button" href={download.url}>
                <span className="download-icon"><ArrowIcon /></span>
                <span>
                  <strong>{copy.downloadFor} {download.platformLabel}</strong>
                  <small>{download.version} · {download.detail}</small>
                </span>
              </a>
              <a className="all-downloads" href={RELEASES_URL} target="_blank" rel="noreferrer">
                {copy.viewReleases} <span aria-hidden="true">↗</span>
              </a>
            </div>

            {download.platform === "linux" && download.linuxPackages.length > 0 ? (
              <div className="linux-packages" aria-label={language === "es" ? "Formatos de descarga para Linux" : "Linux download formats"}>
                <span className="linux-packages-label">{copy.linuxFormats}</span>
                {download.linuxPackages.map((pkg) => (
                  <a className={pkg.recommended ? "recommended" : ""} href={pkg.url} key={pkg.label}>
                    <strong>{pkg.label}</strong>
                    <small>{pkg.detail}</small>
                  </a>
                ))}
              </div>
            ) : null}

            <p className="alpha-note"><span>α</span> {copy.alpha}</p>
          </div>

          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <ProductDemo language={language} />
            <p className="visual-caption"><span>01</span> {copy.visualCaption}</p>
          </div>
        </section>

        <section className="how" id="como-funciona">
          <div className="section-heading">
            <p>{copy.howKicker}</p>
            <h2>{copy.howTitle1}<br />{copy.howTitle2}</h2>
          </div>

          <aside className="setup-guide">
            <div className="setup-intro">
              <span className="setup-label">{copy.setupLabel}</span>
              <h3>{copy.setupTitle}</h3>
              <p>{copy.setupBody}</p>
            </div>
            <ol>
              <li><span>1</span><p>{copy.setup1} <strong>{copy.setup1Strong}</strong>.</p></li>
              <li><span>2</span><p>{copy.setup2} <strong>{copy.setup2Strong}</strong>.</p></li>
              <li><span>3</span><p>{copy.setup3} <strong>{copy.setup3Strong}</strong> {copy.setup3End}</p></li>
            </ol>
            <div className="provider-strip">
              <span>OpenAI</span><span>MiniMax</span><span>OpenRouter</span><span>OpenAI-compatible</span><span>Custom HTTP</span>
            </div>
            <p className="secure-copy"><span>⌁</span> {copy.secure}</p>
          </aside>

          <div className="steps">
            <article>
              <span className="step-number">01</span>
              <div className="step-icon">⌘</div>
              <h3>{copy.stepOpen}</h3>
              <p>{copy.stepOpenBody}</p>
            </article>
            <article>
              <span className="step-number">02</span>
              <div className="step-icon">Aa</div>
              <h3>{copy.stepImprove}</h3>
              <p>{copy.stepImproveBody}</p>
            </article>
            <article>
              <span className="step-number">03</span>
              <div className="step-icon">↵</div>
              <h3>{copy.stepContinue}</h3>
              <p>{copy.stepContinueBody}</p>
            </article>
          </div>

          <div className="settings-docs" id="configuracion">
            <div className="settings-docs-heading">
              <p>{copy.settingsKicker}</p>
              <h3>{copy.settingsTitle1}<br />{copy.settingsTitle2}</h3>
            </div>
            <div className="setting-cards">
              {copy.cards.map(([section, title, body]) => (
                <article key={section}>
                  <span>{section}</span>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="principles">
          <p className="principles-kicker">{copy.principlesKicker}</p>
          <h2>{copy.principlesTitle1}<br />{copy.principlesTitle2}</h2>
          <div className="principle-list">
            {copy.principles.map((principle, index) => (
              <div key={principle}><span>0{index + 1}</span><p>{principle}</p></div>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div>
            <p>{copy.ctaKicker}</p>
            <h2>{copy.ctaTitle1}<br />{copy.ctaTitle2}</h2>
          </div>
          <a className="round-download" href={download.url} aria-label={`${copy.download} FatFingers — ${download.platformLabel}`}>
            <ArrowIcon />
            <span>{copy.download}</span>
          </a>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">Ff</span><span>FatFingers</span></a>
        <p>{copy.footer}</p>
        <div className="footer-repo">
          <a className="github-link" href="https://github.com/Prgm-code/FatFingers" target="_blank" rel="noreferrer"><GitHubIcon /> GitHub</a>
          <a className="release-badge" href={RELEASES_URL} target="_blank" rel="noreferrer" aria-label={copy.releaseAria}>
            <img alt={copy.releaseAlt} src={RELEASE_BADGE_URL} />
          </a>
        </div>
      </footer>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@1,6..72,400&display=swap');

  :root { color-scheme: light; --ink: #171713; --paper: #f3f0e8; --soft: #e7e2d7; --acid: #d9ff43; --muted: #6f6e66; }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'Manrope', sans-serif; }
  a { color: inherit; text-decoration: none; }
  .site-shell { min-height: 100vh; overflow: hidden; background: radial-gradient(circle at 75% 13%, rgba(217,255,67,.14), transparent 24rem), var(--paper); }
  .nav-wrap { width: min(1180px, calc(100% - 48px)); height: 88px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(23,23,19,.16); }
  .brand { display: inline-flex; align-items: center; gap: 11px; font-size: 16px; font-weight: 700; letter-spacing: -.02em; }
  .brand-mark { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 8px; background: var(--ink); color: var(--acid); font-family: 'Newsreader', serif; font-style: italic; font-size: 18px; }
  nav { display: flex; gap: 32px; font-family: 'DM Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
  nav a { transition: opacity .2s ease; } nav a:hover { opacity: .5; }
  .language-switch { appearance: none; display: flex; align-items: center; gap: 5px; margin: -5px 0; padding: 5px 7px; border: 1px solid #cbc7bc; border-radius: 7px; background: rgba(255,255,255,.25); color: #9b998f; font-family: 'DM Mono', monospace; font-size: 8px; cursor: pointer; }
  .language-switch span { transition: color .2s ease; }
  .language-switch span.active { color: var(--ink); }
  .language-switch i { width: 1px; height: 10px; background: #c7c3b8; }
  .hero { width: min(1180px, calc(100% - 48px)); min-height: 710px; margin: 0 auto; display: grid; grid-template-columns: .92fr 1.08fr; align-items: center; gap: 5vw; padding: 70px 0 90px; }
  .hero-copy { position: relative; z-index: 2; animation: rise .7s both; }
  .eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 27px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
  .eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: var(--acid); box-shadow: 0 0 0 4px rgba(217,255,67,.25); }
  h1 { margin: 0; font-size: clamp(58px, 6.6vw, 98px); line-height: .88; letter-spacing: -.075em; font-weight: 600; }
  h1 em { font-family: 'Newsreader', serif; font-weight: 400; color: #6b6a61; }
  .hero-lead { max-width: 510px; margin: 32px 0; color: #56564f; font-size: 17px; line-height: 1.65; letter-spacing: -.015em; }
  .download-group { display: flex; align-items: center; gap: 21px; flex-wrap: wrap; }
  .download-button { min-width: 315px; display: inline-flex; align-items: center; gap: 14px; padding: 12px 20px 12px 12px; border-radius: 14px; background: var(--ink); color: white; box-shadow: 0 10px 25px rgba(23,23,19,.14); transition: transform .2s ease, box-shadow .2s ease; }
  .download-button:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(23,23,19,.22); }
  .download-icon { width: 43px; height: 43px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 10px; background: var(--acid); color: var(--ink); }
  .download-icon svg { width: 20px; height: 20px; }
  .download-button strong, .download-button small { display: block; }
  .download-button strong { margin-bottom: 4px; font-size: 14px; font-weight: 600; }
  .download-button small { max-width: 225px; overflow: hidden; color: #aaa99f; font-family: 'DM Mono', monospace; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .all-downloads { border-bottom: 1px solid #a8a69c; padding-bottom: 3px; font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; }
  .linux-packages { display: flex; align-items: stretch; gap: 6px; margin-top: 17px; }
  .linux-packages-label { display: flex; align-items: center; margin-right: 4px; color: #77766e; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .06em; text-transform: uppercase; }
  .linux-packages a { position: relative; min-width: 84px; padding: 8px 10px; border: 1px solid #cbc7bc; border-radius: 8px; background: rgba(255,255,255,.2); transition: border-color .2s ease, background .2s ease, transform .2s ease; }
  .linux-packages a:hover { border-color: #8c8a81; background: rgba(255,255,255,.55); transform: translateY(-1px); }
  .linux-packages a.recommended { border-color: #9d9d7b; }
  .linux-packages a.recommended::after { content: '●'; position: absolute; top: 5px; right: 7px; color: #9db800; font-size: 5px; }
  .linux-packages strong, .linux-packages small { display: block; }
  .linux-packages strong { margin-bottom: 3px; font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500; }
  .linux-packages small { color: #7e7d75; font-size: 7px; white-space: nowrap; }
  .alpha-note { display: flex; align-items: center; gap: 9px; margin-top: 21px; color: var(--muted); font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; }
  .alpha-note span { display: grid; width: 19px; height: 19px; place-items: center; border: 1px solid #c7c3b8; border-radius: 50%; color: var(--ink); font-size: 11px; }
  .hero-visual { position: relative; min-height: 520px; display: grid; place-items: center; animation: rise .7s .12s both; }
  .hero-visual::before { content: ''; position: absolute; width: 390px; height: 390px; border-radius: 50%; background: var(--acid); filter: blur(.2px); }
  .orbit { position: absolute; border: 1px solid rgba(23,23,19,.17); border-radius: 50%; }
  .orbit-one { width: 470px; height: 470px; transform: rotate(-15deg) scaleY(.5); }
  .orbit-two { width: 540px; height: 540px; transform: rotate(48deg) scaleY(.45); }
  .demo-shell { position: relative; z-index: 1; width: min(550px, 90vw); overflow: hidden; border: 1px solid rgba(255,255,255,.13); border-radius: 19px; background: #1b1b19; color: white; box-shadow: 0 35px 80px rgba(23,23,19,.29); transform: rotate(-2deg); transition: transform .4s cubic-bezier(.2,.8,.2,1); }
  .demo-shell:hover { transform: rotate(0deg) scale(1.015); }
  .demo-drag { width: 48px; height: 4px; margin: 8px auto 0; border-radius: 99px; background: #373733; }
  .demo-close { position: absolute; top: 11px; right: 15px; color: #77776f; font-size: 19px; line-height: 1; }
  .demo-body { position: relative; padding: 23px 18px 15px; }
  .demo-notice { position: absolute; z-index: 2; top: 7px; left: 50%; display: flex; align-items: center; gap: 7px; padding: 7px 11px; border: 1px solid #45453e; border-radius: 7px; background: #292925; color: #cecec7; font-family: 'DM Mono', monospace; font-size: 8px; transform: translateX(-50%); animation: notice-in .25s both; white-space: nowrap; }
  .demo-notice span { color: var(--acid); }
  .demo-editor { min-height: 120px; margin: 0; padding: 21px 18px; border: 1px solid #353531; border-radius: 11px; background: #20201e; color: #deded7; font-size: 15px; line-height: 1.55; letter-spacing: -.01em; transition: color .25s ease, border-color .25s ease, background .25s ease; }
  .demo-editor.is-corrected { border-color: rgba(217,255,67,.34); background: #22231e; color: #f4f4ed; animation: corrected-in .35s both; }
  .demo-working .demo-editor { color: #888881; }
  .typing-caret { display: inline-block; width: 1px; height: 1em; margin-left: 2px; background: var(--acid); vertical-align: -.12em; animation: caret-blink .72s steps(1) infinite; }
  .demo-selecting .typing-caret, .demo-corrected .typing-caret, .demo-confirmed .typing-caret, .demo-working .typing-caret { display: none; }
  .demo-footer { min-height: 32px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; color: #818179; font-family: 'DM Mono', monospace; font-size: 8px; }
  .demo-select { min-width: 87px; display: flex; justify-content: space-between; gap: 13px; padding: 7px 10px; border: 1px solid #3e3e39; border-radius: 7px; color: #cecec6; transition: border-color .2s ease, background .2s ease; }
  .demo-select > span { color: #74746d; transition: transform .2s ease; }
  .demo-select.is-open { border-color: var(--acid); background: #282824; }
  .demo-select.is-open > span { color: var(--acid); transform: rotate(180deg); }
  .demo-select-menu { position: absolute; z-index: 4; bottom: 56px; left: 18px; width: 155px; overflow: hidden; padding: 5px; border: 1px solid #484842; border-radius: 9px; background: #272724; box-shadow: 0 15px 35px rgba(0,0,0,.32); animation: select-open .22s cubic-bezier(.2,.8,.2,1) both; }
  .demo-select-menu > span { display: flex; align-items: center; justify-content: space-between; padding: 7px 8px; border-radius: 5px; color: #85857e; font-family: 'DM Mono', monospace; font-size: 8px; }
  .demo-select-menu > span.active { background: var(--acid); color: var(--ink); animation: option-picked .75s .18s ease both; }
  .demo-select-menu i { min-width: 10px; font-style: normal; }
  .demo-hints { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
  .demo-hints > span { white-space: nowrap; }
  .demo-hints kbd { display: inline-grid; min-width: 19px; height: 19px; padding: 0 4px; place-items: center; border: 1px solid #454540; border-bottom-width: 2px; border-radius: 5px; background: #252522; color: #bdbdb6; font-family: 'DM Mono', monospace; font-size: 7px; font-weight: 400; }
  .demo-hints kbd.key-press { border-color: var(--acid); color: var(--acid); animation: key-press 1s ease-in-out infinite; }
  .demo-latency, .demo-count { color: #65655f; }
  .demo-settings { display: grid; width: 21px; height: 21px; place-items: center; border: 1px solid #3f3f3a; border-radius: 6px; color: #72726b; font-size: 9px; }
  .working-hint { display: flex; align-items: center; gap: 6px; color: #d0d0c8; }
  .working-hint i { width: 6px; height: 6px; border-radius: 50%; background: var(--acid); box-shadow: 0 0 0 3px rgba(217,255,67,.12); animation: working-pulse .8s ease-in-out infinite; }
  .demo-stage { min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 7px 13px; border-top: 1px solid #30302d; background: #181816; color: #52524c; font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .06em; text-transform: uppercase; }
  .demo-cases, .demo-progress { display: flex; align-items: center; gap: 6px; }
  .demo-cases button { appearance: none; padding: 4px 7px; border: 1px solid transparent; border-radius: 5px; background: transparent; color: #62625c; font-family: inherit; font-size: 7px; letter-spacing: .04em; text-transform: uppercase; cursor: pointer; transition: border-color .2s ease, color .2s ease, background .2s ease; }
  .demo-cases button span { color: #44443f; transition: color .2s ease; }
  .demo-cases button:hover { color: #b1b1a9; }
  .demo-cases button.active { border-color: #41413c; background: #22221f; color: var(--acid); }
  .demo-cases button.active span { color: #818178; }
  .demo-progress span { transition: color .25s ease; }
  .demo-progress span.active { color: var(--acid); }
  .demo-progress i { width: 12px; height: 1px; background: #393934; }
  .visual-caption { position: absolute; right: 0; bottom: 15px; display: flex; align-items: center; gap: 10px; font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; }
  .visual-caption span { color: #98968c; }
  .how { background: var(--ink); color: var(--paper); padding: 110px max(24px, calc((100vw - 1180px) / 2)); }
  .section-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; margin-bottom: 80px; }
  .section-heading > p, .principles-kicker { margin: 8px 0 0; color: var(--acid); font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .12em; }
  .section-heading h2, .principles h2, .final-cta h2 { margin: 0; font-size: clamp(42px, 5vw, 70px); line-height: 1; letter-spacing: -.055em; font-weight: 500; }
  .setup-guide { position: relative; margin-bottom: 95px; padding: 42px; border: 1px solid #41413b; border-radius: 18px; background: #20201d; }
  .setup-intro { max-width: 560px; }
  .setup-label { display: inline-block; margin-bottom: 17px; color: var(--acid); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
  .setup-intro h3 { margin: 0 0 13px; font-size: 31px; font-weight: 500; letter-spacing: -.035em; }
  .setup-intro p { max-width: 520px; margin: 0; color: #a0a098; font-size: 13px; line-height: 1.65; }
  .setup-guide ol { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin: 38px 0 30px; padding: 0; list-style: none; }
  .setup-guide li { display: flex; align-items: flex-start; gap: 13px; }
  .setup-guide li > span { width: 25px; height: 25px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid #55554e; border-radius: 50%; color: var(--acid); font-family: 'DM Mono', monospace; font-size: 8px; }
  .setup-guide li p { margin: 2px 0 0; color: #aaa9a1; font-size: 12px; line-height: 1.55; }
  .setup-guide li strong { color: #efefe8; font-weight: 500; }
  .provider-strip { display: flex; flex-wrap: wrap; gap: 7px; padding-top: 23px; border-top: 1px solid #3a3a35; }
  .provider-strip span { padding: 7px 10px; border: 1px solid #41413c; border-radius: 99px; color: #8c8c84; font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: .03em; }
  .secure-copy { display: flex; align-items: center; gap: 9px; margin: 22px 0 0; color: #75756e; font-family: 'DM Mono', monospace; font-size: 8px; line-height: 1.5; }
  .secure-copy span { color: var(--acid); font-size: 16px; }
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid #3a3a35; }
  .steps article { position: relative; min-height: 280px; padding: 26px 35px 20px 0; border-right: 1px solid #3a3a35; }
  .steps article + article { padding-left: 35px; }
  .steps article:last-child { border-right: 0; }
  .step-number { color: #6e6e67; font-family: 'DM Mono', monospace; font-size: 9px; }
  .step-icon { width: 55px; height: 55px; display: grid; place-items: center; margin: 42px 0 25px; border: 1px solid #55554f; border-radius: 50%; color: var(--acid); font-family: 'Newsreader', serif; font-size: 21px; }
  .steps h3 { margin: 0 0 13px; font-size: 20px; font-weight: 500; }
  .steps p { max-width: 280px; margin: 0; color: #93938b; font-size: 13px; line-height: 1.65; }
  .settings-docs { margin-top: 125px; padding-top: 105px; border-top: 1px solid #3a3a35; scroll-margin-top: 30px; }
  .settings-docs-heading { display: grid; grid-template-columns: .8fr 1.2fr; gap: 40px; align-items: start; margin-bottom: 65px; }
  .settings-docs-heading > p { margin: 7px 0 0; color: var(--acid); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; }
  .settings-docs-heading h3 { margin: 0; font-size: clamp(38px, 4.4vw, 62px); line-height: 1; letter-spacing: -.05em; font-weight: 500; }
  .setting-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; overflow: hidden; border: 1px solid #3c3c37; border-radius: 14px; background: #3c3c37; }
  .setting-cards article { min-height: 210px; padding: 29px; background: #1d1d1a; }
  .setting-cards article > span { color: #74746d; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: .08em; text-transform: uppercase; }
  .setting-cards h4 { margin: 35px 0 12px; color: #f0f0e9; font-size: 17px; font-weight: 500; }
  .setting-cards p { margin: 0; color: #8f8f87; font-size: 12px; line-height: 1.65; }
  .principles { width: min(1180px, calc(100% - 48px)); margin: 0 auto; padding: 120px 0; }
  .principles-kicker { color: #77766e; margin-bottom: 30px; }
  .principles h2 { max-width: 760px; }
  .principle-list { width: 58%; margin: 80px 0 0 auto; border-top: 1px solid #c9c5bb; }
  .principle-list div { display: grid; grid-template-columns: 60px 1fr; gap: 20px; padding: 23px 0; border-bottom: 1px solid #c9c5bb; }
  .principle-list span { color: #96948b; font-family: 'DM Mono', monospace; font-size: 9px; }
  .principle-list p { margin: 0; font-size: 14px; line-height: 1.5; }
  .final-cta { width: min(1180px, calc(100% - 48px)); margin: 0 auto 25px; padding: 70px; display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; border-radius: 25px; background: var(--acid); }
  .final-cta p { margin: 0 0 22px; font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .1em; }
  .round-download { width: 124px; height: 124px; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border-radius: 50%; background: var(--ink); color: white; font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; transition: transform .25s ease; }
  .round-download:hover { transform: rotate(-6deg) scale(1.05); }
  .round-download svg { width: 25px; height: 25px; color: var(--acid); }
  footer { width: min(1180px, calc(100% - 48px)); min-height: 130px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; color: #77766f; font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; }
  .footer-brand { color: var(--ink); font-family: 'Manrope', sans-serif; font-size: 14px; text-transform: none; }
  .footer-repo { justify-self: end; display: flex; flex-direction: column; align-items: flex-end; gap: 9px; }
  .github-link { display: flex; align-items: center; gap: 8px; }
  .github-link svg { width: 17px; height: 17px; }
  .release-badge { display: block; height: 20px; opacity: .78; transition: opacity .2s ease, transform .2s ease; }
  .release-badge:hover { opacity: 1; transform: translateY(-1px); }
  .release-badge img { display: block; width: auto; height: 20px; }
  @keyframes rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes caret-blink { 0%, 48% { opacity: 1; } 49%, 100% { opacity: 0; } }
  @keyframes working-pulse { 50% { opacity: .35; transform: scale(.8); } }
  @keyframes key-press { 0%, 44%, 100% { transform: translateY(0); box-shadow: 0 2px 0 #42423d; } 52%, 68% { transform: translateY(2px); box-shadow: 0 0 0 #42423d; } }
  @keyframes corrected-in { from { opacity: .35; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes notice-in { from { opacity: 0; transform: translate(-50%, -7px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes select-open { from { opacity: 0; transform: translateY(7px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes option-picked { 0%, 35% { background: transparent; color: #85857e; } 55%, 100% { background: var(--acid); color: var(--ink); } }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation: none !important; transition: none !important; } }
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding-top: 80px; }
    .hero-copy { max-width: 650px; }
    .hero-visual { min-height: 570px; }
    .section-heading { display: block; }
    .section-heading > p { margin-bottom: 25px; }
    .setup-guide ol { grid-template-columns: 1fr; gap: 18px; }
    .settings-docs-heading { grid-template-columns: 1fr; }
    .setting-cards { grid-template-columns: repeat(2, 1fr); }
    .principle-list { width: 75%; }
  }
  @media (max-width: 640px) {
    .nav-wrap, .hero, .principles, .final-cta, footer { width: min(100% - 32px, 1180px); }
    .nav-wrap { height: 72px; }
    nav { gap: 14px; }
    nav a:first-child { display: none; }
    .hero { padding: 65px 0 60px; gap: 15px; }
    h1 { font-size: clamp(52px, 17vw, 75px); }
    .hero-lead { font-size: 15px; }
    .download-button { min-width: 0; width: 100%; }
    .linux-packages { flex-wrap: wrap; }
    .linux-packages-label { width: 100%; margin-bottom: 2px; }
    .linux-packages a { flex: 1; min-width: 82px; }
    .hero-visual { min-height: 460px; margin: 0 -16px; }
    .hero-visual::before { width: 280px; height: 280px; }
    .orbit-one { width: 340px; height: 340px; } .orbit-two { width: 390px; height: 390px; }
    .demo-shell { width: calc(100vw - 28px); }
    .demo-body { padding: 23px 12px 12px; }
    .demo-editor { min-height: 105px; padding: 16px 14px; font-size: 13px; }
    .demo-select-menu { left: 12px; bottom: 52px; }
    .demo-hints { gap: 6px; }
    .demo-hints > span:nth-child(3), .demo-latency, .demo-count { display: none; }
    .demo-stage { gap: 8px; padding-inline: 9px; }
    .demo-cases { gap: 2px; }
    .demo-cases button { width: 25px; overflow: hidden; padding: 4px; white-space: nowrap; color: transparent; }
    .demo-cases button span, .demo-cases button.active span { color: inherit; }
    .demo-progress { gap: 4px; }
    .demo-progress i { width: 7px; }
    .visual-caption { right: 15px; bottom: 0; }
    .how { padding-top: 80px; padding-bottom: 80px; }
    .setup-guide { margin-bottom: 70px; padding: 28px 22px; }
    .setup-intro h3 { font-size: 26px; }
    .provider-strip { gap: 5px; }
    .steps { grid-template-columns: 1fr; }
    .steps article, .steps article + article { min-height: 230px; padding: 24px 0; border-right: 0; border-bottom: 1px solid #3a3a35; }
    .step-icon { margin: 28px 0 20px; }
    .settings-docs { margin-top: 85px; padding-top: 75px; }
    .setting-cards { grid-template-columns: 1fr; }
    .setting-cards article { min-height: 180px; }
    .principles { padding: 85px 0; }
    .principle-list { width: 100%; margin-top: 55px; }
    .final-cta { padding: 45px 28px; align-items: flex-start; flex-direction: column; }
    .round-download { align-self: flex-end; width: 108px; height: 108px; }
    footer { grid-template-columns: 1fr auto; }
    footer > p { display: none; }
  }
`;
