// CR-052 · FR-DOC-010 · W-031: overrides stay inside the preview, contrast is re-measured live.
import { test, expect, type Page } from "@playwright/test";
const errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("conductor-theme", "dark"));
  await page.goto("/#/tokens/playground");
  await expect(page.getByRole("heading", { name: "Theme playground", exact: true })).toBeVisible();
});
test.afterEach(() => expect(errors).toEqual([]));

const preview = (page: Page) => page.getByRole("region", { name: "Preview" });
const customProperty = (page: Page, selector: string, name: string) => page.locator(selector).first().evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), name);
const summary = (page: Page) => page.locator("p[role=status]");

test("FR-DOC-010 AC-1: a preset recolours the preview only, through component tokens too", async ({ page }) => {
  const shellAccent = await customProperty(page, "html", "--cdt-accent");
  await page.getByRole("button", { name: "Teal", exact: true }).click();
  await expect(page.getByRole("button", { name: "Teal", exact: true })).toHaveAttribute("aria-pressed", "true");
  const deploy = preview(page).getByRole("button", { name: "Deploy", exact: true });
  await expect(deploy).toHaveCSS("background-color", "rgb(20, 184, 166)");
  expect(await customProperty(page, "html", "--cdt-accent")).toBe(shellAccent);
  await page.getByRole("combobox", { name: "Radius scale" }).click();
  await page.getByRole("option", { name: "Sharp (0×)" }).click();
  await expect(deploy).toHaveCSS("border-top-left-radius", "0px");
  await page.getByRole("switch", { name: "Compact controls" }).click();
  await expect(deploy).toHaveClass(/cdt-btn--sm/);
});

test("FR-DOC-010 AC-2: contrast is re-measured as the accent changes", async ({ page }) => {
  await expect(summary(page)).toHaveText("All 9 accent pairs pass WCAG 2.1 AA.");
  const accent = page.getByRole("textbox", { name: "Accent", exact: true });
  await accent.fill("#30385a");
  await expect(summary(page)).toHaveText(/^\d of 9 accent pairs fail WCAG 2\.1 AA\.$/);
  const row = page.getByRole("row").filter({ hasText: "CP-009" });
  await expect(row).toContainText("Fail");
  await expect(row).toContainText("was 5.60");
});

test("FR-DOC-010 AC-3: the override snippet lists the changed custom properties", async ({ page }) => {
  await expect(page.locator(".cdt-code-block, pre").first()).toContainText("No overrides");
  await page.getByRole("button", { name: "Violet", exact: true }).click();
  const code = page.locator("pre").first();
  await expect(code).toContainText('[data-cdt-theme="dark"] {');
  await expect(code).toContainText("--cdt-accent: #8b5cf6;");
  await expect(code).toContainText("--cdt-button-primary-background: #8b5cf6;");
  await expect(page.getByRole("button", { name: "Copy CSS" })).toBeVisible();
});

test("FR-DOC-010 AC-4: an invalid accent is reported and not applied; reset restores the theme", async ({ page }) => {
  const accent = page.getByRole("textbox", { name: "Accent", exact: true });
  const before = await customProperty(page, ".docs-playground__preview", "--cdt-accent");
  await accent.fill("#12");
  await expect(accent).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a colour as #rrggbb.", { exact: true })).toBeVisible();
  expect(await customProperty(page, ".docs-playground__preview", "--cdt-accent")).toBe(before);
  await page.getByRole("button", { name: "Rose", exact: true }).click();
  await page.getByRole("button", { name: "Reset dark theme" }).click();
  await expect(accent).toHaveValue(before);
  await expect(summary(page)).toHaveText("All 9 accent pairs pass WCAG 2.1 AA.");
});

test("FR-DOC-010 AC-1: each theme keeps its own settings", async ({ page }) => {
  await page.getByRole("button", { name: "Amber", exact: true }).click();
  await page.locator("#docs-theme-switch").click();
  await expect(page.getByText("Editing the light theme.", { exact: false })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Accent", exact: true })).not.toHaveValue("#d97706");
});
