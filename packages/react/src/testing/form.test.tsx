import { createRef } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Checkbox, Field, Select, Switch, TextArea, TextField } from "../form";
import { runContractSuite } from "./contract";

runContractSuite("Field", Field, { label: "Field", children: <TextField /> }, "cdt-field");
runContractSuite("TextField", TextField, {}, "cdt-input");
runContractSuite("TextArea", TextArea, {}, "cdt-textarea");
runContractSuite("Switch", Switch, {}, "cdt-switch");
runContractSuite("Checkbox", Checkbox, {}, "cdt-checkbox");

afterEach(cleanup);

describe("form components", () => {
  test("FR-CMP-007 AC-1 / AC-2: Field connects label, description and error to its control", () => {
    const { getByLabelText, getByText } = render(
      <Field label="Project name" description="Shown to teammates" error="Name is required"><TextField /></Field>,
    );
    const input = getByLabelText("Project name");
    const describedBy = input.getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(describedBy).toContain(getByText("Shown to teammates").id);
    expect(describedBy).toContain(getByText("Name is required").id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  test("FR-CMP-007 AC-1: Field preserves a consumer aria-describedby alongside its own messages", () => {
    const { getByLabelText } = render(<><span id="hint">External hint</span><Field label="Name" description="Description"><TextField aria-describedby="hint" /></Field></>);
    expect(getByLabelText("Name").getAttribute("aria-describedby")).toContain("hint");
  });

  test("FR-CMP-007 AC-3: standalone TextField and TextArea warn when unnamed", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<><TextField /><TextArea /></>);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  test("FR-CMP-007 AC-4: Switch and Checkbox keep Radix roles and toggle with Space", () => {
    const { getByRole } = render(<><Switch aria-label="Notifications" /><Checkbox aria-label="Terms" /></>);
    const toggle = getByRole("switch", { name: "Notifications" });
    const checkbox = getByRole("checkbox", { name: "Terms" });
    fireEvent.click(toggle);
    fireEvent.click(checkbox);
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });

  test("FR-A11Y-005 AC-3 / FR-CMP-007: Checkbox hides its decorative indicator", () => {
    const { getByRole } = render(<Checkbox defaultChecked aria-label="Terms" indicator={<svg />} />);
    expect(getByRole("checkbox").querySelector(".cdt-checkbox__indicator")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("FR-A11Y-003: a required Field announces every control through aria-required, never a DOM `required` on a button", () => {
    const { getByRole } = render(
      <>
        <Field label="Notify" required><Switch aria-label="Notify" /></Field>
        <Field label="Terms" required><Checkbox aria-label="Terms" /></Field>
        <Field label="Region" required><Select.Root><Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger></Select.Root></Field>
        <Field label="Name" required><TextField aria-label="Name" /></Field>
      </>,
    );
    for (const role of ["switch", "checkbox", "combobox"] as const) {
      const control = getByRole(role);
      expect(control.tagName).toBe("BUTTON");
      expect(control.getAttribute("aria-required")).toBe("true");
      // `required` is not a valid attribute on <button>; Radix maps the prop to ARIA for us.
      expect(control.hasAttribute("required")).toBe(false);
    }
    // The native control keeps the native attribute, which is what constraint validation reads.
    expect((getByRole("textbox") as HTMLInputElement).required).toBe(true);
  });

  test("FR-CMP-007: Field does not force `required` onto whatever element it wraps", () => {
    // Cloning the child injected the prop into arbitrary elements. Controls read the context.
    const { getByTestId, getByRole } = render(
      <Field label="Name" required><div data-testid="wrapper"><TextField aria-label="Name" /></div></Field>,
    );
    expect(getByTestId("wrapper").hasAttribute("required")).toBe(false);
    expect((getByRole("textbox") as HTMLInputElement).required).toBe(true);
  });

  test("C-053: Select.Item renders a check glyph a consumer can replace", () => {
    // Radix scrolls the selected item into view when the list opens; jsdom implements no layout.
    Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: () => undefined });
    const { getByRole, rerender } = render(
      <Select.Root defaultValue="kr" open><Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="kr">Korea</Select.Item></Select.Content></Select.Root>,
    );
    expect(getByRole("option", { name: "Korea" }).querySelector(".cdt-select__indicator")?.textContent).toBe("✓");
    rerender(
      <Select.Root defaultValue="kr" open><Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="kr" indicator="●">Korea</Select.Item></Select.Content></Select.Root>,
    );
    expect(getByRole("option", { name: "Korea" }).querySelector(".cdt-select__indicator")?.textContent).toBe("●");
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  });

  test("FR-CMP-007: Select keeps the Radix combobox role and accepts Field context", () => {
    const { getByLabelText } = render(
      <Field label="Region"><Select.Root defaultValue="kr"><Select.Trigger><Select.Value placeholder="Choose a region" /></Select.Trigger><Select.Content><Select.Item value="kr">Korea</Select.Item></Select.Content></Select.Root></Field>,
    );
    const trigger = getByLabelText("Region");
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.textContent).toContain("Korea");
  });

  test("FR-CMP-001 AC-1~AC-4: Select.Trigger forwards its root contract through Select.Root", () => {
    const ref = createRef<HTMLButtonElement>();
    const { getByRole } = render(
      <Select.Root><Select.Trigger ref={ref} className="consumer-class" data-testid="contract-root" aria-label="Contract root" title="Native title"><Select.Value /></Select.Trigger></Select.Root>,
    );
    const trigger = getByRole("combobox", { name: "Contract root" });
    expect(ref.current).toBe(trigger);
    expect(trigger.classList.contains("cdt-select__trigger")).toBe(true);
    expect(trigger.classList.contains("consumer-class")).toBe(true);
    expect(trigger.getAttribute("data-testid")).toBe("contract-root");
    expect(trigger.getAttribute("title")).toBe("Native title");
  });

  test("FR-CMP-004: Field's required reaches Select.Root, not only the trigger (PR #8 review P1)", () => {
    // Radix configures the hidden form control from the **root**. `aria-required` on the trigger
    // announces the state but leaves the owning form free to submit with no selection — the
    // documented composition looked like it set a constraint it did not set.
    const { container } = render(
      <form>
        <Field label="Region" required>
          <Select.Root name="region">
            <Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger>
          </Select.Root>
        </Field>
      </form>,
    );

    const hidden = container.querySelector("select[name='region']");
    expect(hidden, "Radix renders no hidden control").not.toBeNull();
    expect(hidden?.hasAttribute("required")).toBe(true);
  });

  test("FR-CMP-004: an explicit required on Select.Root wins over the field default", () => {
    // The context is a default, not an override — the shape every other control already uses.
    const { container } = render(
      <form>
        <Field label="Region" required>
          <Select.Root name="region" required={false}>
            <Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger>
          </Select.Root>
        </Field>
      </form>,
    );
    expect(container.querySelector("select[name='region']")?.hasAttribute("required")).toBe(false);
  });
});
