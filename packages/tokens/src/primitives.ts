/**
 * Primitive ramp — raw colour stops and numeric scales with no product meaning.
 *
 * Values transcribed from `docs/20_derived_ui_specs/conductor_design_system_tokens.md` section 4.
 * Stops marked "derived" there exist for the light palette (WP-010) and resolve to nothing today.
 *
 * This module is NOT re-exported from `src/index.ts`: primitives never reach a consumer
 * (FR-TOK-002 AC-5) and never emit a CSS custom property (FR-TOK-004 AC-4).
 *
 * Refs: WP-002 FR-TOK-002
 */
import type { TokenDefinition } from "./schema";

function primitive(key: string, value: string, description: string): TokenDefinition {
  return { key, tier: "primitive", value, usage: "decorative", description };
}

/** Neutral lightness spine. Ordered by descending relative luminance (tokens spec 4.1). */
const ink: TokenDefinition[] = [
  primitive("ink.0", "#ffffff", "Pure white. `::selection` text, light `surface.elevated`."),
  primitive("ink.25", "#fbfcfd", "Light `surface.raised`."),
  primitive("ink.50", "#f4f7fb", "Dark `text.primary`, light `text.inverse`."),
  primitive("ink.75", "#f3f6f9", "Light `surface.subtle`."),
  primitive("ink.100", "#f1f4f8", "Light `surface.timeline`."),
  primitive("ink.150", "#eef1f6", "Light `surface.canvas`."),
  primitive("ink.200", "#e8ecf2", "Light `surface.base`."),
  primitive("ink.250", "#e2e8f0", "Light `border.subtle` and `state.disabled`."),
  primitive("ink.300", "#dce6f3", "Dark `text.monoPayload`."),
  primitive("ink.350", "#c5cfdd", "Dark `text.secondary`."),
  primitive("ink.400", "#8290a3", "Dark `text.muted`."),
  primitive("ink.500", "#6b788c", "Light `text.faint` and `border.default`."),
  primitive("ink.600", "#5f6d80", "Dark `text.faint`."),
  primitive("ink.650", "#5b6879", "Light `border.strong`."),
  primitive("ink.700", "#4d5a6e", "Light `text.muted`."),
  primitive("ink.750", "#33415a", "Light `text.secondary`."),
  primitive("ink.800", "#1b2537", "Light `text.monoPayload`."),
  primitive("ink.810", "#192535", "Dark `surface.elevated`."),
  primitive("ink.820", "#18202c", "Dark `state.disabled`."),
  primitive("ink.840", "#141d2a", "Dark `surface.raised`."),
  primitive("ink.860", "#101722", "Dark `surface.subtle`."),
  primitive("ink.870", "#0d141f", "Dark `surface.timeline`."),
  primitive("ink.880", "#0c121c", "Light `text.primary`; base colour of the light shadow ramp."),
  primitive("ink.890", "#07111f", "Dark `text.inverse`."),
  primitive("ink.895", "#0b101a", "Dark `surface.canvas`."),
  primitive("ink.900", "#080b12", "Dark `surface.base`."),
  primitive("ink.950", "#04070c", "Base colour of the dark `surface.overlay` scrim."),
];

/** Accent family. Product-specific; not Tailwind Indigo (tokens spec 4.2). */
const indigo: TokenDefinition[] = [
  primitive("indigo.300", "#aab3ff", "Link hover in the source product."),
  primitive("indigo.400", "#7b89ff", "Upper stop of the source primary-button gradient."),
  primitive("indigo.500", "#6d7cff", "Dark `accent`."),
  primitive("indigo.600", "#5667f5", "Dark `accent.strong`."),
  primitive("indigo.700", "#4f5bd5", "Light `accent`."),
  primitive("indigo.800", "#3f4ac0", "Light `accent.strong`."),
];

/** Tailwind Slate. Borders and neutral run states (tokens spec 4.3). */
const slate: TokenDefinition[] = [
  primitive(
    "slate.400",
    "#94a3b8",
    "Base colour of all four dark border tokens and the scrollbar; dark `status.neutralEnd` (CR-035).",
  ),
  primitive("slate.500", "#64748b", "Dark `status.queued`; light `border.control`."),
  primitive(
    "slate.600",
    "#475569",
    "The source's `--status-neutral-end`. No consumer since CR-035 raised the dark end-state to " +
      "`slate.400`; kept as the record of the source value that decision replaced.",
  ),
  primitive("slate.700", "#3f4b5f", "Light `status.neutralEnd`."),
  primitive("slate.750", "#52607a", "Light `status.queued`."),
];

/** Status and meter hues, straight from Tailwind (tokens spec 4.4). */
const statusHues: TokenDefinition[] = [
  primitive("emerald.400", "#34d399", "Dark `meter.normal`."),
  primitive("emerald.500", "#10b981", "Dark `status.success`."),
  primitive("emerald.700", "#047857", "Light `status.success` and `meter.normal`."),
  primitive("green.700", "#15803d", "`severity.read`, both themes."),
  primitive("amber.100", "#fef3c7", "Light `state.disabledPolicy`."),
  primitive("amber.400", "#fbbf24", "Dark `meter.warning`."),
  primitive("amber.500", "#f59e0b", "Dark `status.waiting`."),
  primitive("amber.700", "#b45309", "Light `status.waiting` and `meter.warning`."),
  primitive("amber.950", "#422006", "Dark `state.disabledPolicy`."),
  primitive("yellow.500", "#eab308", "Dark `status.partial`."),
  primitive("yellow.700", "#a16207", "Light `status.partial`."),
  primitive("orange.700", "#c2410c", "`severity.write`, both themes."),
  primitive("red.300", "#fca5a5", "Policy-disabled button label in the source product."),
  primitive("red.400", "#f87171", "Dark `meter.exceeded`."),
  primitive("red.500", "#ef4444", "Dark `status.danger`."),
  primitive("red.600", "#dc2626", "Light `meter.exceeded`."),
  primitive("red.650", "#c81e1e", "Light `status.danger`."),
  primitive("red.700", "#b91c1c", "`severity.destructive`, both themes."),
  primitive("red.900", "#7f1d1d", "`severity.blocked`, both themes."),
];

/** Non-colour primitives (tokens spec 4.5). Neither font stack loads a remote font (NFR-002). */
const nonColour: TokenDefinition[] = [
  primitive(
    "stack.sans",
    'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    "System sans stack. `Inter` is supplied by the consumer or falls through.",
  ),
  primitive(
    "stack.mono",
    '\'JetBrains Mono\', ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    "System mono stack for payloads and code.",
  ),
  primitive("scale.4", "4px", "Spacing step."),
  primitive("scale.8", "8px", "Spacing step."),
  primitive("scale.12", "12px", "Spacing step."),
  primitive("scale.16", "16px", "Spacing step."),
  primitive("scale.24", "24px", "Spacing step."),
  primitive("scale.32", "32px", "Spacing step."),
  primitive("scale.40", "40px", "Spacing step."),
  primitive("scale.48", "48px", "Spacing step."),
  primitive("stroke.1", "1px", "Hairline width."),
  primitive("stroke.2", "2px", "Emphasis rule width."),
  primitive("stroke.3", "3px", "Status rail and active indicator width."),
  primitive("curve.6", "6px", "Corner radius step."),
  primitive("curve.9", "9px", "Corner radius step."),
  primitive("curve.12", "12px", "Corner radius step."),
  primitive("curve.18", "18px", "Corner radius step."),
  primitive("curve.24", "24px", "Corner radius step."),
  primitive("ease.entrance", "cubic-bezier(0.2, 0, 0, 1)", "Entrance and state-change easing."),
  primitive("ease.overshoot", "cubic-bezier(0.34, 1.56, 0.64, 1)", "Toggle settle easing."),
  primitive("ease.linear", "linear", "Constant-rate motion: spinners and marquees."),
];

export const primitiveTokens: readonly TokenDefinition[] = [
  ...ink,
  ...indigo,
  ...slate,
  ...statusHues,
  ...nonColour,
];
