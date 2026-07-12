// Refs: WP-020 FR-DOC-003
import { expect, test } from "@playwright/test";

test("FR-DOC-003 AC-1, AC-5: catalog mounts every public component as a live preview", async ({ page }) => {
  await page.goto("/components");
  await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Button Button preview" })).toBeVisible();
  await expect(page.locator("[aria-label$=' preview']")).toHaveCount(27);
});

test("FR-DOC-003 AC-2, AC-3, AC-4: detail route shows generated props and variant-tone preview", async ({ page }) => {
  await page.goto("/components/Button");
  await expect(page.getByRole("heading", { name: "Button" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Button props" })).toContainText("variant");
  await expect(page.getByRole("table", { name: "Button props" })).toContainText("tone");
  await expect(page.locator(".docs-preview .cdt-btn")).toHaveCount(9);
});

test("FR-DOC-003 exception: unknown detail route is isolated as an empty state", async ({ page }) => {
  await page.goto("/components/Unknown");
  await expect(page.getByText("Component not found")).toBeVisible();
});
