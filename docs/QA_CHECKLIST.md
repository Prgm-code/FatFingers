# QA Checklist

## 1. Backend tests

- Prompt generation para `Correct`.
- Prompt generation para `Professional`.
- Prompt generation para `Shorten`.
- Prompt generation para `Friendly`.
- Prompt generation para `QuickReply`.
- Prompt generation para `Custom`.
- `correctionMode` modifica prompt segun modo.
- `formalityLevel` afecta modo formal/profesional.
- `creativityLevel` afecta modo creativo/custom.
- Empty input devuelve error.
- Settings read/write.
- Secret existence check.
- Secret delete.
- OpenAI request body generation.
- OpenAI-compatible request body generation.
- Custom HTTP request body generation.
- Provider timeout mapping.
- Invalid API key mapping.
- Model unavailable mapping.
- Clipboard command behavior donde sea posible.

## 2. Frontend tests

- Onboarding renderiza primer paso.
- Provider selection cambia campos visibles.
- Settings validation bloquea valores invalidos.
- Empty input state bloquea submit.
- Action selector cambia accion.
- Writing behavior controls actualizan settings.
- Result copy button llama backend.
- Error banner muestra mensajes amigables.
- Keyboard submit con `Cmd/Ctrl + Enter`.
- `Esc` cierra u oculta helper.
- `Cmd/Ctrl + Shift + C` copia resultado.

## 3. Manual QA comun

- App lanza correctamente.
- App aparece en tray/menu bar.
- Shortcut global abre helper.
- Helper se abre centrado.
- Textarea recibe foco inmediatamente.
- Helper abre con textarea limpio y sin resultado anterior.
- `Esc` oculta helper.
- `Cmd/Ctrl + Enter` ejecuta accion.
- Correccion funciona con provider real.
- Resultado aparece sin explicaciones en modo `Correct`.
- Copy funciona.
- Settings persisten tras reinicio.
- API key no se muestra tras guardar.
- API key no aparece en settings planos.
- Shortcut se puede cambiar.
- Error de shortcut usado se muestra claro.
- Test provider connection muestra exito/error.
- App quita limpiamente desde tray.

## 4. macOS

- Default shortcut `Command+Shift+Space`.
- Menu bar item aparece.
- Helper always-on-top funciona.
- Clipboard copy funciona.
- App empaqueta para macOS.
- Permisos futuros de Accessibility quedan fuera del MVP.

## 5. Windows

- Default shortcut `Ctrl+Shift+Space`.
- Tray icon aparece.
- Helper always-on-top funciona.
- Clipboard copy funciona.
- App empaqueta para Windows.
- Shortcut conflict muestra error claro.

## 6. Linux

- Default shortcut `Ctrl+Shift+Space`.
- Tray funciona en entorno soportado.
- Warning `libayatana-appindicator is deprecated` no se considera bloqueante si el tray funciona.
- Helper always-on-top funciona donde el WM lo permita.
- Clipboard copy funciona.
- Errores de portal/clipboard son claros.
- App corre en desarrollo local.

## 7. Privacy QA

- No hay logs de input text.
- No hay logs de output text.
- No hay logs de API key.
- Telemetria esta off.
- History esta off.
- Clear API key funciona.
- Clear all local data funciona.

## 8. Acceptance smoke test

1. Lanzar app.
2. Abrir settings.
3. Configurar OpenAI API key y modelo.
4. Guardar settings.
5. Abrir helper con shortcut.
6. Ingresar texto con errores.
7. Ejecutar `Correct`.
8. Ver resultado.
9. Copiar resultado.
10. Pegar en otra app manualmente.

## 9. Ejecucion local registrada

Fecha: 2026-06-30.

Entorno: Linux local.

Comandos ejecutados:

- `pnpm test`: 17 tests frontend pasan.
- `pnpm build`: TypeScript y build Vite pasan.
- `cargo fmt --check`: pasa.
- `cargo check`: pasa.
- `cargo test`: 21 tests backend pasan.
- `pnpm tauri build --debug --bundles deb`: genera `src-tauri/target/debug/bundle/deb/FatFingers_0.1.0_amd64.deb`.
- `pnpm tauri build`: genera paquetes release Linux `.deb`, `.rpm` y `.AppImage`.

Notas:

- El build Linux usa `keyring` con backend `linux-native`.
- En Linux, `scripts/run-tauri.mjs` define `NO_STRIP=true` para builds Tauri.
  Esto evita que `linuxdeploy` falle en distros rolling al ejecutar su `strip`
  embebido sobre librerias con seccion ELF `.relr.dyn`.
- En el entorno local puede aparecer un warning de deprecacion de `libayatana-appindicator` al inicializar el tray. El warning viene de la dependencia Linux usada por Tauri/tray-icon y no se considera fallo si el tray aparece y responde.
- El test con provider real requiere API key del usuario y no se ejecuta en CI local.
- Las validaciones de secrets verifican que el valor guardado pueda leerse nuevamente.

Validaciones pendientes por plataforma:

- Empaquetado y smoke test manual en macOS.
- Empaquetado y smoke test manual en Windows.
- Prueba con provider real usando API key del usuario.
