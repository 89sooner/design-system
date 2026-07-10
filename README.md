# Conductor Design System

Conductor extracts the visual language of `agent-ai-platform/packages/web` into reusable packages: a three-tier design token source, a framework-agnostic stylesheet, and Radix-based React primitives. Dark is the canonical theme; light is a second palette over the same semantic keys. Conductor ships npm packages and a static documentation site — there is no server runtime.

## Packages

| Package | Path | Description |
| --- | --- | --- |
| `@conductor/tokens` | `packages/tokens` | Three-tier token source and the `buildTokens` / `checkContrast` CLIs |
| `@conductor/css` | `packages/css` | Framework-agnostic stylesheet, cascade-controlled by `@layer cdt.*` |
| `@conductor/react` | `packages/react` | React primitive components |
| `docs` (private) | `apps/docs` | Static documentation site, Conductor's first consumer |

Dependency direction is strictly `tokens → css → react → docs`. A reverse reference fails `pnpm lint:deps` with exit code 1.

## Commands

| Command | Description |
| --- | --- |
| `pnpm build` | Checks dependency direction, then builds tokens → css → react → docs in order |
| `pnpm test` | Vitest unit and contract tests |
| `pnpm typecheck` | `tsc --noEmit` across every workspace package |
| `pnpm lint` | ESLint |
| `pnpm lint:deps` | Fails if a package declares a dependency outside the allowed direction |

Requires Node 20+ and pnpm 10+.

## Documentation

The requirements, architecture, and delivery plan live in [`docs/README.md`](docs/README.md). Code implements the approved scope in `docs/10_requirements/srs_final.md`, one work package at a time from `docs/40_delivery/conductor_work_packages.md`.
