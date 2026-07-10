/**
 * The whole token source, assembled in emission order.
 *
 * A theme is a palette swapped in beneath the shared primitives, scales and component tokens.
 * Only the dark palette exists today (FR-THM-001 makes it canonical); WP-010 adds
 * `palette.light.ts` as a second entry in `THEME_SOURCES` and nothing else moves.
 *
 * Refs: WP-002 FR-THM-001
 */
import { componentTokens } from "./components";
import { darkPalette } from "./palette.dark";
import { primitiveTokens } from "./primitives";
import { scaleTokens } from "./scales";
import type { TokenDefinition } from "./schema";

export interface ThemeSource {
  readonly theme: string;
  readonly colorScheme: "dark" | "light";
  /** Selectors the theme's declaration block applies to. */
  readonly selectors: readonly string[];
  readonly palette: readonly TokenDefinition[];
}

/**
 * Dark also answers to `:root`, which makes it the fallback when `data-cdt-theme` is absent or
 * holds an unrecognised value (FR-THM-003 AC-3).
 */
export const THEME_SOURCES: readonly ThemeSource[] = [
  {
    theme: "dark",
    colorScheme: "dark",
    selectors: [":root", '[data-cdt-theme="dark"]'],
    palette: darkPalette,
  },
];

/** Full token list for one theme: primitives, that theme's palette, shared scales, components. */
export function tokensForTheme(theme: ThemeSource): TokenDefinition[] {
  return [...primitiveTokens, ...theme.palette, ...scaleTokens, ...componentTokens];
}

/** The canonical theme's token list. Key set and tiers are identical across themes. */
export function canonicalTokens(): TokenDefinition[] {
  return tokensForTheme(THEME_SOURCES[0] as ThemeSource);
}
