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
- API key sigue disponible despues de reiniciar el sistema.
- Custom headers se guardan solo si son objeto JSON con valores string.
- Custom headers se pueden borrar desde la UI.
- Shortcut se puede cambiar.
- Test shortcut no persiste el atajo si no se guardan settings.
- Error de shortcut usado se muestra claro.
- Un fallo al registrar el shortcut no bloquea completar onboarding ni guardar
  otros settings.
- Onboarding permite abrir Settings directamente como salida de recuperacion.
- Test provider connection muestra exito/error.
- App quita limpiamente desde tray.

## 4. macOS

- Default shortcut `Command+Shift+Space`.
- Menu bar item aparece.
- Helper always-on-top funciona.
- Clipboard copy funciona.
- App empaqueta para macOS.
- Accessibility permissions solo se solicitan al usar `auto_paste` (ver 6.1).

## 5. Windows

- En una instalacion limpia, la primera ventana visible es Settings.
- El helper transparente no aparece durante el bootstrap ni tapa Settings.
- Cerrar Settings deja la app operativa y accesible desde el tray.
- La ausencia o fallo de Credential Manager no bloquea el render de Settings.
- Default shortcut `Ctrl+Shift+Space`.
- Tray icon aparece.
- Tray icon es visible y clicable despues de cerrar la ventana.
- Helper always-on-top funciona.
- Clipboard copy funciona.
- App empaqueta para Windows.
- Shortcut conflict muestra error claro.

## 6. Linux

- Default shortcut `Ctrl+Shift+Space`.
- Tray funciona en entorno soportado.
- Warning `libayatana-appindicator is deprecated` no se considera bloqueante si el tray funciona.
- Shortcut global se valida en X11 y en sesiones Wayland soportadas.
- Si el shortcut global no se puede registrar en Wayland, la UI muestra aviso claro.
- Secrets persisten tras logout/reboot cuando Secret Service esta disponible.
- Helper always-on-top funciona donde el WM lo permita.
- Clipboard copy funciona.
- Errores de portal/clipboard son claros.
- App corre en desarrollo local.

## 6.1 Pegado automatico (dos fases)

Comun:

- Con `pasteBehavior: clipboard` (default): Enter mejora, segundo Enter copia
  al portapapeles, muestra aviso y oculta el helper.
- Con `pasteBehavior: auto_paste` en plataforma soportada: enfocar un campo de
  texto en otra app, abrir helper con shortcut, escribir, Enter, Enter; el
  texto aparece en el campo origen y el helper se oculta.
- Editar el resultado antes del segundo Enter pega el texto editado.
- `Cmd/Ctrl + Enter` en fase review vuelve a mejorar en lugar de pegar.
- Reabrir el helper con el shortcut resetea a fase compose.
- Settings muestra nota de capacidad cuando el pegado simulado no esta
  disponible.
- Si la simulacion falla en runtime, el flujo cae a copia + aviso sin error
  destructivo.
- El contenido de texto previo del clipboard se restaura tras el pegado
  simulado (best-effort).

Por plataforma:

- Linux X11: pegado simulado funciona via libxdo.
- Linux Wayland: capacidad reportada `clipboard_only`; el flujo usa el
  fallback y el aviso "Copiado - pulsa Ctrl+V".
- Windows: pegado simulado funciona.
- macOS: el primer intento dispara el prompt de Accessibility; con permiso
  denegado el fallback funciona, con permiso concedido el pegado funciona.

## 6.2 Artefactos de release

GitHub Actions:

- Pushear a `main` crea un prerelease automatico con tag
  `v<version-base>-main.<run_number>` y los binarios contienen esa misma
  version.
- Pushear otra rama o un tag no ejecuta el workflow de release.
- El job `Validate release` falla si `package.json`,
  `src-tauri/tauri.conf.json` y `src-tauri/Cargo.toml` tienen versiones
  distintas.
- El release generado desde `main` queda marcado como prerelease.
- Los assets usan el formato
  `FatFingers-v<version>-<platform>-<arch>[setup].<ext>` y no duplican el tipo
  de bundle en el nombre (`.deb.deb`, `.exe.exe`, etc.).

Linux:

- El prerelease contiene `.AppImage`.
- El prerelease contiene `.deb`.
- El prerelease contiene `.rpm`.
- Smoke test minimo: descargar AppImage, marcar ejecutable y lanzar en una
  distro Linux con WebKitGTK/Secret Service disponibles.
- Smoke test minimo `.deb`: instalar en Debian/Ubuntu compatible y lanzar app.
- Smoke test minimo `.rpm`: instalar en Fedora/RHEL/openSUSE compatible y
  lanzar app.

macOS:

- El prerelease contiene un `.dmg` para Apple Silicon.
- El prerelease contiene un `.dmg` para Intel.
- El workflow alpha usa firma ad-hoc (`APPLE_SIGNING_IDENTITY=-`) y no importa
  certificados Apple.
- Smoke test minimo: abrir DMG, mover app a Applications y lanzar.
- Si el build no esta firmado/notarizado, documentar el aviso de Gatekeeper
  esperado para release alpha.

Windows:

- El prerelease contiene instalador NSIS `.exe`.
- El prerelease no intenta generar MSI con una version `*-main.<run_number>`.
- Smoke test minimo: instalar, lanzar, verificar tray y desinstalar.
- Si el build no esta firmado, documentar el aviso de SmartScreen esperado para
  release alpha.

## 7. Privacy QA

- No hay logs de input text.
- No hay logs de output text.
- No hay logs de API key.
- Telemetria esta off.
- History esta off.
- Clear API key funciona.
- Clear custom headers funciona.
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

- `pnpm test`: tests frontend pasan.
- `pnpm build`: TypeScript y build Vite pasan.
- `cargo fmt --check`: pasa.
- `cargo check`: pasa.
- `cargo test`: tests backend pasan.
- `pnpm tauri build --debug --bundles deb`: genera `src-tauri/target/debug/bundle/deb/FatFingers_0.1.0_amd64.deb`.
- `pnpm tauri build`: genera paquetes release Linux `.deb`, `.rpm` y `.AppImage`.

Notas:

- El build Linux usa `keyring` con backend `linux-native-sync-persistent`.
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
