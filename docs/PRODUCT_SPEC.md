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
- Helper compacto con ventana separada para settings.
- Atajo global y tray/menu bar.
- Persistencia local de settings no secretos.
- Almacenamiento seguro de API key y custom headers mediante `keyring`.
- Providers `openai`, `minimax`, `openrouter`, `openai_compatible` y `custom_http`.
- Test de conexion de provider.
- Tests frontend/backend basicos y empaquetado debug Linux `.deb`.

Pendiente:

- QA manual completa en macOS y Windows.
- Packaging final firmado/notarizado por plataforma.

En progreso (roadmap v1.2 adelantado):

- Pegado automatico en la app origen mediante flujo de dos fases con Enter,
  opt-in via `pasteBehavior` y fallback a clipboard. Ver seccion 9 y
  `docs/ROADMAP.md`.

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

Settings debe abrir en una ventana propia, no dentro de la ventana compacta del
helper. La ventana de settings debe ser resizable y usar una navegacion lateral
con una seccion visible a la vez, en lugar de un formulario unico con scroll
largo. El boton Save del footer persiste los settings y tambien los borradores
no vacios de API key y custom headers. Las acciones destructivas (limpiar
historial, borrar API key, borrar datos locales) requieren confirmacion en dos
pasos dentro del propio boton.

### 7.1 General

Campos:

- Launch at login
- Interface language: `en`, `es`
- Default action
- After improving, Enter will: `clipboard` (copiar al portapapeles, default) o
  `auto_paste` (pegar en la app origen). Si la plataforma no soporta pegado
  simulado (por ejemplo Wayland o macOS sin permiso de Accessibility), la UI
  muestra una nota y el comportamiento efectivo es copiar al portapapeles.
- Auto-copy result after generation
- Close window after copy
- Theme: `system`, `light`, `dark`

`Interface language` controla solo el idioma visible de la aplicacion
FatFingers. No fuerza el idioma de salida del proveedor LLM; la salida sigue
determinada por la accion, el texto de entrada y el comportamiento de escritura
configurado.

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

- Provider type: `openai`, `minimax`, `openrouter`, `openai_compatible`, `custom_http`
- API key
- Base URL para MiniMax, providers compatibles o custom
- Model
- Temperature
- Max output tokens
- Timeout seconds
- Test connection

La API key no debe mostrarse despues de guardarse. La UI puede indicar que existe una key guardada.

Para `openai`, la UI debe mostrar la URL efectiva de la Responses API
`https://api.openai.com/v1/responses` como valor informativo no editable. El
campo `baseUrl` editable aplica para `minimax`, `openai_compatible` y
`custom_http`. Para `minimax`, el default es `https://api.minimax.io/v1`,
wire API `responses`, modelo `MiniMax-M3` y context window declarado
`1000000`. Para `openrouter`, la UI debe mostrar el endpoint efectivo
`https://openrouter.ai/api/v1/chat/completions` como valor informativo no
editable y el modelo default debe ser `openrouter/auto`.

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
- Never send telemetry: default. No se muestra toggle de telemetria mientras la
  telemetria no exista; si se implementa despues sera opt-in.
- Clear all local data.
- Clear API key.

Las tres acciones de limpieza requieren un segundo click de confirmacion.

Texto obligatorio:

> Your text is sent only to the AI provider you configure.

## 8. Primer lanzamiento

Onboarding:

- Welcome screen.
- Elegir provider: OpenAI, MiniMax, OpenRouter, OpenAI-compatible endpoint o local/custom endpoint.
- Ingresar API key.
- Ingresar modelo default.
- Elegir shortcut default.
- Probar conexion.
- Finalizar.

Si el test de provider falla, el usuario debe poder continuar y arreglarlo despues desde settings.

El onboarding abre en su propia ventana dedicada, con marco nativo, opaca y
amplia (~860x820, minimo 680x680). Al finalizar, la ventana de onboarding se
cierra y se muestra el helper compacto. Cerrar la ventana de onboarding con el
boton nativo no bloquea la app: sigue disponible desde el tray y el usuario
puede completar la configuracion despues desde settings.

## 9. Helper flotante

Cuando se presiona el shortcut global:

- Abrir ventana pequeña centrada, sin marco (frameless) y con esquinas
  redondeadas dibujadas por la app.
- Mantener always-on-top y fuera de la taskbar.
- Fondo crema u oscuro segun el tema (`system` sigue al sistema operativo),
  manteniendo el acento teal de la marca.
- Enfocar textarea inmediatamente.
- Limpiar textarea, resultado anterior, errores, fase y estado de undo en cada
  apertura del helper.
- Cerrar con `Esc`.
- Insertar saltos de linea con `Shift + Enter`.

Dimensiones sugeridas:

- Width: 600px
- Height: 220px
- Resizable: si
- Compacta por defecto

El helper opera en un flujo de dos fases:

Fase `compose` (estado inicial):

- Una sola superficie de texto sin bordes, con placeholder como unico chrome.
- Linea de estado inferior discreta: selector compacto de accion a la
  izquierda; hints de teclado y contador a la derecha.
- Sin botones grandes: no hay boton Run ni Copy visibles; Enter ejecuta y los
  atajos cubren el resto.
- Icono minimo de settings en la linea de estado.
- `Enter` envia el texto al proveedor (pasa a `improving`).

Fase `improving`:

- Mostrar loading state discreto en la linea de estado.
- Bloquear reenvios mientras carga.

Fase `review` (resultado generado):

- El texto mejorado reemplaza el contenido del textarea y puede editarse.
- Indicador visual sutil de fase: barra de acento teal en el borde del
  contenedor.
- `Enter` confirma: segun `pasteBehavior`, pega el texto en la app origen y
  oculta el helper, o lo copia al portapapeles, avisa y oculta. El texto
  confirmado es el contenido actual del textarea, incluidas ediciones.
- `Cmd/Ctrl + Enter` vuelve a mejorar el texto actual.
- `Cmd/Ctrl + Z` sobre el estado de la app (boton/atajo Undo) restaura el
  texto original y vuelve a `compose`.
- Mostrar latencia de la ultima generacion en la linea de estado.

## 10. Shortcuts internos

- `Esc`: cerrar helper.
- `Enter`: en `compose`, mejorar; en `review`, confirmar (pegar o copiar).
- `Shift + Enter`: salto de linea.
- `Cmd/Ctrl + Enter`: en `review`, volver a mejorar.
- `Cmd/Ctrl + C`: copiar seleccion normalmente.
- `Cmd/Ctrl + Shift + C`: copiar resultado.
- `Cmd/Ctrl + N`: nuevo input (vuelve a `compose`).
- `Cmd/Ctrl + ,`: abrir settings.
- `Tab`: ciclar la accion de escritura.
- `Cmd/Ctrl + 1..5`: seleccionar accion directamente.

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
- Reemplazo de texto seleccionado leyendo el contenido de otras apps.

La escritura automatica en la aplicacion origen (roadmap v1.2) se adelanto y
esta implementada como pegado automatico opt-in con fallback a clipboard; ver
seccion 9 y `docs/SECURITY_PRIVACY.md` seccion 9. FatFingers nunca lee el
contenido de la app origen.

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
