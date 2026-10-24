#!/usr/bin/env node
// Refs: WP-027 FR-DX-002 FR-DX-005 ADR-008 ADR-010
// 공개 API 추출 리포트(.api.md)를 커밋된 기준과 대조한다. 리포트가 기준과 다르면
// 파괴 변경 후보이므로 CI가 실패하고, 의도된 변경이라면 `--update`로 기준을 갱신한
// 뒤 그에 맞는 changeset(파괴 변경이면 major + 마이그레이션 노트)을 함께 커밋한다.
// 리포트에 `any`가 나타나도 실패한다 (FR-DX-002 AC-2, NFR-004 지표).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { renderSurface, surfaceDiff } from "./public-surface.mjs";

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

// The surface API Extractor cannot see: entry points, CLI names, `cdt-*` classes, `data-*` selectors and layer
// order (CR-075 FR-DX-006 AC-2, WP-041). Read from the built stylesheets, so it runs after `pnpm build`.
const SURFACE_REPORT = "etc/public-surface.txt";
const PACKAGES = ["tokens", "css", "react"];
const STYLESHEETS = ["index.css", "component.css", "agent.css"];
const missingBuild = STYLESHEETS.filter((file) => !existsSync(resolve(ROOT, "packages/css/dist", file)));
if (missingBuild.length > 0) {
  console.error(`error[SURFACE-BUILD]: packages/css/dist에 ${missingBuild.join(", ")}가 없다. \`pnpm build\` 뒤에 실행한다`);
  process.exit(1);
}
// A CLI's options are read from the usage line it prints for an argument it does not know (exit 3), so
// the baseline holds what the shipped binary accepts rather than a list kept by hand (WP-043, AC-1 ⑦).
const usageOf = (pkg, file) => spawnSync(process.execPath, [resolve(ROOT, "packages", pkg, file), "--cdt-surface-probe"], { encoding: "utf8" }).stderr;
const surface = renderSurface({
  packages: PACKAGES.map((pkg) => {
    const manifest = JSON.parse(readFileSync(resolve(ROOT, "packages", pkg, "package.json"), "utf8"));
    const cliUsage = Object.fromEntries(Object.entries(manifest.bin ?? {}).map(([bin, file]) => [bin, usageOf(pkg, file)]));
    return { name: manifest.name, manifest, cliUsage };
  }),
  stylesheets: STYLESHEETS.map((file) => ({ file: `@conductor-by-89soone/css/${file}`, css: readFileSync(resolve(ROOT, "packages/css/dist", file), "utf8") })),
});
const surfacePath = resolve(ROOT, SURFACE_REPORT);
mkdirSync(dirname(surfacePath), { recursive: true });
if (update) {
  writeFileSync(surfacePath, surface);
} else {
  const baseline = existsSync(surfacePath) ? readFileSync(surfacePath, "utf8") : "";
  if (baseline !== surface) {
    const { removed, added } = surfaceDiff(baseline, surface);
    console.error(`error[SURFACE-DRIFT]: ${SURFACE_REPORT}가 현재 공개 표면과 다르다`);
    for (const entry of removed) console.error(`  - ${entry}`);
    for (const entry of added) console.error(`  + ${entry}`);
    console.error("  의도된 변경이면 `pnpm check:api --update`로 기준을 갱신한다. 지우거나 이름을 바꾼 항목(-)은");
    console.error("  파괴 변경이다: 1.0 이후에는 major changeset과 마이그레이션 노트가 함께 있어야 한다 (FR-DX-006 AC-1, AC-3).");
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`[check:api] ${CONFIGS.length} report(s) and ${SURFACE_REPORT} ${update ? "updated" : "verified"}, \`any\` 0건`);
