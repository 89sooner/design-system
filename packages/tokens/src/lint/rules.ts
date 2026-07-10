/**
 * The literal rules `pnpm lint:tokens` enforces on `packages/css` and `packages/react`
 * (FR-TOK-001 AC-1 to AC-3, FR-TOK-008 AC-2, FR-THM-005 AC-3).
 *
 * Everything here reads a masked copy of the file, so comment prose never triggers a rule.
 * Offsets are into the original text and translate back to exact line and column numbers.
 *
 * Two rules are deliberately narrower than they look:
 *
 *  - `px-literal` skips a `@media` prelude. FR-TOK-001 AC-2 excludes the breakpoint substitution
 *    output by name, and a media query condition cannot read a custom property (FR-TOK-009 AC-2),
 *    so a literal is the only thing that can appear there.
 *
 *  - `text-faint-on-elevated` sees one declaration block at a time. It catches the case
 *    FR-THM-005 AC-3 describes — `--cdt-text-faint` painted over `--cdt-surface-elevated` — when
 *    both custom properties are named in the same block. It cannot follow a component token to the
 *    semantic token behind it (`--cdt-input-placeholder` resolves to `text.faint`), nor can it see
 *    a background inherited from an ancestor selector in another file. Those are the limits of a
 *    static scan; the token graph, not the linter, is what makes the forbidden combination
 *    unreachable in the one place it exists today (`input.background` is `surface.base`).
 *
 * Refs: WP-006 WP-007 FR-TOK-001 FR-TOK-008 FR-THM-005
 */
import { maskComments } from "./source";

export type RuleId =
  | "color-literal"
  | "px-literal"
  | "ms-literal"
  | "z-index-literal"
  | "font-size-px"
  | "text-faint-on-elevated";

export interface Violation {
  readonly file: string;
  /** 1-based. */
  readonly line: number;
  /** 1-based. */
  readonly column: number;
  readonly rule: RuleId;
  readonly message: string;
  readonly snippet: string;
}

interface Match {
  readonly index: number;
  readonly length: number;
  readonly rule: RuleId;
  readonly message: string;
  readonly snippet: string;
}

const HEX_COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/gi;
const FUNCTIONAL_COLOR = /\b(?:rgba?|hsla?)\([^)]*\)/gi;
// The lookbehind excludes an identifier or hex digit, but not `-`: `translateY(-2px)` must be
// caught, and no `--cdt-` custom property name ends in a number followed by `px`.
const PX_LITERAL = /(?<![\w#.])(\d+(?:\.\d+)?)px\b/g;
const MS_LITERAL = /(?<![\w#.])(\d+(?:\.\d+)?)ms\b/g;
const Z_INDEX = /\b(?:z-index|zIndex)\s*:\s*["'`]?\s*(-?\d+)/g;
const FONT_SIZE_PX = /\b(?:font-size|fontSize)\s*:\s*["'`]?\s*(\d+(?:\.\d+)?px)/g;
const MEDIA_PRELUDE = /@media[^{;]*/g;
const DECLARATION_BLOCK = /\{[^{}]*\}/g;

const TEXT_FAINT = "--cdt-text-faint";
const SURFACE_ELEVATED = "--cdt-surface-elevated";

function matchesOf(
  masked: string,
  pattern: RegExp,
  rule: RuleId,
  message: (captured: string) => string,
): Match[] {
  return [...masked.matchAll(pattern)].map((match) => {
    const whole = match[0] as string;
    return {
      index: match.index,
      length: whole.length,
      rule,
      message: message(match[1] ?? whole),
      snippet: whole,
    };
  });
}

/** Character ranges a `@media` condition occupies; a px literal inside one is expected. */
function mediaRanges(masked: string): [number, number][] {
  return [...masked.matchAll(MEDIA_PRELUDE)].map((match) => [
    match.index,
    match.index + (match[0] as string).length,
  ]);
}

const within = (ranges: readonly [number, number][], index: number): boolean =>
  ranges.some(([start, end]) => index >= start && index < end);

function colorMatches(masked: string): Match[] {
  return [
    ...matchesOf(
      masked,
      FUNCTIONAL_COLOR,
      "color-literal",
      (captured) => `colour literal \`${captured}\``,
    ),
    ...matchesOf(masked, HEX_COLOR, "color-literal", (captured) => `colour literal \`${captured}\``),
  ];
}

/**
 * `font-size: 13px` is a px literal and a font-size literal at once. Only the specific rule fires,
 * so a single mistake is reported once, under the name that says what to do about it.
 */
function sizeMatches(masked: string): Match[] {
  const fontSizes = matchesOf(
    masked,
    FONT_SIZE_PX,
    "font-size-px",
    (captured) => `\`font-size\` literal \`${captured}\`; use a \`--cdt-font-size-*\` token`,
  );
  const covered = fontSizes.map((match): [number, number] => [match.index, match.index + match.length]);
  const media = mediaRanges(masked);

  const pixels = matchesOf(
    masked,
    PX_LITERAL,
    "px-literal",
    (captured) => `px literal \`${captured}px\`; use a spacing, radius or size token`,
  ).filter((match) => !within(covered, match.index) && !within(media, match.index));

  return [...fontSizes, ...pixels];
}

/** FR-THM-005 AC-3, within the reach of a static scan. See the module comment. */
function faintOnElevatedMatches(masked: string): Match[] {
  const violations: Match[] = [];

  for (const block of masked.matchAll(DECLARATION_BLOCK)) {
    const body = block[0] as string;
    const declarations = body.split(/[;\n]/);

    const paintsFaintText = declarations.some(
      (declaration) => /(?:^|[\s{,"'`])(?:color|Color)\s*:/.test(declaration) && declaration.includes(TEXT_FAINT),
    );
    const paintsElevatedBackground = declarations.some(
      (declaration) =>
        /(?:^|[\s{,"'`])(?:background|background-color|backgroundColor)\s*:/.test(declaration) &&
        declaration.includes(SURFACE_ELEVATED),
    );
    if (!paintsFaintText || !paintsElevatedBackground) continue;

    const offset = body.indexOf(TEXT_FAINT);
    violations.push({
      index: block.index + offset,
      length: TEXT_FAINT.length,
      rule: "text-faint-on-elevated",
      message:
        `\`${TEXT_FAINT}\` is painted on \`${SURFACE_ELEVATED}\` (2.94:1). ` +
        "`text.faint` is `decorative` and forbidden on that surface (FR-THM-005 AC-3)",
      snippet: TEXT_FAINT,
    });
  }
  return violations;
}

function zIndexMatches(masked: string): Match[] {
  return matchesOf(
    masked,
    Z_INDEX,
    "z-index-literal",
    (captured) => `numeric \`z-index\` \`${captured}\`; use a \`--cdt-z-*\` token (FR-TOK-008 AC-2)`,
  );
}

function positionOf(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  const column = index - (before.lastIndexOf("\n") + 1) + 1;
  return { line, column };
}

/** Every violation in one file, sorted by position. `file` is used verbatim in the output. */
export function lintSource(file: string, text: string): Violation[] {
  const masked = maskComments(text);

  const matches = [
    ...colorMatches(masked),
    ...sizeMatches(masked),
    ...matchesOf(
      masked,
      MS_LITERAL,
      "ms-literal",
      (captured) => `ms literal \`${captured}ms\`; use a \`--cdt-motion-*\` token`,
    ),
    ...zIndexMatches(masked),
    ...faintOnElevatedMatches(masked),
  ];

  return matches
    .map(({ index, rule, message, snippet }) => ({ ...positionOf(text, index), file, rule, message, snippet }))
    .sort((one, other) => one.line - other.line || one.column - other.column || one.rule.localeCompare(other.rule));
}
