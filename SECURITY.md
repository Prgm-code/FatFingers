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

## Auditoria de dependencias

CI ejecuta semanalmente `pnpm audit` y `cargo audit`, y tambien cuando cambian
los manifests o lockfiles. Las advisories `RUSTSEC-2026-0194` y
`RUSTSEC-2026-0195` estan temporalmente exceptuadas para `quick-xml 0.39.x`
porque llegan mediante `wayland-scanner 0.31.10`, la ultima version disponible,
y solo procesan definiciones Wayland confiables durante compilacion. La
excepcion debe eliminarse cuando `wayland-scanner` adopte `quick-xml >= 0.41.0`.
