/**
 * Public contrast measurement (CR-052, API-TOK-004).
 *
 * The same arithmetic `conductor-check-contrast` runs — parse, composite a translucent foreground
 * over the opaque background into the 8-bit buffer a browser paints, then the WCAG 2.1 ratio — so a
 * value measured in a browser at runtime agrees with the build's report to the last digit.
 *
 * Refs: CR-052 FR-DOC-010 FR-THM-004
 */
import { compositeOver, contrastRatio as ratioOf, findColors, type Rgba } from "./contrast/color";

/** Exactly one colour, as the build requires: a bare colour, or a compound value such as `focusRing`'s box-shadow. */
function parse(role: "foreground" | "background", value: string): Rgba {
  const colours = findColors(value);
  if (colours.length !== 1) throw new Error(`contrastRatio: ${role} "${value}" must hold exactly one #hex, rgb() or hsl() colour, found ${colours.length}`);
  return colours[0] as Rgba;
}

/**
 * WCAG 2.1 contrast ratio (1–21) of `foreground` drawn on `background`.
 *
 * Accepts `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`/`rgba()` and `hsl()`/`hsla()`, alone or as the single
 * colour inside a compound value such as a box-shadow. A translucent
 * foreground is composited over the background first; the background must be opaque, because what
 * it sits on is unknown here. Throws on anything else rather than returning a ratio that could pass.
 */
export function contrastRatio(foreground: string, background: string): number {
  const back = parse("background", background);
  if (back.alpha < 1) throw new Error(`contrastRatio: background "${background}" is translucent; composite it onto its surface first`);
  return ratioOf(compositeOver(parse("foreground", foreground), back), back);
}
