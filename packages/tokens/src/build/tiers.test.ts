import { describe, expect, test } from "vitest";
import type { TokenDefinition } from "../schema";
import { canonicalTokens } from "../token-source";
import { TokenBuildError } from "./errors";
import { token } from "./fixtures";
import { buildTokenIndex, resolveTokens } from "./reference";
import { assertEveryTokenHasATier, assertTierDirection, findTierViolations } from "./tiers";

function check(tokens: TokenDefinition[]): TokenBuildError {
  try {
    assertTierDirection(buildTokenIndex(tokens));
  } catch (error) {
    if (error instanceof TokenBuildError) return error;
    throw error;
  }
  throw new Error("expected the tier checker to fail");
}

describe("tier direction: primitive <- semantic <- component", () => {
  test("FR-TOK-002 AC-1: a primitive that references another token fails the build", () => {
    const error = check([
      token("ink.900", "primitive", { value: "#080b12" }),
      token("ink.800", "primitive", { alias: "ink.900" }),
    ]);

    expect(error.code).toBe("TOK-TIER");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("ink.800 (primitive) -> ink.900 (primitive)");
    expect(error.format()).toContain("a primitive token references nothing");
  });

  test("FR-TOK-002 AC-2: a semantic token may reference a primitive", () => {
    const tokens = [
      token("red.400", "primitive", { value: "#f87171" }),
      token("meter.exceeded", "semantic", { alias: "red.400" }),
    ];

    expect(findTierViolations(buildTokenIndex(tokens))).toEqual([]);
  });

  test("FR-TOK-002 AC-3: a component token may reference a semantic token", () => {
    const tokens = [
      token("surface.raised", "semantic", { value: "#141d2a" }),
      token("card.background", "component", { alias: "surface.raised" }),
    ];

    expect(findTierViolations(buildTokenIndex(tokens))).toEqual([]);
  });

  test("FR-TOK-002 AC-4: a semantic token referencing a component token fails and prints the key pair", () => {
    const error = check([
      token("button.radius", "component", { value: "12px" }),
      token("radius.md", "semantic", { alias: "button.radius" }),
    ]);

    expect(error.code).toBe("TOK-TIER");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("radius.md (semantic) -> button.radius (component)");
    expect(error.format()).toContain("a semantic token may not reference a component token");
  });

  test("FR-TOK-002 AC-4: a primitive referencing a semantic token fails and prints the key pair", () => {
    const error = check([
      token("surface.base", "semantic", { value: "#080b12" }),
      token("ink.900", "primitive", { alias: "surface.base" }),
    ]);

    expect(error.format()).toContain("ink.900 (primitive) -> surface.base (semantic)");
  });

  test("FR-TOK-002 AC-4: a reverse reference embedded in a literal value is caught too", () => {
    const error = check([
      token("overlay.border", "component", { value: "1px" }),
      token("elevation.overlay", "semantic", { value: "0 0 0 1px {overlay.border}" }),
    ]);

    expect(error.format()).toContain("elevation.overlay (semantic) -> overlay.border (component)");
  });

  test("FR-TOK-002: a same-tier reference is not a direction violation (tokens spec 10.2)", () => {
    const tokens = [
      token("surface.subtle", "semantic", { value: "#101722" }),
      token("surface.2", "semantic", { alias: "surface.subtle" }),
    ];

    expect(findTierViolations(buildTokenIndex(tokens))).toEqual([]);
  });

  test("FR-TOK-002 exception handling: a token without a tier fails the build and prints its key", () => {
    const untiered = { key: "surface.mystery", tier: "surface", description: "" } as unknown as TokenDefinition;

    try {
      assertEveryTokenHasATier([untiered]);
      throw new Error("expected the tier checker to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TokenBuildError);
      expect((error as TokenBuildError).code).toBe("TOK-TIER-MISSING");
      expect((error as TokenBuildError).format()).toContain("surface.mystery");
    }
  });
});

/**
 * CR-008 (DEV-001) corrected FR-TOK-002 AC-2 and AC-3 to permit same-tier references. These are
 * the four the tokens spec 2.3 declares, checked against the real token source rather than a
 * fixture — they are exactly what FR-THM-001 AC-2 and design principle P-5 require to exist.
 */
describe("same-tier references in the real token source (CR-008)", () => {
  const source = canonicalTokens();
  const index = buildTokenIndex(source);
  const edges = resolveTokens(index).edges;

  const SAME_TIER_ALIASES: readonly (readonly [from: string, to: string])[] = [
    ["surface.2", "surface.subtle"],
    ["border.DEFAULT", "border.default"],
    ["status.running", "accent.DEFAULT"],
    ["elevation.overlay", "border.strong"],
  ];

  test("FR-TOK-002 AC-4: the real token source contains no upward reference", () => {
    expect(findTierViolations(index)).toEqual([]);
  });

  test.each(SAME_TIER_ALIASES)(
    "FR-TOK-002 AC-2 (CR-008): semantic `%s` may reference semantic `%s`",
    (from, to) => {
      expect(index.get(from)?.tier).toBe("semantic");
      expect(index.get(to)?.tier).toBe("semantic");
      expect(edges.some((edge) => edge.from === from && edge.to === to)).toBe(true);
    },
  );

  test("FR-TOK-002 AC-2 (CR-008): those four are the only same-tier semantic references", () => {
    const sameTier = edges
      .filter((edge) => index.get(edge.from)?.tier === "semantic")
      .filter((edge) => index.get(edge.to)?.tier === "semantic")
      .map((edge) => [edge.from, edge.to]);

    expect(sameTier.sort()).toEqual(SAME_TIER_ALIASES.map((pair) => [...pair]).sort());
  });

  test("FR-TOK-002 AC-3 (CR-008): a component token may reference another component token", () => {
    const tokens = [
      token("button.radius", "component", { value: "12px" }),
      token("card.radius", "component", { alias: "button.radius" }),
    ];

    expect(findTierViolations(buildTokenIndex(tokens))).toEqual([]);
  });

  test("FR-TOK-002 AC-6 (CR-008): a same-tier cycle is a reference error, not a tier error", () => {
    const cyclic = [
      token("a", "semantic", { alias: "b" }),
      token("b", "semantic", { alias: "a" }),
    ];
    const cyclicIndex = buildTokenIndex(cyclic);

    expect(findTierViolations(cyclicIndex)).toEqual([]);
    expect(() => resolveTokens(cyclicIndex)).toThrow(/error\[TOK-CYCLE\]/);
  });
});
