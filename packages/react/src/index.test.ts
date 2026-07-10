import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { blockClassName, CONSUMED_PACKAGES, PACKAGE_NAME } from "./index";

const manifest = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as {
  name: string;
  types?: string;
  sideEffects?: unknown;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
};

describe("@conductor/react package contract", () => {
  test("FR-DX-002 AC-1: @conductor/react declares types entry", () => {
    expect(manifest.types).toBe("./dist/index.d.ts");
    expect(manifest.exports?.["."]).toMatchObject({ types: "./dist/index.d.ts" });
  });

  test("FR-DX-003 AC-3: @conductor/react declares sideEffects: false", () => {
    expect(manifest.sideEffects).toBe(false);
  });

  test("FR-DX-003 AC-1: @conductor/react exposes only declared entry points", () => {
    expect(Object.keys(manifest.exports ?? {})).toEqual([".", "./package.json"]);
  });

  test("FR-DX-001 AC-4: @conductor/react consumes @conductor/tokens as a workspace package", () => {
    expect(manifest.dependencies?.["@conductor/tokens"]).toBe("workspace:*");
    expect(CONSUMED_PACKAGES).toContain("@conductor/tokens");
  });

  test("FR-DX-002 AC-1: the entry point exports the values its type declaration claims", () => {
    expect(PACKAGE_NAME).toBe(manifest.name);
    expect(blockClassName("btn")).toBe("cdt-btn");
  });
});
