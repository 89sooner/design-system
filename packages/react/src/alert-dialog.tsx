"use client";
// FR-CMP-015 · CR-060: a confirmation the person must answer before anything else. Radix
// AlertDialog owns the `alertdialog` role, the focus trap, initial focus on Cancel and the rule that
// a click outside does not dismiss (ADR-004). This file names the parts and reuses the Dialog look,
// so the overlay stacking contract (CR-058) covers it unchanged.
import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";
import { useRouteCloseAutoFocus } from "./route-focus";

export type AlertDialogContentProps = ComponentPropsWithoutRef<typeof RadixAlertDialog.Content> & {
  readonly size?: "sm" | "md";
};

const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(function AlertDialogContent({ className, size = "sm", onCloseAutoFocus, ...props }, ref) {
  const closeAutoFocus = useRouteCloseAutoFocus(onCloseAutoFocus);
  return (
    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay className="cdt-overlay" />
      <RadixAlertDialog.Content {...props} ref={ref} onCloseAutoFocus={closeAutoFocus} className={cx("cdt-dialog", "cdt-alert-dialog", size === "sm" && "cdt-dialog--sm", className)} />
    </RadixAlertDialog.Portal>
  );
});
AlertDialogContent.displayName = "AlertDialog.Content";

const AlertDialogTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<typeof RadixAlertDialog.Title>>(function AlertDialogTitle({ className, ...props }, ref) {
  return <RadixAlertDialog.Title {...props} ref={ref} className={cx("cdt-dialog__title", className)} />;
});
AlertDialogTitle.displayName = "AlertDialog.Title";

const AlertDialogDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<typeof RadixAlertDialog.Description>>(function AlertDialogDescription({ className, ...props }, ref) {
  return <RadixAlertDialog.Description {...props} ref={ref} className={cx("cdt-dialog__description", className)} />;
});
AlertDialogDescription.displayName = "AlertDialog.Description";

/** The footer row that holds Cancel and Action, end-aligned. */
const AlertDialogFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(function AlertDialogFooter({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={cx("cdt-alert-dialog__footer", className)} />;
});
AlertDialogFooter.displayName = "AlertDialog.Footer";

const AlertDialogCancel = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof RadixAlertDialog.Cancel>>(function AlertDialogCancel({ asChild = false, className, ...props }, ref) {
  return <RadixAlertDialog.Cancel {...props} ref={ref} asChild={asChild} className={cx(!asChild && "cdt-btn cdt-btn--secondary", className)} />;
});
AlertDialogCancel.displayName = "AlertDialog.Cancel";

export type AlertDialogActionProps = ComponentPropsWithoutRef<typeof RadixAlertDialog.Action> & {
  /** `danger` for a destructive or irreversible action (the default), `accent` otherwise. */
  readonly tone?: "danger" | "accent";
};

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(function AlertDialogAction({ asChild = false, className, tone = "danger", ...props }, ref) {
  return <RadixAlertDialog.Action {...props} ref={ref} asChild={asChild} className={cx(!asChild && "cdt-btn cdt-btn--primary", !asChild && (tone === "accent" ? "cdt-btn--tone-accent" : "cdt-btn--tone-danger"), className)} />;
});
AlertDialogAction.displayName = "AlertDialog.Action";

export const AlertDialog = {
  Root: RadixAlertDialog.Root,
  Trigger: RadixAlertDialog.Trigger,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Footer: AlertDialogFooter,
  Cancel: AlertDialogCancel,
  Action: AlertDialogAction,
} as const;
