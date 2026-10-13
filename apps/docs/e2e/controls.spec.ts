// CR-054 · FR-CMP-014: Toast, DatePicker, CommandPalette and Pagination on their W-021 pages.
import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";

const errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("conductor-theme", "dark"));
});
test.afterEach(() => expect(errors).toEqual([]));

async function seriousViolations(page: Page, selector: string) {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async (target) => (await window.axe.run(document.querySelector(target) as Element, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"] })).violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => v.id), selector);
}

test("FR-CMP-014 Toast appears, names its status in text and dismisses", async ({ page }) => {
  await page.goto("/#/components/Toast");
  await page.locator(".docs-preview").getByRole("button", { name: "Show notification" }).click();
  const toast = page.locator(".cdt-toast");
  await expect(toast).toContainText("Release promoted");
  await expect(toast).toHaveClass(/cdt-toast--success/);
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(toast).toHaveCount(0);
});

test("FR-CMP-014 DatePicker opens from the keyboard, refuses weekends and closes on choice", async ({ page }) => {
  await page.goto("/#/components/DatePicker");
  const trigger = page.locator(".docs-preview").getByRole("button", { name: "Release date" });
  await expect(trigger).toHaveText("Pick a date");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Choose a date" });
  await expect(dialog.getByRole("grid")).toBeVisible();
  expect(await seriousViolations(page, "[role=dialog]")).toEqual([]);
  await expect(dialog.locator(".cdt-date-picker__disabled:not(.cdt-date-picker__outside) button").first()).toBeDisabled();
  await dialog.locator(".cdt-date-picker__day:not(.cdt-date-picker__disabled):not(.cdt-date-picker__outside) button").first().click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).not.toHaveText("Pick a date");
  await expect(trigger).toBeFocused();
});

test("FR-CMP-014 CommandPalette filters, runs with Enter and returns focus", async ({ page }) => {
  await page.goto("/#/components/CommandPalette");
  const open = page.locator(".docs-preview").getByRole("button", { name: /Open command palette/ });
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  const input = dialog.getByRole("combobox", { name: "Search commands" });
  await expect(input).toBeFocused();
  expect(await seriousViolations(page, "[role=dialog]")).toEqual([]);
  await input.fill("ship");
  await expect(dialog.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator(".docs-preview").getByRole("status")).toHaveText("Ran: deploy");
  await expect(open).toBeFocused();
});

test("FR-CMP-014 Pagination marks the current page and moves with the buttons", async ({ page }) => {
  await page.goto("/#/components/Pagination");
  const nav = page.locator(".docs-preview").getByRole("navigation", { name: "Release history pages" });
  await expect(nav.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("button", { name: "Next" }).click();
  await expect(nav.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("button", { name: "Page 12" }).click();
  await expect(nav.getByRole("button", { name: "Next" })).toBeDisabled();
  expect(await seriousViolations(page, ".docs-preview")).toEqual([]);
});
