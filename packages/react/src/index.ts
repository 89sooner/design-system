import { CDT_PREFIX, PACKAGE_NAME as TOKENS_PACKAGE_NAME } from "@conductor-by-89soone/tokens";

export { cx } from "./cx";
export type { IconSlot, PolymorphicProps, Size, Tone } from "./types";
export { Button, IconButton } from "./action";
export type { ButtonProps, IconButtonProps } from "./action";
export { Card, CardGrid, Panel } from "./surface";
export type { CardGridProps, CardProps, PanelProps } from "./surface";
export { Badge, SeverityTag, StatusBadge } from "./status";
export type { BadgeProps, Severity, SeverityTagProps, Status, StatusBadgeProps } from "./status";
export { CodeBlock, Kbd, Table, Timeline } from "./data";
export type { CodeBlockProps, KbdProps, TableCellProps, TableHeaderCellProps, TableProps, TimelineProps, TimelineStepProps } from "./data";
export { Dialog, Drawer, DropdownMenu, Tooltip } from "./overlay";
export type { DialogContentProps, DrawerContentProps, DropdownMenuItemProps, TooltipContentProps } from "./overlay";
export { Checkbox, Field, Select, Switch, TextArea, TextField } from "./form";
export type { CheckboxProps, FieldProps, SelectItemProps, SelectTriggerProps, SwitchProps, TextAreaProps, TextFieldProps } from "./form";
export { Banner, EmptyState, Meter, ProgressRing, Spinner } from "./feedback";
export type { BannerProps, EmptyStateProps, MeterProps, ProgressRingProps, SpinnerProps } from "./feedback";
export { AppShell, NavList, TopBar } from "./shell";
export type { AppShellProps, NavItem, NavLinkRenderProps, NavListProps, TopBarProps } from "./shell";

/** Published name of this package. */
export const PACKAGE_NAME = "@conductor-by-89soone/react" as const;

/**
 * Internal packages this entry point resolves through their published entry
 * points rather than through source paths (FR-DX-001 AC-4). `@conductor-by-89soone/css` is
 * a stylesheet the consumer imports itself; it is listed here because
 * `@conductor-by-89soone/react` depends on its class names.
 */
export const CONSUMED_PACKAGES = [TOKENS_PACKAGE_NAME, "@conductor-by-89soone/css"] as const;

/** Builds a Conductor block class name, e.g. `cdt-btn` (ADR-006, FR-CSS-004 AC-2). */
export function blockClassName(block: string): string {
  return `${CDT_PREFIX}${block}`;
}
