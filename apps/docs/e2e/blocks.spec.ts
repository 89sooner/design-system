// CR-051 · FR-DOC-009 · W-063~W-065: block examples on synthetic data, never a network API.
import { test, expect } from "@playwright/test";
const errors: string[] = [];
test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem("conductor-theme", "dark"));
});
test.afterEach(() => expect(errors).toEqual([]));

test("FR-DOC-009 AC-1: each empty state names its reason and next action", async ({ page }) => {
  await page.goto("/#/examples/empty-states");
  await page.getByRole("button", { name: "첫 프로젝트 만들기", exact: true }).click();
  await expect(page.getByText("atlas-web", { exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "합성 프로젝트 atlas-web 생성" })).toBeVisible();
  await page.getByRole("button", { name: "검색 조건 지우기", exact: true }).click();
  await expect(page.getByText("조건 없이 전체 12건을 표시합니다.", { exact: true })).toBeVisible();
  const exportButton = page.getByRole("button", { name: "로그 내보내기" });
  await expect(exportButton).toBeDisabled();
  await expect(exportButton).toHaveAccessibleDescription("감사 로그 열람 권한이 필요합니다.");
  await expect(page.getByText("감사 로그 열람 권한이 필요합니다.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "네트워크 요청 없음" })).toBeVisible();
});

test("FR-DOC-009 AC-2: filters show as removable chips, the count is announced, sort is exposed", async ({ page }) => {
  await page.goto("/#/examples/filter-table");
  // The info Banner is a status region too; the count is the paragraph one.
  const count = page.locator("p[role=status]");
  await expect(count).toHaveText("전체 12건");
  await page.getByRole("searchbox", { name: "서비스 검색" }).fill("search");
  await expect(count).toHaveText("12건 중 2건 표시");
  await expect(page.getByRole("group", { name: "적용한 조건" })).toContainText("검색: search");
  await page.getByRole("combobox", { name: "상태" }).click();
  await page.getByRole("option", { name: "승인 대기" }).click();
  await expect(count).toHaveText("12건 중 0건 표시");
  await expect(page.getByText("조건에 맞는 배포가 없습니다", { exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await page.getByRole("button", { name: "상태 조건 제거" }).click();
  await expect(count).toHaveText("12건 중 2건 표시");
  await page.getByRole("button", { name: "조건 모두 지우기", exact: true }).click();
  await expect(count).toHaveText("전체 12건");
  await expect(page.getByRole("searchbox", { name: "서비스 검색" })).toBeFocused();
  const header = page.getByRole("columnheader", { name: "소요 시간" });
  await expect(header).toHaveAttribute("aria-sort", "descending");
  await header.getByRole("button").click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  const first = await page.locator("tbody tr").first().locator("td").last().textContent();
  const last = await page.locator("tbody tr").last().locator("td").last().textContent();
  expect(Number.parseInt(first!, 10)).toBeLessThanOrEqual(Number.parseInt(last!, 10));
});

test("FR-DOC-009 AC-3: errors sit by the field and in a focused summary; unsaved changes are counted", async ({ page }) => {
  await page.goto("/#/examples/settings-form");
  const name = page.getByRole("textbox", { name: "프로젝트 이름" });
  await expect(page.getByText("저장하지 않은 변경 없음", { exact: true })).toBeVisible();
  await name.fill("");
  await expect(page.getByText("저장하지 않은 변경 1건", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByText("저장하지 못했습니다 · 오류 1건")).toBeVisible();
  await expect(page.locator(".docs-settings-form__summary")).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("link", { name: /프로젝트 이름: 프로젝트 이름을 입력하세요/ }).click();
  await expect(name).toBeFocused();
  await name.fill("atlas-console");
  await page.getByRole("switch", { name: "배포 실패 이메일 알림" }).click();
  await expect(page.getByText("저장하지 않은 변경 2건", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "합성 저장 완료 · 변경 2건" })).toBeVisible();
  await expect(page.getByText("저장하지 않은 변경 없음", { exact: true })).toBeVisible();
});

test("FR-DOC-009 AC-4: a destructive action confirms in a dialog and returns focus", async ({ page }) => {
  await page.goto("/#/examples/settings-form");
  const trigger = page.getByRole("button", { name: "프로젝트 삭제", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "atlas-web 프로젝트를 삭제할까요?" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("dialog").getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "합성 삭제 요청 1건 기록" })).toBeVisible();
});
