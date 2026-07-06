# Changelog

Todos los cambios relevantes del proyecto se documentaran aqui.

El formato sigue una version simple de Keep a Changelog y el proyecto usa SemVer cuando existan releases publicos.

## Unreleased

### Added

- Flujo de dos fases en el helper: Enter mejora el texto y un segundo Enter lo
  confirma; `Cmd/Ctrl+Enter` vuelve a mejorar en fase review.
- Pegado automatico opt-in en la app origen (`pasteBehavior: auto_paste`) con
  simulacion de `Ctrl/Cmd+V` via `enigo`, deteccion de capacidad por plataforma
  y fallback a copia al portapapeles (Wayland, macOS sin Accessibility).
- Nota de capacidad de pegado en Settings segun la plataforma.
- Rediseño minimalista del helper: ventana sin decoraciones con esquinas
  redondeadas, superficie unica de texto y linea de estado con hints de
  teclado en lugar de botones.
- Navegacion lateral por secciones en Settings, guardado unificado de settings
  y secrets, y confirmacion en dos pasos para acciones destructivas.
- El onboarding abre en una ventana dedicada con marco nativo (~860x820) en
  lugar de la ventana compacta del helper.

- Soporte para provider OpenRouter con modelo default `openrouter/auto`.
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
- Accion explicita para borrar `custom_headers` desde onboarding/settings.
- Aviso de runtime cuando el shortcut global no queda registrado.
- Workflow CI multiplataforma para frontend y backend en Linux, macOS y Windows.
- Workflow de releases desde `main` y tags `v*`, con artefactos Linux
  `.AppImage`/`.deb`/`.rpm`, macOS `.dmg` por arquitectura y Windows
  `.exe`/`.msi`; los pushes a `main` generan prereleases automaticos.
- Salida directa desde onboarding hacia Settings para recuperar configuraciones
  problematicas.

### Changed

- El tema oscuro usa fondos negros neutros en lugar del tono verdoso,
  conservando el acento teal de la marca.
- El build release Linux define `NO_STRIP=true` para que AppImage pueda
  empaquetarse en distros rolling donde `linuxdeploy` falla con librerias
  recientes.
- Guardar settings ya no queda bloqueado por fallos de registro del atajo
  global; el aviso se mantiene para que el usuario elija otro atajo.
- En Linux, secrets pasa de `linux-native` a `linux-native-sync-persistent`
  para usar Secret Service persistente con `keyutils` como cache.
- `Test shortcut` prueba el registro sin guardar settings y restaura el atajo
  anterior despues de la prueba.
- `custom_headers` se valida como objeto JSON con valores string antes de
  guardarse.
- La configuracion Tauri ahora define una CSP explicita.

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
