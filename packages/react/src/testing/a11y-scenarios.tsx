// Refs: WP-024 FR-QA-003 FR-A11Y-002 FR-A11Y-005
import { useState, type ReactElement } from "react";
import {
  AppShell,
  Badge,
  Banner,
  Button,
  Card,
  CardGrid,
  Checkbox,
  CodeBlock,
  Dialog,
  Drawer,
  DropdownMenu,
  EmptyState,
  Field,
  IconButton,
  Kbd,
  Meter,
  NavList,
  Panel,
  ProgressRing,
  Select,
  SeverityTag,
  Spinner,
  StatusBadge,
  Switch,
  Table,
  TextArea,
  TextField,
  Timeline,
  Tooltip,
  TopBar,
} from "../index";

export type A11yState = "default" | "disabled" | "error" | "interactive" | "open";

export type KeyboardPath =
  | { readonly kind: "static" }
  | { readonly kind: "focus" }
  | { readonly kind: "toggle" }
  | { readonly kind: "overlay"; readonly role: "dialog" | "listbox" | "menu" | "tooltip"; readonly opensOnFocus?: boolean }
  | { readonly kind: "skip-link" };

export interface A11yScenario {
  readonly component: string;
  readonly state: A11yState;
  readonly render: () => ReactElement;
  readonly axeSelector?: string;
  readonly keyboard?: KeyboardPath;
}

const keyboardTarget = { "data-keyboard-target": "" } as const;

function TableFixture({ keyboard = false }: { readonly keyboard?: boolean } = {}): ReactElement {
  return <Table {...(keyboard ? keyboardTarget : {})} caption="Example data"><Table.Head><Table.Row><Table.HeaderCell>Name</Table.HeaderCell></Table.Row></Table.Head><Table.Body><Table.Row><Table.Cell>Value</Table.Cell></Table.Row></Table.Body></Table>;
}

function SelectFixture({ disabled = false, invalid = false, open = false }: { readonly disabled?: boolean; readonly invalid?: boolean; readonly open?: boolean }): ReactElement {
  return <Select.Root defaultOpen={open} defaultValue="one"><Select.Trigger {...keyboardTarget} aria-label="Example select" disabled={disabled} invalid={invalid}><Select.Value /></Select.Trigger><Select.Content><Select.Item value="one">One</Select.Item><Select.Item value="two">Two</Select.Item></Select.Content></Select.Root>;
}

function DialogFixture({ open = false }: { readonly open?: boolean }): ReactElement {
  return <Dialog.Root defaultOpen={open}><Dialog.Trigger {...keyboardTarget}>Open dialog</Dialog.Trigger><Dialog.Content><Dialog.Title>Dialog title</Dialog.Title><Dialog.Description>Dialog description.</Dialog.Description><Dialog.Close>Close</Dialog.Close></Dialog.Content></Dialog.Root>;
}

function DrawerFixture({ open = false }: { readonly open?: boolean }): ReactElement {
  return <Drawer.Root defaultOpen={open}><Drawer.Trigger {...keyboardTarget}>Open drawer</Drawer.Trigger><Drawer.Content><Drawer.Title>Drawer title</Drawer.Title><Drawer.Description>Drawer description.</Drawer.Description><Drawer.Close>Close</Drawer.Close></Drawer.Content></Drawer.Root>;
}

function TooltipFixture({ open = false }: { readonly open?: boolean }): ReactElement {
  return <Tooltip.Provider delayDuration={0}><Tooltip.Root defaultOpen={open}><Tooltip.Trigger {...keyboardTarget}>Tooltip trigger</Tooltip.Trigger><Tooltip.Content>Helpful detail</Tooltip.Content></Tooltip.Root></Tooltip.Provider>;
}

function MenuFixture({ open = false }: { readonly open?: boolean }): ReactElement {
  return <DropdownMenu.Root defaultOpen={open}><DropdownMenu.Trigger {...keyboardTarget}>Menu trigger</DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item>First action</DropdownMenu.Item><DropdownMenu.Item>Second action</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Root>;
}

export function AppShellKeyboardFixture({ initiallyOpen = false }: { readonly initiallyOpen?: boolean }): ReactElement {
  const [open, setOpen] = useState(initiallyOpen);
  const nav = <a href="#shell-content">Navigation link</a>;
  return <AppShell nav={nav} navOpen={open} onNavOpenChange={setOpen} skipLinkLabel="Skip to shell content" mainId="shell-content" topBar={<TopBar menuButton={<Button data-shell-trigger="" onClick={() => setOpen(true)}>Open navigation</Button>} />}><p>Shell content</p></AppShell>;
}

export const a11yScenarios: readonly A11yScenario[] = [
  { component: "Button", state: "default", keyboard: { kind: "focus" }, render: () => <Button {...keyboardTarget}>Save</Button> },
  { component: "Button", state: "disabled", render: () => <Button disabled>Save</Button> },
  { component: "IconButton", state: "default", keyboard: { kind: "focus" }, render: () => <IconButton {...keyboardTarget} aria-label="Add item" icon="+" /> },
  { component: "IconButton", state: "disabled", render: () => <IconButton aria-label="Add item" disabled icon="+" /> },
  { component: "Card", state: "default", keyboard: { kind: "focus" }, render: () => <Card {...keyboardTarget} as="a" href="#card-target">Card content</Card> },
  { component: "CardGrid", state: "default", keyboard: { kind: "static" }, render: () => <CardGrid><Card>One</Card><Card>Two</Card></CardGrid> },
  { component: "Panel", state: "default", keyboard: { kind: "static" }, render: () => <Panel>Panel content</Panel> },
  { component: "Badge", state: "default", keyboard: { kind: "static" }, render: () => <Badge icon="●">Badge</Badge> },
  { component: "StatusBadge", state: "default", keyboard: { kind: "static" }, render: () => <StatusBadge status="running" icon="●" label="Running" /> },
  { component: "SeverityTag", state: "default", keyboard: { kind: "static" }, render: () => <SeverityTag severity="destructive" icon="!" label="Destructive" /> },
  { component: "Table", state: "default", keyboard: { kind: "focus" }, render: () => <TableFixture keyboard /> },
  { component: "Timeline", state: "default", keyboard: { kind: "focus" }, render: () => <Timeline><Timeline.Step {...keyboardTarget} marker="1" onSelect={() => undefined}>Review</Timeline.Step></Timeline> },
  { component: "Timeline", state: "interactive", render: () => <Timeline><Timeline.Step marker="1" onSelect={() => undefined} selected>Selected step</Timeline.Step></Timeline> },
  { component: "CodeBlock", state: "default", keyboard: { kind: "focus" }, render: () => <CodeBlock {...keyboardTarget} aria-label="Example code" code="const ready = true;" language="ts" /> },
  { component: "Kbd", state: "default", keyboard: { kind: "static" }, render: () => <Kbd>Esc</Kbd> },
  { component: "Dialog", state: "default", keyboard: { kind: "overlay", role: "dialog" }, render: () => <DialogFixture /> },
  { component: "Dialog", state: "open", axeSelector: '[role="dialog"]', render: () => <DialogFixture open /> },
  { component: "Drawer", state: "default", keyboard: { kind: "overlay", role: "dialog" }, render: () => <DrawerFixture /> },
  { component: "Drawer", state: "open", axeSelector: '[role="dialog"]', render: () => <DrawerFixture open /> },
  { component: "Tooltip", state: "default", keyboard: { kind: "overlay", role: "tooltip", opensOnFocus: true }, render: () => <TooltipFixture /> },
  { component: "Tooltip", state: "open", axeSelector: '[role="tooltip"]', render: () => <TooltipFixture open /> },
  { component: "DropdownMenu", state: "default", keyboard: { kind: "overlay", role: "menu" }, render: () => <MenuFixture /> },
  { component: "DropdownMenu", state: "open", axeSelector: '[role="menu"]', render: () => <MenuFixture open /> },
  { component: "Field", state: "default", keyboard: { kind: "focus" }, render: () => <Field label="Project name"><TextField {...keyboardTarget} /></Field> },
  { component: "Field", state: "error", render: () => <Field label="Project name" error="Project name is required"><TextField /></Field> },
  { component: "TextField", state: "default", keyboard: { kind: "focus" }, render: () => <TextField {...keyboardTarget} aria-label="Project name" /> },
  { component: "TextField", state: "disabled", render: () => <TextField aria-label="Project name" disabled /> },
  { component: "TextField", state: "error", render: () => <TextField aria-label="Project name" aria-invalid="true" invalid /> },
  { component: "TextArea", state: "default", keyboard: { kind: "focus" }, render: () => <TextArea {...keyboardTarget} aria-label="Description" /> },
  { component: "TextArea", state: "disabled", render: () => <TextArea aria-label="Description" disabled /> },
  { component: "TextArea", state: "error", render: () => <TextArea aria-label="Description" aria-invalid="true" invalid /> },
  { component: "Select", state: "default", keyboard: { kind: "overlay", role: "listbox" }, render: () => <SelectFixture /> },
  { component: "Select", state: "disabled", render: () => <SelectFixture disabled /> },
  { component: "Select", state: "error", render: () => <SelectFixture invalid /> },
  { component: "Select", state: "open", axeSelector: '[role="listbox"]', render: () => <SelectFixture open /> },
  { component: "Switch", state: "default", keyboard: { kind: "toggle" }, render: () => <Switch {...keyboardTarget} aria-label="Notifications" /> },
  { component: "Switch", state: "disabled", render: () => <Switch aria-label="Notifications" disabled /> },
  { component: "Checkbox", state: "default", keyboard: { kind: "toggle" }, render: () => <Checkbox {...keyboardTarget} aria-label="Accept terms" /> },
  { component: "Checkbox", state: "disabled", render: () => <Checkbox aria-label="Accept terms" disabled /> },
  { component: "Banner", state: "default", keyboard: { kind: "static" }, render: () => <Banner tone="info">Settings were saved.</Banner> },
  { component: "Banner", state: "error", render: () => <Banner tone="danger" action={<Button>Retry</Button>}>Save failed.</Banner> },
  { component: "EmptyState", state: "default", keyboard: { kind: "focus" }, render: () => <EmptyState title="No results" description="Try another query." action={<Button {...keyboardTarget}>Clear filters</Button>} /> },
  { component: "Meter", state: "default", keyboard: { kind: "static" }, render: () => <Meter aria-label="Usage" value={60} valueText="60%" /> },
  { component: "ProgressRing", state: "default", keyboard: { kind: "static" }, render: () => <ProgressRing aria-label="Progress" value={60} valueText="60%" /> },
  { component: "Spinner", state: "default", keyboard: { kind: "static" }, render: () => <Spinner label="Loading" /> },
  { component: "AppShell", state: "default", keyboard: { kind: "skip-link" }, render: () => <AppShellKeyboardFixture /> },
  { component: "AppShell", state: "open", axeSelector: '[role="dialog"]', render: () => <AppShellKeyboardFixture initiallyOpen /> },
  { component: "NavList", state: "default", keyboard: { kind: "focus" }, render: () => <NavList aria-label="Example navigation" items={[{ id: "overview", label: "Overview", href: "#overview", active: true }]} renderLink={(item, props) => <a {...props} {...keyboardTarget} href={item.href} />} /> },
  { component: "TopBar", state: "default", keyboard: { kind: "focus" }, render: () => <TopBar title="Components" actions={<IconButton {...keyboardTarget} aria-label="More actions" icon="●" />} /> },
];

export const keyboardScenarios = a11yScenarios.filter((scenario): scenario is A11yScenario & { readonly keyboard: KeyboardPath } => scenario.keyboard !== undefined);
