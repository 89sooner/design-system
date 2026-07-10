/**
 * Static schema shared by the token source and every build artifact.
 *
 * Mirrors `docs/30_technical_architecture/conductor_data_model.md`:
 * ENT-TOK-001 `TokenDefinition`, ENT-TOK-002 `TokenGroup`, ENT-TOK-003 `TokenAlias`.
 *
 * Refs: WP-002 FR-TOK-001 FR-TOK-002
 */

/** primitive ← semantic ← component. References may only point at the same tier or a lower one. */
export type TokenTier = "primitive" | "semantic" | "component";

/**
 * Contrast classification (`srs_final.md` 12.1, tokens spec 5.1).
 * `body` 4.5:1 · `large` 3:1 · `nonText` 3:1 · `decorative` excluded from `checkContrast`.
 */
export type TokenUsage = "body" | "large" | "nonText" | "decorative";

/** ENT-TOK-001. A token carries either a literal `value` or an `alias` to another token key. */
export interface TokenDefinition {
  /** Dot-notation key, e.g. `surface.raised`. Unique across the whole source. */
  readonly key: string;
  readonly tier: TokenTier;
  /** Literal value. May embed `{other.key}` references, as `elevation.overlay` does. */
  readonly value?: string | number;
  /** Whole-value reference to another token key, stored bare (no braces). */
  readonly alias?: string;
  readonly usage?: TokenUsage;
  readonly description: string;
  /** Excludes the key from the FR-QA-001 cross-theme symmetry check. */
  readonly themeSpecific?: boolean;
  /** `lucide-react` icon name. Required and non-empty on `status.*` and `severity.*`. */
  readonly icon?: string;
}

/** ENT-TOK-002. Derived from the first segment of each key; never hand-edited. */
export interface TokenGroup {
  readonly groupKey: string;
  readonly tier: TokenTier;
  readonly memberKeys: readonly string[];
  readonly order: number;
}

/** ENT-TOK-003. A build-time edge of the reference graph; never serialized to an artifact. */
export interface TokenAlias {
  readonly from: string;
  readonly to: string;
  readonly depth: number;
  readonly resolvedValue?: string;
}

/** FR-TOK-003 AC-2. A reference chain deeper than this fails the build. */
export const MAX_REFERENCE_DEPTH = 10;

/**
 * Segment that lets a key be both a leaf and a parent (tokens spec 3.2).
 * `accent.DEFAULT` emits `--cdt-accent` and reads as `tokens.accent.DEFAULT`.
 */
export const DEFAULT_SEGMENT = "DEFAULT";

const REFERENCE_PATTERN = /\{([^{}]+)\}/g;

/** Every `{token.key}` occurrence inside a literal value, in source order. */
export function extractReferences(value: string): string[] {
  return [...value.matchAll(REFERENCE_PATTERN)].map((match) => match[1] as string);
}

/** Strips the braces from `{surface.subtle}`; returns bare keys unchanged. */
export function stripBraces(reference: string): string {
  const trimmed = reference.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}") ? trimmed.slice(1, -1).trim() : trimmed;
}

/** Every key a token points at, whether through `alias` or an embedded reference. */
export function referencesOf(token: TokenDefinition): string[] {
  if (token.alias !== undefined) return [stripBraces(token.alias)];
  return typeof token.value === "string" ? extractReferences(token.value) : [];
}

const TIER_RANK: Readonly<Record<TokenTier, number>> = {
  primitive: 0,
  semantic: 1,
  component: 2,
};

export function tierRank(tier: TokenTier): number {
  return TIER_RANK[tier];
}

/** Groups the status/severity/meter families whose member counts FR-TOK-005 fixes. */
export const FIXED_GROUP_SIZES: Readonly<Record<string, number>> = {
  status: 7,
  severity: 4,
  meter: 3,
};

/** ENT-TOK-001 invariant 6: these families must carry a non-empty `icon`. */
export const ICON_REQUIRED_GROUPS = ["status", "severity"] as const;

export function groupKeyOf(key: string): string {
  const [head] = key.split(".");
  return head as string;
}
