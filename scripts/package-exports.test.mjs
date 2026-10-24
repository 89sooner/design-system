/**
 * Every entry point and CLI the tokens and react packages declare resolves to a file the package ships, as
 * `packages/css/test/exports.test.ts` already proves for the stylesheet (CR-075 FR-DX-006 AC-2 ①, WP-041).
 * The names themselves are pinned by `etc/public-surface.txt`; this proves they are not empty promises.
 * Runs after `pnpm build`, like the css contract test.
 *
 * Refs: CR-075 FR-DX-006 FR-DX-003 WP-041
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

/** Every file path an exports entry can resolve to. */
const exportTargets = (entry) => {
  if (typeof entry === "string") return [entry];
  if (entry && typeof entry === "object") return Object.values(entry).flatMap(exportTargets);
  return [];
};

for (const pkg of ["tokens", "react"]) {
  const root = new URL(`../packages/${pkg}/`, import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
  const shipped = (target) => {
    const path = fileURLToPath(new URL(target, root));
    expect(existsSync(path), `${manifest.name}: ${target} does not exist — run the build`).toBe(true);
    if (target !== "./package.json") expect(manifest.files, `${manifest.name}: ${target} is outside "files"`).toContain(target.replace(/^\.\//, "").split("/")[0]);
  };

  describe(`${manifest.name} package contract`, () => {
    test("FR-DX-006 AC-2: every declared entry point resolves to a file that ships", () => {
      const targets = [...new Set(Object.values(manifest.exports ?? {}).flatMap(exportTargets))];
      expect(targets.length).toBeGreaterThan(0);
      for (const target of targets) shipped(target);
    });

    test("FR-DX-006 AC-2: every declared CLI resolves to a file that ships", () => {
      for (const target of Object.values(manifest.bin ?? {})) shipped(target);
    });
  });
}
