# FatFingers

FatFingers es una aplicacion desktop multiplataforma para corregir, pulir, reescribir y redactar respuestas cortas usando un proveedor LLM configurable.

La app funciona como un helper flotante tipo Spotlight/Raycast: corre en segundo plano, se abre con un atajo global, permite escribir o pegar texto, ejecuta una accion de escritura y deja el resultado listo para copiar.

## Estado actual

Estado: MVP alpha funcional.

Implementado:

- App Tauri v2 con frontend React/TypeScript/Vite y backend Rust.
- Helper flotante con input, selector de accion, contador, resultado y copia al portapapeles.
- Onboarding y pantalla de settings.
- Atajo global configurable.
- Tray/menu bar con acciones basicas.
- Persistencia local de settings no secretos.
- Almacenamiento seguro de `provider_api_key` y `custom_headers` mediante `keyring`.
- Provider OpenAI usando Responses API desde Rust.
- Provider MiniMax usando Responses API desde Rust.
- Provider OpenAI-compatible usando Chat Completions.
- Provider Custom HTTP.
- Acciones `Correct`, `Professional`, `Shorten`, `Friendly`, `QuickReply`, `TranslateEnglish`, `TranslateSpanish` y `Custom`.
- Controles de modo de escritura, formalidad, creatividad, temperatura, timeout y max output tokens.
- Tests frontend y backend basicos.
- Build debug Linux `.deb`.

Pendiente antes de considerar un release estable:

- QA manual completa en macOS y Windows.
- Firmado/notarizacion e instaladores finales por plataforma.
- Iconografia final.
- Validacion amplia con providers reales.
- Mejoras de accesibilidad y navegacion keyboard-first.
- Documentar soporte exacto de keyring por plataforma.

Fuera del MVP:

- Reemplazo automatico de texto en la app origen.
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
- `openai_compatible`: usa `/chat/completions` sobre el `baseUrl` configurado.
- `custom_http`: envia un JSON simple a un endpoint definido por el usuario.

La lista sugerida de modelos OpenAI vive en `src/lib/settings.ts` y permite ingresar un modelo custom.

## Requisitos de desarrollo

- Node.js compatible con Vite 7.
- `pnpm`.
- Rust stable.
- Dependencias de Tauri v2 para la plataforma local.

En Linux, el almacenamiento seguro usa `keyring` con backend `linux-native` (`keyutils`). El entorno debe permitir kernel keyrings para que las API keys sean recuperables por la app.

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
pnpm tauri build --debug --bundles deb
```

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
