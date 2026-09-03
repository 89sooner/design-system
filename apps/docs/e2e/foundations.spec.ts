// Refs: WP-019 FR-DOC-002 FR-TOK-005 FR-TOK-007 FR-TOK-009 FR-CSS-003 FR-CSS-005
import { expect, test, type Page } from "@playwright/test";
import { docsPath } from "./routes";

test("FR-DOC-002 AC-1 through AC-3: Foundation screens read the complete generated token artifact", async ({ page }) => {
  await page.goto(docsPath("/foundations/color"));
  const table = page.getByRole("table", { name: "Foundation tokens" });
  await expect(page.getByRole("heading", { name: "Color" })).toBeVisible();
  await expect(table).toContainText("surface.base");
  await expect(table).toContainText("Application background");
  for (const key of ["status.queued", "status.running", "status.waiting", "status.success", "status.partial", "status.danger", "status.neutralEnd", "severity.read", "severity.write", "severity.destructive", "severity.blocked", "meter.normal", "meter.warning", "meter.exceeded"]) {
    await expect(table.getByText(key, { exact: true })).toBeVisible();
  }
  await expect(table).not.toContainText("slate.50");

  for (const [path, heading] of [["/foundations/typography", "Typography"], ["/foundations/spacing", "Spacing & Layout"], ["/foundations/elevation", "Radius & Elevation"], ["/foundations/motion", "Motion"]] as const) {
    await page.goto(docsPath(path));
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole("table", { name: "Foundation tokens" })).toHaveCount(1);
  }
});

test("FR-TOK-007 AC-1, AC-2, AC-4: typography shows the seven-step scale and responsive heading", async ({ page }) => {
  await page.goto(docsPath("/foundations/typography"));
  const table = page.getByRole("table", { name: "Foundation tokens" });
  for (const step of ["2xs", "xs", "sm", "base", "md", "lg", "xl"]) {
    await expect(table.getByText(`font.size.${step}`, { exact: true })).toBeVisible();
    await expect(table.getByText(`font.lineHeight.${step}`, { exact: true })).toBeVisible();
  }
  const heading = page.locator(".docs-type-example");
  await expect(heading).toBeVisible();
  const values = await heading.evaluate((element) => ({
    computedSize: Number.parseFloat(getComputedStyle(element).fontSize),
    token: getComputedStyle(document.documentElement).getPropertyValue("--cdt-page-heading-size").trim(),
  }));
  expect(values.computedSize).toBeGreaterThanOrEqual(20);
  expect(values.token).toMatch(/^clamp\(/);
});

test("FR-CSS-003 AC-2, AC-3: live layout examples collapse at md and sm", async ({ page }) => {
  const columns = async (selector: string) => page.locator(selector).evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(docsPath("/foundations/spacing"));
  for (const key of ["breakpoint.sm", "breakpoint.md", "breakpoint.lg"]) {
    await expect(page.getByRole("table", { name: "Foundation tokens" }).getByText(key, { exact: true })).toBeVisible();
  }
  expect(await columns('[data-layout-example="split"]')).toBeGreaterThan(1);
  expect(await columns('[data-layout-example="card-grid"]')).toBeGreaterThan(1);

  await page.setViewportSize({ width: 780, height: 900 });
  expect(await columns('[data-layout-example="split"]')).toBe(1);
  await page.setViewportSize({ width: 520, height: 900 });
  expect(await columns('[data-layout-example="card-grid"]')).toBe(1);
});

test("FR-THM-002 AC-4: elevation previews expose different values per theme", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("conductor-theme", "dark"));
  await page.goto(docsPath("/foundations/elevation"));
  const row = page.getByRole("row").filter({ hasText: "elevation.overlay" });
  const darkValue = await row.locator("code").last().textContent();
  await page.getByRole("switch", { name: "Use light theme" }).click();
  const lightValue = await row.locator("code").last().textContent();
  expect(darkValue).not.toBe(lightValue);
});

interface MotionState {
  readonly buttonHover: Record<string, string>;
  readonly buttonFocus: Record<string, string>;
  readonly switchSelected: Record<string, string>;
}

async function captureMotionStates(page: Page, reducedMotion: "reduce" | "no-preference"): Promise<MotionState> {
  await page.emulateMedia({ reducedMotion });
  await page.goto(docsPath("/foundations/motion"));
  const button = page.locator('[data-motion-target="button"]');
  const selectedSwitch = page.locator('[data-motion-target="switch"]');
  const read = async (selector: typeof button) => selector.evaluate((element) => {
    const style = getComputedStyle(element);
    return { backgroundColor: style.backgroundColor, borderColor: style.borderColor, boxShadow: style.boxShadow, color: style.color, transform: style.transform };
  });
  await button.hover();
  await page.waitForTimeout(reducedMotion === "reduce" ? 50 : 400);
  const buttonHover = await read(button);
  await button.focus();
  await page.waitForTimeout(reducedMotion === "reduce" ? 50 : 400);
  const buttonFocus = await read(button);
  const switchSelected = await read(selectedSwitch);
  return { buttonHover, buttonFocus, switchSelected };
}

test("FR-CSS-005 AC-1 through AC-3: reduced motion shows zero durations without changing final states", async ({ page }) => {
  const normal = await captureMotionStates(page, "no-preference");
  const reduced = await captureMotionStates(page, "reduce");
  expect(reduced).toEqual(normal);

  await expect(page.getByText("Reduced motion is enabled; final component states remain unchanged.")).toBeVisible();
  for (const value of await page.locator("[data-motion-value]").allTextContents()) expect(value).toMatch(/^0s\b/);
  // toBeVisible()은 1×1px로 잘린 상자도 "보인다"고 판정한다 — 계산값과 상자 크기로 노출을 건다 (DEV-029).
  const spinnerLabel = page.locator(".cdt-spinner__label");
  await expect(spinnerLabel).toBeVisible();
  expect(
    await spinnerLabel.evaluate((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return { position: style.position, clip: style.clip, revealed: box.width > 1 && box.height > 1 };
    }),
  ).toEqual({ position: "static", clip: "auto", revealed: true });
  await expect(page.getByText("64%", { exact: true })).toBeVisible();
  const computed = await page.locator('[data-motion-target="button"]').evaluate((element) => ({
    animationDuration: getComputedStyle(element).animationDuration,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    transitionDuration: getComputedStyle(element).transitionDuration,
  }));
  expect(computed.transitionDuration).toMatch(/^(?:0s)(?:, 0s)*$/);
  expect(computed.animationDuration).toBe("0s");
  expect(computed.scrollBehavior).toBe("auto");
});
