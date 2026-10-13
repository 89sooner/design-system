/**
 * OKLab mixing for derived state colours (CR-050).
 *
 * The stylesheet used to tint tone buttons with `color-mix(in srgb, …)` at render time. Mixing in
 * gamma-encoded sRGB darkens and desaturates the midpoints, and a render-time mix is invisible to
 * `checkContrast`. These tints are now computed here, at build time, in OKLab — the Cartesian form
 * of OKLCH, so lightness is perceptually even — and emitted as plain hex. No browser has to support
 * `oklch()` or relative colour syntax, and every derived background can sit in a contrast pair.
 *
 * OKLab rather than polar OKLCH: the surfaces are near-neutral, so their hue is noise, and an OKLCH
 * mix would swing the tint's hue along that noise (a red mixed toward a blue-grey surface drifts
 * purple). Mixing a and b linearly keeps the tone's hue and walks its chroma down evenly.
 *
 * Refs: CR-050 FR-THM-004 FR-TOK-001
 */

/** An OKLab (L, a, b) triple, or an sRGB triple in [0, 1] internally. */
export type OklabColor = readonly [number, number, number];

const HEX = /^#([0-9a-f]{6})$/i;

function parseHex(hex: string): OklabColor {
  const match = HEX.exec(hex);
  if (match === null) throw new Error(`oklab: expected #rrggbb, got "${hex}"`);
  const digits = match[1] as string;
  return [0, 2, 4].map((offset) => Number.parseInt(digits.slice(offset, offset + 2), 16) / 255) as unknown as OklabColor;
}

const toLinear = (channel: number): number => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const toGamma = (channel: number): number => (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);
const clamp = (channel: number): number => Math.min(1, Math.max(0, channel));

/** sRGB → OKLab (Björn Ottosson's reference matrices). */
export function toOklab(hex: string): OklabColor {
  const [r, g, b] = parseHex(hex).map(toLinear) as unknown as OklabColor;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab → sRGB hex, clipping each out-of-gamut channel. */
export function fromOklab([lightness, a, b]: OklabColor): string {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear: OklabColor = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return `#${linear.map((channel) => Math.round(clamp(toGamma(clamp(channel))) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/** `weight` of `foreground` over `background`, mixed in OKLab. 0 → background, 1 → foreground. */
export function mixOklab(foreground: string, background: string, weight: number): string {
  if (!(weight >= 0 && weight <= 1)) throw new Error(`oklab: weight must be within [0, 1], got ${weight}`);
  const front = toOklab(foreground);
  const back = toOklab(background);
  return fromOklab(front.map((channel, index) => channel * weight + (back[index] as number) * (1 - weight)) as unknown as OklabColor);
}

/** The tone tints, as weights of the tone over `surface.raised`. The same weights the srgb mixes used. */
export const TONE_WEIGHTS = {
  background: 0.04,
  border: 0.14,
  backgroundHover: 0.12,
  borderHover: 0.45,
} as const;

/** The two tones whose state tints are derived (`tone.accent.*`, `tone.danger.*`). */
export type ToneName = "accent" | "danger";

/** `tone.<tone>.<state>` → hex for one theme, from that theme's tone colours and raised surface. */
export function toneValues(tones: Readonly<Record<ToneName, string>>, surfaceRaised: string): Readonly<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const tone of Object.keys(tones) as ToneName[]) {
    for (const [state, weight] of Object.entries(TONE_WEIGHTS)) out[`tone.${tone}.${state}`] = mixOklab(tones[tone], surfaceRaised, weight);
  }
  return out;
}
