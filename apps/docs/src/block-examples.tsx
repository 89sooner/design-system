// Refs: CR-051 FR-DOC-009 W-063 W-064 W-065
//
// Block examples: three everyday compositions built only from public @conductor-by-89soone/react
// components and cdt-* classes. The data is synthetic and nothing here calls a network API. The
// rules (filtering, sorting, validation, change tracking) live in blocks.ts as pure functions.
import { STATUS_ICONS } from "@conductor-by-89soone/tokens";
import { Banner, Breadcrumb, Button, Checkbox, Dialog, EmptyState, Field, FilterChip, FilterToolbar, Panel, Select, StatusBadge, Switch, Table, TextArea, TextField, type Status } from "@conductor-by-89soone/react";
import { CheckCircle2, FolderPlus, Loader, Lock, PauseCircle, SearchX, XCircle, type LucideIcon } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { changedKeys, DESCRIPTION_MAX, emptyFilter, filterDeployments, isFiltered, NAME_MAX, resultSummary, sortBySeconds, toggleDirection, validateSettings, type Deployment, type DeploymentFilter, type Settings, type SettingsErrors, type SortDirection } from "./blocks";

const iconProps = { size: 14, strokeWidth: 2 } as const;

/** Lucide components for the statuses these examples use, keyed by the `STATUS_ICONS` name. */
const statusIcons: Readonly<Partial<Record<Status, LucideIcon>>> = { success: CheckCircle2, running: Loader, waiting: PauseCircle, danger: XCircle };
const statusLabels: Readonly<Partial<Record<Status, string>>> = { success: "Succeeded", running: "Running", waiting: "Awaiting approval", danger: "Failed" };

function StatusCell({ status }: { readonly status: Status }) {
  const Icon = statusIcons[status]!;
  return <StatusBadge status={status} icon={<Icon {...iconProps} data-icon={STATUS_ICONS[status]} />} label={statusLabels[status]!} />;
}

function BlockHeader({ index, id, title, lead }: { readonly index: string; readonly id: string; readonly title: string; readonly lead: string }) {
  return <>
    <Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>Blocks</span></Breadcrumb>
    <div><p className="docs-eyebrow">BLOCK / {index}</p><h1 id={id}>{title}</h1><p className="docs-lead">{lead}</p></div>
  </>;
}

/* ---------- W-063 empty states ---------- */

function EmptyCase({ title, rule, children }: { readonly title: string; readonly rule: string; readonly children: ReactNode }) {
  const headingId = useId();
  return <Panel as="section" className="docs-block-case" aria-labelledby={headingId}>
    <h2 id={headingId}>{title}</h2>
    <p className="cdt-muted">{rule}</p>
    {children}
  </Panel>;
}

/** A disabled button's `title` is not reliably announced or visible, so the reason is also text the button points to. */
const EXPORT_BLOCKED = "You need permission to view audit logs.";

/** "1 change" · "2 changes" — 영어 카운트 문구의 단수/복수를 맞춘다. */
const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

export function EmptyStatesExample() {
  const [projects, setProjects] = useState<readonly string[]>([]);
  const [query, setQuery] = useState("billing");
  const [feedback, setFeedback] = useState("");
  return <section className="cdt-page docs-block-example" aria-labelledby="empty-title">
    <BlockHeader index="01" id="empty-title" title="Empty states" lead="Show why something is empty and what to do next." />
    <Banner tone="info">Synthetic data · not connected to a live API. Buttons only change state on this page.</Banner>
    <div className="docs-block-grid">
      <EmptyCase title="First use" rule="Nothing has been created yet. Say what can be made and offer one first action.">
        {projects.length === 0
          ? <EmptyState icon={<FolderPlus size={20} strokeWidth={1.75} />} title="No projects yet" description="Create a project to manage deployments and alerts in one place." action={<Button variant="primary" onClick={() => { setProjects(["atlas-web"]); setFeedback("Created synthetic project atlas-web"); }}>Create your first project</Button>} />
          : <><ul className="docs-block-list">{projects.map(name => <li key={name} className="cdt-mono">{name}</li>)}</ul><Button variant="ghost" onClick={() => { setProjects([]); setFeedback("Reset to first use"); }}>Back to first use</Button></>}
      </EmptyCase>
      <EmptyCase title="No search results" rule="Data exists but nothing matches. Show the applied filters and how to clear them.">
        {query === ""
          ? <><p>Showing all 12 with no filters.</p><Button variant="ghost" onClick={() => setQuery("billing")}>Reapply filter</Button></>
          : <EmptyState icon={<SearchX size={20} strokeWidth={1.75} />} title={`No services match "${query}"`} description="0 of 12 shown. Check the spelling or clear the filter." action={<Button onClick={() => { setQuery(""); setFeedback("Search filter cleared · showing all 12"); }}>Clear search filter</Button>} />}
      </EmptyCase>
      <EmptyCase title="No permission" rule="Don't show what can't be seen as zero results. Say why and where to ask, and give blocked actions a reason.">
        <EmptyState icon={<Lock size={20} strokeWidth={1.75} />} title="You can't view this project's audit logs" description="Ask an organization admin for audit log access. The logs have not been deleted." action={<><Button blockedReason={EXPORT_BLOCKED} aria-describedby="empty-export-reason">Export logs</Button><p id="empty-export-reason" className="cdt-muted">{EXPORT_BLOCKED}</p></>} />
      </EmptyCase>
      <EmptyCase title="Load failed" rule="Don't turn an error into an empty list. Say it failed and how to retry.">
        <Banner tone="danger" title="Couldn't load deployments" action={<Button onClick={() => setFeedback("Logged 1 synthetic retry · no network request")}>Retry</Button>}>The last list loaded is not shown as up to date.</Banner>
      </EmptyCase>
    </div>
    <p role="status">{feedback}</p>
  </section>;
}

/* ---------- W-064 filter table ---------- */

const services = ["web-console", "event-worker", "search-api", "billing-sync", "auth-gateway", "report-builder"] as const;
const rotation: readonly Status[] = ["success", "running", "danger", "success", "waiting", "success"];
const deployments: readonly Deployment[] = Array.from({ length: 12 }, (_, index) => ({
  id: `deploy-${index + 1}`,
  service: services[index % services.length]!,
  environment: index % 2 === 0 ? "production" : "staging",
  status: rotation[index % rotation.length]!,
  seconds: 18 + ((index * 37) % 140),
}));
const statusChoices: readonly (Status | "all")[] = ["all", "success", "running", "waiting", "danger"];

export function FilterTableExample() {
  const [filter, setFilter] = useState<DeploymentFilter>(emptyFilter);
  const [direction, setDirection] = useState<SortDirection>("descending");
  const searchRef = useRef<HTMLInputElement>(null);
  const rows = sortBySeconds(filterDeployments(deployments, filter), direction);
  const clear = () => { setFilter(emptyFilter); searchRef.current?.focus(); };
  return <section className="cdt-page docs-block-example" aria-labelledby="filter-title">
    <BlockHeader index="02" id="filter-title" title="Filter table" lead="Narrow with filters, keep the applied filters visible, and clear them in one step." />
    <Banner tone="info"><span>12 synthetic deployments · not connected to a live API. For large result sets with selection and preview, use the DataTable in the <Link className="docs-inline-link" to="/examples/workbench">Search workbench</Link>.</span></Banner>
    <FilterToolbar>
      <Field label="Search services"><TextField ref={searchRef} type="search" value={filter.query} placeholder="Service name" onChange={event => setFilter({ ...filter, query: event.target.value })} /></Field>
      <Field label="Status">
        <Select.Root value={filter.status} onValueChange={value => setFilter({ ...filter, status: value as DeploymentFilter["status"] })}>
          <Select.Trigger><Select.Value /></Select.Trigger>
          <Select.Content>{statusChoices.map(value => <Select.Item key={value} value={value}>{value === "all" ? "All statuses" : statusLabels[value]}</Select.Item>)}</Select.Content>
        </Select.Root>
      </Field>
    </FilterToolbar>
    {isFiltered(filter) && <FilterToolbar role="group" aria-label="Applied filters">
      {filter.query.trim() !== "" && <FilterChip removeLabel="Remove search filter" onRemove={() => setFilter({ ...filter, query: "" })}>Search: {filter.query.trim()}</FilterChip>}
      {filter.status !== "all" && <FilterChip removeLabel="Remove status filter" onRemove={() => setFilter({ ...filter, status: "all" })}>Status: {statusLabels[filter.status]}</FilterChip>}
      <Button variant="ghost" size="sm" onClick={clear}>Clear all filters</Button>
    </FilterToolbar>}
    <p role="status" className="cdt-muted">{resultSummary(rows.length, deployments.length)}</p>
    {rows.length === 0
      ? <EmptyState icon={<SearchX size={20} strokeWidth={1.75} />} title="No deployments match these filters" description={`0 of ${deployments.length} shown. Clear the filters to return to the full list.`} action={<Button onClick={clear}>Clear all filters</Button>} />
      : <Table caption="Synthetic deployments">
        <Table.Head><Table.Row>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Environment</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell aria-sort={direction}><button type="button" className="docs-sort-button" onClick={() => setDirection(toggleDirection)}>Duration</button></Table.HeaderCell>
        </Table.Row></Table.Head>
        <Table.Body>{rows.map(row => <Table.Row key={row.id}>
          <Table.Cell><strong className="cdt-mono">{row.service}</strong></Table.Cell>
          <Table.Cell>{row.environment}</Table.Cell>
          <Table.Cell><StatusCell status={row.status} /></Table.Cell>
          <Table.Cell numeric>{row.seconds}s</Table.Cell>
        </Table.Row>)}</Table.Body>
      </Table>}
  </section>;
}

/* ---------- W-065 settings form ---------- */

const initialSettings: Settings = { name: "atlas-web", description: "", region: "seoul", emailAlerts: true, weeklyDigest: false };
const regionLabels: Readonly<Record<Settings["region"], string>> = { seoul: "Seoul (ap-northeast-2)", tokyo: "Tokyo (ap-northeast-1)", virginia: "Virginia (us-east-1)" };
const fieldIds: Readonly<Partial<Record<keyof Settings, string>>> = { name: "settings-name", description: "settings-description" };
const fieldLabels: Readonly<Partial<Record<keyof Settings, string>>> = { name: "Project name", description: "Description" };

export function SettingsFormExample() {
  const [saved, setSaved] = useState<Settings>(initialSettings);
  const [draft, setDraft] = useState<Settings>(initialSettings);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [feedback, setFeedback] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const changed = changedKeys(saved, draft);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => { setDraft(current => ({ ...current, [key]: value })); setFeedback(""); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = validateSettings(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) { setFeedback(""); requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    setSaved(draft);
    setFeedback(`Synthetic save complete · ${plural(changed.length, "change")} · no network request`);
  };
  const errorEntries = Object.entries(errors) as [keyof Settings, string][];
  return <section className="cdt-page docs-block-example" aria-labelledby="settings-title">
    <BlockHeader index="03" id="settings-title" title="Settings form" lead="Errors appear beside the field and in a summary; unsaved changes stay visible." />
    <Banner tone="info">Synthetic settings · not connected to a live API. Save and delete only change state on this page.</Banner>
    <form className="docs-settings-form" noValidate onSubmit={submit}>
      {errorEntries.length > 0 && <div ref={summaryRef} tabIndex={-1} className="docs-settings-form__summary"><Banner tone="danger" title={`Couldn't save · ${plural(errorEntries.length, "error")}`}><ul>{errorEntries.map(([key, message]) => <li key={key}><a href={`#${fieldIds[key]}`} onClick={event => { event.preventDefault(); document.getElementById(fieldIds[key]!)?.focus(); }}>{fieldLabels[key]}: {message}</a></li>)}</ul></Banner></div>}
      <Panel as="section" aria-labelledby="settings-general">
        <h2 id="settings-general">General</h2>
        <Field id="settings-name" label="Project name" required description={`Used in URLs and alerts. Up to ${NAME_MAX} characters.`} error={errors.name}><TextField value={draft.name} onChange={event => update("name", event.target.value)} /></Field>
        <Field id="settings-description" label="Description" description={`${draft.description.length}/${DESCRIPTION_MAX} characters`} error={errors.description}><TextArea value={draft.description} onChange={event => update("description", event.target.value)} /></Field>
        <Field label="Deployment region" description="A new region applies from the next deployment.">
          <Select.Root value={draft.region} onValueChange={value => update("region", value as Settings["region"])}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>{(Object.keys(regionLabels) as Settings["region"][]).map(region => <Select.Item key={region} value={region}>{regionLabels[region]}</Select.Item>)}</Select.Content>
          </Select.Root>
        </Field>
      </Panel>
      <Panel as="section" aria-labelledby="settings-alerts">
        <h2 id="settings-alerts">Alerts</h2>
        <Field label="Email alerts for failed deployments" description="Sent to project admins for every failed deployment."><Switch checked={draft.emailAlerts} onCheckedChange={value => update("emailAlerts", value)} /></Field>
        <Field label="Get a weekly digest"><Checkbox checked={draft.weeklyDigest} onCheckedChange={value => update("weeklyDigest", value === true)} /></Field>
      </Panel>
      <div className="docs-settings-form__actions">
        <p className="cdt-muted" aria-live="polite">{changed.length === 0 ? "No unsaved changes" : plural(changed.length, "unsaved change")}</p>
        <Button type="button" variant="ghost" disabled={changed.length === 0} onClick={() => { setDraft(saved); setErrors({}); setFeedback("Reverted to saved values"); }}>Discard changes</Button>
        <Button type="submit" variant="primary">Save</Button>
      </div>
    </form>
    <Panel as="section" aria-labelledby="settings-danger" className="docs-settings-form__danger">
      <h2 id="settings-danger">Danger zone</h2>
      <p className="cdt-muted">Deleting a project also removes its deployment history and alert settings. Actions that can't be undone go through a confirmation dialog.</p>
      <Dialog.Root>
        <Dialog.Trigger asChild><Button tone="danger">Delete project</Button></Dialog.Trigger>
        <Dialog.Content size="sm">
          <Dialog.Title>Delete project {saved.name}?</Dialog.Title>
          <Dialog.Description>Its deployment history and alert settings are deleted too. This can't be undone.</Dialog.Description>
          <div className="docs-settings-form__dialog-actions">
            <Dialog.Close asChild><Button variant="ghost">Cancel</Button></Dialog.Close>
            <Dialog.Close asChild><Button variant="primary" tone="danger" onClick={() => setFeedback("Logged 1 synthetic delete request · no network request")}>Delete</Button></Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Panel>
    <p role="status">{feedback}</p>
  </section>;
}
