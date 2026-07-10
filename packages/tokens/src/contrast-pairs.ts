/**
 * The declared foreground/background pairs `checkContrast` measures (FR-THM-004 AC-1).
 *
 * Transcribed from `conductor_design_system_tokens.md` 8.2. This list is explicit, not derived:
 * the token graph would generate a combinatorial fan-out of pairs that never render together,
 * so only real compositions appear here.
 *
 * **CP IDs are never reused and never renumbered.** CP-025 (`status.neutralEnd` on
 * `surface.raised`) was removed by CR-006 when the token became `decorative`. Pulling the later
 * numbers down would silently repoint every CP reference in an old report, test name or commit
 * message. The gap between CP-024 and CP-026 is the record of that removal (tokens spec 8.2, 8.5).
 *
 * A `decorative` token is never a foreground here (FR-THM-004 exception handling,
 * FR-A11Y-004 AC-3); `check.ts` rejects one if it appears. `decorative` backgrounds are expected —
 * every surface is one.
 *
 * Refs: WP-007 FR-THM-004 FR-THM-005 FR-A11Y-004
 */
import type { TokenUsage } from "./schema";

/** The three measurable classifications. `decorative` is the fourth `TokenUsage` and is excluded. */
export type ContrastUsage = Exclude<TokenUsage, "decorative">;

/** `srs_final.md` 12.1 / NFR-003: body 4.5:1, large text and non-text 3:1. */
export const CONTRAST_THRESHOLDS: Readonly<Record<ContrastUsage, number>> = {
  body: 4.5,
  large: 3,
  nonText: 3,
};

export interface ContrastPair {
  /** `CP-###`, stable for the life of the project. */
  readonly id: string;
  /** Semantic or component token key. `accent` addresses `accent.DEFAULT` (tokens spec 3.2). */
  readonly foreground: string;
  readonly background: string;
  /** Must equal the foreground token's own `usage`; `check.ts` enforces that. */
  readonly usage: ContrastUsage;
  /** Themes this pair renders in. Themes that do not exist yet are skipped, not failed. */
  readonly themes: readonly string[];
  /** Why the declared key differs from the name the spec table uses, where it does. */
  readonly note?: string;
}

const BOTH_THEMES = ["dark", "light"] as const;

function pair(
  id: string,
  foreground: string,
  background: string,
  usage: ContrastUsage,
  note?: string,
): ContrastPair {
  return { id, foreground, background, usage, themes: BOTH_THEMES, ...(note === undefined ? {} : { note }) };
}

/** Text on the three surfaces text actually lands on. */
const textOnSurface: ContrastPair[] = [
  pair("CP-001", "text.primary", "surface.base", "body"),
  pair("CP-002", "text.primary", "surface.raised", "body"),
  pair("CP-003", "text.primary", "surface.elevated", "body"),
  pair("CP-004", "text.secondary", "surface.raised", "body"),
  pair("CP-005", "text.secondary", "surface.elevated", "body"),
  pair("CP-006", "text.muted", "surface.base", "body"),
  pair("CP-007", "text.muted", "surface.elevated", "body"),
  pair("CP-008", "text.monoPayload", "surface.raised", "body"),
];

/**
 * `accent` on `surface.elevated` (dark 4.40) is absent on purpose: body use of that combination
 * is forbidden, and the ban is a lint rule, not a contrast failure (tokens spec 8.4).
 */
const accentPairs: ContrastPair[] = [
  pair("CP-009", "accent", "surface.base", "body"),
  pair("CP-010", "accent", "surface.raised", "body"),
  pair("CP-011", "text.inverse", "accent", "body"),
  pair("CP-012", "accent.strong", "surface.base", "nonText"),
];

/** The two corrections FR-THM-005 forced, measured on all three surfaces they can land on. */
const correctedTokens: ContrastPair[] = [
  pair("CP-013", "focusRing", "surface.base", "nonText"),
  pair("CP-014", "focusRing", "surface.raised", "nonText"),
  pair("CP-015", "focusRing", "surface.elevated", "nonText"),
  pair("CP-016", "border.control", "surface.base", "nonText"),
  pair("CP-017", "border.control", "surface.raised", "nonText"),
  pair("CP-018", "border.control", "surface.elevated", "nonText"),
];

/**
 * Six of the seven run states. `status.neutralEnd` is `decorative` (CR-006, FR-THM-005 AC-6):
 * its former pair was CP-025 and the number stays retired.
 */
const statusPairs: ContrastPair[] = [
  pair("CP-019", "status.running", "surface.raised", "body"),
  pair("CP-020", "status.waiting", "surface.raised", "body"),
  pair("CP-021", "status.success", "surface.raised", "body"),
  pair("CP-022", "status.partial", "surface.raised", "body"),
  pair("CP-023", "status.danger", "surface.raised", "body"),
  pair("CP-024", "status.queued", "surface.raised", "nonText"),
  // CP-025 removed by CR-006. Do not reuse this id.
];

const meterPairs: ContrastPair[] = [
  pair("CP-026", "meter.normal", "surface.raised", "body"),
  pair("CP-027", "meter.warning", "surface.raised", "body"),
  pair("CP-028", "meter.exceeded", "surface.raised", "body"),
];

/** The severity fills are backgrounds only; as a foreground they collapse to 1.69 - 3.38. */
const severityPairs: ContrastPair[] = [
  pair("CP-029", "badge.severity.text", "severity.read", "body"),
  pair("CP-030", "badge.severity.text", "severity.write", "body"),
  pair("CP-031", "badge.severity.text", "severity.destructive", "body"),
  pair("CP-032", "badge.severity.text", "severity.blocked", "body"),
];

/**
 * `StatusBadge`'s two shapes (tokens spec 7.3). The fill shape puts `badge.fill.text` on the five
 * `body` status colours; the marker shape keeps a `surface.raised` background.
 *
 * CP-039's foreground is `status.queued`, not the `badge.marker.dot` the spec table names.
 * `components.ts` deliberately leaves `badge.marker.dot` undefined — the spec lists it as a slot
 * over a set of status tokens (`{status.queued}` or `{status.neutralEnd}`), not as a single value,
 * so WP-013's variant classes supply it. The measured colour is `status.queued` either way, and
 * the `status.neutralEnd` variant is not declared because that token is `decorative`.
 */
const badgePairs: ContrastPair[] = [
  pair("CP-033", "badge.fill.text", "status.running", "body"),
  pair("CP-034", "badge.fill.text", "status.waiting", "body"),
  pair("CP-035", "badge.fill.text", "status.success", "body"),
  pair("CP-036", "badge.fill.text", "status.partial", "body"),
  pair("CP-037", "badge.fill.text", "status.danger", "body"),
  pair("CP-038", "badge.marker.text", "badge.marker.background", "body"),
  pair(
    "CP-039",
    "status.queued",
    "badge.marker.background",
    "nonText",
    "tokens spec 8.2 names the foreground `badge.marker.dot`; that key is a variant slot rather " +
      "than a token, and it resolves to `status.queued` for the only declared variant.",
  ),
];

/** The two disabled fills, checked beneath the label each one carries. */
const disabledPairs: ContrastPair[] = [
  pair("CP-040", "text.muted", "state.disabled", "body"),
  pair("CP-041", "button.policyDisabled.text", "state.disabledPolicy", "body"),
];

export const contrastPairs: readonly ContrastPair[] = [
  ...textOnSurface,
  ...accentPairs,
  ...correctedTokens,
  ...statusPairs,
  ...meterPairs,
  ...severityPairs,
  ...badgePairs,
  ...disabledPairs,
];
