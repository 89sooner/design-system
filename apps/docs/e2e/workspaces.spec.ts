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
  await expect(page.getByRole("heading", { name: "검색 워크벤치", exact: true })).toBeVisible();
  const input = page.getByRole("searchbox", { name: "제목 검색" });
  await input.fill("검색");
  await input.dispatchEvent("compositionstart");
  await input.dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true });
  await expect(page).not.toHaveURL(/q=/);
  await input.dispatchEvent("compositionend");
  await page.getByRole("button", { name: "검색", exact: true }).click();
  await expect(page).toHaveURL(/q=/);
  await page.getByRole("button", { name: "이어 보기", exact: true }).click();
  await expect(page.getByText("현재 로드된 25개", { exact: true })).toBeVisible();
  const trigger = page.getByRole("button", { name: /PR \d+ 미리보기/ }).nth(12);
  const label = await trigger.getAttribute("aria-label");
  await trigger.click();
  await page.getByRole("button", { name: "선택한 미리보기로 이동", exact: true }).click();
  const region = page.getByRole("region", { name: "선택한 변경" });
  await expect(region).toBeFocused();
  mkdirSync(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/workbench-selected.png`, fullPage: true });
  await region.getByRole("button", { name: "상세 읽기", exact: true }).click();
  await page.getByRole("button", { name: "상세 닫기", exact: true }).click();
  await expect(region.getByRole("button", { name: "상세 읽기", exact: true })).toBeFocused();
  await region.getByRole("tab", { name: "변경 경로", exact: true }).click();
  await region.getByText("packages", { exact: true }).click();
  await region.getByRole("button", { name: "search/test/검색-조건.test.ts", exact: true }).click();
  await expect(region.getByRole("status").last()).toHaveText("선택한 경로: test");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: label!, exact: true })).toBeFocused();
  await expect(page.getByText("현재 로드된 25개", { exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.has("cursor")).toBe(false);
  await page.reload();
  await expect(input).toHaveValue("검색");
});

test("FR-CMP-010 filters, disabled option, local full-input sort and settings", async ({ page }) => {
  await page.goto("/#/examples/workbench");
  const combo = page.getByRole("combobox", { name: "저장소", exact: true });
  await combo.fill("atlas/indexer"); await combo.press("ArrowDown"); await combo.press("Enter");
  await expect(page.getByRole("button", { name: "저장소 필터 제거" })).toBeVisible();
  await page.getByRole("button", { name: "상태 필터", exact: true }).click();
  await page.getByRole("checkbox", { name: "Open", exact: true }).click();
  await expect(page).toHaveURL(/state=open/);
  await page.getByRole("button", { name: "표 설정", exact: true }).click();
  await page.getByLabel("행 밀도").selectOption("comfortable");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "표 설정", exact: true })).toBeFocused();
  await expect(page.locator(".cdt-data-table")).toHaveAttribute("data-density", "comfortable");
  await page.getByRole("button", { name: /PR ↓/ }).click();
  await expect(page.locator("th[aria-sort]")).toHaveAttribute("aria-sort", "ascending");
});

test("FR-CMP-011 graph/list direction, evidence, view preservation", async ({ page }) => {
  await page.goto("/#/examples/relations");
  await page.getByRole("button", { name: "관계 선택: r-revert", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("합성 되돌림 메시지");
  await page.getByRole("button", { name: "확대", exact: true }).click();
  const viewBox = await page.locator("svg.cdt-relation__canvas").getAttribute("viewBox");
  await page.getByRole("combobox", { name: "관계 유형", exact: true }).selectOption("references");
  await expect(page.locator("svg.cdt-relation__canvas")).toHaveAttribute("viewBox", viewBox!);
  await expect(page.locator(".cdt-relation__detail")).toContainText("합성 되돌림 메시지");
  await page.getByRole("button", { name: "전체 보기", exact: true }).click();
  await page.getByRole("combobox", { name: "관계 유형", exact: true }).selectOption("");
  await page.getByRole("button", { name: "관계 선택: r-unresolved", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("미해결");
  await page.getByRole("button", { name: "관계 선택: r-stack", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("해제됨");
  mkdirSync(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/relation-evidence.png`, fullPage: true });
  await page.getByRole("button", { name: "관계 선택: r-pick", exact: true }).click();
  await expect(page.locator(".cdt-relation__detail")).toContainText("모호함");
  await page.getByRole("link", { name: "동일 정보 목록으로 이동" }).click();
  await expect(page.getByRole("region", { name: "관계 대체 목록" })).toBeFocused();
  await expect(page).toHaveURL(/examples\/relations/);
});

test("FR-CMP-012 receipt is not index completion; action permission and feedback", async ({ page }) => {
  await page.goto("/#/examples/operations");
  await page.getByRole("checkbox", { name: "합성 실행 권한", exact: true }).uncheck();
  await expect(page.getByRole("button", { name: "합성 처리 재시도", exact: true })).toBeDisabled();
  await page.getByRole("checkbox", { name: "합성 실행 권한", exact: true }).check();
  await page.getByRole("button", { name: "합성 처리 재시도", exact: true }).click();
  await expect(page.getByText("합성 재시도 요청 1건 기록 · 운영 요청 없음", { exact: true })).toBeVisible();
  await expect(page.getByText("지연", { exact: true })).toBeVisible();
  mkdirSync(evidence, { recursive: true });
  await page.screenshot({ path: `${evidence}/operations-retry.png`, fullPage: true });
  await page.getByLabel("운영 예제 상태").selectOption("partial");
  await expect(page.getByText("미확인", { exact: true })).toBeVisible();
});

for (const [width, theme] of [[360, "dark"], [360, "light"], [768, "dark"], [768, "light"], [1280, "dark"], [1280, "light"], [1536, "dark"], [1536, "light"]] as const) {
  test(`FR-QA-003 synthetic workspaces ${width} ${theme}`, async ({ page }) => {
    mkdirSync(evidence, { recursive: true });
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["workbench", "relations", "operations"]) {
      await page.goto(`/#/examples/${route}`);
      await page.evaluate(value => { document.documentElement.dataset.cdtTheme = value; }, theme);
      await expect(page.getByRole("heading", { name: ({ workbench: "검색 워크벤치", relations: "관계 탐색기", operations: "수집 운영 상태" } as Record<string, string>)[route]!, exact: true })).toBeVisible();
      if (route === "relations") await expect(page.locator(".cdt-relation__canvas")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.addScriptTag({ content: axe.source });
      const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa"] })).violations.filter(v => v.impact === "serious" || v.impact === "critical").map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      expect(violations).toEqual([]);
      await page.screenshot({ path: `${evidence}/${route}-${theme}-${width}.png`, fullPage: true });
    }
  });
}

test("FR-CMP-010~012 state matrix and reduced motion/200% text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [route, label] of [["workbench", "검색 예제 상태"], ["relations", "관계 예제 상태"], ["operations", "운영 예제 상태"]]) {
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
    await expect(page.getByRole("heading", { name: "검색 워크벤치", exact: true })).toBeVisible();
    const start = Date.now();
    await page.getByRole("combobox", { name: "합성 입력", exact: true }).selectOption(String(count));
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
  await page.getByRole("button", { name: "300개 노드 실험", exact: true }).click();
  await expect(page.locator("[data-node-id]")).toHaveCount(300);
  const renderMs = Date.now() - start;
  const selectStart = Date.now();
  await page.getByRole("button", { name: "관계 선택: synthetic-edge:299", exact: true }).click();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  measurements.push({ input: "300 nodes / 300 cyclic edges", renderMs, selectionMs: Date.now() - selectStart, dom: await page.locator("main *").count() });
  mkdirSync(evidence, { recursive: true });
  writeFileSync(`${evidence}/performance.json`, JSON.stringify({ method: "Production docs; Playwright action through two animation frames; includes automation overhead; no before-implementation speed claim", measurements }, null, 2));
});
