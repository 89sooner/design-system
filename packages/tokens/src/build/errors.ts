/**
 * Machine-readable build failures.
 *
 * Every message carries an `error[<CODE>]:` prefix and an actionable hint
 * (`conductor_api_contracts.md` section 2, principle 4).
 *
 * Exit codes are fixed by API-TOK-001:
 *   1  reference resolution failure — cycle, unknown key, depth overflow, tier direction
 *   2  prefix or name-collision violation
 *   3  bad CLI arguments
 *
 * API-TOK-003 (`checkContrast`) reuses code 1 for a malformed pair declaration and code 3 for a
 * bad argument. A pair that merely measures below its threshold is not an error: it is a result,
 * and `contrast-cli.ts` turns it into exit code 1 after printing every pair.
 *
 * `lintTokens` (FR-TOK-001 AC-3) reports its violations under `TOK-LITERAL`, also exit code 1.
 *
 * Refs: WP-003 FR-TOK-002 FR-TOK-003 FR-TOK-004 · WP-006 FR-TOK-001 · WP-007 FR-THM-004
 */

export type BuildErrorCode =
  | "TOK-CYCLE"
  | "TOK-UNKNOWN-REF"
  | "TOK-DEPTH"
  | "TOK-TIER"
  | "TOK-TIER-MISSING"
  | "TOK-DUPLICATE-KEY"
  | "TOK-ICON"
  | "TOK-GROUP-SIZE"
  | "TOK-USAGE"
  | "TOK-VALUE"
  | "TOK-Z-DUPLICATE"
  | "TOK-PREFIX"
  | "TOK-NAME-COLLISION"
  | "TOK-MEDIA-VAR"
  | "TOK-CP-DUPLICATE-ID"
  | "TOK-CP-UNKNOWN-KEY"
  | "TOK-CP-DECORATIVE"
  | "TOK-CP-USAGE"
  | "TOK-CP-COLOR"
  | "TOK-CP-ALPHA"
  | "TOK-CP-FORBIDDEN"
  | "TOK-THEME-KEY"
  | "TOK-LITERAL"
  | "TOK-ARG";

const EXIT_CODES: Readonly<Record<BuildErrorCode, number>> = {
  "TOK-CYCLE": 1,
  "TOK-UNKNOWN-REF": 1,
  "TOK-DEPTH": 1,
  "TOK-TIER": 1,
  "TOK-TIER-MISSING": 1,
  "TOK-DUPLICATE-KEY": 1,
  "TOK-ICON": 1,
  "TOK-GROUP-SIZE": 1,
  "TOK-USAGE": 1,
  "TOK-VALUE": 1,
  "TOK-Z-DUPLICATE": 1,
  "TOK-PREFIX": 2,
  "TOK-NAME-COLLISION": 2,
  "TOK-MEDIA-VAR": 2,
  "TOK-CP-DUPLICATE-ID": 1,
  "TOK-CP-UNKNOWN-KEY": 1,
  "TOK-CP-DECORATIVE": 1,
  "TOK-CP-USAGE": 1,
  "TOK-CP-COLOR": 1,
  "TOK-CP-ALPHA": 1,
  "TOK-CP-FORBIDDEN": 1,
  "TOK-THEME-KEY": 1,
  "TOK-LITERAL": 1,
  "TOK-ARG": 3,
};

export class TokenBuildError extends Error {
  readonly code: BuildErrorCode;
  readonly exitCode: number;
  /** Indented lines printed under the summary: offending keys, cycle paths, hints. */
  readonly details: readonly string[];

  constructor(code: BuildErrorCode, summary: string, details: readonly string[] = []) {
    super(`error[${code}]: ${summary}`);
    this.name = "TokenBuildError";
    this.code = code;
    this.exitCode = EXIT_CODES[code];
    this.details = details;
  }

  /** The full stderr rendering, summary line first. */
  format(): string {
    return [this.message, ...this.details.map((line) => `  ${line}`)].join("\n");
  }
}
