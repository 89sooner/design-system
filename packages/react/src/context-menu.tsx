"use client";
// FR-CMP-018 · CR-078: the menu a right-click, a long press, Shift+F10 or the context-menu key opens over an
// area. Radix ContextMenu owns opening at the pointer, focus, roles, typeahead, Escape and returning focus
// (ADR-004). The surface and items share DropdownMenu's `cdt-menu` look.
import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "./cx";

const ContextMenuContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixContextMenu.Content>>(function ContextMenuContent({ className, ...props }, ref) {
  return (
    <RadixContextMenu.Portal>
      <RadixContextMenu.Content {...props} ref={ref} className={cx("cdt-menu", "cdt-context-menu", className)} />
    </RadixContextMenu.Portal>
  );
});
ContextMenuContent.displayName = "ContextMenu.Content";

export type ContextMenuItemProps = ComponentPropsWithoutRef<typeof RadixContextMenu.Item> & {
  readonly tone?: "neutral" | "danger";
  readonly icon?: ReactNode;
  /** A key combination shown at the end of the row, as text. */
  readonly shortcut?: string;
};

const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(function ContextMenuItem({ children, className, icon, shortcut, tone = "neutral", ...props }, ref) {
  return (
    <RadixContextMenu.Item {...props} ref={ref} className={cx("cdt-menu__item", tone === "danger" && "cdt-menu__item--danger", className)}>
      {icon === undefined ? null : <span className="cdt-menu__item-icon" aria-hidden="true">{icon}</span>}
      {children}
      {shortcut === undefined ? null : <span className="cdt-context-menu__shortcut">{shortcut}</span>}
    </RadixContextMenu.Item>
  );
});
ContextMenuItem.displayName = "ContextMenu.Item";

const ContextMenuLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixContextMenu.Label>>(function ContextMenuLabel({ className, ...props }, ref) {
  return <RadixContextMenu.Label {...props} ref={ref} className={cx("cdt-menu__label", className)} />;
});
ContextMenuLabel.displayName = "ContextMenu.Label";

const ContextMenuSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixContextMenu.Separator>>(function ContextMenuSeparator({ className, ...props }, ref) {
  return <RadixContextMenu.Separator {...props} ref={ref} className={cx("cdt-menu__separator", className)} />;
});
ContextMenuSeparator.displayName = "ContextMenu.Separator";

const ContextMenuTrigger = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<typeof RadixContextMenu.Trigger>>(function ContextMenuTrigger({ className, ...props }, ref) {
  return <RadixContextMenu.Trigger {...props} ref={ref} className={cx("cdt-context-menu__trigger", className)} />;
});
ContextMenuTrigger.displayName = "ContextMenu.Trigger";

export const ContextMenu = {
  Root: RadixContextMenu.Root,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
} as const;
