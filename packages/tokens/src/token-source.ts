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
import { lightPalette } from "./palette.light";
import { primitiveTokens } from "./primitives";
import { scaleTokens } from "./scales";
import type { TokenDefinition } from "./schema";

export interface ThemeSource {
  readonly theme: string;
  readonly colorScheme: "dark" | "light";
  /** Selectors the theme's declaration block applies to. */
  readonly selectors: readonly string[];
  readonly palette: readonly TokenDefinition[];
  /** Theme-specific component values; keys replace the shared component definition. */
  readonly componentOverrides?: readonly TokenDefinition[];
}

function componentOverride(key: string, source: { value: string } | { alias: string }): TokenDefinition {
  const token = componentTokens.find((candidate) => candidate.key === key);
  if (token === undefined) throw new Error(`unknown component token override: ${key}`);
  return { ...token, ...source };
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
  {
    theme: "light",
    colorScheme: "light",
    selectors: [':root[data-cdt-theme="light"]'],
    palette: lightPalette,
    componentOverrides: [
      componentOverride("button.policyDisabled.text", { alias: "severity.destructive" }),
      componentOverride("card.background", { alias: "surface.elevated" }),
      componentOverride("card.border", { alias: "border.strong" }),
      componentOverride("badge.severity.text", { alias: "text.inverse" }),
      componentOverride("input.background", { alias: "surface.elevated" }),
      componentOverride("input.backgroundFocus", { alias: "surface.elevated" }),
      componentOverride("overlay.background", { alias: "surface.elevated" }),
      componentOverride("overlay.backgroundBlur", { value: "0px" }),
    ],
  },
];

/** Full token list for one theme: primitives, that theme's palette, shared scales, components. */
export function tokensForTheme(theme: ThemeSource): TokenDefinition[] {
  const overrides = new Map((theme.componentOverrides ?? []).map((token) => [token.key, token]));
  return [
    ...primitiveTokens,
    ...theme.palette,
    ...scaleTokens,
    ...componentTokens.map((token) => overrides.get(token.key) ?? token),
  ];
}

/** The canonical theme's token list. Key set and tiers are identical across themes. */
export function canonicalTokens(): TokenDefinition[] {
  return tokensForTheme(THEME_SOURCES[0] as ThemeSource);
}
