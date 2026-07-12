#!/usr/bin/env node
// Refs: WP-027 FR-DX-002 FR-DX-005 ADR-008 ADR-010
// 공개 API 추출 리포트(.api.md)를 커밋된 기준과 대조한다. 리포트가 기준과 다르면
// 파괴 변경 후보이므로 CI가 실패하고, 의도된 변경이라면 `--update`로 기준을 갱신한
// 뒤 그에 맞는 changeset(파괴 변경이면 major + 마이그레이션 노트)을 함께 커밋한다.
// 리포트에 `any`가 나타나도 실패한다 (FR-DX-002 AC-2, NFR-004 지표).
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const update = process.argv.includes("--update");

const CONFIGS = [
  { config: "packages/tokens/api-extractor.json", report: "packages/tokens/etc/tokens.api.md" },
  { config: "packages/tokens/api-extractor.breakpoints.json", report: "packages/tokens/etc/tokens-breakpoints.api.md" },
  { config: "packages/react/api-extractor.json", report: "packages/react/etc/react.api.md" },
];

let failed = false;
for (const entry of CONFIGS) {
  mkdirSync(dirname(resolve(ROOT, entry.report)), { recursive: true });
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(resolve(ROOT, entry.config));
  let result;
  try {
    result = Extractor.invoke(extractorConfig, { localBuild: update, showVerboseMessages: false });
  } catch (error) {
    console.error(`error[API-EXTRACT]: ${entry.config} 추출 중 예외: ${error.message}`);
    failed = true;
    continue;
  }
  if (update) {
    if (!result.succeeded) {
      console.error(`error[API-EXTRACT]: ${entry.config} 추출 실패 (errors ${result.errorCount})`);
      failed = true;
    }
    continue;
  }
  if (result.apiReportChanged) {
    console.error(`error[API-REPORT-DRIFT]: ${entry.report}가 현재 공개 API와 다르다`);
    console.error("  의도된 API 변경이면 `pnpm check:api --update`로 기준을 갱신하고,");
    console.error("  파괴 변경이면 major changeset과 마이그레이션 노트를 함께 커밋한다 (FR-DX-005 AC-1, AC-4).");
    failed = true;
  } else if (!result.succeeded) {
    console.error(`error[API-EXTRACT]: ${entry.config} 추출 실패 (errors ${result.errorCount})`);
    failed = true;
  }
}

if (!failed) {
  for (const entry of CONFIGS) {
    const lines = readFileSync(resolve(ROOT, entry.report), "utf8").split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      if (/\bany\b/.test(lines[index])) {
        console.error(`error[API-ANY]: ${entry.report}:${index + 1} 공개 API에 \`any\`가 노출됐다 (FR-DX-002 AC-2)`);
        failed = true;
      }
    }
  }
}

if (failed) process.exit(1);
console.log(`[check:api] ${CONFIGS.length} report(s) ${update ? "updated" : "verified"}, \`any\` 0건`);
