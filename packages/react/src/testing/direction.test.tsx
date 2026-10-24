// Refs: CR-074 FR-CSS-006 AC-2 AC-3
//
// Radix writes `dir="ltr"` on its roots when no direction reaches it, so a right-to-left page got
// left-to-right tabs, radios and toggles with arrow keys that ran backwards. DirectionProvider hands
// the document's direction to every Radix-based component and to the DatePicker calendar.
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { DatePicker } from "../date-picker";
import { DirectionProvider } from "../direction";
import { Tabs } from "../interaction";
import { RadioGroup, ToggleGroup } from "../selection";

afterEach(cleanup);

const tabs = (
  <Tabs.Root defaultValue="one">
    <Tabs.List aria-label="Views">
      <Tabs.Trigger value="one">One</Tabs.Trigger>
      <Tabs.Trigger value="two">Two</Tabs.Trigger>
      <Tabs.Trigger value="three">Three</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="one">First</Tabs.Content>
    <Tabs.Content value="two">Second</Tabs.Content>
    <Tabs.Content value="three">Third</Tabs.Content>
  </Tabs.Root>
);

const groups = (
  <>
    <RadioGroup.Root aria-label="Mode" defaultValue="a">
      <RadioGroup.Item value="a">A</RadioGroup.Item>
      <RadioGroup.Item value="b">B</RadioGroup.Item>
    </RadioGroup.Root>
    <ToggleGroup.Root type="single" aria-label="Layout" defaultValue="list">
      <ToggleGroup.Item value="list">List</ToggleGroup.Item>
      <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
    </ToggleGroup.Root>
  </>
);

describe("CR-074 FR-CSS-006 DirectionProvider", () => {
  test("FR-CSS-006 AC-2: without a provider the Radix roots stay left to right", () => {
    render(<>{tabs}{groups}</>);
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe("horizontal");
    expect(screen.getByRole("tablist").closest("[dir]")?.getAttribute("dir")).toBe("ltr");
    expect(screen.getByLabelText("Mode").getAttribute("dir")).toBe("ltr");
    expect(screen.getByLabelText("Layout").getAttribute("dir")).toBe("ltr");
  });

  test("FR-CSS-006 AC-2: under dir=\"rtl\" every Radix root reads right to left", () => {
    render(<DirectionProvider dir="rtl">{tabs}{groups}</DirectionProvider>);
    expect(screen.getByRole("tablist").closest("[dir]")?.getAttribute("dir")).toBe("rtl");
    expect(screen.getByLabelText("Mode").getAttribute("dir")).toBe("rtl");
    expect(screen.getByLabelText("Layout").getAttribute("dir")).toBe("rtl");
  });

  // Three tabs, because focus loops: with two, ArrowLeft from the first lands on the second in either direction.
  test("FR-CSS-006 AC-3: in rtl, ArrowLeft moves to the next tab and ArrowRight back", async () => {
    render(<DirectionProvider dir="rtl">{tabs}</DirectionProvider>);
    const [first, second] = screen.getAllByRole("tab");
    first?.focus();
    fireEvent.keyDown(first!, { key: "ArrowLeft" });
    await waitFor(() => expect(document.activeElement).toBe(second));
    fireEvent.keyDown(second!, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(first));
  });

  test("FR-CSS-006 AC-2: the DatePicker calendar follows the provider", () => {
    render(<DirectionProvider dir="rtl"><DatePicker aria-label="Release date" value={new Date(2026, 0, 15)} onValueChange={() => {}} /></DirectionProvider>);
    fireEvent.click(screen.getByRole("button", { name: /Release date/ }));
    expect(screen.getByRole("grid").closest("[dir]")?.getAttribute("dir")).toBe("rtl");
  });
});
