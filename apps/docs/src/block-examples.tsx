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
const statusLabels: Readonly<Partial<Record<Status, string>>> = { success: "성공", running: "진행 중", waiting: "승인 대기", danger: "실패" };

function StatusCell({ status }: { readonly status: Status }) {
  const Icon = statusIcons[status]!;
  return <StatusBadge status={status} icon={<Icon {...iconProps} data-icon={STATUS_ICONS[status]} />} label={statusLabels[status]!} />;
}

function BlockHeader({ index, id, title, lead }: { readonly index: string; readonly id: string; readonly title: string; readonly lead: string }) {
  return <>
    <Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>블록 예제</span></Breadcrumb>
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
const EXPORT_BLOCKED = "감사 로그 열람 권한이 필요합니다.";

export function EmptyStatesExample() {
  const [projects, setProjects] = useState<readonly string[]>([]);
  const [query, setQuery] = useState("billing");
  const [feedback, setFeedback] = useState("");
  return <section className="cdt-page docs-block-example" aria-labelledby="empty-title">
    <BlockHeader index="01" id="empty-title" title="빈 상태" lead="비어 있는 이유와 다음 행동을 함께 보여줍니다." />
    <Banner tone="info">합성 데이터 · 운영 API 미연동. 버튼은 이 화면 안의 상태만 바꿉니다.</Banner>
    <div className="docs-block-grid">
      <EmptyCase title="처음 사용" rule="아직 만든 것이 없을 때. 무엇을 만들 수 있는지와 첫 행동 하나를 제시합니다.">
        {projects.length === 0
          ? <EmptyState icon={<FolderPlus size={20} strokeWidth={1.75} />} title="프로젝트가 아직 없습니다" description="프로젝트를 만들면 배포와 알림을 한곳에서 관리합니다." action={<Button variant="primary" onClick={() => { setProjects(["atlas-web"]); setFeedback("합성 프로젝트 atlas-web 생성"); }}>첫 프로젝트 만들기</Button>} />
          : <><ul className="docs-block-list">{projects.map(name => <li key={name} className="cdt-mono">{name}</li>)}</ul><Button variant="ghost" onClick={() => { setProjects([]); setFeedback("처음 사용 상태로 되돌림"); }}>처음 상태로 되돌리기</Button></>}
      </EmptyCase>
      <EmptyCase title="검색 결과 없음" rule="데이터는 있지만 조건에 맞는 것이 없을 때. 적용한 조건을 보여주고 해제 방법을 제시합니다.">
        {query === ""
          ? <><p>조건 없이 전체 12건을 표시합니다.</p><Button variant="ghost" onClick={() => setQuery("billing")}>조건 다시 적용</Button></>
          : <EmptyState icon={<SearchX size={20} strokeWidth={1.75} />} title={`"${query}"와 일치하는 서비스가 없습니다`} description="전체 12건 중 0건입니다. 철자를 확인하거나 조건을 지우세요." action={<Button onClick={() => { setQuery(""); setFeedback("검색 조건 해제 · 전체 12건"); }}>검색 조건 지우기</Button>} />}
      </EmptyCase>
      <EmptyCase title="권한 없음" rule="볼 수 없는 것을 0건으로 표시하지 않습니다. 이유와 요청할 곳을 알리고, 할 수 없는 행동에는 차단 사유를 붙입니다.">
        <EmptyState icon={<Lock size={20} strokeWidth={1.75} />} title="이 프로젝트의 감사 로그를 볼 권한이 없습니다" description="조직 관리자에게 감사 로그 열람 권한을 요청하세요. 로그는 삭제되지 않았습니다." action={<><Button blockedReason={EXPORT_BLOCKED} aria-describedby="empty-export-reason">로그 내보내기</Button><p id="empty-export-reason" className="cdt-muted">{EXPORT_BLOCKED}</p></>} />
      </EmptyCase>
      <EmptyCase title="불러오기 실패" rule="오류를 빈 목록으로 바꾸지 않습니다. 실패 사실과 다시 시도할 방법을 알립니다.">
        <Banner tone="danger" title="배포 목록을 불러오지 못했습니다" action={<Button onClick={() => setFeedback("합성 재조회 요청 1건 기록 · 네트워크 요청 없음")}>다시 시도</Button>}>마지막으로 확인한 목록을 최신이라고 표시하지 않습니다.</Banner>
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
    <BlockHeader index="02" id="filter-title" title="필터 테이블" lead="조건을 좁히고, 적용한 조건을 보이게 두고, 한 번에 지웁니다." />
    <Banner tone="info"><span>합성 배포 12건 · 운영 API 미연동. 큰 결과 집합과 선택·미리보기는 <Link className="docs-inline-link" to="/examples/workbench">검색 워크벤치</Link>의 DataTable을 쓰세요.</span></Banner>
    <FilterToolbar>
      <Field label="서비스 검색"><TextField ref={searchRef} type="search" value={filter.query} placeholder="서비스 이름" onChange={event => setFilter({ ...filter, query: event.target.value })} /></Field>
      <Field label="상태">
        <Select.Root value={filter.status} onValueChange={value => setFilter({ ...filter, status: value as DeploymentFilter["status"] })}>
          <Select.Trigger><Select.Value /></Select.Trigger>
          <Select.Content>{statusChoices.map(value => <Select.Item key={value} value={value}>{value === "all" ? "전체 상태" : statusLabels[value]}</Select.Item>)}</Select.Content>
        </Select.Root>
      </Field>
    </FilterToolbar>
    {isFiltered(filter) && <FilterToolbar role="group" aria-label="적용한 조건">
      {filter.query.trim() !== "" && <FilterChip removeLabel="검색 조건 제거" onRemove={() => setFilter({ ...filter, query: "" })}>검색: {filter.query.trim()}</FilterChip>}
      {filter.status !== "all" && <FilterChip removeLabel="상태 조건 제거" onRemove={() => setFilter({ ...filter, status: "all" })}>상태: {statusLabels[filter.status]}</FilterChip>}
      <Button variant="ghost" size="sm" onClick={clear}>조건 모두 지우기</Button>
    </FilterToolbar>}
    <p role="status" className="cdt-muted">{resultSummary(rows.length, deployments.length)}</p>
    {rows.length === 0
      ? <EmptyState icon={<SearchX size={20} strokeWidth={1.75} />} title="조건에 맞는 배포가 없습니다" description={`전체 ${deployments.length}건 중 0건입니다. 조건을 지우면 전체 목록으로 돌아갑니다.`} action={<Button onClick={clear}>조건 모두 지우기</Button>} />
      : <Table caption="합성 배포 목록">
        <Table.Head><Table.Row>
          <Table.HeaderCell>서비스</Table.HeaderCell>
          <Table.HeaderCell>환경</Table.HeaderCell>
          <Table.HeaderCell>상태</Table.HeaderCell>
          <Table.HeaderCell aria-sort={direction}><button type="button" className="docs-sort-button" onClick={() => setDirection(toggleDirection)}>소요 시간</button></Table.HeaderCell>
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
const regionLabels: Readonly<Record<Settings["region"], string>> = { seoul: "서울 (ap-northeast-2)", tokyo: "도쿄 (ap-northeast-1)", virginia: "버지니아 (us-east-1)" };
const fieldIds: Readonly<Partial<Record<keyof Settings, string>>> = { name: "settings-name", description: "settings-description" };
const fieldLabels: Readonly<Partial<Record<keyof Settings, string>>> = { name: "프로젝트 이름", description: "설명" };

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
    setFeedback(`합성 저장 완료 · 변경 ${changed.length}건 · 네트워크 요청 없음`);
  };
  const errorEntries = Object.entries(errors) as [keyof Settings, string][];
  return <section className="cdt-page docs-block-example" aria-labelledby="settings-title">
    <BlockHeader index="03" id="settings-title" title="설정 폼" lead="오류는 필드 옆과 요약에 함께, 저장하지 않은 변경은 눈에 보이게." />
    <Banner tone="info">합성 설정 · 운영 API 미연동. 저장과 삭제는 이 화면의 상태만 바꿉니다.</Banner>
    <form className="docs-settings-form" noValidate onSubmit={submit}>
      {errorEntries.length > 0 && <div ref={summaryRef} tabIndex={-1} className="docs-settings-form__summary"><Banner tone="danger" title={`저장하지 못했습니다 · 오류 ${errorEntries.length}건`}><ul>{errorEntries.map(([key, message]) => <li key={key}><a href={`#${fieldIds[key]}`} onClick={event => { event.preventDefault(); document.getElementById(fieldIds[key]!)?.focus(); }}>{fieldLabels[key]}: {message}</a></li>)}</ul></Banner></div>}
      <Panel as="section" aria-labelledby="settings-general">
        <h2 id="settings-general">일반</h2>
        <Field id="settings-name" label="프로젝트 이름" required description={`URL과 알림에 쓰입니다. ${NAME_MAX}자 이하.`} error={errors.name}><TextField value={draft.name} onChange={event => update("name", event.target.value)} /></Field>
        <Field id="settings-description" label="설명" description={`${draft.description.length}/${DESCRIPTION_MAX}자`} error={errors.description}><TextArea value={draft.description} onChange={event => update("description", event.target.value)} /></Field>
        <Field label="배포 지역" description="지역을 바꾸면 다음 배포부터 적용됩니다.">
          <Select.Root value={draft.region} onValueChange={value => update("region", value as Settings["region"])}>
            <Select.Trigger><Select.Value /></Select.Trigger>
            <Select.Content>{(Object.keys(regionLabels) as Settings["region"][]).map(region => <Select.Item key={region} value={region}>{regionLabels[region]}</Select.Item>)}</Select.Content>
          </Select.Root>
        </Field>
      </Panel>
      <Panel as="section" aria-labelledby="settings-alerts">
        <h2 id="settings-alerts">알림</h2>
        <Field label="배포 실패 이메일 알림" description="실패한 배포마다 프로젝트 관리자에게 보냅니다."><Switch checked={draft.emailAlerts} onCheckedChange={value => update("emailAlerts", value)} /></Field>
        <Field label="주간 요약 받기"><Checkbox checked={draft.weeklyDigest} onCheckedChange={value => update("weeklyDigest", value === true)} /></Field>
      </Panel>
      <div className="docs-settings-form__actions">
        <p className="cdt-muted" aria-live="polite">{changed.length === 0 ? "저장하지 않은 변경 없음" : `저장하지 않은 변경 ${changed.length}건`}</p>
        <Button type="button" variant="ghost" disabled={changed.length === 0} onClick={() => { setDraft(saved); setErrors({}); setFeedback("저장한 값으로 되돌림"); }}>변경 취소</Button>
        <Button type="submit" variant="primary">저장</Button>
      </div>
    </form>
    <Panel as="section" aria-labelledby="settings-danger" className="docs-settings-form__danger">
      <h2 id="settings-danger">위험 구역</h2>
      <p className="cdt-muted">프로젝트를 삭제하면 배포 이력과 알림 설정이 함께 사라집니다. 되돌릴 수 없는 행동은 확인 대화상자를 거칩니다.</p>
      <Dialog.Root>
        <Dialog.Trigger asChild><Button tone="danger">프로젝트 삭제</Button></Dialog.Trigger>
        <Dialog.Content size="sm">
          <Dialog.Title>{saved.name} 프로젝트를 삭제할까요?</Dialog.Title>
          <Dialog.Description>배포 이력과 알림 설정이 함께 삭제되며 되돌릴 수 없습니다.</Dialog.Description>
          <div className="docs-settings-form__dialog-actions">
            <Dialog.Close asChild><Button variant="ghost">취소</Button></Dialog.Close>
            <Dialog.Close asChild><Button variant="primary" tone="danger" onClick={() => setFeedback("합성 삭제 요청 1건 기록 · 네트워크 요청 없음")}>삭제</Button></Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Panel>
    <p role="status">{feedback}</p>
  </section>;
}
