// FR 범위: FR-CMP-006, FR-A11Y-002, FR-A11Y-005, FR-TOK-008
import * as RadixDialog from "@radix-ui/react-dialog";
import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cx } from "./cx";

export type DialogContentProps = ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  readonly size?: "sm" | "md";
};

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { children, className, size = "md", ...props },
  ref,
) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="cdt-overlay" />
      <RadixDialog.Content {...props} ref={ref} className={cx("cdt-dialog", size === "sm" && "cdt-dialog--sm", className)}>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});
DialogContent.displayName = "Dialog.Content";

const DialogTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<typeof RadixDialog.Title>>(function DialogTitle(
  { className, ...props },
  ref,
) {
  return <RadixDialog.Title {...props} ref={ref} className={cx("cdt-dialog__title", className)} />;
});
DialogTitle.displayName = "Dialog.Title";

const DialogDescription = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<typeof RadixDialog.Description>>(function DialogDescription(
  { className, ...props },
  ref,
) {
  return <RadixDialog.Description {...props} ref={ref} className={cx("cdt-dialog__description", className)} />;
});
DialogDescription.displayName = "Dialog.Description";

export const Dialog = {
  Root: RadixDialog.Root,
  Trigger: RadixDialog.Trigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: RadixDialog.Close,
} as const;

export type DrawerContentProps = ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  readonly side?: "left" | "right";
};

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  { children, className, side = "right", ...props },
  ref,
) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="cdt-overlay" />
      <RadixDialog.Content {...props} ref={ref} className={cx("cdt-drawer", `cdt-drawer--${side}`, className)}>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});
DrawerContent.displayName = "Drawer.Content";

const DrawerTitle = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<typeof RadixDialog.Title>>(function DrawerTitle(
  { className, ...props },
  ref,
) {
  return <RadixDialog.Title {...props} ref={ref} className={cx("cdt-drawer__title", className)} />;
});
DrawerTitle.displayName = "Drawer.Title";

export const Drawer = {
  Root: RadixDialog.Root,
  Trigger: RadixDialog.Trigger,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: RadixDialog.Description,
  Close: RadixDialog.Close,
} as const;

export type TooltipContentProps = ComponentPropsWithoutRef<typeof RadixTooltip.Content> & {
  readonly showArrow?: boolean;
};

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { children, className, showArrow = true, ...props },
  ref,
) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content {...props} ref={ref} className={cx("cdt-tooltip", className)}>
        {children}
        {showArrow ? <RadixTooltip.Arrow className="cdt-tooltip__arrow" /> : null}
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
});
TooltipContent.displayName = "Tooltip.Content";

export const Tooltip = {
  Provider: RadixTooltip.Provider,
  Root: RadixTooltip.Root,
  Trigger: RadixTooltip.Trigger,
  Content: TooltipContent,
} as const;

export type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
  readonly tone?: "neutral" | "danger";
  readonly icon?: ReactNode;
};

const DropdownMenuContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>>(function DropdownMenuContent(
  { className, ...props },
  ref,
) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content {...props} ref={ref} className={cx("cdt-menu", className)} />
    </RadixDropdownMenu.Portal>
  );
});
DropdownMenuContent.displayName = "DropdownMenu.Content";

const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { children, className, icon, tone = "neutral", ...props },
  ref,
) {
  return (
    <RadixDropdownMenu.Item {...props} ref={ref} className={cx("cdt-menu__item", tone === "danger" && "cdt-menu__item--danger", className)}>
      {icon === undefined ? null : <span className="cdt-menu__item-icon" aria-hidden="true">{icon}</span>}
      {children}
    </RadixDropdownMenu.Item>
  );
});
DropdownMenuItem.displayName = "DropdownMenu.Item";

const DropdownMenuLabel = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label>>(function DropdownMenuLabel(
  { className, ...props },
  ref,
) {
  return <RadixDropdownMenu.Label {...props} ref={ref} className={cx("cdt-menu__label", className)} />;
});
DropdownMenuLabel.displayName = "DropdownMenu.Label";

const DropdownMenuSeparator = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>>(function DropdownMenuSeparator(
  { className, ...props },
  ref,
) {
  return <RadixDropdownMenu.Separator {...props} ref={ref} className={cx("cdt-menu__separator", className)} />;
});
DropdownMenuSeparator.displayName = "DropdownMenu.Separator";

export const DropdownMenu = {
  Root: RadixDropdownMenu.Root,
  Trigger: RadixDropdownMenu.Trigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
} as const;
