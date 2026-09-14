import { useState } from "react";
import { Link } from "react-router-dom";
import { Banner, Breadcrumb, Button, EmptyState, FilterToolbar, ProcessingStatus, Skeleton, type ProcessingStage } from "@conductor-by-89soone/react";
const modes = ["ready", "loading", "empty", "error", "partial", "long"] as const;
export function OperationsExample() {
  const [mode, setMode] = useState<typeof modes[number]>("ready");
  const [retried, setRetried] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [allowed, setAllowed] = useState(true);
  const stages: readonly ProcessingStage[] = [
    { id: "receive", label: "수신", status: "complete", detail: "합성 이벤트를 수신했습니다. 수신은 색인 완료를 뜻하지 않습니다." },
    { id: "store", label: "내구 저장", status: "complete", detail: "합성 저장 확인을 받았습니다. 처리 결과는 별도로 확인합니다." },
    { id: "process", label: "처리", status: retried ? "pending" : "failed", detail: retried ? "합성 재시도 요청을 기록했습니다. 처리 완료는 아직 확인되지 않았습니다." : "외부 응답 지연으로 처리하지 못했습니다. 저장된 이벤트는 유지됩니다.", action: retried ? undefined : { label: "합성 처리 재시도", disabledReason: allowed ? undefined : "소비자가 실행 권한을 제공하지 않았습니다.", onAction: () => { setRetried(true); setFeedback("합성 재시도 요청 1건 기록 · 운영 요청 없음"); } } },
    { id: "index", label: "검색 색인", status: mode === "partial" ? "unknown" : "delayed", detail: mode === "partial" ? "색인 상태 응답이 없어 최신 여부를 확인할 수 없습니다." : "처리 완료 대기 중입니다. 검색 결과는 이전 상태일 수 있습니다." },
  ];
  return <section className="cdt-page docs-operations-example" aria-labelledby="operations-title"><Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>조합 예제</span></Breadcrumb><div><p className="docs-eyebrow">WORKSPACE / 03</p><h1 id="operations-title">수집 운영 상태</h1><p className="docs-lead">도착한 이벤트와 검색 가능한 변경을 구분합니다.</p></div><Banner tone="info">합성 상태 컨트롤러 · 운영 API 미연동. 자동 polling·운영 재전송을 실행하지 않습니다.</Banner>
    <FilterToolbar><label>운영 예제 상태 <select className="cdt-input" value={mode} onChange={event => { setMode(event.target.value as typeof mode); setRetried(false); setFeedback(""); }}>{modes.map(value => <option key={value}>{value}</option>)}</select></label><label><input type="checkbox" checked={allowed} onChange={event => setAllowed(event.target.checked)} /> 합성 실행 권한</label><Button variant="ghost" onClick={() => { setRetried(false); setFeedback("합성 시나리오 초기화"); }}>시나리오 초기화</Button></FilterToolbar>
    {mode === "loading" ? <Skeleton label="상태 조회 중" /> : mode === "empty" ? <EmptyState title="확인할 이벤트 없음" /> : mode === "error" ? <Banner tone="danger" action={<Button onClick={() => setMode("ready")}>합성 상태 다시 조회</Button>}>상태 조회에 실패했습니다. 마지막 상태를 최신이라고 표시하지 않습니다.</Banner> : <><Banner tone="warning">{mode === "partial" ? "일부 상태 미확인 · 확인된 단계만 표시합니다." : "처리 실패 이후 색인이 지연되고 있습니다."}</Banner><ProcessingStatus label="합성 수집 처리 단계" stages={mode === "long" ? stages.map(stage => ({ ...stage, detail: `${stage.detail} 합성 경로: engineering/search/long-branch-name/한국어와-English-상태-근거를-함께-확인합니다.` })) : stages} /></>}
    <p role="status">{feedback}</p>
  </section>;
}
