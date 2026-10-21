Conductor is the visual language of an operations console for AI agents — runs, approvals, tool calls and the people supervising them — packaged as tokens, a framework-agnostic stylesheet and Radix-based React primitives. Dark is the canonical theme; light is a second palette over the same semantic keys. Every value here comes from `89sooner/design-system`.

## Content fundamentals

- Write like an operator's console: short, factual, present tense. Name the object and its state — "Deployment running", "Release promoted", "3 issues found".
- Sentence case for titles, buttons and labels ("Promote release", "Open command palette"). UPPERCASE is reserved for eyebrows and table headers set in `font-xs` (700, tracked 0.08em).
- Address the user as "you" only in descriptions ("You can safely promote this version."); controls are verbs, never "Click here".
- Say what an action does and what it costs: destructive confirmations state the scope and that it cannot be undone ("Its 14 runs and their audit trail are removed. This cannot be undone.").
- Identifiers, payloads and numbers are set in the mono stack (`--cdt-font-mono`, `text-mono-payload`): `run_2026_10_21_0412`, `42s`, `99.98%`.
- No emoji, no exclamation marks, no marketing adjectives.

## Visual foundations

### Surfaces are discrete depth steps

- Build depth from the five surface steps only, darkest to lightest in dark: `cdt-surface-base` (app background) → `cdt-surface-canvas` → `cdt-surface-subtle` → `cdt-surface-raised` (cards, panels) → `cdt-surface-elevated` (highest). Components never invent their own background lightness.
- `cdt-surface-overlay` is the dialog scrim; `cdt-surface-glass` is the translucent card and top-bar fill; `cdt-surface-timeline` backs timelines and code.
- Depth reads from luminance plus a hairline, not heavy shadow. Use `cdt-elevation-raised` at rest, `cdt-elevation-hover` on an interactive card's hover, `cdt-elevation-overlay` for dialogs, popovers and menus.

### Text

- `cdt-text-primary` for headings and body, `cdt-text-secondary` for supporting copy, `cdt-text-muted` for meta and table headers, `cdt-text-faint` only for disabled and tertiary marks. `cdt-text-inverse` sits on `cdt-accent` fills.
- Body is `font-md` (14/21); dense tables and labels use `font-base` (13/20). Density changes through the spacing scale, never by adding font sizes: the scale is fixed at seven steps (`font-2xs` … `font-xl`).

### Borders are translucent layers

- In dark, every border is slate `#94a3b8` at a different alpha — `cdt-border-subtle` (0.10), `cdt-border-default` (0.18), `cdt-border-strong` (0.30) — so one token works on any surface. Light uses opaque greys.
- Form controls use `cdt-border-control` (dark: alpha 0.60, 3.23:1 on `cdt-surface-raised`) to meet the 3:1 non-text floor; never use `cdt-border-subtle` for an input edge.
- Line weights: `cdt-border-width-hairline` (1px) for surface edges, `cdt-border-width-emphasis` (2px) under table headers, `cdt-border-width-rail` (3px) for banner status rails and the active navigation indicator.

### One accent

- `cdt-accent` (#6d7cff dark / #4f5bd5 light) is the only brand hue. Links, progress, the checked switch, the running status, selection (`cdt-state-selected`), the focus ring and glows all derive from it — `cdt-status-running` is an alias of `cdt-accent`.
- `cdt-accent-strong` is for pressed and hover fills, `cdt-accent-soft` for tinted backgrounds. Primary buttons are `cdt-accent` with `cdt-text-inverse` labels.

### Status, severity and meters never rely on colour alone

- Seven run states — `cdt-status-queued`, `-running`, `-waiting`, `-success`, `-partial`, `-danger`, `-neutral-end` — each travel with an icon and a text label (`StatusBadge` requires all three).
- Four severities — `cdt-severity-read`, `-write`, `-destructive`, `-blocked` — are background-only colours. Put `cdt-text-primary` (dark) or `cdt-text-inverse` (light) on them; never use a severity colour as text (1.69–3.38:1 on `cdt-surface-raised`).
- Meters step through `cdt-meter-normal`, `cdt-meter-warning`, `cdt-meter-exceeded`.
- Data visualisation uses the 25 `cdt-dataviz-*` tokens: twenty categorical series (`cdt-dataviz-series-1` … `-20`) and a five-step sequential ramp (`cdt-dataviz-sequential-1` … `-5`). Series colours are fills only (3:1 non-text) and identify a series, not a magnitude; a legend, direct labels or a table always repeat what colour shows.

### Spacing, radius, layout

- Spacing steps 4px apart through `cdt-space-4`, then 8px: `cdt-space-1` 4 · `-2` 8 · `-3` 12 · `-4` 16 · `-5` 24 · `-6` 32 · `-7` 40 · `-8` 48. Card padding and grid gaps are `cdt-space-5`; page stacks `cdt-space-6`.
- Radii are the source's exact values, neither arithmetic nor geometric: `cdt-radius-xs` 6 · `-sm` 9 (form controls) · `-md` 12 (buttons) · `-lg` 18 (cards, overlays) · `-xl` 24 · `cdt-radius-pill` (badges, switches, markers).
- Breakpoints `cdt-breakpoint-sm` 560, `-md` 800, `-lg` 1080 are substituted as literals inside `@media` (custom properties do not evaluate there).
- Stacking uses six fixed layers: `cdt-z-base` 0, `-raised` 10, `-sticky` 20 (top bar), `-drawer` 30, `-overlay` 40 (scrims), `-popover` 50 (tooltips, menus, select content).

### Motion

- Colour, background and border changes use `--cdt-motion-fast` (140ms, entrance easing); overlays enter with `--cdt-motion-standard` (240ms) and leave with `--cdt-motion-exit` (160ms, accelerating). Switches settle with `--cdt-motion-bounce`; dialogs and popovers may use `--cdt-motion-spring` on entrance only. Under `prefers-reduced-motion` these collapse and the spinner shows its text label.
- Motion values live in `components/bundle.css`, not in the token tables.

### Focus and interaction states

- The focus ring is `cdt-focus-ring`: a solid 3px ring of `cdt-accent` at alpha 0.80 (3.93:1 on `cdt-surface-base`). Every focusable element shows it; do not remove it.
- Hover fills use `cdt-state-hover`; disabled controls `cdt-state-disabled`; policy-blocked actions `cdt-state-disabled-policy` with a stated reason (`Button` `blockedReason`).

## Typography

- Sans: `Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Mono: `'JetBrains Mono', ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace`. Neither face is shipped or fetched — the consumer supplies Inter and JetBrains Mono or the stack falls through to the system face. Do not add a remote font request.
- Page hierarchy: `page-heading` (h1, fluid 24–32px, tracked −0.035em), `page-section-heading` (h2, 26/34), `page-sub-heading` (h3, 22/29), `page-lead` (18/27).

## Iconography

- Conductor bundles no icon set; icons are `lucide-react` (a peer dependency), stroke icons at 16px with stroke width 1.75–2.
- Each status and severity has a canonical icon name, exported as `STATUS_ICONS` / `SEVERITY_ICONS`: queued `circle-dashed`, running `loader`, waiting `pause-circle`, success `check-circle-2`, partial `alert-circle`, danger `x-circle`, neutral-end `circle-slash`; read `eye`, write `pencil`, destructive `trash-2`, blocked `shield-x`. Pass the matching lucide component as the `icon` prop.
- Icons are `aria-hidden`; the text label carries meaning. No emoji as icons.

## Logo

- The mark is a "C" arc closing on a single point, drawn on an accent tile with radius 8 (`assets/Logos`). Use `conductor-brand-mark-dark.svg` on dark surfaces and `-light.svg` on light; set the wordmark "Conductor" beside it in the sans face at `font-lg`, weight 700, tracked −0.02em, `cdt-space-3` from the mark. The favicon variant has no point and does not follow the theme.

## Using the components

- Load React 18+, then `components/bundle.css` and `components/bundle.js`; components are on `window.Conductor` (`Conductor.Button`, `Conductor.Dialog.Root` …). In the npm packages the same parts are `@conductor-by-89soone/react` plus `import "@conductor-by-89soone/css"`.
- The theme is chosen on the root element: `data-theme="dark" | "light"` in this system's stylesheet, `data-cdt-theme` in the npm package. With no attribute, dark applies (light under `prefers-color-scheme: light`).
- Components ship with a fixed class contract (`cdt-btn`, `cdt-card`, `cdt-badge` …), so the stylesheet also reproduces them without React. Never override a `cdt-*` class with `!important`; the cascade is ordered by `@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility`.
- Agent interface parts (`Conversation`, `Message`, `PromptInput`, `Tool`, `Confirmation` …) need the agent styles, which are included in this system's `bundle.css` (`@conductor-by-89soone/css/agent.css` in npm).
- Accessibility behaviour (focus traps, roles, keyboard) is Radix's; do not hand-roll it around these components.

## Not synced

- Tokens kept in `components/bundle.css` rather than the token tables, because the tables cannot hold them: the font stacks `--cdt-font-sans` / `--cdt-font-mono` / `--cdt-table-num-font-family`; motion (`--cdt-motion-*`, `--cdt-*-transition`, `--cdt-overlay-enter` / `-exit`); the gradients `--cdt-app-shell-background` and `--cdt-nav-list-background`; `transparent` values (`--cdt-button-primary-border`, `--cdt-button-ghost-background`, `--cdt-button-ghost-border`); and `--cdt-overlay-background-blur` (16px dark, 0 light).
- Primitive ramps (`ink.*`, `indigo.*`, `slate.*`, status hues) are not included: the source never emits them as custom properties. `cdt-meter-exceeded` is written as a literal because it aliases a primitive.
- No font files: the repository ships none by design.
- Icons stay lucide-react components (in `window.Conductor.Icons` for previews); no SVG icon files were copied.
- Component previews are the docs site's catalog previews (`apps/docs/src/catalog.tsx`), compiled as-is; links point at the published docs site.
