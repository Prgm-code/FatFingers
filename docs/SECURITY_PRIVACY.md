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
- `save_secret` guarda y luego intenta leer el valor desde una entrada nueva.
- Si el valor no puede recuperarse, la operacion falla con `SecureStorageUnavailable`.
- No se usan variables de entorno para guardar API keys.

Backends configurados:

- Linux: `keyring` con `linux-native` (`keyutils`).
- macOS: `apple-native` (Keychain).
- Windows: `windows-native` (Credential Manager).

## 3. Settings no secretas

Settings permitidas en store:

- appName
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

No es MVP.

Para v1.2:

- Pedir permisos explicitos por plataforma.
- Explicar por que se necesitan permisos de accessibility/automation.
- Ofrecer fallback manual.
- No auto-pegar sin accion clara del usuario.
- No capturar texto sin intencion explicita.

## 10. Clear all local data

Debe borrar:

- Settings locales.
- Secrets.
- Historial local, si existe.
- Cache propia de la app, si existe.

No debe borrar archivos externos ni datos de otras apps.
