/**
 * The published icon maps mirror token metadata. A mirror that can drift is worse than no mirror,
 * so this binds the two: every status and severity token's `icon` field must equal the map entry,
 * in both directions and with no extras on either side.
 *
 * Refs: WP-005 FR-TOK-005 FR-CMP-004
 */
import { describe, expect, test } from "vitest";
import { SEVERITY_ICONS, STATUS_ICONS } from "./icons";
import { FIXED_GROUP_SIZES, groupKeyOf } from "./schema";
import { canonicalTokens } from "./token-source";

const tokens = canonicalTokens();

function iconsOfGroup(group: string): Record<string, string> {
  return Object.fromEntries(
    tokens
      .filter((token) => groupKeyOf(token.key) === group && token.icon !== undefined)
      .map((token) => [token.key.slice(group.length + 1), token.icon as string]),
  );
}

describe("FR-TOK-005 AC-5: the published icon maps mirror the token metadata", () => {
  test("FR-TOK-005 AC-5: STATUS_ICONS equals the `icon` field of every status token", () => {
    expect(STATUS_ICONS).toEqual(iconsOfGroup("status"));
  });

  test("FR-TOK-005 AC-5: SEVERITY_ICONS equals the `icon` field of every severity token", () => {
    expect(SEVERITY_ICONS).toEqual(iconsOfGroup("severity"));
  });

  test("FR-TOK-005 AC-1, AC-2: the maps hold exactly the fixed group sizes, so none can be skipped", () => {
    expect(Object.keys(STATUS_ICONS)).toHaveLength(FIXED_GROUP_SIZES.status as number);
    expect(Object.keys(SEVERITY_ICONS)).toHaveLength(FIXED_GROUP_SIZES.severity as number);
  });

  test("FR-TOK-005 AC-5: every name is a non-empty kebab-case lucide identifier", () => {
    for (const name of [...Object.values(STATUS_ICONS), ...Object.values(SEVERITY_ICONS)]) {
      expect(name).toMatch(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
    }
  });
});
