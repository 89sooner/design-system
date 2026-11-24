// FR-DX-006 AC-3 · CR-082: the development-build deprecation warning, and the rule that every
// `@deprecated` public API in this package calls it.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import { resetDeprecationWarnings, warnDeprecated } from "../deprecation";

afterEach(() => {
  resetDeprecationWarnings();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

interface SourceFile {
  readonly path: string;
  readonly text: string;
}

const DEPRECATED_TAG = /^\s*(?:\/\*\*|\*)\s*@deprecated\b/m;

/** Source files that mark something `@deprecated` without calling `warnDeprecated`. */
function unwarnedDeprecations(files: readonly SourceFile[]): readonly string[] {
  return files.filter((file) => DEPRECATED_TAG.test(file.text) && !file.text.includes("warnDeprecated(")).map((file) => file.path);
}

function packageSources(): readonly SourceFile[] {
  const root = existsSync("packages/react/src") ? "packages/react/src" : "src";
  return readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((path) => /\.tsx?$/.test(path) && !path.startsWith("testing") && !/\.test\.tsx?$/.test(path) && path !== "deprecation.ts")
    .map((path) => ({ path, text: readFileSync(join(root, path), "utf8") }));
}

describe("FR-DX-006 AC-3 deprecation warning", () => {
  test("warns once per API in development, naming the replacement", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warnDeprecated('Button prop "tone"', 'Use "variant".');
    warnDeprecated('Button prop "tone"', 'Use "variant".');
    warnDeprecated("useLegacyThing", "Use useThing.");
    expect(warn.mock.calls).toEqual([
      ['[conductor] Button prop "tone" is deprecated and will be removed in the next major version. Use "variant".'],
      ["[conductor] useLegacyThing is deprecated and will be removed in the next major version. Use useThing."],
    ]);
  });

  test("stays silent in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warnDeprecated("OldComponent", "Use NewComponent.");
    expect(warn).not.toHaveBeenCalled();
  });

  test("every @deprecated API in the package source calls warnDeprecated", () => {
    expect(unwarnedDeprecations(packageSources())).toEqual([]);
  });

  test("a @deprecated tag without the warning is reported by file; prose that mentions the word is not", () => {
    expect(
      unwarnedDeprecations([
        { path: "warned.tsx", text: '/** @deprecated Use NewThing. */\nexport function OldThing() { warnDeprecated("OldThing", "Use NewThing."); }' },
        { path: "silent.tsx", text: "export interface Props {\n  /**\n   * @deprecated Use `variant`.\n   */\n  readonly tone?: string;\n}" },
        { path: "prose.tsx", text: "// lucide marks its brand icons deprecated and removes them in v1.\nexport const x = 1;" },
      ]),
    ).toEqual(["silent.tsx"]);
  });

  test("the helper stays module-internal", () => {
    const root = existsSync("packages/react/src") ? "packages/react/src" : "src";
    expect(readFileSync(join(root, "index.ts"), "utf8")).not.toMatch(/deprecation/);
  });
});
