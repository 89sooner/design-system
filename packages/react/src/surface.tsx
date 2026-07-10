// FR 범위: FR-CMP-003, FR-CSS-004, FR-A11Y-001
import { forwardRef, useEffect, useRef, type AnchorHTMLAttributes, type HTMLAttributes, type MouseEventHandler, type ReactNode, type Ref } from "react";
import { cx } from "./cx";
import type { Size } from "./types";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  readonly as?: "div" | "button" | "a";
  readonly href?: string;
  readonly onClick?: MouseEventHandler<HTMLElement>;
  readonly size?: Size;
  readonly children: ReactNode;
}

const nestedInteractive = "a,button,input,select,textarea,[role=button]";

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as, children, className, href, onClick, size = "md", ...props },
  forwardedRef,
) {
  const rootRef = useRef<HTMLElement | null>(null);
  const interactive = as === "a" || as === "button" || href !== undefined || onClick !== undefined;
  const element = as ?? (href === undefined ? (onClick === undefined ? "div" : "button") : "a");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && interactive && rootRef.current?.querySelector(nestedInteractive) !== null) {
      console.warn("[conductor] Interactive Card must not contain nested interactive elements.");
    }
  }, [interactive]);

  const setRef = (node: HTMLElement | null) => {
    rootRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef !== null) forwardedRef.current = node;
  };
  const classes = cx("cdt-card", interactive && "cdt-card--interactive", size === "sm" && "cdt-card--sm", className);

  if (element === "a") {
    return <a {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} ref={setRef as Ref<HTMLAnchorElement>} href={href} className={classes}>{children}</a>;
  }
  if (element === "button") {
    return <button {...props} ref={setRef as Ref<HTMLButtonElement>} type="button" onClick={onClick as MouseEventHandler<HTMLButtonElement>} className={classes}>{children}</button>;
  }
  return <div {...props} ref={setRef as Ref<HTMLDivElement>} className={classes}>{children}</div>;
});
Card.displayName = "Card";

export type CardGridProps = HTMLAttributes<HTMLDivElement>;
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(function CardGrid({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx("cdt-card-grid", className)} />;
});
CardGrid.displayName = "CardGrid";

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  readonly as?: "div" | "section" | "aside";
  readonly size?: Size;
}
export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel({ as = "div", className, size = "md", ...props }, ref) {
  const classes = cx("cdt-panel", size === "sm" && "cdt-panel--sm", className);
  if (as === "section") return <section {...props} ref={ref as Ref<HTMLElement>} className={classes} />;
  if (as === "aside") return <aside {...props} ref={ref as Ref<HTMLElement>} className={classes} />;
  return <div {...props} ref={ref as Ref<HTMLDivElement>} className={classes} />;
});
Panel.displayName = "Panel";
