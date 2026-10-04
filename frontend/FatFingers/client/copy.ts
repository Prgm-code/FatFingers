export type Language = "es" | "en";
export type ActionId = "correct" | "professional" | "shorten" | "friendly" | "quick_reply";
export type PlayAction = "correct" | "professional" | "shorten" | "friendly";
export type TargetLanguage = "original" | "en" | "es";
export type AssetKind = "mac-arm" | "mac-intel" | "windows" | "appimage" | "deb" | "rpm";
export type KeyToken = "mod" | "shift" | "space" | "enter" | "tab" | "esc" | "l" | "z" | "c" | "n" | "v" | "comma" | "digits";

// Mirrors WRITING_ACTIONS and TARGET_LANGUAGES in the desktop app: Tab and
// Cmd/Ctrl+Shift+L cycle through them in this order.
export const ACTION_ORDER: ActionId[] = ["correct", "professional", "shorten", "friendly", "quick_reply"];
export const PLAY_ACTIONS: PlayAction[] = ["correct", "professional", "shorten", "friendly"];
export const TARGET_ORDER: TargetLanguage[] = ["original", "en", "es"];
export const TARGET_CHIP: Record<TargetLanguage, string> = { original: "Aa", en: "→ EN", es: "→ ES" };
export const PROVIDERS = ["OpenAI", "MiniMax", "OpenRouter", "OpenAI-compatible", "Custom HTTP"];

export const STEP_KEYS: KeyToken[][] = [["mod", "shift", "space"], ["enter"], ["enter"]];

// Same order as copy.how.shortcuts.
export const SHORTCUT_KEYS: KeyToken[][] = [
  ["mod", "shift", "space"],
  ["enter"],
  ["mod", "enter"],
  ["shift", "enter"],
  ["tab"],
  ["mod", "digits"],
  ["mod", "shift", "l"],
  ["mod", "z"],
  ["mod", "shift", "c"],
  ["mod", "n"],
  ["mod", "comma"],
  ["esc"],
];

export const TICKER: Array<[string, string]> = [
  ["teh", "the"],
  ["mañama", "mañana"],
  ["recieve", "receive"],
  ["haber", "a ver"],
  ["definately", "definitely"],
  ["infrome", "informe"],
  ["seperate", "separate"],
  ["aveces", "a veces"],
  ["untill", "until"],
  ["através", "a través"],
  ["wich", "which"],
  ["enviame", "envíame"],
];

export type DemoExample = {
  label: string;
  action: ActionId;
  target: TargetLanguage;
  from: string;
  incoming: string;
  input: string;
  output: string;
  latency: number;
};

export type PlaygroundSample = {
  source: "es" | "en";
  input: string;
  typos: string[];
  outputs: Record<PlayAction, { same: string; other: string }>;
};

const es = {
  meta: {
    title: "FatFingers · Escribe rápido. Sin fat fingers.",
    description:
      "Asistente de escritura para escritorio. Corrige, acorta, mejora o traduce cualquier texto con un atajo de teclado, sin salir de la app en la que estás.",
  },
  skip: "Saltar al contenido",
  nav: {
    label: "Navegación principal",
    home: "FatFingers, inicio",
    how: "Cómo funciona",
    languages: "Idiomas",
    settings: "Configuración",
    privacy: "Privacidad",
    github: "GitHub",
    download: "Descargar",
    switchLanguage: "Cambiar idioma a inglés",
  },
  hero: {
    eyebrow: "Asistente de escritura para escritorio",
    latest: "Última versión",
    line1: "Escribe rápido.",
    line2: "Sin fat fingers.",
    lead: "Un atajo abre FatFingers encima de cualquier app. Escribe, pulsa Enter y recibe el texto corregido, más corto o traducido.",
    downloadFor: "Descargar para",
    seeDownloads: "Ver descargas",
    allDownloads: "Todas las descargas",
    otherFormats: "Otros formatos",
    altMac: { "mac-arm": "¿Mac con Apple Silicon?", "mac-intel": "¿Mac con Intel?" },
    meta: ["MVP alpha", "Código abierto, MIT", "macOS, Windows y Linux"],
    sceneDescription:
      "Demostración animada. Llega un mensaje a un chat, el atajo abre FatFingers, se escribe una respuesta con errores, Enter la corrige y el resultado se pega en el chat.",
    exampleBefore: "Texto original:",
    exampleAfter: "Resultado:",
    examplesLabel: "Ejemplos de la demostración",
  },
  release: {
    loading: "Buscando la última versión…",
    fallback: "Elige el archivo en GitHub",
    latest: "Última versión",
  },
  platforms: { macos: "macOS", windows: "Windows", linux: "Linux", unknown: "tu sistema" },
  kinds: {
    "mac-arm": { short: "Apple Silicon", detail: "Apple Silicon · DMG", hint: "DMG" },
    "mac-intel": { short: "Intel", detail: "Intel · DMG", hint: "DMG" },
    windows: { short: "Instalador .exe", detail: "Instalador de 64 bits", hint: "64 bits" },
    appimage: { short: "AppImage", detail: "AppImage de 64 bits", hint: "Universal" },
    deb: { short: ".deb", detail: "Paquete .deb", hint: "Debian, Ubuntu" },
    rpm: { short: ".rpm", detail: "Paquete .rpm", hint: "Fedora, RHEL" },
  } as Record<AssetKind, { short: string; detail: string; hint: string }>,
  helper: {
    placeholder: "Escribe o pega tu texto",
    actions: {
      correct: "Corregir",
      professional: "Profesional",
      shorten: "Acortar",
      friendly: "Más amable",
      quick_reply: "Respuesta rápida",
    } as Record<ActionId, string>,
    improve: "Mejorar",
    translate: "Traducir",
    close: "Cerrar",
    copyClose: "Copiar y cerrar",
    copy: "Copiar",
    undo: "Deshacer",
    back: "Volver",
    chars: "caracteres",
    working: "Trabajando…",
    copiedPaste: "Copiado. Pulsa {keys} para pegar",
  },
  scene: {
    app: "Mensajes",
    channel: "equipo",
    members: "4 personas",
    compose: "Escribe un mensaje…",
    hud: {
      summon: "Abrir FatFingers",
      select: "Cambiar acción",
      lang: "Idioma de salida",
      confirm: "Copiar y cerrar",
      paste: "Pegar en el chat",
    },
  },
  demo: [
    {
      label: "Ortografía",
      action: "correct",
      target: "original",
      from: "Ana",
      incoming: "¿Cuándo me mandas el reporte?",
      input: "Hpla, te envuo el repprte mañama por la mañaba.",
      output: "Hola, te envío el reporte mañana por la mañana.",
      latency: 846,
    },
    {
      label: "Tono",
      action: "professional",
      target: "original",
      from: "Ana",
      incoming: "¿Cómo vas con el informe?",
      input: "Buebas, no alcanso a termonar el infrome oi. Te lo mandp mañama.",
      output: "Hola, no alcanzaré a terminar el informe hoy. Te lo enviaré mañana.",
      latency: 912,
    },
    {
      label: "Brevedad",
      action: "shorten",
      target: "original",
      from: "Marta",
      incoming: "¿Necesitas algo de mi parte?",
      input: "Solo qeria preguntarte si podrias, cuando tengas un rato, mandarme el acrhivo de ayer por favpr.",
      output: "¿Puedes enviarme el archivo de ayer, por favor?",
      latency: 634,
    },
    {
      label: "Traducción",
      action: "professional",
      target: "en",
      from: "Jordan",
      incoming: "Hi! Any update on the report?",
      input: "Hola, perdon x la demroa. Te mando el imforme corejido mañana tempranp.",
      output: "Hi, apologies for the delay. I'll send you the corrected report first thing tomorrow.",
      latency: 1032,
    },
  ] as DemoExample[],
  how: {
    kicker: "Cómo funciona",
    title: "Un atajo y dos Enter.",
    tryIt: "Pulsa las teclas en tu teclado.",
    again: "otra vez",
    steps: [
      { title: "Abre", body: "Cmd/Ctrl + Shift + Space abre FatFingers encima de la app que uses." },
      { title: "Mejora", body: "Escribe o pega el texto y pulsa Enter." },
      { title: "Continúa", body: "Otro Enter copia el resultado. Con el pegado automático activo, lo pega donde estabas." },
    ],
    shortcutsTitle: "Todos los atajos",
    shortcuts: [
      "Abrir FatFingers",
      "Mejorar o confirmar",
      "Mejorar otra vez",
      "Salto de línea",
      "Cambiar de acción",
      "Elegir acción",
      "Idioma de salida",
      "Deshacer",
      "Copiar",
      "Texto nuevo",
      "Configuración",
      "Ocultar",
    ],
  },
  playground: {
    badge: "Nuevo",
    kicker: "Idioma de salida",
    title: "Elige qué hacer.",
    titleAccent: "Y en qué idioma.",
    lead: "Cualquier acción puede entregar el texto en otro idioma. Profesional → EN reescribe y traduce en un paso.",
    actionLabel: "Acción",
    languageLabel: "Idioma de salida",
    languages: { original: "Original", en: "Inglés", es: "Español" } as Record<TargetLanguage, string>,
    actionDesc: {
      correct: "Corrige ortografía y gramática",
      professional: "Reescribe con tono profesional",
      shorten: "Lo deja más corto",
      friendly: "Le da un tono más cálido",
    } as Record<PlayAction, string>,
    languageDesc: {
      original: "y mantiene el idioma original.",
      en: "y lo entrega en inglés.",
      es: "y lo entrega en español.",
    } as Record<TargetLanguage, string>,
    keys: [
      ["1-4", "acción"],
      ["L", "idioma"],
      ["↵", "aplicar"],
      ["Esc", "volver"],
    ] as Array<[string, string]>,
    helperLabel:
      "Prueba del helper. Teclas 1 a 4 para la acción, L para el idioma, Enter para aplicar y Escape para volver.",
    note: "Ejemplos escritos de antemano. En la app responde tu proveedor de IA.",
    copied: "Copiado al portapapeles",
    copyFailed: "No se pudo copiar",
    sample: {
      source: "es",
      input:
        "Hola, perdon x la demroa. No alcanse a revisar el docuemnto, pero mañana te lo mando sin falta y vemos los cambios.",
      typos: ["perdon", "x", "demroa", "alcanse", "docuemnto"],
      outputs: {
        correct: {
          same: "Hola, perdón por la demora. No alcancé a revisar el documento, pero mañana te lo mando sin falta y vemos los cambios.",
          other:
            "Hi, sorry for the delay. I didn't get to review the document, but I'll send it to you tomorrow without fail and we can go over the changes.",
        },
        professional: {
          same: "Hola, disculpa la demora. Aún no he podido revisar el documento; mañana te lo envío sin falta para que revisemos los cambios.",
          other:
            "Hello, apologies for the delay. I haven't been able to review the document yet; I'll send it to you tomorrow so we can go over the changes.",
        },
        shorten: {
          same: "Perdón por la demora. Mañana te envío el documento y vemos los cambios.",
          other: "Sorry for the delay. I'll send you the document tomorrow and we'll go over the changes.",
        },
        friendly: {
          same: "¡Hola! Perdón por la demora. Todavía no alcancé a revisar el documento, pero mañana te lo mando sin falta y lo vemos juntos.",
          other:
            "Hi! So sorry for the delay. I haven't had a chance to review the document yet, but I'll send it over tomorrow and we can look at it together.",
        },
      },
    } as PlaygroundSample,
  },
  setup: {
    kicker: "Antes de empezar",
    title: "Conecta tu",
    titleAccent: "proveedor de IA.",
    body: "FatFingers no incluye API key. Usa la tuya.",
    steps: [
      ["Abre ", "Configuración → Proveedor de IA", "."],
      ["Elige proveedor y modelo, y pega tu ", "API key", "."],
      ["Pulsa ", "Probar conexión", " y guarda."],
    ] as Array<[string, string, string]>,
    providersLabel: "Proveedores compatibles",
    secure: "La key se guarda en el llavero del sistema, nunca en el archivo de configuración.",
    window: "Configuración",
    sections: ["General", "Atajo", "Escritura", "Acciones", "Proveedor", "Privacidad"],
    pane: "Proveedor de IA",
    fields: { provider: "Proveedor", model: "Modelo", key: "API key" },
    keyring: "Guardada en el llavero del sistema",
    test: "Probar conexión",
    ok: "Conexión correcta",
  },
  settings: {
    title: "Configuración",
    items: [
      { label: "General", body: "Idioma, tema, acción e idioma de salida por defecto." },
      { label: "Atajo", body: "Graba tu propio atajo global." },
      { label: "Escritura", body: "Cuatro modos, más formalidad, creatividad y temperatura." },
      { label: "Acciones", body: "Cinco acciones y una instrucción propia." },
      { label: "Proveedor", body: "Modelo, endpoint, timeout y headers." },
      { label: "Privacidad", body: "Borra la key, el historial o todos los datos locales." },
    ],
  },
  principles: {
    kicker: "Privacidad",
    title: "Tu texto solo va al proveedor que elijas.",
    stats: [
      { value: "0", label: "telemetría" },
      { value: "Off", label: "historial por defecto" },
      { value: "5", label: "proveedores compatibles" },
    ],
  },
  cta: {
    title: "Descarga FatFingers",
    then: "Después, pulsa",
    platformsLabel: "Todas las plataformas",
    releases: "Ver todas las descargas",
  },
  footer: {
    tagline: "Asistente de escritura de código abierto.",
    label: "Enlaces del proyecto",
    changelog: "Cambios",
    license: "Licencia MIT",
    badgeAlt: "Última release de FatFingers",
    badgeLabel: "Ver la última release de FatFingers",
    rights: "© 2026 FatFingers contributors",
  },
};

export type Copy = typeof es;

const en: Copy = {
  meta: {
    title: "FatFingers · Write fast. Without fat fingers.",
    description:
      "A desktop writing assistant. Correct, shorten, improve, or translate any text with a keyboard shortcut, without leaving the app you're in.",
  },
  skip: "Skip to content",
  nav: {
    label: "Main navigation",
    home: "FatFingers, home",
    how: "How it works",
    languages: "Languages",
    settings: "Settings",
    privacy: "Privacy",
    github: "GitHub",
    download: "Download",
    switchLanguage: "Switch language to Spanish",
  },
  hero: {
    eyebrow: "Desktop writing assistant",
    latest: "Latest release",
    line1: "Write fast.",
    line2: "Without fat fingers.",
    lead: "One shortcut opens FatFingers on top of any app. Type, press Enter, and get your text back corrected, shorter, or translated.",
    downloadFor: "Download for",
    seeDownloads: "See downloads",
    allDownloads: "All downloads",
    otherFormats: "Other formats",
    altMac: { "mac-arm": "Apple Silicon Mac?", "mac-intel": "Intel Mac?" },
    meta: ["MVP alpha", "Open source, MIT", "macOS, Windows, and Linux"],
    sceneDescription:
      "Animated demo. A message arrives in a chat, the shortcut opens FatFingers, a reply full of typos gets written, Enter fixes it, and the result is pasted into the chat.",
    exampleBefore: "Original text:",
    exampleAfter: "Result:",
    examplesLabel: "Demo examples",
  },
  release: {
    loading: "Finding the latest release…",
    fallback: "Pick the file on GitHub",
    latest: "Latest release",
  },
  platforms: { macos: "macOS", windows: "Windows", linux: "Linux", unknown: "your system" },
  kinds: {
    "mac-arm": { short: "Apple Silicon", detail: "Apple Silicon · DMG", hint: "DMG" },
    "mac-intel": { short: "Intel", detail: "Intel · DMG", hint: "DMG" },
    windows: { short: ".exe installer", detail: "64-bit installer", hint: "64-bit" },
    appimage: { short: "AppImage", detail: "64-bit AppImage", hint: "Universal" },
    deb: { short: ".deb", detail: ".deb package", hint: "Debian, Ubuntu" },
    rpm: { short: ".rpm", detail: ".rpm package", hint: "Fedora, RHEL" },
  },
  helper: {
    placeholder: "Write or paste your text",
    actions: {
      correct: "Correct",
      professional: "Professional",
      shorten: "Shorten",
      friendly: "Friendly",
      quick_reply: "Quick reply",
    },
    improve: "Improve",
    translate: "Translate",
    close: "Close",
    copyClose: "Copy & close",
    copy: "Copy",
    undo: "Undo",
    back: "Back",
    chars: "chars",
    working: "Working…",
    copiedPaste: "Copied. Press {keys} to paste",
  },
  scene: {
    app: "Messages",
    channel: "team",
    members: "4 people",
    compose: "Write a message…",
    hud: {
      summon: "Open FatFingers",
      select: "Switch action",
      lang: "Output language",
      confirm: "Copy & close",
      paste: "Paste into the chat",
    },
  },
  demo: [
    {
      label: "Spelling",
      action: "correct",
      target: "original",
      from: "Sam",
      incoming: "When can you send the report?",
      input: "Helo, I'll senf you the repprt tomorroe mornimg.",
      output: "Hello, I'll send you the report tomorrow morning.",
      latency: 846,
    },
    {
      label: "Tone",
      action: "professional",
      target: "original",
      from: "Sam",
      incoming: "How's the report coming along?",
      input: "Hey, I cant fnish the repotr today. Ill send it tomorroe.",
      output: "Hello, I won't be able to finish the report today. I'll send it tomorrow.",
      latency: 912,
    },
    {
      label: "Brevity",
      action: "shorten",
      target: "original",
      from: "Priya",
      incoming: "Do you need anything from me?",
      input: "I just wanted to aks if maybe, whenever you have a momemt, you could send me yesterdays flie please.",
      output: "Could you send me yesterday's file, please?",
      latency: 634,
    },
    {
      label: "Translation",
      action: "correct",
      target: "es",
      from: "Lucía",
      incoming: "¡Te mandé el resumen del trimestre!",
      input: "Thnaks for teh summary! I'll chek the numbers and get bakc to you today.",
      output: "¡Gracias por el resumen! Reviso los números y te respondo hoy.",
      latency: 1032,
    },
  ],
  how: {
    kicker: "How it works",
    title: "One shortcut, two Enters.",
    tryIt: "Press the keys on your keyboard.",
    again: "again",
    steps: [
      { title: "Open", body: "Cmd/Ctrl + Shift + Space opens FatFingers on top of the app you're using." },
      { title: "Improve", body: "Type or paste your text and press Enter." },
      { title: "Continue", body: "Enter again copies the result. With auto-paste on, it pastes where you were." },
    ],
    shortcutsTitle: "All shortcuts",
    shortcuts: [
      "Open FatFingers",
      "Improve or confirm",
      "Improve again",
      "New line",
      "Switch action",
      "Pick an action",
      "Output language",
      "Undo",
      "Copy",
      "New text",
      "Settings",
      "Hide",
    ],
  },
  playground: {
    badge: "New",
    kicker: "Output language",
    title: "Choose what to do.",
    titleAccent: "And in which language.",
    lead: "Any action can return your text in another language. Professional → EN rewrites and translates in one step.",
    actionLabel: "Action",
    languageLabel: "Output language",
    languages: { original: "Original", en: "English", es: "Spanish" },
    actionDesc: {
      correct: "Fixes spelling and grammar",
      professional: "Rewrites it in a professional tone",
      shorten: "Makes it shorter",
      friendly: "Makes it sound warmer",
    },
    languageDesc: {
      original: "and keeps the original language.",
      en: "and returns it in English.",
      es: "and returns it in Spanish.",
    },
    keys: [
      ["1-4", "action"],
      ["L", "language"],
      ["↵", "apply"],
      ["Esc", "back"],
    ],
    helperLabel: "Helper demo. Keys 1 to 4 pick the action, L switches the language, Enter applies, and Escape goes back.",
    note: "Pre-written examples. In the app, your AI provider writes the result.",
    copied: "Copied to clipboard",
    copyFailed: "Couldn't copy",
    sample: {
      source: "en",
      input:
        "Hey, sorry for teh delay. I didnt get to reveiw the docuemnt yet, but I'll send it tomorow for sure and we can go over the chnages.",
      typos: ["teh", "didnt", "reveiw", "docuemnt", "tomorow", "chnages"],
      outputs: {
        correct: {
          same: "Hey, sorry for the delay. I didn't get to review the document yet, but I'll send it tomorrow for sure and we can go over the changes.",
          other:
            "Hola, perdón por la demora. Todavía no alcancé a revisar el documento, pero mañana te lo envío sin falta y repasamos los cambios.",
        },
        professional: {
          same: "Hello, apologies for the delay. I haven't reviewed the document yet; I'll send it tomorrow so we can go over the changes.",
          other: "Hola, disculpa la demora. Aún no he revisado el documento; te lo enviaré mañana para que repasemos los cambios.",
        },
        shorten: {
          same: "Sorry for the delay. I'll send the document tomorrow and we'll go over the changes.",
          other: "Perdón por la demora. Mañana te envío el documento y repasamos los cambios.",
        },
        friendly: {
          same: "Hi! So sorry for the delay. I haven't had a chance to review the document yet, but I'll send it tomorrow and we can go over the changes together.",
          other:
            "¡Hola! Mil disculpas por la demora. Todavía no he podido revisar el documento, pero mañana te lo envío y repasamos los cambios juntos.",
        },
      },
    },
  },
  setup: {
    kicker: "Before you start",
    title: "Connect your",
    titleAccent: "AI provider.",
    body: "FatFingers doesn't include an API key. Use your own.",
    steps: [
      ["Open ", "Settings → AI Provider", "."],
      ["Choose a provider and model, then paste your ", "API key", "."],
      ["Click ", "Test connection", ", then save."],
    ],
    providersLabel: "Supported providers",
    secure: "Your key is stored in the system keychain, never in the settings file.",
    window: "Settings",
    sections: ["General", "Shortcut", "Writing", "Actions", "Provider", "Privacy"],
    pane: "AI Provider",
    fields: { provider: "Provider", model: "Model", key: "API key" },
    keyring: "Stored in the system keychain",
    test: "Test connection",
    ok: "Connection OK",
  },
  settings: {
    title: "Settings",
    items: [
      { label: "General", body: "Language, theme, default action, and output language." },
      { label: "Shortcut", body: "Record your own global shortcut." },
      { label: "Writing", body: "Four modes, plus formality, creativity, and temperature." },
      { label: "Actions", body: "Five actions and your own instruction." },
      { label: "Provider", body: "Model, endpoint, timeout, and headers." },
      { label: "Privacy", body: "Delete your key, your history, or all local data." },
    ],
  },
  principles: {
    kicker: "Privacy",
    title: "Your text only goes to the provider you choose.",
    stats: [
      { value: "0", label: "telemetry" },
      { value: "Off", label: "history by default" },
      { value: "5", label: "supported providers" },
    ],
  },
  cta: {
    title: "Download FatFingers",
    then: "Then press",
    platformsLabel: "All platforms",
    releases: "See all downloads",
  },
  footer: {
    tagline: "Open-source writing assistant.",
    label: "Project links",
    changelog: "Changelog",
    license: "MIT License",
    badgeAlt: "Latest FatFingers release",
    badgeLabel: "View the latest FatFingers release",
    rights: "© 2026 FatFingers contributors",
  },
};

export const COPY: Record<Language, Copy> = { es, en };
