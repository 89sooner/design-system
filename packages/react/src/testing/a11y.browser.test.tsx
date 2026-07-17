// Refs: WP-024 FR-QA-003 FR-A11Y-001 FR-A11Y-002 FR-A11Y-005
import { commands, userEvent } from "@vitest/browser/context";
import { cleanup, render, waitFor } from "@testing-library/react";
import axe, { type Result } from "axe-core";
import { afterAll, afterEach, describe, expect, test } from "vitest";
import allowListSource from "../../../../axe-allowlist.json";
import "@conductor-by-89soone/css";
import { Button } from "../action";
import { Checkbox, Switch, TextField } from "../form";
import { Card } from "../surface";
import { a11yScenarios, AppShellKeyboardFixture, keyboardScenarios } from "./a11y-scenarios";
import { publicComponents } from "./public-components";

declare const __CONDUCTOR_A11Y_FIXTURE__: string;

declare module "@vitest/browser/context" {
  interface BrowserCommands {
    writeAxeReport: (report: string) => Promise<void>;
  }
}

type Theme = "dark" | "light";
interface AxeAllowEntry { readonly rule: string; readonly reason: string }
interface AuditEntry { readonly component: string; readonly state: string; readonly theme: Theme; readonly violations: readonly Result[] }

const themes: readonly Theme[] = ["dark", "light"];
const allowList = allowListSource as readonly AxeAllowEntry[];
const allowedRules = new Set(allowList.map((entry) => entry.rule));
const auditEntries: AuditEntry[] = [];
const seriousImpacts = new Set(["serious", "critical"]);

function setTheme(theme: Theme): void {
  document.documentElement.dataset.cdtTheme = theme;
}

function seriousViolations(results: axe.AxeResults): Result[] {
  return results.violations.filter((violation) => violation.impact !== undefined && violation.impact !== null && seriousImpacts.has(violation.impact));
}

function unexpectedViolations(violations: readonly Result[]): Result[] {
  return violations.filter((violation) => !allowedRules.has(violation.id));
}

function violationSummary(violations: readonly Result[]): string[] {
  return violations.map((violation) => `${violation.id}(${violation.impact}): ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`);
}

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.cdtTheme;
});

afterAll(async () => {
  const report = {
    generatedAt: new Date().toISOString(),
    engine: `axe-core ${axe.version}`,
    allowList,
    summary: {
      scenarios: auditEntries.length,
      seriousOrCritical: auditEntries.reduce((count, entry) => count + entry.violations.length, 0),
      unexpected: auditEntries.reduce((count, entry) => count + unexpectedViolations(entry.violations).length, 0),
    },
    results: auditEntries,
  };
  await commands.writeAxeReport(`${JSON.stringify(report, null, 2)}\n`);
});

test("FR-QA-003 AC-1, AC-4: scenario and allow-list contracts cover the public registry", () => {
  const publicNames = publicComponents.map((component) => component.name).sort();
  const scenarioNames = [...new Set(a11yScenarios.map((scenario) => scenario.component))].sort();
  const keyboardNames = keyboardScenarios.map((scenario) => scenario.component).sort();

  expect(scenarioNames).toEqual(publicNames);
  expect(keyboardNames).toEqual(publicNames);
  expect(new Set(allowList.map((entry) => entry.rule)).size).toBe(allowList.length);
  for (const entry of allowList) {
    expect(entry.rule.trim()).not.toBe("");
    expect(entry.reason.trim()).not.toBe("");
  }
});

for (const theme of themes) {
  describe(`FR-QA-003 AC-1 through AC-3: ${theme} theme`, () => {
    for (const scenario of a11yScenarios) {
      test(`${scenario.component} ${scenario.state} has no unapproved serious axe violation`, async () => {
        setTheme(theme);
        render(<main data-a11y-root="">{scenario.render()}</main>);
        await waitFor(() => expect(document.querySelector("[data-a11y-root]")).not.toBeNull());

        const axeRoot = scenario.axeSelector === undefined
          ? document.querySelector("[data-a11y-root]")
          : document.querySelector(scenario.axeSelector);
        expect(axeRoot).not.toBeNull();
        const results = await axe.run(axeRoot as Element, { resultTypes: ["violations"] });
        const violations = seriousViolations(results);
        const unexpected = unexpectedViolations(violations);
        auditEntries.push({ component: scenario.component, state: scenario.state, theme, violations });

        expect(violationSummary(unexpected)).toEqual([]);
      });
    }
  });
}

for (const scenario of keyboardScenarios) {
  test(`FR-A11Y-002 AC-1, AC-2, AC-5: ${scenario.component} has a complete keyboard path`, async () => {
    setTheme("dark");
    const { container } = render(<><button data-keyboard-start="">Start</button><div data-keyboard-scenario="">{scenario.render()}</div><button data-keyboard-end="">End</button></>);
    const start = container.querySelector<HTMLButtonElement>("[data-keyboard-start]");
    const end = container.querySelector<HTMLButtonElement>("[data-keyboard-end]");
    const target = container.querySelector<HTMLElement>("[data-keyboard-target]");
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    start?.focus();

    if (scenario.keyboard.kind === "static") {
      await userEvent.tab();
      expect(document.activeElement).toBe(end);
      return;
    }

    await userEvent.tab();
    if (scenario.keyboard.kind === "skip-link") {
      expect(document.activeElement?.textContent).toBe("Skip to shell content");
      await userEvent.keyboard("{Enter}");
      expect(document.activeElement?.tagName).toBe("MAIN");
      return;
    }

    expect(document.activeElement).toBe(target);
    if (scenario.keyboard.kind === "focus") return;

    if (scenario.keyboard.kind === "toggle") {
      const before = target?.getAttribute("aria-checked");
      await userEvent.keyboard(" ");
      expect(target?.getAttribute("aria-checked")).not.toBe(before);
      return;
    }

    const { opensOnFocus, role } = scenario.keyboard;
    if (!opensOnFocus) await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(document.querySelector(`[role="${role}"]`)).not.toBeNull());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector(`[role="${role}"]`)).toBeNull());
    expect(document.activeElement).toBe(target);
    await userEvent.tab();
    expect(document.activeElement).toBe(end);
  });
}

test("FR-A11Y-002 AC-2: AppShell mobile navigation releases focus after Escape", async () => {
  setTheme("dark");
  const { container } = render(<><AppShellKeyboardFixture /><button data-after-shell="">After shell</button></>);
  const trigger = container.querySelector<HTMLButtonElement>("[data-shell-trigger]");
  trigger?.focus();
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull());
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull());
  expect(document.activeElement).not.toBe(trigger);
  await userEvent.tab();
  expect(document.activeElement).not.toBe(document.body);
  expect(document.querySelector('[role="dialog"]')?.contains(document.activeElement)).not.toBe(true);
});

for (const theme of themes) {
  test(`FR-A11Y-001 AC-1: ${theme} theme preserves the complete keyboard focus ring over component shadows`, async () => {
    setTheme(theme);
    const { container } = render(<><button data-focus-start="">Start</button><Button>Button target</Button><Card as="a" href="#focus-card">Card target</Card><TextField aria-label="Text field target" /><Switch aria-label="Switch target" /><Checkbox aria-label="Checkbox target" /></>);
    container.querySelector<HTMLButtonElement>("[data-focus-start]")?.focus();

    const probe = document.createElement("div");
    probe.style.boxShadow = getComputedStyle(document.documentElement).getPropertyValue("--cdt-focus-ring");
    document.body.append(probe);
    const expectedRing = getComputedStyle(probe).boxShadow;
    probe.remove();

    for (const selector of [".cdt-btn", ".cdt-card--interactive", ".cdt-input", ".cdt-switch", ".cdt-checkbox"]) {
      await userEvent.tab();
      const target = container.querySelector<HTMLElement>(selector);
      expect(document.activeElement).toBe(target);
      expect(target?.matches(":focus-visible")).toBe(true);
      expect(getComputedStyle(target as Element).boxShadow).toBe(expectedRing);
    }
  });
}

test("FR-CSS-001 AC-3: an unlayered consumer rule overrides a Conductor component rule", () => {
  setTheme("dark");
  const style = document.createElement("style");
  style.textContent = ".cdt-btn { border-radius: 0; }";
  document.head.append(style);
  const { container } = render(<Button>Save</Button>);
  expect(parseFloat(getComputedStyle(container.querySelector(".cdt-btn") as Element).borderRadius)).toBe(0);
  style.remove();
});

test("FR-CSS-004 AC-3: framework-agnostic primary classes match the React Button computed style", () => {
  setTheme("dark");
  const { container } = render(<><Button variant="primary">React button</Button><button className="cdt-btn cdt-btn--primary">CSS button</button></>);
  const [reactButton, cssButton] = Array.from(container.querySelectorAll(".cdt-btn"));
  expect(reactButton).toBeDefined();
  expect(cssButton).toBeDefined();
  const reactStyle = getComputedStyle(reactButton as Element);
  const cssStyle = getComputedStyle(cssButton as Element);
  expect({
    backgroundColor: cssStyle.backgroundColor,
    borderColor: cssStyle.borderColor,
    borderRadius: cssStyle.borderRadius,
    color: cssStyle.color,
    minHeight: cssStyle.minHeight,
    padding: cssStyle.padding,
  }).toEqual({
    backgroundColor: reactStyle.backgroundColor,
    borderColor: reactStyle.borderColor,
    borderRadius: reactStyle.borderRadius,
    color: reactStyle.color,
    minHeight: reactStyle.minHeight,
    padding: reactStyle.padding,
  });
});

test.skipIf(__CONDUCTOR_A11Y_FIXTURE__ !== "serious")("FR-QA-003 AC-2: serious violation fixture makes the gate fail", async () => {
  render(<button />);
  const results = await axe.run(document, { resultTypes: ["violations"] });
  const unexpected = unexpectedViolations(seriousViolations(results));
  expect(violationSummary(unexpected)).toEqual([]);
});
