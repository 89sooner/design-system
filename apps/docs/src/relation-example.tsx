import { useState } from "react";
import { Link } from "react-router-dom";
import { Banner, Breadcrumb, Button, RelationGraph, type RelationEdge, type RelationGraphProps, type RelationNode } from "@conductor-by-89soone/react";

const nodes: readonly RelationNode[] = [
  { id: "demo:repo-a:pr:41", label: "#41 검색 조건 개선", description: "합성 항목 · 필터 조건을 보존하는 검색 화면" },
  { id: "demo:repo-a:pr:42", label: "#42 검색 결과 캐시", description: "합성 항목 · 결과 탐색 위치 보존" },
  { id: "demo:repo-b:pr:41", label: "other/#41 색인 수정", description: "다른 저장소의 같은 번호도 별개 안정 ID로 표시합니다." },
  { id: "demo:repo-b:pr:43", label: "#43 변경 되돌림" },
  { id: "demo:reference:unresolved", label: "미해결 원 참조", unavailable: true },
  { id: "demo:isolated", label: "연결 없는 독립 항목" },
];
const edges: readonly RelationEdge[] = [
  { id: "r-reference", source: nodes[0]!.id, target: nodes[1]!.id, type: "references", label: "참조함", confidence: "exact", evidence: "합성 본문에 #42 참조가 명시됨" },
  { id: "r-cycle", source: nodes[1]!.id, target: nodes[0]!.id, type: "references", label: "참조함", confidence: "exact", evidence: "상호 참조를 포함하는 합성 사이클" },
  { id: "r-revert", source: nodes[3]!.id, target: nodes[1]!.id, type: "reverts", label: "되돌림", confidence: "derived", evidence: "합성 되돌림 메시지와 대응 항목" },
  { id: "r-pick", source: nodes[2]!.id, target: nodes[0]!.id, type: "cherry_picks", label: "원본을 가져옴", ambiguous: true, confidence: "heuristic", evidence: "후보가 여러 개이므로 하나로 확정하지 않음" },
  { id: "r-stack", source: nodes[1]!.id, target: nodes[2]!.id, type: "stacks_on", label: "의존했음", retracted: true, confidence: "exact", evidence: "합성 의존 해제 기록; 현재 의존으로 표시하지 않음" },
  { id: "r-unresolved", source: nodes[0]!.id, target: nodes[4]!.id, type: "references", label: "참조함", unresolved: true, evidence: "원 참조만 확인 가능; 대상 존재/접근 사유를 추론하지 않음" },
];
const states = ["ready", "loading", "empty", "error", "partial", "long"] as const;
export function RelationExample() {
  const [state, setState] = useState<typeof states[number]>("ready");
  const [large, setLarge] = useState(false);
  const exampleNodes = large ? Array.from({ length: 300 }, (_, i) => ({ id: `synthetic:${String(i).padStart(3, "0")}`, label: `합성 노드 ${i + 1}` })) : nodes;
  const exampleEdges = large ? exampleNodes.map((node, i) => ({ id: `synthetic-edge:${i}`, source: node.id, target: exampleNodes[(i + 1) % exampleNodes.length]!.id, type: "references", label: "참조함", confidence: "synthetic", evidence: "300 노드 순환 입력 — 운영 API 미연동" })) : edges;
  return <section className="cdt-page docs-relation-example" aria-labelledby="relation-example-title">
    <Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>조합 예제</span></Breadcrumb>
    <div><p className="docs-eyebrow">WORKSPACE / 02</p><h1 id="relation-example-title">관계 탐색기</h1><p className="docs-lead">방향과 근거를 함께 읽는 변경 지도.</p></div>
    <Banner tone="info">직접 작성한 합성 데이터 · 운영 API 미연동. 조회·재시도는 이 화면의 메모리 상태만 바꿉니다.</Banner>
    <div className="cdt-relation__toolbar"><label>관계 예제 상태 <select className="cdt-input" value={state} onChange={(event) => setState(event.target.value as typeof state)}>{states.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><Button type="button" aria-pressed={large} onClick={() => setLarge(!large)}>{large ? "기본 6개 노드" : "300개 노드 실험"}</Button></div>
    <RelationGraph label="합성 관계 탐색" nodes={state === "empty" ? [] : exampleNodes} edges={state === "empty" ? [] : state === "long" ? exampleEdges.map((edge) => ({ ...edge, evidence: `${edge.evidence} · 긴 한국어 English 혼용 근거 — packages/search/very-long-path/검증/abcdefghijklmnopqrstuvwxyz0123456789abcdef.ts` })) : exampleEdges}
      state={(state === "long" ? "ready" : state) as RelationGraphProps["state"]} onRetry={() => setState("ready")} />
  </section>;
}
