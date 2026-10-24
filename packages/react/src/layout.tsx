// FR-CMP-017 · CR-076: the layout primitives every screen repeats. Spacing and placement come only from
// space-token steps, as `cdt-*` modifier classes, so the same markup reproduces them without React
// (FR-CSS-004 AC-3). No hooks: these render on the server as they are.
import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "./cx";

/** A step of the space scale, `space.1` (4px) to `space.8` (48px). */
export type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  readonly orientation?: "horizontal" | "vertical";
  /** A purely visual rule, hidden from assistive technology. Leave it off when the rule divides content. */
  readonly decorative?: boolean;
}

/** A native `<hr>`, whose implicit role is `separator`; nothing is hand-rolled. */
export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(function Separator({ className, decorative = false, orientation = "horizontal", ...props }, ref) {
  return (
    <hr
      {...props}
      ref={ref}
      aria-orientation={decorative || orientation === "horizontal" ? undefined : "vertical"}
      aria-hidden={decorative || undefined}
      className={cx("cdt-separator", orientation === "vertical" && "cdt-separator--vertical", className)}
    />
  );
});
Separator.displayName = "Separator";

type LayoutElement = "div" | "section" | "ul" | "ol" | "nav" | "header" | "footer";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** `column` (default) stacks top to bottom; `row` lays out along the inline axis. */
  readonly direction?: "column" | "row";
  /** Gap between children as a space step. Defaults to 3 (12px). */
  readonly gap?: SpaceStep;
  readonly align?: "start" | "center" | "end" | "stretch" | "baseline";
  readonly justify?: "start" | "center" | "end" | "between";
  /** Let a row wrap onto more lines when it runs out of room. */
  readonly wrap?: boolean;
  readonly as?: LayoutElement;
}

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack({ align, as: Element = "div", className, direction = "column", gap = 3, justify, wrap = false, ...props }, ref) {
  return (
    <Element
      {...props}
      ref={ref as never}
      className={cx(
        "cdt-stack",
        direction === "row" && "cdt-stack--row",
        `cdt-stack--gap-${gap}`,
        align && `cdt-stack--align-${align}`,
        justify && `cdt-stack--justify-${justify}`,
        wrap && "cdt-stack--wrap",
        className,
      )}
    />
  );
});
Stack.displayName = "Stack";

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /**
   * A fixed number of equal columns, which collapse to one column below the `md` breakpoint.
   * Leave it out for as many columns as fit at the card grid's minimum column width.
   */
  readonly columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Gap between cells as a space step. Defaults to 5 (24px), the card grid's gap. */
  readonly gap?: SpaceStep;
  readonly as?: LayoutElement;
}

export const Grid = forwardRef<HTMLElement, GridProps>(function Grid({ as: Element = "div", className, columns, gap = 5, ...props }, ref) {
  return <Element {...props} ref={ref as never} className={cx("cdt-grid", columns !== undefined && `cdt-grid--cols-${columns}`, `cdt-grid--gap-${gap}`, className)} />;
});
Grid.displayName = "Grid";
