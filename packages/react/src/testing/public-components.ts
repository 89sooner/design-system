/**
 * The one registry every later work package extends when it exports a React component.
 *
 * WP-011 deliberately exports no components. Keeping the registry explicit means a future
 * component cannot be marked public without also declaring the test file that owns its contract.
 */
import { createElement, type ReactElement } from "react";
import { Button, IconButton } from "../action";
import { Card, CardGrid, Panel } from "../surface";
import { Badge, SeverityTag, StatusBadge } from "../status";
import { CodeBlock, Kbd, Table, Timeline } from "../data";
import { Dialog, Drawer, DropdownMenu, Tooltip } from "../overlay";
import { Checkbox, Field, Select, Switch, TextArea, TextField } from "../form";
import { Banner, EmptyState, Meter, ProgressRing, Spinner } from "../feedback";
import { AppShell, AppShellNavTrigger, NavList, TopBar } from "../shell";

import { Combobox, MultiSelect, FilterChip, FilterToolbar, DataTable, WorkbenchLayout, DetailInspector, PathList, Breadcrumb, Skeleton, CopyButton, ProcessingStatus } from "../workbench";
import { RelationGraph } from "../relation";
import { Tabs, Popover, Collapsible } from "../interaction";
import { Toast } from "../toast";
import { DatePicker } from "../date-picker";
import { CommandPalette } from "../command";
import { Pagination } from "../pagination";
import { AlertDialog } from "../alert-dialog";
import { RadioGroup, ToggleGroup } from "../selection";
import { Avatar } from "../avatar";
import { NumberInput } from "../number-input";
import { Grid, Separator, Stack } from "../layout";
import { Heading, Text } from "../typography";
import { Accordion } from "../accordion";
import { ContextMenu } from "../context-menu";
import { Slider } from "../slider";
import { Tree } from "../tree";
import { Confirmation, Conversation, InlineCitation, Message, PromptInput, Reasoning, Shimmer, Sources, Suggestion, Suggestions, Tool } from "../agent";

export interface PublicComponent {
  readonly name: string;
  readonly testFile: string;
  readonly render: () => ReactElement;
}

export const publicComponents: readonly PublicComponent[] = [
  { name: "ContextMenu", testFile: "testing/extensions.test.tsx", render: () => createElement(ContextMenu.Root, { children: null }) },
  { name: "Slider", testFile: "testing/extensions.test.tsx", render: () => createElement(Slider, { "aria-label": "Slider", defaultValue: [50] }) },
  { name: "Tree", testFile: "testing/extensions.test.tsx", render: () => createElement(Tree, { "aria-label": "Tree", items: [] }) },
  { name: "Separator", testFile: "testing/primitives.test.tsx", render: () => createElement(Separator) },
  { name: "Stack", testFile: "testing/primitives.test.tsx", render: () => createElement(Stack) },
  { name: "Grid", testFile: "testing/primitives.test.tsx", render: () => createElement(Grid) },
  { name: "Heading", testFile: "testing/primitives.test.tsx", render: () => createElement(Heading, { level: 2 }, "Heading") },
  { name: "Text", testFile: "testing/primitives.test.tsx", render: () => createElement(Text, null, "Text") },
  { name: "Accordion", testFile: "testing/primitives.test.tsx", render: () => createElement(Accordion.Root, { type: "single", children: null }) },
  { name: "Combobox", testFile: "testing/workbench.test.tsx", render: () => createElement(Combobox, {label: "Combo", options: [], query: "", value: null, onQueryChange() {}, onValueChange() {}}) },
  { name: "MultiSelect", testFile: "testing/workbench.test.tsx", render: () => createElement(MultiSelect, {label: "Multi", options: [], value: [], onValueChange() {}}) },
  { name: "FilterChip", testFile: "testing/workbench.test.tsx", render: () => createElement(FilterChip, {children: "Chip", removeLabel: "Remove", onRemove() {}}) },
  { name: "FilterToolbar", testFile: "testing/workbench.test.tsx", render: () => createElement(FilterToolbar) },
  { name: "DataTable", testFile: "testing/workbench.test.tsx", render: () => createElement(DataTable, {label: "Table", rows: [], columns: [], rowId: () => "", rowLabel: () => ""}) },
  { name: "WorkbenchLayout", testFile: "testing/workbench.test.tsx", render: () => createElement(WorkbenchLayout) },
  { name: "DetailInspector", testFile: "testing/workbench.test.tsx", render: () => createElement(DetailInspector, {label: "Preview", onClose() {}}) },
  { name: "PathList", testFile: "testing/workbench.test.tsx", render: () => createElement(PathList, {items: []}) },
  { name: "Breadcrumb", testFile: "testing/workbench.test.tsx", render: () => createElement(Breadcrumb) },
  { name: "Skeleton", testFile: "testing/workbench.test.tsx", render: () => createElement(Skeleton, {label: "Loading"}) },
  { name: "CopyButton", testFile: "testing/workbench.test.tsx", render: () => createElement(CopyButton, {value: "test"}) },
  { name: "ProcessingStatus", testFile: "testing/workbench.test.tsx", render: () => createElement(ProcessingStatus, {label: "Stages", stages: []}) },
  { name: "RelationGraph", testFile: "testing/relation.test.tsx", render: () => createElement(RelationGraph, { label: "Relations", nodes: [], edges: [] }) },
  { name: "Tabs", testFile: "testing/interaction.test.tsx", render: () => createElement(Tabs.Root, { children: null }) },
  { name: "Popover", testFile: "testing/interaction.test.tsx", render: () => createElement(Popover.Root, { children: null }) },
  { name: "Collapsible", testFile: "testing/interaction.test.tsx", render: () => createElement(Collapsible.Root, { children: null }) },
  { name: "AppShellNavTrigger", testFile: "testing/shell.test.tsx", render: () => createElement(AppShell, { nav: null, skipLinkLabel: "Skip", children: createElement(AppShellNavTrigger, null, "Menu") }) },
  { name: "Button", testFile: "testing/action.test.tsx", render: () => createElement(Button, null, "Button") },
  { name: "IconButton", testFile: "testing/action.test.tsx", render: () => createElement(IconButton, { "aria-label": "Icon", icon: "●" }) },
  { name: "Card", testFile: "testing/surface.test.tsx", render: () => createElement(Card, null, "Card") },
  { name: "CardGrid", testFile: "testing/surface.test.tsx", render: () => createElement(CardGrid) },
  { name: "Panel", testFile: "testing/surface.test.tsx", render: () => createElement(Panel) },
  { name: "Badge", testFile: "testing/status.test.tsx", render: () => createElement(Badge, null, "Badge") },
  { name: "StatusBadge", testFile: "testing/status.test.tsx", render: () => createElement(StatusBadge, { status: "running", icon: "●", label: "Running" }) },
  { name: "SeverityTag", testFile: "testing/status.test.tsx", render: () => createElement(SeverityTag, { severity: "destructive", icon: "●", label: "Destructive" }) },
  { name: "Table", testFile: "testing/data.test.tsx", render: () => createElement(Table, { "aria-label": "Table", children: null }) },
  { name: "Timeline", testFile: "testing/data.test.tsx", render: () => createElement(Timeline, { children: null }) },
  { name: "CodeBlock", testFile: "testing/data.test.tsx", render: () => createElement(CodeBlock, { code: "{}" }) },
  { name: "Kbd", testFile: "testing/data.test.tsx", render: () => createElement(Kbd, null, "Esc") },
  { name: "Dialog", testFile: "testing/overlay.test.tsx", render: () => createElement(Dialog.Root, { children: null }) },
  { name: "Drawer", testFile: "testing/overlay.test.tsx", render: () => createElement(Drawer.Root, { children: null }) },
  { name: "Tooltip", testFile: "testing/overlay.test.tsx", render: () => createElement(Tooltip.Provider, { children: createElement(Tooltip.Root, { children: null }) }) },
  { name: "DropdownMenu", testFile: "testing/overlay.test.tsx", render: () => createElement(DropdownMenu.Root, { children: null }) },
  { name: "Field", testFile: "testing/form.test.tsx", render: () => createElement(Field, { label: "Field", children: createElement(TextField) }) },
  { name: "TextField", testFile: "testing/form.test.tsx", render: () => createElement(TextField, { "aria-label": "Text field" }) },
  { name: "TextArea", testFile: "testing/form.test.tsx", render: () => createElement(TextArea, { "aria-label": "Text area" }) },
  { name: "Select", testFile: "testing/form.test.tsx", render: () => createElement(Select.Root, { children: null }) },
  { name: "Switch", testFile: "testing/form.test.tsx", render: () => createElement(Switch, { "aria-label": "Switch" }) },
  { name: "Checkbox", testFile: "testing/form.test.tsx", render: () => createElement(Checkbox, { "aria-label": "Checkbox" }) },
  { name: "Banner", testFile: "testing/feedback.test.tsx", render: () => createElement(Banner, { children: "Banner" }) },
  { name: "EmptyState", testFile: "testing/feedback.test.tsx", render: () => createElement(EmptyState, { title: "Empty" }) },
  { name: "Meter", testFile: "testing/feedback.test.tsx", render: () => createElement(Meter, { value: 0, valueText: "0%", "aria-label": "Meter" }) },
  { name: "ProgressRing", testFile: "testing/feedback.test.tsx", render: () => createElement(ProgressRing, { value: 0, valueText: "0%", "aria-label": "Progress" }) },
  { name: "Spinner", testFile: "testing/feedback.test.tsx", render: () => createElement(Spinner, { label: "Loading" }) },
  { name: "AppShell", testFile: "testing/shell.test.tsx", render: () => createElement(AppShell, { nav: null, skipLinkLabel: "Skip", children: "Content" }) },
  { name: "NavList", testFile: "testing/shell.test.tsx", render: () => createElement(NavList, { items: [], renderLink: () => null, "aria-label": "Navigation" }) },
  { name: "TopBar", testFile: "testing/shell.test.tsx", render: () => createElement(TopBar) },
  { name: "Toast", testFile: "testing/controls.test.tsx", render: () => createElement(Toast.Provider, null, createElement(Toast.Viewport)) },
  { name: "DatePicker", testFile: "testing/controls.test.tsx", render: () => createElement(DatePicker, { "aria-label": "Date", value: undefined, onValueChange() {} }) },
  { name: "CommandPalette", testFile: "testing/controls.test.tsx", render: () => createElement(CommandPalette, { open: false, onOpenChange() {}, commands: [], onSelect() {} }) },
  { name: "Pagination", testFile: "testing/controls.test.tsx", render: () => createElement(Pagination, { page: 1, pageCount: 3, onPageChange() {} }) },
  { name: "AlertDialog", testFile: "testing/selection.test.tsx", render: () => createElement(AlertDialog.Root, null, createElement(AlertDialog.Trigger, null, "Delete")) },
  { name: "RadioGroup", testFile: "testing/selection.test.tsx", render: () => createElement(RadioGroup.Root, { "aria-label": "Choice" }, createElement(RadioGroup.Item, { value: "a", children: "A" })) },
  { name: "ToggleGroup", testFile: "testing/selection.test.tsx", render: () => createElement(ToggleGroup.Root, { type: "single", "aria-label": "View" }, createElement(ToggleGroup.Item, { value: "a" }, "A")) },
  { name: "Avatar", testFile: "testing/selection.test.tsx", render: () => createElement(Avatar, { name: "Ada Lovelace" }) },
  { name: "NumberInput", testFile: "testing/selection.test.tsx", render: () => createElement(NumberInput, { "aria-label": "Count" }) },
  { name: "Conversation", testFile: "testing/agent.test.tsx", render: () => createElement(Conversation, null, createElement(Message, { from: "user", children: "Hi" })) },
  { name: "Message", testFile: "testing/agent.test.tsx", render: () => createElement(Message, { from: "assistant", status: "streaming", children: "Hello" }) },
  { name: "PromptInput", testFile: "testing/agent.test.tsx", render: () => createElement(PromptInput, { value: "", onValueChange() {}, onSubmit() {} }) },
  { name: "Reasoning", testFile: "testing/agent.test.tsx", render: () => createElement(Reasoning, { streaming: true, children: "Thinking" }) },
  { name: "Tool", testFile: "testing/agent.test.tsx", render: () => createElement(Tool, { name: "search", status: "running", input: { q: "x" } }) },
  { name: "Confirmation", testFile: "testing/agent.test.tsx", render: () => createElement(Confirmation, { title: "Approve?", state: "pending", onApprove() {}, onReject() {} }) },
  { name: "Sources", testFile: "testing/agent.test.tsx", render: () => createElement(Sources, { sources: [{ href: "https://example.com", title: "Example" }] }) },
  { name: "InlineCitation", testFile: "testing/agent.test.tsx", render: () => createElement(InlineCitation, { index: 1, source: { href: "https://example.com", title: "Example" } }) },
  { name: "Suggestions", testFile: "testing/agent.test.tsx", render: () => createElement(Suggestions, null, createElement(Suggestion, { suggestion: "Next", onSelect() {} })) },
  { name: "Suggestion", testFile: "testing/agent.test.tsx", render: () => createElement(Suggestion, { suggestion: "Next", onSelect() {} }) },
  { name: "Shimmer", testFile: "testing/agent.test.tsx", render: () => createElement(Shimmer, null, "Thinking") },
];

export function missingComponentTests(
  components: readonly PublicComponent[],
  availableTestFiles: readonly string[],
): string[] {
  const known = new Set(availableTestFiles);
  return components.filter((component) => !known.has(component.testFile)).map((component) => component.name);
}
