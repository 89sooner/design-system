import { createRef, useState } from "react";
import { cleanup, fireEvent, render, waitFor, act } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { Tabs, Popover, Collapsible } from "../interaction";

afterEach(cleanup);
function TabFixture({ automatic = false, changed = () => {} }: { automatic?: boolean; changed?: (value: string) => void }) {
  const [value, setValue] = useState("a");
  return <Tabs.Root value={value} onValueChange={(next) => { setValue(next); changed(next); }} {...(automatic ? { activationMode: "automatic" } : {})}>
    <Tabs.List aria-label="Investigation"><Tabs.Trigger value="a">Summary</Tabs.Trigger><Tabs.Trigger value="disabled" disabled>Unavailable</Tabs.Trigger><Tabs.Trigger value="b">Evidence</Tabs.Trigger></Tabs.List>
    <Tabs.Content value="a"><input aria-label="Retained notes" defaultValue="original" /></Tabs.Content><Tabs.Content value="b" forceMount><input aria-label="Evidence notes" /></Tabs.Content>
  </Tabs.Root>;
}
test("FR-CMP-013: manual controlled tabs move focus past disabled without activation; Enter selects", async () => {
  const changed = vi.fn();
  const view = render(<TabFixture changed={changed} />);
  const summary = view.getByRole("tab", { name: "Summary" });
  const evidence = view.getByRole("tab", { name: "Evidence" });
  act(() => summary.focus());
  fireEvent.keyDown(summary, { key: "ArrowRight" });
  await waitFor(() => expect(document.activeElement).toBe(evidence));
  expect(changed).not.toHaveBeenCalled();
  expect(summary.getAttribute("aria-selected")).toBe("true");
  fireEvent.keyDown(evidence, { key: "Enter" });
  expect(changed).toHaveBeenCalledWith("b");
  expect(view.queryByLabelText("Retained notes")).toBeNull();
});
test("FR-CMP-013: retained panel state survives selection and inactive panels stay hidden", () => {
  const view = render(<TabFixture />);
  const notes = view.getByLabelText("Evidence notes");
  expect(notes.closest("[role=tabpanel]")?.hasAttribute("hidden")).toBe(true);
  fireEvent.keyDown(view.getByRole("tab", { name: "Evidence" }), { key: "Enter" });
  fireEvent.change(notes, { target: { value: "kept" } });
  fireEvent.keyDown(view.getByRole("tab", { name: "Summary" }), { key: "Enter" });
  expect((view.getByLabelText("Evidence notes") as HTMLInputElement).value).toBe("kept");
  expect(notes.closest("[role=tabpanel]")?.hasAttribute("hidden")).toBe(true);
});
test("FR-CMP-013: automatic activation is opt-in; repeated values get unique linked IDs", () => {
  const changed = vi.fn();
  const view = render(<><TabFixture automatic changed={changed} /><TabFixture /></>);
  act(() => view.getAllByRole("tab", { name: "Evidence" })[0]?.focus());
  expect(changed).toHaveBeenCalledWith("b");
  const elements = Array.from(view.container.querySelectorAll("[id]"));
  expect(new Set(elements.map((element) => element.id)).size).toBe(elements.length);
  for (const trigger of view.getAllByRole("tab")) {
    if (trigger.getAttribute("aria-selected") === "true") expect(document.getElementById(trigger.getAttribute("aria-controls") ?? "")).not.toBeNull();
  }
});
test("FR-CMP-013: tabs refs and native events reach the Radix element", () => {
  const ref = createRef<HTMLButtonElement>();
  const click = vi.fn();
  const view = render(<Tabs.Root><Tabs.List aria-label="Tabs"><Tabs.Trigger ref={ref} value="a" className="consumer" onClick={click} aria-busy>First</Tabs.Trigger></Tabs.List></Tabs.Root>);
  const trigger = view.getByRole("tab");
  fireEvent.click(trigger);
  expect(ref.current).toBe(trigger);
  expect(trigger.classList.contains("consumer")).toBe(true);
  expect(trigger.getAttribute("aria-busy")).toBe("true");
  expect(click).toHaveBeenCalledOnce();
});
test("FR-CMP-013: Popover Escape restores focus and forwards ref, name, custom portal container", async () => {
  const ref = createRef<HTMLDivElement>();
  const portal = document.createElement("div"); document.body.append(portal);
  const view = render(<Popover.Root><Popover.Trigger>Options</Popover.Trigger><Popover.Content container={portal} ref={ref} aria-label="View options"><button>Columns</button></Popover.Content></Popover.Root>);
  const trigger = view.getByRole("button", { name: "Options" });
  trigger.focus(); fireEvent.click(trigger);
  const content = view.getByRole("dialog", { name: "View options" });
  expect(ref.current).toBe(content); expect(portal.contains(content)).toBe(true);
  fireEvent.keyDown(content, { key: "Escape" });
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  portal.remove();
});
test("FR-CMP-013: collapsed children stay unmounted; controlled disclosure and disabled work", () => {
  const changed = vi.fn();
  const view = render(<Collapsible.Root open={false} onOpenChange={changed}><Collapsible.Trigger>Relations</Collapsible.Trigger><Collapsible.Content>Evidence data</Collapsible.Content></Collapsible.Root>);
  expect(view.queryByText("Evidence data")).toBeNull();
  fireEvent.click(view.getByRole("button")); expect(changed).toHaveBeenCalledWith(true);
  expect(view.queryByText("Evidence data")).toBeNull();
  view.rerender(<Collapsible.Root open disabled onOpenChange={changed}><Collapsible.Trigger>Relations</Collapsible.Trigger><Collapsible.Content>Evidence data</Collapsible.Content></Collapsible.Root>);
  expect(view.getByText("Evidence data")).not.toBeNull();
  changed.mockClear(); fireEvent.click(view.getByRole("button")); expect(changed).not.toHaveBeenCalled();
});
