/**
 * Tier-direction checker: primitive ← semantic ← component.
 *
 * The invariant (FR-TOK-002, as corrected by CR-008 / DEV-001): **a token references only its own
 * tier or a lower one.** An upward reference is a build error naming the offending key pair
 * (AC-4). A primitive references nothing (AC-1). A semantic token references primitives or other
 * semantic tokens (AC-2); a component token references semantic or other component tokens (AC-3).
 * A token with no tier is an error too (FR-TOK-002 exception handling).
 *
 * Same-tier references are legal because two Must FRs demand them: FR-THM-001 AC-2 requires the
 * source aliases `surface.2` → `{surface.subtle}` and `border` → `{border.default}` to stay
 * references, and those are semantic → semantic by definition. The tokens spec 2.3 names all four
 * such edges: `surface.2`, `border`, `status.running` → `{accent}`, and
 * `elevation.overlay` → `{border.strong}`.
 *
 * Same-tier cycles are not this checker's problem; FR-TOK-003 AC-3 catches them (CR-008 AC-6).
 *
 * Refs: WP-002 FR-TOK-002 CR-008 DEV-001
 */
import { referencesOf, tierRank } from "../schema";
import type { TokenDefinition, TokenTier } from "../schema";
import { TokenBuildError } from "./errors";
import type { TokenIndex } from "./reference";
import { resolveReferenceTarget } from "./reference";

const VALID_TIERS: readonly TokenTier[] = ["primitive", "semantic", "component"];

export function assertEveryTokenHasATier(tokens: readonly TokenDefinition[]): void {
  const untiered = tokens.filter((token) => !VALID_TIERS.includes(token.tier));
  if (untiered.length === 0) return;

  throw new TokenBuildError(
    "TOK-TIER-MISSING",
    `${untiered.length} token(s) declare no valid tier`,
    [
      ...untiered.map((token) => token.key),
      `hint: every token declares one of ${VALID_TIERS.join(", ")}.`,
    ],
  );
}

/** A violation names both ends of the edge, which is what FR-TOK-002 AC-4 asks to be printed. */
export interface TierViolation {
  readonly from: string;
  readonly fromTier: TokenTier;
  readonly to: string;
  readonly toTier: TokenTier;
  readonly reason: string;
}

export function findTierViolations(index: TokenIndex): TierViolation[] {
  const violations: TierViolation[] = [];

  for (const token of index.values()) {
    for (const reference of referencesOf(token)) {
      const targetKey = resolveReferenceTarget(index, reference);
      // Unknown references are TOK-UNKNOWN-REF's job, not this checker's.
      if (targetKey === undefined) continue;
      const target = index.get(targetKey) as TokenDefinition;

      if (token.tier === "primitive") {
        violations.push({
          from: token.key,
          fromTier: token.tier,
          to: targetKey,
          toTier: target.tier,
          reason: "a primitive token references nothing (AC-1)",
        });
        continue;
      }

      if (tierRank(target.tier) > tierRank(token.tier)) {
        violations.push({
          from: token.key,
          fromTier: token.tier,
          to: targetKey,
          toTier: target.tier,
          reason: `a ${token.tier} token may not reference a ${target.tier} token`,
        });
      }
    }
  }

  return violations;
}

export function assertTierDirection(index: TokenIndex): void {
  const violations = findTierViolations(index);
  if (violations.length === 0) return;

  throw new TokenBuildError(
    "TOK-TIER",
    `${violations.length} reverse token reference(s)`,
    [
      ...violations.map(
        (violation) =>
          `${violation.from} (${violation.fromTier}) -> ${violation.to} (${violation.toTier}): ${violation.reason}`,
      ),
      "hint: references run primitive <- semantic <- component; never upward.",
    ],
  );
}
