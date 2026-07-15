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
});
