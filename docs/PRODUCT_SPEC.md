# Product Spec: FatFingers

## 0. Estado actual

Estado del producto: MVP alpha funcional.

El repositorio ya contiene una implementacion Tauri v2 con React/TypeScript y
backend Rust. El objetivo de este documento sigue siendo definir el
comportamiento esperado del producto, pero las decisiones implementadas deben
mantenerse sincronizadas con `docs/ARCHITECTURE.md`, `docs/MVP_PLAN.md` y
`docs/SECURITY_PRIVACY.md`.

Implementado en el MVP alpha:

- Helper flotante con acciones de escritura y copia al portapapeles.
- Onboarding y dashboard de settings.
- Atajo global y tray/menu bar.
- Persistencia local de settings no secretos.
- Almacenamiento seguro de API key y custom headers mediante `keyring`.
- Providers `openai`, `openai_compatible` y `custom_http`.
- Test de conexion de provider.
- Tests frontend/backend basicos y empaquetado debug Linux `.deb`.

Pendiente:

- QA manual completa en macOS y Windows.
- Packaging final firmado/notarizado por plataforma.
- Reemplazo automatico en app origen, que sigue fuera del MVP.

## 1. Vision

FatFingers es un asistente de escritura desktop que corre en segundo plano y aparece como un overlay flotante cuando el usuario presiona un atajo global.

El usuario puede escribir o pegar texto, elegir una accion de IA, enviar el texto al proveedor LLM configurado y copiar el resultado. El producto debe sentirse rapido, compacto y enfocado en escritura corta, no como una sesion completa de chat.

## 2. Nombre

Nombre interno inicial: `FatFingers`.

El nombre debe poder cambiarse desde una configuracion central, sin buscar y reemplazar en toda la app.

## 3. Plataformas

MVP:

- macOS
- Windows
- Linux

Framework obligatorio:

- Tauri v2

## 4. Stack

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
- Log o shell solo si son estrictamente necesarios

## 5. Objetivos de usuario

El usuario debe poder:

- Lanzar el helper con un atajo global.
- Escribir o pegar texto en un editor flotante minimo.
- Elegir una accion de IA.
- Configurar proveedor, API key, modelo, shortcut, idioma, accion por defecto y modo de correccion.
- Enviar el texto al proveedor LLM configurado.
- Ver el resultado en la misma ventana.
- Copiar el resultado al portapapeles.
- Ejecutar la app desde tray/menu bar.
- Evitar abrir navegador o ChatGPT completo.

## 6. Acciones MVP

Acciones obligatorias:

- `Correct`: corregir ortografia y gramatica.
- `Professional`: hacer profesional.
- `Shorten`: hacer mas corto.
- `Friendly`: hacer mas amable.
- `QuickReply`: redactar respuesta breve.

Acciones planificadas tambien en la arquitectura:

- `TranslateEnglish`
- `TranslateSpanish`
- `Custom`

## 7. Dashboard de configuracion

La app debe incluir una pantalla de configuracion completa.

Secciones:

- General
- Shortcut
- AI Provider
- Writing Behavior
- Privacy

### 7.1 General

Campos:

- Launch at login
- Default action
- Default language behavior
- Auto-copy result after generation
- Close window after copy
- Theme: `system`, `light`, `dark`

### 7.2 Shortcut

Campos y acciones:

- Current shortcut
- Change shortcut
- Test shortcut
- Reset shortcut

Defaults:

- macOS: `Command+Shift+Space`
- Windows/Linux: `Ctrl+Shift+Space`

Si el shortcut falla, la app debe mostrar un error claro y permitir elegir otro.

### 7.3 AI Provider

Campos:

- Provider type: `openai`, `openai_compatible`, `custom_http`
- API key
- Base URL para providers compatibles o custom
- Model
- Temperature
- Max output tokens
- Timeout seconds
- Test connection

La API key no debe mostrarse despues de guardarse. La UI puede indicar que existe una key guardada.

Para `openai`, la UI debe mostrar la URL efectiva de la Responses API
`https://api.openai.com/v1/responses` como valor informativo no editable. El
campo `baseUrl` editable aplica solo para `openai_compatible` y `custom_http`.

El selector de modelo de OpenAI debe ofrecer una lista curada de modelos
actuales y una opcion de modelo custom. La app no debe bloquear modelos nuevos
que el usuario pueda ingresar manualmente.

### 7.4 Writing Behavior

El usuario debe poder ajustar como escribe o corrige el asistente.

Campos:

- `correctionMode`: `plain_text`, `balanced`, `formal`, `creative`
- `formalityLevel`: 0 a 100
- `creativityLevel`: 0 a 100
- `temperature`: 0.0 a 2.0

Defaults:

- `correctionMode: "plain_text"`
- `formalityLevel: 50`
- `creativityLevel: 20`
- `temperature: 0.2`

Modos:

- `plain_text`: corrige o transforma sin explicaciones ni cambios creativos.
- `balanced`: permite mejoras naturales manteniendo significado y tono.
- `formal`: prioriza claridad, tono profesional y estructura pulida.
- `creative`: permite reformulaciones mas libres sin cambiar la intencion.

Reglas:

- `Correct` debe ser conservador aunque el usuario tenga creatividad alta.
- `Professional` debe respetar `formalityLevel`.
- `Friendly` debe mantener tono calido y natural.
- `QuickReply` debe responder como el usuario, no corregir el mensaje entrante.
- `Custom` puede usar creatividad si la instruccion lo permite.

### 7.5 Privacy

Campos y acciones:

- Store history locally: off por defecto.
- Clear local history.
- Never send telemetry: default.
- Optional telemetry toggle: off por defecto.
- Clear all local data.
- Clear API key.

Texto obligatorio:

> Your text is sent only to the AI provider you configure.

## 8. Primer lanzamiento

Onboarding:

- Welcome screen.
- Elegir provider: OpenAI, OpenAI-compatible endpoint o local/custom endpoint.
- Ingresar API key.
- Ingresar modelo default.
- Elegir shortcut default.
- Probar conexion.
- Finalizar.

Si el test de provider falla, el usuario debe poder continuar y arreglarlo despues desde settings.

## 9. Helper flotante

Cuando se presiona el shortcut global:

- Abrir ventana pequeña centrada.
- Mantener always-on-top.
- Usar ventana frameless o minima.
- Enfocar textarea inmediatamente.
- Cerrar con `Esc`.
- Enviar con `Command/Ctrl + Enter`.

Dimensiones sugeridas:

- Width: 680px
- Height: 420px
- Resizable: si
- Compacta por defecto

Estado inicial:

- Textarea grande.
- Selector de accion.
- Boton submit.
- Icono de settings.
- Contador de caracteres.
- Indicador provider/model.

Despues de enviar:

- Mostrar loading state.
- Deshabilitar submit.
- Permitir cancelar si es practico.
- Mostrar resultado en segundo panel o panel de resultado.
- Botones: Copy, Replace input, Try again, New, Close.

## 10. Shortcuts internos

- `Esc`: cerrar helper.
- `Cmd/Ctrl + Enter`: ejecutar accion.
- `Cmd/Ctrl + C`: copiar seleccion normalmente.
- `Cmd/Ctrl + Shift + C`: copiar resultado.
- `Cmd/Ctrl + N`: nuevo input.
- `Cmd/Ctrl + ,`: abrir settings.

## 11. Tray/menu bar

Items:

- Open helper
- Settings
- Enable/disable shortcut
- Start at login
- Quit

## 12. Ejemplos de comportamiento

### Correct

Input:

```text
hola, queria saber si puedes enviarme el reporte manana gracias
```

Output:

```text
Hola, queria saber si puedes enviarme el reporte manana. Gracias.
```

El modelo no debe explicar cambios.

### Professional

Input:

```text
oye puedes revisar esto rapido?
```

Output:

```text
Hola, podrias revisar esto cuando tengas un momento?
```

### QuickReply

Input:

```text
Can you join the meeting at 3pm?
```

Output:

```text
Yes, I can join the meeting at 3pm.
```

## 13. No objetivos MVP

No implementar en MVP:

- Full chat history.
- Multi-document editing.
- Browser extension.
- Team accounts.
- Cloud sync.
- Payments.
- Plugin marketplace.
- Auto-replacing selected text in other apps.

La escritura o reemplazo automatico en la aplicacion origen queda para v1.2.

## 14. Criterios de aceptacion MVP

El MVP esta completo cuando:

- La app instala y lanza en Tauri.
- Corre en segundo plano con tray/menu bar.
- El shortcut global abre el helper.
- El textarea recibe foco.
- El usuario puede ingresar texto.
- El usuario puede elegir `Correct`, `Professional`, `Shorten`, `Friendly` y `QuickReply`.
- La app envia texto al provider configurado desde Rust.
- La app muestra resultado.
- La app copia resultado al clipboard.
- Settings funciona.
- API key se guarda en almacenamiento seguro.
- No se loggea texto del usuario por defecto.
- Errores de red/provider se muestran de forma clara.
- Hay tests basicos.
- La app se puede empaquetar al menos para macOS y Windows.
