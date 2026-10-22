// FR-CMP-010 FR-CMP-012 · WP-030 WP-032
import { createRef, type ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Breadcrumb, Combobox, CopyButton, DataTable, DetailInspector, FilterChip, FilterToolbar, MultiSelect, PathList, ProcessingStatus, Skeleton, WorkbenchLayout } from "../workbench";
import { runContractSuite } from "./contract";
afterEach(cleanup);
runContractSuite<HTMLDivElement, ComponentProps<typeof FilterToolbar>>("FilterToolbar", FilterToolbar, {}, "cdt-filter-toolbar");
runContractSuite<HTMLSpanElement, ComponentProps<typeof FilterChip>>("FilterChip", FilterChip, { children: "Filter", removeLabel: "Remove", onRemove() {} }, "cdt-filter-chip");
runContractSuite<HTMLDivElement, ComponentProps<typeof Combobox>>("Combobox", Combobox, { label: "Repository", options: [], query: "", value: null, onQueryChange() {}, onValueChange() {} }, "cdt-combobox");
runContractSuite<HTMLFieldSetElement, ComponentProps<typeof MultiSelect>>("MultiSelect", MultiSelect, { label: "States", options: [], value: [], onValueChange() {} }, "cdt-multi-select");
runContractSuite<HTMLDivElement, ComponentProps<typeof WorkbenchLayout>>("WorkbenchLayout", WorkbenchLayout, {}, "cdt-workbench");
runContractSuite<HTMLElement, ComponentProps<typeof DetailInspector>>("DetailInspector", DetailInspector, { label: "Preview", onClose() {} }, "cdt-detail-inspector");
runContractSuite<HTMLDivElement, ComponentProps<typeof Skeleton>>("Skeleton", Skeleton, { label: "Loading" }, "cdt-skeleton");
runContractSuite<HTMLElement, ComponentProps<typeof Breadcrumb>>("Breadcrumb", Breadcrumb, {}, "cdt-breadcrumb");
runContractSuite<HTMLUListElement, ComponentProps<typeof PathList>>("PathList", PathList, { items: [] }, "cdt-path-list");
runContractSuite<HTMLSpanElement, ComponentProps<typeof CopyButton>>("CopyButton", CopyButton, { value: "value" }, "cdt-copy-feedback");
runContractSuite<HTMLDivElement, ComponentProps<typeof ProcessingStatus>>("ProcessingStatus", ProcessingStatus, { label: "Stages", stages: [] }, "cdt-processing-status");

describe("FR-CMP-010 search contracts", () => {
  test("IME Enter cannot select, disabled and stale options cannot select", () => {
    const change = vi.fn(); const query = vi.fn();
    const props = { label: "Repository", query: "", value: null, options: [{ id: "a", label: "Atlas" }, { id: "b", label: "Blocked", disabled: true }], onQueryChange: query, onValueChange: change };
    const { rerender } = render(<Combobox {...props} />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.compositionStart(input); fireEvent.keyDown(input, { key: "Enter", isComposing: true }); fireEvent.compositionEnd(input);
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "ArrowDown" }); fireEvent.keyDown(input, { key: "Enter" });
    expect(change).toHaveBeenCalledWith("a");
    change.mockClear(); rerender(<Combobox {...props} query="new" resultsQuery="old" />);
    fireEvent.keyDown(input, { key: "ArrowDown" }); fireEvent.keyDown(input, { key: "Enter" });
    expect(change).not.toHaveBeenCalled(); expect(screen.queryAllByRole("option")).toHaveLength(0);
  });
  test("disabling an open combobox hides its options", () => {
    const change = vi.fn(); const props = { label: "Repository", query: "", value: null, options: [{ id: "a", label: "Atlas" }], onQueryChange() {}, onValueChange: change };
    const { rerender } = render(<Combobox {...props} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    expect(screen.getByRole("option")).toBeTruthy();
    rerender(<Combobox {...props} disabled />);
    expect(screen.queryByRole("option")).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
  test("multiselect is checkbox group, removals preserve stable IDs", () => {
    const change = vi.fn(); render(<MultiSelect label="States" options={[{ id: "open", label: "Open" }, { id: "closed", label: "Closed", disabled: true }]} value={["open"]} onValueChange={change} />);
    expect(screen.queryByRole("combobox")).toBeNull(); fireEvent.click(screen.getByRole("button", { name: "Remove Open" })); expect(change).toHaveBeenCalledWith([]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Closed" })); expect(change).toHaveBeenCalledTimes(1);
  });
  test("table calls external sort without sorting data; selection is explicit and ID based", () => {
    const select = vi.fn(); const sort = vi.fn(); const ref = createRef<HTMLDivElement>();
    const rows = [{ id: "z", label: "Zulu" }, { id: "a", label: "Alpha" }];
    render(<DataTable ref={ref} label="Results" rows={rows} rowId={row => row.id} rowLabel={row => row.label} columns={[{ id: "label", header: "Title", sortable: true, cell: row => <a href="#details">{row.label}</a> }]} onSelect={select} onSortChange={sort} />);
    expect(ref.current?.classList.contains("cdt-data-table")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /Title/ })); expect(sort).toHaveBeenCalledWith({ column: "label", direction: "ascending" });
    expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual(["Zulu", "Alpha"]);
    fireEvent.click(screen.getByRole("link", { name: "Alpha" })); expect(select).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Preview Alpha" })); expect(select.mock.calls[0]?.[0]).toBe("a");
  });
  test("CR-064 AC-6: rows carry their stable ID, columns take a minimum width, and the state banner takes an action", () => {
    const retry = vi.fn();
    render(<DataTable label="PRs" rows={[{ id: "atlas/search#70" }, { id: "atlas/web#71" }]} rowId={(row) => row.id} rowLabel={(row) => row.id}
      columns={[{ id: "id", header: "ID", cell: (row) => row.id }, { id: "state", header: "State", minInlineSize: "7rem" /* cdt-allow-literal: consumer-supplied column minimum under test */, cell: () => "open" }]}
      state="partial" message="One repository couldn't be searched." stateAction={<button type="button" onClick={retry}>Retry</button>} />);
    expect([...document.querySelectorAll("tbody tr")].map((row) => row.getAttribute("data-row-id"))).toEqual(["atlas/search#70", "atlas/web#71"]);
    const [idHeader, stateHeader] = screen.getAllByRole("columnheader");
    expect(idHeader!.style.minInlineSize).toBe("");
    expect(stateHeader!.style.minInlineSize).toBe("7rem"); /* cdt-allow-literal: the value passed above */
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  test("empty/loading/error rows and cursor action remain honest", () => {
    const load = vi.fn(); const props = { label: "Results", rows: [] as string[], rowId: (row: string) => row, rowLabel: (row: string) => row, columns: [{ id: "name", header: "Name", cell: (row: string) => row }] };
    const { rerender } = render(<DataTable {...props} />); expect(screen.getByText("No results")).toBeTruthy();
    rerender(<DataTable {...props} state="loading" />); expect(screen.getByText("Loading results")).toBeTruthy();
    rerender(<DataTable {...props} state="error" message="Failed" />); expect(screen.getByText("Failed")).toBeTruthy();
    rerender(<DataTable {...props} rows={["one"]} hasMore onLoadMore={load} />); fireEvent.click(screen.getByRole("button", { name: "Load more" })); expect(load).toHaveBeenCalledOnce(); expect(screen.queryByText(/\bpages?\b/i)).toBeNull();
  });
  test("inspector Escape returns focus without scrolling and path disclosures select leaves", () => {
    const close = vi.fn(); const path = vi.fn(); const trigger = createRef<HTMLButtonElement>();
    render(<><button ref={trigger}>Select</button><DetailInspector label="Preview" onClose={close} returnFocusRef={trigger}><PathList items={[{ id: "folder", label: "src", children: [{ id: "file", label: "한국어.ts" }] }]} onPathSelect={path} /></DetailInspector></>);
    fireEvent.click(screen.getByText("src")); fireEvent.click(screen.getByRole("button", { name: "한국어.ts" })); expect(path).toHaveBeenCalledWith("file");
    fireEvent.keyDown(screen.getByRole("region", { name: "Preview" }), { key: "Escape" }); expect(close).toHaveBeenCalledOnce(); expect(document.activeElement).toBe(trigger.current);
  });
  test("old clipboard completion cannot reappear after A to B to A", async () => {
    let resolve: (() => void) | undefined;
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => new Promise<void>(done => { resolve = done; }) } });
    const { rerender } = render(<CopyButton value="A" />); fireEvent.click(screen.getByRole("button")); rerender(<CopyButton value="B" />); rerender(<CopyButton value="A" />);
    await act(async () => resolve?.()); expect(screen.getByRole("status").textContent).toBe("");
  });
  test("operational permission denied action never calls consumer and index remains unknown", () => {
    const retry = vi.fn(); render(<ProcessingStatus label="Pipeline" stages={[{ id: "receive", label: "Received", status: "complete", detail: "Received only" }, { id: "index", label: "Index", status: "unknown", detail: "Not confirmed", action: { label: "Retry", onAction: retry, disabledReason: "No permission" } }]} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" })); expect(retry).not.toHaveBeenCalled(); expect(screen.getByText("Unknown")).toBeTruthy(); expect(screen.getByText("No permission")).toBeTruthy();
  });
});
