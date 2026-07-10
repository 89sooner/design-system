/**
 * `checkContrast` CLI, published as the `conductor-check-contrast` bin (API-TOK-003).
 *
 * Exit codes: 0 every pair passes · 1 at least one pair is below its threshold, or a pair is
 * malformed · 3 bad arguments.
 *
 * Refs: WP-007 FR-THM-004 FR-THM-005 FR-A11Y-004
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { TokenBuildError } from "./build/errors";
import { writeArtifacts } from "./build/write";
import { parseContrastArgs, selectThemes } from "./contrast/args";
import type { ContrastCliOptions } from "./contrast/args";
import { checkContrast } from "./contrast/check";
import { exitCodeFor, formatExclusions, formatResult, formatSummary, renderReportJson } from "./contrast/report";
import { THEME_SOURCES } from "./token-source";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_FILE = "contrast-report.json";

function runOnce(options: ContrastCliOptions): number {
  const themes = selectThemes(THEME_SOURCES, options.theme);
  const report = checkContrast({ themes });

  if (options.report) {
    for (const line of formatExclusions(report)) console.log(line);
    return 0;
  }

  for (const result of report.results) console.log(formatResult(result));

  const outDir = resolve(PACKAGE_ROOT, options.outDir);
  writeArtifacts(outDir, new Map([[REPORT_FILE, renderReportJson(report)]]));
  console.log(`[contrast] wrote ${options.outDir}/${REPORT_FILE}`);
  console.log(formatSummary(report));

  return exitCodeFor(report);
}

/** Prints the failure the way the checker phrased it and preserves its exit code. */
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
  try {
    return runOnce(parseContrastArgs(argv));
  } catch (error) {
    return reportFailure(error);
  }
}

process.exitCode = main(process.argv.slice(2));
