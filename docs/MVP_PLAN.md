# MVP Plan

## 1. Resumen

El MVP debe entregar una app desktop Tauri v2 funcional para correcciones y reescrituras cortas con LLM configurable.

Estado actual: MVP alpha implementado en Linux local.

La implementacion actual prioriza:

- Bootstrap estable.
- Helper flotante rapido.
- Settings completos.
- Seguridad de API key.
- Provider OpenAI funcional.
- Copia al portapapeles.
- Tests basicos.
- Workflow de prereleases automaticos y draft releases multiplataforma en
  GitHub Actions.
- Version SemVer unica por cada ejecucion de `main`, sincronizada en los
  manifests antes de compilar y usada como tag del prerelease.

Pendientes principales para cerrar el MVP como release publico:

- QA manual en macOS y Windows.
- Revision de draft release real y empaquetado firmado/notarizado final por plataforma.
- Validacion con providers reales fuera del entorno local.
- Icono final y revision visual de instaladores.

## 1.1 Estado por fase

- Fase 0 Bootstrap: implementada.
- Fase 1 Floating Helper: implementada para flujo manual de input/copy.
- Fase 2 Global Shortcut y Tray: implementada, pendiente QA multiplataforma.
- Fase 3 Settings y Secrets: implementada, secrets mediante `keyring`.
- Fase 4 LLM Integration: implementada para OpenAI, MiniMax, OpenRouter, OpenAI-compatible y Custom HTTP.
- Fase 5 Clipboard: implementada para copy/read mediante plugin Tauri.
- Fase 6 Tests, Packaging y QA: tests, build debug Linux y workflow de release
  multiplataforma listos; QA macOS/Windows pendiente.

## 2. Fase 0: Bootstrap

Entregables:

- Crear proyecto Tauri v2 con React, TypeScript, Vite y pnpm.
- Configurar metadata de app con nombre `FatFingers`.
- Configurar linting y formatting.
- Crear estructura base frontend/backend segun `docs/ARCHITECTURE.md`.
- Agregar README de desarrollo cuando exista codigo.

Validacion:

- `pnpm install`
- `pnpm dev`
- `pnpm tauri dev`
- build frontend sin errores.

## 3. Fase 1: Floating Helper

Entregables:

- Ventana helper compacta.
- Textarea con foco inmediato.
- Selector de accion compacto, usando `defaultAction` como valor inicial.
- Character count.
- Provider/model indicator.
- Submit con `Enter`; `Shift + Enter` inserta salto de linea.
- Cierre con `Esc`.
- El resultado reemplaza el texto del textarea.
- Boton Undo para restaurar el texto original tras una generacion.
- Botones minimos Copy, Undo cuando aplique y Run.

Validacion:

- El helper abre rapido.
- El helper abre en tamaño compacto con padding suficiente y no conserva un tamaño gigante previo.
- El textarea recibe foco.
- Empty input muestra error local.
- El textarea mantiene tamaño estable al reemplazar input por resultado.

## 4. Fase 2: Global Shortcut y Tray

Entregables:

- Plugin global shortcut.
- Registro de shortcut default:
  - macOS: `Command+Shift+Space`
  - Windows/Linux: `Ctrl+Shift+Space`
- Tray/menu bar.
- Menu: Open helper, Settings, Enable/disable shortcut, Start at login, Quit.
- Comandos `show_helper_window`, `hide_helper_window`, `register_user_hotkey`.
- Dialogo de captura del shortcut para elegir la combinacion desde el teclado
  sin escribir el accelerator manualmente.

Validacion:

- Shortcut abre helper.
- Si el shortcut falla, la app muestra error accionable.
- Tray permite abrir settings y salir.

## 5. Fase 3: Settings y Secrets

Entregables:

- Dashboard de configuracion.
- Ventana de settings separada del helper, con tamaño amplio y resizable.
- Store local para settings no secretas.
- Secure storage para API key y custom headers.
- Botones Clear API key y Clear all local data.
- Controles de provider, modelo, endpoint, timeout, temperatura.
- Selector de idioma de interfaz `en`/`es`.
- Para OpenAI, mostrar endpoint Responses API no editable y permitir elegir modelo sugerido o modelo custom.
- Controles de modo de escritura:
  - `correctionMode`
  - `formalityLevel`
  - `creativityLevel`
  - `temperature`
- Test provider connection.

Validacion:

- Settings persisten tras reinicio.
- Una instalacion nueva abre Settings antes de mostrar el helper.
- Cerrar Settings mantiene la app accesible desde el tray.
- API key no aparece en archivos planos.
- UI indica si existe API key guardada sin mostrarla.
- Modo de escritura persiste y se envia al backend.
- Idioma de interfaz persiste tras reinicio y no cambia el idioma de salida del LLM.

## 6. Fase 4: LLM Integration

Entregables:

- `LlmProvider` trait.
- Tipos `LlmRequest`, `LlmResponse`, `WritingAction`, `WritingMode`.
- `prompts.rs` con templates por accion.
- Provider OpenAI con Responses API.
- Provider MiniMax con Responses API, modelo default `MiniMax-M3` y base URL default `https://api.minimax.io/v1`.
- Provider OpenRouter con Chat Completions, endpoint fijo `https://openrouter.ai/api/v1/chat/completions` y modelo default `openrouter/auto`.
- Provider OpenAI-compatible.
- Provider Custom HTTP.
- Timeout y error mapping.

Validacion:

- `Correct` corrige texto sin explicar.
- `Professional`, `Shorten`, `Friendly` y `QuickReply` funcionan.
- `correctionMode`, `formalityLevel`, `creativityLevel` y `temperature` afectan prompt/params.
- Errores de API key, timeout, red y modelo se muestran de forma amigable.

## 7. Fase 5: Clipboard

Entregables:

- `copy_to_clipboard`.
- `read_clipboard_text`.
- Boton Copy.
- Atajo `Cmd/Ctrl + Shift + C`.
- Auto-copy opcional.
- Auto-close after copy opcional.

Validacion:

- Copy funciona en macOS, Windows y Linux.
- Permisos de clipboard fallan con mensaje claro.
- Auto-copy respeta setting.

## 8. Fase 6: Tests, Packaging y QA

Entregables:

- Tests backend de prompts, settings, secrets y provider body generation.
- Tests frontend de onboarding, settings, empty input, action selector, result copy, error banner y keyboard submit.
- Tests frontend de selector de idioma y labels basicos en ingles/español.
- Icono de aplicacion generado desde `src/assets/fatfingers-logo.png` para los
  formatos y tamaños requeridos por Tauri.
- Configuracion de empaquetado.
- QA checklist ejecutada al menos en Linux local y documentada para macOS/Windows.

Validacion:

- Tests pasan.
- Build de desarrollo pasa.
- Packaging configurado para macOS y Windows.

## 9. Acceptance Criteria

MVP completo cuando:

- App instala y lanza.
- Primera ejecucion abre Settings sin mostrar un WebView blanco/transparente.
- Tray/menu bar funciona.
- Shortcut global abre helper.
- Textarea enfoca.
- Acciones MVP funcionan.
- Provider configurado recibe solicitudes desde Rust.
- Resultado se muestra y se copia.
- Settings persisten.
- API key se guarda segura.
- No hay logging de texto por defecto.
- Errores son claros.
- Tests basicos existen.
- Packaging macOS/Windows esta configurado.

## 10. Fuera de MVP

- Captura avanzada por accessibility APIs (leer texto de otras apps).
- Chat history completo.
- Cloud sync.
- Team accounts.
- Payments.
- Plugin marketplace.

## 11. Post-MVP en progreso

- Roadmap v1.2 adelantado: pegado automatico en la app origen mediante flujo
  de dos fases con Enter, ajuste opt-in `pasteBehavior` (default `clipboard`)
  y fallback a copia manual. Ver `docs/ROADMAP.md` y
  `docs/SECURITY_PRIVACY.md` seccion 9.
- Rediseño minimalista del helper (ventana frameless) y navegacion lateral en
  settings. Ver `docs/PRODUCT_SPEC.md` secciones 7 y 9.
