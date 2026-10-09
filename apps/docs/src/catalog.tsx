// Refs: WP-020 CR-042 FR-DOC-003 FR-DX-002 FR-CSS-004 W-020 W-021
//
// W-020 (catalog) and W-021 (component detail). Every tile and the detail stage render the real
// public component from `@conductor-by-89soone/react`; the metadata (family, root class, props)
// comes from `scripts/build-component-catalog.mjs`, which fails the build for any public export
// without a preview `case` below. Only public components and public `cdt-*` classes are composed.
// W-020/W-021 styles ride with this lazy chunk so the landing never downloads them (CR-042, NFR-001).
import "./styles/catalog.css";
import * as Components from "@conductor-by-89soone/react";
import {
  Activity,
  AppWindow,
  ArrowLeft,
  ArrowUpRight,
  BellRing,
  Boxes,
  Braces,
  Code2,
  LayoutPanelTop,
  MousePointerClick,
  PanelsTopLeft,
  Search,
  SearchCode,
  SearchX,
  Table2,
  Tag,
  TextCursorInput,
  ToggleLeft,
  Waypoints,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import generated from "./generated/component-meta.json";
import { Component, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CopyCode } from "./guides";

export interface ComponentMeta {
  readonly name: string;
  /** Catalog family (W-020); the generator orders components by family, then by member. */
  readonly family: string;
  /** Root `cdt-*` class of the rendered element — the framework-agnostic contract (FR-CSS-004). */
  readonly className: string;
  readonly propsTypeName: string;
  readonly props: readonly { readonly name: string; readonly required: boolean; readonly type: string }[];
}
export const componentMeta = generated as readonly ComponentMeta[];

export interface ComponentFamily {
  readonly name: string;
  readonly members: readonly ComponentMeta[];
}

/** Families in generator order, each with its members in generator order. */
export const componentFamilies: readonly ComponentFamily[] = (() => {
  const grouped = new Map<string, ComponentMeta[]>();
  for (const component of componentMeta) {
    const members = grouped.get(component.family);
    if (members === undefined) grouped.set(component.family, [component]);
    else members.push(component);
  }
  return [...grouped].map(([name, members]) => ({ name, members }));
})();

interface FamilyInfo {
  readonly icon: LucideIcon;
  readonly note: string;
}

// One line per family. Copy is factual and names only what the family ships.
const FAMILY_INFO: Readonly<Record<string, FamilyInfo>> = {
  Actions: { icon: MousePointerClick, note: "Primary, secondary and ghost buttons in neutral, accent and danger tones, plus the icon-only form." },
  Surfaces: { icon: LayoutPanelTop, note: "Cards, panels and the grid that lays them out. Depth comes from luminance steps and a hairline, not heavy shadow." },
  Status: { icon: Tag, note: "Badges, status badges and severity tags that carry colour, icon and text as three separate channels." },
  Data: { icon: Table2, note: "Tables, timelines, code blocks and keyboard hints for dense operational reading." },
  Overlays: { icon: AppWindow, note: "Dialogs, drawers, tooltips, menus and popovers. Focus, roles and dismissal are delegated to Radix." },
  Forms: { icon: TextCursorInput, note: "Fields and controls that share one label, description, error and required contract." },
  Feedback: { icon: BellRing, note: "Banners, empty states, meters, rings, spinners and skeletons for every waiting and loading state." },
  Shell: { icon: PanelsTopLeft, note: "The application frame: shell, navigation list, top bar and the mobile navigation trigger." },
  Interaction: { icon: ToggleLeft, note: "Tabs and collapsibles for progressive disclosure without leaving the screen." },
  "Search workbench": { icon: SearchCode, note: "Comboboxes, filters, the data table, the inspector layout and the small parts behind the search workbench." },
  Relations: { icon: Waypoints, note: "A relation graph that renders nodes and edges with their evidence and ambiguity surfaced." },
  Operations: { icon: Activity, note: "Pipeline stages with a status, a detail line and an operator action per stage." },
};
const UNFILED_FAMILY: FamilyInfo = { icon: Boxes, note: "Public components without a family note yet." };
const familyInfo = (family: string): FamilyInfo => FAMILY_INFO[family] ?? UNFILED_FAMILY;
const familyId = (family: string): string => `family-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

const normalize = (text: string): string => text.trim().toLowerCase();
/** Name, family or root class contains the query; an empty query matches everything. */
function matchesQuery(component: ComponentMeta, query: string): boolean {
  return query === "" || component.name.toLowerCase().includes(query) || component.family.toLowerCase().includes(query) || component.className.includes(query);
}

class PreviewBoundary extends Component<{ readonly children: ReactNode }, { readonly failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  override componentDidCatch(): void {}
  override render(): ReactNode { return this.state.failed ? <Components.Banner tone="danger">This preview could not render.</Components.Banner> : this.props.children; }
}

// FR-CMP-010~013 · WP-029~032: previews are synthetic, local interactions.
const previewOptions = [{ id: "client", label: "Client changes" }, { id: "worker", label: "Worker changes" }, { id: "unavailable", label: "Unavailable", disabled: true }];
function SearchControlPreview({ kind }: { readonly kind: string }) {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState<string | null>(null);
  const [values, setValues] = useState<readonly string[]>(["client"]);
  const [chip, setChip] = useState(true);
  if (kind === "Combobox") return <><Components.Combobox label="Find a category" options={previewOptions.filter(option => option.label.toLowerCase().includes(query.toLowerCase()))} query={query} onQueryChange={setQuery} value={value} onValueChange={setValue} /><p role="status">Selected: {value ?? "none"}</p></>;
  if (kind === "MultiSelect") return <Components.MultiSelect label="Categories" options={previewOptions} value={values} onValueChange={setValues} />;
  return <Components.FilterToolbar>{chip ? <Components.FilterChip removeLabel="Remove client category" onRemove={() => setChip(false)}>Client changes</Components.FilterChip> : <Components.Button onClick={() => setChip(true)}>Restore filter</Components.Button>}<span role="status">{chip ? "One filter applied" : "No filters applied"}</span></Components.FilterToolbar>;
}
function WorkbenchPreview() {
  const rows = [{ id: "sample:a", title: "검색 조건 보존" }, { id: "sample:b", title: "Preserve investigation context" }];
  const [selected, setSelected] = useState<string | null>(null);
  const [width, setWidth] = useState(40);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const row = rows.find(item => item.id === selected);
  return <Components.WorkbenchLayout width={width} onWidthChange={setWidth} inspector={row && <Components.DetailInspector label="Selected change" onClose={() => setSelected(null)} returnFocusRef={trigger}><p>{row.title}</p><code>{row.id}</code><Components.CopyButton value={row.id} /></Components.DetailInspector>}><Components.DataTable label="Synthetic loaded changes" rows={rows} columns={[{ id: "title", header: "Title", cell: item => item.title }]} rowId={item => item.id} rowLabel={item => item.title} selectedId={selected} onSelect={(id, button) => { trigger.current = button; setSelected(id); }} /><Link to="/examples/workbench">Full search workbench</Link></Components.WorkbenchLayout>;
}
function InspectorPreview() {
  const [open, setOpen] = useState(true);
  const trigger = useRef<HTMLButtonElement | null>(null);
  return <><Components.Button ref={trigger} onClick={() => setOpen(true)}>Open preview</Components.Button>{open && <Components.DetailInspector label="Synthetic detail" onClose={() => setOpen(false)} returnFocusRef={trigger}><p>Close or press Escape to return to the trigger.</p></Components.DetailInspector>}</>;
}
function PathPreview() {
  const [selected, setSelected] = useState<string>();
  return <><Components.PathList items={[{ id: "src", label: "src", children: [{ id: "src/search", label: "search.tsx" }, { id: "src/filter", label: "filter.tsx" }] }]} selectedId={selected} onPathSelect={setSelected} /><p role="status">Selected path: {selected ?? "none"}</p></>;
}
function ProcessingPreview() {
  const [requested, setRequested] = useState(false);
  return <Components.ProcessingStatus label="Synthetic pipeline" stages={[{ id: "received", label: "Received", status: "complete", detail: "Receipt confirmed; this does not confirm indexing." }, { id: "indexed", label: "Index", status: requested ? "pending" : "failed", detail: requested ? "Local retry queued; no service request sent." : "Synthetic failure; operator action is available.", action: requested ? undefined : { label: "Queue local retry", onAction: () => setRequested(true) } }]} />;
}
// The tile clips this shell to a thumbnail (see CLIPPED_PREVIEWS), so the compact copy stays short enough for the narrow content column.
function ShellTriggerPreview({ compact = false }: { readonly compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return <Components.AppShell navOpen={open} onNavOpenChange={setOpen} nav={<p>Synthetic navigation</p>} skipLinkLabel="Skip menu preview" topBar={<Components.AppShellNavTrigger>Toggle navigation</Components.AppShellNavTrigger>}><p role="status">Navigation {open ? "requested open" : "closed"}.{compact ? null : " Mobile drawer applies below the navigation breakpoint."}</p></Components.AppShell>;
}

export function ComponentPreview({ compact = false, forceError = false, name }: { readonly compact?: boolean; readonly forceError?: boolean; readonly name: string }) {
  if (forceError) throw new Error(`Forced ${name} preview failure`);
  switch (name) {
    case "Button": { if (compact) return <Components.Button tone="accent">Deploy release</Components.Button>; const labels = { neutral: "Continue", accent: "Deploy", danger: "Delete" } as const; return <div className="docs-button-matrix">{(["primary", "secondary", "ghost"] as const).map((variant) => <div className="docs-button-matrix__row" key={variant}><span className="docs-preview-meta">{variant}</span><div className="docs-preview-row">{(["neutral", "accent", "danger"] as const).map((tone) => <Components.Button key={`${variant}-${tone}`} variant={variant} tone={tone}>{labels[tone]}</Components.Button>)}</div></div>)}</div>; }
    case "IconButton": return <Components.IconButton aria-label="Open command palette" icon="⌘" />;
    case "Card": return <Components.Card><div className="docs-preview-card"><span className="docs-preview-meta">Operational status</span><strong>All systems nominal</strong><span className="cdt-muted">Last checked 2 minutes ago</span></div></Components.Card>;
    case "CardGrid": return <Components.CardGrid><Components.Card><div className="docs-preview-card"><span className="docs-preview-meta">Requests</span><strong className="docs-preview-value">24.8k</strong></div></Components.Card><Components.Card><div className="docs-preview-card"><span className="docs-preview-meta">Success rate</span><strong className="docs-preview-value">99.98%</strong></div></Components.Card></Components.CardGrid>;
    case "Panel": return <Components.Panel><div className="docs-preview-card"><span className="docs-preview-meta">Environment</span><strong>Production</strong><span className="cdt-muted">Region ap-northeast-2</span></div></Components.Panel>;
    case "Badge": return <div className="docs-preview-row">{(["neutral", "accent", "info", "success", "warning", "danger"] as const).map((tone) => <Components.Badge key={tone} tone={tone}>{tone}</Components.Badge>)}</div>;
    case "StatusBadge": return <Components.StatusBadge status="running" icon="●" label="Deployment running" />;
    case "SeverityTag": return <Components.SeverityTag severity="destructive" icon="!" label="Destructive" />;
    case "Table": return <Components.Table caption="Recent deployments"><Components.Table.Head><Components.Table.Row><Components.Table.HeaderCell>Service</Components.Table.HeaderCell><Components.Table.HeaderCell>Status</Components.Table.HeaderCell><Components.Table.HeaderCell>Duration</Components.Table.HeaderCell></Components.Table.Row></Components.Table.Head><Components.Table.Body><Components.Table.Row><Components.Table.Cell><strong>web-console</strong></Components.Table.Cell><Components.Table.Cell><Components.StatusBadge status="success" icon="✓" label="Healthy" /></Components.Table.Cell><Components.Table.Cell numeric>42s</Components.Table.Cell></Components.Table.Row><Components.Table.Row><Components.Table.Cell><strong>event-worker</strong></Components.Table.Cell><Components.Table.Cell><Components.StatusBadge status="running" icon="●" label="Running" /></Components.Table.Cell><Components.Table.Cell numeric>18s</Components.Table.Cell></Components.Table.Row></Components.Table.Body></Components.Table>;
    case "Timeline": return <Components.Timeline><Components.Timeline.Step>Validated</Components.Timeline.Step><Components.Timeline.Step selected>Deploying to production</Components.Timeline.Step><Components.Timeline.Step>Traffic migration</Components.Timeline.Step></Components.Timeline>;
    case "CodeBlock": return <Components.CodeBlock language="tsx" code="&lt;Button&gt;Save&lt;/Button&gt;" />;
    case "Kbd": return <Components.Kbd>Esc</Components.Kbd>;
    case "Dialog": return <Components.Dialog.Root><Components.Dialog.Trigger asChild><Components.Button>Open dialog</Components.Button></Components.Dialog.Trigger><Components.Dialog.Content><Components.Dialog.Title>Promote to production?</Components.Dialog.Title><Components.Dialog.Description>The release passed every required check. This action will make it available to all users.</Components.Dialog.Description><div className="docs-dialog-actions"><Components.Dialog.Close asChild><Components.Button variant="ghost">Cancel</Components.Button></Components.Dialog.Close><Components.Dialog.Close asChild><Components.Button variant="primary">Promote release</Components.Button></Components.Dialog.Close></div></Components.Dialog.Content></Components.Dialog.Root>;
    case "Drawer": return <Components.Drawer.Root><Components.Drawer.Trigger asChild><Components.Button>Open drawer</Components.Button></Components.Drawer.Trigger><Components.Drawer.Content><Components.Drawer.Title>Drawer</Components.Drawer.Title></Components.Drawer.Content></Components.Drawer.Root>;
    case "Tooltip": return <Components.Tooltip.Provider><Components.Tooltip.Root><Components.Tooltip.Trigger asChild><Components.Button>Tooltip trigger</Components.Button></Components.Tooltip.Trigger><Components.Tooltip.Content>Tooltip</Components.Tooltip.Content></Components.Tooltip.Root></Components.Tooltip.Provider>;
    case "DropdownMenu": return <Components.DropdownMenu.Root><Components.DropdownMenu.Trigger asChild><Components.Button>Menu trigger</Components.Button></Components.DropdownMenu.Trigger><Components.DropdownMenu.Content><Components.DropdownMenu.Item>Item</Components.DropdownMenu.Item></Components.DropdownMenu.Content></Components.DropdownMenu.Root>;
    case "Field": return <Components.Field label="Workspace name" description="Shown to everyone in this workspace."><Components.TextField defaultValue="Conductor" /></Components.Field>;
    case "TextField": return <Components.Field label="Search components" description="Filter by component name or category."><Components.TextField defaultValue="Button" /></Components.Field>;
    case "TextArea": return <Components.Field label="Release notes" description="Summarize the user-visible changes in this release."><Components.TextArea defaultValue="Improved component clarity and visual hierarchy." /></Components.Field>;
    case "Select": return <Components.Field label="Environment" description="Choose where this release will be deployed."><Components.Select.Root defaultValue="production"><Components.Select.Trigger><Components.Select.Value placeholder="Choose environment" /></Components.Select.Trigger><Components.Select.Content><Components.Select.Item value="production">Production</Components.Select.Item><Components.Select.Item value="staging">Staging</Components.Select.Item><Components.Select.Item value="development">Development</Components.Select.Item></Components.Select.Content></Components.Select.Root></Components.Field>;
    case "Switch": return <div className="docs-setting-row"><div><strong>Automatic deployment</strong><span className="cdt-muted">Promote after required checks pass</span></div><Components.Switch aria-label="Automatic deployment" defaultChecked /></div>;
    case "Checkbox": return <Components.Field label="Include prerelease versions" description="Show release candidates in component search results."><Components.Checkbox defaultChecked /></Components.Field>;
    case "Banner": return <Components.Banner tone="info" icon="i" title="Release ready" action={<Components.Button size="sm" variant="ghost">View checks</Components.Button>}>All required checks passed. You can safely promote this version.</Components.Banner>;
    case "EmptyState": return <Components.EmptyState icon="+" title="No environments yet" description="Create an environment to start deploying this project." action={<Components.Button variant="primary">Create environment</Components.Button>} />;
    case "Meter": return <div className="docs-meter"><div className="docs-meter__label"><strong>Monthly usage</strong><span className="cdt-muted">60 of 100 GB</span></div><Components.Meter aria-label="Monthly usage" value={60} valueText="60%" /></div>;
    case "ProgressRing": return <Components.ProgressRing aria-label="Example progress" value={60} valueText="60%" />;
    case "Spinner": return <Components.Spinner label="Loading" />;
    case "AppShell": return <Components.AppShell nav={<span>Navigation</span>} skipLinkLabel="Skip to preview content">Shell content</Components.AppShell>;
    case "NavList": return <Components.NavList aria-label="Example navigation" items={[{ id: "overview", label: "Overview", href: "#overview", active: true }]} renderLink={(item, props) => <a href={item.href} {...props} />} />;
    case "TopBar": return <Components.TopBar eyebrow="Design system" title="Components" actions={<Components.IconButton aria-label="Example action" icon="●" />} />;
    case "Tabs": return <Components.Tabs.Root defaultValue="results"><Components.Tabs.List aria-label="Preview sections"><Components.Tabs.Trigger value="results">Results</Components.Tabs.Trigger><Components.Tabs.Trigger value="history">History</Components.Tabs.Trigger></Components.Tabs.List><Components.Tabs.Content value="results">Loaded results stay in this panel.</Components.Tabs.Content><Components.Tabs.Content value="history">Synthetic activity history.</Components.Tabs.Content></Components.Tabs.Root>;
    case "Popover": return <Components.Popover.Root><Components.Popover.Trigger asChild><Components.Button>Show filter help</Components.Button></Components.Popover.Trigger><Components.Popover.Content aria-label="Filter help"><p>Conditions narrow loaded results.</p><Components.Popover.Close asChild><Components.Button>Close help</Components.Button></Components.Popover.Close></Components.Popover.Content></Components.Popover.Root>;
    case "Collapsible": return <Components.Collapsible.Root><Components.Collapsible.Trigger>Show evidence</Components.Collapsible.Trigger><Components.Collapsible.Content>Synthetic evidence is shown without a network request.</Components.Collapsible.Content></Components.Collapsible.Root>;
    case "Combobox": return <SearchControlPreview kind="Combobox" />;
    case "MultiSelect": return <SearchControlPreview kind="MultiSelect" />;
    case "FilterChip": return <SearchControlPreview kind="FilterChip" />;
    case "FilterToolbar": return <SearchControlPreview kind="FilterToolbar" />;
    case "DataTable": return <WorkbenchPreview />;
    case "WorkbenchLayout": return <WorkbenchPreview />;
    case "DetailInspector": return <InspectorPreview />;
    case "PathList": return <PathPreview />;
    case "Breadcrumb": return <Components.Breadcrumb aria-label="Example location"><Link to="/components">Components</Link><span aria-hidden="true"> / </span><span aria-current="page">Breadcrumb</span></Components.Breadcrumb>;
    case "Skeleton": return <Components.Skeleton label="Loading synthetic results" />;
    case "CopyButton": return <><code>sample:change:1</code><Components.CopyButton value="sample:change:1" label="Copy sample ID" /></>;
    case "ProcessingStatus": return <ProcessingPreview />;
    case "RelationGraph": return <Components.RelationGraph label="Synthetic relationships" nodes={[{ id: "sample:a", label: "Change A" }, { id: "sample:b", label: "Change B" }]} edges={[{ id: "sample:edge", source: "sample:a", target: "sample:b", type: "references", label: "references", evidence: "Synthetic reference example", ambiguous: true }]} stateMessage="Synthetic data; no production API connected." />;
    case "AppShellNavTrigger": return <ShellTriggerPreview compact={compact} />;
    default: throw new Error(`Unknown component preview: ${name}`);
  }
}

// The public `.cdt-app-shell__nav` is a sticky 100vh column, so an AppShell preview is as tall as the
// viewport. The tile clips these two to a thumbnail through the stage wrapper (never inside `.docs-preview`);
// the detail stage still shows the full shell.
const CLIPPED_PREVIEWS: ReadonlySet<string> = new Set(["AppShell", "AppShellNavTrigger"]);

function ComponentTile({ component, hidden }: { readonly component: ComponentMeta; readonly hidden: boolean }) {
  const titleId = `component-${component.name.toLowerCase()}`;
  return <Components.Panel as="section" aria-labelledby={titleId} className="docs-component-tile" hidden={hidden}>
    <div className="docs-component-tile__header">
      <h3 id={titleId}><Link className="docs-component-link" to={`/components/${component.name}`}>{component.name}<ArrowUpRight className="docs-component-link__icon" size={14} strokeWidth={2} aria-hidden="true" /></Link></h3>
      <Components.Badge className="docs-component-tile__family">{component.family}</Components.Badge>
    </div>
    <div className={`docs-component-tile__stage${CLIPPED_PREVIEWS.has(component.name) ? " docs-component-tile__stage--clipped" : ""}`}>
      <PreviewBoundary><div className="docs-preview" aria-label={`${component.name} preview`}><ComponentPreview compact name={component.name} /></div></PreviewBoundary>
    </div>
  </Components.Panel>;
}

export function CatalogIndex() {
  const [query, setQuery] = useState("");
  // Both clear controls unmount themselves on activation, so focus returns to the field instead of falling to <body>.
  const filterRef = useRef<HTMLInputElement | null>(null);
  const clearQuery = () => { setQuery(""); filterRef.current?.focus(); };
  const needle = normalize(query);
  const families = componentFamilies.map((family) => ({ ...family, shown: family.members.filter((component) => matchesQuery(component, needle)).length }));
  const total = componentMeta.length;
  const shown = families.reduce((count, family) => count + family.shown, 0);

  return <section className="cdt-page docs-catalog" aria-labelledby="components-title">
    <header className="docs-catalog__head">
      <div className="docs-catalog__intro">
        <p className="docs-eyebrow">Reference</p>
        <h1 id="components-title">Components</h1>
        <p className="docs-lead">Every public @conductor-by-89soone/react component, rendered live from the package you install. Open one for its props, import line and class contract.</p>
      </div>
      <div className="docs-catalog__pills">
        <Components.Badge className="docs-pill" tone="accent" icon={<Boxes size={12} strokeWidth={2} aria-hidden="true" />}>{total} components</Components.Badge>
        <Components.Badge className="docs-pill">{families.length} families</Components.Badge>
      </div>
    </header>

    <Components.Panel as="section" aria-labelledby="framework-css-title" className="docs-framework">
      <div className="docs-framework__text">
        <h2 id="framework-css-title">Framework-agnostic CSS</h2>
        <p className="cdt-muted">The same visual contract is available without React through public <code>cdt-*</code> classes. The two buttons below resolve to identical computed styles.</p>
        <div className="docs-preview-row"><Components.Button data-framework-example="react" variant="primary">React Button</Components.Button><button data-framework-example="css" className="cdt-btn cdt-btn--primary">CSS classes</button></div>
      </div>
      <Components.CodeBlock className="docs-framework__code" language="html" code={'<button class="cdt-btn cdt-btn--primary">Save</button>'} />
    </Components.Panel>

    <div className="docs-catalog__toolbar">
      <div className="docs-catalog__search">
        <Components.TextField ref={filterRef} iconStart={<Search size={16} strokeWidth={1.75} aria-hidden="true" />} aria-label="Filter components" placeholder="Filter by name or family" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} />
        {query === "" ? null : <Components.IconButton aria-label="Clear filter" variant="ghost" icon={<X size={16} strokeWidth={1.75} aria-hidden="true" />} onClick={clearQuery} />}
        <p className="docs-catalog__status" role="status">{shown} of {total} shown</p>
      </div>
      <ul className="docs-catalog__chips" aria-label="Component families">
        {families.map((family) => <li key={family.name} hidden={family.shown === 0}><Components.Badge className="docs-chip">{family.name}<span className="docs-chip__count">{family.shown}</span></Components.Badge></li>)}
      </ul>
    </div>

    {families.map((family) => {
      const info = familyInfo(family.name);
      const Icon = info.icon;
      const headingId = familyId(family.name);
      return <section key={family.name} className="docs-family" aria-labelledby={headingId} hidden={family.shown === 0}>
        <div className="docs-family__head">
          <span className="docs-family__icon" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
          <div className="docs-family__text"><h2 id={headingId}>{family.name}</h2><p className="docs-family__note">{info.note}</p></div>
          <span className="docs-family__count">{needle === "" ? `${family.members.length} ${family.members.length === 1 ? "component" : "components"}` : `${family.shown} of ${family.members.length}`}</span>
        </div>
        <div className={`cdt-card-grid docs-family__grid${family.members.length === 1 ? " docs-family__grid--single" : ""}`}>{family.members.map((component) => <ComponentTile key={component.name} component={component} hidden={!matchesQuery(component, needle)} />)}</div>
      </section>;
    })}

    {shown === 0 ? <Components.EmptyState className="docs-catalog__empty" icon={<SearchX size={20} strokeWidth={1.75} aria-hidden="true" />} title="No components match" description={`Nothing is named or filed under “${query.trim()}”. Try a component name such as Button, or a family such as Forms.`} action={<Components.Button variant="secondary" onClick={clearQuery}>Show all components</Components.Button>} /> : null}
  </section>;
}

export function ComponentDetail({ name, forceCopyUnavailable = false, forcePreviewError = false }: { readonly name: string; readonly forceCopyUnavailable?: boolean; readonly forcePreviewError?: boolean }) {
  const component = componentMeta.find((entry) => entry.name === name);
  if (component === undefined) {
    return <section className="cdt-page docs-detail" aria-labelledby="component-title">
      <Link className="docs-detail__back" to="/components"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />All components</Link>
      <header className="docs-detail__head"><p className="docs-eyebrow">Component</p><h1 id="component-title">Component not found</h1></header>
      <Components.EmptyState icon={<SearchX size={20} strokeWidth={1.75} aria-hidden="true" />} title={`No public component is named ${name}`} description="Check the spelling, or browse the catalog for every public component." action={<Link className="cdt-btn cdt-btn--secondary cdt-btn--tone-neutral" to="/components"><span aria-hidden="true"><ArrowLeft size={16} strokeWidth={1.75} /></span>Return to components</Link>} />
    </section>;
  }
  const info = familyInfo(component.family);
  const FamilyIcon = info.icon;
  const propCount = component.props.length;
  const requiredCount = component.props.filter((prop) => prop.required).length;

  return <section className="cdt-page docs-detail" aria-labelledby="component-title">
    <Link className="docs-detail__back" to="/components"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />All components</Link>

    <header className="docs-detail__head">
      <p className="docs-eyebrow">Component · {component.family}</p>
      <div className="docs-detail__title">
        <h1 id="component-title">{component.name}</h1>
        <Components.Badge className="docs-pill" tone="accent" icon={<FamilyIcon size={12} strokeWidth={2} aria-hidden="true" />}>{component.family}</Components.Badge>
      </div>
      <p className="docs-lead">Rendered live from the public package; the preview follows the current theme.</p>
    </header>

    <Components.Panel as="section" className="docs-stage" aria-labelledby="preview-title">
      <div className="docs-stage__bar"><h2 id="preview-title">Live preview</h2></div>
      <PreviewBoundary><div className="docs-preview"><ComponentPreview forceError={forcePreviewError} name={component.name} /></div></PreviewBoundary>
    </Components.Panel>

    <div className="docs-detail__usage">
      <Components.Panel as="section" className="docs-usage" aria-labelledby="import-title">
        <div className="docs-usage__head">
          <span className="docs-usage__icon" aria-hidden="true"><Braces size={18} strokeWidth={1.75} /></span>
          <div className="docs-usage__text"><h2 id="import-title">Import</h2><p className="docs-usage__note">A named export from the React package. The stylesheet is imported once, in your entry file.</p></div>
        </div>
        <CopyCode code={`import { ${component.name} } from "@conductor-by-89soone/react";`} forceUnavailable={forceCopyUnavailable} />
      </Components.Panel>
      <Components.Panel as="section" className="docs-usage" aria-labelledby="class-title">
        <div className="docs-usage__head">
          <span className="docs-usage__icon" aria-hidden="true"><Code2 size={18} strokeWidth={1.75} /></span>
          <div className="docs-usage__text"><h2 id="class-title">CSS class</h2><p className="docs-usage__note">Framework-agnostic consumers use the same class contract. Markup carrying this class reads the same tokens, states and cascade layers.</p></div>
        </div>
        <code className="docs-usage__class">{component.className}</code>
      </Components.Panel>
    </div>

    <section className="docs-props" aria-labelledby="props-title">
      <div className="docs-props__head">
        <h2 id="props-title">Props</h2>
        <p className="docs-props__meta">{propCount} {propCount === 1 ? "prop" : "props"}{requiredCount === 0 ? "" : ` · ${requiredCount} required`} · <code>{component.propsTypeName}</code></p>
      </div>
      {propCount === 0 ? <p className="docs-props__note">This component declares no props of its own beyond the native element attributes it forwards.</p> : <Components.Table caption={`${component.name} props`}>
        <Components.Table.Head><Components.Table.Row><Components.Table.HeaderCell>Prop</Components.Table.HeaderCell><Components.Table.HeaderCell>Type</Components.Table.HeaderCell></Components.Table.Row></Components.Table.Head>
        <Components.Table.Body>{component.props.map((prop) => <Components.Table.Row key={prop.name}><Components.Table.Cell><code className="docs-props__name">{prop.name}</code>{prop.required ? <Components.Badge className="docs-props__flag" tone="accent">Required</Components.Badge> : null}</Components.Table.Cell><Components.Table.Cell><code className="docs-props__type">{prop.type}</code></Components.Table.Cell></Components.Table.Row>)}</Components.Table.Body>
      </Components.Table>}
    </section>
  </section>;
}
