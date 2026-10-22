/**
 * Light palette derived mechanically from tokens spec section 6 (FR-THM-002).
 *
 * Metadata, keys and aliases come from the canonical dark palette. This map changes only values
 * that the derivation specifies differently, keeping the two semantic key sets inseparable.
 *
 * The derivation used to be a bare `map`, which meant a key in `values` that matched nothing in the
 * dark palette was silently ignored and the token kept its dark value. That is the one real bug the
 * cross-theme contract check cannot see: it compares key *sets*, and a typo leaves both sets
 * identical while one theme renders the wrong colour. `derivePalette` makes it a build error.
 *
 * Refs: WP-010 FR-THM-002 FR-QA-001
 */
import { TokenBuildError } from "./build/errors";
import { toneValues } from "./oklab";
import { darkPalette } from "./palette.dark";
import type { TokenDefinition } from "./schema";

const baseValues: Readonly<Record<string, string>> = {
  // CR-066: lifted and desaturated. Same 220° cool-neutral hue and the same base → elevated order,
  // but the range is [0.88, 1.00] instead of [0.84, 1.00] and the chroma is lower, so the page reads
  // as a clean light ground instead of a grey-blue wash.
  "surface.base": "#eff1f5",
  "surface.canvas": "#f3f5f8",
  "surface.subtle": "#f8f9fb",
  "surface.raised": "#fcfdfe",
  "surface.elevated": "#ffffff",
  "surface.overlay": "rgba(12, 18, 28, 0.45)",
  "surface.glass": "rgba(252, 253, 254, 0.86)",
  "surface.timeline": "#f6f7f9",
  "surface.track": "rgba(12, 18, 28, 0.08)",
  "surface.tint.1": "rgba(79, 91, 213, 0.1)",
  "surface.tint.2": "rgba(4, 120, 87, 0.05)",
  "text.primary": "#0c121c",
  "text.secondary": "#33415a",
  "text.muted": "#4d5a6e",
  "text.placeholder": "#4d5a6e",
  "text.faint": "#6b788c",
  "text.inverse": "#f4f7fb",
  "text.monoPayload": "#1b2537",
  // CR-065: decorative edges are translucent ink like the dark slate alphas, so they sit at the
  // same weight on every surface (1.15 / 1.29 / 1.55 on `surface.raised`, dark 1.17 / 1.37 / 1.75).
  // `border.control` stays the only edge that carries 3:1, and it stays the darkest.
  "border.subtle": "rgba(12, 18, 28, 0.07)",
  "border.default": "rgba(12, 18, 28, 0.12)",
  "border.strong": "rgba(12, 18, 28, 0.2)",
  "border.control": "rgba(12, 18, 28, 0.5)",
  "accent.DEFAULT": "#4f5bd5",
  "accent.strong": "#3f4ac0",
  "accent.soft": "rgba(79, 91, 213, 0.14)",
  "accent.glow": "rgba(79, 91, 213, 0.22)",
  "status.queued": "#52607a",
  "status.waiting": "#b45309",
  "status.success": "#047857",
  "status.partial": "#a16207",
  "status.danger": "#c81e1e",
  "status.neutralEnd": "#3f4b5f",
  "meter.normal": "#047857",
  "meter.warning": "#b45309",
  "meter.exceeded": "#dc2626",
  // CR-066: two layers. A tight contact shadow gives the edge; a soft ambient one gives the lift.
  // The single wide blur of the dark ramp reads as a grey smudge under a light card.
  "elevation.raised": "0 1px 2px rgba(12, 18, 28, 0.05), 0 4px 12px rgba(12, 18, 28, 0.05)",
  "elevation.hover": "0 2px 4px rgba(12, 18, 28, 0.06), 0 12px 28px rgba(12, 18, 28, 0.1)",
  "elevation.overlay": "0 4px 12px rgba(12, 18, 28, 0.08), 0 20px 48px rgba(12, 18, 28, 0.16), 0 0 0 1px {border.strong}",
  "focusRing": "0 0 0 3px rgba(79, 91, 213, 0.8)",
  "state.hover": "rgba(12, 18, 28, 0.05)",
  "state.selected": "rgba(79, 91, 213, 0.12)",
  "state.disabled": "#e2e8f0",
  "state.disabledPolicy": "#fef3c7",
  // dataviz — chart series colours, darkened for light surfaces (CR-036).
  "dataviz.series.1": "#d45946",
  "dataviz.series.2": "#228f7d",
  "dataviz.series.3": "#d54e8d",
  "dataviz.series.4": "#22933d",
  "dataviz.series.5": "#ca45d3",
  "dataviz.series.6": "#4a9022",
  "dataviz.series.7": "#906adc",
  "dataviz.series.8": "#81851f",
  "dataviz.series.9": "#5a7cd8",
  "dataviz.series.10": "#bd6b2c",
  "dataviz.series.11": "#258c9c",
  "dataviz.series.12": "#d75369",
  "dataviz.series.13": "#22915d",
  "dataviz.series.14": "#d446b2",
  "dataviz.series.15": "#2a9322",
  "dataviz.series.16": "#ab5dd9",
  "dataviz.series.17": "#688b21",
  "dataviz.series.18": "#7773de",
  "dataviz.series.19": "#9b7c24",
  "dataviz.series.20": "#2f85c7",
  "dataviz.sequential.1": "#7d74dc",
  "dataviz.sequential.2": "#6e65d8",
  "dataviz.sequential.3": "#5c52d4",
  "dataviz.sequential.4": "#4539cd",
  "dataviz.sequential.5": "#3329a4",
};

/**
 * Keys that exist only in the light theme. Empty today. Each entry must carry
 * `themeSpecific: true`, or the FR-QA-001 contract check would report it as missing from dark
 * instead of exempting it — the exemption has to be declared on the token, not inferred from
 * which list it appears in.
 */
/** CR-050: the light tone tints, mixed from the light accent, danger and raised surface. */
const values: Readonly<Record<string, string>> = {
  ...baseValues,
  ...toneValues(
    { accent: baseValues["accent.DEFAULT"] as string, danger: baseValues["status.danger"] as string },
    baseValues["surface.raised"] as string,
  ),
};

export const lightAdditions: readonly TokenDefinition[] = [];

/**
 * @param base the canonical palette every other theme takes its keys and metadata from.
 * @param overrides value-only overrides, keyed by token key.
 * @param additions tokens that exist only in the derived theme.
 * @throws TokenBuildError `TOK-THEME-KEY` when an override names no key in `base`, or an addition
 *   is not marked `themeSpecific`.
 */
export function derivePalette(
  base: readonly TokenDefinition[],
  overrides: Readonly<Record<string, string>>,
  additions: readonly TokenDefinition[] = [],
): readonly TokenDefinition[] {
  const baseKeys = new Set(base.map((token) => token.key));
  const unmatched = Object.keys(overrides).filter((key) => !baseKeys.has(key));

  if (unmatched.length > 0) {
    throw new TokenBuildError("TOK-THEME-KEY", "theme override names a key the base palette does not declare", [
      ...unmatched.map((key) => `override: ${key}`),
      "hint: the override would be dropped and the token would keep its dark value, which the " +
        "key-set contract check cannot see. Fix the spelling, or declare the key in the base palette.",
    ]);
  }

  const notExempt = additions.filter((token) => token.themeSpecific !== true);
  if (notExempt.length > 0) {
    throw new TokenBuildError("TOK-THEME-KEY", "theme-only token is not marked `themeSpecific`", [
      ...notExempt.map((token) => `addition: ${token.key}`),
      "hint: FR-QA-001 exempts a key from the cross-theme contract only when the token declares " +
        "`themeSpecific: true`, so the exemption stays visible in the report.",
    ]);
  }

  const derived = base.map((token) => {
    const value = overrides[token.key];
    return value === undefined ? token : { ...token, value, alias: undefined };
  });

  return [...derived, ...additions];
}

export const lightPalette: readonly TokenDefinition[] = derivePalette(darkPalette, values, lightAdditions);
