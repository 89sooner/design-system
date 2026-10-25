// FR-CMP-018 · CR-078: ContextMenu, Slider, Tree.
import { createRef, type ComponentProps } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { ContextMenu } from "../context-menu";
import { Slider } from "../slider";
import { Tree, type TreeNode } from "../tree";
import { runContractSuite } from "./contract";

afterEach(cleanup);
// Radix Slider measures its thumbs; jsdom has no ResizeObserver (as in overlay.test.tsx).
beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
});
runContractSuite<HTMLDivElement, ComponentProps<typeof Tree>>("Tree", Tree, { items: [] }, "cdt-tree");

/** Headless Tree reads the keys held down, so a key needs its keyup too. */
function press(element: Element, key: string, code = key): void {
  fireEvent.keyDown(element, { key, code });
  fireEvent.keyUp(element, { key, code });
}

describe("FR-CMP-018 AC-1 ContextMenu", () => {
  function Area({ onCopy = () => undefined }: { readonly onCopy?: () => void }) {
    return (
      <ContextMenu.Root>
        <ContextMenu.Trigger data-testid="area" className="consumer-class">run_8f2c</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Label>Run</ContextMenu.Label>
          <ContextMenu.Item shortcut="⌘C" onSelect={onCopy}>Copy ID</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item tone="danger">Cancel run</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    );
  }

  test("the context-menu event opens a menu of items on the shared menu surface; Escape closes it", async () => {
    const onCopy = vi.fn();
    render(<Area onCopy={onCopy} />);
    const area = screen.getByTestId("area");
    expect(area.className).toBe("cdt-context-menu__trigger consumer-class");
    fireEvent.contextMenu(area, { clientX: 20, clientY: 20 });
    const menu = await screen.findByRole("menu");
    expect(menu.classList.contains("cdt-menu")).toBe(true);
    expect(menu.classList.contains("cdt-context-menu")).toBe(true);
    const copy = screen.getByRole("menuitem", { name: /Copy ID/ });
    expect(copy.querySelector(".cdt-context-menu__shortcut")?.textContent).toBe("⌘C");
    expect(screen.getByRole("menuitem", { name: "Cancel run" }).classList.contains("cdt-menu__item--danger")).toBe(true);
    fireEvent.click(copy);
    expect(onCopy).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    fireEvent.contextMenu(area, { clientX: 20, clientY: 20 });
    await screen.findByRole("menu");
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});

describe("FR-CMP-018 AC-2 Slider", () => {
  test("the thumb is the named slider; the root keeps ref, class and native props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Slider ref={ref} aria-label="Volume" defaultValue={[50]} className="consumer-class" data-testid="slider" title="Native title" />);
    const root = screen.getByTestId("slider");
    expect(ref.current).toBe(root);
    expect(root.className).toBe("cdt-slider consumer-class");
    expect(root.getAttribute("title")).toBe("Native title");
    expect(root.hasAttribute("aria-label")).toBe(false);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb.getAttribute("aria-valuenow")).toBe("50");
    expect(thumb.getAttribute("aria-valuemin")).toBe("0");
    expect(thumb.getAttribute("aria-valuemax")).toBe("100");
  });

  test("arrow keys move the value (Radix) and valueText follows an uncontrolled slider", () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Budget" defaultValue={[10]} step={5} valueText={(value) => `$${value}`} onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Budget" });
    expect(thumb.getAttribute("aria-valuetext")).toBe("$10");
    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith([15]);
    expect(thumb.getAttribute("aria-valuenow")).toBe("15");
    expect(thumb.getAttribute("aria-valuetext")).toBe("$15");
  });

  test("a range names each thumb; labels and aria-labelledby both work", () => {
    render(<><Slider aria-label="Price" defaultValue={[20, 80]} /><span id="period">Period</span><Slider aria-labelledby="period" defaultValue={[1, 3]} max={12} labels={{ start: "From", end: "To" }} /></>);
    expect(screen.getByRole("slider", { name: "Price, Minimum" }).getAttribute("aria-valuenow")).toBe("20");
    expect(screen.getByRole("slider", { name: "Price, Maximum" }).getAttribute("aria-valuenow")).toBe("80");
    expect(screen.getByRole("slider", { name: "Period From" }).getAttribute("aria-valuenow")).toBe("1");
    expect(screen.getByRole("slider", { name: "Period To" }).getAttribute("aria-valuenow")).toBe("3");
  });

  test("disabled reaches Radix", () => {
    render(<Slider aria-label="Volume" defaultValue={[30]} disabled data-testid="slider" />);
    expect(screen.getByTestId("slider").hasAttribute("data-disabled")).toBe(true);
    expect(screen.getByRole("slider").hasAttribute("data-disabled")).toBe(true);
  });
});

const ITEMS: readonly TreeNode[] = [
  { id: "src", label: "src", children: [{ id: "src/index.ts", label: "index.ts" }, { id: "src/tree.tsx", label: "tree.tsx" }] },
  { id: "README.md", label: "README.md" },
];

describe("FR-CMP-018 AC-3 Tree", () => {
  test("rows are treeitems with level, position and expansion; only the first row is a tab stop", () => {
    render(<Tree aria-label="Files" items={ITEMS} defaultExpandedIds={["src"]} />);
    expect(screen.getByRole("tree", { name: "Files" }).classList.contains("cdt-tree")).toBe(true);
    const rows = screen.getAllByRole("treeitem");
    expect(rows.map((row) => [row.textContent, row.getAttribute("aria-level"), row.getAttribute("aria-posinset"), row.getAttribute("aria-setsize")])).toEqual([
      ["▸src", "1", "1", "2"],
      ["index.ts", "2", "1", "2"],
      ["tree.tsx", "2", "2", "2"],
      ["README.md", "1", "2", "2"],
    ]);
    expect(rows[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(rows[0]!.getAttribute("data-state")).toBe("open");
    expect(rows[3]!.hasAttribute("aria-expanded")).toBe(false);
    expect(rows.map((row) => row.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1"]);
    expect(rows[0]!.querySelector(".cdt-tree__chevron")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("ArrowRight opens a branch, ArrowDown moves focus, Enter selects (Headless Tree, ADR-004)", async () => {
    const onSelectedIdChange = vi.fn();
    render(<Tree aria-label="Files" items={ITEMS} onSelectedIdChange={onSelectedIdChange} />);
    const [src] = screen.getAllByRole("treeitem");
    act(() => src!.focus());
    press(src!, "ArrowRight");
    await waitFor(() => expect(screen.getAllByRole("treeitem")).toHaveLength(4));
    press(src!, "ArrowDown");
    await waitFor(() => expect(document.activeElement?.textContent).toBe("index.ts"));
    press(document.activeElement!, "Enter");
    await waitFor(() => expect(onSelectedIdChange).toHaveBeenCalledWith("src/index.ts"));
    expect(screen.getByRole("treeitem", { name: "index.ts" }).getAttribute("aria-selected")).toBe("true");
    press(document.activeElement!, "ArrowLeft");
    press(document.activeElement!, "ArrowLeft");
    await waitFor(() => expect(screen.getAllByRole("treeitem")).toHaveLength(2));
  });

  test("Space and click select too; a controlled tree follows selectedId", async () => {
    const onSelectedIdChange = vi.fn();
    const { rerender } = render(<Tree aria-label="Files" items={ITEMS} selectedId="README.md" onSelectedIdChange={onSelectedIdChange} />);
    expect(screen.getByRole("treeitem", { name: "README.md" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("treeitem", { name: "src" }));
    expect(onSelectedIdChange).toHaveBeenLastCalledWith("src");
    // Controlled: the selection stays until the owner changes it.
    expect(screen.getByRole("treeitem", { name: "README.md" }).getAttribute("aria-selected")).toBe("true");
    rerender(<Tree aria-label="Files" items={ITEMS} selectedId="src" onSelectedIdChange={onSelectedIdChange} />);
    expect(screen.getByRole("treeitem", { name: "src" }).getAttribute("aria-selected")).toBe("true");
    // The click also opened the branch, so End is the way to the last row.
    const readme = screen.getByRole("treeitem", { name: "README.md" });
    press(screen.getByRole("treeitem", { name: "src" }), "End");
    await waitFor(() => expect(document.activeElement).toBe(readme));
    press(readme, " ", "Space");
    await waitFor(() => expect(onSelectedIdChange).toHaveBeenLastCalledWith("README.md"));
  });
});
