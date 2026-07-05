# AGENTS.md

Guia para agentes que trabajen en FatFingers.

## Estado actual

El proyecto ya tiene una primera implementacion Tauri/React/Rust. No reinicialices Tauri ni reemplaces la estructura existente salvo que el usuario lo pida explicitamente.

Estado publico: MVP alpha. El repo esta preparado para publicarse como open source, pero todavia requiere QA macOS/Windows y packaging final antes de un release estable.

Antes de implementar, lee:

- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/MVP_PLAN.md`
- `docs/SECURITY_PRIVACY.md`

## Principios de implementacion futura

- Usar Tauri v2, Rust, React, TypeScript, Vite y pnpm.
- Mantener el backend Rust como unico punto de comunicacion con proveedores LLM.
- No llamar OpenAI ni ningun LLM directamente desde React.
- Mantener proveedores LLM aislados detras de `LlmProvider`.
- No hardcodear un unico modelo.
- Mantener el nombre `FatFingers` configurable desde una configuracion central.
- Mantener la UI minimalista, rapida y keyboard-first.
- No agregar frameworks UI pesados para el MVP.
- Preferir modulos pequeños y tipos explicitos.
- Agregar comentarios solo donde ayuden a entender decisiones no obvias.

## Seguridad obligatoria

- No guardar API keys en settings planos.
- No loggear secretos.
- No loggear texto del usuario por defecto.
- No exponer comandos Tauri que permitan ejecucion arbitraria de shell.
- No habilitar telemetria por defecto.
- No guardar historial salvo que el usuario lo active explicitamente.
- Tratar `provider_api_key` y `custom_headers` como secretos.

## Alcance MVP

El MVP incluye:

- Helper flotante.
- Dashboard de configuracion.
- Atajo global.
- Tray/menu bar.
- Persistencia de settings.
- Almacenamiento seguro de API key.
- Provider OpenAI.
- Provider OpenAI-compatible.
- Provider Custom HTTP.
- Accion de correccion y acciones basicas de reescritura.
- Copiar resultado al portapapeles.
- Tests basicos.

El MVP no incluye:

- Chat completo.
- Historial por defecto.
- Extension de navegador.
- Cuentas de equipo.
- Cloud sync.
- Pagos.
- Marketplace de plugins.
- Lectura de texto de otras apps (captura por accessibility APIs).

## Reemplazo en app origen

La funcion de volver a presionar Enter para pegar el texto en la aplicacion desde la cual se lanzo el helper (roadmap v1.2) esta adelantada e implementada como pegado automatico opt-in.

Reglas:

- El pegado automatico se controla con el ajuste `pasteBehavior` (`clipboard` default | `auto_paste`). Nunca simular teclado sin opt-in.
- La implementacion vive en `src-tauri/src/app/paste.rs`: copiar al clipboard, ocultar el helper, delay corto y sintetizar `Ctrl/Cmd+V` con `enigo`.
- Fallback obligatorio a copia manual cuando la simulacion no esta disponible (Wayland, macOS sin Accessibility) o falla en runtime.
- FatFingers nunca lee el contenido de la app origen.
- Ver `docs/SECURITY_PRIVACY.md` seccion 9 y `docs/ROADMAP.md` v1.2.

## Convenciones de documentacion

- Mantener specs en español.
- Mantener nombres de tipos, comandos, APIs y modulos en ingles.
- Actualizar docs antes de implementar cambios que alteren comportamiento publico.
- No duplicar secretos ni ejemplos con API keys reales.
- Mantener `README.md`, `CONTRIBUTING.md`, `SECURITY.md` y `CHANGELOG.md` sincronizados con cambios publicos relevantes.
