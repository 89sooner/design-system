/**
 * `conductor-build-tokens` argument parsing (API-TOK-001).
 *
 * Separated from `cli.ts` so that tests can exercise it without the CLI's process side effects.
 *
 * Refs: WP-003
 */
import { TokenBuildError } from "./errors";

export interface CliOptions {
  readonly outDir: string;
  readonly report: boolean;
  readonly watch: boolean;
}

export const USAGE = "usage: conductor-build-tokens [--out <dir>] [--report] [--watch]";

/** Throws `TokenBuildError` with exit code 3 on anything it does not recognise. */
export function parseArgs(argv: readonly string[]): CliOptions {
  let outDir = "dist";
  let report = false;
  let watch = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] as string;
    switch (arg) {
      case "--report":
        report = true;
        break;
      case "--watch":
        watch = true;
        break;
      case "--out": {
        const next = argv[index + 1];
        if (next === undefined || next.startsWith("--")) {
          throw new TokenBuildError("TOK-ARG", "`--out` needs a directory", [USAGE]);
        }
        outDir = next;
        index += 1;
        break;
      }
      default:
        throw new TokenBuildError("TOK-ARG", `unrecognised argument \`${arg}\``, [USAGE]);
    }
  }

  if (report && watch) {
    throw new TokenBuildError("TOK-ARG", "`--report` and `--watch` are mutually exclusive", [USAGE]);
  }
  return { outDir, report, watch };
}
