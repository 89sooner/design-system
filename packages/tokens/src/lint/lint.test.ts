import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, test } from "vitest";
import { TokenBuildError } from "../build/errors";
import { assertNoViolations, formatAllowances, formatViolation, lintTokens } from "./index";
import { lintSource } from "./rules";
import type { Violation } from "./rules";

/**
 * `packages/css` and `packages/react` hold almost nothing until WP-008, so the rules are driven
 * from fixtures: each test builds the two directories the linter will one day scan inside its own
 * temporary root, and points `lintTokens` at them exactly as the root `lint:tokens` script does.
 * A root per test keeps the file counts independent of execution order.
 */
const roots: string[] = [];

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

function fixtureRoot(files: Readonly<Record<string, string>>): string {
  const root = mkdtempSync(join(tmpdir(), "cdt-lint-"));
  roots.push(root);
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolute = join(root, relativePath);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, contents, "utf8");
  }
  return root;
}

function at(violations: readonly Violation[], index: number): Violation {
  const violation = violations[index];
  if (violation === undefined) throw new Error(`no violation at index ${index}`);
  return violation;
}

function thrownBy(action: () => unknown): TokenBuildError {
  try {
    action();
  } catch (error) {
    if (error instanceof TokenBuildError) return error;
    throw error;
  }
  throw new Error("expected the call to throw a TokenBuildError");
}

describe("FR-TOK-001: hardcoded values outside the token source", () => {
  test("FR-TOK-001 AC-1, AC-3: a colour literal fails with its file path and line number", () => {
    const root = fixtureRoot({
      "packages/css/src/violation.css": [
        ".cdt-btn {",
        "  color: #ff0000;",
        "  background: rgba(1, 2, 3, 0.5);",
        "}",
      ].join("\n"),
      "packages/react/src/violation.ts": 'export const brand = "hsl(210, 40%, 96%)";',
    });

    const result = lintTokens(["packages/css", "packages/react"], root);
    const colors = result.violations.filter((violation) => violation.rule === "color-literal");
    expect(colors).toHaveLength(3);

    expect(formatViolation(at(colors, 0))).toBe(
      "packages/css/src/violation.css:2:10  color-literal  colour literal `#ff0000`",
    );
    expect(at(colors, 1)).toMatchObject({ file: "packages/css/src/violation.css", line: 3, column: 15 });
    expect(at(colors, 2)).toMatchObject({ file: "packages/react/src/violation.ts", line: 1, column: 23 });

    const error = thrownBy(() => assertNoViolations(result));
    expect(error.code).toBe("TOK-LITERAL");
    expect(error.exitCode).toBe(1);
    expect(error.format()).toContain("packages/css/src/violation.css:2:10");
    expect(error.format()).toContain("cdt-allow-literal");
  });

  test("FR-TOK-001 AC-2: literal px and ms values are detected", () => {
    const violations = lintSource(
      "packages/css/src/spacing.css",
      [
        ".cdt-card {",
        "  padding: 16px;",
        "  transition: opacity 140ms ease;",
        "  transform: translateY(-2px);",
        "}",
      ].join("\n"),
    );

    expect(violations.map((violation) => [violation.rule, violation.line, violation.snippet])).toEqual([
      ["px-literal", 2, "16px"],
      ["ms-literal", 3, "140ms"],
      ["px-literal", 4, "2px"],
    ]);
  });

  test("FR-TOK-008 AC-2: a numeric z-index is detected in CSS and in TS", () => {
    const css = lintSource("packages/css/src/overlay.css", ".cdt-dialog { z-index: 40; }");
    const ts = lintSource("packages/react/src/Dialog.ts", "export const style = { zIndex: 40 };");

    expect(at(css, 0)).toMatchObject({ rule: "z-index-literal", line: 1 });
    expect(at(ts, 0)).toMatchObject({ rule: "z-index-literal", line: 1 });
    expect(at(css, 0).message).toContain("FR-TOK-008 AC-2");
  });

  test("FR-TOK-001 AC-2: a px font-size is reported once, as font-size-px rather than px-literal", () => {
    const violations = lintSource("packages/css/src/type.css", ".cdt-badge { font-size: 12px; }");
    expect(violations).toHaveLength(1);
    expect(at(violations, 0)).toMatchObject({ rule: "font-size-px", snippet: "font-size: 12px" });
  });

  test("FR-TOK-001 AC-2: a breakpoint literal inside a @media condition is the documented exclusion", () => {
    const violations = lintSource(
      "packages/css/src/layout.css",
      ["@media (max-width: 799px) {", "  .cdt-split-layout { grid-template-columns: 1fr; }", "}"].join("\n"),
    );
    expect(violations).toEqual([]);
  });

  test("FR-TOK-001: a colour or size quoted inside a comment is prose, not a violation", () => {
    const violations = lintSource(
      "packages/react/src/notes.ts",
      [
        "/* accent is #6d7cff and the ring is 3px */",
        "// padding was 16px before the token",
        "export const ok = 1;",
      ].join("\n"),
    );
    expect(violations).toEqual([]);
  });

  test("FR-TOK-001: a `//` inside a string is not a comment", () => {
    const violations = lintSource("packages/react/src/url.ts", 'export const docs = "https://example.test/#ff0000";');
    expect(violations.map((violation) => violation.rule)).toEqual(["color-literal"]);
  });
});

describe("FR-TOK-001 exception handling: the allow-list", () => {
  test("FR-TOK-001: a file-scoped allow comment passes the lint and appears in --report", () => {
    const root = fixtureRoot({
      "packages/css/src/allowed.css": [
        "/* cdt-allow-literal: the print stylesheet is outside the token system */",
        "@media print {",
        "  .cdt-page { color: #000000; }",
        "}",
      ].join("\n"),
    });

    const result = lintTokens(["packages/css"], root);
    expect(result.violations).toEqual([]);
    expect(result.allowances).toEqual([
      {
        file: "packages/css/src/allowed.css",
        line: 1,
        scope: "file",
        reason: "the print stylesheet is outside the token system",
      },
    ]);
    expect(formatAllowances(result.allowances)).toEqual([
      "[lint:tokens] 1 allowance(s)",
      "  packages/css/src/allowed.css:1  scope=file  reason: the print stylesheet is outside the token system",
    ]);
  });

  test("FR-TOK-001: a line-scoped allow comment exempts only the line beneath it", () => {
    const root = fixtureRoot({
      "packages/react/src/mixed.ts": [
        "export const a = 1;",
        "// cdt-allow-literal: matches the OS scrollbar, not a Conductor surface",
        'export const thumb = "#94a3b8";',
        'export const rogue = "#ff0000";',
      ].join("\n"),
    });

    const result = lintTokens(["packages/react"], root);
    expect(result.violations).toHaveLength(1);
    expect(at(result.violations, 0)).toMatchObject({ line: 4, snippet: "#ff0000" });
    expect(result.allowances[0]).toMatchObject({ line: 2, scope: "line" });
  });

  test("FR-TOK-001: an allowance with no reason still reports, so it cannot hide", () => {
    const root = fixtureRoot({ "packages/css/src/bare.css": "/* cdt-allow-literal: */\n.x { color: #fff; }" });
    const result = lintTokens(["packages/css"], root);
    expect(result.allowances[0]?.reason).toBe("(no reason given)");
  });
});

describe("FR-THM-005 AC-3: text.faint may not be used on surface.elevated", () => {
  test("FR-THM-005 AC-3: faint text on an elevated background fails the lint", () => {
    const violations = lintSource(
      "packages/css/src/panel.css",
      [
        ".cdt-panel__meta {",
        "  background: var(--cdt-surface-elevated);",
        "  color: var(--cdt-text-faint);",
        "}",
      ].join("\n"),
    );

    expect(violations).toHaveLength(1);
    expect(at(violations, 0)).toMatchObject({ rule: "text-faint-on-elevated", line: 3 });
    expect(at(violations, 0).message).toContain("2.94:1");
    expect(at(violations, 0).message).toContain("FR-THM-005 AC-3");
  });

  test("FR-THM-005 AC-3: the rule fires on a React inline style object too", () => {
    const violations = lintSource(
      "packages/react/src/Meta.tsx",
      'const style = { background: "var(--cdt-surface-elevated)", color: "var(--cdt-text-faint)" };',
    );
    expect(violations.map((violation) => violation.rule)).toContain("text-faint-on-elevated");
  });

  test("FR-THM-005 AC-3: faint text on surface.base is allowed — 3.74:1, meta text only", () => {
    const violations = lintSource(
      "packages/css/src/meta.css",
      [".cdt-meta {", "  background: var(--cdt-surface-base);", "  color: var(--cdt-text-faint);", "}"].join("\n"),
    );
    expect(violations).toEqual([]);
  });

  test("FR-THM-005 AC-3: an elevated background under non-faint text is allowed", () => {
    const violations = lintSource(
      "packages/css/src/card.css",
      [".cdt-card {", "  background: var(--cdt-surface-elevated);", "  color: var(--cdt-text-primary);", "}"].join("\n"),
    );
    expect(violations).toEqual([]);
  });

  test("FR-THM-005 AC-3: the rule sees one declaration block, so separate blocks do not trip it", () => {
    const violations = lintSource(
      "packages/css/src/split.css",
      [".cdt-card { background: var(--cdt-surface-elevated); }", ".cdt-meta { color: var(--cdt-text-faint); }"].join("\n"),
    );
    expect(violations).toEqual([]);
  });
});

describe("the lint CLI's file selection", () => {
  test("FR-TOK-001 AC-1: only CSS and TS files are scanned, and build output is skipped", () => {
    const root = fixtureRoot({
      "packages/css/src/index.css": "@layer cdt.reset;",
      "packages/css/build.mjs": 'const red = "#ff0000";',
      "packages/css/dist/index.css": ".x { color: #ff0000; }",
      "packages/css/node_modules/dep/index.css": ".y { color: #ff0000; }",
    });

    const result = lintTokens(["packages/css"], root);
    expect(result.files).toEqual(["packages/css/src/index.css"]);
    expect(result.violations).toEqual([]);
  });

  test("FR-TOK-001 AC-3: a target that does not exist is an argument error, not an empty pass", () => {
    const root = fixtureRoot({});
    const error = thrownBy(() => lintTokens(["packages/nope"], root));
    expect(error.code).toBe("TOK-ARG");
    expect(error.exitCode).toBe(3);
  });

  test("FR-TOK-001: the real packages/css and packages/react are clean", () => {
    const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));
    const result = lintTokens(["packages/css", "packages/react"], repositoryRoot);
    expect(result.files.length).toBeGreaterThan(0);
    expect(result.violations.map(formatViolation)).toEqual([]);
  });
});
