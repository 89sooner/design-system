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

  test("FR-THM-002: the real light palette derives from dark with no theme-only keys today", () => {
    expect(lightAdditions).toEqual([]);
    expect(lightPalette.map((token) => token.key)).toEqual(darkPalette.map((token) => token.key));
  });
});
