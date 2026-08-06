// Refs: QA-001 QA-002 QA-005 QA-006 QA-007 QA-008 QA-200
import { expect, test } from "@playwright/test";
import { docsPath } from "./routes";

const screens = [
  ["W-001", "/", "Conductor Design System"],
  ["W-002", "/getting-started", "Getting Started"],
  ["W-010", "/foundations/color", "Color"],
  ["W-011", "/foundations/typography", "Typography"],
  ["W-012", "/foundations/spacing", "Spacing & Layout"],
  ["W-013", "/foundations/elevation", "Radius & Elevation"],
  ["W-014", "/foundations/motion", "Motion"],
  ["W-020", "/components", "Components"],
  ["W-021", "/components/Button", "Button"],
  ["W-030", "/tokens/reference", "Tokens"],
  ["W-040", "/guidelines", "Patterns"],
  ["W-050", "/accessibility", "Accessibility"],
] as const;

for (const theme of ["dark", "light"] as const) {
  for (const width of [560, 800, 1080] as const) {
    test(`QA-001, QA-002, QA-005 through QA-008: ${theme} screens fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((selectedTheme) => window.localStorage.setItem("conductor-theme", selectedTheme), theme);

      for (const [screen, path, heading] of screens) {
        await test.step(screen, async () => {
          await page.goto(docsPath(path));
          await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
          await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", theme);

          const geometry = await page.evaluate(() => {
            const main = document.querySelector("main");
            if (main === null) return null;
            const rect = main.getBoundingClientRect();
            const clipped = Array.from(main.querySelectorAll<HTMLElement>("a, button, input, textarea, [role='switch'], [role='progressbar'], h1, h2"))
              .filter((element) => {
                const style = getComputedStyle(element);
                if (style.display === "none" || style.visibility === "hidden") return false;
                const bounds = element.getBoundingClientRect();
                return bounds.width > 0 && (bounds.left < -1 || bounds.right > window.innerWidth + 1);
              })
              .map((element) => element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName);
            const unsafeOverflow = Array.from(main.querySelectorAll<HTMLElement>(".cdt-table__scroll, .cdt-code-block"))
              .filter((element) => element.scrollWidth > element.clientWidth && !["auto", "scroll"].includes(getComputedStyle(element).overflowX))
              .map((element) => element.className);
            return {
              clipped,
              documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
              mainLeft: rect.left,
              mainRight: rect.right,
              unsafeOverflow,
              viewportWidth: window.innerWidth,
            };
          });

          expect(geometry).not.toBeNull();
          expect(geometry?.documentWidth).toBeLessThanOrEqual(width + 1);
          expect(geometry?.mainLeft).toBeGreaterThanOrEqual(-1);
          expect(geometry?.mainRight).toBeLessThanOrEqual(width + 1);
          expect(geometry?.clipped).toEqual([]);
          expect(geometry?.unsafeOverflow).toEqual([]);
          expect((await page.locator("body").innerText()).toLowerCase()).not.toMatch(/permission denied|session expired|sign in to continue/);

          if (process.env.CONDUCTOR_SCREEN_AUDIT === "1" && theme === "dark" && width === 1080) {
            await page.waitForTimeout(100);
            await page.screenshot({ path: `/tmp/conductor-${screen}.png`, fullPage: false });
          }
        });
      }
    });
  }
}

for (const theme of ["dark", "light"] as const) {
  test(`QA-003, QA-004: ${theme} screen controls follow DOM order and use the focus-ring token`, async ({ page }) => {
    await page.setViewportSize({ width: 1080, height: 900 });
    await page.addInitScript((selectedTheme) => window.localStorage.setItem("conductor-theme", selectedTheme), theme);

    for (const [screen, path, heading] of screens) {
      await test.step(screen, async () => {
        await page.goto(docsPath(path));
        await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
        const count = await page.locator("#content").evaluate((main) => {
          const selector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";
          const focusable = Array.from(main.querySelectorAll<HTMLElement>(selector)).filter((element) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0 && element.closest("[aria-hidden='true']") === null;
          });
          focusable.forEach((element, index) => element.dataset.screenFocusIndex = String(index));
          (main as HTMLElement).focus();
          return focusable.length;
        });

        for (let index = 0; index < count; index += 1) {
          await page.keyboard.press("Tab");
          const focused = page.locator(`[data-screen-focus-index="${index}"]`);
          await expect(focused).toBeFocused();
          const focusStyle = await focused.evaluate((element) => ({
            boxShadow: getComputedStyle(element).boxShadow,
            focusVisible: element.matches(":focus-visible"),
          }));
          expect(focusStyle.focusVisible).toBe(true);
          expect(focusStyle.boxShadow).not.toBe("none");
        }
      });
    }
  });
}
