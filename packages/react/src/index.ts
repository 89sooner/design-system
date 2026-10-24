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

export { Combobox, MultiSelect, FilterChip, FilterToolbar, DataTable, WorkbenchLayout, DetailInspector, PathList, Breadcrumb, Skeleton, CopyButton, ProcessingStatus } from "./workbench";
export type { SearchOption, ComboboxProps, MultiSelectProps, FilterChipProps, DataColumn, DataSort, DataTableProps, WorkbenchLayoutProps, DetailInspectorProps, PathItem, PathListProps, CopyButtonProps, ProcessingStage, ProcessingStatusProps } from "./workbench";

export { Tabs, Popover, Collapsible } from "./interaction";
export type { TabsRootProps, TabsListProps, TabsContentProps, PopoverContentProps } from "./interaction";
export { AppShellNavTrigger } from "./shell";

export { RelationGraph, layoutRelationNodes } from "./relation";
export type { RelationNode, RelationEdge, RelationSelection, RelationViewport, RelationGraphProps } from "./relation";
// CR-053: the strings the CR-041 components render, overridable per instance through `labels`.
export type { ComboboxLabels, CopyButtonLabels, DataTableLabels, DetailInspectorLabels, MultiSelectLabels, PathListLabels, ProcessingStatusLabels, RelationGraphLabels, WorkbenchLayoutLabels } from "./labels";
// CR-054 FR-CMP-014: notifications, date entry, a command palette and page navigation.
export { Toast } from "./toast";
export type { ToastActionProps, ToastCloseProps, ToastRootProps, ToastTone, ToastViewportProps } from "./toast";
export { DatePicker } from "./date-picker";
export { DirectionProvider, useDirection } from "./direction";
export type { DatePickerProps } from "./date-picker";
export { CommandPalette, filterCommands } from "./command";
export type { Command, CommandPaletteProps } from "./command";
export { Pagination, paginationRange } from "./pagination";
export type { PaginationItem, PaginationProps } from "./pagination";
export type { CommandPaletteLabels, DatePickerLabels, PaginationLabels, ToastLabels } from "./labels";
// CR-060 FR-CMP-015: confirmation, single choice, segmented toggles, avatars and number entry.
export { AlertDialog } from "./alert-dialog";
export type { AlertDialogActionProps, AlertDialogContentProps } from "./alert-dialog";
export { RadioGroup, ToggleGroup } from "./selection";
export type { RadioGroupItemProps, RadioGroupRootProps, ToggleGroupItemProps, ToggleGroupProps } from "./selection";
export { Avatar, avatarInitials } from "./avatar";
export type { AvatarProps } from "./avatar";
export { NumberInput } from "./number-input";
export type { NumberInputProps } from "./number-input";
export type { NumberInputLabels } from "./labels";
export { Grid, Separator, Stack } from "./layout";
export type { GridProps, SeparatorProps, SpaceStep, StackProps } from "./layout";
export { Heading, Text } from "./typography";
export type { HeadingLevel, HeadingProps, HeadingSize, TextProps, TextSize, TextTone } from "./typography";
export { Accordion } from "./accordion";
export type { AccordionContentProps, AccordionItemProps, AccordionRootProps, AccordionTriggerProps } from "./accordion";
// CR-061 FR-CMP-016: agent and chat interface parts, modelled on Vercel AI Elements, built on Conductor.
export { Conversation, Message, PromptInput, Reasoning, Tool, Confirmation, Sources, InlineCitation, Suggestions, Suggestion, Shimmer } from "./agent";
export type { ConfirmationProps, ConfirmationState, ConversationProps, InlineCitationProps, MessageProps, MessageRole, MessageStatus, PromptInputProps, PromptInputStatus, ReasoningProps, ShimmerProps, SourceItem, SourcesProps, SuggestionProps, SuggestionsProps, ToolProps, ToolStatus } from "./agent";
export type { ConfirmationLabels, ConversationLabels, InlineCitationLabels, MessageLabels, PromptInputLabels, ReasoningLabels, SourcesLabels, SuggestionsLabels, ToolLabels } from "./labels";
