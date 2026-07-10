# Arquitectura

## 1. Resumen

FatFingers es una app Tauri v2 con frontend React/TypeScript y backend Rust.

El frontend renderiza onboarding, helper flotante y settings. El backend controla ventanas, tray, shortcuts globales, clipboard, settings, secrets y llamadas LLM.

React no debe llamar proveedores LLM directamente.

`ShortcutRecorder` mantiene el accelerator como un valor de solo lectura y
abre un dialogo frontend para capturar eventos de teclado. La conversion desde
`KeyboardEvent.code` a los nombres aceptados por `global-hotkey` vive en
`src/lib/hotkeys.ts`; Rust conserva la validacion y el registro definitivo del
atajo.

## 1.1 Estado implementado

La arquitectura base ya esta implementada en el repo.

Componentes principales actuales:

- `src/App.tsx`: selecciona vista inicial, carga settings y estado de secrets.
- `src/screens/Helper.tsx`: helper flotante y ejecucion de acciones.
- `src/screens/Onboarding.tsx`: primer flujo de configuracion.
- `src/screens/Settings.tsx`: dashboard de configuracion.
- `src/components/ProviderForm.tsx`: provider, modelo, API key y headers.
- `src-tauri/src/lib.rs`: registro de comandos Tauri y plugins.
- `src-tauri/src/app/`: ventanas separadas de helper/settings, tray, shortcuts y clipboard.
- `src-tauri/src/settings/`: settings, history y secrets.
- `src-tauri/src/llm/`: providers, prompt builder y tipos LLM.
- `src-tauri/src/errors/`: errores serializables para IPC.

Los comandos Tauri usan Rust como unico punto de salida hacia proveedores LLM.
El frontend solo invoca comandos Tauri mediante `src/lib/tauri.ts`.

El workflow de release deriva una version unica para cada build de `main`
(`<version-base>-main.<run_number>`) y la sincroniza temporalmente en
`package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` y
`src-tauri/Cargo.lock` mediante `scripts/set-version.mjs`. Estos cambios solo
existen dentro del runner: no se empujan commits automaticos a `main`.

Antes de iniciar la matriz de packaging, un job unico crea o reutiliza el
GitHub Release correspondiente. Los jobs Linux, macOS y Windows dependen de ese
job y solo compilan y adjuntan artefactos; ninguno compite por crear el mismo
tag o release.

## 2. Estructura frontend

```text
src/
  main.tsx
  App.tsx

  components/
    ActionSelector.tsx
    ErrorBanner.tsx
    SettingsButton.tsx
    ShortcutRecorder.tsx
    ProviderForm.tsx

  screens/
    Onboarding.tsx
    Helper.tsx
    Settings.tsx
    About.tsx

  lib/
    tauri.ts
    settings.ts
    validators.ts
    hotkeys.ts

  styles/
    globals.css
    helper.css
    settings.css

  types/
    app.ts
    llm.ts
```

## 3. Estructura backend

```text
src-tauri/src/
  main.rs
  lib.rs

  app/
    mod.rs
    windows.rs
    tray.rs
    hotkeys.rs
    clipboard.rs
    paste.rs

  settings/
    mod.rs
    store.rs
    secrets.rs

  llm/
    mod.rs
    types.rs
    prompts.rs
    openai.rs
    minimax.rs
    openrouter.rs
    openai_compatible.rs
    custom_http.rs

  errors/
    mod.rs

  tests/
    prompt_tests.rs
    settings_tests.rs
```

Ventanas Tauri actuales:

- `helper`: overlay compacto always-on-top para escribir, mejorar y confirmar.
  Sin decoraciones nativas (`decorations: false`), fondo transparente con
  contenedor redondeado dibujado por CSS y fuera de la taskbar
  (`skipTaskbar: true`). Tamaño por defecto `600x220`, minimo `460x160`.
  Se crea bajo demanda desde `src-tauri/src/app/windows.rs` y permanece oculta
  durante una instalacion nueva.
- `settings`: dashboard de configuracion en ventana separada con navegacion
  lateral. Tamaño por defecto `920x720`, minimo `760x560`.
- `onboarding`: primer flujo de configuracion en ventana propia, con marco
  nativo y opaca (`index.html?view=onboarding`). Tamaño por defecto `860x820`,
  minimo `680x680`. Se crea bajo demanda y se cierra al finalizar el
  onboarding. No se reutiliza la ventana del helper: alternar decoraciones
  nativas sobre una ventana transparente rompe el hit-testing de la barra de
  titulo en algunos entornos.

El backend Rust decide la ventana inicial antes de mostrar un WebView. Si no
existe un archivo de settings valido abre `settings`; en caso contrario abre
`helper`. Todas las ventanas se construyen inicialmente con `visible: false` y
se muestran al recibir `PageLoadEvent::Finished`. React no decide el primer
lanzamiento ni usa el estado de Credential Manager/Keychain/Secret Service para
elegir la ventana.

`app/paste.rs` implementa el pegado automatico en la app origen: escribe el
resultado al clipboard, oculta el helper (el sistema devuelve el foco a la app
anterior), espera un delay corto y sintetiza `Ctrl+V`/`Cmd+V` con `enigo`.
Expone la deteccion de capacidad por plataforma (`simulated` |
`clipboard_only`) y hace fallback a copia manual cuando la simulacion no esta
disponible (Wayland, macOS sin Accessibility) o falla en runtime.

## 4. Tipos principales

### 4.1 WritingAction

```rust
pub enum WritingAction {
    Correct,
    Professional,
    Shorten,
    Friendly,
    TranslateEnglish,
    TranslateSpanish,
    QuickReply,
    Custom,
}
```

### 4.2 WritingMode

```rust
pub enum WritingMode {
    PlainText,
    Balanced,
    Formal,
    Creative,
}
```

### 4.3 LlmRequest

```rust
pub struct LlmRequest {
    pub action: WritingAction,
    pub input_text: String,
    pub custom_instruction: Option<String>,
    pub model: String,
    pub temperature: Option<f32>,
    pub max_output_tokens: Option<u32>,
    pub correction_mode: WritingMode,
    pub formality_level: Option<u8>,
    pub creativity_level: Option<u8>,
}
```

### 4.4 LlmResponse

```rust
pub struct LlmResponse {
    pub output_text: String,
    pub provider: String,
    pub model: String,
    pub latency_ms: u128,
}
```

### 4.5 LlmProvider

```rust
pub trait LlmProvider {
    async fn generate(&self, request: LlmRequest) -> Result<LlmResponse, LlmError>;
}
```

## 5. Settings

TypeScript:

```ts
type WritingAction =
  | "correct"
  | "professional"
  | "shorten"
  | "friendly"
  | "translate_english"
  | "translate_spanish"
  | "quick_reply"
  | "custom";

type WritingMode = "plain_text" | "balanced" | "formal" | "creative";
type AppLanguage = "en" | "es";

type AppSettings = {
  appName: string;
  language: AppLanguage;
  hotkey: string;
  provider: "openai" | "minimax" | "openrouter" | "openai_compatible" | "custom_http";
  baseUrl?: string;
  model: string;
  defaultAction: WritingAction;
  correctionMode: WritingMode;
  formalityLevel: number;
  creativityLevel: number;
  temperature: number;
  maxOutputTokens: number;
  timeoutSeconds: number;
  autoCopy: boolean;
  autoCloseAfterCopy: boolean;
  pasteBehavior: "clipboard" | "auto_paste";
  launchAtLogin: boolean;
  theme: "system" | "light" | "dark";
  storeHistory: boolean;
};
```

`pasteBehavior` controla que hace Enter en fase `review`: `clipboard` (default)
copia al portapapeles; `auto_paste` pega en la app origen. En Rust el campo usa
`#[serde(default)]` para que settings antiguos sin el campo carguen con
`clipboard`.

Rust:

```rust
pub enum AppLanguage {
    En,
    Es,
}
```

`language` se serializa como `en` o `es` y controla solo la interfaz React. Los
settings antiguos sin `language` deben cargar con default `en`.

Secrets:

```text
provider_api_key
custom_headers
```

Los secrets no deben guardarse en settings planos.

Implementacion actual:

- `provider_api_key` y `custom_headers` se guardan con `keyring`.
- Nombre de servicio: `FatFingers`.
- Linux usa `keyring` con feature `linux-native-sync-persistent`, Secret Service
  para persistencia y `keyutils` como cache de sesion.
- macOS usa `apple-native`.
- Windows usa `windows-native`.
- `save_secret` verifica que el valor pueda leerse despues de guardarse para evitar falsos positivos.
- `custom_headers` debe ser un objeto JSON con valores string.

## 6. Tauri commands

```rust
#[tauri::command]
async fn get_settings() -> Result<AppSettings, AppError>;

#[tauri::command]
async fn save_settings(settings: AppSettings) -> Result<(), AppError>;

#[tauri::command]
async fn save_secret(name: String, value: String) -> Result<(), AppError>;

#[tauri::command]
async fn has_secret(name: String) -> Result<bool, AppError>;

#[tauri::command]
async fn delete_secret(name: String) -> Result<(), AppError>;

#[tauri::command]
async fn correct_text(request: CorrectTextRequest) -> Result<CorrectTextResponse, AppError>;

#[tauri::command]
async fn test_provider_connection() -> Result<TestProviderResponse, AppError>;

#[tauri::command]
async fn copy_to_clipboard(text: String) -> Result<(), AppError>;

#[tauri::command]
async fn read_clipboard_text() -> Result<String, AppError>;

#[tauri::command]
async fn paste_back(text: String) -> Result<PasteBackOutcome, AppError>;

#[tauri::command]
async fn get_paste_capability() -> Result<PasteCapability, AppError>;

#[tauri::command]
async fn register_user_hotkey(hotkey: String) -> Result<(), AppError>;

#[tauri::command]
async fn show_helper_window() -> Result<(), AppError>;

#[tauri::command]
async fn hide_helper_window() -> Result<(), AppError>;

#[tauri::command]
async fn show_settings_window() -> Result<(), AppError>;

#[tauri::command]
async fn hide_settings_window() -> Result<(), AppError>;
```

## 7. Prompt builder

Archivo obligatorio:

```text
src-tauri/src/llm/prompts.rs
```

Cada accion debe mapear a un prompt template. El builder debe recibir `WritingAction`, `WritingMode`, `formalityLevel`, `creativityLevel` y `customInstruction`.

Reglas:

- `Correct` devuelve solo texto corregido.
- `Professional` prioriza claridad y formalidad.
- `Shorten` conserva significado esencial.
- `Friendly` vuelve el texto mas calido y natural.
- `QuickReply` responde como el usuario.
- `Custom` aplica la instruccion del usuario.
- Ningun prompt debe pedir explicaciones salvo que exista una accion explicativa futura.

## 8. Providers

### 8.1 OpenAI

Debe usar HTTP directo desde Rust contra la Responses API.

Requisitos:

- Leer API key desde secrets.
- Usar endpoint fijo `https://api.openai.com/v1/responses`.
- Usar modelo configurable.
- Ofrecer en frontend una lista sugerida de modelos OpenAI y permitir un modelo custom.
- Usar `store: false` cuando aplique.
- Aplicar timeout.
- Parsear output text de forma segura.
- Mapear errores a mensajes amigables.

### 8.2 MiniMax

Debe usar HTTP directo desde Rust contra la Responses API compatible de MiniMax.

Defaults:

- `provider`: `minimax`
- `baseUrl`: `https://api.minimax.io/v1`
- endpoint efectivo: `https://api.minimax.io/v1/responses`
- `model`: `MiniMax-M3`
- `model_context_window`: `1000000`

La API key se guarda en el mismo secret `provider_api_key`.

### 8.3 OpenRouter

Debe usar HTTP directo desde Rust contra la API compatible con OpenAI de
OpenRouter.

Defaults:

- `provider`: `openrouter`
- endpoint efectivo: `https://openrouter.ai/api/v1/chat/completions`
- `model`: `openrouter/auto`

La API key se guarda en el mismo secret `provider_api_key`. El backend debe
enviar `X-Title` con el nombre configurado de la app y permitir headers
opcionales guardados como secret, por ejemplo `HTTP-Referer`.

Cuando OpenRouter devuelve el campo `model`, la respuesta de FatFingers debe
reportar ese valor para mostrar el modelo realmente usado por el router.

### 8.4 OpenAI-compatible

Debe permitir:

- `baseUrl`
- API key
- Modelo
- Headers opcionales guardados como secret

### 8.5 Custom HTTP

Request:

```json
{
  "model": "string",
  "instruction": "string",
  "input": "string",
  "temperature": 0.2,
  "max_output_tokens": 800
}
```

Response:

```json
{
  "output_text": "string"
}
```

## 9. Flujo de datos

1. Usuario abre helper con shortcut global, tray o segundo lanzamiento de app.
2. Frontend solicita settings al backend.
3. Frontend limpia el estado local del helper para iniciar una nueva sesion.
4. Usuario escribe texto y elige accion.
5. Frontend llama `correct_text`.
6. Backend valida input y settings.
7. Backend lee secretos si son necesarios.
8. Backend construye prompt.
9. Backend llama al provider seleccionado.
10. Backend devuelve `CorrectTextResponse`.
11. Frontend muestra el resultado en el textarea y pasa a fase `review`.
12. Usuario confirma con Enter: segun `pasteBehavior`, el frontend llama
    `paste_back` (el backend copia al clipboard, oculta el helper y sintetiza
    el atajo de pegado, con fallback a `clipboard_only`) o `copy_to_clipboard`
    y cierra el helper.

## 10. Ventanas

Ventanas actuales:

- `helper`: flotante, compacta, always-on-top, ocultable.
- `settings`: dashboard de configuracion.
- `onboarding`: asistente opcional en una ventana dedicada.

El helper debe ocultarse en vez de destruirse al presionar `Esc`.
En una instalacion nueva, Settings es la primera ventana visible; al cerrarla la
app sigue disponible desde el tray.

## 11. Errores

Crear `AppError` tipado con categorias:

- MissingApiKey
- InvalidApiKey
- ProviderTimeout
- NetworkUnavailable
- ModelUnavailable
- EmptyInput
- ShortcutUnavailable
- ClipboardUnavailable
- PasteUnavailable
- SecureStorageUnavailable
- InvalidSettings
- ProviderError

No incluir secretos ni texto del usuario en errores.
