import { describe, expect, test } from "vitest";
import { componentTokens } from "./components";
import { darkPalette } from "./palette.dark";
import { scaleTokens } from "./scales";
import type { TokenDefinition } from "./schema";
import { checkThemeContract, formatMissingKeys } from "./theme-contract";
import { THEME_SOURCES } from "./token-source";
import type { ThemeSource } from "./token-source";

const DARK = THEME_SOURCES[0] as ThemeSource;

function themeNamed(name: string, palette: readonly TokenDefinition[]): ThemeSource {
  return { theme: name, colorScheme: "dark", selectors: [`[data-cdt-theme="${name}"]`], palette };
}

const without = (key: string): TokenDefinition[] => darkPalette.filter((token) => token.key !== key);

const withThemeSpecific = (key: string): TokenDefinition[] =>
  darkPalette.map((token) => (token.key === key ? { ...token, themeSpecific: true } : token));

describe("FR-QA-001: the cross-theme token contract", () => {
  test("FR-QA-001 AC-1: the declared themes have an empty symmetric difference", () => {
    const report = checkThemeContract(THEME_SOURCES);
    expect(report.missing).toEqual([]);
    expect(report.themes).toEqual(["dark"]);
    expect(report.checkedKeys).toBeGreaterThan(0);
  });

  test("FR-QA-001 AC-1: a key missing from one theme is reported, named, and attributed per theme", () => {
    const report = checkThemeContract([DARK, themeNamed("light", without("accent.soft"))]);

    expect(report.missing).toHaveLength(1);
    expect(report.missing[0]).toMatchObject({
      key: "accent.soft",
      tier: "semantic",
      presentIn: ["dark"],
      missingFrom: ["light"],
    });
    expect(formatMissingKeys(report)).toEqual([
      "missing from `light`: accent.soft (semantic, declared by dark)",
    ]);
  });

  test("FR-QA-001 AC-1: the difference is symmetric — an extra key in either theme is caught", () => {
    const extra: TokenDefinition = {
      key: "accent.lightOnly",
      tier: "semantic",
      value: "#ffffff",
      usage: "decorative",
      description: "fixture",
    };
    const report = checkThemeContract([DARK, themeNamed("light", [...darkPalette, extra])]);

    expect(report.missing.map((entry) => entry.key)).toEqual(["accent.lightOnly"]);
    expect(report.missing[0]?.missingFrom).toEqual(["dark"]);
  });

  test("FR-QA-001 AC-2: a component token present in only one theme is caught the same way", () => {
    const componentOnly: TokenDefinition = {
      key: "button.lightOnly",
      tier: "component",
      value: "#ffffff",
      usage: "decorative",
      description: "fixture",
    };
    const report = checkThemeContract([DARK, themeNamed("light", [...darkPalette, componentOnly])]);

    expect(report.missing).toHaveLength(1);
    expect(report.missing[0]).toMatchObject({ key: "button.lightOnly", tier: "component", missingFrom: ["dark"] });
  });

  test("FR-QA-001 exception: `themeSpecific: true` exempts a key and lists it in the report", () => {
    const light = themeNamed("light", withThemeSpecific("accent.glow").filter((token) => token.key !== "accent.glow"));
    const dark = themeNamed("dark", withThemeSpecific("accent.glow"));
    const report = checkThemeContract([dark, light]);

    expect(report.missing).toEqual([]);
    expect(report.exemptions).toEqual([
      { key: "accent.glow", theme: "dark", reason: expect.stringContaining("Dark-only glow") },
    ]);
  });

  test("FR-TOK-002 AC-5: primitives are outside the contract; they are shared, not per theme", () => {
    const report = checkThemeContract([DARK, themeNamed("light", darkPalette)]);
    expect(report.missing).toEqual([]);
    expect(report.checkedKeys).toBe(darkPalette.length + scaleTokens.length + componentTokens.length);
  });

  test("FR-QA-001 AC-3: the contract check runs as part of `pnpm test`", () => {
    // This test file lives under `packages/tokens/src`, which the `tokens` vitest project includes,
    // and CI runs `pnpm test`. Asserting the check is callable here is what makes AC-3 true.
    expect(checkThemeContract(THEME_SOURCES).missing).toEqual([]);
  });
});
