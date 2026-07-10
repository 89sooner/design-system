/**
 * Source invariants that hold before anything is resolved or emitted.
 *
 * Refs: WP-002 FR-TOK-005 · WP-005 FR-TOK-008
 */
import {
  FIXED_GROUP_SIZES,
  ICON_REQUIRED_GROUPS,
  groupKeyOf,
} from "../schema";
import type { TokenDefinition, TokenGroup, TokenTier } from "../schema";
import { TokenBuildError } from "./errors";

/** ENT-TOK-002. Derived from the first key segment; never hand-edited. */
export function buildTokenGroups(tokens: readonly TokenDefinition[]): TokenGroup[] {
  const groups = new Map<string, { tier: TokenTier; memberKeys: string[] }>();

  for (const token of tokens) {
    const groupKey = groupKeyOf(token.key);
    const group = groups.get(groupKey);
    if (group) group.memberKeys.push(token.key);
    else groups.set(groupKey, { tier: token.tier, memberKeys: [token.key] });
  }

  return [...groups.entries()].map(([groupKey, group], order) => ({
    groupKey,
    tier: group.tier,
    memberKeys: group.memberKeys,
    order,
  }));
}

/**
 * FR-TOK-005 AC-1 to AC-3. The run-state, severity and meter families have fixed sizes,
 * so adding an eighth status is a build error rather than a silent surprise downstream.
 */
export function assertGroupSizes(tokens: readonly TokenDefinition[]): void {
  const groups = new Map(buildTokenGroups(tokens).map((group) => [group.groupKey, group]));
  const problems: string[] = [];

  for (const [groupKey, expected] of Object.entries(FIXED_GROUP_SIZES)) {
    const actual = groups.get(groupKey)?.memberKeys.length ?? 0;
    if (actual !== expected) problems.push(`${groupKey}: expected ${expected} members, found ${actual}`);
  }

  if (problems.length === 0) return;
  throw new TokenBuildError("TOK-GROUP-SIZE", `${problems.length} token group(s) of the wrong size`, [
    ...problems,
    "hint: FR-TOK-005 fixes these counts; changing one needs a change request.",
  ]);
}

/**
 * FR-TOK-005 AC-5 / ENT-TOK-001 invariant 6: colour never carries a run state or a severity on
 * its own, so each of those tokens names the `lucide-react` icon that must accompany it.
 * Meter tokens are outside this rule — neither the SRS nor the token spec assigns them an icon.
 */
export function assertIconMetadata(tokens: readonly TokenDefinition[]): void {
  const missing = tokens
    .filter((token) => (ICON_REQUIRED_GROUPS as readonly string[]).includes(groupKeyOf(token.key)))
    .filter((token) => token.icon === undefined || token.icon.trim() === "")
    .map((token) => token.key);

  if (missing.length === 0) return;
  throw new TokenBuildError("TOK-ICON", `${missing.length} token(s) missing \`icon\` metadata`, [
    ...missing,
    `hint: every ${ICON_REQUIRED_GROUPS.join(" and ")} token names a non-empty icon.`,
  ]);
}

/** `usage` decides whether `checkContrast` looks at a token, so it is never left implicit. */
export function assertUsageMetadata(tokens: readonly TokenDefinition[]): void {
  const missing = tokens.filter((token) => token.usage === undefined).map((token) => token.key);
  if (missing.length === 0) return;

  throw new TokenBuildError("TOK-USAGE", `${missing.length} token(s) missing \`usage\` metadata`, [
    ...missing,
    "hint: classify as body, large, nonText or decorative (`srs_final.md` 12.1).",
  ]);
}

/** FR-TOK-008 AC-3: two stacking layers must never resolve to the same number. */
export function assertDistinctZLayers(values: ReadonlyMap<string, string>): void {
  const byValue = new Map<string, string[]>();

  for (const [key, value] of values) {
    if (groupKeyOf(key) !== "z") continue;
    const keys = byValue.get(value);
    if (keys) keys.push(key);
    else byValue.set(value, [key]);
  }

  const duplicates = [...byValue.entries()].filter(([, keys]) => keys.length > 1);
  if (duplicates.length === 0) return;

  throw new TokenBuildError(
    "TOK-Z-DUPLICATE",
    `${duplicates.length} stacking value(s) shared by more than one \`z\` layer`,
    [
      ...duplicates.map(([layerValue, keys]) => `${layerValue} <- ${keys.join(", ")}`),
      "hint: two layers with the same z-index have an undefined paint order.",
    ],
  );
}
