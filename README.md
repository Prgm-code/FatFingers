# FatFingers

FatFingers es una aplicacion desktop multiplataforma para corregir, pulir, reescribir, traducir o redactar respuestas cortas usando un proveedor LLM configurable.

El producto se comporta como un overlay rapido tipo Spotlight, Raycast o Alfred: corre en segundo plano, se abre con un atajo global, permite escribir o pegar texto, ejecuta una accion de escritura y devuelve un resultado listo para copiar.

## Estado del proyecto

Este repositorio esta en fase de especificacion. Todavia no contiene la aplicacion Tauri ni codigo fuente.

La implementacion futura debe seguir las specs en `docs/` y las instrucciones para agentes en `AGENTS.md`.

## Objetivo MVP

El MVP debe permitir:

- Ejecutar la app en macOS, Windows y Linux con Tauri v2.
- Abrir un helper flotante mediante un atajo global.
- Escribir o pegar texto en una ventana compacta siempre visible.
- Elegir acciones de IA: corregir, profesionalizar, acortar, hacer mas amable y respuesta rapida.
- Configurar proveedor LLM, API key, modelo, endpoint, temperatura, timeout y accion por defecto.
- Configurar modo de correccion/escritura: solo texto, balanceado, formalidad y creatividad.
- Enviar solicitudes LLM desde Rust, nunca desde React.
- Mostrar el resultado y copiarlo al portapapeles.
- Persistir configuraciones no secretas localmente.
- Guardar API keys y headers secretos en almacenamiento seguro.
- Ejecutarse desde tray/menu bar.
- Manejar errores de proveedor, red, API key, shortcut y clipboard con mensajes claros.

## Stack definido

- Tauri v2
- Rust backend
- React
- TypeScript
- Vite
- pnpm
- CSS modules o CSS plano
- Sin UI framework pesado para el MVP

Plugins Tauri previstos:

- Global shortcut
- Clipboard manager
- Store
- Stronghold o almacenamiento seguro equivalente
- Log/shell solo si son estrictamente necesarios

## LLM providers

La arquitectura debe aislar los proveedores detras de una interfaz Rust `LlmProvider`.

Providers MVP:

- OpenAI con Responses API
- OpenAI-compatible endpoint
- Custom HTTP endpoint local/remoto

Providers futuros:

- Anthropic
- Gemini
- Ollama
- LM Studio
- Modelos locales

## Privacidad

Principios obligatorios:

- Las API keys no se guardan en archivos de settings.
- El texto del usuario no se loggea por defecto.
- No hay telemetria por defecto.
- El historial local esta desactivado por defecto.
- La configuracion debe explicar que el texto se envia solo al proveedor elegido por el usuario.

## Documentacion

- `docs/PRODUCT_SPEC.md`: especificacion funcional del producto.
- `docs/ARCHITECTURE.md`: arquitectura frontend/backend.
- `docs/MVP_PLAN.md`: fases de implementacion y criterios de aceptacion.
- `docs/SECURITY_PRIVACY.md`: decisiones de seguridad y privacidad.
- `docs/QA_CHECKLIST.md`: pruebas manuales y automatizadas esperadas.
- `docs/ROADMAP.md`: evolucion posterior al MVP.
- `AGENTS.md`: reglas para agentes que trabajen en el proyecto.

## Comandos futuros esperados

Cuando la app exista:

```bash
pnpm install
pnpm dev
pnpm tauri dev
pnpm test
pnpm build
pnpm tauri build
```

## Roadmap resumido

- MVP: helper flotante, settings, shortcut global, tray, OpenAI provider, copiar resultado.
- v1.1: capturar texto seleccionado mediante flujo de clipboard y dejar resultado copiado.
- v1.2: reemplazar texto en la app origen con permisos explicitos por sistema operativo.
- v1.3: modelos locales con Ollama, LM Studio y endpoints OpenAI-compatible.
- v1.4: presets, snippets y acciones personalizadas.
