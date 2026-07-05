# Roadmap

## MVP

Objetivo:

- Helper flotante para escritura asistida con LLM configurable.

Estado:

- MVP alpha implementado.
- Validado localmente en Linux.
- Pendiente QA manual macOS/Windows y packaging final.

Incluye:

- Tauri v2 desktop app.
- React/TypeScript frontend.
- Rust backend.
- Tray/menu bar.
- Global shortcut.
- Dashboard de configuracion.
- Secure API key storage.
- OpenAI provider.
- OpenAI-compatible provider.
- Custom HTTP provider.
- Acciones basicas de escritura.
- Copiar resultado al clipboard.

## v1.1: Correct Selected Text

Objetivo:

- Permitir que el usuario seleccione texto en otra app, active FatFingers y obtenga texto corregido copiado al portapapeles.

Comportamiento:

- Usuario selecciona texto en otra app.
- Usuario presiona shortcut.
- FatFingers intenta leer texto mediante flujo de clipboard controlado.
- FatFingers corrige o reescribe.
- FatFingers copia el resultado.
- Usuario pega manualmente.

No incluye:

- Auto-paste.
- Reemplazo automatico.
- Permisos avanzados de accessibility.

## v1.2: Replace Selected Text (en progreso, adelantado)

Objetivo:

- Escribir o reemplazar automaticamente el texto en la aplicacion desde donde se lanzo el helper.

Estado:

- En progreso. Se adelanta esta feature al presente ciclo.

Comportamiento (flujo de dos fases):

- Usuario posiciona cursor en una app origen.
- Usuario abre FatFingers con el shortcut.
- Usuario escribe y presiona Enter: el texto se mejora con el LLM (fase `review`).
- Usuario presiona Enter otra vez: FatFingers pega el texto en la app origen y oculta el helper.
- Ctrl/Cmd+Enter en fase `review` vuelve a mejorar el texto.

Diseno elegido:

- Ajuste `pasteBehavior` con valores `clipboard` (default) y `auto_paste`. El pegado automatico es opt-in.
- Estrategia "hide-first": copiar el resultado al clipboard, ocultar la ventana always-on-top (el sistema devuelve el foco a la app anterior), esperar un delay corto y sintetizar Ctrl+V (Cmd+V en macOS) con `enigo`.
- Restauracion best-effort del contenido previo del clipboard (solo texto).
- Deteccion de capacidad por plataforma expuesta al frontend (`get_paste_capability`).
- Fallback: si la simulacion no esta disponible o falla, se copia al clipboard, se muestra el aviso "Copiado - pulsa Ctrl+V" y se oculta el helper.

Matriz por plataforma:

- Windows: pegado simulado soportado.
- macOS: pegado simulado si el usuario concede Accessibility permissions; si no, fallback a clipboard.
- Linux X11: pegado simulado via libxdo.
- Linux Wayland: la simulacion de teclado esta restringida por el compositor; en la practica el flujo es el fallback a clipboard. No prometer pegado automatico en Wayland.

Requisitos:

- Permisos explicitos por sistema operativo.
- Explicacion clara de permisos en onboarding/settings.
- Fallback a copia manual.
- Diferencias por plataforma documentadas.

Esta feature no debe bloquear el MVP.

## v1.3: Local Models

Objetivo:

- Soportar modelos locales y endpoints locales.

Providers:

- Ollama.
- LM Studio.
- Local OpenAI-compatible endpoints.

Requisitos:

- Detectar endpoint local cuando sea posible.
- Mantener provider interface.
- Mostrar errores claros si el servidor local no esta corriendo.

## v1.4: Presets and Snippets

Objetivo:

- Permitir acciones personalizadas guardadas por el usuario.

Formato previsto:

```json
{
  "name": "Reply politely",
  "instruction": "Write a polite reply declining the request.",
  "hotkey": "optional"
}
```

Incluye:

- Crear preset.
- Editar preset.
- Borrar preset.
- Usar preset en action selector.
- Atajos opcionales por preset si no entran en conflicto.

## Futuro no priorizado

- Full chat history.
- Multi-document editing.
- Browser extension.
- Team accounts.
- Cloud sync.
- Payments.
- Plugin marketplace.
