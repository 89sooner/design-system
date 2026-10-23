// Refs: CR-071 FR-A11Y-001 AC-5 FR-A11Y-003 AC-5 FR-CSS-002 AC-3
import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { docsPath } from "./routes";

/**
 * Forced colours (Windows high contrast) drop every background and box-shadow. Conductor drew its
 * focus ring and most selection states with exactly those, so in that mode focus and selection
 * vanished. These tests read the rendered result under Chromium's forced-colours emulation.
 */
const PUBLIC_COMPONENTS = (JSON.parse(readFileSync(new URL("../src/generated/component-meta.json", import.meta.url), "utf8")) as { name: string }[]).map((entry) => entry.name);

// The `forcedColors` context option does not reach the page under this config; emulateMedia does.
// Reduced motion zeroes the background transitions, so a just-highlighted option is read at its final colour.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", colorScheme: "dark", reducedMotion: "reduce" });
});

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** What the system colours resolve to in this browser, read from a probe element. */
async function systemColours(page: Page): Promise<{ readonly highlight: string; readonly highlightText: string }> {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "Highlight";
    probe.style.color = "HighlightText";
    document.body.append(probe);
    const style = getComputedStyle(probe);
    const colours = { highlight: style.backgroundColor, highlightText: style.color };
    probe.remove();
    return colours;
  });
}

async function openPreview(page: Page, component: string): Promise<Locator> {
  await page.goto(docsPath(`/components/${component}`));
  const preview = page.locator(".docs-preview").first();
  await expect(preview).toBeVisible();
  return preview;
}

test("CR-071 FR-A11Y-001 AC-5: every focusable control in every public component shows an outline in forced colours", async ({ page }) => {
  test.setTimeout(180_000);
  const missing: string[] = [];
  let checked = 0;
  for (const component of PUBLIC_COMPONENTS) {
    const preview = await openPreview(page, component);
    // One real key press puts the page in keyboard modality, so the programmatic focus below matches :focus-visible.
    await page.keyboard.press("Tab");
    const controls = preview.locator(FOCUSABLE);
    for (let index = 0; index < (await controls.count()); index += 1) {
      const control = controls.nth(index);
      if (!(await control.isVisible())) continue;
      await control.focus();
      const result = await control.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          focused: element === document.activeElement,
          visible: element.matches(":focus-visible"),
          style: style.outlineStyle,
          width: Number.parseFloat(style.outlineWidth),
          colour: style.outlineColor,
          name: `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
        };
      });
      // Focus can move away (an overlay opening, a roving group handing focus on); only judge what kept it.
      if (!result.focused || !result.visible) continue;
      checked += 1;
      if (result.style === "none" || result.width < 1 || /rgba\(.*,\s*0\)$/.test(result.colour)) {
        missing.push(`${component}: ${result.name} (${result.style} ${result.width}px ${result.colour})`);
      }
    }
  }
  expect(checked).toBeGreaterThan(PUBLIC_COMPONENTS.length);
  expect(missing).toEqual([]);
});

/** Resting states each preview renders: the element that carries the state and the property that must take Highlight. */
const RESTING_STATES = [
  { component: "Switch", selector: '.cdt-switch[data-state="checked"]', property: "backgroundColor", filled: true },
  { component: "Checkbox", selector: '.cdt-checkbox[data-state="checked"]', property: "backgroundColor", filled: true },
  { component: "RadioGroup", selector: '.cdt-radio__control[data-state="checked"]', property: "backgroundColor", filled: true },
  { component: "ToggleGroup", selector: '.cdt-toggle-group__item[data-state="on"]', property: "backgroundColor", filled: true },
  { component: "Pagination", selector: '.cdt-pagination__page[aria-current="page"]', property: "backgroundColor", filled: true },
  { component: "Tabs", selector: '.cdt-tabs__list:not(.cdt-tabs__list--line) .cdt-tabs__trigger[data-state="active"]', property: "backgroundColor", filled: true },
  { component: "Meter", selector: ".cdt-meter__fill", property: "backgroundColor", filled: false },
  { component: "Timeline", selector: '.cdt-timeline__step[aria-current="step"]', property: "borderInlineStartColor", filled: false },
] as const;

for (const state of RESTING_STATES) {
  test(`CR-071 FR-A11Y-003 AC-5: ${state.component} draws its state in the system highlight`, async ({ page }) => {
    const preview = await openPreview(page, state.component);
    const { highlight, highlightText } = await systemColours(page);
    const element = preview.locator(state.selector).first();
    const style = await element.evaluate((node) => {
      const computed = getComputedStyle(node);
      return { backgroundColor: computed.backgroundColor, borderInlineStartColor: computed.borderInlineStartColor, color: computed.color, adjust: computed.forcedColorAdjust };
    });
    expect(style[state.property]).toBe(highlight);
    if (state.filled) {
      expect(style.color).toBe(highlightText);
      // Without the opt-out, forced colours paint a Canvas backplate over the text on the fill.
      expect(style.adjust).toBe("none");
    }
  });
}

test("CR-071 FR-A11Y-003 AC-5: the active NavList item keeps a Highlight rail", async ({ page }) => {
  const preview = await openPreview(page, "NavList");
  const { highlight } = await systemColours(page);
  const rail = await preview.locator(".cdt-nav-list__item--active").first().evaluate((node) => getComputedStyle(node, "::before").backgroundColor);
  expect(rail).toBe(highlight);
});

/**
 * Overlays whose keyboard-highlighted option was drawn only by a background. Each opens from the keyboard,
 * so a pointer left over the opened list cannot move the highlight.
 */
const HIGHLIGHTED_OPTIONS: Readonly<Record<string, (page: Page, preview: Locator) => Promise<Locator>>> = {
  Select: async (page, preview) => {
    await preview.getByRole("combobox").focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    return page.getByRole("listbox").locator("[data-highlighted]");
  },
  Combobox: async (page, preview) => {
    await preview.getByRole("combobox").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    return page.getByRole("listbox").locator("[data-highlighted]");
  },
  DropdownMenu: async (page, preview) => {
    await preview.getByRole("button", { name: "Menu trigger" }).focus();
    await page.keyboard.press("Enter");
    return page.getByRole("menu").locator("[data-highlighted]");
  },
  CommandPalette: async (page, preview) => {
    await preview.getByRole("button", { name: "Open command palette" }).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    return page.getByRole("dialog").locator("[data-highlighted]");
  },
};

for (const [component, open] of Object.entries(HIGHLIGHTED_OPTIONS)) {
  test(`CR-071 FR-A11Y-003 AC-5: the highlighted ${component} option fills with Highlight and HighlightText`, async ({ page }) => {
    const preview = await openPreview(page, component);
    const { highlight, highlightText } = await systemColours(page);
    const option = (await open(page, preview)).first();
    await expect(option).toBeVisible();
    const read = () => option.evaluate((node) => {
      const own = getComputedStyle(node);
      const stray = [...node.querySelectorAll("*")].map((child) => getComputedStyle(child).color);
      return { background: own.backgroundColor, color: own.color, stray };
    });
    await expect.poll(async () => (await read()).background).toBe(highlight);
    const style = await read();
    expect(style.color).toBe(highlightText);
    expect(style.stray.filter((colour) => colour !== highlightText)).toEqual([]);
  });
}

test("CR-071 FR-A11Y-003 AC-5: the selected DatePicker day fills with Highlight", async ({ page }) => {
  const preview = await openPreview(page, "DatePicker");
  const { highlight } = await systemColours(page);
  await preview.locator(".cdt-date-picker").click();
  // Any enabled day of the shown month: the calendar follows the wall clock, so no fixed date is assumed.
  await page.locator(".cdt-date-picker__day:not(.cdt-date-picker__disabled):not(.cdt-date-picker__outside) .cdt-date-picker__day-button").first().click();
  await preview.locator(".cdt-date-picker").click();
  const selected = page.locator(".cdt-date-picker__selected .cdt-date-picker__day-button");
  await expect(selected).toBeVisible();
  expect(await selected.evaluate((node) => getComputedStyle(node).backgroundColor)).toBe(highlight);
});

test("CR-071 FR-A11Y-003 AC-5: a selected DataTable row keeps an inset Highlight outline", async ({ page }) => {
  const preview = await openPreview(page, "DataTable");
  const { highlight } = await systemColours(page);
  await preview.locator("tbody button").first().click();
  const row = preview.locator("tr[data-selected]");
  await expect(row).toHaveCount(1);
  const outline = await row.evaluate((node) => {
    const style = getComputedStyle(node);
    return { style: style.outlineStyle, colour: style.outlineColor, width: Number.parseFloat(style.outlineWidth) };
  });
  expect(outline).toEqual({ style: "solid", colour: highlight, width: expect.any(Number) });
  expect(outline.width).toBeGreaterThanOrEqual(1);
});

test.describe("without forced colours", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: "none" });
  });

  test("CR-071 FR-CSS-002 AC-3: the focus outline paints nothing, so the token ring is the only visible indicator", async ({ page }) => {
    const preview = await openPreview(page, "Button");
    await page.keyboard.press("Tab");
    const button = preview.locator(".cdt-btn").first();
    await button.focus();
    const style = await button.evaluate((node) => ({ outline: getComputedStyle(node).outlineColor, shadow: getComputedStyle(node).boxShadow }));
    expect(style.outline).toBe("rgba(0, 0, 0, 0)");
    expect(style.shadow).not.toBe("none");
  });
});
