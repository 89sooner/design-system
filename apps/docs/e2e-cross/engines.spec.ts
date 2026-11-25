// Refs: CR-075 CR-085 WP-042 DEV-065 DEV-070 NFR-005 FR-DX-006 AC-4 FR-CSS-001 FR-CSS-006 FR-THM-001
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { docsPath } from "../e2e/routes";

/**
 * What must hold in every supported engine, not only the Chromium the rest of the suite uses: every component page
 * renders without an uncaught error, the cascade layers and theme tokens resolve, a Radix overlay keeps its keyboard
 * contract, and `:dir(rtl)` mirrors. Kept to behaviour the engines share; pixel and forced-colours checks stay in the
 * Chromium suites that own them.
 */
const PUBLIC_COMPONENTS = (JSON.parse(readFileSync(new URL("../src/generated/component-meta.json", import.meta.url), "utf8")) as { name: string }[]).map((entry) => entry.name);

// DEV-070 · CR-085: a page's first component route can take more than the default 5 s to render on a cold CI
// runner. In PR #111's WebKit job it rendered about 5.3 s after its chunks arrived (trace), while 780 local
// cold loads under CPU load took 0.4 – 0.9 s. These tests ask "does it render", not "how fast"; Lighthouse
// gates speed (NFR-001). So the first route of each page gets 15 s; later routes keep the default.
const FIRST_ROUTE_TIMEOUT = 15_000;
const rendered = new WeakSet<Page>();

async function openComponent(page: Page, component: string): Promise<void> {
  await page.goto(docsPath(`/components/${component}`));
  await expect(page.locator(".docs-preview").first()).toBeVisible(rendered.has(page) ? {} : { timeout: FIRST_ROUTE_TIMEOUT });
  rendered.add(page);
}

test("NFR-005: every public component page renders without an uncaught error", async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  let current = "";
  page.on("pageerror", (error) => errors.push(`${current}: ${error.message}`));
  for (const component of PUBLIC_COMPONENTS) {
    current = component;
    await openComponent(page, component);
  }
  expect(PUBLIC_COMPONENTS.length).toBeGreaterThan(60);
  expect(errors).toEqual([]);
});

test("NFR-005 · FR-CSS-001: cascade layers and theme tokens resolve, and the light palette replaces the dark one", async ({ page }) => {
  await openComponent(page, "Button");
  const read = () => page.locator(".docs-preview .cdt-btn").first().evaluate((button) => ({
    text: getComputedStyle(document.documentElement).getPropertyValue("--cdt-text-primary").trim(),
    radius: getComputedStyle(button).borderTopLeftRadius,
    height: button.getBoundingClientRect().height,
  }));
  await page.evaluate(() => { document.documentElement.dataset.cdtTheme = "dark"; });
  const dark = await read();
  await page.evaluate(() => { document.documentElement.dataset.cdtTheme = "light"; });
  const light = await read();
  expect(dark.text).not.toBe("");
  expect(light.text).not.toBe(dark.text);
  // Component rules live in `@layer cdt.component`; an engine that dropped the layer would leave the UA button.
  expect(Number.parseFloat(dark.radius)).toBeGreaterThan(0);
  expect(dark.height).toBeGreaterThanOrEqual(32);
});

test("NFR-005 · FR-A11Y-002: a dialog opens, Escape closes it and focus returns to its trigger", async ({ page }) => {
  await openComponent(page, "Dialog");
  const trigger = page.locator(".docs-preview").getByRole("button", { name: "Open dialog" });
  const dialog = page.getByRole("dialog", { name: "Promote to production?" });
  // Opening is setup, not the contract under test. In Firefox CI one run's first click after the lazy route
  // rendered left the dialog closed (PR #92; Chromium shows no remount locally), so the click repeats until it opens.
  await expect(async () => {
    if (!(await dialog.isVisible())) await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
  await expect.poll(() => dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("NFR-005 · FR-CSS-006: the switch thumb mirrors under dir=rtl", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openComponent(page, "Switch");
  const thumbX = () => page.locator(".docs-preview .cdt-switch__thumb").first().evaluate((thumb) => new DOMMatrix(getComputedStyle(thumb).transform).m41);
  const ltr = await thumbX();
  await page.locator(".docs-preview").first().evaluate((preview) => preview.setAttribute("dir", "rtl"));
  const rtl = await thumbX();
  expect(ltr).not.toBe(0);
  expect(rtl).toBe(-ltr);
});
