"use client";
import React, { useRef, useState } from "react";
import { Button, Tabs, Popover, Collapsible, DataTable, DetailInspector, WorkbenchLayout, ProcessingStatus } from "@conductor-by-89soone/react";
import { RelationGraph } from "@conductor-by-89soone/react/relation";

const rows = [{ id: "synthetic:a", title: "PR A · 한글 검색" }, { id: "synthetic:b", title: "PR B · Index update" }];
export default function Consumer() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("results");
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  return <>
    <h1>Installed package consumer</h1>
    <p>합성 데이터 검증 · 운영 API 미연동</p>
    <Button onClick={() => setCount(count + 1)}>Hydrated {count}</Button>
    <Popover.Root><Popover.Trigger asChild><Button>View options</Button></Popover.Trigger><Popover.Content aria-label="Options"><p>Installed portal</p><Popover.Close asChild><Button>Close options</Button></Popover.Close></Popover.Content></Popover.Root>
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List aria-label="Investigation"><Tabs.Trigger value="results">Results</Tabs.Trigger><Tabs.Trigger value="relations">Relations</Tabs.Trigger><Tabs.Trigger value="processing">Processing</Tabs.Trigger></Tabs.List>
      <Tabs.Content value="results"><WorkbenchLayout inspector={selected ? <DetailInspector label="PR preview" returnFocusRef={returnFocus} onClose={() => setSelected(null)}><p>{rows.find(row => row.id === selected)?.title}</p><Collapsible.Root><Collapsible.Trigger>Evidence disclosure</Collapsible.Trigger><Collapsible.Content>Explicit synthetic evidence</Collapsible.Content></Collapsible.Root></DetailInspector> : null}>
        <DataTable label="Synthetic results" rows={rows} rowId={row => row.id} rowLabel={row => row.title} columns={[{ id: "title", header: "Title", cell: row => row.title }]} selectedId={selected} onSelect={(id, trigger) => { returnFocus.current = trigger; setSelected(id); }} />
      </WorkbenchLayout></Tabs.Content>
      <Tabs.Content value="relations"><RelationGraph label="Synthetic relations" nodes={rows.map(row => ({ id: row.id, label: row.title }))} edges={[{ id: "synthetic:edge", source: rows[0]!.id, target: rows[1]!.id, type: "references", label: "references", evidence: "Synthetic explicit reference", confidence: "explicit" }]} /></Tabs.Content>
      <Tabs.Content value="processing"><ProcessingStatus label="Synthetic processing" stages={[{ id: "received", label: "수신", status: "complete", detail: "합성 이벤트 수신" }, { id: "index", label: "색인", status: "delayed", detail: "검색 최신 여부는 미확인", action: { label: "합성 재시도", onAction: () => setCount(count + 1), disabledReason: "운영 API 미연동" } }]} /></Tabs.Content>
    </Tabs.Root>
  </>;
}
