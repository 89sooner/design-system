import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const manifest = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as {
  types?: string;
  files?: string[];
  sideEffects?: unknown;
  exports?: Record<string, unknown>;
};

const exportsMap = manifest.exports ?? {};

/** Every file path an exports entry can resolve to. */
const exportTargets = (entry: unknown): string[] => {
  if (typeof entry === "string") return [entry];
  if (entry && typeof entry === "object") return Object.values(entry).flatMap(exportTargets);
  return [];
};

const allTargets = [...new Set(Object.values(exportsMap).flatMap(exportTargets))];

describe("@conductor/css package contract", () => {
  test("FR-DX-002 AC-1: @conductor/css declares types entry", () => {
    expect(manifest.types).toBe("./types/index.d.ts");
    expect(exportsMap["."]).toMatchObject({ types: "./types/index.d.ts" });
  });

  test('FR-DX-003 AC-2: @conductor/css declares sideEffects: ["*.css"]', () => {
    expect(manifest.sideEffects).toEqual(["*.css"]);
  });

  test("FR-DX-003 AC-4: the reset-excluded ./component.css entry point is declared", () => {
    expect(exportsMap["./component.css"]).toMatchObject({ default: "./dist/component.css" });
  });

  test("FR-DX-003 AC-1: @conductor/css exposes only declared entry points", () => {
    // Asserted as rules, not as a snapshot of the key list: at WP-003 a snapshot
    // assertion failed for an entry point that was legitimately added.
    for (const required of [".", "./component.css", "./package.json"]) {
      expect(Object.keys(exportsMap)).toContain(required);
    }

    // no wildcard, and no reach past the public surface into src/
    expect(Object.keys(exportsMap)).not.toContain("./*");
    for (const target of allTargets) {
      expect(target).not.toMatch(/^\.\/src\//);
    }

    expect(exportsMap["."]).toMatchObject({ default: "./dist/index.css" });
  });

  test("FR-DX-003: every declared entry point resolves to a file that ships", () => {
    for (const target of allTargets) {
      const path = fileURLToPath(new URL(`../${target}`, import.meta.url));
      expect(existsSync(path), `${target} does not exist — run the css build`).toBe(true);

      if (target === "./package.json") continue;
      const shippedRoot = target.replace(/^\.\//, "").split("/")[0];
      expect(manifest.files).toContain(shippedRoot);
    }
  });
});
