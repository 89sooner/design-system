import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { breakpoints } from "../breakpoints";
import { tokens } from "../tokens";
import { canonicalTokens } from "../token-source";
import { buildTokenJson } from "./emit-json";
import { emitBreakpointsModule, emitTokensModule } from "./emit-ts";
import { buildTokens } from "./index";

const built = buildTokens({ outDir: "unused", report: true });
const source = canonicalTokens();

const distPath = (name: string): string =>
  fileURLToPath(new URL(`../../dist/${name}`, import.meta.url));

describe("TypeScript token artifact", () => {
  test("FR-TOK-006 AC-1: `tokens.surface.raised` is inferred as its own string literal type", () => {
    // The annotation is the assertion: a widened `string` would not be assignable.
    const raised: "var(--cdt-surface-raised)" = tokens.surface.raised;
    expect(raised).toBe("var(--cdt-surface-raised)");
  });

  test("FR-TOK-006 AC-2: `tokens.surface.nonexistent` is a TypeScript compile error", () => {
    // @ts-expect-error FR-TOK-006 AC-2: an unknown token key must not typecheck.
    const missing = tokens.surface.nonexistent;
    expect(missing).toBeUndefined();
  });

  test("FR-TOK-006 AC-1: a key that is both a leaf and a parent reads as `DEFAULT` (tokens spec 3.2)", () => {
    expect(tokens.accent.DEFAULT).toBe("var(--cdt-accent)");
    expect(tokens.accent.strong).toBe("var(--cdt-accent-strong)");
    expect(tokens.border.DEFAULT).toBe("var(--cdt-border)");
  });

  test("FR-TOK-006 AC-1: numeric key segments stay reachable via index access", () => {
    expect(tokens.surface["2"]).toBe("var(--cdt-surface-2)");
    expect(tokens.font.size["2xs"]).toBe("var(--cdt-font-size-2xs)");
  });

  test("FR-TOK-002 AC-5: no primitive token appears in the generated module", () => {
    const module = emitTokensModule(source);

    expect(module).not.toMatch(/^  ink:/m);
    expect(module).not.toMatch(/^  indigo:/m);
    expect(module).not.toContain("--cdt-ink-900");
  });

  test("FR-TOK-006 AC-4: the generated token module declares no `any`", () => {
    expect(/\bany\b/.test(built.tokensModule)).toBe(false);
    expect(/\bany\b/.test(built.breakpointsModule)).toBe(false);
  });

  test("FR-TOK-006 AC-4, FR-DX-002 AC-2: the emitted .d.ts files declare no `any`", () => {
    for (const name of ["index.d.ts", "tokens.d.ts", "breakpoints.d.ts"]) {
      const path = distPath(name);
      // `pnpm build` runs before `pnpm test` in CI; skip rather than fail on a bare checkout.
      if (!existsSync(path)) continue;
      expect(/\bany\b/.test(readFileSync(path, "utf8"))).toBe(false);
    }
  });

  test("FR-TOK-001, CR-009: the generated token modules on disk match what the build re-emits", () => {
    // These modules are gitignored build output, not source. The token source is the only input,
    // so a rebuild must reproduce them byte for byte.
    const onDisk = (name: string): string =>
      readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), "utf8");

    expect(onDisk("tokens.ts")).toBe(built.tokensModule);
    expect(onDisk("breakpoints.ts")).toBe(built.breakpointsModule);
  });
});

describe("JSON token artifact", () => {
  const json = buildTokenJson(source, [
    {
      theme: "dark",
      selectors: [":root"],
      colorScheme: "dark",
      values: new Map(source.map((definition) => [definition.key, definition.key])),
    },
  ]);
  const byKey = new Map(json.tokens.map((entry) => [entry.key, entry]));

  test("FR-TOK-006 AC-3: every entry carries key, value, tier and usage metadata", () => {
    for (const entry of json.tokens) {
      expect(entry.key).toBeTruthy();
      expect(entry.tier).toBeTruthy();
      expect(entry.usage).toBeTruthy();
      expect(entry.values.dark).toBeTruthy();
    }
  });

  test("FR-TOK-006 AC-3, FR-DOC-002 AC-3: entries carry a description and their CSS name", () => {
    const raised = byKey.get("surface.raised");

    expect(raised?.tier).toBe("semantic");
    expect(raised?.usage).toBe("decorative");
    expect(raised?.cssName).toBe("--cdt-surface-raised");
    expect(raised?.description.length).toBeGreaterThan(0);
  });

  test("FR-TOK-005 AC-5: status and severity entries carry their icon metadata", () => {
    expect(byKey.get("status.running")?.icon).toBe("loader");
    expect(byKey.get("severity.blocked")?.icon).toBe("shield-x");
  });

  test("FR-TOK-002 AC-5: no primitive token appears in tokens.json", () => {
    expect(json.tokens.filter((entry) => entry.tier === "primitive")).toEqual([]);
    expect(byKey.has("ink.900")).toBe(false);
  });

  test("conductor_data_model.md 7: the artifact holds no timestamp, so a rebuild is byte-identical", () => {
    const first = buildTokens({ outDir: "unused", report: true });
    const second = buildTokens({ outDir: "unused", report: true });

    expect(first.json).toBe(second.json);
    expect(first.css).toBe(second.css);
  });
});

describe("breakpoints artifact", () => {
  test("FR-TOK-009 AC-3: `@conductor/tokens` exports a `breakpoints` object of literal pixels", () => {
    expect(breakpoints).toEqual({ sm: 560, md: 800, lg: 1080 });
  });

  test("FR-TOK-009 AC-3: the generated module const-asserts the numbers", () => {
    const module = emitBreakpointsModule();

    expect(module).toContain("sm: 560,");
    expect(module).toContain("} as const;");
  });
});
