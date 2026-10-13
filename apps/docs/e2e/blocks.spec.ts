// CR-051 · FR-DOC-009 · W-063~W-065: block examples on synthetic data, never a network API.
import { test, expect } from "@playwright/test";
const errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("conductor-theme", "dark"));
});
test.afterEach(() => expect(errors).toEqual([]));

test("FR-DOC-009 AC-1: each empty state names its reason and next action", async ({ page }) => {
  await page.goto("/#/examples/empty-states");
  await page.getByRole("button", { name: "Create your first project", exact: true }).click();
  await expect(page.getByText("atlas-web", { exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Created synthetic project atlas-web" })).toBeVisible();
  await page.getByRole("button", { name: "Clear search filter", exact: true }).click();
  await expect(page.getByText("Showing all 12 with no filters.", { exact: true })).toBeVisible();
  const exportButton = page.getByRole("button", { name: "Export logs" });
  await expect(exportButton).toBeDisabled();
  await expect(exportButton).toHaveAccessibleDescription("You need permission to view audit logs.");
  await expect(page.getByText("You need permission to view audit logs.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "no network request" })).toBeVisible();
});

test("FR-DOC-009 AC-2: filters show as removable chips, the count is announced, sort is exposed", async ({ page }) => {
  await page.goto("/#/examples/filter-table");
  // The info Banner is a status region too; the count is the paragraph one.
  const count = page.locator("p[role=status]");
  await expect(count).toHaveText("Showing all 12");
  await page.getByRole("searchbox", { name: "Search services" }).fill("search");
  await expect(count).toHaveText("Showing 2 of 12");
  await expect(page.getByRole("group", { name: "Applied filters" })).toContainText("Search: search");
  await page.getByRole("combobox", { name: "Status" }).click();
  await page.getByRole("option", { name: "Awaiting approval" }).click();
  await expect(count).toHaveText("Showing 0 of 12");
  await expect(page.getByText("No deployments match these filters", { exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("button", { name: "Remove status filter" }).click();
  await expect(count).toHaveText("Showing 2 of 12");
  await page.getByRole("button", { name: "Clear all filters", exact: true }).click();
  await expect(count).toHaveText("Showing all 12");
  await expect(page.getByRole("searchbox", { name: "Search services" })).toBeFocused();
  const header = page.getByRole("columnheader", { name: "Duration" });
  await expect(header).toHaveAttribute("aria-sort", "descending");
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  const first = await page.locator("tbody tr").first().locator("td").last().textContent();
  const last = await page.locator("tbody tr").last().locator("td").last().textContent();
  expect(Number.parseInt(first!, 10)).toBeLessThanOrEqual(Number.parseInt(last!, 10));
});

test("FR-DOC-009 AC-3: errors sit by the field and in a focused summary; unsaved changes are counted", async ({ page }) => {
  await page.goto("/#/examples/settings-form");
  const name = page.getByRole("textbox", { name: "Project name" });
  await expect(page.getByText("No unsaved changes", { exact: true })).toBeVisible();
  await name.fill("");
  await expect(page.getByText("1 unsaved change", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Couldn't save · 1 error")).toBeVisible();
  await expect(page.locator(".docs-settings-form__summary")).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("link", { name: /Project name: Enter a project name/ }).click();
  await expect(name).toBeFocused();
  await name.fill("atlas-console");
  await page.getByRole("switch", { name: "Email alerts for failed deployments" }).click();
  await expect(page.getByText("2 unsaved changes", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Synthetic save complete · 2 changes" })).toBeVisible();
  await expect(page.getByText("No unsaved changes", { exact: true })).toBeVisible();
});

test("FR-DOC-009 AC-4: a destructive action confirms in a dialog and returns focus", async ({ page }) => {
  await page.goto("/#/examples/settings-form");
  const trigger = page.getByRole("button", { name: "Delete project", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Delete project atlas-web?" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Logged 1 synthetic delete request" })).toBeVisible();
});
