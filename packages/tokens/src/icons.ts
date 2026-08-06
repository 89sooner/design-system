/**
 * The canonical icon name of every run state and severity (FR-TOK-005 AC-5).
 *
 * The names already live on the tokens, as the `icon` metadata field, and reach consumers through
 * `tokens.json`. What did not reach them was a *typed* map: reading `tokens.json` gives
 * `Record<string, string>`, so every consumer rebuilt the same `running → loader` table by hand and
 * each copy could drift from the token source independently.
 *
 * Published as literal `as const` maps rather than derived from the palette at runtime, because the
 * literal types are the point — `STATUS_ICONS[status]` narrows to one name, and a status added to
 * `FR-TOK-005`'s seven without a name here is a type error. `icons.test.ts` binds the two together
 * so the hand-written map cannot disagree with the token metadata it mirrors.
 *
 * Conductor bundles no icon set (ADR-004 delegates behaviour to Radix; icons stay a consumer
 * concern), so these are names, not components. Resolving a name to a `lucide-react` component is
 * the consumer's step; `lucide-react` remains a peer dependency of `@conductor-by-89soone/react`.
 *
 * Refs: WP-005 FR-TOK-005 FR-CMP-004 FR-A11Y-003
 */

/** The seven run states of FR-TOK-005 AC-1, in the order `srs_final.md` lists them. */
export const STATUS_ICONS = {
  queued: "circle-dashed",
  running: "loader",
  waiting: "pause-circle",
  success: "check-circle-2",
  partial: "alert-circle",
  danger: "x-circle",
  neutralEnd: "circle-slash",
} as const;

/** The four severities of FR-TOK-005 AC-2. */
export const SEVERITY_ICONS = {
  read: "eye",
  write: "pencil",
  destructive: "trash-2",
  blocked: "shield-x",
} as const;

export type StatusIconName = (typeof STATUS_ICONS)[keyof typeof STATUS_ICONS];
export type SeverityIconName = (typeof SEVERITY_ICONS)[keyof typeof SEVERITY_ICONS];
