import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge, Banner, Breadcrumb, Button, Collapsible, Combobox, CopyButton, DataTable, DetailInspector, Dialog, FilterChip, FilterToolbar, MultiSelect, PathList, Popover, Tabs, TextField, WorkbenchLayout, type DataColumn, type DataSort } from "@conductor-by-89soone/react";

interface DemoRow { id: string; number: number; title: string; repository: string; state: string; sha: string }
const repositories = [{ id: "atlas/search", label: "atlas/search" }, { id: "atlas/indexer", label: "atlas/indexer" }, { id: "unavailable", label: "Unavailable repository", disabled: true }];
const statusOptions = [{ id: "merged", label: "Merged" }, { id: "open", label: "Open" }, { id: "closed", label: "Closed" }];
// 첫 제목의 한국어 조각은 IME 조합 검색(e2e "검색" 입력)을 실제 CJK 문자로 검사하기 위한 표본이다 (FR-DOC-001 AC-5).
const titles = ["Keep search filters (검색 조건) when returning to results", "Preserve evidence when resolving references", "Tell processing states apart after an index retry", "Keyboard navigation for a long investigation"];
const modes = ["ready", "loading", "empty", "error", "partial", "long"] as const;
export function WorkbenchExample() {
  const location = useLocation();
  const initial = new URLSearchParams(location.search);
  const [mode, setMode] = useState<typeof modes[number]>("ready");
  const [count, setCount] = useState(100);
  const [query, setQuery] = useState(initial.get("q") ?? "");
  const [applied, setApplied] = useState(initial.get("q") ?? "");
  const [repositoryQuery, setRepositoryQuery] = useState(initial.get("repository") ?? "");
  const [repository, setRepository] = useState<string | null>(initial.get("repository"));
  const [statuses, setStatuses] = useState<readonly string[]>(initial.getAll("state"));
  const [sort, setSort] = useState<DataSort>({ column: initial.get("sort") === "title" ? "title" : "number", direction: initial.get("direction") === "ascending" ? "ascending" : "descending" });
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState<string | null>(null);
  const [width, setWidth] = useState(40);
  const [density, setDensity] = useState<"comfortable" | "compact">("compact");
  const [visible, setVisible] = useState<readonly string[]>(["number", "title", "state"]);
  const [path, setPath] = useState<string>();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const inspector = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") ?? ""); setApplied(params.get("q") ?? "");
    setRepository(params.get("repository")); setRepositoryQuery(params.get("repository") ?? "");
    setStatuses(params.getAll("state"));
    setSort({ column: params.get("sort") === "title" ? "title" : "number", direction: params.get("direction") === "ascending" ? "ascending" : "descending" });
    setLimit(20); setSelected(null);
  }, [location.search]);
  // "long" 모드는 CJK 줄바꿈을 검증하려고 짧은 한국어 조각을 의도적으로 섞는다.
  const all = useMemo<DemoRow[]>(() => Array.from({ length: count }, (_, index) => ({ id: `synthetic:atlas:${index}`, number: index + 1, title: mode === "long" ? `${titles[index % titles.length]} · 매우 긴 한국어 mixed with a very long English investigation title with repository/branch/context preserved across navigation` : titles[index % titles.length]!, repository: repositories[index % 2]!.id, state: statusOptions[index % 3]!.id, sha: String(index).padStart(40, "a") })), [count, mode]);
  const filtered = useMemo(() => all.filter(row => (!repository || row.repository === repository) && (!statuses.length || statuses.includes(row.state)) && row.title.toLocaleLowerCase().includes(applied.toLocaleLowerCase())).sort((a, b) => {
    const comparison = sort.column === "number" ? a.number - b.number : a.title.localeCompare(b.title);
    return sort.direction === "ascending" ? comparison : -comparison;
  }), [all, applied, repository, statuses, sort]);
  const rows = mode === "empty" || mode === "error" ? [] : filtered.slice(0, limit);
  const selectedRow = rows.find(row => row.id === selected);
  const columns: readonly DataColumn<DemoRow>[] = [
    { id: "number", header: "PR", numeric: true, sortable: true, cell: row => <span className="cdt-mono">#{row.number}</span> },
    { id: "title", header: "Change", sortable: true, cell: row => <div><strong>{row.title}</strong><p className="cdt-muted cdt-mono">{row.repository}</p></div> },
    { id: "state", header: "Status", cell: row => <Badge>{row.state}</Badge> },
  ];
  const resetPage = () => { setLimit(20); setSelected(null); };
  const updateSearchUrl = (next: string, repo = repository, states = statuses, order = sort) => {
    const url = new URL(window.location.href);
    const route = new URL(url.hash.slice(1), url.origin);
    for (const key of ["q", "repository", "state", "cursor", "sort", "direction"]) route.searchParams.delete(key);
    if (next) route.searchParams.set("q", next);
    if (repo) route.searchParams.set("repository", repo);
    states.forEach(state => route.searchParams.append("state", state));
    route.searchParams.set("sort", order.column); route.searchParams.set("direction", order.direction);
    url.hash = `${route.pathname}${route.search}`;
    window.history.replaceState(window.history.state, "", url);
  };
  return <section className="cdt-page docs-workbench-example" aria-labelledby="workbench-title">
    <Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>Examples</span></Breadcrumb>
    <div><p className="docs-eyebrow">WORKSPACE / 01</p><h1 id="workbench-title">Search workbench</h1><p className="docs-lead">Find, inspect, and come back to the same place.</p></div>
    <Banner tone="info">Hand-written synthetic data · not connected to a live API. Sorting applies to the full synthetic input. Selecting and previewing make no network requests.</Banner>
    <FilterToolbar><label>Search example state <select className="cdt-input" value={mode} onChange={event => { setMode(event.target.value as typeof mode); resetPage(); }}>{modes.map(value => <option key={value}>{value}</option>)}</select></label><label>Synthetic input <select className="cdt-input" value={count} onChange={event => { setCount(Number(event.target.value)); resetPage(); }}>{[0, 1, 100, 1000].map(value => <option key={value} value={value}>{value} rows</option>)}</select></label></FilterToolbar>
    <form className="docs-search-form" onSubmit={event => { event.preventDefault(); setApplied(query); updateSearchUrl(query); resetPage(); }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }}>
      <label>Search titles<TextField aria-label="Search titles" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title in any language" /></label><Button type="submit" variant="primary">Search</Button>
    </form>
    <FilterToolbar><div className="docs-repository-filter"><Combobox label="Repository" options={repositories.filter(option => option.label.includes(repositoryQuery))} query={repositoryQuery} onQueryChange={setRepositoryQuery} value={repository} onValueChange={id => { setRepository(id); setRepositoryQuery(id ?? ""); updateSearchUrl(applied, id); resetPage(); }} /></div>
      <Popover.Root><Popover.Trigger asChild><Button>Table settings</Button></Popover.Trigger><Popover.Content aria-label="Table settings"><MultiSelect label="Visible columns" options={columns.map(column => ({ id: column.id, label: column.header, disabled: column.id === "title" }))} value={visible} onValueChange={setVisible} /><label>Row density <select className="cdt-input" value={density} onChange={event => setDensity(event.target.value as typeof density)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label><Popover.Close asChild><Button>Close settings</Button></Popover.Close></Popover.Content></Popover.Root>
      {repository && <FilterChip removeLabel="Remove repository filter" onRemove={() => { setRepository(null); setRepositoryQuery(""); updateSearchUrl(applied, null); resetPage(); }}>{repository}</FilterChip>}
      {applied && <FilterChip removeLabel="Remove title filter" onRemove={() => { setApplied(""); setQuery(""); updateSearchUrl(""); resetPage(); }}>{applied}</FilterChip>}
    </FilterToolbar>
    <Collapsible.Root><Collapsible.Trigger asChild><Button variant="ghost">Status filter</Button></Collapsible.Trigger><Collapsible.Content><MultiSelect label="PR status" options={statusOptions} value={statuses} onValueChange={ids => { setStatuses(ids); updateSearchUrl(applied, repository, ids); resetPage(); }} /></Collapsible.Content></Collapsible.Root>
    {mode === "error" && <Button onClick={() => setMode("ready")}>Retry synthetic lookup</Button>}
    <WorkbenchLayout width={width} onWidthChange={setWidth} inspector={selectedRow && <DetailInspector label="Selected change" ref={inspector} tabIndex={-1} returnFocusRef={trigger} onClose={() => setSelected(null)}>
      <p className="cdt-mono">{selectedRow.repository} · #{selectedRow.number}</p><h3>{selectedRow.title}</h3><CopyButton value={`${selectedRow.repository}#${selectedRow.number}`} label="Copy identifier" />
      <Tabs.Root defaultValue="summary"><Tabs.List aria-label="Preview details"><Tabs.Trigger value="summary">Summary</Tabs.Trigger><Tabs.Trigger value="paths">Changed paths</Tabs.Trigger></Tabs.List><Tabs.Content value="summary"><p><Badge>{selectedRow.state}</Badge></p><p className="cdt-mono docs-wrap">{selectedRow.sha}</p><p>This preview uses only the rows already loaded. Check relations separately in the Relation explorer.</p><Dialog.Root><Dialog.Trigger asChild><Button>Read details</Button></Dialog.Trigger><Dialog.Content><Dialog.Title>{selectedRow.title}</Dialog.Title><Dialog.Description>Synthetic details · closing returns focus to Read details in the preview.</Dialog.Description><p className="docs-wrap">{selectedRow.sha}</p><Dialog.Close asChild><Button>Close details</Button></Dialog.Close></Dialog.Content></Dialog.Root></Tabs.Content><Tabs.Content value="paths"><PathList items={[{ id: "packages", label: "packages", children: [{ id: "source", label: "search/src/very-long-path/query-normalization.ts" }, { id: "test", label: "search/test/search-filters.test.ts" }] }]} selectedId={path} onPathSelect={setPath} /><p role="status">{path ? `Selected path: ${path}` : "Expand a folder to choose a path"}</p></Tabs.Content></Tabs.Root>
    </DetailInspector>}>
      <DataTable label="Synthetic PR search results" rows={rows} columns={columns} rowId={row => row.id} rowLabel={row => `PR ${row.number}`} selectedId={selected} onSelect={(id, button) => { trigger.current = button; setSelected(id); setPath(undefined); requestAnimationFrame(() => inspector.current?.focus()); }} sort={sort} onSortChange={next => { setSort(next); updateSearchUrl(applied, repository, statuses, next); resetPage(); }} visibleColumns={visible} density={density} state={mode === "long" || mode === "empty" ? "ready" : mode} hasMore={rows.length < filtered.length && mode !== "error" && mode !== "empty"} onLoadMore={() => setLimit(value => value + 20)} />
      {selectedRow && <Button className="docs-preview-focus" variant="ghost" onClick={() => inspector.current?.focus()}>Go to selected preview</Button>}
    </WorkbenchLayout>
  </section>;
}
