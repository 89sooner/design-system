// FR-CMP-017 · CR-076: headings and text on the type scale. A heading's level is document structure and its
// size is appearance, so a section can keep an `h2` and still be drawn small. No hooks: server-safe.
import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "./cx";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
/** `page` (h1), `section` (h2) and `sub` (h3) are the document heading sizes; `minor` is `font.size.lg`. */
export type HeadingSize = "page" | "section" | "sub" | "minor";

const SIZE_FOR_LEVEL: Record<HeadingLevel, HeadingSize> = { 1: "page", 2: "section", 3: "sub", 4: "minor", 5: "minor", 6: "minor" };

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly level: HeadingLevel;
  /** Defaults to the size of the level. */
  readonly size?: HeadingSize;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading({ className, level, size, ...props }, ref) {
  const Element = `h${level}` as const;
  return <Element {...props} ref={ref} className={cx("cdt-heading", `cdt-heading--${size ?? SIZE_FOR_LEVEL[level]}`, className)} />;
});
Heading.displayName = "Heading";

/** A step of the font-size scale. */
export type TextSize = "2xs" | "xs" | "sm" | "base" | "md" | "lg" | "xl";
export type TextTone = "primary" | "secondary" | "muted" | "faint";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Defaults to `base`. */
  readonly size?: TextSize;
  readonly weight?: "regular" | "medium" | "semibold";
  /** Defaults to `primary`. `faint` is decorative only: it does not reach 4.5:1 for body text (srs §12.1). */
  readonly tone?: TextTone;
  /** Draws the text in the monospaced face, which reads left to right in every document. */
  readonly mono?: boolean;
  readonly as?: "p" | "span" | "div";
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text({ as: Element = "p", className, mono = false, size = "base", tone = "primary", weight = "regular", ...props }, ref) {
  return (
    <Element
      {...props}
      ref={ref as never}
      className={cx("cdt-text", `cdt-text--${size}`, `cdt-text--${tone}`, weight !== "regular" && `cdt-text--${weight}`, mono && "cdt-mono", className)}
    />
  );
});
Text.displayName = "Text";
