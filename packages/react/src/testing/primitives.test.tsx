// FR-CMP-017 · CR-076: Separator, Stack, Grid, Heading, Text, Accordion.
import { type ComponentProps } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { Accordion } from "../accordion";
import { Grid, Separator, Stack } from "../layout";
import { Heading, Text } from "../typography";
import { runContractSuite } from "./contract";

afterEach(cleanup);
runContractSuite<HTMLHRElement, ComponentProps<typeof Separator>>("Separator", Separator, {}, "cdt-separator");
runContractSuite<HTMLElement, ComponentProps<typeof Stack>>("Stack", Stack, {}, "cdt-stack");
runContractSuite<HTMLElement, ComponentProps<typeof Grid>>("Grid", Grid, {}, "cdt-grid");
runContractSuite<HTMLHeadingElement, ComponentProps<typeof Heading>>("Heading", Heading, { level: 2 }, "cdt-heading");
runContractSuite<HTMLElement, ComponentProps<typeof Text>>("Text", Text, {}, "cdt-text");
runContractSuite<HTMLDivElement, ComponentProps<typeof Accordion.Root>>("Accordion", Accordion.Root, { type: "single" }, "cdt-accordion");

describe("FR-CMP-017 AC-1 Separator", () => {
  test("is a native rule: separator role, vertical orientation announced, decorative hidden", () => {
    render(<><Separator data-testid="h" /><Separator data-testid="v" orientation="vertical" /><Separator data-testid="d" decorative /></>);
    expect(screen.getByTestId("h").tagName).toBe("HR");
    expect(screen.getAllByRole("separator")).toHaveLength(2);
    expect(screen.getByTestId("h").hasAttribute("aria-orientation")).toBe(false);
    expect(screen.getByTestId("v").getAttribute("aria-orientation")).toBe("vertical");
    expect(screen.getByTestId("v").className).toContain("cdt-separator--vertical");
    expect(screen.getByTestId("d").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("FR-CMP-017 AC-2, AC-3 Stack and Grid", () => {
  test("Stack takes direction, gap, alignment and wrap only as token-step classes", () => {
    render(<Stack data-testid="s" as="ul" direction="row" gap={5} align="center" justify="between" wrap><li>a</li></Stack>);
    const stack = screen.getByTestId("s");
    expect(stack.tagName).toBe("UL");
    expect([...stack.classList]).toEqual(["cdt-stack", "cdt-stack--row", "cdt-stack--gap-5", "cdt-stack--align-center", "cdt-stack--justify-between", "cdt-stack--wrap"]);
    expect(stack.getAttribute("style")).toBeNull();
  });

  test("Stack defaults to a column with the space.3 gap", () => {
    render(<Stack data-testid="s" />);
    expect([...screen.getByTestId("s").classList]).toEqual(["cdt-stack", "cdt-stack--gap-3"]);
  });

  test("Grid is auto-fill without a column count, fixed with one, and defaults to the space.5 gap", () => {
    render(<><Grid data-testid="auto" /><Grid data-testid="three" columns={3} gap={2} as="section" /></>);
    expect([...screen.getByTestId("auto").classList]).toEqual(["cdt-grid", "cdt-grid--gap-5"]);
    expect([...screen.getByTestId("three").classList]).toEqual(["cdt-grid", "cdt-grid--cols-3", "cdt-grid--gap-2"]);
    expect(screen.getByTestId("three").tagName).toBe("SECTION");
  });
});

describe("FR-CMP-017 AC-4, AC-5 Heading and Text", () => {
  test("Heading's level sets the element and its size defaults from the level, overridable apart from it", () => {
    render(<><Heading level={1}>Page</Heading><Heading level={2} size="minor">Small section</Heading><Heading level={5}>Note</Heading></>);
    expect(screen.getByRole("heading", { level: 1, name: "Page" }).className).toBe("cdt-heading cdt-heading--page");
    expect(screen.getByRole("heading", { level: 2, name: "Small section" }).className).toBe("cdt-heading cdt-heading--minor");
    expect(screen.getByRole("heading", { level: 5, name: "Note" }).className).toBe("cdt-heading cdt-heading--minor");
  });

  test("Text is a paragraph at base size and primary tone by default; size, tone, weight and mono are classes", () => {
    render(<><Text data-testid="plain">Body</Text><Text data-testid="small" as="span" size="sm" tone="muted" weight="semibold" mono>a1b2</Text></>);
    expect(screen.getByTestId("plain").tagName).toBe("P");
    expect(screen.getByTestId("plain").className).toBe("cdt-text cdt-text--base cdt-text--primary");
    expect(screen.getByTestId("small").tagName).toBe("SPAN");
    expect(screen.getByTestId("small").className).toBe("cdt-text cdt-text--sm cdt-text--muted cdt-text--semibold cdt-mono");
  });
});

function Faq({ type = "single" as const }: { readonly type?: "single" }) {
  return (
    <Accordion.Root type={type} collapsible>
      <Accordion.Item value="limits"><Accordion.Trigger>Limits</Accordion.Trigger><Accordion.Content>Fifty steps per run.</Accordion.Content></Accordion.Item>
      <Accordion.Item value="audit"><Accordion.Trigger level={4}>Audit</Accordion.Trigger><Accordion.Content>Every step is recorded.</Accordion.Content></Accordion.Item>
    </Accordion.Root>
  );
}

describe("FR-CMP-017 AC-6 Accordion", () => {
  test("each trigger sits in a heading of the chosen level and opens its region", () => {
    render(<Faq />);
    const limits = screen.getByRole("button", { name: "Limits" });
    expect(limits.closest("h3")?.className).toBe("cdt-accordion__header");
    expect(screen.getByRole("button", { name: "Audit" }).closest("h4")).not.toBeNull();
    expect(limits.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(limits);
    expect(limits.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", { name: "Limits" }).textContent).toBe("Fifty steps per run.");
  });

  test("single mode keeps one section open; collapsible closes it again", () => {
    render(<Faq />);
    const [limits, audit] = screen.getAllByRole("button");
    fireEvent.click(limits!);
    fireEvent.click(audit!);
    expect(limits!.getAttribute("aria-expanded")).toBe("false");
    expect(audit!.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(audit!);
    expect(audit!.getAttribute("aria-expanded")).toBe("false");
  });

  test("multiple mode keeps several open", () => {
    render(
      <Accordion.Root type="multiple">
        <Accordion.Item value="a"><Accordion.Trigger>A</Accordion.Trigger><Accordion.Content>a</Accordion.Content></Accordion.Item>
        <Accordion.Item value="b"><Accordion.Trigger>B</Accordion.Trigger><Accordion.Content>b</Accordion.Content></Accordion.Item>
      </Accordion.Root>,
    );
    for (const button of screen.getAllByRole("button")) fireEvent.click(button);
    expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-expanded"))).toEqual(["true", "true"]);
  });

  test("ArrowDown moves focus to the next trigger (Radix, ADR-004)", async () => {
    render(<Faq />);
    const [limits, audit] = screen.getAllByRole("button");
    limits!.focus();
    fireEvent.keyDown(limits!, { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement).toBe(audit));
  });
});
