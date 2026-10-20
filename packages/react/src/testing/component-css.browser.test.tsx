// Refs: CR-056 DEV-057 CR-057 CR-058 CR-062 CR-063 FR-A11Y-001 FR-CSS-002
//
// `@conductor-by-89soone/css/component.css` leaves out cdt.reset for consumers that bring their
// own global reset. The focus ring must not depend on that reset: every keyboard stop that is a
// Conductor element, or sits inside one, draws `--cdt-focus-ring` with this entry point alone.
import { userEvent } from "@vitest/browser/context";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { NumberInput } from "../number-input";
import { TextField } from "../form";
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
