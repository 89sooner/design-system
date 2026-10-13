// Refs: CR-052 FR-DOC-010 W-031
//
// Pure rules behind the theme playground. The screen keeps only the three inputs (accent, radius
// scale, density); every derived value, every CSS custom property to override and every contrast
// result comes from these functions, with the colour arithmetic taken from
// @conductor-by-89soone/tokens so a measured ratio matches the build's contrast report.
import { contrastRatio, fromOklab, toneValues, toOklab, type OklabColor } from "@conductor-by-89soone/tokens";
import type { Theme } from "./theme";

export interface PlaygroundToken {
  readonly key: string;
  readonly cssName: string;
  readonly alias?: string;
  readonly values: Readonly<Record<string, string>>;
}

export interface PairResult {
  readonly id: string;
  readonly theme: string;
  readonly foreground: string;
  readonly background: string;
  readonly foregroundValue: string;
  readonly backgroundValue: string;
  readonly usage: string;
  readonly threshold: number;
  readonly ratio: number;
}

export type RadiusScale = "sharp" | "tight" | "default" | "round";
export type Density = "comfortable" | "compact";

export interface PlaygroundSettings {
  readonly accent: string;
  readonly radius: RadiusScale;
  readonly density: Density;
}

export const RADIUS_FACTORS: Readonly<Record<RadiusScale, number>> = { sharp: 0, tight: 0.5, default: 1, round: 1.5 };
/** The radius steps the scale multiplies. `radius.pill` stays a pill at every scale. */
const RADIUS_STEPS = ["radius.xs", "radius.sm", "radius.md", "radius.lg", "radius.xl"] as const;
/** Every semantic token the accent input drives; contrast rows are the pairs that touch one of them. */
export const ACCENT_KEYS = ["accent.DEFAULT", "accent.strong", "accent.soft", "accent.glow", "focusRing", "tone.accent.background", "tone.accent.border", "tone.accent.backgroundHover", "tone.accent.borderHover"] as const;

const HEX = /^#[0-9a-f]{6}$/i;
const RGBA = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/i;

export const isHexColour = (value: string): boolean => HEX.test(value.trim());

/** Contrast pairs name the accent `accent`; the token is `accent.DEFAULT` (tokens spec 3.2). */
export const tokenKeyOf = (pairKey: string): string => (pairKey === "accent" ? "accent.DEFAULT" : pairKey);

function valueOf(tokens: readonly PlaygroundToken[], theme: Theme, key: string): string {
  const token = tokens.find((candidate) => candidate.key === key);
  const value = token?.values[theme];
  if (value === undefined) throw new Error(`theme playground: no ${theme} value for ${key}`);
  return value;
}

const channels = (hex: string): readonly number[] => [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));

/** Swap the single `rgba()` colour in a value for `hex`, keeping its alpha and everything around it. */
export function recolour(value: string, hex: string): string {
  const [r, g, b] = channels(hex);
  // cdt-allow-literal: builds the override value a consumer copies; not a style in this app
  return value.replace(RGBA, (_match, alpha: string) => `rgba(${r}, ${g}, ${b}, ${alpha})`);
}

const add = (one: OklabColor, other: OklabColor, sign: 1 | -1): OklabColor => [one[0] + sign * other[0], one[1] + sign * other[1], one[2] + sign * other[2]];

/** `accent.strong` keeps the source's OKLab offset from the accent, so the default input reproduces it. */
function strongFor(accent: string, defaultAccent: string, defaultStrong: string): string {
  return fromOklab(add(toOklab(accent), add(toOklab(defaultStrong), toOklab(defaultAccent), -1), 1));
}

const scalePx = (value: string, factor: number): string => `${Math.round(Number.parseFloat(value) * factor)}px`;

export function defaultSettings(tokens: readonly PlaygroundToken[], theme: Theme): PlaygroundSettings {
  return { accent: valueOf(tokens, theme, "accent.DEFAULT"), radius: "default", density: "comfortable" };
}

/** Semantic key → value for every semantic token the settings change. Unchanged keys are left out. */
export function semanticOverrides(tokens: readonly PlaygroundToken[], theme: Theme, settings: PlaygroundSettings): Readonly<Record<string, string>> {
  const current = (key: string) => valueOf(tokens, theme, key);
  const accent = settings.accent.trim().toLowerCase();
  const derived: Record<string, string> = {};
  if (isHexColour(accent) && accent !== current("accent.DEFAULT").toLowerCase()) {
    const tones = toneValues({ accent, danger: accent }, current("surface.raised"));
    Object.assign(derived, {
      "accent.DEFAULT": accent,
      "accent.strong": strongFor(accent, current("accent.DEFAULT"), current("accent.strong")),
      "accent.soft": recolour(current("accent.soft"), accent),
      "accent.glow": recolour(current("accent.glow"), accent),
      focusRing: recolour(current("focusRing"), accent),
      ...Object.fromEntries(Object.entries(tones).filter(([key]) => key.startsWith("tone.accent."))),
    });
  }
  const factor = RADIUS_FACTORS[settings.radius];
  if (factor !== 1) for (const key of RADIUS_STEPS) derived[key] = scalePx(current(key), factor);
  return derived;
}

/** The overridden semantic key a token's value comes from, following its alias chain. */
function sourceOf(tokens: readonly PlaygroundToken[], token: PlaygroundToken, overrides: Readonly<Record<string, string>>): string | undefined {
  const seen = new Set<string>();
  for (let cursor: PlaygroundToken | undefined = token; cursor !== undefined && !seen.has(cursor.key); cursor = tokens.find((candidate) => candidate.key === cursor?.alias)) {
    if (cursor.key in overrides) return cursor.key;
    seen.add(cursor.key);
  }
  return undefined;
}

/**
 * CSS custom property → value. Component tokens are emitted as resolved values (`--cdt-button-radius:
 * 12px`), so overriding `--cdt-radius-md` alone would not reach a button; every token whose alias
 * chain leads to an overridden key is overridden too.
 */
export function cssOverrides(tokens: readonly PlaygroundToken[], overrides: Readonly<Record<string, string>>): readonly (readonly [string, string])[] {
  return tokens.flatMap((token) => {
    const source = sourceOf(tokens, token, overrides);
    return source === undefined ? [] : [[token.cssName, overrides[source] as string] as const];
  });
}

export function overrideSnippet(theme: Theme, declarations: readonly (readonly [string, string])[]): string {
  if (declarations.length === 0) return `/* No overrides: the ${theme} theme is unchanged. */`;
  return [`[data-cdt-theme="${theme}"] {`, ...declarations.map(([name, value]) => `  ${name}: ${value};`), "}"].join("\n");
}

export interface MeasuredPair extends PairResult {
  readonly pass: boolean;
  /** The report's ratio for the unchanged theme, to show what moved. */
  readonly baseline: number;
}

/** The theme's pairs that touch an accent key, re-measured with the overrides applied. */
export function measureAccentPairs(results: readonly PairResult[], theme: Theme, overrides: Readonly<Record<string, string>>): readonly MeasuredPair[] {
  const touches = (key: string) => (ACCENT_KEYS as readonly string[]).includes(tokenKeyOf(key));
  return results.filter((result) => result.theme === theme && (touches(result.foreground) || touches(result.background))).map((result) => {
    const foregroundValue = overrides[tokenKeyOf(result.foreground)] ?? result.foregroundValue;
    const backgroundValue = overrides[tokenKeyOf(result.background)] ?? result.backgroundValue;
    const ratio = Number(contrastRatio(foregroundValue, backgroundValue).toFixed(4));
    return { ...result, foregroundValue, backgroundValue, ratio, baseline: result.ratio, pass: ratio >= result.threshold };
  });
}
