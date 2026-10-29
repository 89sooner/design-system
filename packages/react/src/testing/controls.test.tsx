// FR-CMP-014 · CR-054: Toast, DatePicker, CommandPalette, Pagination.
import { createRef, useState, type ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CommandPalette, filterCommands, type Command } from "../command";
import { DatePicker } from "../date-picker";
import { Field } from "../form";
import { Pagination, paginationRange } from "../pagination";
import { Toast } from "../toast";
import { runContractSuite } from "./contract";

afterEach(cleanup);
runContractSuite<HTMLElement, ComponentProps<typeof Pagination>>("Pagination", Pagination, { page: 1, pageCount: 3, onPageChange() {} }, "cdt-pagination");
runContractSuite<HTMLButtonElement, ComponentProps<typeof DatePicker>>("DatePicker", DatePicker, { value: undefined, onValueChange() {} }, "cdt-date-picker");

describe("FR-CMP-014 Pagination", () => {
  test("paginationRange keeps the ends, the siblings and an ellipsis per gap of two or more", () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(paginationRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(paginationRange(4, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(paginationRange(10, 10)).toEqual([1, "ellipsis", 9, 10]);
    expect(paginationRange(3, 5, 2)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(1, 1)).toEqual([1]);
    expect(paginationRange(1, 0)).toEqual([]);
    expect(paginationRange(99, 4)).toEqual([1, 2, 3, 4]);
  });

  test("the current page is aria-current, ends disable previous/next, and clicks report the page", () => {
    const change = vi.fn();
    const { rerender } = render(<Pagination page={1} pageCount={5} onPageChange={change} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-current")).toBe("page");
    expect((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Page 5" }));
    fireEvent.click(screen.getByRole("button", { name: "Page 1" }));
    expect(change.mock.calls).toEqual([[2], [5]]);
    expect(screen.queryByRole("button", { name: "Page 3" })).toBeNull();
    rerender(<Pagination page={5} pageCount={5} onPageChange={change} labels={{ next: "다음", page: (page) => `${page}쪽` }} />);
    expect((screen.getByRole("button", { name: "다음" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "5쪽" }).getAttribute("aria-current")).toBe("page");
  });
});

const commands: readonly Command[] = [
  { id: "deploy", label: "Deploy to production", group: "Releases", keywords: ["ship"], shortcut: ["⌘", "D"] },
  { id: "rollback", label: "Roll back", group: "Releases", disabled: true },
  { id: "tokens", label: "Open token reference", group: "Navigate" },
];

describe("FR-CMP-014 CommandPalette", () => {
  test("filterCommands needs every term in the label, group or keywords", () => {
    expect(filterCommands(commands, "").map((command) => command.id)).toEqual(["deploy", "rollback", "tokens"]);
    expect(filterCommands(commands, "SHIP").map((command) => command.id)).toEqual(["deploy"]);
    expect(filterCommands(commands, "releases roll").map((command) => command.id)).toEqual(["rollback"]);
    expect(filterCommands(commands, "navigate deploy")).toEqual([]);
  });

  test("arrow keys move over enabled commands; Enter runs one and closes the palette", () => {
    const select = vi.fn();
    const openChange = vi.fn();
    render(<CommandPalette open onOpenChange={openChange} commands={commands} onSelect={select} />);
    const dialog = screen.getByRole("dialog", { name: "Command palette" });
    const input = within(dialog).getByRole("combobox", { name: "Search commands" });
    expect(within(dialog).getByRole("group", { name: "Releases" })).toBeTruthy();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(select).toHaveBeenCalledWith("tokens");
    expect(openChange).toHaveBeenCalledWith(false);
  });

  test("typing filters and announces the count; no match shows the empty message", () => {
    render(<CommandPalette open onOpenChange={() => undefined} commands={commands} onSelect={() => undefined} labels={{ results: (count) => `${count}개 명령` }} />);
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "token" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("1개 명령")).toBeTruthy();
    fireEvent.change(input, { target: { value: "nothing here" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getAllByText("No matching commands").length).toBeGreaterThan(0);
  });
});

describe("FR-CMP-014 AC-6 (CR-079) CommandPalette IME and second lines", () => {
  test.each([
    ["keyCode 229", { key: "Enter", keyCode: 229 }],
    ["isComposing with keyCode 13", { key: "Enter", keyCode: 13, isComposing: true }],
  ])("an Enter that confirms an IME composition (%s) runs nothing", (_name, init) => {
    const select = vi.fn();
    render(<CommandPalette open onOpenChange={() => undefined} commands={commands} onSelect={select} />);
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.change(input, { target: { value: "배포" } });
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.keyDown(input, init);
    expect(select).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(select).toHaveBeenCalledWith("deploy");
  });

  test("composition events alone also hold Enter until compositionend", () => {
    const select = vi.fn();
    render(<CommandPalette open onOpenChange={() => undefined} commands={commands} onSelect={select} />);
    const input = screen.getByRole("combobox", { name: "Search commands" });
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(select).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(select).toHaveBeenCalledWith("deploy");
  });

  test("description is a second line in the option's name; a disabled command shows its reason instead", () => {
    render(<CommandPalette open onOpenChange={() => undefined} onSelect={() => undefined} commands={[
      { id: "copy", label: "Copy ID", description: "atlas/search#70" },
      { id: "explore", label: "Explore relations", description: "atlas/search#70", disabled: true, disabledReason: "Select a pull request first" },
      { id: "plain", label: "Toggle theme" },
    ]} />);
    const [copy, explore, plain] = screen.getAllByRole("option");
    expect(copy!.textContent).toBe("Copy IDatlas/search#70");
    expect(explore!.textContent).toBe("Explore relationsSelect a pull request first");
    expect(explore!.getAttribute("aria-disabled")).toBe("true");
    expect(explore!.querySelector(".cdt-command__description")).toBeTruthy();
    // Without a second line the option keeps its earlier markup: a single label span.
    expect(plain!.querySelector(".cdt-command__text")).toBeNull();
    expect(filterCommands([{ id: "copy", label: "Copy ID", description: "atlas/search#70" }], "atlas")).toEqual([]);
  });
});

function PaletteFixture() {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)}>Open palette</button><CommandPalette open={open} onOpenChange={setOpen} commands={commands} onSelect={() => undefined} /></>;
}

test("FR-CMP-014 CommandPalette returns focus to whatever opened it, with no Dialog.Trigger", async () => {
  render(<PaletteFixture />);
  const opener = screen.getByRole("button", { name: "Open palette" });
  opener.focus();
  fireEvent.click(opener);
  await waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("combobox"));
  fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(opener));
});

describe("FR-CMP-014 DatePicker", () => {
  test("takes its id and description from Field, opens a calendar and reports the picked day", () => {
    const change = vi.fn();
    render(<Field label="Release date" description="Weekdays only."><DatePicker value={new Date(2026, 0, 15)} onValueChange={change} formatDate={(date) => date.toISOString().slice(0, 10)} /></Field>);
    const trigger = screen.getByRole("button", { name: "Release date" });
    expect(trigger.textContent).toBe("2026-01-15");
    expect(trigger.getAttribute("aria-describedby")).toBeTruthy();
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Choose a date" })).toBeTruthy();
    expect(screen.getByRole("grid")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /January 20th, 2026/ }));
    expect(change).toHaveBeenCalledOnce();
    const picked = change.mock.calls[0]?.[0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2026, 0, 20]);
  });

  test("shows the placeholder when empty and refuses disabled days", () => {
    const change = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(<DatePicker ref={ref} aria-label="Due" value={undefined} onValueChange={change} disabledDays={{ dayOfWeek: [0, 6] }} labels={{ placeholder: "날짜 선택" }} />);
    expect(ref.current?.textContent).toBe("날짜 선택");
    expect(ref.current?.classList.contains("cdt-date-picker--empty")).toBe(true);
  });
});

describe("FR-CMP-014 Toast", () => {
  test("renders title, description, tone and an accessible close button", () => {
    vi.useFakeTimers();
    const openChange = vi.fn();
    render(<Toast.Provider><Toast.Root open onOpenChange={openChange} tone="success" icon="✓"><Toast.Title>Saved</Toast.Title><Toast.Description>Settings are live.</Toast.Description><Toast.Close /></Toast.Root><Toast.Viewport /></Toast.Provider>);
    const toast = screen.getByText("Saved").closest(".cdt-toast");
    expect(toast?.classList.contains("cdt-toast--success")).toBe(true);
    expect(toast?.querySelector(".cdt-toast__icon")?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(openChange).toHaveBeenCalledWith(false);
    act(() => { vi.runOnlyPendingTimers(); });
    vi.useRealTimers();
  });
});
