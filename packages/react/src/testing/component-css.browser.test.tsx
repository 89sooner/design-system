// Refs: CR-056 DEV-057 CR-057 CR-058 CR-062 CR-063 CR-064 DEV-061 FR-A11Y-001 FR-CSS-002 FR-THM-005 FR-CMP-004 FR-CMP-010
//
// `@conductor-by-89soone/css/component.css` leaves out cdt.reset for consumers that bring their
// own global reset. The focus ring must not depend on that reset: every keyboard stop that is a
// Conductor element, or sits inside one, draws `--cdt-focus-ring` with this entry point alone.
import { page, userEvent } from "@vitest/browser/context";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { NumberInput } from "../number-input";
import { TextArea, TextField } from "../form";
import { Badge, StatusBadge } from "../status";
import { DataTable, DetailInspector, WorkbenchLayout } from "../workbench";
import { PromptInput } from "../agent";
import "@conductor-by-89soone/css/component.css";
import "@conductor-by-89soone/css/agent.css";
import { a11yScenarios } from "./a11y-scenarios";
import { cursorViolations } from "./cursor-contract";
import { stackingViolations } from "./stacking-contract";
import { hiddenViolations } from "./hidden-contract";

afterEach(() => cleanup());

const ringColor = (): string => {
  const probe = document.createElement("div");
  probe.style.boxShadow = getComputedStyle(document.documentElement).getPropertyValue("--cdt-focus-ring");
  document.body.append(probe);
  const shadow = getComputedStyle(probe).boxShadow;
  probe.remove();
  return /rgba?\([^)]*\)/.exec(shadow)?.[0] ?? shadow;
};

const describeElement = (element: Element): string =>
  `${element.tagName.toLowerCase()}${element.className && typeof element.className === "string" ? `.${element.className.trim().split(/\s+/).join(".")}` : ""}`;

const scenarios = a11yScenarios.filter((scenario) => scenario.state === "default");

test("FR-A11Y-001 AC-1: component.css alone draws the focus ring on every keyboard stop", async () => {
  document.documentElement.dataset.cdtTheme = "dark";
  const ring = ringColor();
  const missing: string[] = [];
  for (const scenario of scenarios) {
    const { container } = render(<><button data-focus-start="">Start</button>{scenario.render()}<button data-focus-end="">End</button></>);
    container.querySelector<HTMLButtonElement>("[data-focus-start]")?.focus();
    for (let stop = 0; stop < 12; stop++) {
      await userEvent.tab();
      const active = document.activeElement;
      if (active === null || active === document.body || active.hasAttribute("data-focus-end")) break;
      if (!active.matches(":focus-visible")) continue;
      // A trigger the consumer renders outside every Conductor element is styled by the consumer.
      if (!active.matches('[class*="cdt-"], [class*="cdt-"] *')) continue;
      const style = getComputedStyle(active);
      const drawn = style.boxShadow.includes(ring);
      if (!drawn) missing.push(`${scenario.component}: ${describeElement(active)} (box-shadow ${style.boxShadow}, outline ${style.outline})`);
    }
    cleanup();
  }
  expect(missing).toEqual([]);
});

test("CR-057: with component.css alone, controls show the pointer and interface labels the arrow", () => {
  document.documentElement.dataset.cdtTheme = "dark";
  const violations: string[] = [];
  for (const scenario of a11yScenarios) {
    render(scenario.render());
    violations.push(...cursorViolations(document.body, `${scenario.component} ${scenario.state}`));
    cleanup();
  }
  expect(violations).toEqual([]);
});

test("CR-058: with component.css alone, every open overlay surface sits above its scrim", () => {
  document.documentElement.dataset.cdtTheme = "dark";
  const violations: string[] = [];
  for (const scenario of a11yScenarios) {
    render(scenario.render());
    violations.push(...stackingViolations(document, `${scenario.component} ${scenario.state}`));
    cleanup();
  }
  expect(violations).toEqual([]);
});

test("CR-062: with the component.css alone, a part Radix closes with `hidden` takes no space", () => {
  document.documentElement.dataset.cdtTheme = "dark";
  const violations: string[] = [];
  for (const scenario of a11yScenarios) {
    render(scenario.render());
    violations.push(...hiddenViolations(document.body, `${scenario.component} ${scenario.state}`));
    cleanup();
  }
  expect(violations).toEqual([]);
});

test("CR-063: a glass NumberInput rests on the glass TextField surface and keeps the solid focus and disabled backgrounds", async () => {
  for (const theme of ["dark", "light"] as const) {
    document.documentElement.dataset.cdtTheme = theme;
    const { container } = render(<>
      <TextField aria-label="Glass text" variant="glass" />
      <NumberInput aria-label="Solid number" />
      <NumberInput aria-label="Glass number" variant="glass" />
      <NumberInput aria-label="Solid disabled" disabled />
      <NumberInput aria-label="Glass disabled" variant="glass" disabled />
    </>);
    const field = (label: string): HTMLInputElement => container.querySelector<HTMLInputElement>(`[aria-label="${label}"]`)!;
    const background = (label: string): string => getComputedStyle(field(label)).backgroundColor;
    expect(background("Glass number"), theme).toBe(background("Glass text"));
    expect(background("Glass number"), theme).not.toBe(background("Solid number"));
    expect(background("Glass disabled"), theme).toBe(background("Solid disabled"));
    field("Solid number").focus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}{Tab}");
    const solidFocus = background("Solid number");
    field("Glass number").focus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}{Tab}");
    expect(field("Glass number").matches(":focus-visible"), theme).toBe(true);
    expect(background("Glass number"), theme).toBe(solidFocus);
    cleanup();
  }
});

// ---- CR-064 ----

const channels = (color: string): [number, number, number] => {
  const [r = 0, g = 0, b = 0] = (/rgba?\(([^)]*)\)/.exec(color)?.[1] ?? "").split(/[\s,/]+/).map(Number);
  return [r, g, b];
};
const luminance = (color: string): number => {
  const [r, g, b] = channels(color).map((value) => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (one: string, other: string): number => {
  const [high, low] = [luminance(one), luminance(other)].sort((a, b) => b - a) as [number, number];
  return (high + 0.05) / (low + 0.05);
};
/** Distinct line boxes the element's text occupies. */
const textLines = (element: Element): number => {
  const tops = new Set<number>();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) tops.add(Math.round(rect.top));
  }
  return tops.size;
};

test("CR-064 FR-THM-005 AC-8: an active field's placeholder reaches 4.5:1 on the fill the field actually paints", () => {
  for (const theme of ["dark", "light"] as const) {
    document.documentElement.dataset.cdtTheme = theme;
    const { container } = render(<>
      <TextField aria-label="Text" placeholder="Title in any language" />
      <TextArea aria-label="Area" placeholder="Describe the change" />
      <NumberInput aria-label="Number" placeholder="0" />
      <PromptInput aria-label="Prompt" value="" onValueChange={() => undefined} onSubmit={() => undefined} placeholder="Ask about this run" />
    </>);
    const fields = [...container.querySelectorAll<HTMLElement>("input[placeholder], textarea[placeholder]")];
    expect(fields.length, theme).toBe(4);
    for (const field of fields) {
      const placeholder = getComputedStyle(field, "::placeholder").color;
      const fill = getComputedStyle(field).backgroundColor;
      expect(contrast(placeholder, fill), `${theme} ${field.getAttribute("aria-label")}: ${placeholder} on ${fill}`).toBeGreaterThanOrEqual(4.5);
    }
    cleanup();
  }
});

const STATES = ["merged", "closed", "open", "draft"] as const;
const rows = STATES.map((state, index) => ({ id: `pr-${index}`, state }));

test("CR-064 FR-CMP-004: a badge and a row button stay one line in a squeezed DataTable cell", async () => {
  await page.viewport(1280, 800);
  document.documentElement.dataset.cdtTheme = "dark";
  const { container } = render(<div style={{ inlineSize: "220px" /* cdt-allow-literal: a squeezed column width */ }}>
    <DataTable label="Squeezed" rows={rows} rowId={(row) => row.id} rowLabel={(row) => row.id} onSelect={() => undefined}
      columns={[{ id: "title", header: "Title", cell: (row) => `Change ${row.id} with a long wrapping title` }, { id: "state", header: "State", cell: (row) => <Badge tone="accent">{row.state}</Badge> }, { id: "ci", header: "CI", cell: () => <StatusBadge status="success" icon={<svg />} label="Passing" /> }]} />
  </div>);
  const units = [...container.querySelectorAll(".cdt-badge, tbody .cdt-btn")];
  expect(units.length).toBe(rows.length * 3);
  expect(units.filter((unit) => textLines(unit) !== 1).map((unit) => unit.textContent)).toEqual([]);
  // The title still wraps: nowrap is for single units, not the cell.
  expect(textLines(container.querySelector("tbody td:nth-child(2)")!)).toBeGreaterThan(1);
});

test("CR-064 FR-CMP-004 AC-7: a plain StatusBadge keeps the status-coloured icon and the text, without fill, border or marker", () => {
  for (const theme of ["dark", "light"] as const) {
    document.documentElement.dataset.cdtTheme = theme;
    const { container } = render(<>
      <StatusBadge data-testid="chip" status="queued" icon={<svg />} label="Queued" />
      <StatusBadge data-testid="plain" appearance="plain" status="queued" icon={<svg />} label="Queued" />
      <StatusBadge data-testid="plain-danger" appearance="plain" status="danger" icon={<svg />} label="Failing" />
    </>);
    const get = (id: string): HTMLElement => container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
    expect(get("chip").querySelector(".cdt-status-badge__marker"), theme).not.toBeNull();
    expect(get("plain").querySelector(".cdt-status-badge__marker"), theme).toBeNull();
    const plain = getComputedStyle(get("plain-danger"));
    const transparent = "rgba(0, 0, 0, 0)"; /* cdt-allow-literal: computed transparent */
    expect(plain.backgroundColor, theme).toBe(transparent);
    expect(plain.borderTopColor, theme).toBe(transparent);
    const root = getComputedStyle(document.documentElement);
    const probe = document.createElement("span");
    probe.style.color = root.getPropertyValue("--cdt-status-danger");
    document.body.append(probe);
    expect(getComputedStyle(get("plain-danger").querySelector(".cdt-badge__icon")!).color, theme).toBe(getComputedStyle(probe).color);
    probe.style.color = root.getPropertyValue("--cdt-text-primary");
    expect(plain.color, theme).toBe(getComputedStyle(probe).color);
    probe.remove();
    cleanup();
  }
});

test("CR-064 FR-CMP-010 AC-6: the selected row's pressed button reads as primary text and sortable headers keep the header type", () => {
  for (const theme of ["dark", "light"] as const) {
    document.documentElement.dataset.cdtTheme = theme;
    const { container } = render(<DataTable label="Rows" rows={rows} rowId={(row) => row.id} rowLabel={(row) => row.id} selectedId="pr-1" onSelect={() => undefined}
      sort={{ column: "title", direction: "ascending" }} onSortChange={() => undefined}
      columns={[{ id: "title", header: "Title", sortable: true, cell: (row) => row.id }, { id: "state", header: "State", cell: (row) => row.state }]} />);
    const probe = document.createElement("span");
    probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--cdt-text-primary");
    document.body.append(probe);
    const pressed = container.querySelector<HTMLElement>('tr[data-selected] .cdt-btn[aria-pressed="true"]')!;
    expect(getComputedStyle(pressed).color, theme).toBe(getComputedStyle(probe).color);
    probe.remove();
    const [sortable, plain] = [...container.querySelectorAll<HTMLElement>("thead th")].slice(1);
    const button = sortable!.querySelector<HTMLElement>(".cdt-btn")!;
    for (const property of ["textTransform", "letterSpacing", "fontWeight", "fontSize", "color"] as const) {
      expect(getComputedStyle(button)[property], `${theme} ${property}`).toBe(getComputedStyle(plain!)[property]);
    }
    cleanup();
  }
});

test("CR-064 FR-CMP-010 AC-6: the split-view inspector stays in view while results scroll, and stacks below md", async () => {
  document.documentElement.dataset.cdtTheme = "dark";
  const tall = Array.from({ length: 60 }, (_, index) => ({ id: `row-${index}` }));
  const view = (): HTMLElement => document.querySelector<HTMLElement>(".cdt-workbench__inspector")!;
  render(<WorkbenchLayout inspector={<DetailInspector label="Preview" onClose={() => undefined}>Detail</DetailInspector>}>
    <DataTable label="Tall" rows={tall} rowId={(row) => row.id} rowLabel={(row) => row.id} columns={[{ id: "id", header: "ID", cell: (row) => row.id }]} />
  </WorkbenchLayout>);
  await page.viewport(1280, 800);
  expect(getComputedStyle(view()).position).toBe("sticky");
  window.scrollTo(0, 1200);
  const top = view().getBoundingClientRect().top;
  expect(top).toBeGreaterThanOrEqual(-1);
  expect(top).toBeLessThan(800);
  window.scrollTo(0, 0);
  await page.viewport(700, 800);
  expect(getComputedStyle(view()).position).toBe("static");
  await page.viewport(1280, 800);
});
