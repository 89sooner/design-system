"use client";
// FR-CMP-014 · CR-054: transient notifications. Timing, swipe, the F8 hotkey, focus and the live
// region all belong to Radix Toast (ADR-004); this file only names the parts and their classes.
import * as RadixToast from "@radix-ui/react-toast";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "./cx";
import { DEFAULT_TOAST_LABELS, type ToastLabels } from "./labels";

export type ToastTone = "info" | "success" | "warning" | "danger";

export type ToastViewportProps = ComponentPropsWithoutRef<typeof RadixToast.Viewport>;
const ToastViewport = forwardRef<HTMLOListElement, ToastViewportProps>(function ToastViewport({ className, ...props }, ref) {
  return <RadixToast.Viewport {...props} ref={ref} className={cx("cdt-toast-viewport", className)} />;
});
ToastViewport.displayName = "Toast.Viewport";

export type ToastRootProps = ComponentPropsWithoutRef<typeof RadixToast.Root> & {
  readonly tone?: ToastTone;
  /** Status is never colour alone (FR-A11Y-003): pass an icon that matches the tone. */
  readonly icon?: ReactNode;
};
const ToastRoot = forwardRef<HTMLLIElement, ToastRootProps>(function ToastRoot({ className, tone = "info", icon, children, ...props }, ref) {
  return <RadixToast.Root {...props} ref={ref} className={cx("cdt-toast", `cdt-toast--${tone}`, className)}>
    {icon === undefined ? null : <span className="cdt-toast__icon" aria-hidden="true">{icon}</span>}
    <div className="cdt-toast__body">{children}</div>
  </RadixToast.Root>;
});
ToastRoot.displayName = "Toast.Root";

const ToastTitle = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixToast.Title>>(function ToastTitle({ className, ...props }, ref) {
  return <RadixToast.Title {...props} ref={ref} className={cx("cdt-toast__title", className)} />;
});
ToastTitle.displayName = "Toast.Title";

const ToastDescription = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixToast.Description>>(function ToastDescription({ className, ...props }, ref) {
  return <RadixToast.Description {...props} ref={ref} className={cx("cdt-toast__description", className)} />;
});
ToastDescription.displayName = "Toast.Description";

/** `altText` is required by Radix: it is what a screen reader hears instead of the button. */
export type ToastActionProps = ComponentPropsWithoutRef<typeof RadixToast.Action>;
const ToastAction = forwardRef<HTMLButtonElement, ToastActionProps>(function ToastAction({ className, ...props }, ref) {
  return <RadixToast.Action {...props} ref={ref} className={cx("cdt-btn", "cdt-btn--secondary", "cdt-btn--sm", "cdt-toast__action", className)} />;
});
ToastAction.displayName = "Toast.Action";

export type ToastCloseProps = ComponentPropsWithoutRef<typeof RadixToast.Close> & { readonly labels?: Partial<ToastLabels> };
const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(function ToastClose({ className, children, labels, ...props }, ref) {
  const t = { ...DEFAULT_TOAST_LABELS, ...labels };
  return <RadixToast.Close aria-label={children === undefined ? t.close : undefined} {...props} ref={ref} className={cx("cdt-btn", "cdt-btn--ghost", "cdt-btn--sm", "cdt-btn--icon", "cdt-toast__close", className)}>
    {children ?? <span aria-hidden="true">×</span>}
  </RadixToast.Close>;
});
ToastClose.displayName = "Toast.Close";

export const Toast = { Provider: RadixToast.Provider, Viewport: ToastViewport, Root: ToastRoot, Title: ToastTitle, Description: ToastDescription, Action: ToastAction, Close: ToastClose } as const;
