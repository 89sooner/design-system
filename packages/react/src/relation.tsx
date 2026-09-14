"use client";
// FR-CMP-011 / WP-031 / CR-041

import { forwardRef, useId, useMemo, useState, type HTMLAttributes } from "react";
import { Button } from "./action";
import { Table } from "./data";
import { cx } from "./cx";

export interface RelationNode {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  /** Consumer-sanitized state; never infer or reveal why content is unavailable. */
  readonly unavailable?: boolean;
}
export interface RelationEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly type: string;
  /** A verb phrase read as “source → label → target”. */
  readonly label: string;
  readonly evidence: string;
  readonly confidence?: string;
  readonly unresolved?: boolean;
  readonly ambiguous?: boolean;
  readonly retracted?: boolean;
}
export type RelationSelection = { readonly kind: "node" | "edge"; readonly id: string } | null;
export interface RelationViewport { readonly x: number; readonly y: number; readonly zoom: number }
export interface RelationGraphProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
  readonly nodes: readonly RelationNode[];
  readonly edges: readonly RelationEdge[];
  readonly label: string;
  readonly selection?: RelationSelection;
  readonly onSelectionChange?: (selection: RelationSelection) => void;
  readonly viewport?: RelationViewport;
  readonly onViewportChange?: (viewport: RelationViewport) => void;
  readonly state?: "ready" | "loading" | "empty" | "error" | "partial";
  readonly stateMessage?: string;
  readonly onRetry?: () => void;
}

/** Stable ID order, bounded O(n log n), and no assumption of a directed acyclic graph. */
export function layoutRelationNodes(nodes: readonly RelationNode[]) {
  const ordered = [...nodes].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length)));
  return ordered.map((node, index) => ({ ...node, x: 130 + (index % columns) * 280, y: 90 + Math.floor(index / columns) * 150 }));
}

function edgeState(edge: RelationEdge) {
  return [edge.retracted && "해제됨", edge.unresolved && "미해결", edge.ambiguous && "모호함"].filter(Boolean).join(" · ") || "확인됨";
}

export const RelationGraph = forwardRef<HTMLDivElement, RelationGraphProps>(function RelationGraph(
  { nodes, edges, label, selection: controlledSelection, onSelectionChange, viewport: controlledViewport, onViewportChange,
    state = "ready", stateMessage, onRetry, className, ...props }, ref,
) {
  const uid = useId().replace(/:/g, "");
  const [localSelection, setSelection] = useState<RelationSelection>(null);
  const [localViewport, setViewport] = useState<RelationViewport>({ x: 0, y: 0, zoom: 1 });
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const selection = controlledSelection === undefined ? localSelection : controlledSelection;
  const viewport = controlledViewport ?? localViewport;
  const positioned = useMemo(() => layoutRelationNodes(nodes), [nodes]);
  const byId = useMemo(() => new Map(positioned.map((node) => [node.id, node])), [positioned]);
  const types = useMemo(() => [...new Set(edges.map((edge) => edge.type))].sort(), [edges]);
  const visibleEdges = useMemo(() => [...edges].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).filter((edge) => !type || edge.type === type), [edges, type]);
  const found = positioned.filter((node) => `${node.label} ${node.id}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const neighbors = useMemo(() => {
    const result = new Set<string>();
    if (selection?.kind === "node") {
      result.add(selection.id);
      for (const edge of visibleEdges) if (edge.source === selection.id || edge.target === selection.id) {
        result.add(edge.source); result.add(edge.target);
      }
    }
    return result;
  }, [selection, visibleEdges]);
  const width = Math.max(560, ...positioned.map((node) => node.x + 150));
  const height = Math.max(300, ...positioned.map((node) => node.y + 90));
  const zoom = Math.min(8, Math.max(0.5, Number.isFinite(viewport.zoom) ? viewport.zoom : 1));
  const changeSelection = (next: RelationSelection) => { if (controlledSelection === undefined) setSelection(next); onSelectionChange?.(next); };
  const changeViewport = (next: RelationViewport) => { if (!controlledViewport) setViewport(next); onViewportChange?.(next); };
  const pan = (x: number, y: number) => changeViewport({ x: viewport.x + x * width / zoom / 4, y: viewport.y + y * height / zoom / 4, zoom });
  const selectedNode = selection?.kind === "node" ? byId.get(selection.id) : undefined;
  const selectedEdge = selection?.kind === "edge" ? edges.find((edge) => edge.id === selection.id) : undefined;
  const endpointLabel = (id: string) => byId.get(id)?.label ?? "대상 정보 없음";
  const selectedHidden = selectedEdge && !visibleEdges.some((edge) => edge.id === selectedEdge.id);
  const blocked = state === "loading" || state === "error" || state === "empty";

  return <div {...props} ref={ref} className={cx("cdt-relation", className)} aria-label={props["aria-label"] ?? label} aria-busy={props["aria-busy"] ?? (state === "loading" || undefined)}>
    <div className="cdt-relation__toolbar">
      <label htmlFor={`${uid}-find`}>노드 찾기<input id={`${uid}-find`} className="cdt-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름 또는 안정 ID" /></label>
      <label htmlFor={`${uid}-type`}>관계 유형<select id={`${uid}-type`} className="cdt-input" value={type} onChange={(event) => setType(event.target.value)}><option value="">모든 유형</option>{types.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <a href={`#${uid}-list`} onClick={event => { event.preventDefault(); const list = event.currentTarget.ownerDocument.getElementById(`${uid}-list`); list?.focus({ preventScroll: true }); list?.scrollIntoView({ block: "start" }); }}>동일 정보 목록으로 이동</a>
    </div>
    <p className="cdt-relation__legend">화살표: 출발 → 관계 → 도착. 실선: 확인됨 · 점선: 미해결/모호함 · 파선: 해제됨. 위치는 ID 순서이며 시간·병합·의존 순서를 뜻하지 않습니다.</p>
    <p role={state === "error" ? "alert" : "status"}>{stateMessage ?? ({ ready: `${nodes.length}개 노드 · ${visibleEdges.length}개 관계`, loading: "관계 불러오는 중", empty: "확인된 관계 없음", error: "관계를 불러오지 못했습니다", partial: "부분 결과: 표시되지 않은 관계가 있을 수 있습니다" }[state])}</p>
    {state === "error" && onRetry && <Button type="button" onClick={onRetry}>관계 다시 시도</Button>}
    {!blocked && <>
      <div className="cdt-relation__toolbar" aria-label="그래프 보기 조절">
        <Button type="button" disabled={zoom >= 8} onClick={() => changeViewport({ ...viewport, zoom: Math.min(8, zoom * 1.5) })}>확대</Button>
        <Button type="button" disabled={zoom <= 0.5} onClick={() => changeViewport({ ...viewport, zoom: Math.max(0.5, zoom / 1.5) })}>축소</Button>
        <Button type="button" onClick={() => changeViewport({ x: 0, y: 0, zoom: 1 })}>전체 보기</Button>
        <Button type="button" aria-label="그래프 왼쪽으로 이동" onClick={() => pan(-1, 0)}>←</Button>
        <Button type="button" aria-label="그래프 오른쪽으로 이동" onClick={() => pan(1, 0)}>→</Button>
        <Button type="button" aria-label="그래프 위로 이동" onClick={() => pan(0, -1)}>↑</Button>
        <Button type="button" aria-label="그래프 아래로 이동" onClick={() => pan(0, 1)}>↓</Button>
        <output aria-label="확대 배율">{Math.round(zoom * 100)}%</output>
      </div>
      {/* The semantic tables below expose every SVG operation without custom keyboard roles. */}
      <svg className="cdt-relation__canvas" aria-hidden="true" focusable="false" viewBox={`${viewport.x} ${viewport.y} ${width / zoom} ${height / zoom}`}>
        <defs><marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className="cdt-relation__arrow" /></marker></defs>
        {visibleEdges.map((edge, index) => {
          const source = byId.get(edge.source); const target = byId.get(edge.target);
          if (!source || !target) return null;
          const dx = target.x - source.x; const dy = target.y - source.y;
          const distance = Math.hypot(dx, dy) || 1;
          const offset = dy === 0 ? -Math.sign(dx) * (100 + (index % 3) * 20) : 28 + (index % 3) * 12;
          const inset = Math.min(Math.abs(dx) > 0 ? 118 / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? 34 / Math.abs(dy) : Infinity);
          const path = source.id === target.id
            ? `M ${source.x} ${source.y - 26} C ${source.x - 90} ${source.y - 105}, ${source.x + 90} ${source.y - 105}, ${source.x + 30} ${source.y - 26}`
            : `M ${source.x} ${source.y} Q ${(source.x + target.x) / 2 - dy / distance * offset} ${(source.y + target.y) / 2 + dx / distance * offset} ${target.x - dx * inset} ${target.y - dy * inset}`;
          return <g key={edge.id} data-edge-id={edge.id} data-selected={selectedEdge?.id === edge.id || undefined} data-dimmed={neighbors.size > 0 && !(neighbors.has(edge.source) && neighbors.has(edge.target)) || undefined} className="cdt-relation__edge" onClick={() => changeSelection({ kind: "edge", id: edge.id })}>
            <path d={path} className="cdt-relation__edge-hit" />
            <path d={path} markerEnd={`url(#${uid}-arrow)`} data-state={edge.retracted ? "retracted" : edge.unresolved || edge.ambiguous ? "uncertain" : "confirmed"} />
            {(nodes.length <= 50 || selectedEdge?.id === edge.id) && <text x={(source.x + target.x) / 2 - dy / distance * offset / 2} y={(source.y + target.y) / 2 + dx / distance * offset / 2 - 8} textAnchor="middle" className="cdt-relation__edge-label">{edge.label}</text>}
            <title>{`${endpointLabel(edge.source)} → ${edge.label} → ${endpointLabel(edge.target)} · ${edgeState(edge)}`}</title>
          </g>;
        })}
        {positioned.map((node) => <g key={node.id} data-node-id={node.id} className="cdt-relation__node" data-selected={selectedNode?.id === node.id || undefined} data-dimmed={neighbors.size > 0 && !neighbors.has(node.id) || undefined} onClick={() => changeSelection({ kind: "node", id: node.id })}>
          <rect x={node.x - 110} y={node.y - 26} width={220} height={52} rx={8} />
          <text x={node.x} y={node.y + 5} textAnchor="middle">{node.label.length > 24 ? `${node.label.slice(0, 23)}…` : node.label}</text><title>{node.label}</title>
        </g>)}
      </svg>
      <section aria-label="선택한 관계 상세" className="cdt-relation__detail" aria-live="polite">
        {selectedNode ? <><strong>{selectedNode.label}</strong><p>{selectedNode.description ?? "추가 설명 없음"}</p><p>{selectedNode.unavailable ? "대상 내용을 표시할 수 없습니다." : "연결된 이웃이 강조되었습니다."}</p></>
          : selectedEdge ? <><strong>{endpointLabel(selectedEdge.source)} → {selectedEdge.label} → {endpointLabel(selectedEdge.target)}</strong><p>유형: {selectedEdge.type} · 상태: {edgeState(selectedEdge)} · 신뢰도: {selectedEdge.confidence ?? "알 수 없음"}</p><p>근거: {selectedEdge.evidence || "제공되지 않음"}</p>{selectedHidden && <p>선택한 관계는 현재 유형 필터에서 숨겨져 있습니다.</p>}</>
          : <p>{selection ? "선택한 항목이 현재 데이터에 없습니다." : "노드 또는 관계를 선택하면 방향, 상태, 근거를 확인할 수 있습니다."}</p>}
        {selection && <Button type="button" onClick={() => changeSelection(null)}>선택 해제</Button>}
      </section>
      <section id={`${uid}-list`} tabIndex={-1} aria-label="관계 대체 목록">
        <details open={query.length > 0 || nodes.length <= 12}><summary>노드 목록 · {found.length}개 (고립된 노드 포함)</summary>
          <ul className="cdt-relation__nodes">{found.map((node) => <li key={node.id}><Button type="button" aria-pressed={selectedNode?.id === node.id} onClick={() => {
            changeSelection({ kind: "node", id: node.id });
            if (query) changeViewport({ x: node.x - width / zoom / 2, y: node.y - height / zoom / 2, zoom });
          }}>{node.label}</Button>{node.unavailable && <span> · 내용 표시 불가</span>}</li>)}</ul>
          {found.length === 0 && <p>일치하는 노드 없음</p>}
        </details>
        <Table caption={`${label} — 방향과 근거 목록`}>
          <Table.Head><Table.Row><Table.HeaderCell>출발 → 관계 → 도착</Table.HeaderCell><Table.HeaderCell>유형 · 상태</Table.HeaderCell><Table.HeaderCell>신뢰도 · 근거</Table.HeaderCell><Table.HeaderCell>선택</Table.HeaderCell></Table.Row></Table.Head>
          <Table.Body>{visibleEdges.map((edge) => <Table.Row key={edge.id} data-selected={selectedEdge?.id === edge.id || undefined}>
            <Table.Cell>{endpointLabel(edge.source)} → {edge.label} → {endpointLabel(edge.target)}</Table.Cell>
            <Table.Cell>{edge.type} · {edgeState(edge)}{(!byId.has(edge.source) || !byId.has(edge.target)) && " · 끝점 정보 없음"}</Table.Cell>
            <Table.Cell>{edge.confidence ?? "알 수 없음"} · {edge.evidence || "근거 제공되지 않음"}</Table.Cell>
            <Table.Cell><Button type="button" aria-pressed={selectedEdge?.id === edge.id} aria-label={`관계 선택: ${edge.id}`} onClick={() => changeSelection({ kind: "edge", id: edge.id })}>근거 보기</Button></Table.Cell>
          </Table.Row>)}</Table.Body>
        </Table>
        {visibleEdges.length === 0 && <p>현재 필터에서 표시할 관계가 없습니다.</p>}
      </section>
    </>}
  </div>;
});
RelationGraph.displayName = "RelationGraph";
