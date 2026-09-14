import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Badge, Banner, Breadcrumb, Button, Collapsible, Combobox, CopyButton, DataTable, DetailInspector, Dialog, FilterChip, FilterToolbar, MultiSelect, PathList, Popover, Tabs, TextField, WorkbenchLayout, type DataColumn, type DataSort } from "@conductor-by-89soone/react";

interface DemoRow { id: string; number: number; title: string; repository: string; state: string; sha: string }
const repositories = [{ id: "atlas/search", label: "atlas/search" }, { id: "atlas/indexer", label: "atlas/indexer" }, { id: "unavailable", label: "사용 불가 저장소", disabled: true }];
const statusOptions = [{ id: "merged", label: "Merged" }, { id: "open", label: "Open" }, { id: "closed", label: "Closed" }];
const titles = ["검색 조건을 유지하며 결과 목록으로 복귀", "Preserve evidence when resolving references", "색인 재시도 이후 처리 상태 구분", "Keyboard navigation for a long investigation"];
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
  const all = useMemo<DemoRow[]>(() => Array.from({ length: count }, (_, index) => ({ id: `synthetic:atlas:${index}`, number: index + 1, title: mode === "long" ? `${titles[index % titles.length]} · 매우 긴 한국어 English investigation title with repository/branch/context preserved across navigation` : titles[index % titles.length]!, repository: repositories[index % 2]!.id, state: statusOptions[index % 3]!.id, sha: String(index).padStart(40, "a") })), [count, mode]);
  const filtered = useMemo(() => all.filter(row => (!repository || row.repository === repository) && (!statuses.length || statuses.includes(row.state)) && row.title.toLocaleLowerCase().includes(applied.toLocaleLowerCase())).sort((a, b) => {
    const comparison = sort.column === "number" ? a.number - b.number : a.title.localeCompare(b.title);
    return sort.direction === "ascending" ? comparison : -comparison;
  }), [all, applied, repository, statuses, sort]);
  const rows = mode === "empty" || mode === "error" ? [] : filtered.slice(0, limit);
  const selectedRow = rows.find(row => row.id === selected);
  const columns: readonly DataColumn<DemoRow>[] = [
    { id: "number", header: "PR", numeric: true, sortable: true, cell: row => <span className="cdt-mono">#{row.number}</span> },
    { id: "title", header: "변경 내용", sortable: true, cell: row => <div><strong>{row.title}</strong><p className="cdt-muted cdt-mono">{row.repository}</p></div> },
    { id: "state", header: "상태", cell: row => <Badge>{row.state}</Badge> },
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
    <Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>조합 예제</span></Breadcrumb>
    <div><p className="docs-eyebrow">WORKSPACE / 01</p><h1 id="workbench-title">검색 워크벤치</h1><p className="docs-lead">찾고, 살펴보고, 같은 위치로 돌아오기.</p></div>
    <Banner tone="info">직접 작성한 합성 데이터 · 운영 API 미연동. 정렬은 전체 합성 입력에 적용합니다. 선택·미리보기는 네트워크 요청을 만들지 않습니다.</Banner>
    <FilterToolbar><label>검색 예제 상태 <select className="cdt-input" value={mode} onChange={event => { setMode(event.target.value as typeof mode); resetPage(); }}>{modes.map(value => <option key={value}>{value}</option>)}</select></label><label>합성 입력 <select className="cdt-input" value={count} onChange={event => { setCount(Number(event.target.value)); resetPage(); }}>{[0, 1, 100, 1000].map(value => <option key={value} value={value}>{value}개</option>)}</select></label></FilterToolbar>
    <form className="docs-search-form" onSubmit={event => { event.preventDefault(); setApplied(query); updateSearchUrl(query); resetPage(); }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault(); }}>
      <label>제목 검색<TextField aria-label="제목 검색" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="한국어 또는 English 제목" /></label><Button type="submit" variant="primary">검색</Button>
    </form>
    <FilterToolbar><div className="docs-repository-filter"><Combobox label="저장소" options={repositories.filter(option => option.label.includes(repositoryQuery))} query={repositoryQuery} onQueryChange={setRepositoryQuery} value={repository} onValueChange={id => { setRepository(id); setRepositoryQuery(id ?? ""); updateSearchUrl(applied, id); resetPage(); }} /></div>
      <Popover.Root><Popover.Trigger asChild><Button>표 설정</Button></Popover.Trigger><Popover.Content aria-label="표 설정"><MultiSelect label="표시할 열" options={columns.map(column => ({ id: column.id, label: column.header, disabled: column.id === "title" }))} value={visible} onValueChange={setVisible} /><label>행 밀도 <select className="cdt-input" value={density} onChange={event => setDensity(event.target.value as typeof density)}><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></label><Popover.Close asChild><Button>설정 닫기</Button></Popover.Close></Popover.Content></Popover.Root>
      {repository && <FilterChip removeLabel="저장소 필터 제거" onRemove={() => { setRepository(null); setRepositoryQuery(""); updateSearchUrl(applied, null); resetPage(); }}>{repository}</FilterChip>}
      {applied && <FilterChip removeLabel="제목 필터 제거" onRemove={() => { setApplied(""); setQuery(""); updateSearchUrl(""); resetPage(); }}>{applied}</FilterChip>}
    </FilterToolbar>
    <Collapsible.Root><Collapsible.Trigger asChild><Button variant="ghost">상태 필터</Button></Collapsible.Trigger><Collapsible.Content><MultiSelect label="PR 상태" options={statusOptions} value={statuses} onValueChange={ids => { setStatuses(ids); updateSearchUrl(applied, repository, ids); resetPage(); }} /></Collapsible.Content></Collapsible.Root>
    {mode === "error" && <Button onClick={() => setMode("ready")}>합성 조회 다시 시도</Button>}
    <WorkbenchLayout width={width} onWidthChange={setWidth} inspector={selectedRow && <DetailInspector label="선택한 변경" ref={inspector} tabIndex={-1} returnFocusRef={trigger} onClose={() => setSelected(null)}>
      <p className="cdt-mono">{selectedRow.repository} · #{selectedRow.number}</p><h3>{selectedRow.title}</h3><CopyButton value={`${selectedRow.repository}#${selectedRow.number}`} label="식별자 복사" />
      <Tabs.Root defaultValue="summary"><Tabs.List aria-label="미리보기 정보"><Tabs.Trigger value="summary">요약</Tabs.Trigger><Tabs.Trigger value="paths">변경 경로</Tabs.Trigger></Tabs.List><Tabs.Content value="summary"><p><Badge>{selectedRow.state}</Badge></p><p className="cdt-mono docs-wrap">{selectedRow.sha}</p><p>이 미리보기는 현재 로드된 행만 사용합니다. 관계는 관계 탐색기에서 별도로 확인합니다.</p><Dialog.Root><Dialog.Trigger asChild><Button>상세 읽기</Button></Dialog.Trigger><Dialog.Content><Dialog.Title>{selectedRow.title}</Dialog.Title><Dialog.Description>합성 상세 · 닫으면 미리보기의 상세 읽기로 포커스가 돌아옵니다.</Dialog.Description><p className="docs-wrap">{selectedRow.sha}</p><Dialog.Close asChild><Button>상세 닫기</Button></Dialog.Close></Dialog.Content></Dialog.Root></Tabs.Content><Tabs.Content value="paths"><PathList items={[{ id: "packages", label: "packages", children: [{ id: "source", label: "search/src/매우-긴-경로/query-normalization.ts" }, { id: "test", label: "search/test/검색-조건.test.ts" }] }]} selectedId={path} onPathSelect={setPath} /><p role="status">{path ? `선택한 경로: ${path}` : "폴더를 펼쳐 경로를 선택하세요"}</p></Tabs.Content></Tabs.Root>
    </DetailInspector>}>
      <DataTable label="합성 PR 검색 결과" rows={rows} columns={columns} rowId={row => row.id} rowLabel={row => `PR ${row.number}`} selectedId={selected} onSelect={(id, button) => { trigger.current = button; setSelected(id); setPath(undefined); requestAnimationFrame(() => inspector.current?.focus()); }} sort={sort} onSortChange={next => { setSort(next); updateSearchUrl(applied, repository, statuses, next); resetPage(); }} visibleColumns={visible} density={density} state={mode === "long" || mode === "empty" ? "ready" : mode} hasMore={rows.length < filtered.length && mode !== "error" && mode !== "empty"} onLoadMore={() => setLimit(value => value + 20)} />
      {selectedRow && <Button className="docs-preview-focus" variant="ghost" onClick={() => inspector.current?.focus()}>선택한 미리보기로 이동</Button>}
    </WorkbenchLayout>
  </section>;
}
