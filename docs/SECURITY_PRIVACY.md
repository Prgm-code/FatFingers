# Seguridad y Privacidad

## 1. Principios

FatFingers procesa texto potencialmente sensible. La implementacion debe minimizar almacenamiento, logging y exposicion innecesaria.

Principios obligatorios:

- API keys en almacenamiento seguro.
- Settings no secretos en store local.
- Texto del usuario no loggeado por defecto.
- Telemetria off por defecto.
- Historial off por defecto.
- No comandos Tauri para shell arbitrario.
- No llamadas LLM desde frontend.

## 2. Secrets

Secrets definidos:

```text
provider_api_key
custom_headers
```

Reglas:

- No guardar secrets en JSON de settings.
- No imprimir secrets en logs.
- No devolver secrets completos al frontend.
- `has_secret` solo devuelve boolean.
- `delete_secret` debe borrar el valor del almacenamiento seguro.

Implementacion actual:

- Se usa `keyring` desde Rust.
- Servicio: `FatFingers`.
- `provider_api_key` y `custom_headers` son los unicos nombres aceptados.
- `custom_headers` debe ser un objeto JSON con valores string.
- `save_secret` guarda y luego intenta leer el valor desde una entrada nueva.
- Si el valor no puede recuperarse, la operacion falla con `SecureStorageUnavailable`.
- No se usan variables de entorno para guardar API keys.

Backends configurados:

- Linux: `keyring` con `linux-native-sync-persistent` (Secret Service
  persistente via D-Bus y `keyutils` como cache de sesion).
- macOS: `apple-native` (Keychain).
- Windows: `windows-native` (Credential Manager).

## 3. Settings no secretas

Settings permitidas en store:

- appName
- language
- hotkey
- provider
- baseUrl
- model
- defaultAction
- correctionMode
- formalityLevel
- creativityLevel
- temperature
- maxOutputTokens
- timeoutSeconds
- autoCopy
- autoCloseAfterCopy
- pasteBehavior
- launchAtLogin
- theme
- storeHistory

`baseUrl` no es secreto, pero no debe incluir tokens.

Archivo actual:

- `settings.json` en el directorio de configuracion de la app resuelto por Tauri.
- No debe contener `provider_api_key` ni `custom_headers`.

## 4. Texto del usuario

Reglas:

- No loggear input text.
- No loggear output text por defecto.
- No guardar historial salvo opt-in explicito.
- Si `storeHistory` esta activo, guardar solo localmente.
- Debe existir accion para limpiar historial local.

## 5. Telemetria

Default:

- Off.

Si se implementa despues:

- Debe ser opt-in.
- No debe incluir texto del usuario.
- No debe incluir API key.
- Debe poder desactivarse desde settings.

## 6. Aviso de privacidad en settings

Texto obligatorio:

```text
Your text is sent only to the AI provider you configure.
```

Tambien debe quedar claro:

- FatFingers no provee el modelo.
- El proveedor configurado puede procesar el texto segun sus propias politicas.
- El usuario controla API key, endpoint y modelo.

## 7. Providers

Requisitos:

- Toda llamada LLM se hace desde Rust.
- Usar timeout configurable.
- Usar `store: false` en OpenAI cuando aplique.
- MiniMax usa el mismo secret `provider_api_key`; `baseUrl` y modelo se guardan como settings no secretos.
- OpenRouter usa el mismo secret `provider_api_key`; el modelo se guarda como setting no secreto y los headers opcionales se guardan en `custom_headers`.
- No incluir secrets ni texto en errores.
- Mapear errores raw a errores de usuario.

Errores amigables:

```text
No API key configured. Open Settings to add one.
```

```text
The AI provider did not respond before the timeout. Try again or increase the timeout in Settings.
```

```text
This shortcut could not be registered. It may already be used by another app.
```

## 8. Clipboard

Riesgos:

- El clipboard puede contener informacion sensible.
- Otras apps pueden leer clipboard.

Reglas:

- Copy debe ser accion explicita salvo que `autoCopy` este activo.
- `autoCopy` debe estar visible en settings.
- `read_clipboard_text` solo debe usarse por accion explicita o flujo documentado.
- No guardar contenido de clipboard por defecto.

## 9. Reemplazo en app origen

Implementado como pegado automatico opt-in (roadmap v1.2 adelantado).

Reglas de diseno:

- El pegado automatico se controla con el ajuste `pasteBehavior` (`clipboard` | `auto_paste`). Default: `clipboard`. La simulacion de teclado nunca ocurre sin opt-in.
- La accion clara del usuario es el segundo Enter en fase `review`: el usuario ya vio el texto mejorado y confirma su insercion.
- macOS requiere Accessibility permissions; el sistema muestra el prompt en el primer intento y Settings explica por que se necesita.
- Fallback manual garantizado: si la simulacion no esta disponible (Wayland, permiso denegado) o falla en runtime, FatFingers copia el texto al clipboard y avisa al usuario ("Copiado - pulsa Ctrl+V").
- No se captura texto de la app origen: FatFingers solo escribe, nunca lee el contenido del campo destino.
- Restauracion del clipboard previo: best-effort y solo texto; contenido no textual (imagenes, archivos) se pierde al pegar. Documentado como limitacion.
- Los errores de pegado son genericos ("Automatic paste is not available on this system.") y nunca incluyen texto del usuario ni secrets.

## 10. Clear all local data

Debe borrar:

- Settings locales.
- Secrets.
- Historial local, si existe.
- Cache propia de la app, si existe.

No debe borrar archivos externos ni datos de otras apps.
