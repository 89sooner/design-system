/**
 * Reference resolver. Turns `{surface.subtle}` into the literal it stands for, so that the
 * emitted CSS holds no `var()` chain (FR-TOK-003 AC-1).
 *
 * Refs: WP-003 FR-TOK-003
 */
import { MAX_REFERENCE_DEPTH, stripBraces } from "../schema";
import type { TokenAlias, TokenDefinition } from "../schema";
import { TokenBuildError } from "./errors";

export type TokenIndex = ReadonlyMap<string, TokenDefinition>;

/** ENT-TOK-001 invariant 7: a key appears once across the whole source. */
export function buildTokenIndex(tokens: readonly TokenDefinition[]): TokenIndex {
  const index = new Map<string, TokenDefinition>();
  const duplicates: string[] = [];

  for (const token of tokens) {
    if (index.has(token.key)) duplicates.push(token.key);
    else index.set(token.key, token);
  }

  if (duplicates.length > 0) {
    throw new TokenBuildError(
      "TOK-DUPLICATE-KEY",
      `${duplicates.length} token key(s) declared more than once`,
      [...duplicates, "hint: a token key is unique across primitives, palette and components."],
    );
  }
  return index;
}

/**
 * `{accent}` addresses `accent.DEFAULT` — the key that is simultaneously a leaf and the parent
 * of `accent.strong` (tokens spec 3.2). Returns the key that actually exists, or `undefined`.
 */
export function resolveReferenceTarget(index: TokenIndex, reference: string): string | undefined {
  const key = stripBraces(reference);
  if (index.has(key)) return key;
  const defaulted = `${key}.DEFAULT`;
  return index.has(defaulted) ? defaulted : undefined;
}

export interface ResolutionResult {
  /** Every token key mapped to its fully resolved literal, primitives included. */
  readonly values: ReadonlyMap<string, string>;
  /** The reference graph that produced them (ENT-TOK-003). Build-time only. */
  readonly edges: readonly TokenAlias[];
}

function formatCycle(path: readonly string[]): string {
  return path.join(" → ");
}

/**
 * Resolves every token depth-first, memoising as it goes.
 *
 * `chain` is the active resolution path. Meeting a key already on it is a cycle (AC-3);
 * a chain longer than ten hops overruns the documented depth (AC-2); a reference with no
 * matching key names both ends of the broken edge (AC-4).
 */
export function resolveTokens(index: TokenIndex): ResolutionResult {
  const values = new Map<string, string>();
  const edges: TokenAlias[] = [];

  function resolve(key: string, chain: readonly string[]): string {
    const cached = values.get(key);
    if (cached !== undefined) return cached;

    const cycleStart = chain.indexOf(key);
    if (cycleStart !== -1) {
      const path = [...chain.slice(cycleStart), key];
      throw new TokenBuildError("TOK-CYCLE", "circular token reference detected", [
        formatCycle(path),
        "hint: break the cycle; a token cannot resolve through itself.",
      ]);
    }

    if (chain.length > MAX_REFERENCE_DEPTH) {
      throw new TokenBuildError(
        "TOK-DEPTH",
        `token reference chain exceeds the maximum depth of ${MAX_REFERENCE_DEPTH}`,
        [formatCycle([...chain, key]), "hint: flatten the chain or point at a literal."],
      );
    }

    // `buildTokenIndex` guarantees the key exists: every caller checked before recursing.
    const token = index.get(key) as TokenDefinition;
    const nextChain = [...chain, key];
    const depth = chain.length;

    const resolveEdge = (reference: string): string => {
      const target = resolveReferenceTarget(index, reference);
      if (target === undefined) {
        throw new TokenBuildError("TOK-UNKNOWN-REF", "token reference points at an unknown key", [
          `from: ${key}`,
          `to:   ${stripBraces(reference)}`,
          "hint: check the spelling, or define the missing token.",
        ]);
      }
      const resolvedValue = resolve(target, nextChain);
      edges.push({ from: key, to: target, depth, resolvedValue });
      return resolvedValue;
    };

    let resolved: string;
    if (token.alias !== undefined) {
      resolved = resolveEdge(token.alias);
    } else if (typeof token.value === "number") {
      resolved = String(token.value);
    } else if (typeof token.value === "string") {
      resolved = token.value.replace(/\{([^{}]+)\}/g, (_match, reference: string) =>
        resolveEdge(reference),
      );
    } else {
      throw new TokenBuildError("TOK-VALUE", "token declares neither `value` nor `alias`", [
        `key: ${key}`,
        "hint: a primitive needs a literal `value`; a semantic or component token needs one of the two.",
      ]);
    }

    values.set(key, resolved);
    return resolved;
  }

  for (const key of index.keys()) resolve(key, []);

  return { values, edges };
}
