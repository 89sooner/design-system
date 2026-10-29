"use client";
// FR-CMP-011 / WP-031 / CR-041

import { forwardRef, useId, useMemo, useState, type HTMLAttributes } from "react";
import { Button } from "./action";
import { Table } from "./data";
import { cx } from "./cx";
import { DEFAULT_RELATION_GRAPH_LABELS, type RelationGraphLabels } from "./labels";

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
  /** Derived from metadata (changed paths, branch names) rather than declared. Never drawn or labelled as confirmed (CR-079). */
  readonly inferred?: boolean;
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
  /**
   * `grid` (default): stable ID order. `focus`: `focusId` in the middle, items that point to it on the left, items it
   * points to on the right, the rest below (CR-079). Falls back to `grid` when `focusId` is not a node.
   */
  readonly layout?: "grid" | "focus";
  /** The node `layout="focus"` centres on. */
  readonly focusId?: string;
  readonly stateMessage?: string;
  readonly onRetry?: () => void;
  /** Every string the graph renders, merged over English defaults (CR-053). */
  readonly labels?: Partial<RelationGraphLabels>;
}

/** How `layoutRelationNodes` places nodes (CR-079). Without options it returns the stable ID grid. */
export interface RelationLayoutOptions {
  /** `grid` (default) or `focus`, as on `RelationGraphProps.layout`. */
  readonly layout?: "grid" | "focus";
  /** The node `focus` centres on; a missing ID falls back to `grid`. */
  readonly focusId?: string;
  /** The edges that decide which side of the focus each node sits on. */
  readonly edges?: readonly RelationEdge[];
}

const compareId = (a: { readonly id: string }, b: { readonly id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Stable ID order, bounded O(n log n), and no assumption of a directed acyclic graph.
 * `layout: "focus"` (CR-079) splits the neighbours of `focusId` by direction; a neighbour on both sides (a cycle)
 * is placed once, on the right. Rows follow the first relation type, then ID, so the same input lays out the same way.
 */
export function layoutRelationNodes(nodes: readonly RelationNode[], options: RelationLayoutOptions = {}) {
  const ordered = [...nodes].sort(compareId);
  const focus = options.focusId;
  if (options.layout !== "focus" || focus === undefined || !ordered.some((node) => node.id === focus)) {
    const columns = Math.max(1, Math.ceil(Math.sqrt(ordered.length)));
    return ordered.map((node, index) => ({ ...node, x: 130 + (index % columns) * 280, y: 90 + Math.floor(index / columns) * 150 }));
  }
  const edges = options.edges ?? [];
  const present = new Set(ordered.map((node) => node.id));
  const outgoing = new Set(edges.filter((edge) => edge.source === focus && edge.target !== focus && present.has(edge.target)).map((edge) => edge.target));
  const incoming = new Set(edges.filter((edge) => edge.target === focus && edge.source !== focus && present.has(edge.source) && !outgoing.has(edge.source)).map((edge) => edge.source));
  const firstType = (id: string) => edges.filter((edge) => (edge.source === focus && edge.target === id) || (edge.target === focus && edge.source === id)).map((edge) => edge.type).sort()[0] ?? "";
  const lane = (ids: ReadonlySet<string>) => ordered.filter((node) => ids.has(node.id)).sort((a, b) => (firstType(a.id) < firstType(b.id) ? -1 : firstType(a.id) > firstType(b.id) ? 1 : compareId(a, b)));
  const left = lane(incoming);
  const right = lane(outgoing);
  const rest = ordered.filter((node) => node.id !== focus && !incoming.has(node.id) && !outgoing.has(node.id));
  const rows = Math.max(left.length, right.length, 1);
  const step = 110;
  const laneY = (count: number, index: number) => 90 + ((rows - count) * step) / 2 + index * step;
  const place = new Map<string, { x: number; y: number }>();
  place.set(focus, { x: 410, y: 90 + ((rows - 1) * step) / 2 });
  left.forEach((node, index) => place.set(node.id, { x: 130, y: laneY(left.length, index) }));
  right.forEach((node, index) => place.set(node.id, { x: 690, y: laneY(right.length, index) }));
  const restTop = 90 + rows * step + 40;
  rest.forEach((node, index) => place.set(node.id, { x: 130 + (index % 3) * 280, y: restTop + Math.floor(index / 3) * 150 }));
  return ordered.map((node) => ({ ...node, ...place.get(node.id)! }));
}

function edgeState(edge: RelationEdge, t: RelationGraphLabels) {
  return [edge.retracted && t.retracted, edge.unresolved && t.unresolved, edge.ambiguous && t.ambiguous, edge.inferred && (t.inferred ?? DEFAULT_RELATION_GRAPH_LABELS.inferred)].filter(Boolean).join(" · ") || t.confirmed;
}

export const RelationGraph = forwardRef<HTMLDivElement, RelationGraphProps>(function RelationGraph(
  { nodes, edges, label, selection: controlledSelection, onSelectionChange, viewport: controlledViewport, onViewportChange,
    state = "ready", stateMessage, onRetry, layout = "grid", focusId, labels, className, ...props }, ref,
) {
  const t = { ...DEFAULT_RELATION_GRAPH_LABELS, ...labels };
  const uid = useId().replace(/:/g, "");
  const [localSelection, setSelection] = useState<RelationSelection>(null);
  const [localViewport, setViewport] = useState<RelationViewport>({ x: 0, y: 0, zoom: 1 });
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const selection = controlledSelection === undefined ? localSelection : controlledSelection;
  const viewport = controlledViewport ?? localViewport;
  const positioned = useMemo(() => layoutRelationNodes(nodes, { layout, focusId, edges }), [nodes, layout, focusId, edges]);
  const focused = layout === "focus" && focusId !== undefined && nodes.some((node) => node.id === focusId);
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
  const endpointLabel = (id: string) => byId.get(id)?.label ?? t.missingEndpoint;
  const selectedHidden = selectedEdge && !visibleEdges.some((edge) => edge.id === selectedEdge.id);
  const blocked = state === "loading" || state === "error" || state === "empty";

  return <div {...props} ref={ref} className={cx("cdt-relation", className)} aria-label={props["aria-label"] ?? label} aria-busy={props["aria-busy"] ?? (state === "loading" || undefined)}>
    <div className="cdt-relation__toolbar">
      <label htmlFor={`${uid}-find`}>{t.findNode}<input id={`${uid}-find`} className="cdt-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.findPlaceholder} /></label>
      <label htmlFor={`${uid}-type`}>{t.relationType}<select id={`${uid}-type`} className="cdt-input" value={type} onChange={(event) => setType(event.target.value)}><option value="">{t.allTypes}</option>{types.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <a href={`#${uid}-list`} onClick={event => { event.preventDefault(); const list = event.currentTarget.ownerDocument.getElementById(`${uid}-list`); list?.focus({ preventScroll: true }); list?.scrollIntoView({ block: "start" }); }}>{t.skipToList}</a>
    </div>
    <p className="cdt-relation__legend">{focused ? t.legendFocus ?? DEFAULT_RELATION_GRAPH_LABELS.legendFocus : edges.some((edge) => edge.inferred) ? `${t.legend} ${t.legendInferred ?? DEFAULT_RELATION_GRAPH_LABELS.legendInferred}` : t.legend}</p>
    <p role={state === "error" ? "alert" : "status"}>{stateMessage ?? ({ ready: t.summary(nodes.length, visibleEdges.length), loading: t.loading, empty: t.empty, error: t.error, partial: t.partial }[state])}</p>
    {state === "error" && onRetry && <Button type="button" onClick={onRetry}>{t.retry}</Button>}
    {!blocked && <>
      <div className="cdt-relation__toolbar" aria-label={t.viewControls}>
        <Button type="button" disabled={zoom >= 8} onClick={() => changeViewport({ ...viewport, zoom: Math.min(8, zoom * 1.5) })}>{t.zoomIn}</Button>
        <Button type="button" disabled={zoom <= 0.5} onClick={() => changeViewport({ ...viewport, zoom: Math.max(0.5, zoom / 1.5) })}>{t.zoomOut}</Button>
        <Button type="button" onClick={() => changeViewport({ x: 0, y: 0, zoom: 1 })}>{t.fit}</Button>
        <Button type="button" aria-label={t.panLeft} onClick={() => pan(-1, 0)}>←</Button>
        <Button type="button" aria-label={t.panRight} onClick={() => pan(1, 0)}>→</Button>
        <Button type="button" aria-label={t.panUp} onClick={() => pan(0, -1)}>↑</Button>
        <Button type="button" aria-label={t.panDown} onClick={() => pan(0, 1)}>↓</Button>
        <output aria-label={t.zoomLevel}>{Math.round(zoom * 100)}%</output>
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
            <path d={path} markerEnd={`url(#${uid}-arrow)`} data-state={edge.retracted ? "retracted" : edge.unresolved || edge.ambiguous ? "uncertain" : edge.inferred ? "inferred" : "confirmed"} />
            {(nodes.length <= 50 || selectedEdge?.id === edge.id) && <text x={(source.x + target.x) / 2 - dy / distance * offset / 2} y={(source.y + target.y) / 2 + dx / distance * offset / 2 - 8} textAnchor="middle" className="cdt-relation__edge-label">{edge.label}</text>}
            <title>{`${endpointLabel(edge.source)} → ${edge.label} → ${endpointLabel(edge.target)} · ${edgeState(edge, t)}`}</title>
          </g>;
        })}
        {positioned.map((node) => <g key={node.id} data-node-id={node.id} className="cdt-relation__node" data-selected={selectedNode?.id === node.id || undefined} data-dimmed={neighbors.size > 0 && !neighbors.has(node.id) || undefined} onClick={() => changeSelection({ kind: "node", id: node.id })}>
          <rect x={node.x - 110} y={node.y - 26} width={220} height={52} rx={8} />
          <text x={node.x} y={node.y + 5} textAnchor="middle">{node.label.length > 24 ? `${node.label.slice(0, 23)}…` : node.label}</text><title>{node.label}</title>
        </g>)}
      </svg>
      <section aria-label={t.detail} className="cdt-relation__detail" aria-live="polite">
        {selectedNode ? <><strong>{selectedNode.label}</strong><p>{selectedNode.description ?? t.noDescription}</p><p>{selectedNode.unavailable ? t.unavailableContent : t.neighborsHighlighted}</p></>
          : selectedEdge ? <><strong>{endpointLabel(selectedEdge.source)} → {selectedEdge.label} → {endpointLabel(selectedEdge.target)}</strong><p>{t.type}: {selectedEdge.type} · {t.state}: {edgeState(selectedEdge, t)} · {t.confidence}: {selectedEdge.confidence ?? t.unknownConfidence}</p><p>{t.evidence}: {selectedEdge.evidence || t.noEvidence}</p>{selectedHidden && <p>{t.hiddenByFilter}</p>}</>
          : <p>{selection ? t.selectionMissing : t.selectionHint}</p>}
        {selection && <Button type="button" onClick={() => changeSelection(null)}>{t.clearSelection}</Button>}
      </section>
      <section id={`${uid}-list`} tabIndex={-1} aria-label={t.alternativeList}>
        <details open={query.length > 0 || nodes.length <= 12}><summary>{t.nodeList(found.length)}</summary>
          <ul className="cdt-relation__nodes">{found.map((node) => <li key={node.id}><Button type="button" aria-pressed={selectedNode?.id === node.id} onClick={() => {
            changeSelection({ kind: "node", id: node.id });
            if (query) changeViewport({ x: node.x - width / zoom / 2, y: node.y - height / zoom / 2, zoom });
          }}>{node.label}</Button>{node.unavailable && <span> · {t.nodeUnavailable}</span>}</li>)}</ul>
          {found.length === 0 && <p>{t.noMatches}</p>}
        </details>
        <Table caption={t.edgeTable(label)}>
          <Table.Head><Table.Row><Table.HeaderCell>{t.directionColumn}</Table.HeaderCell><Table.HeaderCell>{t.typeStateColumn}</Table.HeaderCell><Table.HeaderCell>{t.confidenceEvidenceColumn}</Table.HeaderCell><Table.HeaderCell>{t.selectColumn}</Table.HeaderCell></Table.Row></Table.Head>
          <Table.Body>{visibleEdges.map((edge) => <Table.Row key={edge.id} data-selected={selectedEdge?.id === edge.id || undefined}>
            <Table.Cell>{endpointLabel(edge.source)} → {edge.label} → {endpointLabel(edge.target)}</Table.Cell>
            <Table.Cell>{edge.type} · {edgeState(edge, t)}{(!byId.has(edge.source) || !byId.has(edge.target)) && ` · ${t.endpointMissing}`}</Table.Cell>
            <Table.Cell>{edge.confidence ?? t.unknownConfidence} · {edge.evidence || t.evidenceMissing}</Table.Cell>
            <Table.Cell><Button type="button" aria-pressed={selectedEdge?.id === edge.id} aria-label={t.selectEdge(edge.id)} onClick={() => changeSelection({ kind: "edge", id: edge.id })}>{t.showEvidence}</Button></Table.Cell>
          </Table.Row>)}</Table.Body>
        </Table>
        {visibleEdges.length === 0 && <p>{t.noneForFilter}</p>}
      </section>
    </>}
  </div>;
});
RelationGraph.displayName = "RelationGraph";
