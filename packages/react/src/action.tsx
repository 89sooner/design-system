// FR 범위: FR-CMP-002, FR-A11Y-001, FR-A11Y-005
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx";
import { Spinner } from "./feedback";
import type { Size } from "./types";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonTone = "neutral" | "accent" | "danger";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  readonly variant?: ButtonVariant;
  readonly tone?: ButtonTone;
  readonly size?: Size;
  readonly loading?: boolean;
  readonly blockedReason?: string;
  readonly iconStart?: ReactNode;
  readonly iconEnd?: ReactNode;
  readonly children: ReactNode;
}

function buttonClasses({ variant = "secondary", tone = "neutral", size = "md", blockedReason, className }: ButtonProps): string {
  return cx(
    "cdt-btn",
    `cdt-btn--${variant}`,
    `cdt-btn--tone-${tone}`,
    size === "sm" && "cdt-btn--sm",
    blockedReason !== undefined && "cdt-btn--blocked",
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { blockedReason, className, disabled, iconEnd, iconStart, loading = false, onClick, title, variant, tone, size, children, ...props },
  ref,
) {
  const isBlocked = blockedReason !== undefined;
  const isDisabled = disabled || isBlocked;
  return (
    <button
      {...props}
      ref={ref}
      className={buttonClasses({ variant, tone, size, blockedReason, className, children })}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      title={isBlocked ? blockedReason : title}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
    >
      {/*
        `aria-busy` alone is a screen-reader-only signal; a sighted user saw nothing change.
        The spinner replaces `iconStart` rather than joining it so the label does not shift,
        and stays `aria-hidden` because `aria-busy` on the button already carries the state.
      */}
      {loading ? (
        <Spinner size="sm" label="" aria-hidden="true" />
      ) : iconStart === undefined ? null : (
        <span aria-hidden="true">{iconStart}</span>
      )}
      {children}
      {iconEnd === undefined ? null : <span aria-hidden="true">{iconEnd}</span>}
    </button>
  );
});
Button.displayName = "Button";

export interface IconButtonProps extends Omit<ButtonProps, "children" | "aria-label" | "iconEnd" | "iconStart"> {
  readonly "aria-label": string;
  readonly icon: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ icon, size, ...props }, ref) {
  return (
    <Button {...props} ref={ref} size={size} className={cx("cdt-btn--icon", props.className)}>
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
});
IconButton.displayName = "IconButton";
