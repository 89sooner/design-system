// Refs: WP-020 FR-DOC-003
import { expect, test } from "@playwright/test";

test("FR-DOC-003 AC-1, AC-5: catalog mounts every public component as a live preview", async ({ page }) => {
  await page.goto("/components");
  await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Button", exact: true })).toBeVisible();
  await expect(page.locator("[aria-label$=' preview']")).toHaveCount(30);
  await expect(page.locator(".cdt-card--interactive .cdt-btn, .cdt-card--interactive input, .cdt-card--interactive a")).toHaveCount(0);
});

test("FR-CSS-004 AC-3 / QA-038: public CSS classes reproduce the React primary Button", async ({ page }) => {
  await page.goto("/components");
  await expect(page.getByRole("heading", { name: "Framework-agnostic CSS" })).toBeVisible();
  const styles = await page.locator('[data-framework-example="react"], [data-framework-example="css"]').evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderRadius: style.borderRadius,
      color: style.color,
      minHeight: style.minHeight,
      padding: style.padding,
    };
  }));
  expect(styles).toHaveLength(2);
  expect(styles[1]).toEqual(styles[0]);
  await expect(page.getByRole("region", { name: "Framework-agnostic CSS" }).locator(".cdt-code-block")).toContainText('class="cdt-btn cdt-btn--primary"');
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

test("FR-DOC-003 exception / QA-195: a preview failure is isolated from the rest of the detail screen", async ({ page }) => {
  await page.goto("/components/Button?preview-error");
  await expect(page.getByText("This preview could not render.")).toBeVisible();
  await expect(page.getByRole("table", { name: "Button props" })).toContainText("variant");
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
});
