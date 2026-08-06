/**
 * `lintTokens` — the engine behind `pnpm lint:tokens` (FR-TOK-001, FR-TOK-008 AC-2,
 * FR-THM-005 AC-3).
 *
 * The rules live in `@conductor-by-89soone/tokens` because the token source is what defines what a legal
 * value is: the `--cdt-` naming, the `usage` classification and the `text.faint` restriction all
 * come from here. The *targets* do not. They arrive as command-line paths, so this package never
 * names `packages/css` or `packages/react` and the dependency direction
 * tokens → css → react (FR-DX-001 AC-1) stays intact. The root `lint:tokens` script supplies them.
 *
 * Refs: WP-006 FR-TOK-001 FR-QA-001
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { TokenBuildError } from "../build/errors";
import { lintSource } from "./rules";
import type { Violation } from "./rules";
import { findAllowances, isAllowed } from "./source";
import type { Allowance } from "./source";

export type { Allowance, AllowanceScope } from "./source";
export type { RuleId, Violation } from "./rules";

/** FR-TOK-001 AC-1 scopes the rules to "CSS and TS files". */
const LINTED_EXTENSIONS = [".css", ".ts", ".tsx", ".mts", ".cts"];
// `generated` holds build output (the docs app's contrast report is a copy of measured token
// values). Linting it would report the token source back to itself as a hardcoded literal.
const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist", "dist-server", "coverage", "generated", ".git"]);

export interface LintResult {
  readonly files: readonly string[];
  readonly violations: readonly Violation[];
  readonly allowances: readonly Allowance[];
}

function isLintable(path: string): boolean {
  return LINTED_EXTENSIONS.some((extension) => path.endsWith(extension));
}

function walk(directory: string, found: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((one, other) =>
    one.name.localeCompare(other.name),
  )) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) walk(path, found);
    } else if (entry.isFile() && isLintable(path)) {
      found.push(path);
    }
  }
}

/** @param targets files or directories, as given on the command line. */
export function collectFiles(targets: readonly string[], root = process.cwd()): string[] {
  const found: string[] = [];

  for (const target of targets) {
    const absolute = join(root, target);
    let stats;
    try {
      stats = statSync(absolute);
    } catch {
      throw new TokenBuildError("TOK-ARG", `lint target \`${target}\` does not exist`, [
        `resolved to: ${absolute}`,
        "hint: pass a path relative to the repository root.",
      ]);
    }
    if (stats.isDirectory()) walk(absolute, found);
    else if (isLintable(absolute)) found.push(absolute);
  }

  return found.map((path) => relative(root, path).split(sep).join("/")).sort();
}

export function lintTokens(targets: readonly string[], root = process.cwd()): LintResult {
  const files = collectFiles(targets, root);
  const violations: Violation[] = [];
  const allowances: Allowance[] = [];

  for (const file of files) {
    const text = readFileSync(join(root, file), "utf8");
    const fileAllowances = findAllowances(file, text);
    allowances.push(...fileAllowances);
    violations.push(
      ...lintSource(file, text).filter((violation) => !isAllowed(fileAllowances, violation.line)),
    );
  }

  return { files, violations, allowances };
}

/** `packages/css/src/index.css:12:3  color-literal  colour literal `#ff0000`` (FR-TOK-001 AC-3). */
export function formatViolation(violation: Violation): string {
  const where = `${violation.file}:${violation.line}:${violation.column}`;
  return `${where}  ${violation.rule}  ${violation.message}`;
}

/** The `--report` view of the allow-list (FR-TOK-001 exception handling). */
export function formatAllowances(allowances: readonly Allowance[]): string[] {
  const lines = [`[lint:tokens] ${allowances.length} allowance(s)`];
  for (const allowance of allowances) {
    lines.push(`  ${allowance.file}:${allowance.line}  scope=${allowance.scope}  reason: ${allowance.reason}`);
  }
  return lines;
}

/** Throws when the run found anything, so the CLI reports it like every other token failure. */
export function assertNoViolations(result: LintResult): void {
  if (result.violations.length === 0) return;

  throw new TokenBuildError(
    "TOK-LITERAL",
    `${result.violations.length} hardcoded value(s) outside the token source`,
    [
      ...result.violations.map(formatViolation),
      "hint: read the value from a `--cdt-` custom property, or annotate the line with " +
        "`/* cdt-allow-literal: <reason> */`.",
    ],
  );
}
