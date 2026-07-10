/**
 * `buildTokens` — the token build, from source modules to artifacts (API-TOK-001, JOB-BUILD-001).
 *
 * Order matters. Everything that can fail runs, and every artifact's bytes are produced, before
 * a single file is touched; only then does `writeArtifacts` rename them into place. A cycle, an
 * unknown key or a reverse tier reference therefore leaves the previous output exactly as it was
 * (FR-TOK-003 exception handling).
 *
 * Refs: WP-003 WP-004 WP-005 FR-TOK-002 FR-TOK-003 FR-TOK-004 FR-TOK-006 FR-TOK-008 FR-TOK-009
 */
import { exclusionsFor } from "../contrast/check";
import type { TokenDefinition, TokenUsage } from "../schema";
import { THEME_SOURCES, tokensForTheme } from "../token-source";
import type { ThemeEmit } from "./emit-css";
import { emitCss, emittableTokens } from "./emit-css";
import { emitTokenJson } from "./emit-json";
import { emitBreakpointsModule, emitTokensModule } from "./emit-ts";
import { buildTokenIndex, resolveTokens } from "./reference";
import { assertTierDirection, assertEveryTokenHasATier } from "./tiers";
import {
  assertDistinctZLayers,
  assertGroupSizes,
  assertIconMetadata,
  assertUsageMetadata,
} from "./validate";
import type { Artifacts } from "./write";
import { writeArtifacts } from "./write";

export interface BuildOptions {
  /** Where `tokens.css` and `tokens.json` land. */
  readonly outDir: string;
  /** Where the generated `tokens.ts` and `breakpoints.ts` modules land. Omit to skip them. */
  readonly srcDir?: string;
  /** Resolve and validate, print the contrast-exclusion list, write nothing. */
  readonly report?: boolean;
}

export interface BuildResult {
  readonly stdout: readonly string[];
  readonly written: readonly string[];
  readonly css: string;
  readonly json: string;
  readonly tokensModule: string;
  readonly breakpointsModule: string;
}

/** Validation that reads the source alone, before any reference is followed. */
function validateSource(tokens: readonly TokenDefinition[]): void {
  assertEveryTokenHasATier(tokens);
  assertUsageMetadata(tokens);
  assertIconMetadata(tokens);
  assertGroupSizes(tokens);
}

function countByTier(tokens: readonly TokenDefinition[]): Record<string, number> {
  const counts: Record<string, number> = { primitive: 0, semantic: 0, component: 0 };
  for (const token of tokens) counts[token.tier] = (counts[token.tier] ?? 0) + 1;
  return counts;
}

/**
 * `usage: "decorative"` tokens, with the reason `checkContrast --report` prints.
 * One definition, shared with `contrast/check.ts`, so the two `--report` flags cannot drift.
 */
export function contrastExclusions(
  tokens: readonly TokenDefinition[],
): { key: string; usage: TokenUsage; reason: string }[] {
  return exclusionsFor(tokens).map((exclusion) => ({ ...exclusion }));
}

/** Resolves one theme and returns its emit block. Throws on the first invariant a theme breaks. */
function resolveTheme(theme: (typeof THEME_SOURCES)[number]): {
  emit: ThemeEmit;
  tokens: TokenDefinition[];
} {
  const tokens = tokensForTheme(theme);
  validateSource(tokens);

  const index = buildTokenIndex(tokens);
  assertTierDirection(index);

  const { values } = resolveTokens(index);
  assertDistinctZLayers(values);

  return {
    emit: {
      theme: theme.theme,
      selectors: theme.selectors,
      colorScheme: theme.colorScheme,
      values,
    },
    tokens,
  };
}

export function buildTokens(options: BuildOptions): BuildResult {
  const resolved = THEME_SOURCES.map(resolveTheme);
  // Tiers, keys and descriptions are theme-independent, so the canonical theme's list drives emit.
  const canonical = (resolved[0] as { tokens: TokenDefinition[] }).tokens;
  const themes = resolved.map(({ emit }) => emit);

  const css = emitCss(canonical, themes);
  const json = emitTokenJson(canonical, themes);
  const tokensModule = emitTokensModule(canonical);
  const breakpointsModule = emitBreakpointsModule();

  const counts = countByTier(canonical);
  const emitted = emittableTokens(canonical);
  const stdout = [
    `[tokens] resolved ${canonical.length} tokens (${counts.primitive} primitive, ` +
      `${counts.semantic} semantic, ${counts.component} component)`,
  ];

  if (options.report === true) {
    const exclusions = contrastExclusions(canonical);
    stdout.push(`[tokens] ${exclusions.length} token(s) excluded from contrast checks (decorative)`);
    for (const exclusion of exclusions) stdout.push(`  ${exclusion.key}`);
    stdout.push("[tokens] --report: no files written");
    return { stdout, written: [], css, json, tokensModule, breakpointsModule };
  }

  const distArtifacts: Artifacts = new Map([
    ["tokens.css", css],
    ["tokens.json", json],
  ]);
  const written = writeArtifacts(options.outDir, distArtifacts).map((name) => `${options.outDir}/${name}`);

  stdout.push(`[tokens] wrote ${options.outDir}/tokens.css (${emitted.length} declarations)`);
  stdout.push(`[tokens] wrote ${options.outDir}/tokens.json`);

  if (options.srcDir !== undefined) {
    const sourceArtifacts: Artifacts = new Map([
      ["tokens.ts", tokensModule],
      ["breakpoints.ts", breakpointsModule],
    ]);
    for (const name of writeArtifacts(options.srcDir, sourceArtifacts)) {
      written.push(`${options.srcDir}/${name}`);
    }
    stdout.push(`[tokens] wrote ${options.srcDir}/tokens.ts, ${options.srcDir}/breakpoints.ts`);
  }

  return { stdout, written, css, json, tokensModule, breakpointsModule };
}
