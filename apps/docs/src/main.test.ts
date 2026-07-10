import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { INSTALLED_PACKAGES, SHELL_CLASS_NAME } from "./main";

const manifest = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as {
  private?: boolean;
  types?: string;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
};

describe("docs package contract", () => {
  test("FR-DX-002 AC-1: docs declares types entry", () => {
    expect(manifest.types).toBe("./dist/main.d.ts");
    expect(manifest.exports?.["."]).toMatchObject({ types: "./dist/main.d.ts" });
  });

  test("FR-DOC-001 AC-1: docs installs the three packages as a consumer", () => {
    expect(manifest.private).toBe(true);
    expect(manifest.dependencies).toEqual({
      "@conductor/css": "workspace:*",
      "@conductor/react": "workspace:*",
      "@conductor/tokens": "workspace:*",
    });
    expect(INSTALLED_PACKAGES).toEqual([
      "@conductor/tokens",
      "@conductor/css",
      "@conductor/react",
    ]);
  });

  test("FR-DX-001 AC-4: docs resolves package entry points, not source paths", () => {
    expect(SHELL_CLASS_NAME).toBe("cdt-app-shell");
  });
});
