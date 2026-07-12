import { expect, test } from "@playwright/test";

test("FR-DOC-001 AC-1, AC-3, AC-4: static shell renders without external requests", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") externalRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("main")).toContainText("Conductor Design System");
  await expect(page.locator(".cdt-app-shell .cdt-topbar")).toHaveCount(1);
  await expect(page.locator(".cdt-app-shell .cdt-nav-list")).toHaveCount(1);
  expect(externalRequests).toEqual([]);
});

test("FR-DOC-005 AC-1, AC-2, AC-5: theme switch updates and persists", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("switch", { name: "Toggle color theme" });
  const root = page.locator("html");
  const initialTheme = await root.getAttribute("data-cdt-theme");
  const nextTheme = initialTheme === "dark" ? "light" : "dark";
  await toggle.click();
  await expect(root).toHaveAttribute("data-cdt-theme", nextTheme);
  await page.reload();
  await expect(root).toHaveAttribute("data-cdt-theme", nextTheme);
});

test("FR-DOC-005 exception: blocked localStorage does not prevent the shell from rendering", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get: () => { throw new Error("blocked"); } }));
  await page.goto("/");
  await expect(page.getByRole("main")).toContainText("Conductor Design System");
});

test("QA-012: mobile navigation closes from the overlay and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".cdt-app-shell__overlay").click({ position: { x: 590, y: 400 } });
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("QA-013: skip link moves focus to the AppShell main region", async ({ page }) => {
  await page.goto("/");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});
