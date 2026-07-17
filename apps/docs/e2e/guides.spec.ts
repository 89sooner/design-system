// Refs: WP-022 FR-DOC-006 FR-DOC-007 FR-A11Y-003 FR-QA-003
import { expect, test } from "@playwright/test";

test("SCN-001 / QA-015 through QA-018: Getting Started documents the complete consumer path", async ({ page }) => {
  await page.goto("/getting-started");
  const headings = await page.locator("h2").allTextContents();
  expect(headings.indexOf("Install")).toBeLessThan(headings.indexOf("Import the stylesheet"));
  expect(headings.indexOf("Import the stylesheet")).toBeLessThan(headings.indexOf("Choose a theme"));
  expect(headings.indexOf("Choose a theme")).toBeLessThan(headings.indexOf("Render a component"));
  await expect(page.getByText("development builds warn once in the console", { exact: false })).toBeVisible();
  await expect(page.getByText("Components avoid browser globals during server rendering", { exact: false })).toBeVisible();
  await expect(page.getByText('@layer cdt.reset, cdt.base, cdt.layout, cdt.component, cdt.utility;', { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Render a component" }).locator("..").locator(".cdt-code-block")).toContainText('return <Button variant="primary">Save changes</Button>');
});

test("FR-DOC-007 and FR-A11Y-003: patterns show real recommended and prohibited examples", async ({ page }) => {
  await page.goto("/patterns");
  await expect(page.getByRole("heading", { name: "Patterns" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Status usage" })).toContainText("neutralEnd");
  await expect(page.getByRole("table", { name: "Severity usage" })).toContainText("blocked");
  await expect(page.getByText("Reason: A color-only marker is not distinguishable in grayscale or by assistive technology.")).toBeVisible();
  await expect(page.getByText("Use Dialog for a focused confirmation or short task.")).toBeVisible();
});

test("FR-QA-003 AC-4: accessibility page exposes contrast evidence and axe allow list", async ({ page }) => {
  await page.goto("/accessibility");
  await expect(page.getByRole("heading", { name: "Accessibility" })).toBeVisible();
  await expect(page.getByText(/checks passed/)).toBeVisible();
  await expect(page.getByText("No axe exceptions are currently allowed.")).toBeVisible();
  await expect(page.getByText("Focus returns to the trigger after an overlay closes.")).toBeVisible();
});

test("FR-DOC-004 exception / QA-194: accessibility falls back when contrast metrics are unavailable", async ({ page }) => {
  await page.goto("/accessibility?metrics-unavailable");
  await expect(page.getByText("Contrast metrics are unavailable.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keyboard paths" })).toBeVisible();
});

test("FR-DOC-006 AC-1, AC-2: code copy announces success then restores the label", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/components/Button");
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.getByRole("button", { name: "복사됨" })).toBeVisible();
  await expect(page.getByText("복사됨").last()).toHaveAttribute("aria-live", "polite");
  await page.waitForTimeout(2100);
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
});

test("FR-DOC-006 AC-3: unavailable clipboard keeps code selectable and disables copy", async ({ page }) => {
  await page.goto("/components/Button?clipboard-unavailable");
  await expect(page.getByRole("button", { name: "Copy code" })).toBeDisabled();
  await expect(page.locator(".cdt-code-block")).toContainText('import { Button } from "@conductor-by-89soone/react";');
});

test("FR-DOC-006 exception / QA-197: rejected clipboard writes use the inline failure state", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("permission denied")) },
    });
  });
  await page.goto("/components/Button");
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.getByRole("button", { name: "복사할 수 없음" })).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});
