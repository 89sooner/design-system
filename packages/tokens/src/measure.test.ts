// Refs: CR-052 FR-DOC-010 API-TOK-004
import { describe, expect, it } from "vitest";
import { checkContrast } from "./contrast/check";
import { contrastRatio, mixOklab, toneValues } from "./index";

describe("CR-052 contrastRatio is the build's arithmetic", () => {
  it("agrees with conductor-check-contrast on every declared pair in both themes", () => {
    const { results } = checkContrast();
    expect(results.length).toBeGreaterThan(200);
    for (const result of results) {
      expect(Number(contrastRatio(result.foregroundValue, result.backgroundValue).toFixed(4)), result.id).toBeCloseTo(result.ratio, 4);
    }
  });

  it("is symmetric for opaque colours and spans 1 to 21", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 6);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 6);
    expect(contrastRatio("#777", "#777")).toBe(1);
  });

  it("reads the single colour of a compound value, as the build does for focusRing", () => {
    expect(contrastRatio("0 0 0 3px #ffffff", "#000000")).toBeCloseTo(21, 6);
  });

  it("composites a translucent foreground over the background", () => {
    expect(contrastRatio("rgba(255, 255, 255, 0)", "#000000")).toBe(1);
    expect(contrastRatio("rgba(255, 255, 255, 0.5)", "#000000")).toBeCloseTo(contrastRatio("#808080", "#000000"), 6);
  });

  it("refuses values it cannot measure instead of returning a ratio", () => {
    expect(() => contrastRatio("var(--cdt-accent)", "#000000")).toThrow(/foreground/);
    expect(() => contrastRatio("0 0 0 1px #fff, 0 0 0 3px #000", "#000000")).toThrow(/found 2/);
    expect(() => contrastRatio("#ffffff", "rgba(0, 0, 0, 0.5)")).toThrow(/translucent/);
  });

  it("exports the OKLab helpers the build derives tone tints with", () => {
    expect(mixOklab("#6d7cff", "#0d1320", 1)).toBe("#6d7cff");
    expect(Object.keys(toneValues({ accent: "#6d7cff", danger: "#ff5c7a" }, "#0d1320"))).toHaveLength(8);
  });
});
