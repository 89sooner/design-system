import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { blockClassName, CONSUMED_PACKAGES, PACKAGE_NAME } from "./index";

const packageRoot = existsSync("packages/react/package.json") ? "packages/react" : ".";

const manifest = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
) as {
  name: string;
  types?: string;
  sideEffects?: unknown;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

describe("@conductor-by-89soone/react package contract", () => {
  test("FR-DX-002 AC-1: @conductor-by-89soone/react declares types entry", () => {
    expect(manifest.types).toBe("./dist/index.d.ts");
    expect(manifest.exports?.["."]).toMatchObject({ types: "./dist/index.d.ts" });
  });

  test("FR-DX-003 AC-3: @conductor-by-89soone/react declares sideEffects: false", () => {
    expect(manifest.sideEffects).toBe(false);
  });

  test("FR-CMP-001: React 18/19 and lucide-react are declared as peer dependencies", () => {
    expect(manifest.peerDependencies).toMatchObject({
      react: "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0",
      "lucide-react": ">=0.400.0 <2",
    });
  });

  test("FR-DX-003 AC-1: @conductor-by-89soone/react exposes only declared entry points", () => {
    expect(Object.keys(manifest.exports ?? {})).toEqual([".", "./package.json"]);
  });

  test("FR-DX-001 AC-4: @conductor-by-89soone/react consumes @conductor-by-89soone/tokens as a workspace package", () => {
    expect(manifest.dependencies?.["@conductor-by-89soone/tokens"]).toBe("workspace:*");
    expect(CONSUMED_PACKAGES).toContain("@conductor-by-89soone/tokens");
  });

  test("FR-CMP-009 AC-2: @conductor-by-89soone/react has no routing-library dependency", () => {
    expect(Object.keys(manifest.dependencies ?? {}).filter((name) => /router|routing/i.test(name))).toEqual([]);
  });

  test("FR-DX-002 AC-1: the entry point exports the values its type declaration claims", () => {
    expect(PACKAGE_NAME).toBe(manifest.name);
    expect(blockClassName("btn")).toBe("cdt-btn");
  });

  test("FR-DX-002 AC-2: generated public declarations contain no any", () => {
    const declarations = readdirSync(join(packageRoot, "dist")).filter((file) => file.endsWith(".d.ts"));
    expect(declarations.length).toBeGreaterThan(0);
    for (const file of declarations) expect(readFileSync(join(packageRoot, "dist", file), "utf8")).not.toMatch(/\bany\b/);
  });

  test("FR-DX-002 AC-4: generated public declarations do not expose internal testing modules", () => {
    const declarations = readdirSync(join(packageRoot, "dist")).filter((file) => file.endsWith(".d.ts"));
    for (const file of declarations) expect(readFileSync(join(packageRoot, "dist", file), "utf8")).not.toContain("testing/");
  });

  test("FR-DX-004 AC-2: production source has no browser-global access", () => {
    const source = ["index.ts", "cx.ts", "types.ts", "shell.tsx", "testing/contract.tsx", "testing/public-components.ts", "testing/ssr.tsx"]
      .map((file) => readFileSync(join(packageRoot, "src", file), "utf8"))
      .join("\n");
    expect(source).not.toMatch(/\b(window|document|localStorage)\b/);
  });
});
