/**
 * The light palette is *derived*, not written. That makes one class of mistake invisible to every
 * other check in the package: an override keyed on a name the dark palette does not declare is
 * simply dropped, the token silently keeps its dark value, and both themes still declare the same
 * key set — so the FR-QA-001 cross-theme contract check, which compares key sets, passes.
 *
 * `derivePalette` turns that into a build error. These tests drive it with fixtures rather than the
 * real palette, so they still describe the failure after the real palette changes.
 *
 * Refs: WP-010 FR-THM-002 FR-QA-001
 */
import { describe, expect, test } from "vitest";
import { TokenBuildError } from "./build/errors";
import { compositeOver, contrastRatio, parseColor, type Rgba } from "./contrast/color";
import { darkPalette } from "./palette.dark";
import { derivePalette, lightAdditions, lightPalette } from "./palette.light";
import type { TokenDefinition } from "./schema";

const base: TokenDefinition[] = [
  { key: "surface.base", tier: "semantic", value: "#080b12", usage: "decorative", description: "Base surface." },
  { key: "text.primary", tier: "semantic", value: "#f4f7fb", usage: "body", description: "Primary text." },
];

function thrownBy(action: () => unknown): TokenBuildError {
  try {
    action();
  } catch (error) {
    if (error instanceof TokenBuildError) return error;
    throw error;
  }
  throw new Error("expected the call to throw a TokenBuildError");
}

describe("FR-THM-002: deriving a theme from the canonical palette", () => {
  test("FR-THM-002: an override replaces the value and drops the alias, keeping every other field", () => {
    const derived = derivePalette(base, { "text.primary": "#0c121c" });
    const primary = derived.find((token) => token.key === "text.primary");

    expect(primary?.value).toBe("#0c121c");
    expect(primary?.alias).toBeUndefined();
    expect(primary?.usage).toBe("body");
    expect(primary?.description).toBe("Primary text.");
    expect(derived.find((token) => token.key === "surface.base")?.value).toBe("#080b12");
  });

  test("FR-QA-001: a misspelled override key is a build error, not a silently dropped value", () => {
    // The bug this exists for: `text.primry` would leave `text.primary` on its dark value while
    // both themes still declare the identical key set.
    const error = thrownBy(() => derivePalette(base, { "text.primry": "#0c121c" }));

    expect(error.code).toBe("TOK-THEME-KEY");
    expect(error.format()).toContain("override: text.primry");
    expect(error.format()).toContain("would be dropped");
  });

  test("FR-QA-001: a theme-only token must declare `themeSpecific`, so the exemption stays visible", () => {
    const addition: TokenDefinition = {
      key: "surface.paper",
      tier: "semantic",
      value: "#ffffff",
      usage: "decorative",
      description: "Light-only paper surface.",
    };

    const error = thrownBy(() => derivePalette(base, {}, [addition]));
    expect(error.code).toBe("TOK-THEME-KEY");
    expect(error.format()).toContain("addition: surface.paper");

    const derived = derivePalette(base, {}, [{ ...addition, themeSpecific: true }]);
    expect(derived.map((token) => token.key)).toContain("surface.paper");
  });

  test("FR-THM-005 AC-8 (CR-064): the light placeholder role has light `text.muted`'s value", () => {
    const value = (key: string) => lightPalette.find((token) => token.key === key)?.value;
    expect(value("text.placeholder")).toBe(value("text.muted"));
  });

  test("FR-THM-002: the real light palette derives from dark with no theme-only keys today", () => {
    expect(lightAdditions).toEqual([]);
    expect(lightPalette.map((token) => token.key)).toEqual(darkPalette.map((token) => token.key));
  });
});

/**
 * CR-065. The light decorative edges used to be opaque mid greys (4.36:1 and 5.52:1 on
 * `surface.raised`), heavier than the 3:1 control edge's dark counterpart and three times the weight
 * of the same keys in dark (1.37:1, 1.75:1). Cards, panels and dividers then drew as hard outlines
 * that competed with the inputs inside them. These checks keep the two themes on one ladder.
 */
describe("CR-065 FR-THM-005 AC-4: light edges keep the dark theme's weight ladder", () => {
  const colour = (palette: readonly TokenDefinition[], key: string): Rgba => {
    const resolved = (k: string): string => {
      const token = palette.find((candidate) => candidate.key === k);
      if (token === undefined) throw new Error(`missing ${k}`);
      return token.alias === undefined ? (token.value as string) : resolved(token.alias);
    };
    const parsed = parseColor(resolved(key));
    if (parsed === undefined) throw new Error(`unparsable ${key}`);
    return parsed;
  };
  const edge = (palette: readonly TokenDefinition[], border: string, surface: string): number => {
    const background = colour(palette, surface);
    return contrastRatio(compositeOver(colour(palette, border), background), background);
  };
  const decorative = ["border.subtle", "border.default", "border.strong"];

  test.each(["surface.base", "surface.raised", "surface.elevated"])(
    "CR-065: on light %s the edges climb subtle < default < strong < 3:1 <= control",
    (surface) => {
      const ratios = [...decorative, "border.control"].map((key) => edge(lightPalette, key, surface));
      expect(ratios).toEqual([...ratios].sort((one, other) => one - other));
      expect(ratios[2]).toBeLessThan(3);
      expect(ratios[3]).toBeGreaterThanOrEqual(3);
    },
  );

  test.each(decorative)("CR-065: light %s is never heavier than the same key in dark", (key) => {
    expect(edge(lightPalette, key, "surface.raised")).toBeLessThanOrEqual(edge(darkPalette, key, "surface.raised"));
  });
});


/**
 * CR-066. The light surfaces sat in [0.84, 1.00] relative luminance with a saturated 220° tint, so
 * the page read as a grey-blue wash, and the light elevation ramp was the dark ramp's single wide
 * blur at a lower alpha, which reads as a grey smudge under a light card. These checks keep the
 * lifted ground and the two-layer shadow.
 */
describe("CR-066 FR-THM-002: light surfaces and elevation", () => {
  const luminance = (key: string): number => {
    const value = lightPalette.find((token) => token.key === key)?.value;
    const parsed = typeof value === "string" ? parseColor(value) : undefined;
    if (parsed === undefined) throw new Error(`unparsable ${key}`);
    const channel = (c: number): number => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * channel(parsed.r) + 0.7152 * channel(parsed.g) + 0.0722 * channel(parsed.b);
  };
  const order = ["surface.base", "surface.canvas", "surface.timeline", "surface.subtle", "surface.raised", "surface.elevated"];

  test("CR-066: light surfaces keep the dark depth order and start from a lifted ground (≥ 0.87)", () => {
    const steps = order.map(luminance);
    expect(steps).toEqual([...steps].sort((one, other) => one - other));
    expect(new Set(steps).size).toBe(steps.length);
    expect(steps[0]).toBeGreaterThanOrEqual(0.87);
  });

  test.each(["elevation.raised", "elevation.hover", "elevation.overlay"])(
    "CR-066: light %s starts with a tight contact layer (blur ≤ 12px) before the ambient one",
    (key) => {
      const value = String(lightPalette.find((token) => token.key === key)?.value ?? "");
      const layers = value.split(/,(?![^(]*\))/).map((layer) => layer.trim()).filter((layer) => !layer.startsWith("0 0 0"));
      expect(layers.length).toBeGreaterThanOrEqual(2);
      const blur = Number(/^\S+\s+\S+\s+(\d+)px/.exec(layers[0] ?? "")?.[1]);
      expect(blur).toBeLessThanOrEqual(12);
    },
  );
});
