// FR-CMP-011 / WP-031 / CR-041
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { RelationGraph, layoutRelationNodes, type RelationEdge, type RelationNode, type RelationGraphProps } from "../relation";

import { runContractSuite } from "./contract";

runContractSuite<HTMLDivElement, RelationGraphProps>("RelationGraph", RelationGraph, { label: "Relations", nodes: [], edges: [] }, "cdt-relation");

afterEach(cleanup);
const nodes: RelationNode[] = [{ id: "b", label: "다른 저장소 #1" }, { id: "a", label: "저장소 #1" }, { id: "unknown", label: "원 참조", unavailable: true }];
const edges: RelationEdge[] = [
  { id: "out", source: "a", target: "b", type: "references", label: "참조함", evidence: "합성 본문", confidence: "exact" },
  { id: "back", source: "b", target: "a", type: "stacks_on", label: "의존했음", evidence: "합성 해제", retracted: true, ambiguous: true },
  { id: "missing", source: "a", target: "absent", type: "references", label: "참조함", evidence: "원 표현", unresolved: true },
];
describe("FR-CMP-011 relation exploration", () => {
  test("stable layout independent of input order, cycles need no DAG", () => {
    expect(layoutRelationNodes(nodes)).toEqual(layoutRelationNodes([...nodes].reverse()));
  });
  test("table selection shows direction, distinct flags, evidence and confidence", () => {
    const view = render(<RelationGraph label="관계" nodes={nodes} edges={edges} />);
    fireEvent.click(view.getByRole("button", { name: "Select relation: back" }));
    const detail = view.getByRole("region", { name: "Selected relation details" });
    expect(detail.textContent).toContain("다른 저장소 #1 → 의존했음 → 저장소 #1");
    expect(detail.textContent).toContain("Retracted · Ambiguous");
    expect(detail.textContent).toContain("합성 해제");
    expect(detail.textContent).toContain("Unknown");
    fireEvent.click(view.getByRole("button", { name: "Select relation: missing" }));
    expect(detail.textContent).toContain("No details for this endpoint");
    expect(detail.textContent).toContain("Unresolved");
  });
  test("filters and equivalent data rerender preserve viewport and selection", () => {
    const view = render(<RelationGraph label="관계" nodes={nodes} edges={edges} />);
    fireEvent.click(view.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(view.getByRole("button", { name: "Select relation: back" }));
    const before = view.container.querySelector("svg")!.getAttribute("viewBox");
    fireEvent.change(view.getByLabelText("Relation type"), { target: { value: "references" } });
    view.rerender(<RelationGraph label="관계" nodes={[...nodes]} edges={[...edges]} />);
    expect(view.container.querySelector("svg")!.getAttribute("viewBox")).toBe(before);
    expect(view.getByRole("region", { name: "Selected relation details" }).textContent).toContain("hidden by the current type filter");
    fireEvent.click(view.getByRole("button", { name: "Fit all" }));
    expect(view.getByLabelText("Zoom level").textContent).toBe("100%");
  });
  test("node finding preserves isolated and unavailable entries and highlights neighbors", () => {
    const view = render(<RelationGraph label="관계" nodes={nodes} edges={edges} />);
    fireEvent.change(view.getByLabelText("Find node"), { target: { value: "저장소 #1" } });
    fireEvent.click(view.getByRole("button", { name: "저장소 #1" }));
    expect(view.container.querySelector('[data-node-id="unknown"]')!.getAttribute("data-dimmed")).toBe("true");
    expect(view.container.querySelector('[data-node-id="b"]')!.hasAttribute("data-dimmed")).toBe(false);
    fireEvent.change(view.getByLabelText("Find node"), { target: { value: "does not exist" } });
    expect(view.getByText("No matching nodes")).toBeTruthy();
  });
  test("controlled state reports actions without mutating input; unique instance IDs", () => {
    const onSelectionChange = vi.fn(); const onViewportChange = vi.fn();
    const view = render(<><RelationGraph label="하나" nodes={nodes} edges={edges} selection={null} onSelectionChange={onSelectionChange} viewport={{ x: 0, y: 0, zoom: 1 }} onViewportChange={onViewportChange} /><RelationGraph label="둘" nodes={[]} edges={[]} /></>);
    fireEvent.click(view.getByRole("button", { name: "Select relation: out" }));
    expect(onSelectionChange).toHaveBeenCalledWith({ kind: "edge", id: "out" });
    expect(view.getByRole("button", { name: "Select relation: out" }).getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(view.getAllByRole("button", { name: "Pan graph left" })[0]!);
    expect(onViewportChange).toHaveBeenCalledOnce();
    const ids = [...view.container.querySelectorAll("[id]")].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  test("loading/error/empty/partial remain distinct; retry is an explicit callback", () => {
    const onRetry = vi.fn();
    const view = render(<RelationGraph label="관계" nodes={[]} edges={[]} state="error" onRetry={onRetry} />);
    expect(view.getByRole("alert").textContent).toContain("Couldn't load");
    fireEvent.click(view.getByRole("button", { name: "Retry relations" })); expect(onRetry).toHaveBeenCalledOnce();
    view.rerender(<RelationGraph label="관계" nodes={[]} edges={[]} state="empty" />);
    expect(view.getByRole("status").textContent).toContain("No confirmed relations");
    expect(view.queryByRole("table")).toBeNull();
    view.rerender(<RelationGraph label="관계" nodes={nodes} edges={edges} state="partial" />);
    expect(view.getByText("Partial result: some relations may be missing")).toBeTruthy();
    expect(within(view.getByRole("table")).getAllByRole("row")).toHaveLength(4);
    view.rerender(<RelationGraph label="관계" nodes={[]} edges={[]} state="loading" />);
    expect(view.container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
  });
  // Measurement only — no time budget is asserted. At 300 nodes the Testing Library queries walk ~3.3k elements and
  // take 3–4 s on their own, so the 5 s default timed out under the parallel CI suite (twice on PR #32, CR-042).
  test.each([50, 300])("measures %i node cyclic layout/render/select/filter/zoom", (count) => {
    const input = Array.from({ length: count }, (_, i) => ({ id: `n${i}`, label: `긴 한국어 Node ${i}` }));
    const connections = input.map((node, i) => ({ id: `e${i}`, source: node.id, target: input[(i + 1) % count]!.id, type: i % 2 ? "references" : "reverts", label: "관계", evidence: "합성" }));
    const t0 = performance.now(); layoutRelationNodes(input); const t1 = performance.now();
    const view = render(<RelationGraph label="성능" nodes={input} edges={connections} />); const t2 = performance.now();
    fireEvent.click(view.getByRole("button", { name: "Select relation: e0" })); const t3 = performance.now();
    fireEvent.change(view.getByLabelText("Relation type"), { target: { value: "references" } }); const t4 = performance.now();
    fireEvent.click(view.getByRole("button", { name: "Zoom in" })); const t5 = performance.now();
    console.info(JSON.stringify({ nodes: count, layoutMs: t1 - t0, renderMs: t2 - t1, selectMs: t3 - t2, filterMs: t4 - t3, zoomMs: t5 - t4, dom: view.container.querySelectorAll("*").length, environment: "Vitest/jsdom; timings include Testing Library queries" }));
    expect(view.container.querySelectorAll("[data-node-id]")).toHaveLength(count);
    expect(view.container.querySelectorAll("[data-edge-id]")).toHaveLength(count / 2);
  }, 20_000);
});
