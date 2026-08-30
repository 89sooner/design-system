/**
 * `checkContrast` — measures every declared pair in every theme (API-TOK-003, FR-THM-004).
 *
 * The pair list is the contract; this module only resolves it. Every way a pair can be wrong is a
 * hard error with an `error[TOK-CP-…]` code, because a pair that cannot be measured must never
 * quietly count as a pass:
 *
 *   TOK-CP-DUPLICATE-ID  two pairs claim one `CP-###`
 *   TOK-CP-UNKNOWN-KEY   a pair names a token that does not exist
 *   TOK-CP-DECORATIVE    a `decorative` token is declared as a foreground — it is excluded by
 *                        `usage`, so measuring it contradicts the exclusion (FR-A11Y-004 AC-3)
 *   TOK-CP-USAGE         the pair's threshold disagrees with the foreground token's `usage`
 *   TOK-CP-COLOR         the resolved value holds no colour, or more than one
 *   TOK-CP-ALPHA         the background is translucent and has no backdrop to composite against
 *
 * A pair below its threshold is not an error here. It is a `PairResult` with `pass: false`; the
 * CLI prints every pair and then exits 1 (AC-3).
 *
 * Refs: WP-007 FR-THM-004 FR-THM-005 FR-A11Y-004
 */
import { TokenBuildError } from "../build/errors";
import { buildTokenIndex, resolveReferenceTarget, resolveTokens } from "../build/reference";
import type { TokenIndex } from "../build/reference";
import { CONTRAST_THRESHOLDS, contrastPairs, forbiddenPairs } from "../contrast-pairs";
import type { ContrastPair, ContrastUsage, ForbiddenPair } from "../contrast-pairs";
import type { TokenDefinition, TokenUsage } from "../schema";
import { THEME_SOURCES, tokensForTheme } from "../token-source";
import type { ThemeSource } from "../token-source";
import { compositeOver, contrastRatio, findColors, toHex } from "./color";
import type { Rgba } from "./color";

export interface PairResult {
  readonly id: string;
  readonly theme: string;
  readonly foreground: string;
  readonly background: string;
  /** The token's resolved literal, before compositing. */
  readonly foregroundValue: string;
  readonly backgroundValue: string;
  /** What the foreground looks like once composited onto the background (FR-THM-004 AC-4). */
  readonly compositedForeground: string;
  readonly usage: ContrastUsage;
  readonly threshold: number;
  /** Measured ratio, rounded to four places so the report is byte-stable. */
  readonly ratio: number;
  readonly pass: boolean;
}

/** A `decorative` token and the reason its `description` gives (FR-A11Y-004 AC-3). */
export interface Exclusion {
  readonly key: string;
  readonly usage: TokenUsage;
  readonly reason: string;
}

/** One forbidden combination, re-measured so the ban stays evidenced rather than inherited. */
export interface ForbiddenResult {
  readonly id: string;
  readonly theme: string;
  readonly foreground: string;
  readonly background: string;
  readonly ratio: number;
  readonly reason: string;
}

export interface ContrastReport {
  readonly themes: readonly string[];
  readonly thresholds: Readonly<Record<ContrastUsage, number>>;
  readonly results: readonly PairResult[];
  readonly exclusions: readonly Exclusion[];
  readonly forbidden: readonly ForbiddenResult[];
  readonly summary: {
    readonly declaredPairs: number;
    readonly checks: number;
    readonly passed: number;
    readonly failed: number;
    readonly excludedTokens: number;
    readonly forbiddenPairs: number;
  };
}

export interface CheckOptions {
  /** Themes to measure. Defaults to every theme in `THEME_SOURCES`. */
  readonly themes?: readonly ThemeSource[];
  /** Pairs to measure. Defaults to the declared list. Tests substitute fixtures. */
  readonly pairs?: readonly ContrastPair[];
  /** Combinations that must not render. Defaults to the declared list. */
  readonly forbidden?: readonly ForbiddenPair[];
}

function assertUniqueIds(pairs: readonly ContrastPair[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of pairs) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  if (duplicates.size === 0) return;

  throw new TokenBuildError("TOK-CP-DUPLICATE-ID", `${duplicates.size} contrast pair id(s) declared twice`, [
    ...duplicates,
    "hint: CP ids are permanent. A removed pair leaves its number retired (tokens spec 8.2).",
  ]);
}

function lookup(index: TokenIndex, pair: ContrastPair, role: "foreground" | "background"): TokenDefinition {
  const declared = pair[role];
  const key = resolveReferenceTarget(index, declared);
  if (key === undefined) {
    throw new TokenBuildError("TOK-CP-UNKNOWN-KEY", "contrast pair names a token that does not exist", [
      `pair: ${pair.id}`,
      `${role}: ${declared}`,
      "hint: check the spelling, or remove the pair. Primitive keys are not addressable here.",
    ]);
  }
  return index.get(key) as TokenDefinition;
}

/**
 * `usage` is the single classification `srs_final.md` 12.1 assigns each token, so a pair cannot
 * hold the token to a different bar than its own metadata declares. The one relaxation: a `body`
 * token may be measured as `large` text, because large text is a weaker requirement on the same
 * colour.
 */
function assertUsageAgrees(pair: ContrastPair, foreground: TokenDefinition): void {
  if (foreground.usage === "decorative") {
    throw new TokenBuildError(
      "TOK-CP-DECORATIVE",
      "a `decorative` token is declared as a contrast pair foreground",
      [
        `pair: ${pair.id}`,
        `foreground: ${foreground.key}`,
        `reason it is excluded: ${foreground.description}`,
        "hint: `decorative` means excluded from contrast checking. Reclassifying it needs a CR.",
      ],
    );
  }
  const agrees = foreground.usage === pair.usage || (pair.usage === "large" && foreground.usage === "body");
  if (agrees) return;

  throw new TokenBuildError("TOK-CP-USAGE", "contrast pair threshold disagrees with the token's `usage`", [
    `pair: ${pair.id}`,
    `foreground: ${foreground.key} declares usage \`${String(foreground.usage)}\``,
    `pair declares usage \`${pair.usage}\``,
    "hint: `srs_final.md` 12.1 fixes each token's usage; the pair follows it.",
  ]);
}

function colorOf(pair: ContrastPair, token: TokenDefinition, value: string, role: string): Rgba {
  const colors = findColors(value);
  if (colors.length === 1) return colors[0] as Rgba;

  throw new TokenBuildError(
    "TOK-CP-COLOR",
    colors.length === 0
      ? "contrast pair token resolves to a value that holds no colour"
      : "contrast pair token resolves to a value that holds more than one colour",
    [
      `pair: ${pair.id}`,
      `${role}: ${token.key}`,
      `value: ${value}`,
      `colours found: ${colors.length}`,
      "hint: a pair measures one colour. `focusRing` works because its box-shadow carries exactly one.",
    ],
  );
}

function measure(pair: ContrastPair, theme: string, index: TokenIndex, values: ReadonlyMap<string, string>): PairResult {
  const foreground = lookup(index, pair, "foreground");
  const background = lookup(index, pair, "background");
  assertUsageAgrees(pair, foreground);

  const foregroundValue = values.get(foreground.key) as string;
  const backgroundValue = values.get(background.key) as string;

  const backgroundColor = colorOf(pair, background, backgroundValue, "background");
  if (backgroundColor.alpha < 1) {
    throw new TokenBuildError("TOK-CP-ALPHA", "contrast pair background is translucent", [
      `pair: ${pair.id}`,
      `background: ${background.key} = ${backgroundValue}`,
      "hint: a translucent background has no colour of its own. Declare the opaque surface beneath it.",
    ]);
  }

  const foregroundColor = colorOf(pair, foreground, foregroundValue, "foreground");
  const composited = compositeOver(foregroundColor, backgroundColor);
  const ratio = contrastRatio(composited, backgroundColor);
  const threshold = CONTRAST_THRESHOLDS[pair.usage];

  return {
    id: pair.id,
    theme,
    foreground: pair.foreground,
    background: pair.background,
    foregroundValue,
    backgroundValue,
    compositedForeground: toHex(composited),
    usage: pair.usage,
    threshold,
    ratio: Number(ratio.toFixed(4)),
    pass: ratio >= threshold,
  };
}

/**
 * Fails a declared pair that reaches a forbidden combination through its aliases.
 *
 * The comparison is on resolved keys, not on the names written in the pair, because that is the
 * only way the ban survives indirection: `input.placeholder` and `text.faint` are one key once
 * resolved, and a pair naming the former would otherwise be measured — and pass or fail on its
 * ratio — as though the ban did not exist.
 */
function aliasTerminus(index: TokenIndex, reference: string): string | undefined {
  // `resolveReferenceTarget` only resolves addressing (`accent` → `accent.DEFAULT`). Following the
  // alias links as well is what makes `input.placeholder` and `text.faint` the same token here.
  let key = resolveReferenceTarget(index, reference);
  const seen = new Set<string>();
  while (key !== undefined && !seen.has(key)) {
    seen.add(key);
    const alias = index.get(key)?.alias;
    if (alias === undefined) return key;
    key = resolveReferenceTarget(index, alias);
  }
  return key;
}

function assertNotForbidden(
  pair: ContrastPair,
  index: TokenIndex,
  forbidden: readonly ForbiddenPair[],
): void {
  const resolvedForeground = aliasTerminus(index, pair.foreground);
  const resolvedBackground = aliasTerminus(index, pair.background);

  for (const banned of forbidden) {
    const bannedForeground = aliasTerminus(index, banned.foreground);
    const bannedBackground = aliasTerminus(index, banned.background);
    if (resolvedForeground !== bannedForeground || resolvedBackground !== bannedBackground) continue;
    /*
     * A ban scoped to some usages leaves the others alone (PR #8 review P2).
     *
     * `FP-002` forbids the accent as *body* text on the elevated surface; the same colours
     * clear the `large` and `nonText` thresholds there and the SRS permits them. Rejecting
     * every pair that names those two tokens bans a combination the specification allows,
     * and then this check contradicts the document it exists to enforce.
     */
    if (banned.usages !== undefined && !banned.usages.includes(pair.usage)) continue;

    throw new TokenBuildError("TOK-CP-FORBIDDEN", "contrast pair declares a forbidden combination", [
      `pair: ${pair.id} (${pair.foreground} on ${pair.background})`,
      `forbidden: ${banned.id} (${banned.foreground} on ${banned.background})`,
      `reason: ${banned.reason}`,
      "hint: the pair resolves to a combination that must not render. Lifting the ban needs a CR.",
    ]);
  }
}

/**
 * Re-measures each forbidden combination. A ban carried forward without evidence is indistinguishable
 * from a ban that stopped being true, so the number that justified it is printed on every run.
 */
function measureForbidden(
  forbidden: readonly ForbiddenPair[],
  theme: string,
  index: TokenIndex,
  values: ReadonlyMap<string, string>,
): ForbiddenResult[] {
  return forbidden.map((banned) => {
    // A forbidden combination reuses the pair plumbing for lookup and error reporting, so it is
    // measured with the same resolution rules the declared pairs get.
    const asPair: ContrastPair = { ...banned, usage: "nonText", themes: [theme] };
    const foreground = lookup(index, asPair, "foreground");
    const background = lookup(index, asPair, "background");
    const backgroundColor = colorOf(asPair, background, values.get(background.key) as string, "background");
    const foregroundColor = colorOf(asPair, foreground, values.get(foreground.key) as string, "foreground");
    const ratio = contrastRatio(compositeOver(foregroundColor, backgroundColor), backgroundColor);

    return {
      id: banned.id,
      theme,
      foreground: banned.foreground,
      background: banned.background,
      ratio: Number(ratio.toFixed(4)),
      reason: banned.reason,
    };
  });
}

/** `usage: "decorative"` tokens of a theme, with the exclusion reason from `description`. */
export function exclusionsFor(tokens: readonly TokenDefinition[]): Exclusion[] {
  return tokens
    .filter((token) => token.tier !== "primitive" && token.usage === "decorative")
    .map((token) => ({ key: token.key, usage: "decorative" as const, reason: token.description }));
}

export function checkContrast(options: CheckOptions = {}): ContrastReport {
  const themes = options.themes ?? THEME_SOURCES;
  const pairs = options.pairs ?? contrastPairs;
  const forbidden = options.forbidden ?? forbiddenPairs;
  assertUniqueIds(pairs);

  const results: PairResult[] = [];
  const exclusions = new Map<string, Exclusion>();
  const forbiddenResults: ForbiddenResult[] = [];

  for (const theme of themes) {
    const tokens = tokensForTheme(theme);
    const index = buildTokenIndex(tokens);
    const { values } = resolveTokens(index);

    for (const exclusion of exclusionsFor(tokens)) exclusions.set(exclusion.key, exclusion);
    forbiddenResults.push(...measureForbidden(forbidden, theme.theme, index, values));
    for (const pair of pairs) {
      if (!pair.themes.includes(theme.theme)) continue;
      assertNotForbidden(pair, index, forbidden);
      results.push(measure(pair, theme.theme, index, values));
    }
  }

  const failed = results.filter((result) => !result.pass).length;
  return {
    themes: themes.map((theme) => theme.theme),
    thresholds: CONTRAST_THRESHOLDS,
    results,
    exclusions: [...exclusions.values()],
    forbidden: forbiddenResults,
    summary: {
      declaredPairs: pairs.length,
      checks: results.length,
      passed: results.length - failed,
      failed,
      excludedTokens: exclusions.size,
      forbiddenPairs: forbidden.length,
    },
  };
}
