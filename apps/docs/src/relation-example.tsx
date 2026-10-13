import { useState } from "react";
import { Link } from "react-router-dom";
import { Banner, Breadcrumb, Button, RelationGraph, type RelationEdge, type RelationGraphProps, type RelationNode } from "@conductor-by-89soone/react";

const nodes: readonly RelationNode[] = [
  { id: "demo:repo-a:pr:41", label: "#41 Improve search filters", description: "Synthetic item · a search screen that keeps its filters" },
  { id: "demo:repo-a:pr:42", label: "#42 Cache search results", description: "Synthetic item · keeps the place in the results" },
  { id: "demo:repo-b:pr:41", label: "other/#41 Fix indexing", description: "The same number in another repository still gets its own stable ID." },
  { id: "demo:repo-b:pr:43", label: "#43 Revert change" },
  { id: "demo:reference:unresolved", label: "Unresolved source reference", unavailable: true },
  { id: "demo:isolated", label: "Isolated item with no relations" },
];
const edges: readonly RelationEdge[] = [
  { id: "r-reference", source: nodes[0]!.id, target: nodes[1]!.id, type: "references", label: "references", confidence: "exact", evidence: "The synthetic body references #42 explicitly" },
  { id: "r-cycle", source: nodes[1]!.id, target: nodes[0]!.id, type: "references", label: "references", confidence: "exact", evidence: "Synthetic cycle of mutual references" },
  { id: "r-revert", source: nodes[3]!.id, target: nodes[1]!.id, type: "reverts", label: "reverts", confidence: "derived", evidence: "Synthetic revert message and its matching item" },
  { id: "r-pick", source: nodes[2]!.id, target: nodes[0]!.id, type: "cherry_picks", label: "cherry-picks from", ambiguous: true, confidence: "heuristic", evidence: "Several candidates, so none is picked as the source" },
  { id: "r-stack", source: nodes[1]!.id, target: nodes[2]!.id, type: "stacks_on", label: "stacked on", retracted: true, confidence: "exact", evidence: "Synthetic record of a removed dependency; not shown as a current dependency" },
  { id: "r-unresolved", source: nodes[0]!.id, target: nodes[4]!.id, type: "references", label: "references", unresolved: true, evidence: "Only the source reference is known; no guess about whether the target exists or why it is inaccessible" },
];
const states = ["ready", "loading", "empty", "error", "partial", "long"] as const;
export function RelationExample() {
  const [state, setState] = useState<typeof states[number]>("ready");
  const [large, setLarge] = useState(false);
  const exampleNodes = large ? Array.from({ length: 300 }, (_, i) => ({ id: `synthetic:${String(i).padStart(3, "0")}`, label: `Synthetic node ${i + 1}` })) : nodes;
  const exampleEdges = large ? exampleNodes.map((node, i) => ({ id: `synthetic-edge:${i}`, source: node.id, target: exampleNodes[(i + 1) % exampleNodes.length]!.id, type: "references", label: "references", confidence: "synthetic", evidence: "300-node cyclic input — not connected to a live API" })) : edges;
  return <section className="cdt-page docs-relation-example" aria-labelledby="relation-example-title">
    <Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>Examples</span></Breadcrumb>
    <div><p className="docs-eyebrow">WORKSPACE / 02</p><h1 id="relation-example-title">Relation explorer</h1><p className="docs-lead">A map of changes that reads direction and evidence together.</p></div>
    <Banner tone="info">Hand-written synthetic data · not connected to a live API. Lookups and retries only change in-memory state on this page.</Banner>
    <div className="cdt-relation__toolbar"><label>Relation example state <select className="cdt-input" value={state} onChange={(event) => setState(event.target.value as typeof state)}>{states.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><Button type="button" aria-pressed={large} onClick={() => setLarge(!large)}>{large ? "Default 6 nodes" : "Try 300 nodes"}</Button></div>
    {/* "long" 상태는 CJK 줄바꿈을 검증하려고 짧은 한국어 조각을 의도적으로 섞는다. */}
    <RelationGraph label="Synthetic relation explorer" nodes={state === "empty" ? [] : exampleNodes} edges={state === "empty" ? [] : state === "long" ? exampleEdges.map((edge) => ({ ...edge, evidence: `${edge.evidence} · 긴 한국어 mixed with long English evidence — packages/search/very-long-path/검증/abcdefghijklmnopqrstuvwxyz0123456789abcdef.ts` })) : exampleEdges}
      state={(state === "long" ? "ready" : state) as RelationGraphProps["state"]} onRetry={() => setState("ready")} />
  </section>;
}
