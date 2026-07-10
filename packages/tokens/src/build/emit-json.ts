/**
 * `tokens.json` emission — the artifact the documentation site reads (FR-DOC-002, FR-DOC-004).
 *
 * Carries key, tier, usage and description metadata alongside the resolved value of each theme
 * (FR-TOK-006 AC-3). Primitives are absent: they are neither public nor renderable
 * (FR-TOK-002 AC-5).
 *
 * There is no build timestamp in here. Two builds of the same source must be byte-identical
 * (`conductor_data_model.md` 7), and a timestamp would break that.
 *
 * Refs: WP-004 FR-TOK-006
 */
import type { TokenDefinition, TokenTier, TokenUsage } from "../schema";
import type { ThemeEmit } from "./emit-css";
import { emittableTokens } from "./emit-css";
import { cssPropertyName } from "./names";

export interface TokenJsonEntry {
  readonly key: string;
  readonly cssName: string;
  readonly tier: TokenTier;
  readonly usage: TokenUsage;
  readonly description: string;
  readonly alias?: string;
  readonly icon?: string;
  readonly themeSpecific?: boolean;
  /** Resolved literal per theme, e.g. `{ "dark": "#141d2a" }`. */
  readonly values: Readonly<Record<string, string>>;
}

export interface TokenJson {
  readonly themes: readonly string[];
  readonly tokens: readonly TokenJsonEntry[];
}

export function buildTokenJson(
  tokens: readonly TokenDefinition[],
  themes: readonly ThemeEmit[],
): TokenJson {
  const entries = emittableTokens(tokens).map((token) => {
    const values: Record<string, string> = {};
    for (const theme of themes) values[theme.theme] = theme.values.get(token.key) as string;

    return {
      key: token.key,
      cssName: cssPropertyName(token.key),
      tier: token.tier,
      // `assertUsageMetadata` has already rejected any token without one.
      usage: token.usage as TokenUsage,
      description: token.description,
      ...(token.alias !== undefined ? { alias: token.alias } : {}),
      ...(token.icon !== undefined ? { icon: token.icon } : {}),
      ...(token.themeSpecific !== undefined ? { themeSpecific: token.themeSpecific } : {}),
      values,
    } satisfies TokenJsonEntry;
  });

  return { themes: themes.map((theme) => theme.theme), tokens: entries };
}

export function emitTokenJson(tokens: readonly TokenDefinition[], themes: readonly ThemeEmit[]): string {
  return `${JSON.stringify(buildTokenJson(tokens, themes), null, 2)}\n`;
}
