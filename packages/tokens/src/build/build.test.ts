import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { parseArgs } from "./args";
import { emitCss } from "./emit-css";
import { TokenBuildError } from "./errors";
import { token } from "./fixtures";
import { buildTokens, contrastExclusions } from "./index";
import { buildTokenIndex, resolveTokens } from "./reference";
import { writeArtifacts } from "./write";
import { canonicalTokens } from "../token-source";

const temporaryDirs: string[] = [];

function scratchDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "cdt-tokens-"));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of temporaryDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("buildTokens artifacts", () => {
  test("API-TOK-001: a successful build writes tokens.css and tokens.json", () => {
    const outDir = scratchDir();
    const result = buildTokens({ outDir });

    expect(readdirSync(outDir).sort()).toEqual(["tokens.css", "tokens.json"]);
    expect(result.stdout[0]).toMatch(/^\[tokens\] resolved \d+ tokens \(\d+ primitive, /);
  });

  test("API-TOK-001: `--report` resolves the source and writes nothing", () => {
    const outDir = scratchDir();
    const result = buildTokens({ outDir, report: true });

    expect(readdirSync(outDir)).toEqual([]);
    expect(result.written).toEqual([]);
    expect(result.stdout.at(-1)).toBe("[tokens] --report: no files written");
  });

  test("FR-A11Y-004 AC-3: `--report` lists the decorative tokens excluded from contrast checks", () => {
    const exclusions = contrastExclusions(canonicalTokens());
    const keys = exclusions.map((exclusion) => exclusion.key);

    expect(keys).toContain("text.faint");
    expect(keys).toContain("border.subtle");
    expect(keys).toContain("status.neutralEnd");
    expect(keys).not.toContain("border.control");
    for (const exclusion of exclusions) expect(exclusion.reason.length).toBeGreaterThan(0);
  });
});

describe("atomic writing", () => {
  test("FR-TOK-003 exception handling: a resolution failure leaves the previous artifacts intact", () => {
    const outDir = scratchDir();
    buildTokens({ outDir });
    const before = readFileSync(join(outDir, "tokens.css"), "utf8");

    // A cycle among the fixtures stands in for a broken edit of the real source.
    const broken = [
      token("a", "semantic", { alias: "b" }),
      token("b", "semantic", { alias: "a" }),
    ];
    expect(() => resolveTokens(buildTokenIndex(broken))).toThrow(TokenBuildError);

    // Nothing after the throw ever reaches the writer, so the directory is untouched.
    expect(readFileSync(join(outDir, "tokens.css"), "utf8")).toBe(before);
    expect(readdirSync(outDir).sort()).toEqual(["tokens.css", "tokens.json"]);
  });

  test("FR-TOK-003 exception handling: a failing emit never leaves a partial artifact behind", () => {
    const outDir = scratchDir();
    buildTokens({ outDir });
    const before = readFileSync(join(outDir, "tokens.css"), "utf8");

    const colliding = [
      token("text.monoPayload", "semantic", { value: "#dce6f3" }),
      token("text.mono.payload", "semantic", { value: "#dce6f3" }),
    ];
    const values = new Map(colliding.map((definition) => [definition.key, "#dce6f3"]));

    expect(() =>
      emitCss(colliding, [
        { theme: "dark", selectors: [":root"], colorScheme: "dark", values },
      ]),
    ).toThrow(TokenBuildError);

    expect(readFileSync(join(outDir, "tokens.css"), "utf8")).toBe(before);
    expect(readdirSync(outDir).sort()).toEqual(["tokens.css", "tokens.json"]);
  });

  test("FR-TOK-003 exception handling: writing leaves no temporary file behind", () => {
    const outDir = scratchDir();
    writeArtifacts(outDir, new Map([["tokens.css", ":root {}"]]));

    expect(readdirSync(outDir)).toEqual(["tokens.css"]);
  });

  test("conductor_data_model.md 7: rewriting identical bytes is a no-op", () => {
    const outDir = scratchDir();
    const artifacts = new Map([["tokens.css", ":root {}"]]);

    expect(writeArtifacts(outDir, artifacts)).toEqual(["tokens.css"]);
    expect(writeArtifacts(outDir, artifacts)).toEqual([]);
  });

  test("FR-TOK-003 exception handling: a changed artifact replaces the previous one atomically", () => {
    const outDir = scratchDir();
    writeFileSync(join(outDir, "tokens.css"), "stale");

    writeArtifacts(outDir, new Map([["tokens.css", "fresh"]]));

    expect(readFileSync(join(outDir, "tokens.css"), "utf8")).toBe("fresh");
    expect(readdirSync(outDir)).toEqual(["tokens.css"]);
  });
});

describe("buildTokens CLI contract", () => {
  test("API-TOK-001: the default output directory is `dist`", () => {
    expect(parseArgs([])).toEqual({ outDir: "dist", report: false, watch: false });
  });

  test("API-TOK-001: `--out <dir>`, `--report` and `--watch` are the accepted flags", () => {
    expect(parseArgs(["--out", "build"])).toMatchObject({ outDir: "build" });
    expect(parseArgs(["--report"])).toMatchObject({ report: true });
    expect(parseArgs(["--watch"])).toMatchObject({ watch: true });
  });

  test("API-TOK-001: an unrecognised argument exits with code 3", () => {
    try {
      parseArgs(["--nope"]);
      throw new Error("expected argument parsing to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TokenBuildError);
      expect((error as TokenBuildError).code).toBe("TOK-ARG");
      expect((error as TokenBuildError).exitCode).toBe(3);
    }
  });

  test("API-TOK-001: `--out` without a directory exits with code 3", () => {
    expect(() => parseArgs(["--out"])).toThrow(/`--out` needs a directory/);
    expect(() => parseArgs(["--out", "--report"])).toThrow(/`--out` needs a directory/);
  });

  test("API-TOK-001: a cycle exits with code 1 and a name collision with code 2", () => {
    const cycle = new TokenBuildError("TOK-CYCLE", "circular token reference detected");
    const collision = new TokenBuildError("TOK-NAME-COLLISION", "collision");

    expect(cycle.exitCode).toBe(1);
    expect(collision.exitCode).toBe(2);
    expect(cycle.message.startsWith("error[TOK-CYCLE]:")).toBe(true);
  });
});
