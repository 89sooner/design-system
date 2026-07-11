/**
 * Dark palette — the canonical theme (FR-THM-001).
 *
 * Every `:root` custom property of `agent-ai-platform/packages/web/src/styles/tokens.css`
 * appears here exactly once. `--surface-2` and `--border` are token references rather than
 * duplicated values (FR-THM-001 AC-2). Two values are corrected rather than inherited, and
 * FR-THM-005 / `srs_final.md` 12.1 name both:
 *
 *   - `focusRing`      accent alpha 0.30 → 0.80  (WCAG 2.4.11; 1.50:1 → 3.93:1 on `surface.base`)
 *   - `border.control` new token, slate alpha 0.60 (WCAG 1.4.11; 3.23:1 on `surface.raised`)
 *
 * `usage` follows the `srs_final.md` 12.1 table. It decides whether `checkContrast` (WP-007)
 * looks at a token; `decorative` means excluded, and the reason is recorded in `description`
 * so `checkContrast --report` can print it (FR-A11Y-004 AC-3).
 *
 * Refs: WP-002 FR-THM-001 FR-THM-005 FR-TOK-005
 */
import type { TokenDefinition, TokenUsage } from "./schema";

interface DarkTokenInput {
  readonly key: string;
  readonly usage: TokenUsage;
  readonly value?: string;
  readonly alias?: string;
  readonly description: string;
  readonly icon?: string;
}

function darkToken(input: DarkTokenInput): TokenDefinition {
  return { tier: "semantic", ...input };
}

/**
 * Five discrete depth steps, monotonically increasing in relative luminance (design principle P-1).
 * All `decorative`: a surface is the *background* argument of a contrast pair, never the foreground.
 */
const surface: TokenDefinition[] = [
  darkToken({
    key: "surface.base",
    usage: "decorative",
    value: "#080b12",
    description: "Application background. Contrast-exempt: surfaces are background arguments.",
  }),
  darkToken({
    key: "surface.canvas",
    usage: "decorative",
    value: "#0b101a",
    description: "Content canvas. Contrast-exempt: surfaces are background arguments.",
  }),
  darkToken({
    key: "surface.subtle",
    usage: "decorative",
    value: "#101722",
    description: "Recessed fill. Contrast-exempt: surfaces are background arguments.",
  }),
  darkToken({
    key: "surface.2",
    usage: "decorative",
    alias: "surface.subtle",
    description: "Source alias of `surface.subtle`, kept as a reference (FR-THM-001 AC-2).",
  }),
  darkToken({
    key: "surface.raised",
    usage: "decorative",
    value: "#141d2a",
    description: "Card and panel fill. Contrast-exempt: surfaces are background arguments.",
  }),
  darkToken({
    key: "surface.elevated",
    usage: "decorative",
    value: "#192535",
    description: "Highest surface. Contrast-exempt: surfaces are background arguments.",
  }),
  darkToken({
    key: "surface.overlay",
    usage: "decorative",
    value: "rgba(4, 7, 12, 0.78)",
    description: "Dialog scrim. Contrast-exempt: nothing is drawn on top of a scrim.",
  }),
  darkToken({
    key: "surface.glass",
    usage: "decorative",
    value: "rgba(16, 23, 34, 0.82)",
    description: "Translucent panel behind `backdrop-filter`. Contrast-exempt: translucent layer.",
  }),
  darkToken({
    key: "surface.timeline",
    usage: "decorative",
    value: "#0d141f",
    description: "Timeline rail. Contrast-exempt: surfaces are background arguments.",
  }),
  darkToken({
    key: "surface.track",
    usage: "decorative",
    value: "rgba(255, 255, 255, 0.05)",
    description: "Progress and meter track, matching the source 1:1.",
  }),
];

const text: TokenDefinition[] = [
  darkToken({
    key: "text.primary",
    usage: "body",
    value: "#f4f7fb",
    description: "Top of the text hierarchy. 14.40:1 to 18.32:1 across the five surfaces.",
  }),
  darkToken({
    key: "text.secondary",
    usage: "body",
    value: "#c5cfdd",
    description: "Supporting copy. 9.83:1 to 12.51:1 across the five surfaces.",
  }),
  darkToken({
    key: "text.muted",
    usage: "body",
    value: "#8290a3",
    description: "De-emphasised copy, table headers, field labels. 4.76:1 to 6.06:1.",
  }),
  darkToken({
    key: "text.faint",
    usage: "decorative",
    value: "#5f6d80",
    description:
      "Meta text, timestamps, uppercase labels and input placeholders only. Contrast-exempt: " +
      "2.94:1 to 3.74:1 never reaches body 4.5:1. Forbidden on `surface.elevated` (FR-THM-005 AC-3).",
  }),
  darkToken({
    key: "text.inverse",
    usage: "body",
    value: "#07111f",
    description: "Text on an accent, status or severity fill.",
  }),
  darkToken({
    key: "text.monoPayload",
    usage: "body",
    value: "#dce6f3",
    description: "Monospace payload text. 13.44:1 on `surface.raised`.",
  }),
];

/**
 * One slate colour at four alphas (design principle P-4). A border has no colour of its own;
 * the surface beneath shows through, so a border token carries no surface dependency.
 */
const border: TokenDefinition[] = [
  darkToken({
    key: "border.subtle",
    usage: "decorative",
    value: "rgba(148, 163, 184, 0.1)",
    description:
      "Hairline divider. Contrast-exempt (1.13:1), WCAG 1.4.11 exception: card and panel edges " +
      "are already identified by surface luminance and `elevation.*` (FR-THM-005 AC-4).",
  }),
  darkToken({
    key: "border.default",
    usage: "decorative",
    value: "rgba(148, 163, 184, 0.18)",
    description:
      "Default edge. Contrast-exempt (1.30:1), same WCAG 1.4.11 exception. Form controls use " +
      "`border.control` instead (FR-THM-005 AC-4).",
  }),
  darkToken({
    key: "border.strong",
    usage: "decorative",
    value: "rgba(148, 163, 184, 0.3)",
    description:
      "Pronounced edge for buttons and overlays. Contrast-exempt (1.69:1), same WCAG 1.4.11 " +
      "exception (FR-THM-005 AC-4).",
  }),
  darkToken({
    key: "border.control",
    usage: "nonText",
    value: "rgba(148, 163, 184, 0.6)",
    description:
      "Form control edge. Corrected token (FR-THM-005 AC-2): the source reused `border.default` " +
      "at 1.30:1. Alpha 0.60 yields 3.23:1 on `surface.raised`. Applies to TextField, TextArea, " +
      "Select, Switch and Checkbox only.",
  }),
  darkToken({
    key: "border.DEFAULT",
    usage: "decorative",
    alias: "border.default",
    description: "Source alias of `border.default`, kept as a reference (FR-THM-001 AC-2).",
  }),
];

/** One accent; links, progress and selection all reference it (design principle P-5). */
const accent: TokenDefinition[] = [
  darkToken({
    key: "accent.DEFAULT",
    usage: "body",
    value: "#6d7cff",
    description:
      "The single accent. 5.60:1 on `surface.base`, 4.82:1 on `surface.raised`. Body use on " +
      "`surface.elevated` is forbidden (4.40:1); large text and non-text use are allowed.",
  }),
  darkToken({
    key: "accent.strong",
    usage: "nonText",
    value: "#5667f5",
    description: "Second accent step. Never a fill beneath body text; 4.36:1 on `surface.base`.",
  }),
  darkToken({
    key: "accent.soft",
    usage: "decorative",
    value: "rgba(109, 124, 255, 0.14)",
    description: "Faint accent wash. Contrast-exempt: text above it is always `text.primary`.",
  }),
  darkToken({
    key: "accent.glow",
    usage: "decorative",
    value: "rgba(109, 124, 255, 0.28)",
    description: "Dark-only glow. Contrast-exempt: never the sole carrier of information.",
  }),
];

/**
 * FR-TOK-005 AC-1. Seven run states, each with a mandatory `icon` (AC-5) so that colour never
 * carries meaning alone (design principle P-2, FR-A11Y-003 AC-4).
 */
const status: TokenDefinition[] = [
  darkToken({
    key: "status.queued",
    usage: "nonText",
    value: "#64748b",
    icon: "circle-dashed",
    description:
      "Queued. 3.56:1 on `surface.raised`. Dot and marker only, never a text foreground; the " +
      "component must render an icon and a label alongside it (FR-THM-005 AC-5, AC-7).",
  }),
  darkToken({
    key: "status.running",
    usage: "body",
    alias: "accent.DEFAULT",
    icon: "loader",
    description:
      "Running. Resolves to the accent, matching the source 1:1 (`#6d7cff`); the reference keeps " +
      "the accent family single-sourced (design principle P-5).",
  }),
  darkToken({
    key: "status.waiting",
    usage: "body",
    value: "#f59e0b",
    icon: "pause-circle",
    description: "Waiting on input. 7.89:1 on `surface.raised`.",
  }),
  darkToken({
    key: "status.success",
    usage: "body",
    value: "#10b981",
    icon: "check-circle-2",
    description: "Completed successfully. 6.68:1 on `surface.raised`.",
  }),
  darkToken({
    key: "status.partial",
    usage: "body",
    value: "#eab308",
    icon: "alert-circle",
    description: "Completed with gaps. 8.84:1 on `surface.raised`.",
  }),
  darkToken({
    key: "status.danger",
    usage: "body",
    value: "#ef4444",
    icon: "x-circle",
    description: "Failed. 4.50:1 on `surface.raised`.",
  }),
  darkToken({
    key: "status.neutralEnd",
    usage: "decorative",
    value: "#475569",
    icon: "circle-slash",
    description:
      "Cancelled or superseded. Contrast-exempt per CR-006 (`srs_final.md` 12.1): 2.04:1 to " +
      "2.60:1 reaches non-text 3:1 on no surface. WCAG 1.4.11 exception — FR-THM-005 AC-7 forces " +
      "an icon and a label alongside the colour, and the source's surface-coloured ring supplies " +
      "the marker's shape boundary, so the dot's fill carries no identification on its own. " +
      "Known cost: the dot reads faintly against a dark background.",
  }),
];

/** FR-TOK-005 AC-3. */
const meter: TokenDefinition[] = [
  darkToken({
    key: "meter.normal",
    usage: "body",
    value: "#34d399",
    description: "Below the warning threshold. 8.82:1 on `surface.raised`.",
  }),
  darkToken({
    key: "meter.warning",
    usage: "body",
    value: "#fbbf24",
    description: "Past the warning threshold. 10.15:1 on `surface.raised`.",
  }),
  darkToken({
    key: "meter.exceeded",
    usage: "body",
    alias: "red.400",
    description: "Past the hard limit. 6.13:1 on `surface.raised`.",
  }),
];

/**
 * FR-TOK-005 AC-2. Background-only: as a foreground these four collapse to 1.69:1 - 3.38:1 on
 * `surface.raised`. `SeverityTag` fills with them and puts `text.primary` on top (4.67:1 - 9.32:1).
 * The one token family both themes share, because severity is an absolute grade.
 */
const severity: TokenDefinition[] = [
  darkToken({
    key: "severity.read",
    usage: "body",
    value: "#15803d",
    icon: "eye",
    description: "Read-only side effect. Fill only; 4.67:1 beneath `text.primary`.",
  }),
  darkToken({
    key: "severity.write",
    usage: "body",
    value: "#c2410c",
    icon: "pencil",
    description: "Mutating side effect. Fill only; 4.82:1 beneath `text.primary`.",
  }),
  darkToken({
    key: "severity.destructive",
    usage: "body",
    value: "#b91c1c",
    icon: "trash-2",
    description: "Destructive side effect. Fill only; 6.02:1 beneath `text.primary`.",
  }),
  darkToken({
    key: "severity.blocked",
    usage: "body",
    value: "#7f1d1d",
    icon: "shield-x",
    description: "Blocked by policy. Fill only; 9.32:1 beneath `text.primary`.",
  }),
];

const fontFamily: TokenDefinition[] = [
  darkToken({
    key: "font.sans",
    usage: "decorative",
    alias: "stack.sans",
    description: "Interface font stack. Not a colour.",
  }),
  darkToken({
    key: "font.mono",
    usage: "decorative",
    alias: "stack.mono",
    description: "Payload and code font stack. Not a colour.",
  }),
];

/** Light alphas differ from these (0.08 / 0.12 / 0.20) so FR-THM-002 AC-4 holds. */
const elevation: TokenDefinition[] = [
  darkToken({
    key: "elevation.raised",
    usage: "decorative",
    value: "0 12px 30px rgba(0, 0, 0, 0.18)",
    description: "Resting card shadow. Contrast-exempt: a shadow, not a colour.",
  }),
  darkToken({
    key: "elevation.hover",
    usage: "decorative",
    value: "0 18px 46px rgba(0, 0, 0, 0.26)",
    description: "Hovered card shadow. Contrast-exempt: a shadow, not a colour.",
  }),
  darkToken({
    key: "elevation.overlay",
    usage: "decorative",
    value: "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px {border.strong}",
    description:
      "Overlay shadow plus a 1px ring. The ring references `border.strong` so each theme resolves " +
      "its own edge. Contrast-exempt with that border (FR-THM-005 AC-4).",
  }),
];

const interaction: TokenDefinition[] = [
  darkToken({
    key: "focusRing",
    usage: "nonText",
    value: "0 0 0 3px rgba(109, 124, 255, 0.8)",
    description:
      "Corrected token (FR-THM-005 AC-1). The source used accent alpha 0.30, which composites to " +
      "1.50:1 on `surface.base` and fails WCAG 2.4.11; a focus indicator cannot be decorative. " +
      "Alpha 0.80 gives 3.93:1 on `surface.base` and 3.56:1 on `surface.raised`.",
  }),
  darkToken({
    key: "state.hover",
    usage: "decorative",
    value: "rgba(255, 255, 255, 0.055)",
    description: "Hover wash. Contrast-exempt: nudges the surface, carries no meaning.",
  }),
  darkToken({
    key: "state.selected",
    usage: "decorative",
    value: "rgba(109, 124, 255, 0.16)",
    description:
      "Selected wash. Contrast-exempt: selection is also announced via `aria-pressed` and text.",
  }),
  darkToken({
    key: "state.disabled",
    usage: "decorative",
    value: "#18202c",
    description: "Disabled fill. Contrast-exempt as a fill; checked beneath `text.muted` (5.05:1).",
  }),
  darkToken({
    key: "state.disabledPolicy",
    usage: "decorative",
    value: "#422006",
    description:
      "Policy-blocked fill. Contrast-exempt as a fill; checked beneath the label (5.27:1).",
  }),
];

export const darkPalette: readonly TokenDefinition[] = [
  ...surface,
  ...text,
  ...border,
  ...accent,
  ...status,
  ...meter,
  ...severity,
  ...fontFamily,
  ...elevation,
  ...interaction,
];
