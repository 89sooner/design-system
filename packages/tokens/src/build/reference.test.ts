import { describe, expect, test } from "vitest";
import { TokenBuildError } from "./errors";
import { referenceChain, token } from "./fixtures";
import { buildTokenIndex, resolveTokens } from "./reference";

function resolve(tokens: ReturnType<typeof token>[]): ReadonlyMap<string, string> {
  return resolveTokens(buildTokenIndex(tokens)).values;
}

function failure(tokens: ReturnType<typeof token>[]): TokenBuildError {
  try {
    resolve(tokens);
  } catch (error) {
    if (error instanceof TokenBuildError) return error;
    throw error;
  }
  throw new Error("expected the build to fail");
}

describe("token reference resolution", () => {
  test('FR-TOK-003 AC-1: `{ "surface.2": "{surface.subtle}" }` resolves to the literal value', () => {
    const values = resolve([
      token("surface.subtle", "semantic", { value: "#101722" }),
      token("surface.2", "semantic", { alias: "surface.subtle" }),
    ]);

    expect(values.get("surface.2")).toBe("#101722");
  });

  test("FR-TOK-003 AC-1: a reference embedded in a literal is substituted in place", () => {
    const values = resolve([
      token("border.strong", "semantic", { value: "rgba(148, 163, 184, 0.3)" }),
      token("elevation.overlay", "semantic", {
        value: "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px {border.strong}",
      }),
    ]);

    expect(values.get("elevation.overlay")).toBe(
      "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.3)",
    );
  });

  test("FR-TOK-003 AC-1: `{accent}` addresses the `accent.DEFAULT` leaf", () => {
    const values = resolve([
      token("accent.DEFAULT", "semantic", { value: "#6d7cff" }),
      token("status.running", "semantic", { alias: "accent" }),
    ]);

    expect(values.get("status.running")).toBe("#6d7cff");
  });

  test("FR-TOK-003 AC-2: a chain of ten references resolves", () => {
    const values = resolve(referenceChain(10));
    expect(values.get("t0")).toBe("#ffffff");
  });

  test("FR-TOK-003 AC-2: a chain deeper than ten references fails the build", () => {
    const error = failure(referenceChain(11));

    expect(error.code).toBe("TOK-DEPTH");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("exceeds the maximum depth of 10");
  });

  test("FR-TOK-003 AC-3: a circular reference fails the build and prints the cycle path", () => {
    const error = failure([
      token("a", "semantic", { alias: "b" }),
      token("b", "semantic", { alias: "c" }),
      token("c", "semantic", { alias: "a" }),
    ]);

    expect(error.code).toBe("TOK-CYCLE");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("a → b → c → a");
  });

  test("FR-TOK-003 AC-3: a token that references itself is a cycle", () => {
    const error = failure([token("a", "semantic", { alias: "a" })]);

    expect(error.code).toBe("TOK-CYCLE");
    expect(error.format()).toContain("a → a");
  });

  test("FR-TOK-003 AC-4: an unknown key fails the build and prints the source and target keys", () => {
    const error = failure([token("card.background", "component", { alias: "surface.absent" })]);

    expect(error.code).toBe("TOK-UNKNOWN-REF");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("from: card.background");
    expect(error.format()).toContain("to:   surface.absent");
  });

  test("FR-TOK-003: a numeric value resolves to its string form", () => {
    const values = resolve([token("z.base", "semantic", { value: 0 })]);
    expect(values.get("z.base")).toBe("0");
  });

  test("ENT-TOK-001 invariant 7: a duplicate token key fails the build", () => {
    const tokens = [
      token("surface.base", "semantic", { value: "#080b12" }),
      token("surface.base", "semantic", { value: "#000000" }),
    ];

    expect(() => buildTokenIndex(tokens)).toThrow(TokenBuildError);
    expect(() => buildTokenIndex(tokens)).toThrow(/declared more than once/);
  });

  test("ENT-TOK-003: resolution records one graph edge per reference, with its resolved value", () => {
    const { edges } = resolveTokens(
      buildTokenIndex([
        token("surface.subtle", "semantic", { value: "#101722" }),
        token("surface.2", "semantic", { alias: "surface.subtle" }),
      ]),
    );

    expect(edges).toEqual([
      { from: "surface.2", to: "surface.subtle", depth: 0, resolvedValue: "#101722" },
    ]);
  });
});
