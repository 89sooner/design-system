// Refs: WP-026 CR-068 FR-QA-004 AC-1 AC-2 AC-4 AC-5 JOB-CI-003 FR-CSS-005 AC-1
import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { docsPath } from "../e2e/routes";

/**
 * Every public component, in catalog order. The catalog generator writes this list from the package,
 * so a new component has no baseline until one is committed and the run fails on the missing snapshot.
 */
const PUBLIC_COMPONENTS = (JSON.parse(readFileSync(new URL("../src/generated/component-meta.json", import.meta.url), "utf8")) as { name: string }[]).map((entry) => entry.name);
const themes = ["dark", "light"] as const;

/** One instant for every run: the DatePicker calendar and any relative copy must not drift with the wall clock. */
const FIXED_NOW = new Date("2026-10-14T10:00:00Z");

/**
 * Components whose preview opens a layer the resting tile never shows (CR-068). Each entry opens it the way a
 * person would and returns the layer itself, so the open-state snapshot covers the surface, border and elevation.
 */
const OPEN_STATES: Readonly<Record<string, (page: Page, preview: Locator) => Promise<Locator>>> = {
  Dialog: async (page, preview) => {
    await preview.getByRole("button", { name: "Open dialog" }).click();
    return page.getByRole("dialog", { name: "Promote to production?" });
  },
  AlertDialog: async (page, preview) => {
    await preview.getByRole("button", { name: "Delete workspace" }).click();
    return page.getByRole("alertdialog");
  },
  Drawer: async (page, preview) => {
    await preview.getByRole("button", { name: "Open drawer" }).click();
    return page.getByRole("dialog", { name: "Drawer" });
  },
  Tooltip: async (page, preview) => {
    // The glass tooltip opens over the preview's label bar, and backdrop blur of that text rasterises
    // differently across GPU stacks (CI moved 38 pixels). Hide the bar so plain surface sits behind the glass;
    // it holds no focus, so the tooltip stays open.
    await page.addStyleTag({ content: ".docs-stage__bar { visibility: hidden; }" });
    await preview.getByRole("button", { name: "Tooltip trigger" }).focus();
    return page.locator(".cdt-tooltip");
  },
  DropdownMenu: async (page, preview) => {
    await preview.getByRole("button", { name: "Menu trigger" }).click();
    return page.getByRole("menu");
  },
  ContextMenu: async (page, preview) => {
    await preview.locator(".docs-context-area").click({ button: "right", position: { x: 24, y: 24 } });
    return page.getByRole("menu");
  },
  Popover: async (page, preview) => {
    await preview.getByRole("button", { name: "Show filter help" }).click();
    return page.getByRole("dialog", { name: "Filter help" });
  },
  Select: async (page, preview) => {
    await preview.getByRole("combobox").click();
    return page.getByRole("listbox");
  },
  Combobox: async (page, preview) => {
    await preview.getByRole("combobox").click();
    await page.keyboard.press("ArrowDown");
    return page.getByRole("listbox");
  },
  DatePicker: async (page, preview) => {
    await preview.locator(".cdt-date-picker").click();
    return page.locator(".cdt-date-picker__popover");
  },
  CommandPalette: async (page, preview) => {
    await preview.getByRole("button", { name: "Open command palette" }).click();
    return page.getByRole("dialog");
  },
  Toast: async (page, preview) => {
    await preview.getByRole("button", { name: "Show notification" }).click();
    return page.locator(".cdt-toast");
  },
};

async function openPage(page: Page, path: string, theme: (typeof themes)[number]): Promise<void> {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem("conductor-theme", selectedTheme);
    document.documentElement.dataset.cdtTheme = selectedTheme;
  }, theme);
  await page.goto(docsPath(path));
}

async function openPreview(page: Page, component: string, theme: (typeof themes)[number]): Promise<Locator> {
  await openPage(page, `/components/${component}`, theme);
  const preview = page.locator(".docs-preview");
  await expect(preview).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return preview;
}

const SNAPSHOT = { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.01 } as const;

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    for (const component of PUBLIC_COMPONENTS) {
      test(`FR-QA-004 AC-1, AC-2: ${component} visual baseline`, async ({ page }) => {
        const preview = await openPreview(page, component, theme);

        if (process.env.CONDUCTOR_VISUAL_FIXTURE === "diff" && theme === "dark" && component === "Button") {
          await page.addStyleTag({ content: ".cdt-btn { filter: invert(1); }" });
        }

        await expect(preview).toHaveScreenshot(`${component}-${theme}.png`, SNAPSHOT);
      });
    }

    for (const [component, open] of Object.entries(OPEN_STATES)) {
      test(`FR-QA-004 AC-5: ${component} open-state visual baseline`, async ({ page }) => {
        const preview = await openPreview(page, component, theme);
        const layer = await open(page, preview);
        await expect(layer).toBeVisible();
        await expect(layer).toHaveScreenshot(`${component}-open-${theme}.png`, SNAPSHOT);
      });
    }
  });
}

/**
 * Components whose state forced colours (Windows high contrast) used to erase: the checked mark, the selected
 * item, the current step or page, the meter's fill (CR-071). Forced colours replace the whole palette, so one
 * dark-scheme pass stands for both themes.
 */
const FORCED_STATES = ["Switch", "Checkbox", "RadioGroup", "ToggleGroup", "Pagination", "Tabs", "Timeline", "NavList", "Meter"] as const;

test.describe("forced colours", () => {
  for (const component of FORCED_STATES) {
    test(`CR-071 FR-QA-004 AC-6: ${component} forced-colours baseline`, async ({ page }) => {
      const preview = await openPreview(page, component, "dark");
      await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce", forcedColors: "active" });
      await expect(preview).toHaveScreenshot(`${component}-forced-colors.png`, SNAPSHOT);
    });
  }
});

test("CR-068 FR-QA-004 AC-5: every overlay with an open state is a public component", () => {
  expect(Object.keys(OPEN_STATES).filter((name) => !PUBLIC_COMPONENTS.includes(name))).toEqual([]);
});

test("CR-071 FR-QA-004 AC-6: every forced-colours baseline is a public component", () => {
  expect(FORCED_STATES.filter((name) => !PUBLIC_COMPONENTS.includes(name))).toEqual([]);
});

test("FR-CSS-005 AC-1: reduced-motion durations resolve to zero in Chromium", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(docsPath("/components/Button"));
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

test("FR-A11Y-003 AC-4: every public component remains identifiable in grayscale", async ({ page }) => {
  await openPage(page, "/components", "dark");
  await expect(page.locator(".docs-component-tile")).toHaveCount(PUBLIC_COMPONENTS.length);
  await page.addStyleTag({ content: "#root { filter: grayscale(1); }" });
  await expect(page.locator("#root")).toHaveCSS("filter", "grayscale(1)");
  // The catalog's first layout settles one pixel after its previews mount. Wait
  // for that mount pass before Playwright begins its own screenshot stability loop.
  await page.waitForTimeout(600);
  // Chromium's full-page extent alternates by one pixel on the long filtered
  // catalog in CI. Add only trailing space to a stable 100px canvas boundary;
  // keep every component visible and retain the existing pixel-diff threshold.
  await page.evaluate(() => {
    const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    document.documentElement.style.minHeight = `${Math.ceil(height / 100) * 100}px`;
  });
  await expect(page).toHaveScreenshot("AllComponents-grayscale-dark.png", { ...SNAPSHOT, fullPage: true });
});

test("FR-CMP-004 AC-5 / FR-A11Y-003 AC-4: status and severity labels remain distinct in grayscale", async ({ page }) => {
  await openPage(page, "/guidelines", "dark");
  for (const label of ["queued", "running", "waiting", "success", "partial", "danger", "neutralEnd", "read", "write", "destructive", "blocked"]) {
    await expect(page.getByRole("cell", { name: label, exact: true }).first()).toBeVisible();
  }
  await page.addStyleTag({ content: "#root { filter: grayscale(1); }" });
  await expect(page.locator("#root")).toHaveCSS("filter", "grayscale(1)");
  await expect(page.getByRole("table", { name: "Status usage" })).toHaveScreenshot("Statuses-grayscale-dark.png", SNAPSHOT);
  await expect(page.getByRole("table", { name: "Severity usage" })).toHaveScreenshot("Severities-grayscale-dark.png", SNAPSHOT);
});
