/**
 * `lintTokens` CLI, published as the `conductor-lint-tokens` bin (FR-TOK-001 AC-3).
 *
 * Targets are positional paths, resolved against the working directory. The root
 * `pnpm lint:tokens` script passes `packages/css packages/react`; keeping them out of this package
 * is what lets `@conductor/tokens` lint its consumers without depending on them.
 *
 * Exit codes: 0 clean · 1 at least one violation · 3 bad arguments.
 *
 * Refs: WP-006 FR-TOK-001 FR-TOK-008 FR-THM-005
 */
import { TokenBuildError } from "./build/errors";
import { assertNoViolations, formatAllowances, lintTokens } from "./lint";

const USAGE = "usage: conductor-lint-tokens <path...> [--report]";

interface LintCliOptions {
  readonly targets: readonly string[];
  readonly report: boolean;
}

export function parseLintArgs(argv: readonly string[]): LintCliOptions {
  const targets: string[] = [];
  let report = false;

  for (const arg of argv) {
    if (arg === "--report") report = true;
    else if (arg.startsWith("--")) throw new TokenBuildError("TOK-ARG", `unrecognised argument \`${arg}\``, [USAGE]);
    else targets.push(arg);
  }

  if (targets.length === 0) {
    throw new TokenBuildError("TOK-ARG", "no lint targets given", [USAGE]);
  }
  return { targets, report };
}

function runOnce(options: LintCliOptions): number {
  const result = lintTokens(options.targets);

  if (options.report) {
    for (const line of formatAllowances(result.allowances)) console.log(line);
  }
  console.log(
    `[lint:tokens] scanned ${result.files.length} file(s), ` +
      `${result.violations.length} violation(s), ${result.allowances.length} allowance(s)`,
  );

  assertNoViolations(result);
  return 0;
}

function main(argv: readonly string[]): number {
  try {
    return runOnce(parseLintArgs(argv));
  } catch (error) {
    if (error instanceof TokenBuildError) {
      console.error(error.format());
      return error.exitCode;
    }
    console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
