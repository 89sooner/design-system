/**
 * `buildTokens` CLI, published as the `conductor-build-tokens` bin (API-TOK-001).
 *
 * Exit codes: 0 success · 1 reference resolution failure · 2 prefix or name collision ·
 * 3 bad arguments.
 *
 * Refs: WP-003 FR-TOK-003 FR-TOK-004
 */
import { watch } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildTokens } from "./build";
import type { CliOptions } from "./build/args";
import { parseArgs } from "./build/args";
import { TokenBuildError } from "./build/errors";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(PACKAGE_ROOT, "src");

function runOnce(options: CliOptions): void {
  const started = Date.now();
  const result = buildTokens({
    outDir: resolve(PACKAGE_ROOT, options.outDir),
    srcDir: options.report ? undefined : SOURCE_DIR,
    report: options.report,
  });

  for (const line of result.stdout) console.log(line);
  if (!options.report) console.log(`done in ${Date.now() - started}ms`);
}

/** Prints the failure the way the resolver phrased it and preserves its exit code. */
function reportFailure(error: unknown): number {
  if (error instanceof TokenBuildError) {
    console.error(error.format());
    if (error.exitCode === 1) console.error("no output written");
    return error.exitCode;
  }
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  return 1;
}

function main(argv: readonly string[]): number {
  let options: CliOptions;
  try {
    options = parseArgs(argv);
  } catch (error) {
    return reportFailure(error);
  }

  if (!options.watch) {
    try {
      runOnce(options);
      return 0;
    } catch (error) {
      return reportFailure(error);
    }
  }

  // Local convenience only: a failed rebuild logs and waits rather than tearing the watcher down.
  // `writeArtifacts` skips files whose bytes are unchanged, so regenerating into `src/` while
  // watching `src/` does not feed the watcher its own output.
  const rebuild = (): void => {
    try {
      runOnce(options);
    } catch (error) {
      reportFailure(error);
    }
  };

  rebuild();
  let pending: NodeJS.Timeout | undefined;
  watch(SOURCE_DIR, { recursive: true }, () => {
    if (pending !== undefined) clearTimeout(pending);
    pending = setTimeout(rebuild, 50);
  });
  console.log(`[tokens] watching ${SOURCE_DIR}`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
