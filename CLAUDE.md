# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FatFingers is a cross-platform desktop writing helper (Spotlight/Raycast-style floating window) built with Tauri v2: React/TypeScript/Vite frontend, Rust backend, pnpm as package manager. Status: MVP alpha. Do not re-initialize Tauri or replace the existing structure.

`AGENTS.md` contains the canonical agent rules. Before changes that alter public behavior, read the relevant docs in `docs/` (`PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `MVP_PLAN.md`, `SECURITY_PRIVACY.md`) and update them first. Docs/specs are written in Spanish; type, command, API, and module names stay in English. Keep `README.md` and `CHANGELOG.md` in sync with public-facing changes.

## Commands

```bash
pnpm install                          # install deps
pnpm dev                              # frontend only (Vite, port 1420)
pnpm tauri dev                        # full app
pnpm test                             # frontend tests (vitest run)
pnpm test src/lib/validators.test.ts  # single test file
pnpm test -t "test name"              # single test by name
pnpm build                            # tsc + vite build
pnpm tauri build                      # release packages (.deb/.rpm/.AppImage on Linux)
pnpm tauri build --debug --bundles deb
```

Backend (run from `src-tauri/`):

```bash
cargo fmt --check
cargo check
cargo test
cargo test <test_name>                # single test
```

CI runs `pnpm build`, `pnpm test`, `cargo check`, and `cargo test` on Linux/macOS/Windows.

`pnpm tauri` goes through `scripts/run-tauri.mjs`, which prepends `~/.cargo/bin` to PATH and sets `NO_STRIP=true` for Linux builds (works around linuxdeploy failures on rolling distros).

## Architecture

### Hard boundary: all LLM and OS access lives in Rust

React never calls LLM providers, reads secrets, or touches the network directly. The frontend's only channel to the backend is the Tauri command wrappers in `src/lib/tauri.ts`. Commands are registered in `src-tauri/src/lib.rs` (`invoke_handler`). When adding a command: implement it in Rust, register it in `lib.rs`, add a typed wrapper in `src/lib/tauri.ts`, and check `src-tauri/capabilities/default.json` if new permissions are needed.

### Backend layout (`src-tauri/src/`)

- `app/` — windows (`helper` and `settings` are separate Tauri windows), tray, global hotkeys, clipboard, lifecycle. The helper window hides instead of closing on Esc.
- `settings/` — `store.rs` (non-secret settings JSON), `secrets.rs` (keyring), `history.rs` (opt-in only).
- `llm/` — one file per provider (`openai.rs`, `minimax.rs`, `openrouter.rs`, `openai_compatible.rs`, `custom_http.rs`) behind the `LlmProvider` trait, plus `prompts.rs` (maps `WritingAction` + `WritingMode` + formality/creativity levels to prompt templates) and `types.rs`.
- `errors/` — serializable `AppError` categories for IPC (MissingApiKey, ProviderTimeout, etc.). Errors must never include secrets or user text.

Providers: `openai` and `minimax` use the Responses API; `openrouter` and `openai_compatible` use Chat Completions; `custom_http` posts a simple JSON contract. Never hardcode a single model — models are configurable, with suggested lists in `src/lib/settings.ts`.

### Frontend layout (`src/`)

- `screens/` — `Helper.tsx` (floating editor), `Settings.tsx`, `Onboarding.tsx`, `About.tsx`. `App.tsx` picks the initial view and loads settings/secret status.
- `lib/` — `tauri.ts` (IPC wrappers), `settings.ts` (defaults, model lists), `validators.ts`, `hotkeys.ts`, `i18n.ts` (all UI strings, `en`/`es`; add new strings to both locales).
- `types/` — `app.ts` and `llm.ts` mirror the Rust types; keep both sides in sync when changing settings or request/response shapes (serialization uses snake_case string enums like `"quick_reply"`, `"plain_text"`).

Frontend tests are Vitest + Testing Library (jsdom, globals enabled, setup in `src/test/setup.ts`), colocated as `*.test.tsx` / `*.test.ts`.

### Secrets

`provider_api_key` and `custom_headers` are secrets, stored via `keyring` under service name `FatFingers` — never in plain settings, env vars, or logs. `custom_headers` must be a JSON object with string values. `save_secret` verifies read-back after saving.

## Constraints

- No telemetry by default; no history unless the user opts in; never log user text by default.
- No Tauri commands that allow arbitrary shell execution.
- Keep the UI minimal, fast, and keyboard-first; no heavy UI frameworks for the MVP.
- App name `FatFingers` stays configurable from central config (`appName` setting).
- Prompts must return only the transformed text — no explanations.
- Automatic text replacement in the source app is out of scope (roadmap v1.2); the MVP copies results to the clipboard.
