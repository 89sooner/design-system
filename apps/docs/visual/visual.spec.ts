// Refs: WP-026 FR-QA-004 AC-1 AC-2 AC-4 JOB-CI-003 FR-CSS-005 AC-1
import { expect, test, type Locator, type Page } from "@playwright/test";

const components = [
  "Button",
  "Card",
  "Badge",
  "Table",
  "Timeline",
  "Dialog",
  "TextField",
  "Select",
  "Switch",
  "Banner",
  "Meter",
  "AppShell",
] as const;
const themes = ["dark", "light"] as const;

async function openComponent(page: Page, component: (typeof components)[number]): Promise<Locator> {
  await page.goto(`/components/${component}`);
  const preview = page.locator(".docs-preview");
  await expect(preview).toBeVisible();

  if (component === "Dialog") {
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Promote to production?" });
    await expect(dialog).toBeVisible();
    return dialog;
  }
  return preview;
}

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    for (const component of components) {
      test(`FR-QA-004 AC-1, AC-2: ${component} visual baseline`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
        await page.addInitScript((selectedTheme) => {
          window.localStorage.setItem("conductor-theme", selectedTheme);
          document.documentElement.dataset.cdtTheme = selectedTheme;
        }, theme);
        const target = await openComponent(page, component);
        await page.evaluate(() => document.fonts.ready);

        if (process.env.CONDUCTOR_VISUAL_FIXTURE === "diff" && theme === "dark" && component === "Button") {
          await page.addStyleTag({ content: ".cdt-btn { filter: invert(1); }" });
        }

        await expect(target).toHaveScreenshot(`${component}-${theme}.png`, {
          animations: "disabled",
          caret: "hide",
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  });
}

test("FR-CSS-005 AC-1: reduced-motion durations resolve to zero in Chromium", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/Button");
  const values = await page.locator(".cdt-btn").first().evaluate((element) => {
    const root = getComputedStyle(document.documentElement);
    const button = getComputedStyle(element);
    return {
      reducedMotionMatches: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      fastToken: root.getPropertyValue("--cdt-motion-fast").trim(),
      transitionDuration: button.transitionDuration,
      animationDuration: button.animationDuration,
    };
  });
  expect(values).toEqual({
    reducedMotionMatches: true,
    fastToken: expect.stringMatching(/^0s\b/),
    transitionDuration: expect.stringMatching(/^(?:0s)(?:, 0s)*$/),
    animationDuration: "0s",
  });
});
