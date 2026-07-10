/**
 * Breakpoint literal substitution for `@media` conditions.
 *
 * A CSS custom property does not evaluate inside a media query condition (SRS 5.2 constraint 3),
 * so `@media (max-width: var(--cdt-breakpoint-md))` silently never matches. The token build
 * rewrites those conditions to literal pixels, and the checker keeps a regression from shipping
 * (FR-TOK-009 AC-2).
 *
 * Refs: WP-005 FR-TOK-009
 */
import { BREAKPOINT_PX } from "../scales";
import { TokenBuildError } from "./errors";
import { cssPropertyName } from "./names";

export type BreakpointName = keyof typeof BREAKPOINT_PX;

const BREAKPOINT_NAMES = Object.keys(BREAKPOINT_PX) as BreakpointName[];

/**
 * Matches the condition part of `@media <prelude> {`.
 *
 * The prelude may itself contain a `{breakpoint.sm}` reference, so a naive `[^{]*` would stop at
 * the reference's own brace. Each alternation step consumes either a non-brace character or a
 * whole `{...}` group, leaving the block-opening brace to close the match.
 */
const MEDIA_PRELUDE = /@media((?:[^{]|\{[^{}]*\})*)\{/g;

const BREAKPOINT_VAR = /var\(\s*--cdt-breakpoint-([a-z]+)\s*\)/g;
const BREAKPOINT_REF = /\{\s*breakpoint\.([a-z]+)\s*\}/g;

function literalFor(name: string): string | undefined {
  return BREAKPOINT_NAMES.includes(name as BreakpointName)
    ? `${BREAKPOINT_PX[name as BreakpointName]}px`
    : undefined;
}

function substitutePrelude(prelude: string): string {
  return prelude
    .replace(BREAKPOINT_VAR, (match, name: string) => literalFor(name) ?? match)
    .replace(BREAKPOINT_REF, (match, name: string) => literalFor(name) ?? match);
}

/** Rewrites `var(--cdt-breakpoint-md)` and `{breakpoint.md}` inside `@media` conditions to `800px`. */
export function substituteBreakpoints(css: string): string {
  return css.replace(MEDIA_PRELUDE, (_match, prelude: string) => `@media${substitutePrelude(prelude)}{`);
}

/** Every `@media` condition still carrying a breakpoint custom property. */
export function findBreakpointVarsInMedia(css: string): string[] {
  const offenders: string[] = [];
  for (const [, prelude] of css.matchAll(MEDIA_PRELUDE)) {
    const condition = prelude as string;
    if (/var\(\s*--cdt-breakpoint-/.test(condition)) offenders.push(`@media${condition.trimEnd()}`);
  }
  return offenders;
}

export function assertNoBreakpointVarsInMedia(css: string): void {
  const offenders = findBreakpointVarsInMedia(css);
  if (offenders.length === 0) return;

  throw new TokenBuildError(
    "TOK-MEDIA-VAR",
    `${offenders.length} \`@media\` condition(s) reference a breakpoint custom property`,
    [
      ...offenders,
      `hint: custom properties do not evaluate in media conditions; ${cssPropertyName(
        "breakpoint.md",
      )} must be substituted as a literal.`,
    ],
  );
}

/** FR-TOK-009 AC-3. The numbers `breakpoints` exposes to JS. */
export const breakpointPixels: Readonly<Record<BreakpointName, number>> = BREAKPOINT_PX;
