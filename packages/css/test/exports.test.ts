import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const manifest = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as {
  types?: string;
  sideEffects?: unknown;
  exports?: Record<string, unknown>;
};

const stylesheetSource = readFileSync(
  fileURLToPath(new URL("../src/index.css", import.meta.url)),
  "utf8",
);

describe("@conductor/css package contract", () => {
  test("FR-DX-002 AC-1: @conductor/css declares types entry", () => {
    expect(manifest.types).toBe("./types/index.d.ts");
    expect(manifest.exports?.["."]).toMatchObject({ types: "./types/index.d.ts" });
  });

  test("FR-DX-003 AC-2: @conductor/css declares sideEffects: [\"*.css\"]", () => {
    expect(manifest.sideEffects).toEqual(["*.css"]);
  });

  test("FR-DX-003 AC-1: @conductor/css exposes only declared entry points", () => {
    expect(Object.keys(manifest.exports ?? {})).toEqual([".", "./package.json"]);
    expect(manifest.exports?.["."]).toMatchObject({ default: "./dist/index.css" });
  });

  test("FR-CSS-001 AC-4: the stylesheet fixes the cascade layer order up front", () => {
    expect(stylesheetSource).toContain(
      "@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;",
    );
  });

  test("FR-CSS-001: the stylesheet source contains no !important", () => {
    expect(stylesheetSource).not.toContain("!important");
  });
});
