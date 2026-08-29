import { describe, expect, test } from "vitest";
import { buildTokenIndex, resolveReferenceTarget } from "./build/reference";
import { CONTRAST_THRESHOLDS, contrastPairs } from "./contrast-pairs";
import { canonicalTokens } from "./token-source";

const index = buildTokenIndex(canonicalTokens());

/** tokens spec 8.2: 116 declared pairs, CP-001 through CP-117 with CP-025 permanently retired (CR-036 added CP-043~CP-117). */
const DECLARED_PAIRS = 116;

describe("FR-THM-004 AC-1: the declared contrast pairs", () => {
  test("FR-THM-004 AC-1: contrast-pairs.ts declares the 41 pairs of tokens spec 8.2", () => {
    expect(contrastPairs).toHaveLength(DECLARED_PAIRS);
  });

  test("FR-THM-004 AC-1: every pair id is unique and matches CP-###", () => {
    const ids = contrastPairs.map((pair) => pair.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^CP-\d{3}$/);
  });

  test("CR-035: the ids run CP-001..CP-117 with only CP-025 missing, and it stays missing", () => {
    // CR-006 removed CP-025; CR-035 restored the obligation as CP-042 rather than reusing the
    // number, so an old report naming CP-025 still means the retired 2.24:1 measurement.
    const numbers = contrastPairs.map((pair) => Number(pair.id.slice(3)));
    const expected = Array.from({ length: 117 }, (_, offset) => offset + 1).filter((number) => number !== 25);
    expect([...numbers].sort((one, other) => one - other)).toEqual(expected);
  });

  test("FR-THM-004 AC-2: every pair carries a body, large or nonText threshold", () => {
    for (const pair of contrastPairs) {
      expect(Object.keys(CONTRAST_THRESHOLDS)).toContain(pair.usage);
      expect(CONTRAST_THRESHOLDS[pair.usage]).toBeGreaterThan(0);
    }
  });

  test("FR-A11Y-004: body is 4.5:1 while large text and non-text are 3:1", () => {
    expect(CONTRAST_THRESHOLDS).toEqual({ body: 4.5, large: 3, nonText: 3 });
  });

  test("FR-THM-004 AC-1: every pair names semantic or component tokens that exist", () => {
    for (const pair of contrastPairs) {
      for (const key of [pair.foreground, pair.background]) {
        const resolved = resolveReferenceTarget(index, key);
        expect(resolved, `${pair.id} names ${key}`).toBeDefined();
        expect(index.get(resolved as string)?.tier).not.toBe("primitive");
      }
    }
  });

  test("FR-A11Y-004 AC-3: no pair declares a decorative token as its foreground", () => {
    for (const pair of contrastPairs) {
      const key = resolveReferenceTarget(index, pair.foreground) as string;
      expect(index.get(key)?.usage, `${pair.id} foreground ${pair.foreground}`).not.toBe("decorative");
    }
  });

  test("FR-THM-004: every pair is declared for both themes, so WP-010 measures the light palette", () => {
    for (const pair of contrastPairs) {
      expect(pair.themes).toEqual(["dark", "light"]);
    }
  });

  test("FR-THM-005 AC-4: accent on surface.elevated is not a pair; the lint owns that ban", () => {
    const accentOnElevated = contrastPairs.find(
      (pair) => pair.foreground === "accent" && pair.background === "surface.elevated",
    );
    expect(accentOnElevated).toBeUndefined();
  });
});
