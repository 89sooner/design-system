/**
 * Theme-independent semantic scales: typography, spacing, radius, elevation order,
 * responsive breakpoints and motion.
 *
 * Values from `conductor_design_system_tokens.md` sections 5.9, 5.12, 5.13 and 9.1.
 * Both palettes share them, so they live outside `palette.dark.ts`.
 *
 * Refs: WP-005 FR-TOK-007 FR-TOK-008 FR-TOK-009
 */
import type { TokenDefinition } from "./schema";

function semantic(key: string, value: string | number, description: string): TokenDefinition {
  return { key, tier: "semantic", value, usage: "decorative", description };
}

function aliased(key: string, alias: string, description: string): TokenDefinition {
  return { key, tier: "semantic", alias, usage: "decorative", description };
}

/** FR-TOK-007 AC-1. The only seven font sizes the system exposes. */
export const FONT_SIZE_PX = {
  "2xs": 10,
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 16,
  xl: 20,
} as const;

/**
 * FR-TOK-007 AC-2. `lineHeight = round(size × ratio)`, half-up (tokens spec 5.9.2).
 * Uppercase labels tighten (1.40 / 1.45), body keeps the source's 1.50, headings use 1.30.
 * Emitted in px, not as a unitless ratio, so nesting cannot compound the multiplier.
 */
const LINE_HEIGHT_RATIO = {
  "2xs": 1.4,
  xs: 1.45,
  sm: 1.5,
  base: 1.5,
  md: 1.5,
  lg: 1.5,
  xl: 1.3,
} as const;

type FontStep = keyof typeof FONT_SIZE_PX;

const FONT_STEPS = Object.keys(FONT_SIZE_PX) as FontStep[];

function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

export function lineHeightPx(step: FontStep): number {
  return roundHalfUp(FONT_SIZE_PX[step] * LINE_HEIGHT_RATIO[step]);
}

const fontSize: TokenDefinition[] = FONT_STEPS.map((step) =>
  semantic(`font.size.${step}`, `${FONT_SIZE_PX[step]}px`, `Font size step \`${step}\`.`),
);

const fontLineHeight: TokenDefinition[] = FONT_STEPS.map((step) =>
  semantic(
    `font.lineHeight.${step}`,
    `${lineHeightPx(step)}px`,
    `Line height paired with \`font.size.${step}\`.`,
  ),
);

/** Spacing steps: 4px apart through `space.4`, then 8px apart (tokens spec 5.9.3). */
const space: TokenDefinition[] = [
  aliased("space.1", "scale.4", "Tightest gap. Badge padding block."),
  aliased("space.2", "scale.8", "Button padding block, button gap."),
  aliased("space.3", "scale.12", "Table cell padding inline, input padding inline."),
  aliased("space.4", "scale.16", "Table cell padding block."),
  aliased("space.5", "scale.24", "Card padding, card grid gap, content stack gap."),
  aliased("space.6", "scale.32", "Page stack gap."),
  aliased("space.7", "scale.40", "Section spacing."),
  aliased("space.8", "scale.48", "Widest gap."),
];

/** Source radii, reproduced exactly. Neither arithmetic nor geometric (FR-THM-001 exception). */
const radius: TokenDefinition[] = [
  aliased("radius.xs", "curve.6", "Smallest radius."),
  aliased("radius.sm", "curve.9", "Form control radius."),
  aliased("radius.md", "curve.12", "Button radius, compact card radius."),
  aliased("radius.lg", "curve.18", "Card and overlay radius."),
  aliased("radius.xl", "curve.24", "Largest radius."),
  semantic("radius.pill", "9999px", "Fully rounded badge, toggle, marker and progress geometry."),
];

/** FR-TOK-008 AC-1. Six layers; AC-3 forbids two layers sharing a value. */
export const Z_LAYERS = {
  base: 0,
  raised: 10,
  sticky: 20,
  drawer: 30,
  overlay: 40,
  popover: 50,
} as const;

const zDescriptions: Readonly<Record<keyof typeof Z_LAYERS, string>> = {
  base: "Normal flow.",
  raised: "Lifts a focus ring out of an ancestor's `overflow: hidden`.",
  sticky: "The app shell top bar.",
  drawer: "Side navigation and the `Drawer` panel.",
  overlay: "`Dialog` and `Drawer` scrims.",
  popover: "`Tooltip`, `DropdownMenu`, `Select` content, skip link.",
};

const z: TokenDefinition[] = (Object.keys(Z_LAYERS) as (keyof typeof Z_LAYERS)[]).map((layer) =>
  semantic(`z.${layer}`, Z_LAYERS[layer], zDescriptions[layer]),
);

/**
 * FR-TOK-009 AC-1. Custom properties do not evaluate inside `@media` conditions
 * (SRS 5.2 constraint 3), so the build substitutes these as literals.
 */
export const BREAKPOINT_PX = {
  sm: 560,
  md: 800,
  lg: 1080,
} as const;

const breakpointDescriptions: Readonly<Record<keyof typeof BREAKPOINT_PX, string>> = {
  sm: "Single-column card grid; taller form controls.",
  md: "Single-column split layout; table horizontal scroll; off-canvas navigation.",
  lg: "Narrower navigation; narrower minimum grid column.",
};

const breakpoint: TokenDefinition[] = (
  Object.keys(BREAKPOINT_PX) as (keyof typeof BREAKPOINT_PX)[]
).map((name) =>
  semantic(`breakpoint.${name}`, `${BREAKPOINT_PX[name]}px`, breakpointDescriptions[name]),
);

/** Duration and easing bound into one string, the way the source consumes them (tokens spec 9.1). */
const motion: TokenDefinition[] = [
  semantic("motion.fast", "140ms {ease.entrance}", "Colour, background and border transitions."),
  semantic("motion.standard", "240ms {ease.entrance}", "Overlay and page entrance."),
  semantic("motion.bounce", "300ms {ease.overshoot}", "Toggle and switch settle."),
];

export const scaleTokens: readonly TokenDefinition[] = [
  ...fontSize,
  ...fontLineHeight,
  ...space,
  ...radius,
  ...z,
  ...breakpoint,
  ...motion,
];
