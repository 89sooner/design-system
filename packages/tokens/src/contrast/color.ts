/**
 * Colour parsing, alpha compositing and the WCAG 2.1 contrast formula.
 *
 * Three decisions are load-bearing and worth stating once:
 *
 *  1. **Compositing happens in 8-bit space.** A translucent foreground is mixed with its
 *     background and each channel is rounded to an integer before luminance is taken, because a
 *     browser paints into an 8-bit buffer. Keeping the mix in floating point shifts
 *     `border.control` on `surface.raised` from 3.23 to 3.24 and `focusRing` on `surface.elevated`
 *     from 3.34 to 3.33 — the tokens spec 8.2 table is the 8-bit reading (FR-THM-004 AC-4).
 *
 *  2. **The background of a pair must be opaque.** Compositing a translucent colour needs a
 *     concrete backdrop; a translucent background would need one of its own, and the pair does
 *     not name it. `check.ts` rejects such a pair rather than silently assuming black.
 *
 *  3. **A value carries at most one colour.** `focusRing` is a `box-shadow`
 *     (`0 0 0 3px rgba(...)`), so the ring's colour is found by scanning the value rather than by
 *     parsing shadow syntax. Two colours in one value (`elevation.overlay`) are ambiguous and
 *     rejected — no pair declares such a token.
 *
 * Refs: WP-007 FR-THM-004 FR-A11Y-004
 */

/** Channels are 0-255; `alpha` is 0-1. */
export interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly alpha: number;
}

const HEX_SOURCE = "#([0-9a-f]{3,8})\\b";
const FUNCTIONAL_SOURCE = "\\b(rgba?|hsla?)\\(\\s*([^()]*)\\)";

const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), high);

function fromHex(digits: string): Rgba | undefined {
  const byte = (pair: string): number => parseInt(pair.length === 1 ? pair + pair : pair, 16);

  if (digits.length === 3 || digits.length === 4) {
    const [r, g, b, a] = [...digits] as [string, string, string, string?];
    return { r: byte(r), g: byte(g), b: byte(b), alpha: a === undefined ? 1 : byte(a) / 255 };
  }
  if (digits.length === 6 || digits.length === 8) {
    const at = (index: number): string => digits.slice(index, index + 2);
    return {
      r: byte(at(0)),
      g: byte(at(2)),
      b: byte(at(4)),
      alpha: digits.length === 8 ? byte(at(6)) / 255 : 1,
    };
  }
  return undefined;
}

/** Accepts both `rgb(1, 2, 3)` and the space/slash form `rgb(1 2 3 / 50%)`. */
function argumentsOf(body: string): string[] {
  return body
    .replace(/\//g, " ")
    .split(/[\s,]+/)
    .filter((part) => part !== "");
}

function toAlpha(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const value = raw.endsWith("%") ? Number(raw.slice(0, -1)) / 100 : Number(raw);
  return Number.isFinite(value) ? clamp(value, 0, 1) : 1;
}

function fromRgb(body: string): Rgba | undefined {
  const parts = argumentsOf(body);
  if (parts.length < 3) return undefined;

  const channel = (raw: string): number => {
    const value = raw.endsWith("%") ? (Number(raw.slice(0, -1)) / 100) * 255 : Number(raw);
    return Number.isFinite(value) ? clamp(Math.round(value), 0, 255) : Number.NaN;
  };

  const r = channel(parts[0] as string);
  const g = channel(parts[1] as string);
  const b = channel(parts[2] as string);
  if ([r, g, b].some(Number.isNaN)) return undefined;
  return { r, g, b, alpha: toAlpha(parts[3]) };
}

/** CSS Color 4 HSL → sRGB. Present because FR-TOK-001 AC-1 names `hsl()` as a colour literal. */
function fromHsl(body: string): Rgba | undefined {
  const parts = argumentsOf(body);
  if (parts.length < 3) return undefined;

  const hue = Number((parts[0] as string).replace(/deg$/i, ""));
  const saturation = Number((parts[1] as string).replace(/%$/, "")) / 100;
  const lightness = Number((parts[2] as string).replace(/%$/, "")) / 100;
  if (![hue, saturation, lightness].every((value) => Number.isFinite(value))) return undefined;

  const chroma = (1 - Math.abs(2 * clamp(lightness, 0, 1) - 1)) * clamp(saturation, 0, 1);
  const sextant = (((hue % 360) + 360) % 360) / 60;
  const secondary = chroma * (1 - Math.abs((sextant % 2) - 1));
  const lift = clamp(lightness, 0, 1) - chroma / 2;

  const wheel: readonly [number, number, number][] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ];
  const [r, g, b] = wheel[Math.floor(sextant) % 6] as [number, number, number];

  const channel = (raw: number): number => clamp(Math.round((raw + lift) * 255), 0, 255);
  return { r: channel(r), g: channel(g), b: channel(b), alpha: toAlpha(parts[3]) };
}

function parseFunctional(name: string, body: string): Rgba | undefined {
  return name.toLowerCase().startsWith("hsl") ? fromHsl(body) : fromRgb(body);
}

/** Parses a value that is exactly one colour. Returns `undefined` for anything else. */
export function parseColor(value: string): Rgba | undefined {
  const trimmed = value.trim();

  const hex = new RegExp(`^${HEX_SOURCE}$`, "i").exec(trimmed);
  if (hex) return fromHex(hex[1] as string);

  const functional = new RegExp(`^${FUNCTIONAL_SOURCE}$`, "i").exec(trimmed);
  if (functional) return parseFunctional(functional[1] as string, functional[2] as string);

  return undefined;
}

/** Every colour literal inside a compound value such as a `box-shadow`. */
export function findColors(value: string): Rgba[] {
  const found: Rgba[] = [];

  for (const match of value.matchAll(new RegExp(FUNCTIONAL_SOURCE, "gi"))) {
    const parsed = parseFunctional(match[1] as string, match[2] as string);
    if (parsed) found.push(parsed);
  }
  for (const match of value.matchAll(new RegExp(HEX_SOURCE, "gi"))) {
    const parsed = fromHex(match[1] as string);
    if (parsed) found.push(parsed);
  }
  return found;
}

/** WCAG 2.1 linearised channel. */
function linearise(channel8: number): number {
  const channel = channel8 / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance. Alpha is ignored — composite the colour first. */
export function relativeLuminance({ r, g, b }: Rgba): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** WCAG 2.1 contrast ratio, 1 to 21. Argument order does not matter. */
export function contrastRatio(one: Rgba, other: Rgba): number {
  const first = relativeLuminance(one);
  const second = relativeLuminance(other);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Source-over compositing onto an opaque backdrop, rounded into the 8-bit buffer a browser
 * actually paints (FR-THM-004 AC-4). An already-opaque colour is returned unchanged.
 */
export function compositeOver(foreground: Rgba, background: Rgba): Rgba {
  if (foreground.alpha >= 1) return foreground;
  const mix = (front: number, back: number): number =>
    Math.round(front * foreground.alpha + back * (1 - foreground.alpha));
  return {
    r: mix(foreground.r, background.r),
    g: mix(foreground.g, background.g),
    b: mix(foreground.b, background.b),
    alpha: 1,
  };
}

/** `#rrggbb`, for the report. Only composited (opaque) colours are formatted. */
export function toHex({ r, g, b }: Rgba): string {
  const pair = (channel: number): string => channel.toString(16).padStart(2, "0");
  return `#${pair(r)}${pair(g)}${pair(b)}`;
}
