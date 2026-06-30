# Contributing

Gracias por considerar contribuir a FatFingers.

FatFingers esta en estado MVP alpha. Antes de abrir cambios, lee:

- `README.md`
- `AGENTS.md`
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/MVP_PLAN.md`
- `docs/SECURITY_PRIVACY.md`

## Principios

- Mantener llamadas LLM solo en Rust.
- No exponer secrets al frontend.
- No guardar API keys en archivos planos.
- No loggear texto del usuario por defecto.
- No habilitar telemetria por defecto.
- Mantener la UI rapida, minimalista y keyboard-first.
- Evitar frameworks UI pesados para el MVP.

## Flujo recomendado

1. Abre un issue para cambios grandes o comportamiento publico nuevo.
2. Actualiza docs primero si el cambio altera UX, seguridad, provider behavior o comandos.
3. Mantiene el cambio acotado.
4. Agrega o ajusta tests segun el riesgo.
5. Ejecuta los checks locales antes del PR.

## Checks locales

Frontend:

```bash
pnpm test
pnpm build
```

Backend:

```bash
cd src-tauri
cargo fmt --check
cargo check
cargo test
```

Packaging debug Linux:

```bash
pnpm tauri build --debug --bundles deb
```

Packaging release Linux:

```bash
pnpm tauri build
```

El build release Linux por defecto genera `.deb` y `.rpm`. AppImage debe
probarse con `pnpm tauri build` o de forma explicita con
`pnpm tauri build --bundles appimage`. En Linux el wrapper define
`NO_STRIP=true` para evitar fallos de `linuxdeploy` en distros rolling.

## Secrets

No incluyas API keys reales, headers privados, texto sensible de usuario o logs con secretos en issues, tests, fixtures o docs.

Usa placeholders como:

```text
REDACTED_API_KEY
```

## Pull requests

Un PR debe incluir:

- Resumen del cambio.
- Tests ejecutados.
- Riesgos o plataformas no verificadas.
- Capturas si toca UI.
- Docs actualizados si cambia comportamiento publico.
