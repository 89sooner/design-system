/**
 * `conductor-check-contrast` argument parsing (API-TOK-003).
 *
 * Separated from `contrast-cli.ts` so tests can exercise it without the CLI's process side effects,
 * exactly as `build/args.ts` is separated from `cli.ts`.
 *
 * Refs: WP-007 FR-THM-004
 */
import { TokenBuildError } from "../build/errors";

export interface ContrastCliOptions {
  /** `all` measures every theme in `THEME_SOURCES`. */
  readonly theme: string;
  /** Print the `decorative` exclusion list and write nothing. */
  readonly report: boolean;
  readonly outDir: string;
}

export const USAGE = "usage: conductor-check-contrast [--theme <dark|light|all>] [--report] [--out <dir>]";

export function parseContrastArgs(argv: readonly string[]): ContrastCliOptions {
  let theme = "all";
  let report = false;
  let outDir = "dist";

  const requireValue = (flag: string, next: string | undefined): string => {
    if (next === undefined || next.startsWith("--")) {
      throw new TokenBuildError("TOK-ARG", `\`${flag}\` needs a value`, [USAGE]);
    }
    return next;
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] as string;
    switch (arg) {
      case "--report":
        report = true;
        break;
      case "--theme":
        theme = requireValue("--theme", argv[index + 1]);
        index += 1;
        break;
      case "--out":
        outDir = requireValue("--out", argv[index + 1]);
        index += 1;
        break;
      default:
        throw new TokenBuildError("TOK-ARG", `unrecognised argument \`${arg}\``, [USAGE]);
    }
  }

  return { theme, report, outDir };
}

/**
 * `--theme light` before WP-010 defines the light palette is an argument error, not a silent
 * no-op: the caller asked for a measurement that cannot be produced.
 */
export function selectThemes<T extends { readonly theme: string }>(
  available: readonly T[],
  requested: string,
): readonly T[] {
  if (requested === "all") return available;

  const match = available.filter((theme) => theme.theme === requested);
  if (match.length > 0) return match;

  throw new TokenBuildError("TOK-ARG", `theme \`${requested}\` is not defined`, [
    `available themes: ${available.map((theme) => theme.theme).join(", ")}`,
    USAGE,
  ]);
}
