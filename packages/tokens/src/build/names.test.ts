import { describe, expect, test } from "vitest";
import { TokenBuildError } from "./errors";
import { token } from "./fixtures";
import { assertNoNameCollisions, assertPrefixed, cssPropertyName } from "./names";

describe("token key to CSS custom property name", () => {
  test("FR-TOK-004 AC-2: `surface.raised` becomes `--cdt-surface-raised`", () => {
    expect(cssPropertyName("surface.raised")).toBe("--cdt-surface-raised");
  });

  test.each([
    ["surface.2", "--cdt-surface-2"],
    ["text.monoPayload", "--cdt-text-mono-payload"],
    ["status.neutralEnd", "--cdt-status-neutral-end"],
    ["accent.strong", "--cdt-accent-strong"],
    ["focusRing", "--cdt-focus-ring"],
    ["font.size.2xs", "--cdt-font-size-2xs"],
    ["state.disabledPolicy", "--cdt-state-disabled-policy"],
    ["button.primary.background", "--cdt-button-primary-background"],
  ])("FR-TOK-004 AC-2: `%s` becomes `%s`", (key, expected) => {
    expect(cssPropertyName(key)).toBe(expected);
  });

  test("FR-TOK-004 AC-2: a `DEFAULT` segment drops out, so `accent.DEFAULT` becomes `--cdt-accent`", () => {
    expect(cssPropertyName("accent.DEFAULT")).toBe("--cdt-accent");
    expect(cssPropertyName("border.DEFAULT")).toBe("--cdt-border");
  });

  test("FR-TOK-004 AC-2: `border.DEFAULT` and `border.default` keep distinct property names", () => {
    expect(cssPropertyName("border.DEFAULT")).not.toBe(cssPropertyName("border.default"));
  });

  test("FR-TOK-004 AC-1: every emitted property carries the `--cdt-` prefix", () => {
    expect(() => assertPrefixed(["--cdt-surface-base", "--cdt-accent"])).not.toThrow();
  });

  test("FR-TOK-004 AC-3: an unprefixed custom property fails the build with exit code 2", () => {
    try {
      assertPrefixed(["--cdt-surface-base", "--surface-base"]);
      throw new Error("expected the prefix checker to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TokenBuildError);
      expect((error as TokenBuildError).code).toBe("TOK-PREFIX");
      expect((error as TokenBuildError).exitCode).toBe(2);
      expect((error as TokenBuildError).format()).toContain("--surface-base");
    }
  });

  test("FR-TOK-004 exception handling: two keys mapping to one property name fail and are both printed", () => {
    const tokens = [
      token("text.monoPayload", "semantic", { value: "#dce6f3" }),
      token("text.mono.payload", "semantic", { value: "#dce6f3" }),
    ];

    try {
      assertNoNameCollisions(tokens);
      throw new Error("expected the collision checker to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TokenBuildError);
      expect((error as TokenBuildError).code).toBe("TOK-NAME-COLLISION");
      expect((error as TokenBuildError).exitCode).toBe(2);
      const message = (error as TokenBuildError).format();
      expect(message).toContain("--cdt-text-mono-payload");
      expect(message).toContain("text.monoPayload");
      expect(message).toContain("text.mono.payload");
    }
  });
});
