# AGENTS.md

Guia para agentes que trabajen en FatFingers.

## Estado actual

El proyecto esta en fase de especificacion. No inicialices Tauri, no generes codigo fuente y no instales dependencias salvo que el usuario lo pida explicitamente.

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
- Reemplazo automatico de texto en la app origen.

## Reemplazo en app origen

La funcion de volver a presionar Enter para escribir o reemplazar el texto en la aplicacion desde la cual se lanzo el helper queda en roadmap v1.2.

Motivo: requiere automatizacion OS-specific, permisos de accesibilidad y fallback manual por plataforma.

El MVP debe copiar el resultado al portapapeles. v1.1 puede capturar texto seleccionado mediante clipboard y dejar el texto corregido copiado para que el usuario pegue manualmente.

## Convenciones de documentacion

- Mantener specs en español.
- Mantener nombres de tipos, comandos, APIs y modulos en ingles.
- Actualizar docs antes de implementar cambios que alteren comportamiento publico.
- No duplicar secretos ni ejemplos con API keys reales.
