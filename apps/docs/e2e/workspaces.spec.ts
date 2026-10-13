// CR-041 · FR-CMP-010~013 · WP-029~032: synthetic UI, never an operational API.
import { test, expect } from "@playwright/test";
import axe from "axe-core";
import { mkdirSync, writeFileSync } from "node:fs";
const evidence = "/tmp/conductor-evidence";
const errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("conductor-theme", "dark"));
});
test.afterEach(() => expect(errors).toEqual([]));

test("FR-CMP-010 search, IME, stable selection, preview and return", async ({ page }) => {
  await page.goto("/#/examples/workbench");
  await expect(page.getByRole("heading", { name: "Search workbench", exact: true })).toBeVisible();
  const input = page.getByRole("searchbox", { name: "Search titles" });
  // IME 조합 중 Enter는 제출하지 않는다. 실제 CJK 문자로 조합한다(첫 표본 제목에 같은 단어가 있다).
  await input.fill("검색");
  await input.dispatchEvent("compositionstart");
  await input.dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true });
  await expect(page).not.toHaveURL(/q=/);
  await input.dispatchEvent("compositionend");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=/);
  await page.getByRole("button", { name: "Load more", exact: true }).click();
  await expect(page.getByText("25 loaded", { exact: true })).toBeVisible();
  const trigger = page.getByRole("button", { name: /^Preview PR \d+$/ }).nth(12);
  const label = await trigger.getAttribute("aria-label");
  await trigger.click();
  await page.getByRole("button", { name: "Go to selected preview", exact: true }).click();
  const region = page.getByRole("region", { name: "Selected change" });
  await expect(region).toBeFocused();
  mkdirSync(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/workbench-selected.png`, fullPage: true });
  await region.getByRole("button", { name: "Read details", exact: true }).click();
  await page.getByRole("button", { name: "Close details", exact: true }).click();
  await expect(region.getByRole("button", { name: "Read details", exact: true })).toBeFocused();
  await region.getByRole("tab", { name: "Changed paths", exact: true }).click();
  await region.getByText("packages", { exact: true }).click();
  await region.getByRole("button", { name: "search/test/search-filters.test.ts", exact: true }).click();
  await expect(region.getByRole("status").last()).toHaveText("Selected path: test");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: label!, exact: true })).toBeFocused();
  await expect(page.getByText("25 loaded", { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("cursor")).toBe(false);
  await page.reload();
  await expect(input).toHaveValue("검색");
});

test("FR-CMP-010 filters, disabled option, local full-input sort and settings", async ({ page }) => {
  await page.goto("/#/examples/workbench");
  const combo = page.getByRole("combobox", { name: "Repository", exact: true });
  await combo.fill("atlas/indexer"); await combo.press("ArrowDown"); await combo.press("Enter");
  await expect(page.getByRole("button", { name: "Remove repository filter" })).toBeVisible();
  await page.getByRole("button", { name: "Status filter", exact: true }).click();
  await page.getByRole("checkbox", { name: "Open", exact: true }).click();
  await expect(page).toHaveURL(/state=open/);
  await page.getByRole("button", { name: "Table settings", exact: true }).click();
  await page.getByLabel("Row density").selectOption("comfortable");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Table settings", exact: true })).toBeFocused();
  await expect(page.locator(".cdt-data-table")).toHaveAttribute("data-density", "comfortable");
  await page.getByRole("button", { name: /PR ↓/ }).click();
  await expect(page.locator("th[aria-sort]")).toHaveAttribute("aria-sort", "ascending");
});

test("FR-CMP-011 graph/list direction, evidence, view preservation", async ({ page }) => {
  await page.goto("/#/examples/relations");
  await page.getByRole("button", { name: "Select relation: r-revert", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("Synthetic revert message");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  const viewBox = await page.locator("svg.cdt-relation__canvas").getAttribute("viewBox");
  await page.getByRole("combobox", { name: "Relation type", exact: true }).selectOption("references");
  await expect(page.locator("svg.cdt-relation__canvas")).toHaveAttribute("viewBox", viewBox!);
  await expect(page.locator(".cdt-relation__detail")).toContainText("Synthetic revert message");
  await page.getByRole("button", { name: "Fit all", exact: true }).click();
  await page.getByRole("combobox", { name: "Relation type", exact: true }).selectOption("");
  await page.getByRole("button", { name: "Select relation: r-unresolved", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("Unresolved");
  await page.getByRole("button", { name: "Select relation: r-stack", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("Retracted");
  mkdirSync(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/relation-evidence.png`, fullPage: true });
  await page.getByRole("button", { name: "Select relation: r-pick", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("Ambiguous");
  await page.getByRole("link", { name: "Skip to the equivalent list" }).click();
  await expect(page.getByRole("region", { name: "Relation list alternative" })).toBeFocused();
  await expect(page).toHaveURL(/examples\/relations/);
});

test("FR-CMP-012 receipt is not index completion; action permission and feedback", async ({ page }) => {
  await page.goto("/#/examples/operations");
  await page.getByRole("checkbox", { name: "Synthetic run permission", exact: true }).uncheck();
  await expect(page.getByRole("button", { name: "Retry synthetic processing", exact: true })).toBeDisabled();
  await page.getByRole("checkbox", { name: "Synthetic run permission", exact: true }).check();
  await page.getByRole("button", { name: "Retry synthetic processing", exact: true }).click();
  await expect(page.getByText("Logged 1 synthetic retry request · no live request", { exact: true })).toBeVisible();
  await expect(page.getByText("Delayed", { exact: true })).toBeVisible();
  mkdirSync(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/operations-retry.png`, fullPage: true });
  await page.getByLabel("Operations example state").selectOption("partial");
  await expect(page.getByText("Unknown", { exact: true })).toBeVisible();
});

for (const [width, theme] of [[360, "dark"], [360, "light"], [768, "dark"], [768, "light"], [1280, "dark"], [1280, "light"], [1536, "dark"], [1536, "light"]] as const) {
  test(`FR-QA-003 FR-DOC-009 FR-DOC-010 synthetic workspaces, blocks and playground ${width} ${theme}`, async ({ page }) => {
    mkdirSync(evidence, { recursive: true });
    await page.setViewportSize({ width, height: 1000 });
    // CR-051 W-063~W-065 block examples share the same viewport, theme and axe matrix.
    // CR-052 W-031 theme playground joins the same matrix.
    const headings: Record<string, string> = { "examples/workbench": "Search workbench", "examples/relations": "Relation explorer", "examples/operations": "Ingestion status", "examples/empty-states": "Empty states", "examples/filter-table": "Filter table", "examples/settings-form": "Settings form", "tokens/playground": "Theme playground" };
    for (const path of Object.keys(headings)) {
      const route = path.split("/").pop()!;
      await page.goto(`/#/${path}`);
      await page.evaluate(value => { document.documentElement.dataset.cdtTheme = value; }, theme);
      await expect(page.getByRole("heading", { name: headings[path]!, exact: true })).toBeVisible();
      if (route === "relations") await expect(page.locator(".cdt-relation__canvas")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      // Contrast is judged on the settled frame (DEV-047): the docs route fades in (CR-042) and the theme flip
      // above transitions colours, and axe sampling mid-animation reads partial opacity as a contrast failure.
      // Re-query every frame and leave only after 100 ms with no running document-timeline animation, so a late or
      // chained one is waited for too, all within a 2 s bound. Anything still running then, and any paused animation
      // (it can hold content invisible, which axe skips), fails by name. Only the package spinner may keep running:
      // it rotates and never changes what axe measures.
      const unsettled = await page.evaluate(async () => {
        const deadline = performance.now() + 2000;
        const exempt = (animation: Animation) => (animation as CSSAnimation).animationName === "cdt-spin" && ((animation.effect as KeyframeEffect | null)?.target as Element | null)?.closest(".cdt-spinner") != null;
        const live = (state: AnimationPlayState) => document.getAnimations().filter((animation) => animation.playState === state && animation.timeline === document.timeline && !exempt(animation));
        // One frame, or 50 ms when frames stop coming, so the bound holds without requestAnimationFrame too.
        const frame = () => new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 50);
          requestAnimationFrame(() => { clearTimeout(timer); resolve(); });
        });
        let quietSince: number | null = null;
        while (performance.now() < deadline) {
          await frame();
          if (live("running").length > 0) { quietSince = null; continue; }
          quietSince ??= performance.now();
          if (performance.now() - quietSince >= 100) break;
        }
        const label = (animation: Animation) => {
          const effect = animation.effect as KeyframeEffect | null;
          const target = effect?.target as Element | null | undefined;
          const name = (animation as CSSAnimation).animationName ?? (animation as CSSTransition).transitionProperty ?? "animation";
          return `${animation.playState} ${name} on ${target?.getAttribute("class") || target?.tagName.toLowerCase() || "?"}${effect?.pseudoElement ?? ""}`;
        };
        return [...live("running"), ...live("paused")].map(label);
      });
      expect(unsettled).toEqual([]);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"] })).violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      expect(violations).toEqual([]);
      await page.screenshot({ path: `${evidence}/${route}-${theme}-${width}.png`, fullPage: true });
    }
  });
}

test("FR-CMP-010~012 state matrix and reduced motion/200% text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [route, label] of [["workbench", "Search example state"], ["relations", "Relation example state"], ["operations", "Operations example state"]]) {
    await page.goto(`/#/examples/${route}`);
    for (const state of ["loading", "empty", "error", "partial", "long", "ready"]) {
      await page.getByLabel(label!).selectOption(state);
      await expect(page.locator("main")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});


test("FR-CMP-010 FR-CMP-011 bounded-input production measurements", async ({ page }) => {
  const measurements: object[] = [];
  for (const count of [0, 1, 100, 1000]) {
    await page.goto("/#/examples/workbench");
    await expect(page.getByRole("heading", { name: "Search workbench", exact: true })).toBeVisible();
    const start = Date.now();
    await page.getByRole("combobox", { name: "Synthetic input", exact: true }).selectOption(String(count));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const renderMs = Date.now() - start;
    const sortStart = Date.now();
    await page.getByRole("button", { name: /PR [↓↑]/ }).click();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    measurements.push({ input: count, renderMs, sortMs: Date.now() - sortStart, dom: await page.locator("main *").count(), renderedRows: await page.locator(".cdt-data-table tbody tr").count() });
  }
  await page.goto("/#/examples/relations");
  await expect(page.locator(".cdt-relation__canvas")).toBeVisible();
  const start = Date.now();
  await page.getByRole("button", { name: "Try 300 nodes", exact: true }).click();
  await expect(page.locator("[data-node-id]")).toHaveCount(300);
  const renderMs = Date.now() - start;
  const selectStart = Date.now();
  await page.getByRole("button", { name: "Select relation: synthetic-edge:299", exact: true }).click();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  measurements.push({ input: "300 nodes / 300 cyclic edges", renderMs, selectionMs: Date.now() - selectStart, dom: await page.locator("main *").count() });
  mkdirSync(evidence, { recursive: true });
  writeFileSync(`${evidence}/performance.json`, JSON.stringify({ method: "Production docs; Playwright action through two animation frames; includes automation overhead; no before-implementation speed claim", measurements }, null, 2));
});
