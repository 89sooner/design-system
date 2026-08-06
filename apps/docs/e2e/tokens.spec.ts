// Refs: WP-021 FR-DOC-004 FR-A11Y-004
import { expect, test } from "@playwright/test";
import { docsPath } from "./routes";

test("FR-DOC-004 AC-1 through AC-4: token reference filters, compares themes, and reports contrast", async ({ page }) => {
  await page.goto(docsPath("/tokens/reference"));
  const table = page.getByRole("table", { name: "Token reference" });
  await expect(table).toContainText("text.primary");
  await expect(table).toContainText("#f4f7fb");
  await expect(table).toContainText("#0c121c");
  await expect(table).toContainText("pass");
  await expect(table).toContainText("장식 전용");
  await page.getByRole("textbox", { name: "Filter token keys" }).fill("status.danger");
  await expect(table).toContainText("status.danger");
  await expect(table).not.toContainText("text.primary");
});

test("FR-DOC-004 exception: unavailable contrast metrics show the warning and fallback", async ({ page }) => {
  await page.goto(docsPath("/tokens/reference?metrics-unavailable"));
  await expect(page.getByText("대비 검사 결과 파일이 없습니다. 대비율 열은 측정되지 않음으로 표시됩니다.")).toBeVisible();
  await expect(page.getByRole("table", { name: "Token reference" })).toContainText("측정되지 않음");
});
