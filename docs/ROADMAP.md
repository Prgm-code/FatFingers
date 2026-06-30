# Roadmap

## MVP

Objetivo:

- Helper flotante para escritura asistida con LLM configurable.

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

## v1.2: Replace Selected Text

Objetivo:

- Escribir o reemplazar automaticamente el texto en la aplicacion desde donde se lanzo el helper.

Comportamiento deseado:

- Usuario selecciona texto o posiciona cursor en una app origen.
- Usuario abre FatFingers.
- Usuario escribe/corrige con Enter o shortcut configurado.
- Al confirmar otra vez, FatFingers escribe o reemplaza el texto en la app origen.

Requisitos:

- Permisos explicitos por sistema operativo.
- Explicacion clara de permisos en onboarding/settings.
- Fallback a copia manual.
- Diferencias por plataforma documentadas.

Notas por plataforma:

- macOS puede requerir Accessibility permissions.
- Windows puede requerir APIs de automatizacion/input simulation.
- Linux puede variar segun Wayland/X11 y desktop environment.

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
