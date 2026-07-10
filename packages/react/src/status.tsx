// FR 범위: FR-CMP-004, FR-A11Y-003, FR-TOK-005
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx";
import type { Tone } from "./types";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: Tone;
  readonly icon?: ReactNode;
  readonly children: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, className, icon, tone = "neutral", ...props },
  ref,
) {
  return (
    <span {...props} ref={ref} className={cx("cdt-badge", `cdt-badge--${tone}`, className)}>
      {icon === undefined ? null : <span className="cdt-badge__icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
});
Badge.displayName = "Badge";

export type Status = "queued" | "running" | "waiting" | "success" | "partial" | "danger" | "neutralEnd";

export interface StatusBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  readonly status: Status;
  readonly icon: ReactNode;
  readonly label: string;
}

const markerStatuses: readonly Status[] = ["queued", "neutralEnd"];

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  { className, icon, label, status, ...props },
  ref,
) {
  const isMarker = markerStatuses.includes(status);
  const statusClass = status === "neutralEnd" ? "neutral-end" : status;
  return (
    <span {...props} ref={ref} className={cx("cdt-badge", "cdt-status-badge", `cdt-status-badge--${statusClass}`, className)}>
      {isMarker ? <span className={cx("cdt-status-badge__marker", status === "neutralEnd" && "cdt-status-badge__marker--neutral-end")} aria-hidden="true" /> : null}
      <span className="cdt-badge__icon" aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
});
StatusBadge.displayName = "StatusBadge";

export type Severity = "read" | "write" | "destructive" | "blocked";

export interface SeverityTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  readonly severity: Severity;
  readonly icon: ReactNode;
  readonly label: string;
}

export const SeverityTag = forwardRef<HTMLSpanElement, SeverityTagProps>(function SeverityTag(
  { className, icon, label, severity, ...props },
  ref,
) {
  return (
    <span {...props} ref={ref} className={cx("cdt-badge", "cdt-severity-tag", `cdt-severity-tag--${severity}`, className)}>
      <span className="cdt-badge__icon" aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
});
SeverityTag.displayName = "SeverityTag";
