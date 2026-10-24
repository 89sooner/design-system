// Refs: WP-024 FR-QA-003 FR-A11Y-002 FR-A11Y-005
import { useRef, useState, type ReactElement } from "react";
import { AlertDialog, Avatar, CommandPalette, Confirmation, Conversation, InlineCitation, Message, PromptInput, Reasoning, Shimmer, Sources, Suggestion, Suggestions, Tool, DatePicker, NumberInput, Pagination, RadioGroup, Toast, ToggleGroup, Accordion, Grid, Heading, Separator, Stack, Text } from "../index";
import {
  AppShell, AppShellNavTrigger, Tabs, Popover, Collapsible, Combobox, MultiSelect, FilterChip, FilterToolbar, DataTable, WorkbenchLayout, DetailInspector, PathList, Breadcrumb, Skeleton, CopyButton, ProcessingStatus, RelationGraph,
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
  | { readonly kind: "steps"; readonly steps: readonly { readonly target: string; readonly keys: string; readonly check: string; readonly attribute?: string; readonly expected: string }[] }
  | { readonly kind: "static" }
  | { readonly kind: "focus" }
  | { readonly kind: "toggle" }
  | { readonly kind: "overlay"; readonly role: "dialog" | "alertdialog" | "listbox" | "menu" | "tooltip"; readonly opensOnFocus?: boolean }
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

const sampleOptions = [{ id: "one", label: "One" }, { id: "two", label: "Two" }];
function ComboFixture({ disabled = false, error = false }: { readonly disabled?: boolean; readonly error?: boolean }) {
  const [query, setQuery] = useState(""); const [value, setValue] = useState<string | null>(null);
  return <><Combobox label="Category" options={sampleOptions} query={query} value={value} onQueryChange={setQuery} onValueChange={setValue} disabled={disabled} state={error ? "error" : "ready"} /><output data-choice="">{value ?? "none"}</output></>;
}
function MultiFixture() { const [value, setValue] = useState<readonly string[]>([]); return <MultiSelect label="Categories" options={sampleOptions} value={value} onValueChange={setValue} />; }
function ChipFixture() { const [removed, setRemoved] = useState(false); return <><FilterChip removeLabel="Remove filter" onRemove={() => setRemoved(true)} disabled={removed}>Client</FilterChip><output data-outcome="">{removed ? "removed" : "present"}</output></>; }
function DataFixture() { const [selected, select] = useState<string>(); return <><DataTable label="Loaded results" rows={[{ id: "one", title: "One" }]} columns={[{ id: "title", header: "Title", cell: row => row.title }]} rowId={row => row.id} rowLabel={row => row.title} selectedId={selected} onSelect={select} /><output data-outcome="">{selected ?? "none"}</output></>; }
function WidthFixture() { const [width, setWidth] = useState(40); return <WorkbenchLayout width={width} onWidthChange={setWidth} inspector={<p>Preview</p>}><output data-width="">{width}</output></WorkbenchLayout>; }
function InspectorFixture() { const [open, setOpen] = useState(true); const trigger = useRef<HTMLButtonElement | null>(null); return <><Button ref={trigger}>Return here</Button>{open && <DetailInspector label="Detail" onClose={() => setOpen(false)} returnFocusRef={trigger}>Details</DetailInspector>}<output data-outcome="">{open ? "open" : "closed"}</output></>; }
function PathFixture() { return <PathList items={[{ id: "src", label: "Source", children: [{ id: "file", label: "search.ts" }] }]} onPathSelect={() => undefined} />; }
function ProcessingFixture() { const [retried, setRetried] = useState(false); return <><ProcessingStatus label="Synthetic pipeline" stages={[{ id: "received", label: "Received", status: "complete", detail: "Receipt confirmed" }, { id: "indexed", label: "Indexed", status: retried ? "pending" : "failed", detail: "Index freshness not confirmed", action: { label: "Retry locally", onAction: () => setRetried(true) } }]} /><output data-outcome="">{retried ? "retried" : "failed"}</output></>; }
function RelationFixture() { return <RelationGraph label="Synthetic relations" nodes={[{ id: "one", label: "One" }, { id: "two", label: "Two" }]} edges={[{ id: "edge", source: "one", target: "two", type: "references", label: "references", evidence: "Synthetic evidence", ambiguous: true }]} />; }
function PopoverFixture({ open = false }: { readonly open?: boolean }) { return <Popover.Root defaultOpen={open}><Popover.Trigger {...keyboardTarget}>Show help</Popover.Trigger><Popover.Content aria-label="Help"><p>Filter instructions.</p><Popover.Close>Close</Popover.Close></Popover.Content></Popover.Root>; }
function NewShellFixture() { return <AppShell nav={<a href="#menu-item">Menu item</a>} skipLinkLabel="Skip menu example" topBar={<AppShellNavTrigger>Open menu</AppShellNavTrigger>}>Example content</AppShell>; }

// CR-054 FR-CMP-014 fixtures.
function ToastFixture(): ReactElement {
  const [open, setOpen] = useState(true);
  return <Toast.Provider><Toast.Root open={open} onOpenChange={setOpen} tone="success" icon="✓" duration={60_000}><Toast.Title>Release promoted</Toast.Title><Toast.Description>Version 2.4.0 is live.</Toast.Description><Toast.Close /></Toast.Root><Toast.Viewport /><output data-outcome="">{open ? "open" : "closed"}</output></Toast.Provider>;
}
function DatePickerFixture({ open = false }: { readonly open?: boolean }): ReactElement {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 15));
  return <Field label="Release date"><DatePicker {...keyboardTarget} value={date} onValueChange={setDate} defaultOpen={open} /></Field>;
}
function CommandFixture({ initiallyOpen = false }: { readonly initiallyOpen?: boolean }): ReactElement {
  const [open, setOpen] = useState(initiallyOpen);
  return <><Button {...keyboardTarget} onClick={() => setOpen(true)}>Open commands</Button><CommandPalette open={open} onOpenChange={setOpen} commands={[{ id: "deploy", label: "Deploy", group: "Releases" }, { id: "tokens", label: "Open tokens", group: "Navigate" }]} onSelect={() => undefined} /></>;
}
function PaginationFixture(): ReactElement {
  const [page, setPage] = useState(1);
  return <Pagination page={page} pageCount={8} onPageChange={setPage} />;
}

// CR-060 FR-CMP-015 fixtures.
function AlertDialogFixture({ open = false }: { readonly open?: boolean }): ReactElement {
  return <AlertDialog.Root defaultOpen={open}><AlertDialog.Trigger {...keyboardTarget}>Delete workspace</AlertDialog.Trigger><AlertDialog.Content><AlertDialog.Title>Delete workspace?</AlertDialog.Title><AlertDialog.Description>This cannot be undone.</AlertDialog.Description><AlertDialog.Footer><AlertDialog.Cancel>Cancel</AlertDialog.Cancel><AlertDialog.Action>Delete</AlertDialog.Action></AlertDialog.Footer></AlertDialog.Content></AlertDialog.Root>;
}
function RadioFixture({ disabled = false, invalid = false }: { readonly disabled?: boolean; readonly invalid?: boolean }): ReactElement {
  const [value, setValue] = useState("30");
  return <><Field label="Retention" error={invalid ? "Pick a retention period." : undefined}><RadioGroup.Root value={value} onValueChange={setValue} disabled={disabled}><RadioGroup.Item value="30">30 days</RadioGroup.Item><RadioGroup.Item value="90" description="Recommended">90 days</RadioGroup.Item></RadioGroup.Root></Field><output data-choice="">{value}</output></>;
}
function ToggleFixture(): ReactElement {
  const [view, setView] = useState("list");
  return <><ToggleGroup.Root type="single" aria-label="View" value={view} onValueChange={(next) => { if (next !== "") setView(next); }}><ToggleGroup.Item value="list">List</ToggleGroup.Item><ToggleGroup.Item value="board">Board</ToggleGroup.Item></ToggleGroup.Root><output data-view="">{view}</output></>;
}
function NumberFixture({ invalid = false }: { readonly invalid?: boolean }): ReactElement {
  const [value, setValue] = useState("10");
  return <><Field label="Max steps" error={invalid ? "Too many steps." : undefined}><NumberInput {...keyboardTarget} min={1} max={50} value={value} onChange={(event) => setValue(event.currentTarget.value)} suffix="steps" /></Field><output data-count="">{value}</output></>;
}

// CR-061 FR-CMP-016 fixtures.
function ConversationFixture(): ReactElement {
  return <Conversation style={{ blockSize: 240 }}><Message from="user">Why did the deploy fail?</Message><Message from="assistant" name="Conductor" status="streaming">The migration step timed out<InlineCitation index={1} source={{ href: "https://example.com/runbook", title: "Deploy runbook" }} /></Message><Reasoning duration={3}>Checked the last three runs.</Reasoning><Tool name="ci.get_logs" status="completed" input={{ run: 42 }} output="Timeout after 600s" /><Sources sources={[{ href: "https://example.com/runbook", title: "Deploy runbook" }]} /><Shimmer>Working…</Shimmer></Conversation>;
}
function PromptFixture({ streaming = false }: { readonly streaming?: boolean }): ReactElement {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState("");
  return <><PromptInput value={value} onValueChange={setValue} onSubmit={(text) => { setSent(text); setValue(""); }} status={streaming ? "streaming" : "ready"} onStop={() => setSent("stopped")} /><output data-sent="">{sent}</output></>;
}
function ConfirmationFixture({ decided = false }: { readonly decided?: boolean }): ReactElement {
  const [state, setState] = useState<"pending" | "approved" | "rejected">(decided ? "approved" : "pending");
  return <><Confirmation title="Merge pull request #42?" description="Two checks are still running." state={state} onApprove={() => setState("approved")} onReject={() => setState("rejected")} /><output data-decision="">{state}</output></>;
}
function SuggestionsFixture(): ReactElement {
  const [picked, setPicked] = useState("");
  return <><Suggestions><Suggestion suggestion="Show failed runs" onSelect={setPicked} /><Suggestion suggestion="Summarise approvals" onSelect={setPicked} /></Suggestions><output data-picked="">{picked}</output></>;
}
function ToolFixture(): ReactElement {
  return <Tool name="github.merge" status="awaiting-approval" input={{ pr: 42 }} defaultOpen><Confirmation title="Merge #42?" state="pending" onApprove={() => undefined} onReject={() => undefined} /></Tool>;
}

export const a11yScenarios: readonly A11yScenario[] = [
  { component: "Combobox", state: "default", keyboard: { kind: "steps", steps: [{ target: "[role=combobox]", keys: "{ArrowDown}{Enter}", check: "[data-choice]", expected: "one" }] }, render: () => <ComboFixture /> },
  { component: "Combobox", state: "disabled", render: () => <ComboFixture disabled /> },
  { component: "Combobox", state: "error", render: () => <ComboFixture error /> },
  { component: "MultiSelect", state: "default", keyboard: { kind: "steps", steps: [{ target: "[role=checkbox]", keys: " ", check: "[role=checkbox]", attribute: "aria-checked", expected: "true" }] }, render: () => <MultiFixture /> },
  { component: "FilterChip", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: "[data-outcome]", expected: "removed" }] }, render: () => <ChipFixture /> },
  { component: "FilterToolbar", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: "[data-outcome]", expected: "removed" }] }, render: () => <FilterToolbar><ChipFixture /></FilterToolbar> },
  { component: "DataTable", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: "[data-outcome]", expected: "one" }] }, render: () => <DataFixture /> },
  // CR-064: a selected row (pressed button on the selected fill), a sortable header and the two status vocabularies in one row.
  { component: "DataTable", state: "interactive", render: () => <DataTable label="Pull requests" rows={[{ id: "atlas/search#70", state: "merged" }, { id: "atlas/web#71", state: "open" }]} rowId={row => row.id} rowLabel={row => row.id} selectedId="atlas/search#70" onSelect={() => undefined} sort={{ column: "id", direction: "ascending" }} onSortChange={() => undefined} columns={[{ id: "id", header: "Pull request", sortable: true, cell: row => row.id }, { id: "state", header: "State", minInlineSize: "6rem" /* cdt-allow-literal: consumer-supplied column minimum under test */, cell: row => <Badge tone="accent">{row.state}</Badge> }, { id: "ci", header: "CI", cell: () => <StatusBadge appearance="plain" status="danger" icon="●" label="Failing" /> }]} /> },
  { component: "WorkbenchLayout", state: "default", keyboard: { kind: "steps", steps: [{ target: "input[type=range]", keys: "{ArrowRight}", check: "[data-width]", expected: "41" }] }, render: () => <WidthFixture /> },
  { component: "DetailInspector", state: "default", keyboard: { kind: "steps", steps: [{ target: "section button", keys: "{Escape}", check: "[data-outcome]", expected: "closed" }] }, render: () => <InspectorFixture /> },
  { component: "PathList", state: "default", keyboard: { kind: "steps", steps: [{ target: "summary", keys: "{Enter}", check: "details", attribute: "open", expected: "" }] }, render: () => <PathFixture /> },
  { component: "Breadcrumb", state: "default", keyboard: { kind: "focus" }, render: () => <Breadcrumb><a {...keyboardTarget} href="#parent">Parent</a><span aria-current="page">Child</span></Breadcrumb> },
  { component: "Skeleton", state: "default", keyboard: { kind: "static" }, render: () => <Skeleton label="Loading results" /> },
  // The announced outcome depends on the browser's clipboard: "Copied", "Copy unavailable …" or "Copy failed …"; all begin with "Cop".
  { component: "CopyButton", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: ".cdt-copy-feedback [role=status]", expected: "Cop" }] }, render: () => <CopyButton value="synthetic-id" /> },
  { component: "ProcessingStatus", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: "[data-outcome]", expected: "retried" }] }, render: () => <ProcessingFixture /> },
  { component: "Toast", state: "default", keyboard: { kind: "steps", steps: [{ target: ".cdt-toast__close", keys: "{Enter}", check: "[data-outcome]", expected: "closed" }] }, render: () => <ToastFixture /> },
  { component: "DatePicker", state: "default", keyboard: { kind: "overlay", role: "dialog" }, render: () => <DatePickerFixture /> },
  { component: "DatePicker", state: "open", axeSelector: '[role="dialog"]', render: () => <DatePickerFixture open /> },
  { component: "CommandPalette", state: "default", keyboard: { kind: "overlay", role: "dialog" }, render: () => <CommandFixture /> },
  { component: "CommandPalette", state: "open", axeSelector: '[role="dialog"]', render: () => <CommandFixture initiallyOpen /> },
  { component: "Pagination", state: "default", keyboard: { kind: "steps", steps: [{ target: "[aria-label='Page 2']", keys: "{Enter}", check: "[aria-current=page]", expected: "2" }] }, render: () => <PaginationFixture /> },
  { component: "AlertDialog", state: "default", keyboard: { kind: "overlay", role: "alertdialog" }, render: () => <AlertDialogFixture /> },
  { component: "AlertDialog", state: "open", axeSelector: '[role="alertdialog"]', render: () => <AlertDialogFixture open /> },
  // Radix moves the checked radio on arrow keys (roving focus); the output shows the new value.
  { component: "RadioGroup", state: "default", keyboard: { kind: "steps", steps: [{ target: "[role=radio][aria-checked=true]", keys: "{ArrowDown}", check: "[data-choice]", expected: "90" }] }, render: () => <RadioFixture /> },
  { component: "RadioGroup", state: "disabled", render: () => <RadioFixture disabled /> },
  { component: "RadioGroup", state: "error", render: () => <RadioFixture invalid /> },
  { component: "ToggleGroup", state: "default", keyboard: { kind: "steps", steps: [{ target: "[role=radio][data-state=on]", keys: "{ArrowRight}", check: "[data-view]", expected: "list" }, { target: "[role=radio][data-state=off]", keys: " ", check: "[data-view]", expected: "board" }] }, render: () => <ToggleFixture /> },
  { component: "Avatar", state: "default", keyboard: { kind: "static" }, render: () => <><Avatar name="Ada Lovelace" /><Avatar name="Grace Hopper" size="lg" /></> },
  { component: "Separator", state: "default", keyboard: { kind: "static" }, render: () => <><p>Above</p><Separator /><p>Below</p><Separator orientation="vertical" /><Separator decorative /></> },
  { component: "Stack", state: "default", keyboard: { kind: "static" }, render: () => <Stack as="ul" direction="row" gap={2}><li>One</li><li>Two</li></Stack> },
  { component: "Grid", state: "default", keyboard: { kind: "static" }, render: () => <Grid columns={2}><p>One</p><p>Two</p></Grid> },
  { component: "Heading", state: "default", keyboard: { kind: "static" }, render: () => <><Heading level={2}>Section</Heading><Heading level={3} size="minor">Subsection</Heading></> },
  { component: "Text", state: "default", keyboard: { kind: "static" }, render: () => <><Text>Body text.</Text><Text size="sm" tone="secondary">Secondary detail.</Text><Text size="xs" tone="muted" mono>run_8f2c</Text></> },
  { component: "Accordion", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: "button", attribute: "aria-expanded", expected: "true" }] }, render: () => <Accordion.Root type="single" collapsible><Accordion.Item value="limits"><Accordion.Trigger {...keyboardTarget}>Run limits</Accordion.Trigger><Accordion.Content>Fifty steps per run.</Accordion.Content></Accordion.Item><Accordion.Item value="audit"><Accordion.Trigger>Audit</Accordion.Trigger><Accordion.Content>Every step is recorded.</Accordion.Content></Accordion.Item></Accordion.Root> },
  { component: "Accordion", state: "open", render: () => <Accordion.Root type="multiple" defaultValue={["limits"]}><Accordion.Item value="limits"><Accordion.Trigger>Run limits</Accordion.Trigger><Accordion.Content>Fifty steps per run.</Accordion.Content></Accordion.Item><Accordion.Item value="audit" disabled><Accordion.Trigger>Audit</Accordion.Trigger><Accordion.Content>Every step is recorded.</Accordion.Content></Accordion.Item></Accordion.Root> },
  { component: "NumberInput", state: "default", keyboard: { kind: "steps", steps: [{ target: "input[type=number]", keys: "{ArrowUp}", check: "[data-count]", expected: "11" }] }, render: () => <NumberFixture /> },
  { component: "NumberInput", state: "error", render: () => <NumberFixture invalid /> },
  { component: "Conversation", state: "default", keyboard: { kind: "steps", steps: [{ target: "[role=log]", keys: "{ArrowDown}", check: "[role=log]", attribute: "tabindex", expected: "0" }] }, render: () => <ConversationFixture /> },
  { component: "PromptInput", state: "default", keyboard: { kind: "steps", steps: [{ target: "textarea", keys: "Deploy{Enter}", check: "[data-sent]", expected: "Deploy" }] }, render: () => <PromptFixture /> },
  { component: "PromptInput", state: "interactive", render: () => <PromptFixture streaming /> },
  { component: "Reasoning", state: "default", keyboard: { kind: "steps", steps: [{ target: ".cdt-reasoning__trigger", keys: "{Enter}", check: ".cdt-reasoning__trigger", attribute: "aria-expanded", expected: "true" }] }, render: () => <Reasoning duration={3}>Checked the last three runs.</Reasoning> },
  { component: "Tool", state: "open", render: () => <ToolFixture /> },
  { component: "Tool", state: "default", keyboard: { kind: "steps", steps: [{ target: ".cdt-tool__trigger", keys: "{Enter}", check: ".cdt-tool__trigger", attribute: "aria-expanded", expected: "true" }] }, render: () => <Tool name="ci.get_logs" status="running" input={{ run: 42 }} /> },
  { component: "Confirmation", state: "default", keyboard: { kind: "steps", steps: [{ target: ".cdt-confirmation button", keys: "{Enter}", check: "[data-decision]", expected: "approved" }] }, render: () => <ConfirmationFixture /> },
  { component: "Confirmation", state: "interactive", render: () => <ConfirmationFixture decided /> },
  { component: "Sources", state: "default", keyboard: { kind: "steps", steps: [{ target: ".cdt-sources__trigger", keys: "{Enter}", check: ".cdt-sources__trigger", attribute: "aria-expanded", expected: "true" }] }, render: () => <Sources sources={[{ href: "https://example.com/runbook", title: "Deploy runbook" }, { href: "https://example.com/pm", title: "Postmortem" }]} /> },
  { component: "InlineCitation", state: "default", keyboard: { kind: "overlay", role: "dialog" }, render: () => <p>Page the on-call first<InlineCitation {...keyboardTarget} index={1} source={{ href: "https://example.com/runbook", title: "Deploy runbook", description: "Steps for paging." }} />.</p> },
  { component: "Suggestions", state: "default", keyboard: { kind: "steps", steps: [{ target: ".cdt-suggestion", keys: "{Enter}", check: "[data-picked]", expected: "Show failed runs" }] }, render: () => <SuggestionsFixture /> },
  { component: "Shimmer", state: "default", keyboard: { kind: "static" }, render: () => <Shimmer>Searching the repository…</Shimmer> },
  { component: "Suggestion", state: "disabled", keyboard: { kind: "static" }, render: () => <Suggestion suggestion="Retry the last run" onSelect={() => undefined} disabled /> },
  { component: "Message", state: "error", keyboard: { kind: "static" }, render: () => <Message from="assistant" status="error">Partial answer</Message> },
  { component: "RelationGraph", state: "default", keyboard: { kind: "steps", steps: [{ target: "[aria-label='Graph view controls'] button", keys: "{Enter}", check: "output", expected: "150%" }] }, render: () => <RelationFixture /> },
  // Radix roving focus moves focus from an arrow key inside a `setTimeout` (react-roving-focus
  // defers the imperative focus out of the keydown handler). Sent as one burst, `{Enter}` could
  // reach the still-focused "Results" trigger before that timer ran and re-activate it — the CI
  // flake that failed 2 of 4 runs on PR #32. Waiting for focus to land first removes the race
  // without weakening the assertion (CR-042).
  { component: "Tabs", state: "default", keyboard: { kind: "steps", steps: [{ target: "[role=tab]", keys: "{ArrowRight}", check: "[role=tab]:focus", expected: "History" }, { target: "[role=tab]:focus", keys: "{Enter}", check: "[role=tab][data-state=active]", expected: "History" }] }, render: () => <Tabs.Root defaultValue="results"><Tabs.List aria-label="Views"><Tabs.Trigger value="results">Results</Tabs.Trigger><Tabs.Trigger value="history">History</Tabs.Trigger></Tabs.List><Tabs.Content value="results">Results panel</Tabs.Content><Tabs.Content value="history">History panel</Tabs.Content></Tabs.Root> },
  { component: "Popover", state: "default", keyboard: { kind: "overlay", role: "dialog" }, render: () => <PopoverFixture /> },
  { component: "Popover", state: "open", axeSelector: '[role="dialog"]', render: () => <PopoverFixture open /> },
  { component: "Collapsible", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: "button", attribute: "aria-expanded", expected: "true" }] }, render: () => <Collapsible.Root><Collapsible.Trigger>Show evidence</Collapsible.Trigger><Collapsible.Content>Evidence</Collapsible.Content></Collapsible.Root> },
  { component: "AppShellNavTrigger", state: "default", keyboard: { kind: "steps", steps: [{ target: "button", keys: "{Enter}", check: "button", attribute: "aria-expanded", expected: "true" }, { target: "[role=dialog] a", keys: "{Escape}", check: "button", attribute: "aria-expanded", expected: "false" }] }, render: () => <NewShellFixture /> },

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
