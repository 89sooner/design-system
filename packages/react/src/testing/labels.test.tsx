// FR-CMP-010 ~ FR-CMP-012 · CR-053: rendered strings default to English and are overridable per instance.
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { CopyButton, DataTable, MultiSelect, ProcessingStatus, RelationGraph } from "../index";

afterEach(cleanup);

describe("CR-053 labels", () => {
  test("DataTable merges partial labels over the English defaults, functions included", () => {
    const { rerender } = render(<DataTable label="Rows" rows={[]} columns={[]} rowId={(row: string) => row} rowLabel={(row) => row} />);
    expect(screen.getByText("No results")).toBeTruthy();
    expect(screen.getByText("0 loaded")).toBeTruthy();
    rerender(<DataTable label="Rows" rows={[]} columns={[]} rowId={(row: string) => row} rowLabel={(row) => row} labels={{ empty: "검색 결과 없음", loaded: (count) => `현재 로드된 ${count}개` }} />);
    expect(screen.getByText("검색 결과 없음")).toBeTruthy();
    expect(screen.getByText("현재 로드된 0개")).toBeTruthy();
  });

  test("MultiSelect builds its remove and search names from the label functions", () => {
    render(<MultiSelect label="State" options={[{ id: "open", label: "Open" }]} value={["open"]} onValueChange={() => undefined} labels={{ remove: (option) => `${option} 제거`, searchFor: (label) => `${label} 옵션 찾기` }} />);
    expect(screen.getByRole("button", { name: "Open 제거" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "State 옵션 찾기" })).toBeTruthy();
  });

  test("ProcessingStatus and CopyButton take their state words from labels", () => {
    render(<><ProcessingStatus label="Stages" stages={[{ id: "a", label: "Receive", status: "unknown", detail: "No reply." }]} labels={{ unknown: "미확인" }} /><CopyButton value="x" label="복사" labels={{ unavailable: "복사 불가" }} /></>);
    expect(screen.getByText("미확인")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "복사" }));
    expect(screen.getByText("복사 불가")).toBeTruthy();
  });

  test("RelationGraph renders every control from labels", () => {
    render(<RelationGraph label="관계" nodes={[{ id: "a", label: "A" }]} edges={[]} labels={{ zoomIn: "확대", findNode: "노드 찾기", summary: (nodes, edges) => `${nodes}개 노드 · ${edges}개 관계` }} />);
    expect(screen.getByRole("button", { name: "확대" })).toBeTruthy();
    expect(screen.getByLabelText("노드 찾기")).toBeTruthy();
    expect(screen.getByText("1개 노드 · 0개 관계")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
  });
});
