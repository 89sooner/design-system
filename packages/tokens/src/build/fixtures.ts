/**
 * Small hand-built token sets for the build tests.
 *
 * Real token sources are large and always valid; the checkers are only interesting on sources
 * that are not, so the negative-path tests construct their own.
 */
import type { TokenDefinition, TokenTier } from "../schema";

export function token(
  key: string,
  tier: TokenTier,
  source: { value: string | number } | { alias: string },
): TokenDefinition {
  return { key, tier, usage: "decorative", description: `fixture ${key}`, ...source };
}

/** A chain `t0 -> t1 -> ... -> t<hops>`, where the last token holds a literal. */
export function referenceChain(hops: number): TokenDefinition[] {
  const chain: TokenDefinition[] = [];
  for (let index = 0; index < hops; index += 1) {
    chain.push(token(`t${index}`, "semantic", { alias: `t${index + 1}` }));
  }
  chain.push(token(`t${hops}`, "semantic", { value: "#ffffff" }));
  return chain;
}
