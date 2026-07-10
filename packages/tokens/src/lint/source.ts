/**
 * Turning a source file into something the literal rules can scan.
 *
 * Two jobs, and they run in this order because the second destroys what the first reads:
 *
 *  1. **Collect allow comments.** A comment whose body is `cdt-allow-literal: <reason>` is read
 *     from the raw text with its line number. Both the CSS block form and the `//` line form are
 *     recognised, because a `.ts` file writes comments the second way. FR-TOK-001's exception
 *     handling puts the comment at the top of the file, so a comment in the leading block exempts
 *     the whole file; a comment on or directly above a violation exempts that one line. The
 *     narrower form is a refinement, not a replacement — `--report` lists both.
 *
 *  2. **Mask comments.** Comment bodies are replaced with spaces so a doc comment quoting
 *     `#6d7cff` or `40px` is not a violation, while every character keeps its original offset and
 *     line and column numbers stay exact.
 *
 * Refs: WP-006 FR-TOK-001
 */

export type AllowanceScope = "file" | "line";

export interface Allowance {
  readonly file: string;
  /** 1-based line the comment sits on. */
  readonly line: number;
  readonly scope: AllowanceScope;
  readonly reason: string;
}

const ALLOW_DIRECTIVE = "cdt-allow-literal";

const ALLOW_PATTERN = new RegExp(`(?:/\\*|//)\\s*${ALLOW_DIRECTIVE}\\s*:\\s*([^*\\n]*?)\\s*(?:\\*/|$)`);

const BLOCK_COMMENT_END = "*/";

/** Replaces every character in `[start, end)` with a space, keeping newlines where they were. */
function blank(characters: string[], start: number, end: number): void {
  for (let index = start; index < end; index += 1) {
    if (characters[index] !== "\n") characters[index] = " ";
  }
}

/**
 * Blanks block and line comments, leaving string literals alone so that a URL's `//` and a colour
 * inside a template string are both handled correctly. Indices are UTF-16 units, matching
 * `String.prototype.indexOf`, so a non-ASCII comment cannot shift the mask.
 */
export function maskComments(text: string): string {
  const characters = text.split("");
  let index = 0;
  let quote: string | undefined;

  while (index < characters.length) {
    const character = characters[index] as string;
    const next = characters[index + 1];

    if (quote !== undefined) {
      if (character === "\\") index += 2;
      else {
        if (character === quote) quote = undefined;
        index += 1;
      }
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      index += 1;
      continue;
    }

    if (character === "/" && next === "*") {
      const end = text.indexOf(BLOCK_COMMENT_END, index + 2);
      const stop = end === -1 ? characters.length : end + BLOCK_COMMENT_END.length;
      blank(characters, index, stop);
      index = stop;
      continue;
    }

    if (character === "/" && next === "/") {
      let end = index;
      while (end < characters.length && characters[end] !== "\n") end += 1;
      blank(characters, index, end);
      index = end;
      continue;
    }

    index += 1;
  }

  return characters.join("");
}

/** Index of the first line holding code. Allow comments above it grant file scope. */
function headerEndLine(masked: string): number {
  const lines = masked.split("\n");
  for (const [index, line] of lines.entries()) {
    if (line.trim() !== "") return index;
  }
  return lines.length;
}

/**
 * Every allow comment in the file, whether or not it suppresses anything. A stale allowance stays
 * visible in `--report`, which is most of the point of the flag.
 */
export function findAllowances(file: string, text: string): Allowance[] {
  const header = headerEndLine(maskComments(text));

  return text.split("\n").flatMap((line, index) => {
    const match = ALLOW_PATTERN.exec(line);
    if (!match) return [];
    const reason = (match[1] as string).trim();
    return [
      {
        file,
        line: index + 1,
        scope: index < header ? ("file" as const) : ("line" as const),
        reason: reason === "" ? "(no reason given)" : reason,
      },
    ];
  });
}

/** A violation is allowed by a file-scope comment, or by one on or directly above its line. */
export function isAllowed(allowances: readonly Allowance[], line: number): boolean {
  return allowances.some(
    (allowance) =>
      allowance.scope === "file" || allowance.line === line || allowance.line === line - 1,
  );
}
