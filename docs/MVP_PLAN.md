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

Pendientes principales para cerrar el MVP como release publico:

- QA manual en macOS y Windows.
- Empaquetado final por plataforma.
- Validacion con providers reales fuera del entorno local.
- Icono final y revision visual de instaladores.

## 1.1 Estado por fase

- Fase 0 Bootstrap: implementada.
- Fase 1 Floating Helper: implementada para flujo manual de input/copy.
- Fase 2 Global Shortcut y Tray: implementada, pendiente QA multiplataforma.
- Fase 3 Settings y Secrets: implementada, secrets mediante `keyring`.
- Fase 4 LLM Integration: implementada para OpenAI, OpenAI-compatible y Custom HTTP.
- Fase 5 Clipboard: implementada para copy/read mediante plugin Tauri.
- Fase 6 Tests, Packaging y QA: tests y build debug Linux listos; QA macOS/Windows pendiente.

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
- Action selector.
- Character count.
- Provider/model indicator.
- Submit con `Cmd/Ctrl + Enter`.
- Cierre con `Esc`.
- Result panel.
- Botones Copy, Replace input, Try again, New, Close.

Validacion:

- El helper abre rapido.
- El textarea recibe foco.
- Empty input muestra error local.
- Result panel no rompe layout.

## 4. Fase 2: Global Shortcut y Tray

Entregables:

- Plugin global shortcut.
- Registro de shortcut default:
  - macOS: `Command+Shift+Space`
  - Windows/Linux: `Ctrl+Shift+Space`
- Tray/menu bar.
- Menu: Open helper, Settings, Enable/disable shortcut, Start at login, Quit.
- Comandos `show_helper_window`, `hide_helper_window`, `register_user_hotkey`.

Validacion:

- Shortcut abre helper.
- Si el shortcut falla, la app muestra error accionable.
- Tray permite abrir settings y salir.

## 5. Fase 3: Settings y Secrets

Entregables:

- Dashboard de configuracion.
- Store local para settings no secretas.
- Secure storage para API key y custom headers.
- Botones Clear API key y Clear all local data.
- Controles de provider, modelo, endpoint, timeout, temperatura.
- Para OpenAI, mostrar endpoint Responses API no editable y permitir elegir modelo sugerido o modelo custom.
- Controles de modo de escritura:
  - `correctionMode`
  - `formalityLevel`
  - `creativityLevel`
  - `temperature`
- Test provider connection.

Validacion:

- Settings persisten tras reinicio.
- API key no aparece en archivos planos.
- UI indica si existe API key guardada sin mostrarla.
- Modo de escritura persiste y se envia al backend.

## 6. Fase 4: LLM Integration

Entregables:

- `LlmProvider` trait.
- Tipos `LlmRequest`, `LlmResponse`, `WritingAction`, `WritingMode`.
- `prompts.rs` con templates por accion.
- Provider OpenAI con Responses API.
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
- Icono placeholder.
- Configuracion de empaquetado.
- QA checklist ejecutada al menos en Linux local y documentada para macOS/Windows.

Validacion:

- Tests pasan.
- Build de desarrollo pasa.
- Packaging configurado para macOS y Windows.

## 9. Acceptance Criteria

MVP completo cuando:

- App instala y lanza.
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

- Reemplazo automatico en app origen.
- Captura avanzada por accessibility APIs.
- Chat history completo.
- Cloud sync.
- Team accounts.
- Payments.
- Plugin marketplace.
