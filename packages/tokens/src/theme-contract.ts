/**
 * The cross-theme token contract (FR-QA-001, M-2).
 *
 * Every theme must declare the same semantic and component keys, or a component styled from
 * `--cdt-surface-raised` renders unstyled the moment the other theme is applied. The check is the
 * symmetric difference of the key sets, taken over an arbitrary number of themes rather than the
 * two the requirement names — `THEME_SOURCES` holds only the dark palette until WP-010 lands, and
 * a check that needs exactly two themes could not run at all today.
 *
 * With one theme the difference is necessarily empty. That is not a proof the check works, so
 * `theme-contract.test.ts` drives it with two-theme fixtures. What the single-theme run does buy
 * is that WP-010 cannot add `palette.light.ts` without this test turning red the moment a key is
 * missing.
 *
 * `themeSpecific: true` exempts a key (FR-QA-001 exception handling). Exemptions are returned in
 * the report rather than dropped, so an unjustified one stays visible.
 *
 * Primitives are out of scope: they are shared, never exported (FR-TOK-002 AC-5) and never emitted.
 *
 * Refs: WP-006 FR-QA-001 FR-THM-002
 */
import type { TokenDefinition, TokenTier } from "./schema";
import { tokensForTheme } from "./token-source";
import type { ThemeSource } from "./token-source";

/** The tiers a theme is answerable for. FR-QA-001 AC-2 names component tokens explicitly. */
const CHECKED_TIERS: readonly TokenTier[] = ["semantic", "component"];

export interface MissingKey {
  readonly key: string;
  readonly tier: TokenTier;
  /** Themes that declare the key. */
  readonly presentIn: readonly string[];
  /** Themes that do not — what FR-QA-001 AC-1 asks to be printed per theme. */
  readonly missingFrom: readonly string[];
}

export interface ThemeExemption {
  readonly key: string;
  readonly theme: string;
  readonly reason: string;
}

export interface ThemeContractReport {
  readonly themes: readonly string[];
  readonly checkedKeys: number;
  readonly missing: readonly MissingKey[];
  readonly exemptions: readonly ThemeExemption[];
}

function checkedTokensOf(theme: ThemeSource): TokenDefinition[] {
  return tokensForTheme(theme).filter((token) => CHECKED_TIERS.includes(token.tier));
}

/**
 * @returns the symmetric difference, one entry per key that at least one theme is missing.
 * An empty `missing` array is the passing state (FR-QA-001 AC-1).
 */
export function checkThemeContract(themes: readonly ThemeSource[]): ThemeContractReport {
  const declared = new Map<string, Map<string, TokenDefinition>>();
  const exemptions: ThemeExemption[] = [];

  for (const theme of themes) {
    for (const token of checkedTokensOf(theme)) {
      if (token.themeSpecific === true) {
        exemptions.push({ key: token.key, theme: theme.theme, reason: token.description });
        continue;
      }
      const byTheme = declared.get(token.key) ?? new Map<string, TokenDefinition>();
      byTheme.set(theme.theme, token);
      declared.set(token.key, byTheme);
    }
  }

  const themeNames = themes.map((theme) => theme.theme);
  const missing: MissingKey[] = [];

  for (const [key, byTheme] of declared) {
    if (byTheme.size === themeNames.length) continue;
    const presentIn = themeNames.filter((name) => byTheme.has(name));
    missing.push({
      key,
      tier: (byTheme.values().next().value as TokenDefinition).tier,
      presentIn,
      missingFrom: themeNames.filter((name) => !byTheme.has(name)),
    });
  }

  return {
    themes: themeNames,
    checkedKeys: declared.size,
    missing: missing.sort((one, other) => one.key.localeCompare(other.key)),
    exemptions: exemptions.sort((one, other) => one.key.localeCompare(other.key)),
  };
}

/** Human-readable rendering of a failure, keyed by theme as FR-QA-001 AC-1 requires. */
export function formatMissingKeys(report: ThemeContractReport): string[] {
  return report.missing.flatMap((entry) =>
    entry.missingFrom.map(
      (theme) => `missing from \`${theme}\`: ${entry.key} (${entry.tier}, declared by ${entry.presentIn.join(", ")})`,
    ),
  );
}
