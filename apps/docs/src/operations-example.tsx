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
    { id: "receive", label: "Receive", status: "complete", detail: "Received the synthetic event. Receipt does not mean it is indexed." },
    { id: "store", label: "Durable store", status: "complete", detail: "Got a synthetic storage acknowledgement. The processing result is checked separately." },
    { id: "process", label: "Process", status: retried ? "pending" : "failed", detail: retried ? "Logged a synthetic retry request. Processing is not confirmed yet." : "Couldn't process because an external response was slow. The stored event is kept.", action: retried ? undefined : { label: "Retry synthetic processing", disabledReason: allowed ? undefined : "The consumer didn't grant run permission.", onAction: () => { setRetried(true); setFeedback("Logged 1 synthetic retry request · no live request"); } } },
    { id: "index", label: "Search index", status: mode === "partial" ? "unknown" : "delayed", detail: mode === "partial" ? "No index status response, so freshness can't be confirmed." : "Waiting for processing to finish. Search results may be out of date." },
  ];
  return <section className="cdt-page docs-operations-example" aria-labelledby="operations-title"><Breadcrumb><Link to="/">Conductor</Link><span aria-hidden="true">/</span><span>Examples</span></Breadcrumb><div><p className="docs-eyebrow">WORKSPACE / 03</p><h1 id="operations-title">Ingestion status</h1><p className="docs-lead">Tell events that have arrived apart from changes you can search.</p></div><Banner tone="info">Synthetic state controller · not connected to a live API. No automatic polling or live resends.</Banner>
    <FilterToolbar><label>Operations example state <select className="cdt-input" value={mode} onChange={event => { setMode(event.target.value as typeof mode); setRetried(false); setFeedback(""); }}>{modes.map(value => <option key={value}>{value}</option>)}</select></label><label><input type="checkbox" checked={allowed} onChange={event => setAllowed(event.target.checked)} /> Synthetic run permission</label><Button variant="ghost" onClick={() => { setRetried(false); setFeedback("Synthetic scenario reset"); }}>Reset scenario</Button></FilterToolbar>
    {mode === "loading" ? <Skeleton label="Loading status" /> : mode === "empty" ? <EmptyState title="No events to check" /> : mode === "error" ? <Banner tone="danger" action={<Button onClick={() => setMode("ready")}>Reload synthetic status</Button>}>Couldn't load status. The last known state is not shown as up to date.</Banner> : <><Banner tone="warning">{mode === "partial" ? "Some states unknown · showing confirmed stages only." : "Indexing is delayed after a processing failure."}</Banner>{/* "long" 모드는 CJK 줄바꿈을 검증하려고 짧은 한국어 조각을 의도적으로 섞는다. */}<ProcessingStatus label="Synthetic ingestion stages" stages={mode === "long" ? stages.map(stage => ({ ...stage, detail: `${stage.detail} Synthetic path: engineering/search/long-branch-name/한국어와-English-mixed-status-evidence-checked-together.` })) : stages} /></>}
    <p role="status">{feedback}</p>
  </section>;
}
