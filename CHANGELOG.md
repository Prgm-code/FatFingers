# Changelog

Todos los cambios relevantes del proyecto se documentaran aqui.

El formato sigue una version simple de Keep a Changelog y el proyecto usa SemVer cuando existan releases publicos.

## Unreleased

### Added

- Selector de idioma de interfaz ingles/español persistido en settings.
- Helper reducido a ventana compacta, con selector de accion compacto y panel de resultado oculto hasta generar.
- El helper ahora ejecuta con Enter, reemplaza el input con el resultado y permite Undo.
- Settings abre en ventana separada de mayor tamaño.
- Preparacion open source del repositorio.
- README actualizado con estado MVP alpha.
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` y templates de GitHub.
- Nota de QA Linux sobre el warning no bloqueante de `libayatana-appindicator` al inicializar el tray.
- Soporte para provider MiniMax con modelo default `MiniMax-M3` y wire API `responses`.
- El helper recarga settings al guardar cambios desde la ventana de configuracion y muestra datos de request LLM en modo dev.

### Changed

- El build release Linux define `NO_STRIP=true` para que AppImage pueda
  empaquetarse en distros rolling donde `linuxdeploy` falla con librerias
  recientes.

## 0.1.0-alpha

### Added

- App Tauri v2 con React, TypeScript, Vite y Rust.
- Helper flotante con acciones de escritura.
- Onboarding y settings.
- Atajo global y tray/menu bar.
- Provider OpenAI con Responses API.
- Provider OpenAI-compatible.
- Provider Custom HTTP.
- Almacenamiento seguro de API key y custom headers con `keyring`.
- Persistencia de settings no secretos.
- Clipboard copy/read.
- Tests frontend/backend basicos.
- Build debug Linux `.deb`.
