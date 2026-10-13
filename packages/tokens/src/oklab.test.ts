// Refs: CR-050 FR-THM-004
import { describe, expect, test } from "vitest";
import { fromOklab, mixOklab, toOklab, toneValues, TONE_WEIGHTS } from "./oklab";

describe("CR-050 OKLab mixing", () => {
  test("round-trips sRGB through OKLab", () => {
    for (const hex of ["#000000", "#ffffff", "#6d7cff", "#ef4444", "#141d2a", "#fbfcfd"]) expect(fromOklab(toOklab(hex))).toBe(hex);
  });

  test("white has OKLab lightness 1 and no chroma", () => {
    const [l, a, b] = toOklab("#ffffff");
    expect(l).toBeCloseTo(1, 5);
    expect(Math.hypot(a, b)).toBeLessThan(1e-4);
  });

  test("weight 0 and 1 return the endpoints; weights outside [0, 1] are rejected", () => {
    expect(mixOklab("#6d7cff", "#141d2a", 0)).toBe("#141d2a");
    expect(mixOklab("#6d7cff", "#141d2a", 1)).toBe("#6d7cff");
    expect(() => mixOklab("#6d7cff", "#141d2a", 1.5)).toThrow(/weight/);
    expect(() => mixOklab("rgb(1, 2, 3)", "#141d2a", 0.5)).toThrow(/#rrggbb/);
  });

  test("an OKLab mix keeps lightness evenly spaced (midpoint lightness is the mean)", () => {
    const [l1] = toOklab("#6d7cff");
    const [l2] = toOklab("#141d2a");
    const [mid] = toOklab(mixOklab("#6d7cff", "#141d2a", 0.5));
    expect(mid).toBeCloseTo((l1 + l2) / 2, 2);
  });

  test("toneValues emits every tone × state", () => {
    const values = toneValues({ accent: "#6d7cff", danger: "#ef4444" }, "#141d2a");
    expect(Object.keys(values).sort()).toEqual(["accent", "danger"].flatMap((tone) => Object.keys(TONE_WEIGHTS).map((state) => `tone.${tone}.${state}`)).sort());
    for (const value of Object.values(values)) expect(value).toMatch(/^#[0-9a-f]{6}$/);
  });
});
