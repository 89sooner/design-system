import { describe, expect, test } from "vitest";
import { compositeOver, contrastRatio, findColors, parseColor, relativeLuminance, toHex } from "./color";
import type { Rgba } from "./color";

const rgba = (r: number, g: number, b: number, alpha = 1): Rgba => ({ r, g, b, alpha });

const SURFACE_BASE = rgba(8, 11, 18);
const SURFACE_RAISED = rgba(20, 29, 42);
const ACCENT_80 = rgba(109, 124, 255, 0.8);

describe("colour parsing", () => {
  test("FR-THM-004 AC-4: parseColor reads the hex and rgb() forms the token source uses", () => {
    expect(parseColor("#080b12")).toEqual(rgba(8, 11, 18));
    expect(parseColor("#fff")).toEqual(rgba(255, 255, 255));
    expect(parseColor("rgba(148, 163, 184, 0.6)")).toEqual(rgba(148, 163, 184, 0.6));
    expect(parseColor("rgb(20 29 42)")).toEqual(rgba(20, 29, 42));
  });

  test("FR-TOK-001 AC-1: parseColor reads hsl(), the third literal form the rule names", () => {
    expect(parseColor("hsl(0, 100%, 50%)")).toEqual(rgba(255, 0, 0));
    expect(parseColor("hsl(120 100% 25%)")).toEqual(rgba(0, 128, 0));
  });

  test("FR-THM-004 AC-4: parseColor rejects a value that is not a single colour", () => {
    expect(parseColor("0 0 0 3px rgba(109, 124, 255, 0.8)")).toBeUndefined();
    expect(parseColor("Inter, ui-sans-serif, sans-serif")).toBeUndefined();
  });

  test("FR-THM-004 AC-4: findColors extracts the ring colour out of a box-shadow value", () => {
    expect(findColors("0 0 0 3px rgba(109, 124, 255, 0.8)")).toEqual([ACCENT_80]);
  });

  test("FR-THM-004 AC-4: findColors reports both colours of a two-colour shadow", () => {
    const value = "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.3)";
    expect(findColors(value)).toHaveLength(2);
  });

  test("FR-THM-004 AC-4: findColors finds nothing in a font stack", () => {
    expect(findColors("Inter, ui-sans-serif, sans-serif")).toEqual([]);
  });
});

describe("WCAG 2.1 relative luminance and contrast ratio", () => {
  test("FR-THM-004 AC-4: relativeLuminance anchors at 0 for black and 1 for white", () => {
    expect(relativeLuminance(rgba(0, 0, 0))).toBeCloseTo(0, 12);
    expect(relativeLuminance(rgba(255, 255, 255))).toBeCloseTo(1, 12);
  });

  test("FR-THM-004 AC-4: contrastRatio of black on white is 21:1 and is order-independent", () => {
    const black = rgba(0, 0, 0);
    const white = rgba(255, 255, 255);
    expect(contrastRatio(black, white)).toBeCloseTo(21, 6);
    expect(contrastRatio(white, black)).toBeCloseTo(21, 6);
  });

  test("FR-THM-004 AC-4: a colour against itself is 1:1", () => {
    expect(contrastRatio(SURFACE_RAISED, SURFACE_RAISED)).toBeCloseTo(1, 12);
  });
});

describe("alpha compositing", () => {
  test("FR-THM-004 AC-4: an opaque colour passes through compositeOver untouched", () => {
    expect(compositeOver(SURFACE_RAISED, SURFACE_BASE)).toEqual(SURFACE_RAISED);
  });

  test("FR-THM-005 AC-1: accent at alpha 0.80 composites to #595ecf-class 8-bit channels", () => {
    // 109*0.8 + 8*0.2 = 88.8 -> 89; 124*0.8 + 11*0.2 = 101.4 -> 101; 255*0.8 + 18*0.2 = 207.6 -> 208
    expect(compositeOver(ACCENT_80, SURFACE_BASE)).toEqual(rgba(89, 101, 208));
    expect(toHex(compositeOver(ACCENT_80, SURFACE_BASE))).toBe("#5965d0");
  });

  test("FR-THM-004 AC-4: compositing rounds into the 8-bit buffer a browser paints", () => {
    // Float compositing would give 3.2433 here; the tokens spec 8.2 table records the 8-bit 3.23.
    const control = rgba(148, 163, 184, 0.6);
    const composited = compositeOver(control, SURFACE_RAISED);
    expect(composited).toEqual(rgba(97, 109, 127));
    expect(contrastRatio(composited, SURFACE_RAISED).toFixed(2)).toBe("3.23");
  });
});
