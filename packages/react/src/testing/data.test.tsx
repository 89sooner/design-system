import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CodeBlock, Kbd, Table, Timeline, type CodeBlockProps, type KbdProps, type TableProps, type TimelineProps } from "../data";
import { runContractSuite } from "./contract";

runContractSuite<HTMLDivElement, TableProps>("Table", Table, { "aria-label": "Table", children: null }, "cdt-table__scroll");
runContractSuite<HTMLOListElement, TimelineProps>("Timeline", Timeline, { children: null }, "cdt-timeline");
runContractSuite<HTMLDivElement, CodeBlockProps>("CodeBlock", CodeBlock, { code: "{}" }, "cdt-code-block");
runContractSuite<HTMLElement, KbdProps>("Kbd", Kbd, { children: "Esc" }, "cdt-kbd");

afterEach(cleanup);

describe("data display components", () => {
  test("FR-CMP-005 AC-1: Table owns its horizontal scroll container", () => {
    const { container } = render(
      <Table caption="Jobs"><Table.Head><Table.Row><Table.HeaderCell>Job</Table.HeaderCell></Table.Row></Table.Head></Table>,
    );
    expect(container.firstElementChild?.classList.contains("cdt-table__scroll")).toBe(true);
    expect(container.querySelector("table")?.classList.contains("cdt-table")).toBe(true);
  });

  test("FR-CMP-005 AC-2: numeric Table.Cell adds cdt-num", () => {
    const { container } = render(
      <Table caption="Jobs"><Table.Body><Table.Row><Table.Cell numeric>42</Table.Cell></Table.Row></Table.Body></Table>,
    );
    expect(container.querySelector("td")?.classList.contains("cdt-num")).toBe(true);
  });

  test("FR-CMP-005 AC-3 / FR-A11Y-002 AC-4: Timeline steps switch between static and native buttons", () => {
    const onSelect = vi.fn();
    const { getByRole, getByText } = render(
      <Timeline aria-label="History"><Timeline.Step>Static</Timeline.Step><Timeline.Step onSelect={onSelect} selected>Interactive</Timeline.Step></Timeline>,
    );
    expect(getByText("Static").tagName).toBe("DIV");
    const button = getByRole("button", { name: "Interactive" });
    expect(button.getAttribute("aria-current")).toBe("step");
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  test("FR-CMP-005 AC-4: CodeBlock provides a focusable monospaced scroll region", () => {
    const { getByRole } = render(<CodeBlock aria-label="Payload" language="json" code={'{"ok":true}'} />);
    const block = getByRole("region", { name: "Payload" });
    expect(block.getAttribute("tabindex")).toBe("0");
    expect(block.getAttribute("data-language")).toBe("json");
    expect(block.querySelector("code")?.textContent).toBe('{"ok":true}');
  });

  test("FR-CMP-005 AC-5: unnamed Table warns in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Table>{null}</Table>);
    expect(warn).toHaveBeenCalledWith("[conductor] Table requires a caption or aria-label.");
    warn.mockRestore();
  });

  test("FR-A11Y-001 exception: interactive Timeline steps expose the focus-clipping class", () => {
    const { getByRole } = render(<Timeline><Timeline.Step onSelect={() => undefined}>Step</Timeline.Step></Timeline>);
    expect(getByRole("button").classList.contains("cdt-timeline__step--interactive")).toBe(true);
  });

  test("FR-CMP-005: Kbd renders the native keycap element", () => {
    const { getByText } = render(<Kbd>Esc</Kbd>);
    expect(getByText("Esc").tagName).toBe("KBD");
  });
});
