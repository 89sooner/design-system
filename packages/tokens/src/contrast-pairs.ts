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
 * Six of the seven run states measured on `surface.raised`. `status.neutralEnd` is measured too,
 * but as CP-042 in `badgePairs`, against the marker background it actually renders on. Its former
 * pair was CP-025; CR-035 restored the obligation, not the number, because CP ids are permanent
 * and a report or commit that named CP-025 meant the retired 2.24:1 measurement.
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
  pair(
    "CP-042",
    "status.neutralEnd",
    "badge.marker.background",
    "nonText",
    "CR-035. The second marker variant, measurable again now that the dark end state is " +
      "`slate.400`. New id: CP-025 is permanently retired (tokens spec 8.2, 8.5).",
  ),
];

/** The two disabled fills, checked beneath the label each one carries. */
const disabledPairs: ContrastPair[] = [
  pair("CP-040", "text.muted", "state.disabled", "body"),
  pair("CP-041", "button.policyDisabled.text", "state.disabledPolicy", "body"),
];

/**
 * Chart series colours (CR-036). Each dataviz token is a graphical object fill (WCAG 1.4.11),
 * checked non-text 3:1 against the three surfaces a chart can sit on — `surface.base`,
 * `surface.canvas`, `surface.raised` — in both themes. 25 tokens x 3 surfaces = 75 pairs,
 * CP-043~CP-117. Categorical colours are NOT required to contrast with one another; the
 * consumer repeats series identity through legend, direct labels and a table alternative.
 */
const datavizPairs: ContrastPair[] = [
  pair("CP-043", "dataviz.series.1", "surface.base", "nonText"),
  pair("CP-044", "dataviz.series.1", "surface.canvas", "nonText"),
  pair("CP-045", "dataviz.series.1", "surface.raised", "nonText"),
  pair("CP-046", "dataviz.series.2", "surface.base", "nonText"),
  pair("CP-047", "dataviz.series.2", "surface.canvas", "nonText"),
  pair("CP-048", "dataviz.series.2", "surface.raised", "nonText"),
  pair("CP-049", "dataviz.series.3", "surface.base", "nonText"),
  pair("CP-050", "dataviz.series.3", "surface.canvas", "nonText"),
  pair("CP-051", "dataviz.series.3", "surface.raised", "nonText"),
  pair("CP-052", "dataviz.series.4", "surface.base", "nonText"),
  pair("CP-053", "dataviz.series.4", "surface.canvas", "nonText"),
  pair("CP-054", "dataviz.series.4", "surface.raised", "nonText"),
  pair("CP-055", "dataviz.series.5", "surface.base", "nonText"),
  pair("CP-056", "dataviz.series.5", "surface.canvas", "nonText"),
  pair("CP-057", "dataviz.series.5", "surface.raised", "nonText"),
  pair("CP-058", "dataviz.series.6", "surface.base", "nonText"),
  pair("CP-059", "dataviz.series.6", "surface.canvas", "nonText"),
  pair("CP-060", "dataviz.series.6", "surface.raised", "nonText"),
  pair("CP-061", "dataviz.series.7", "surface.base", "nonText"),
  pair("CP-062", "dataviz.series.7", "surface.canvas", "nonText"),
  pair("CP-063", "dataviz.series.7", "surface.raised", "nonText"),
  pair("CP-064", "dataviz.series.8", "surface.base", "nonText"),
  pair("CP-065", "dataviz.series.8", "surface.canvas", "nonText"),
  pair("CP-066", "dataviz.series.8", "surface.raised", "nonText"),
  pair("CP-067", "dataviz.series.9", "surface.base", "nonText"),
  pair("CP-068", "dataviz.series.9", "surface.canvas", "nonText"),
  pair("CP-069", "dataviz.series.9", "surface.raised", "nonText"),
  pair("CP-070", "dataviz.series.10", "surface.base", "nonText"),
  pair("CP-071", "dataviz.series.10", "surface.canvas", "nonText"),
  pair("CP-072", "dataviz.series.10", "surface.raised", "nonText"),
  pair("CP-073", "dataviz.series.11", "surface.base", "nonText"),
  pair("CP-074", "dataviz.series.11", "surface.canvas", "nonText"),
  pair("CP-075", "dataviz.series.11", "surface.raised", "nonText"),
  pair("CP-076", "dataviz.series.12", "surface.base", "nonText"),
  pair("CP-077", "dataviz.series.12", "surface.canvas", "nonText"),
  pair("CP-078", "dataviz.series.12", "surface.raised", "nonText"),
  pair("CP-079", "dataviz.series.13", "surface.base", "nonText"),
  pair("CP-080", "dataviz.series.13", "surface.canvas", "nonText"),
  pair("CP-081", "dataviz.series.13", "surface.raised", "nonText"),
  pair("CP-082", "dataviz.series.14", "surface.base", "nonText"),
  pair("CP-083", "dataviz.series.14", "surface.canvas", "nonText"),
  pair("CP-084", "dataviz.series.14", "surface.raised", "nonText"),
  pair("CP-085", "dataviz.series.15", "surface.base", "nonText"),
  pair("CP-086", "dataviz.series.15", "surface.canvas", "nonText"),
  pair("CP-087", "dataviz.series.15", "surface.raised", "nonText"),
  pair("CP-088", "dataviz.series.16", "surface.base", "nonText"),
  pair("CP-089", "dataviz.series.16", "surface.canvas", "nonText"),
  pair("CP-090", "dataviz.series.16", "surface.raised", "nonText"),
  pair("CP-091", "dataviz.series.17", "surface.base", "nonText"),
  pair("CP-092", "dataviz.series.17", "surface.canvas", "nonText"),
  pair("CP-093", "dataviz.series.17", "surface.raised", "nonText"),
  pair("CP-094", "dataviz.series.18", "surface.base", "nonText"),
  pair("CP-095", "dataviz.series.18", "surface.canvas", "nonText"),
  pair("CP-096", "dataviz.series.18", "surface.raised", "nonText"),
  pair("CP-097", "dataviz.series.19", "surface.base", "nonText"),
  pair("CP-098", "dataviz.series.19", "surface.canvas", "nonText"),
  pair("CP-099", "dataviz.series.19", "surface.raised", "nonText"),
  pair("CP-100", "dataviz.series.20", "surface.base", "nonText"),
  pair("CP-101", "dataviz.series.20", "surface.canvas", "nonText"),
  pair("CP-102", "dataviz.series.20", "surface.raised", "nonText"),
  pair("CP-103", "dataviz.sequential.1", "surface.base", "nonText"),
  pair("CP-104", "dataviz.sequential.1", "surface.canvas", "nonText"),
  pair("CP-105", "dataviz.sequential.1", "surface.raised", "nonText"),
  pair("CP-106", "dataviz.sequential.2", "surface.base", "nonText"),
  pair("CP-107", "dataviz.sequential.2", "surface.canvas", "nonText"),
  pair("CP-108", "dataviz.sequential.2", "surface.raised", "nonText"),
  pair("CP-109", "dataviz.sequential.3", "surface.base", "nonText"),
  pair("CP-110", "dataviz.sequential.3", "surface.canvas", "nonText"),
  pair("CP-111", "dataviz.sequential.3", "surface.raised", "nonText"),
  pair("CP-112", "dataviz.sequential.4", "surface.base", "nonText"),
  pair("CP-113", "dataviz.sequential.4", "surface.canvas", "nonText"),
  pair("CP-114", "dataviz.sequential.4", "surface.raised", "nonText"),
  pair("CP-115", "dataviz.sequential.5", "surface.base", "nonText"),
  pair("CP-116", "dataviz.sequential.5", "surface.canvas", "nonText"),
  pair("CP-117", "dataviz.sequential.5", "surface.raised", "nonText"),
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
  ...datavizPairs,
];

/** A combination that must never render. `FP-###`, permanent like a `CP-###`. */
export interface ForbiddenPair {
  readonly id: string;
  readonly foreground: string;
  readonly background: string;
  readonly reason: string;
  /**
   * The usages the ban covers. Omitted means every usage (PR #8 review P2).
   *
   * A ban with no qualifier rejects the colours themselves, and that is wider than the SRS
   * says for FP-002: the accent is forbidden as *body* text on the elevated surface, while
   * large-text and non-text use clear their own thresholds there. Banning the pair outright
   * removes a combination the specification permits, and the check then contradicts the
   * document it exists to enforce.
   */
  readonly usages?: readonly ContrastUsage[];
}

/**
 * Two combinations the token documentation forbids in prose. Prose is not a check: a `lint:tokens`
 * rule can only see two custom properties named in one declaration block, so the ban survived only
 * as long as nobody reached the same colours through an alias — `input.placeholder` resolves to
 * `text.faint` and any component token could resolve to `surface.elevated`.
 *
 * Declaring them here puts the ban on the token graph instead of on the text of a stylesheet.
 * `check.ts` resolves both sides through their aliases and fails a declared contrast pair that
 * lands on one, and re-measures each combination so a ban that stopped being true stops being
 * silently carried forward.
 *
 * Refs: FR-THM-005 AC-3 · tokens spec 8.4
 */
export const forbiddenPairs: readonly ForbiddenPair[] = [
  {
    id: "FP-001",
    foreground: "text.faint",
    background: "surface.elevated",
    reason:
      "`text.faint` is `decorative` and may not be painted on this surface — 2.94:1 in dark, " +
      "still short of body 4.5:1 in light (FR-THM-005 AC-3)",
  },
  {
    id: "FP-002",
    foreground: "accent",
    background: "surface.elevated",
    reason:
      "the accent is a body foreground on `surface.base` and `surface.raised` only; on the " +
      "elevated surface it measures 4.40:1 in dark, below body 4.5:1 (tokens spec 8.4)",
    // Body only. 4.40:1 clears both the `large` 3:1 and the `nonText` 3:1 thresholds, and the
    // SRS forbids only body use on this surface.
    usages: ["body"],
  },
];
