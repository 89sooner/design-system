// Refs: CR-052 FR-DOC-010
/* cdt-allow-literal: colour and length fixtures are the inputs and expected outputs under test */
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { cssOverrides, defaultSettings, isHexColour, measureAccentPairs, overrideSnippet, recolour, semanticOverrides, type PairResult, type PlaygroundToken } from "./theme-overrides";

// The same artifacts the screen bundles (tokens.json, contrast-report.json), read from the build.
const readJson = <T,>(path: string): T => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as T;
const { tokens } = readJson<{ tokens: PlaygroundToken[] }>("../../../packages/tokens/dist/tokens.json");
const { results } = readJson<{ results: PairResult[] }>("../../../packages/tokens/dist/contrast-report.json");
const themes = ["dark", "light"] as const;
const cssMap = (declarations: readonly (readonly [string, string])[]) => new Map(declarations);

describe("FR-DOC-010 AC-2: the playground measures with the build's arithmetic", () => {
  test.each(themes)("%s: unchanged settings reproduce the contrast report for every accent pair", (theme) => {
    const measured = measureAccentPairs(results, theme, semanticOverrides(tokens, theme, defaultSettings(tokens, theme)));
    expect(measured.map((pair) => pair.id)).toEqual(["CP-009", "CP-010", "CP-011", "CP-012", "CP-013", "CP-014", "CP-015", "CP-118", "CP-119"]);
    for (const pair of measured) {
      expect(pair.ratio, pair.id).toBe(pair.baseline);
      expect(pair.pass, pair.id).toBe(true);
    }
  });

  test("a dark accent on the dark theme fails the body pairs it is measured in", () => {
    const overrides = semanticOverrides(tokens, "dark", { ...defaultSettings(tokens, "dark"), accent: "#30385a" });
    const failing = measureAccentPairs(results, "dark", overrides).filter((pair) => !pair.pass).map((pair) => pair.id);
    expect(failing).toEqual(expect.arrayContaining(["CP-009", "CP-010", "CP-013"]));
  });
});

describe("FR-DOC-010 AC-1: one accent input drives every derived accent token", () => {
  test("unchanged settings override nothing", () => {
    for (const theme of themes) {
      expect(semanticOverrides(tokens, theme, defaultSettings(tokens, theme))).toEqual({});
      expect(overrideSnippet(theme, cssOverrides(tokens, {}))).toMatch(/No overrides/);
    }
  });

  test("a new accent recolours the family and keeps each value's alpha and shape", () => {
    const overrides = semanticOverrides(tokens, "dark", { ...defaultSettings(tokens, "dark"), accent: "#14B8A6" });
    expect(overrides["accent.DEFAULT"]).toBe("#14b8a6");
    expect(overrides["accent.soft"]).toBe("rgba(20, 184, 166, 0.14)");
    expect(overrides["accent.glow"]).toBe("rgba(20, 184, 166, 0.28)");
    expect(overrides.focusRing).toBe("0 0 0 3px rgba(20, 184, 166, 0.8)");
    expect(overrides["accent.strong"]).toMatch(/^#[0-9a-f]{6}$/);
    expect(Object.keys(overrides).filter((key) => key.startsWith("tone.accent."))).toHaveLength(4);
  });

  test("component tokens that alias an overridden key are overridden too", () => {
    const overrides = semanticOverrides(tokens, "light", { ...defaultSettings(tokens, "light"), accent: "#b45309", radius: "sharp" });
    const css = cssMap(cssOverrides(tokens, overrides));
    expect(css.get("--cdt-accent")).toBe("#b45309");
    expect(css.get("--cdt-button-primary-background")).toBe("#b45309");
    expect(css.get("--cdt-input-border-focus")).toBe("#b45309");
    expect(css.get("--cdt-button-focus-ring")).toBe(overrides.focusRing);
    expect(css.get("--cdt-radius-md")).toBe("0px");
    expect(css.get("--cdt-button-radius")).toBe("0px");
    expect(css.has("--cdt-radius-pill")).toBe(false);
    expect(overrideSnippet("light", [...css])).toMatch(/^\[data-cdt-theme="light"\] \{\n {2}--cdt-/);
  });

  test("a round scale multiplies the radius steps and leaves an invalid accent alone", () => {
    const overrides = semanticOverrides(tokens, "dark", { ...defaultSettings(tokens, "dark"), accent: "#12", radius: "round" });
    expect(overrides["radius.md"]).toBe("18px");
    expect(overrides["accent.DEFAULT"]).toBeUndefined();
    expect(isHexColour("#12")).toBe(false);
    expect(isHexColour(" #A1b2C3 ")).toBe(true);
    expect(recolour("0 0 0 3px rgba(1, 2, 3, 0.8)", "#ffffff")).toBe("0 0 0 3px rgba(255, 255, 255, 0.8)");
  });
});
