/**
 * Rendering of a `ContrastReport` — stdout lines and the `dist/contrast-report.json` artifact.
 *
 * Kept apart from `check.ts` so the measurement has no opinion about presentation, and apart from
 * `contrast-cli.ts` so both can be asserted without spawning a process.
 *
 * Refs: WP-007 FR-THM-004 FR-A11Y-004 · W-030 consumes the JSON (FR-DOC-004)
 */
import type { ContrastReport, PairResult } from "./check";

/** `18.32`. Two places, as `conductor_api_contracts.md` API-TOK-003 prints them. */
export function formatRatio(ratio: number): string {
  return ratio.toFixed(2);
}

/**
 * `theme=dark  id=CP-001  pair=text.primary/surface.base  ratio=18.32  threshold=4.50(body)  PASS`
 *
 * Every field FR-THM-004 AC-3 requires on a failure — pair, theme, measured ratio, threshold — is
 * on every line, so a passing run and a failing run are read the same way.
 */
export function formatResult(result: PairResult): string {
  const columns = [
    `theme=${result.theme}`.padEnd(12),
    `id=${result.id}`.padEnd(11),
    `pair=${result.foreground}/${result.background}`.padEnd(52),
    `ratio=${formatRatio(result.ratio)}`.padEnd(12),
    `threshold=${result.threshold.toFixed(2)}(${result.usage})`.padEnd(26),
    result.pass ? "PASS" : "FAIL",
  ];
  return columns.join(" ").trimEnd();
}

/** `2 of 80 pairs checked failed contrast threshold` (API-TOK-003). */
export function formatSummary(report: ContrastReport): string {
  return `${report.summary.failed} of ${report.summary.checks} pairs checked failed contrast threshold`;
}

/**
 * API-TOK-003: `0` when every pair passes, `1` when one or more fall below threshold
 * (FR-THM-004 AC-3, FR-A11Y-004 AC-2). Separate from the CLI so the rule is testable.
 */
export function exitCodeFor(report: ContrastReport): number {
  return report.summary.failed > 0 ? 1 : 0;
}

/** The `--report` view: what `checkContrast` does not measure, and why (FR-A11Y-004 AC-3). */
export function formatExclusions(report: ContrastReport): string[] {
  const lines = [
    `[contrast] ${report.summary.excludedTokens} token(s) excluded from contrast checks (usage: decorative)`,
  ];
  for (const exclusion of report.exclusions) {
    lines.push(`  ${exclusion.key}`);
    lines.push(`    reason: ${exclusion.reason}`);
  }
  lines.push("[contrast] --report: no files written");
  return lines;
}

/**
 * `dist/contrast-report.json`. The token reference screen (W-030) reads this rather than
 * recomputing contrast in the browser, so the shape is the contract, not an internal detail.
 */
export function renderReportJson(report: ContrastReport): string {
  return `${JSON.stringify(
    {
      $generatedBy: "@conductor/tokens conductor-check-contrast",
      themes: report.themes,
      thresholds: report.thresholds,
      summary: report.summary,
      results: report.results,
      exclusions: report.exclusions,
    },
    null,
    2,
  )}\n`;
}
