import { describe, expect, test } from "vitest";
import { canonicalTokens } from "../token-source";
import { buildTokens } from "./index";
import type { ThemeEmit } from "./emit-css";
import { emitCss } from "./emit-css";
import { token } from "./fixtures";
import { buildTokenIndex, resolveTokens } from "./reference";

/** Every custom property declaration in a stylesheet, as `[name, value]`. */
function declarations(css: string): [string, string][] {
  return [...css.matchAll(/^\s*(--[\w-]+):\s*(.+);$/gm)].map((match) => [
    match[1] as string,
    match[2] as string,
  ]);
}

const built = buildTokens({ outDir: "unused", report: true });
const css = built.css;

describe("CSS emission from the real token source", () => {
  test("FR-TOK-004 AC-1: every custom property in the emitted tokens.css starts with `--cdt-`", () => {
    const names = declarations(css).map(([name]) => name);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith("--cdt-"))).toEqual([]);
  });

  test("FR-TOK-004 AC-2: `surface.raised` is emitted as `--cdt-surface-raised`", () => {
    expect(css).toContain("--cdt-surface-raised: #141d2a;");
  });

  test("FR-TOK-004 AC-4: no primitive token is emitted to CSS", () => {
    const names = new Set(declarations(css).map(([name]) => name));
    const primitiveNames = ["--cdt-ink-900", "--cdt-indigo-500", "--cdt-slate-400", "--cdt-scale-4"];

    for (const name of primitiveNames) expect(names.has(name)).toBe(false);
  });

  test("FR-TOK-003 AC-1: `--cdt-surface-2` resolves to the same literal as `--cdt-surface-subtle`", () => {
    const byName = new Map(declarations(css));

    expect(byName.get("--cdt-surface-2")).toBe("#101722");
    expect(byName.get("--cdt-surface-2")).toBe(byName.get("--cdt-surface-subtle"));
  });

  test("FR-THM-001 AC-2: `--cdt-border` resolves to the same literal as `--cdt-border-default`", () => {
    const byName = new Map(declarations(css));

    expect(byName.get("--cdt-border")).toBe("rgba(148, 163, 184, 0.18)");
    expect(byName.get("--cdt-border")).toBe(byName.get("--cdt-border-default"));
  });

  test("FR-TOK-003 AC-1: no `var()` chain survives into the emitted stylesheet", () => {
    const values = declarations(css).map(([, value]) => value);
    expect(values.filter((value) => value.includes("var("))).toEqual([]);
  });

  test("FR-TOK-003 AC-1: `elevation.overlay` inlines the `{border.strong}` reference it embeds", () => {
    expect(css).toContain(
      "--cdt-elevation-overlay: 0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(148, 163, 184, 0.3);",
    );
  });

  test("FR-THM-001 AC-4: the dark block declares `color-scheme: dark`", () => {
    expect(css).toContain("color-scheme: dark;");
  });

  test("FR-THM-003 AC-3: the dark block also matches `:root`, so an absent or bad theme attribute lands on dark", () => {
    expect(css).toContain(':root,\n[data-cdt-theme="dark"] {');
  });

  test("FR-TOK-004: the emitted declaration count equals the semantic plus component token count", () => {
    const emitted = canonicalTokens().filter((definition) => definition.tier !== "primitive");
    expect(declarations(css)).toHaveLength(emitted.length);
  });
});

describe("CSS emission theme blocks", () => {
  test("FR-THM-002 AC-1: the emitter takes a list of themes, so a second palette adds a block", () => {
    const tokens = [token("surface.base", "semantic", { value: "#080b12" })];
    const darkValues = resolveTokens(buildTokenIndex(tokens)).values;
    const lightValues = new Map([["surface.base", "#e8ecf2"]]);

    const themes: ThemeEmit[] = [
      { theme: "dark", selectors: [":root"], colorScheme: "dark", values: darkValues },
      {
        theme: "light",
        selectors: ['[data-cdt-theme="light"]'],
        colorScheme: "light",
        values: lightValues,
      },
    ];

    const emitted = emitCss(tokens, themes);

    expect(emitted).toContain("color-scheme: dark;");
    expect(emitted).toContain("color-scheme: light;");
    expect(emitted).toContain("--cdt-surface-base: #080b12;");
    expect(emitted).toContain("--cdt-surface-base: #e8ecf2;");
  });
});
