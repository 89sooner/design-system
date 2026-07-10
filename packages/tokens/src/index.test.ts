import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { CDT_PREFIX, PACKAGE_NAME } from "./index";

const packageRoot = new URL("../", import.meta.url);

const manifest = JSON.parse(
  readFileSync(fileURLToPath(new URL("package.json", packageRoot)), "utf8"),
) as {
  name: string;
  types?: string;
  sideEffects?: unknown;
  bin?: Record<string, string>;
  exports?: Record<string, unknown>;
};

const exportsMap = manifest.exports ?? {};

/** Every filesystem target an `exports` entry resolves to, whether a string or a conditions object. */
function exportTargets(entry: unknown): string[] {
  if (typeof entry === "string") return [entry];
  if (entry !== null && typeof entry === "object") {
    return Object.values(entry as Record<string, unknown>).flatMap(exportTargets);
  }
  return [];
}

const allTargets = Object.values(exportsMap).flatMap(exportTargets);

describe("@conductor/tokens package contract", () => {
  test("FR-DX-002 AC-1: @conductor/tokens declares types entry", () => {
    expect(manifest.types).toBe("./dist/index.d.ts");
    expect(exportsMap["."]).toMatchObject({ types: "./dist/index.d.ts" });
  });

  /**
   * A rule, not a snapshot. WP-003 and WP-004 legitimately widened this map, and a list-equality
   * assertion fails every time a new artifact earns an entry point. What has to hold is that the
   * required subpaths are present, not that no others are.
   */
  test.each([".", "./package.json", "./tokens.css", "./tokens.json", "./breakpoints"])(
    "FR-DX-003 AC-1: `%s` is a declared entry point",
    (subpath) => {
      expect(Object.keys(exportsMap)).toContain(subpath);
    },
  );

  test("FR-DX-001 AC-4: no entry point resolves into the source tree", () => {
    expect(allTargets.filter((target) => target.includes("/src/"))).toEqual([]);
  });

  test("FR-DX-001 AC-4: every entry point resolves to a file the build actually produced", () => {
    for (const target of allTargets) {
      const path = fileURLToPath(new URL(target, packageRoot));
      expect(existsSync(path), `${target} does not exist`).toBe(true);
    }
  });

  test("FR-DX-001 AC-4, FR-CSS-002: `./tokens.css` exposes the stylesheet @conductor/css bundles", () => {
    expect(exportsMap["./tokens.css"]).toBe("./dist/tokens.css");
  });

  test("FR-TOK-006 AC-3: `./tokens.json` is a declared entry point for the documentation site", () => {
    expect(exportsMap["./tokens.json"]).toBe("./dist/tokens.json");
  });

  test("FR-TOK-009 AC-3: `./breakpoints` is a declared entry point with its own types", () => {
    expect(exportsMap["./breakpoints"]).toMatchObject({
      types: "./dist/breakpoints.d.ts",
      import: "./dist/breakpoints.js",
    });
  });

  test("API-TOK-001: the package publishes the `conductor-build-tokens` bin", () => {
    expect(manifest.bin?.["conductor-build-tokens"]).toBe("./bin/conductor-build-tokens.mjs");
  });

  test("API-TOK-003: the package publishes the `conductor-check-contrast` bin", () => {
    expect(manifest.bin?.["conductor-check-contrast"]).toBe("./bin/conductor-check-contrast.mjs");
  });

  test("FR-TOK-001 AC-3: the package publishes the `conductor-lint-tokens` bin", () => {
    expect(manifest.bin?.["conductor-lint-tokens"]).toBe("./bin/conductor-lint-tokens.mjs");
  });

  /**
   * `checkContrast` runs inside `pnpm --filter @conductor/tokens build`, after the token build and
   * before the bundling pass. FR-THM-004 phrases the check as something that happens once the
   * token build completes, and the entry point above must resolve to a file the build produced —
   * an exported subpath that only `pnpm check:contrast` creates would 404 in a published package.
   * `pnpm check:contrast` re-runs the same binary as the standalone CI gate (JOB-CI-001).
   */
  test("FR-DOC-004: `./contrast-report.json` is a declared entry point for W-030", () => {
    expect(exportsMap["./contrast-report.json"]).toBe("./dist/contrast-report.json");
  });

  /**
   * `["*.css"]`, not `false`, because this package now exports a stylesheet. Under
   * `sideEffects: false` a bundler is entitled to drop `import "@conductor/tokens/tokens.css"`
   * as dead code, since the import binds no value. The array form marks only the CSS as
   * side-effectful and leaves `tokens.js` and `breakpoints.js` tree-shakeable — the same
   * reasoning FR-DX-003 AC-2 applies to `@conductor/css`. (`package.json` admits no comments,
   * so the rationale lives at the assertion that enforces it.)
   */
  test("FR-DX-003 AC-2: sideEffects marks the stylesheet so a bundler cannot drop the CSS import", () => {
    expect(manifest.sideEffects).toEqual(["*.css"]);
  });

  test("FR-DX-003 AC-3: the JavaScript entry points stay tree-shakeable", () => {
    const sideEffects = manifest.sideEffects as string[];
    expect(sideEffects.some((pattern) => pattern.endsWith(".js"))).toBe(false);
  });

  test("FR-DX-002 AC-1: the entry point exports the values its type declaration claims", () => {
    expect(PACKAGE_NAME).toBe(manifest.name);
    expect(CDT_PREFIX).toBe("cdt-");
  });
});
