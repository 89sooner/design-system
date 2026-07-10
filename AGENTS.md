<!-- Generated: 2026-07-10 -->

# Conductor Design System

## Purpose

Documentation-first product planning repository for Conductor Design System, which also holds the implementation.

Conductor extracts the visual language of `/home/roqkf/agent-ai-platform/packages/web` into reusable packages. It ships **npm packages and a static docs site — no server runtime, database, queue, or authentication exists.** The four architecture docs are reinterpreted accordingly (CR-004): backend → build pipeline, API contracts → package public API, data model → token schema, async/events/jobs → CI jobs.

Planned code layout (created by WP-001 onward):

| Path | Package | Role |
| --- | --- | --- |
| `packages/tokens/` | `@conductor/tokens` | Token source, `buildTokens` and `checkContrast` CLIs |
| `packages/css/` | `@conductor/css` | Framework-agnostic stylesheet, `@layer cdt.*` |
| `packages/react/` | `@conductor/react` | Radix-based primitive components |
| `apps/docs/` | (private) | Static docs site — Conductor's first consumer |

Dependency direction is strictly `tokens → css → react → docs`. A reverse reference is a build error (FR-DX-001 AC-1).

## Key Files

| File | Description |
| --- | --- |
| `docs/README.md` | Master index, reading order, priority rules, and update cascade |
| `docs/10_requirements/srs_final.md` | Final implementation baseline and highest-priority product truth |
| `docs/00_governance/change_control.md` | Change requests (CR), gate log, cascade records |
| `docs/40_delivery/conductor_work_packages.md` | Agent-session-sized work packages (WP) derived from release slices |
| `docs/40_delivery/conductor_implementation_traceability.md` | Living docs-to-code ledger once implementation starts |

## Subdirectories

| Directory | Purpose |
| --- | --- |
| `docs/00_governance/` | Document roles, priority, workflow rules, change control |
| `docs/10_requirements/` | Feature candidates, PRD, workflow, glossary, SRS, traceability |
| `docs/20_derived_ui_specs/` | IA, wireframes, flows, states, components, tokens, QA, agent briefs |
| `docs/30_technical_architecture/` | System, frontend, backend, API, data, async, security, infra, observability architecture |
| `docs/40_delivery/` | Implementation roadmap, release validation, work packages, implementation ledger |

## For AI Agents

- Read `docs/README.md` before editing planning documents.
- Never invent requirements. Approved scope starts in `docs/10_requirements/srs_final.md`.
- Conflict priority: `srs_final.md` > `prd.md` > `workflow.md` > `feature.md` > `glossary.md` > traceability matrix > derived UI specs > technical architecture > delivery docs > AI-agent briefs.
- Scope or baseline changes start with a CR entry in `docs/00_governance/change_control.md`, then cascade from `srs_final.md` downward in the order defined by `docs/README.md`.
- Document status headers (`> 상태: draft | review | baseline`) are binding. Only the user authorizes `baseline`.
- Keep IDs stable. Deprecate by marking; do not renumber.
- Once code exists: tag commits/PRs/tests with FR/WP IDs, update the implementation traceability ledger after every work package, and route doc/code conflicts through DEV -> CR instead of silently changing behavior.
- Preserve the repository language and document style.

## Settled Decisions — Do Not Re-Decide

| Decision | Value | Source |
| --- | --- | --- |
| Style engine | Vanilla CSS + CSS custom properties. No Tailwind, CSS-in-JS, or Sass | ADR-002 (user-confirmed) |
| Accessibility behavior | Delegated to Radix UI. Never hand-roll focus traps, roles, or keyboard navigation | ADR-004 |
| Cascade control | `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility`. `!important` is banned | ADR-005 |
| Naming | CSS variables `--cdt-*`, classes `cdt-*` | ADR-006 |
| Bundler | tsup for TS, lightningcss for CSS | ADR-008 |
| Tests | Vitest + Testing Library + axe-core + Playwright | ADR-009 |
| Theme | Dark is canonical; light is a second palette over the same semantic keys | FR-THM-001, FR-THM-002 |
| Contrast policy | Minimal remediation: `focusRing` alpha 0.30 → 0.80, new `border.control`. All other source values preserved and classified by `usage`. `srs_final.md` §12.1 is authoritative | OD-001, FR-THM-005 |
| Visual regression | `deferred` to REL-004. Not a v1 release gate | OD-002, FR-QA-004 |
| Shell components | C-070 ~ C-072 ship inside `@conductor/react` | OD-004, FR-CMP-009 |

## Testing Requirements

Documents:

```bash
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --report
python3 ~/.claude/skills/build-srs-prd-env/scripts/validate_srs_prd_env.py --root . --strict
```

The validator reads a backtick-wrapped token ending in `.md` as a document path. Write token names like **radius.md** and **breakpoint.md** in bold, not backticks.

Code (once it exists):

```bash
pnpm build          # tokens → css → react → docs, in that order
pnpm test
pnpm typecheck
pnpm lint:tokens    # no color/px/z-index literals outside the token source
pnpm check:contrast # WCAG 2.1 AA per srs_final.md §12.1
pnpm test:a11y      # axe-core, serious+ violations = 0
pnpm size           # Button gzip ≤ 4KB, @conductor/css gzip ≤ 20KB
```

## Dependencies

Node >= 20, pnpm >= 10. Peer dependencies for consumers: React 18 or 19, `lucide-react`.
