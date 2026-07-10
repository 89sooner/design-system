# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Type

This repository is a documentation-first SRS/PRD product planning environment for **Conductor Design System**, and it will also hold the implementation.

Conductor extracts the visual language of `/home/roqkf/agent-ai-platform/packages/web` into reusable packages. It ships **npm packages and a static docs site — there is no server runtime, database, queue, or authentication.** The architecture docs are reinterpreted accordingly (see `CR-004`):

- `conductor_backend_architecture.md` → build pipeline
- `conductor_api_contracts.md` → package public API (`exports`, CLI, TS signatures, component props)
- `conductor_data_model.md` → token/metadata schema
- `conductor_async_events_jobs.md` → CI jobs and release pipeline
- `conductor_security_privacy_architecture.md` → supply-chain security

Planned code layout (does not exist until WP-001 lands):

```text
packages/tokens/   # @conductor/tokens — token source, buildTokens & checkContrast CLIs
packages/css/      # @conductor/css   — framework-agnostic stylesheet, @layer cdt.*
packages/react/    # @conductor/react — Radix-based primitive components
apps/docs/         # static docs site — Conductor's first consumer
docs/              # this planning document set (not code)
```

Dependency direction is strictly `tokens → css → react → docs`. A reverse reference is a build error (FR-DX-001 AC-1).

## Core Working Principle

Favor correctness, traceability, and minimal changes over speed. Do not assume missing requirements. Surface ambiguity, document assumptions and open decisions (`OD-###`), and preserve the hierarchy of source documents.

## Document Hierarchy

- `docs/00_governance/`: rules and change control that govern every other document.
- `docs/10_requirements/`: authoritative product scope, glossary, and traceability.
- `docs/20_derived_ui_specs/`: screen-level documents derived from approved requirements.
- `docs/30_technical_architecture/`: implementation architecture derived from requirements and UI specs.
- `docs/40_delivery/`: release slices, validation, work packages, and the implementation traceability ledger.

## Conflict-Resolution Priority

1. `docs/10_requirements/srs_final.md`
2. `docs/10_requirements/prd.md`
3. `docs/10_requirements/workflow.md`
4. `docs/10_requirements/feature.md`
5. `docs/10_requirements/glossary.md`
6. `docs/10_requirements/requirements_screen_traceability_matrix.md`
7. `docs/20_derived_ui_specs/conductor_product_ia.md`
8. Remaining derived UI specs
9. `docs/30_technical_architecture/*`
10. `docs/40_delivery/*`
11. AI-agent implementation request and execution brief

Derived UI, technical architecture, delivery docs, and agent briefs can never expand scope beyond the SRS or PRD. If downstream docs need something the SRS does not grant, open a CR and update the SRS first.

## Document Status Headers

Planning deliverables carry `> 상태: draft | 버전: vX.Y | 갱신일: YYYY-MM-DD` under their title.

- `draft` -> `review` -> `baseline`. Only the user authorizes `baseline`.
- Do not fill agent briefs or work packages to `review`+ while `srs_final.md` is `draft`.
- Changing a `baseline` document requires a CR in `docs/00_governance/change_control.md` first.

## Update Cascade

1. Register `CR-###` in `docs/00_governance/change_control.md`
2. `srs_final.md`
3. `prd.md`
4. `glossary.md` (when terms change)
5. `requirements_screen_traceability_matrix.md`
6. Derived UI specs in `docs/20_derived_ui_specs/`
7. Technical architecture docs in `docs/30_technical_architecture/`
8. Delivery docs in `docs/40_delivery/` (roadmap, validation, work packages, ledger)
9. AI-agent implementation request and execution brief
10. Record the cascade and validator result in the CR, then close it

## ID Conventions

- Functional requirements: `FR-<AREA>-###`
- Nonfunctional requirements: `NFR-###`
- Open (product) decisions: `OD-###`
- Scenarios: `SCN-###`
- Screens: `W-###` only (the docs site is the sole UI). `D-###` and `A-###` do not exist in this product.
- Components: `C-###` (C-001 ~ C-072)
- Flows: `FLOW-###`
- Architecture decisions: `ADR-###`
- API operations: `API-<AREA>-###`
- Data entities: `ENT-<AREA>-###`
- Jobs: `JOB-<AREA>-###`
- Events: `EVT-<AREA>-###`
- Release slices: `REL-###`
- Work packages: `WP-###`
- Change requests: `CR-###`
- Implementation deviations: `DEV-###`

## Verification

Documents:

```bash
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict   # handoff gate
```

Note for doc authors: the validator reads a backtick-wrapped token ending in `.md` as a document path. Write token names like **radius.md**, **font.size.md**, and **breakpoint.md** in bold, not backticks.

Code (once it exists):

```bash
pnpm build          # tokens → css → react → docs, in that order
pnpm typecheck      # RUN AFTER build — part of @conductor/tokens' type surface is generated (CR-009)
pnpm test           # unit + contract tests
pnpm lint:tokens    # no color/px/z-index literals outside the token source
pnpm check:contrast # WCAG 2.1 AA per srs_final.md §12.1
pnpm test:a11y      # axe-core, serious+ violations = 0
pnpm size           # Button gzip ≤ 4KB, @conductor/css gzip ≤ 20KB
```

`packages/tokens/src/tokens.ts` and `src/breakpoints.ts` are **generated** and gitignored. Never edit them; edit the token source (`schema.ts`, `primitives.ts`, `palette.dark.ts`, `scales.ts`, `components.ts`) and rebuild.

## Settled Decisions — Do Not Re-Decide

- Style engine: Vanilla CSS + CSS custom properties (ADR-002). No Tailwind, no CSS-in-JS, no Sass.
- Accessibility behavior is delegated to Radix UI (ADR-004). Never hand-roll focus traps, roles, or keyboard navigation.
- CSS variable prefix `--cdt-`, class prefix `cdt-`. Cascade controlled by `@layer` (ADR-005); `!important` is banned.
- Dark theme is canonical; light is the second palette over the same semantic keys.
- OD-001 → minimal remediation: `focusRing` alpha 0.30 → 0.80 and a new `border.control` token. Everything else keeps its source value and is classified by `usage`. `srs_final.md` §12.1 is the authoritative table; FR-THM-005 enforces it.
- OD-002 → visual regression (FR-QA-004) is `deferred` to REL-004. It is not a v1 release gate.
- OD-004 → shell components (C-070 ~ C-072) ship inside `@conductor/react`.

## Application Code Guidelines

- Code implements the approved scope from `srs_final.md`; candidate-only ideas in `feature.md` are not implementable.
- Work through `docs/40_delivery/conductor_work_packages.md` one WP at a time; respect each WP's 제외 list. Start at WP-001.
- Reference IDs in commits/PRs (`Refs: WP-002 FR-TOK-001`) and in test names (`FR-TOK-001 AC-1: ...`) for the FR/AC they verify.
- After each completed WP, update `docs/40_delivery/conductor_implementation_traceability.md` (status, commit/PR, verification result, FR-to-code mapping).
- Never port the source repo's domain components (`.thread-page`, `.approval-card-*`, `.run-summary`, `.tool-grid`). They are excluded by F-X-009.
- If docs and reality conflict, register `DEV-###` in the ledger and `CR-###` in change control. Never silently change behavior away from the SRS.
