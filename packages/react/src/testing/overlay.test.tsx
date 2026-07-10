import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { Dialog, Drawer, DropdownMenu, Tooltip } from "../overlay";

afterEach(cleanup);

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

describe("overlay components", () => {
  test("FR-CMP-006 AC-1 / FR-A11Y-002 AC-3: Dialog traps focus, closes on Escape and restores the trigger", async () => {
    const { getByRole } = render(
      <Dialog.Root><Dialog.Trigger>Open dialog</Dialog.Trigger><Dialog.Content><Dialog.Title>Dialog title</Dialog.Title><Dialog.Close>Close</Dialog.Close></Dialog.Content></Dialog.Root>,
    );
    const trigger = getByRole("button", { name: "Open dialog" });
    fireEvent.click(trigger);
    expect(getByRole("dialog")).not.toBeNull();
    fireEvent.keyDown(getByRole("dialog"), { key: "Escape" });
    expect(document.querySelector("[role=dialog]")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  test("FR-CMP-006 AC-1 / AC-2: Drawer uses the Dialog Radix path and exposes its side class", () => {
    const { getByRole } = render(
      <Drawer.Root><Drawer.Trigger>Open drawer</Drawer.Trigger><Drawer.Content side="left"><Drawer.Title>Drawer title</Drawer.Title></Drawer.Content></Drawer.Root>,
    );
    fireEvent.click(getByRole("button", { name: "Open drawer" }));
    const dialog = getByRole("dialog");
    expect(dialog.classList.contains("cdt-drawer--left")).toBe(true);
    expect(document.querySelector(".cdt-overlay")).not.toBeNull();
  });

  test("FR-CMP-006 AC-3: Tooltip opens from keyboard focus and closes on Escape", async () => {
    const { getByRole } = render(
      <Tooltip.Provider delayDuration={0}><Tooltip.Root><Tooltip.Trigger>Info</Tooltip.Trigger><Tooltip.Content>Helpful text</Tooltip.Content></Tooltip.Root></Tooltip.Provider>,
    );
    const trigger = getByRole("button", { name: "Info" });
    fireEvent.focus(trigger);
    const tooltip = await waitFor(() => getByRole("tooltip"));
    expect(tooltip.textContent).toContain("Helpful text");
    fireEvent.keyDown(tooltip, { key: "Escape" });
    expect(document.querySelector("[role=tooltip]")).toBeNull();
    fireEvent.pointerMove(trigger, { pointerType: "mouse" });
    expect((await waitFor(() => getByRole("tooltip"))).textContent).toContain("Helpful text");
  });

  test("FR-A11Y-005 AC-4: DropdownMenu keeps Radix menu roles and hides decorative icons", async () => {
    const { getByRole } = render(
      <DropdownMenu.Root defaultOpen><DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger><DropdownMenu.Content><DropdownMenu.Item icon="●">Item</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Root>,
    );
    const item = await waitFor(() => getByRole("menuitem", { name: "Item" }));
    expect(getByRole("menu")).not.toBeNull();
    expect(item.querySelector(".cdt-menu__item-icon")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("FR-CMP-006 AC-4: overlay content emits the tokenised public classes", () => {
    const { getByRole } = render(
      <Dialog.Root defaultOpen><Dialog.Content><Dialog.Title>Dialog title</Dialog.Title></Dialog.Content></Dialog.Root>,
    );
    expect(getByRole("dialog").classList.contains("cdt-dialog")).toBe(true);
    expect(document.querySelector(".cdt-overlay")?.classList.contains("cdt-overlay")).toBe(true);
  });
});
