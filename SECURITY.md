# Security Policy

FatFingers procesa texto potencialmente sensible y credenciales de proveedores LLM.

## Versiones soportadas

El proyecto esta en MVP alpha. No hay releases estables soportados todavia.

## Reportar vulnerabilidades

No reportes vulnerabilidades en issues publicos si incluyen:

- API keys.
- Headers privados.
- Texto sensible de usuario.
- Rutas privadas.
- Logs con tokens o credenciales.

Cuando el repo este publicado en GitHub, usa GitHub Security Advisories si esta habilitado. Si no esta habilitado, contacta al maintainer por un canal privado antes de publicar detalles tecnicos.

## Alcance sensible

Areas especialmente sensibles:

- `src-tauri/src/settings/secrets.rs`
- `src-tauri/src/llm/`
- `src-tauri/src/lib.rs`
- `src/lib/tauri.ts`
- Persistencia de settings e historial.
- Clipboard.

## Expectativas de seguridad

- Las llamadas LLM deben salir desde Rust.
- React no debe llamar proveedores LLM directamente.
- API keys y custom headers son secrets.
- Settings planos no deben contener secrets.
- No debe haber telemetria por defecto.
- No se debe loggear input/output del usuario por defecto.
