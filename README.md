# Conductor Design System

Conductor extracts the visual language of `agent-ai-platform/packages/web` into reusable packages: a three-tier design token source, a framework-agnostic stylesheet, and Radix-based React primitives. Dark is the canonical theme; light is a second palette over the same semantic keys. Conductor ships npm packages and a static documentation site — there is no server runtime.

## Packages

| Package                        | Path              | Description                                                          |
| ------------------------------ | ----------------- | -------------------------------------------------------------------- |
| `@conductor-by-89soone/tokens` | `packages/tokens` | Three-tier token source and the `buildTokens` / `checkContrast` CLIs |
| `@conductor-by-89soone/css`    | `packages/css`    | Framework-agnostic stylesheet, cascade-controlled by `@layer cdt.*`  |
| `@conductor-by-89soone/react`  | `packages/react`  | React primitive components                                           |
| `docs` (private)               | `apps/docs`       | Static documentation site, Conductor's first consumer                |

Dependency direction is strictly `tokens → css → react → docs`. A reverse reference fails `pnpm lint:deps` with exit code 1.

## Commands

| Command          | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `pnpm build`     | Checks dependency direction, then builds tokens → css → react → docs in order |
| `pnpm test`      | Vitest unit and contract tests                                                |
| `pnpm typecheck` | `tsc --noEmit` across every workspace package                                 |
| `pnpm lint`      | ESLint                                                                        |
| `pnpm lint:deps` | Fails if a package declares a dependency outside the allowed direction        |

Requires Node 20+ and pnpm 10+.

## Using Conductor in production

Conductor is `0.x`. Until 1.0.0, a minor release may change how existing components look (its changeset starts with `Visual change:`), so:

- Pin exact versions of all three packages (`"0.18.0"`, not `"^0.18.0"`) and upgrade on purpose.
- When you upgrade, compare your screens before and after — screenshots of your main routes in both themes are enough.
- Read the package `CHANGELOG.md` for the minors you skip.

From 1.0.0 the three packages share one version, and removing or renaming a public export, `cdt-*` class, `--cdt-*` property or CLI option requires a major release. See [`SECURITY.md`](SECURITY.md) to report a vulnerability.

## Documentation

The requirements, architecture, and delivery plan live in [`docs/README.md`](docs/README.md). Code implements the approved scope in `docs/10_requirements/srs_final.md`, one work package at a time from `docs/40_delivery/conductor_work_packages.md`.

## License

MIT. See [`LICENSE`](LICENSE).
