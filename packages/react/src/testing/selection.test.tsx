// FR-CMP-015 · CR-060: AlertDialog, RadioGroup, ToggleGroup, Avatar, NumberInput.
import { useState, type ComponentProps } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AlertDialog } from "../alert-dialog";
import { Avatar, avatarInitials } from "../avatar";
import { Field } from "../form";
import { NumberInput } from "../number-input";
import { RadioGroup, ToggleGroup } from "../selection";
import { runContractSuite } from "./contract";

afterEach(cleanup);
runContractSuite<HTMLSpanElement, ComponentProps<typeof Avatar>>("Avatar", Avatar, { name: "Ada Lovelace" }, "cdt-avatar");
runContractSuite<HTMLDivElement, ComponentProps<typeof RadioGroup.Root>>("RadioGroup.Root", RadioGroup.Root, {}, "cdt-radio-group");
runContractSuite<HTMLDivElement, ComponentProps<typeof ToggleGroup.Root>>("ToggleGroup.Root", ToggleGroup.Root, { type: "single" }, "cdt-toggle-group");

describe("FR-CMP-015 AlertDialog", () => {
  function Confirm({ onConfirm }: { readonly onConfirm: () => void }) {
    return <AlertDialog.Root><AlertDialog.Trigger>Delete workspace</AlertDialog.Trigger><AlertDialog.Content><AlertDialog.Title>Delete workspace?</AlertDialog.Title><AlertDialog.Description>This cannot be undone.</AlertDialog.Description><AlertDialog.Footer><AlertDialog.Cancel>Cancel</AlertDialog.Cancel><AlertDialog.Action onClick={onConfirm}>Delete</AlertDialog.Action></AlertDialog.Footer></AlertDialog.Content></AlertDialog.Root>;
  }

  test("AC-1: opens as an alertdialog named and described by its parts, with Cancel focused first", async () => {
    render(<Confirm onConfirm={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete workspace" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Delete workspace?" });
    expect(dialog.getAttribute("aria-describedby")).toBe(screen.getByText("This cannot be undone.").id);
    expect(dialog.classList.contains("cdt-dialog")).toBe(true);
    expect(dialog.classList.contains("cdt-alert-dialog")).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" })));
  });

  test("AC-1: Action is a danger primary by default, accent on request; both close the dialog", async () => {
    const confirm = vi.fn();
    render(<Confirm onConfirm={confirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete workspace" }));
    const action = await screen.findByRole("button", { name: "Delete" });
    expect(action.className).toContain("cdt-btn--primary");
    expect(action.className).toContain("cdt-btn--tone-danger");
    fireEvent.click(action);
    expect(confirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    cleanup();
    render(<AlertDialog.Root defaultOpen><AlertDialog.Content aria-describedby={undefined}><AlertDialog.Title>Publish?</AlertDialog.Title><AlertDialog.Action tone="accent">Publish</AlertDialog.Action></AlertDialog.Content></AlertDialog.Root>);
    expect(screen.getByRole("button", { name: "Publish" }).className).toContain("cdt-btn--tone-accent");
  });
});

describe("FR-CMP-015 RadioGroup", () => {
  test("AC-2: inside Field the group is named by the label and carries description, error and required", () => {
    render(<Field label="Retention" description="Applies to new runs." error="Pick one." required><RadioGroup.Root><RadioGroup.Item value="30">30 days</RadioGroup.Item><RadioGroup.Item value="90" description="Recommended">90 days</RadioGroup.Item></RadioGroup.Root></Field>);
    const group = screen.getByRole("radiogroup", { name: "Retention" });
    expect(group.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.getAttribute("aria-required")).toBe("true");
    expect(group.classList.contains("cdt-radio-group--invalid")).toBe(true);
    expect(screen.getByRole("radio", { name: /90 days/ })).toBeTruthy();
    expect(screen.getByText("Recommended")).toBeTruthy();
  });

  test("AC-2: clicking the option text checks the radio and reports the value", () => {
    const change = vi.fn();
    render(<RadioGroup.Root aria-label="Region" onValueChange={change}><RadioGroup.Item value="eu">Europe</RadioGroup.Item><RadioGroup.Item value="us">United States</RadioGroup.Item></RadioGroup.Root>);
    fireEvent.click(screen.getByText("United States"));
    expect(change).toHaveBeenCalledWith("us");
    expect(screen.getByRole("radio", { name: "United States" }).getAttribute("aria-checked")).toBe("true");
  });

  test("AC-2: a group with no Field and no accessible name warns in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<RadioGroup.Root><RadioGroup.Item value="a">A</RadioGroup.Item></RadioGroup.Root>);
    expect(warn).toHaveBeenCalledWith("[conductor] RadioGroup requires Field, aria-label, or aria-labelledby.");
    warn.mockRestore();
  });
});

describe("FR-CMP-015 ToggleGroup", () => {
  test("AC-3: single keeps one item pressed and reports the value; multiple keeps several", () => {
    function Views() {
      const [view, setView] = useState("list");
      return <><ToggleGroup.Root type="single" aria-label="View" value={view} onValueChange={(next) => { if (next !== "") setView(next); }}><ToggleGroup.Item value="list">List</ToggleGroup.Item><ToggleGroup.Item value="board" icon="▦">Board</ToggleGroup.Item></ToggleGroup.Root><output>{view}</output></>;
    }
    render(<Views />);
    fireEvent.click(screen.getByRole("radio", { name: "Board" }));
    expect(screen.getByText("board", { selector: "output" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Board" }).getAttribute("data-state")).toBe("on");
    expect(screen.getByRole("radio", { name: "List" }).getAttribute("data-state")).toBe("off");
    cleanup();
    render(<ToggleGroup.Root type="multiple" aria-label="Format" defaultValue={["bold"]}><ToggleGroup.Item value="bold">Bold</ToggleGroup.Item><ToggleGroup.Item value="italic">Italic</ToggleGroup.Item></ToggleGroup.Root>);
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Italic" }).getAttribute("aria-pressed")).toBe("true");
  });
});

describe("FR-CMP-015 Avatar", () => {
  test("AC-4: avatarInitials takes the first and last words, or the first two letters of one word", () => {
    expect(avatarInitials("Ada Lovelace")).toBe("AL");
    expect(avatarInitials("  grace   brewster murray hopper ")).toBe("GH");
    expect(avatarInitials("ops")).toBe("OP");
    expect(avatarInitials("김민수")).toBe("김민");
    expect(avatarInitials("")).toBe("");
  });

  test("AC-4: the name is the accessible name; the initials are hidden; decorative hides the avatar", () => {
    render(<><Avatar name="Ada Lovelace" /><Avatar name="Grace Hopper" decorative /></>);
    const avatar = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(avatar.textContent).toBe("AL");
    expect(avatar.querySelector(".cdt-avatar__fallback")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img", { name: "Grace Hopper" })).toBeNull();
    expect(screen.getByText("GH").closest(".cdt-avatar")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("FR-CMP-015 NumberInput", () => {
  test("AC-5: a native spinbutton that takes Field's label, description and invalid state", () => {
    render(<Field label="Max steps" description="Between 1 and 50." error="Too many."><NumberInput min={1} max={50} defaultValue={10} suffix="steps" /></Field>);
    const input = screen.getByRole("spinbutton", { name: "Max steps" });
    expect(input.getAttribute("type")).toBe("number");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    expect(input.closest(".cdt-number-input")?.classList.contains("cdt-number-input--invalid")).toBe(true);
  });

  test("AC-5: the steppers step by `step`, stop at the bounds, fire onChange and stay out of the tab order", () => {
    const change = vi.fn();
    render(<NumberInput aria-label="Retries" min={0} max={3} step={1} defaultValue={2} onChange={(event) => change(event.currentTarget.value)} labels={{ increment: "More retries" }} />);
    const input = screen.getByRole("spinbutton", { name: "Retries" }) as HTMLInputElement;
    const more = screen.getByRole("button", { name: "More retries" });
    const less = screen.getByRole("button", { name: "Decrease" });
    expect(more.tabIndex).toBe(-1);
    expect(more.getAttribute("aria-controls")).toBe(input.id === "" ? null : input.id);
    fireEvent.click(more);
    fireEvent.click(more);
    expect(input.value).toBe("3");
    fireEvent.click(less);
    // At the maximum the second click changes nothing, so React fires no change event.
    expect(change.mock.calls).toEqual([["3"], ["2"]]);
  });

  test("AC-5: an empty field steps from its minimum; disabled locks the steppers", () => {
    const { rerender } = render(<NumberInput aria-label="Budget" min={5} />);
    const input = screen.getByRole("spinbutton", { name: "Budget" }) as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(input.value).toBe("5");
    rerender(<NumberInput aria-label="Budget" min={5} disabled />);
    expect((screen.getByRole("button", { name: "Increase" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
