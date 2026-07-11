// FR 범위: FR-CMP-008, FR-A11Y-003, FR-A11Y-005, FR-CSS-005
import { forwardRef, useEffect, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx";

type BannerTone = "info" | "warning" | "danger";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> { readonly tone?: BannerTone; readonly icon?: ReactNode; readonly title?: ReactNode; readonly action?: ReactNode; readonly children: ReactNode; }
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner({ action, children, className, icon, title, tone = "info", ...props }, ref) {
  useEffect(() => { if (process.env.NODE_ENV !== "production" && tone === "danger" && action === undefined) console.warn("[conductor] Banner tone=\"danger\" requires a recovery action."); }, [action, tone]);
  return <div {...props} ref={ref} role={tone === "danger" ? "alert" : "status"} className={cx("cdt-banner", `cdt-banner--${tone}`, className)}>{icon === undefined ? null : <span className="cdt-banner__icon" aria-hidden="true">{icon}</span>}<div className="cdt-banner__body">{title === undefined ? null : <div className="cdt-banner__title">{title}</div>}{children}</div>{action === undefined ? null : <div className="cdt-banner__action">{action}</div>}</div>;
});
Banner.displayName = "Banner";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> { readonly title: ReactNode; readonly description?: ReactNode; readonly action?: ReactNode; readonly icon?: ReactNode; }
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({ action, className, description, icon, title, ...props }, ref) {
  return <div {...props} ref={ref} className={cx("cdt-empty-state", className)}>{icon === undefined ? null : <div className="cdt-empty-state__icon" aria-hidden="true">{icon}</div>}<div className="cdt-empty-state__title">{title}</div>{description === undefined ? null : <div className="cdt-empty-state__description">{description}</div>}{action === undefined ? null : <div className="cdt-empty-state__action">{action}</div>}</div>;
});
EmptyState.displayName = "EmptyState";

export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> { readonly value: number; readonly min?: number; readonly max?: number; readonly warningAt?: number; readonly exceededAt?: number; readonly valueText: string; readonly "aria-label": string; }
const ratio = (value: number, min: number, max: number): number => max <= min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter({ "aria-label": ariaLabel, className, exceededAt, max = 100, min = 0, style, value, valueText, warningAt, ...props }, ref) {
  const tone = exceededAt !== undefined && value >= exceededAt ? "exceeded" : warningAt !== undefined && value >= warningAt ? "warning" : "normal";
  const meterStyle = { ...style, "--cdt-meter-ratio": String(ratio(value, min, max)) } as CSSProperties;
  return <div {...props} ref={ref} style={meterStyle} role="meter" aria-label={ariaLabel} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-valuetext={valueText} className={cx("cdt-meter", `cdt-meter--${tone}`, className)}><div className="cdt-meter__track"><div className="cdt-meter__fill" /></div><span className="cdt-meter__value">{valueText}</span></div>;
});
Meter.displayName = "Meter";

export interface ProgressRingProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> { readonly value: number; readonly max?: number; readonly valueText: string; readonly size?: "sm" | "md"; readonly "aria-label": string; }
export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(function ProgressRing({ "aria-label": ariaLabel, className, max = 100, size = "md", style, value, valueText, ...props }, ref) {
  const ringStyle = { ...style, "--cdt-progress-ring-ratio": String(ratio(value, 0, max)) } as CSSProperties;
  return <div {...props} ref={ref} style={ringStyle} role="progressbar" aria-label={ariaLabel} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-valuetext={valueText} className={cx("cdt-progress-ring", size === "sm" && "cdt-progress-ring--sm", className)}><svg aria-hidden="true" viewBox="0 0 32 32"><circle className="cdt-progress-ring__track" cx="16" cy="16" r="14" /><circle className="cdt-progress-ring__indicator" cx="16" cy="16" r="14" /></svg><span className="cdt-progress-ring__label">{valueText}</span></div>;
});
ProgressRing.displayName = "ProgressRing";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> { readonly label: string; readonly size?: "sm" | "md"; }
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner({ className, label, size = "md", ...props }, ref) {
  return <div {...props} ref={ref} role="status" aria-live="polite" className={cx("cdt-spinner", size === "sm" && "cdt-spinner--sm", className)}><svg aria-hidden="true" viewBox="0 0 32 32"><circle className="cdt-spinner__track" cx="16" cy="16" r="14" /><circle className="cdt-spinner__indicator" cx="16" cy="16" r="14" /></svg><span className="cdt-spinner__label">{label}</span></div>;
});
Spinner.displayName = "Spinner";
