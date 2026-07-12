// Refs: WP-019 FR-DOC-002
import { expect, test } from "@playwright/test";

test("FR-DOC-002 AC-1, AC-3: Foundations read generated token values", async ({ page }) => {
  await page.goto("/foundations/color");
  await expect(page.getByRole("heading", { name: "Color" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Foundation tokens" })).toContainText("surface.base");
  await expect(page.getByRole("table", { name: "Foundation tokens" })).toContainText("Application background");
  await page.goto("/foundations/typography");
  await expect(page.getByRole("table", { name: "Foundation tokens" })).toContainText("font.size.md");
});

test("FR-DOC-002 AC-2: all Foundation routes are generated from the artifact", async ({ page }) => {
  for (const [path, heading] of [["/foundations/spacing", "Spacing & Layout"], ["/foundations/elevation", "Radius & Elevation"], ["/foundations/motion", "Motion"]] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByRole("table", { name: "Foundation tokens" })).toHaveCount(1);
  }
});
