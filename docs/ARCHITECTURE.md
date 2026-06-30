# Arquitectura

## 1. Resumen

FatFingers sera una app Tauri v2 con frontend React/TypeScript y backend Rust.

El frontend renderiza onboarding, helper flotante y settings. El backend controla ventanas, tray, shortcuts globales, clipboard, settings, secrets y llamadas LLM.

React no debe llamar proveedores LLM directamente.

## 2. Estructura frontend prevista

```text
src/
  main.tsx
  App.tsx

  components/
    FloatingEditor.tsx
    ActionSelector.tsx
    ResultPanel.tsx
    LoadingState.tsx
    ErrorBanner.tsx
    SettingsButton.tsx
    ShortcutRecorder.tsx
    ProviderForm.tsx
    TrayHint.tsx

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

## 3. Estructura backend prevista

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

  settings/
    mod.rs
    store.rs
    secrets.rs

  llm/
    mod.rs
    types.rs
    prompts.rs
    openai.rs
    openai_compatible.rs
    custom_http.rs

  errors/
    mod.rs

  tests/
    prompt_tests.rs
    settings_tests.rs
```

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

type AppSettings = {
  appName: string;
  hotkey: string;
  provider: "openai" | "openai_compatible" | "custom_http";
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
  launchAtLogin: boolean;
  theme: "system" | "light" | "dark";
  storeHistory: boolean;
};
```

Secrets:

```text
provider_api_key
custom_headers
```

Los secrets no deben guardarse en settings planos.

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
async fn register_user_hotkey(hotkey: String) -> Result<(), AppError>;

#[tauri::command]
async fn show_helper_window() -> Result<(), AppError>;

#[tauri::command]
async fn hide_helper_window() -> Result<(), AppError>;
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
- Usar modelo configurable.
- Usar `store: false` cuando aplique.
- Aplicar timeout.
- Parsear output text de forma segura.
- Mapear errores a mensajes amigables.

### 8.2 OpenAI-compatible

Debe permitir:

- `baseUrl`
- API key
- Modelo
- Headers opcionales guardados como secret

### 8.3 Custom HTTP

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

1. Usuario abre helper con shortcut global.
2. Frontend solicita settings al backend.
3. Usuario escribe texto y elige accion.
4. Frontend llama `correct_text`.
5. Backend valida input y settings.
6. Backend lee secretos si son necesarios.
7. Backend construye prompt.
8. Backend llama al provider seleccionado.
9. Backend devuelve `CorrectTextResponse`.
10. Frontend muestra resultado.
11. Usuario copia resultado con `copy_to_clipboard`.

## 10. Ventanas

Ventanas previstas:

- `helper`: flotante, compacta, always-on-top, ocultable.
- `settings`: dashboard de configuracion.
- `onboarding`: primer lanzamiento.

El helper debe ocultarse en vez de destruirse al presionar `Esc`.

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
- SecureStorageUnavailable
- InvalidSettings
- ProviderError

No incluir secretos ni texto del usuario en errores.
