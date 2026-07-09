# FatFingers

FatFingers es una aplicacion desktop multiplataforma para corregir, pulir, reescribir y redactar respuestas cortas usando un proveedor LLM configurable.

La app funciona como un helper flotante tipo Spotlight/Raycast: corre en segundo plano, se abre con un atajo global, permite escribir o pegar texto, ejecuta una accion de escritura y deja el resultado listo para copiar.

## Estado actual

Estado: MVP alpha funcional.

Implementado:

- App Tauri v2 con frontend React/TypeScript/Vite y backend Rust.
- Helper flotante con input, selector de accion, contador, resultado y copia al portapapeles.
- Onboarding y pantalla de settings.
- Primera ejecucion segura: una instalacion nueva abre Settings antes de crear
  el helper y, al cerrar la ventana, la app sigue disponible desde el tray.
- Atajo global configurable.
- Tray/menu bar con acciones basicas.
- Persistencia local de settings no secretos.
- Almacenamiento seguro de `provider_api_key` y `custom_headers` mediante `keyring`.
- Provider OpenAI usando Responses API desde Rust.
- Provider MiniMax usando Responses API desde Rust.
- Provider OpenRouter usando Chat Completions desde Rust.
- Provider OpenAI-compatible usando Chat Completions.
- Provider Custom HTTP.
- Acciones `Correct`, `Professional`, `Shorten`, `Friendly`, `QuickReply`, `TranslateEnglish`, `TranslateSpanish` y `Custom`.
- Controles de modo de escritura, formalidad, creatividad, temperatura, timeout y max output tokens.
- Tests frontend y backend basicos.
- Build debug Linux `.deb`.
- Workflow de GitHub Actions para crear draft releases multiplataforma desde tags.

Pendiente antes de considerar un release estable:

- QA manual completa en macOS y Windows.
- Firmado/notarizacion final por plataforma.
- Iconografia final.
- Validacion amplia con providers reales.
- Mejoras de accesibilidad y navegacion keyboard-first.

En progreso (roadmap v1.2 adelantado):

- Flujo de dos fases: Enter mejora el texto y un segundo Enter lo pega en la
  app origen (ajuste opt-in `pasteBehavior`, default copiar al portapapeles).
  En Linux Wayland la simulacion de teclado esta restringida y el flujo usa el
  fallback a portapapeles; en macOS requiere permiso de Accessibility.

Fuera del MVP:

- Lectura de texto de otras apps (captura por accessibility APIs).
- Historial por defecto.
- Extension de navegador.
- Cuentas de equipo, cloud sync, pagos y marketplace de plugins.

## Privacidad

FatFingers no incluye telemetria por defecto y no guarda historial salvo opt-in explicito.

La API key no se guarda en `settings.json` ni en variables de entorno. Se guarda como secreto:

- Servicio: `FatFingers`
- Secreto API key: `provider_api_key`
- Secreto headers: `custom_headers`

El texto del usuario se envia solo al proveedor configurado por el usuario y todas las llamadas LLM salen desde Rust, nunca desde React.

## Providers

Providers actuales:

- `openai`: usa `https://api.openai.com/v1/responses`.
- `minimax`: usa `https://api.minimax.io/v1/responses` por defecto, modelo `MiniMax-M3`.
- `openrouter`: usa `https://openrouter.ai/api/v1/chat/completions` con modelo default `openrouter/auto`.
- `openai_compatible`: usa `/chat/completions` sobre el `baseUrl` configurado.
- `custom_http`: envia un JSON simple a un endpoint definido por el usuario.

La lista sugerida de modelos OpenAI vive en `src/lib/settings.ts` y permite ingresar un modelo custom.

## Requisitos de desarrollo

- Node.js compatible con Vite 7.
- `pnpm`.
- Rust stable.
- Dependencias de Tauri v2 para la plataforma local.
- La simulacion de pegado (`auto_paste`) usa `enigo` con backends puros de
  Rust (X11 via `x11rb` y el protocolo virtual-keyboard de Wayland); no
  requiere paquetes extra del sistema.

En Linux, el almacenamiento seguro usa `keyring` con backend
`linux-native-sync-persistent`: Secret Service via D-Bus para persistir
despues de reinicios y `keyutils` como cache de sesion. El entorno debe tener
un Secret Service compatible, como GNOME Keyring o KWallet, para persistencia
de secrets.

El tray de Linux depende del soporte AppIndicator/Ayatana disponible en el
desktop environment. Algunas versiones de `libayatana-appindicator` imprimen
un warning de deprecacion al iniciar el tray:
`Please use libayatana-appindicator-glib in newly written code`. En FatFingers
esto viene de la dependencia nativa usada por Tauri para el tray y no bloquea el
funcionamiento de la app.

## Uso local

Instalar dependencias:

```bash
pnpm install
```

Ejecutar frontend solamente:

```bash
pnpm dev
```

Ejecutar app Tauri:

```bash
pnpm tauri dev
```

Tests y builds:

```bash
pnpm test
pnpm build
pnpm tauri build
pnpm tauri build --debug --bundles deb
```

En Linux, `pnpm tauri build` genera paquetes `.deb`, `.rpm` y `.AppImage`. En
distros rolling como Arch, el wrapper de Tauri define `NO_STRIP=true` para evitar
fallos de `linuxdeploy` al procesar librerias del sistema recientes.

## Releases

Los builds de release se generan con GitHub Actions en dos casos:

- Cada push a `main` crea un prerelease automatico para probar el ultimo commit.
- Cada tag `v*` crea un draft release versionado para revision manual.

Formato recomendado para releases versionados:

```bash
git tag v0.1.0-alpha
git push origin v0.1.0-alpha
```

El workflow valida que `package.json`, `src-tauri/tauri.conf.json` y
`src-tauri/Cargo.toml` tengan la misma version. El tag debe ser exactamente esa
version con prefijo `v` (`v0.1.0`) o un prerelease basado en ella
(`v0.1.0-alpha`). Los builds automaticos desde `main` reciben una version unica
con formato `<version-base>-main.<run_number>` y usan el tag
`v<version-base>-main.<run_number>`. El cambio de version ocurre solo dentro de
GitHub Actions; el workflow no crea commits automaticos en `main`.

Cada release sube artefactos para:

- Linux: `.AppImage`, `.deb` y `.rpm`.
- macOS: `.dmg` para Apple Silicon y `.dmg` para Intel.
- Windows: instalador NSIS `.exe` y paquete `.msi`.

Los assets usan el formato `FatFingers-v<version>-<platform>-<arch>[setup].<ext>`,
por ejemplo `FatFingers-v0.1.0-linux-amd64.AppImage` y
`FatFingers-v0.1.0-windows-x64-setup.exe`.

Los artefactos automaticos y alpha pueden estar sin firma de distribucion. En
macOS el workflow usa firma ad-hoc para poder generar el `.dmg` sin importar un
certificado Apple; en Windows no hay firma de codigo. Esto puede mostrar avisos
de seguridad hasta configurar certificados, firmado y notarizacion finales.

Checks backend:

```bash
cd src-tauri
cargo fmt --check
cargo check
cargo test
```

## Estructura

```text
src/
  components/       Componentes React reutilizables
  screens/          Helper, settings, onboarding y about
  lib/              Wrappers Tauri, settings y validadores
  styles/           CSS plano
  types/            Tipos compartidos frontend

src-tauri/src/
  app/              Ventanas, tray, shortcuts y clipboard
  settings/         Settings, history y secrets
  llm/              Providers, prompts y tipos LLM
  errors/           Errores serializables para IPC

docs/               Specs, arquitectura, QA, roadmap y privacidad
```

## Documentacion

- `docs/PRODUCT_SPEC.md`: comportamiento del producto.
- `docs/ARCHITECTURE.md`: arquitectura actual y contratos.
- `docs/MVP_PLAN.md`: estado del MVP y pendientes.
- `docs/SECURITY_PRIVACY.md`: decisiones de seguridad y privacidad.
- `docs/QA_CHECKLIST.md`: pruebas automatizadas y manuales.
- `docs/ROADMAP.md`: evolucion planificada.
- `docs/OPEN_SOURCE_CHECKLIST.md`: checklist para publicar y preparar releases.
- `AGENTS.md`: reglas para agentes/coding assistants.

## Contribuir

Lee `CONTRIBUTING.md` antes de abrir cambios. Para cambios de comportamiento publico, actualiza primero los docs relevantes en `docs/`.

Reglas principales:

- No llames proveedores LLM desde React.
- No guardes secrets en settings planos.
- No agregues telemetria por defecto.
- No agregues frameworks UI pesados para el MVP.
- Mantiene la UI rapida, compacta y keyboard-first.

## Seguridad

Para reportar vulnerabilidades, sigue `SECURITY.md`. No abras issues publicos con API keys, textos privados, headers secretos o trazas que contengan informacion sensible.

## Licencia

MIT. Ver `LICENSE`.
