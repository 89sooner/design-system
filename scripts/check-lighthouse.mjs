#!/usr/bin/env node
// Refs: WP-028 FR-DOC-001 NFR-001 NFR-002 JOB-BUILD-004
// 문서 사이트 정적 산출물(apps/docs/dist)을 서버 런타임 없이 서빙해
//   1. 렌더가 동작하고(FR-DOC-001 AC-3)
//   2. 외부 도메인 네트워크 요청이 0건이며(FR-DOC-001 AC-4, QA-209)
//   3. Lighthouse LCP p75가 예산 이내(NFR-001, 기본 2.5초)
// 임을 검증한다. CONDUCTOR_LH_FIXTURE=1이면 예산을 1ms로 좁혀 게이트가 실제로
// 실패하는지 실증한다.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(ROOT, "apps/docs/dist");
// 7회를 재면 p75(6번째 값)가 느린 실행 1건에 흔들리지 않는다. 러너 소음 때문에
// 게이트가 근거 없이 빨개지는 것을 막는다.
const RUNS = 7;
const LCP_BUDGET_MS = process.env.CONDUCTOR_LH_FIXTURE === "1" ? 1 : 2500;
const CLS_BUDGET = 0.1;

if (!existsSync(join(DIST, "index.html"))) {
  console.error("error[LH-NO-DIST]: apps/docs/dist가 없다. 먼저 `pnpm --filter docs build`를 실행한다.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};

// 정적 파일 + SPA 폴백만 있는 서버. 서버 런타임 로직이 없음이 곧 FR-DOC-001 AC-3의
// 검증 환경이다.
const server = createServer((request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, "http://localhost").pathname)).replace(/^([/\\])+/, "");
  const target = join(DIST, path);
  const file = existsSync(target) && extname(target) !== "" ? target : join(DIST, "index.html");
  try {
    const body = readFileSync(file);
    response.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});

await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const origin = `http://127.0.0.1:${server.address().port}`;

async function freePort() {
  const probe = createServer();
  await new Promise((ready) => probe.listen(0, "127.0.0.1", ready));
  const { port } = probe.address();
  await new Promise((closed) => probe.close(closed));
  return port;
}

// Lighthouse는 CDP 포트에 붙는다. chrome-launcher를 쓰지 않는 이유: WSL에서 프로필
// 경로를 Windows 형식으로 변환해 리눅스 Chrome에 넘기고, Chrome이 그 문자열을 통째로
// 디렉터리 이름 삼아 cwd(=저장소)에 만든다. Playwright가 이미 브라우저를 관리하므로
// 같은 바이너리를 직접 띄우고 포트만 넘긴다.
async function launchChromium() {
  const port = await freePort();
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`, "--no-sandbox"] });
  return { browser, port };
}

let failed = false;
try {
  // ---- 1·2. 렌더 스모크 + 외부 도메인 요청 0건 (FR-DOC-001 AC-3, AC-4)
  const externalRequests = [];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("request", (request) => {
    if (!request.url().startsWith(origin)) externalRequests.push(request.url());
  });
  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  const shellRendered = (await page.locator(".cdt-app-shell").count()) > 0;
  await browser.close();

  if (!shellRendered) {
    console.error("error[LH-RENDER]: 정적 서빙에서 문서 셸(.cdt-app-shell)이 렌더되지 않았다 (FR-DOC-001 AC-3)");
    failed = true;
  }
  if (externalRequests.length > 0) {
    console.error(`error[LH-EXTERNAL-REQUEST]: 외부 도메인 요청 ${externalRequests.length}건 (FR-DOC-001 AC-4, NFR-002)`);
    for (const url of externalRequests) console.error(`  ${url}`);
    failed = true;
  } else {
    console.log("[lighthouse] external network requests: 0 (FR-DOC-001 AC-4)");
  }

  // ---- 3. Lighthouse LCP p75 (NFR-001)
  const lcpValues = [];
  const clsValues = [];
  let lastReport = null;
  for (let run = 0; run < RUNS; run += 1) {
    const { browser: chrome, port } = await launchChromium();
    try {
      // NFR-001은 "Fast 3G 스로틀"을 명시한다. lantern 시뮬레이션은 프리렌더된
      // 첫 페인트를 모델링하지 못해 SPA 부팅 시점으로 FCP를 고정하므로, 실제
      // 네트워크/CPU 스로틀을 적용해 렌더 이벤트를 관찰하는 devtools 방식을 쓴다.
      // 계수는 DevTools Fast 3G 프리셋(RTT 150ms×3.75, 1.6Mbps×0.9, CPU 4x)이다.
      const result = await lighthouse(`${origin}/`, {
        port,
        output: "json",
        logLevel: "error",
        onlyCategories: ["performance"],
        throttlingMethod: "devtools",
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1474.56,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4,
        },
      });
      lcpValues.push(result.lhr.audits["largest-contentful-paint"].numericValue);
      clsValues.push(result.lhr.audits["cumulative-layout-shift"].numericValue);
      lastReport = result.lhr;
    } finally {
      await chrome.close();
    }
  }
  const percentile75 = (values) => [...values].sort((left, right) => left - right)[Math.ceil(0.75 * values.length) - 1];
  const p75 = percentile75(lcpValues);
  const clsP75 = percentile75(clsValues);
  const performanceScore = Math.round((lastReport?.categories?.performance?.score ?? 0) * 100);

  mkdirSync(resolve(ROOT, "test-results"), { recursive: true });
  writeFileSync(
    resolve(ROOT, "test-results/lighthouse.json"),
    JSON.stringify({ lcpRunsMs: lcpValues, lcpP75Ms: p75, budgetMs: LCP_BUDGET_MS, clsRuns: clsValues, clsP75, clsBudget: CLS_BUDGET, performanceScore }, null, 2),
  );

  console.log(`[lighthouse] LCP runs(ms): ${lcpValues.map((value) => Math.round(value)).join(", ")}`);
  if (p75 > LCP_BUDGET_MS) {
    console.error(`error[LH-LCP-BUDGET]: LCP p75 ${Math.round(p75)}ms > ${LCP_BUDGET_MS}ms (NFR-001)`);
    failed = true;
  } else {
    console.log(`[lighthouse] PASS LCP p75 ${Math.round(p75)}ms / ${LCP_BUDGET_MS}ms, performance ${performanceScore}`);
  }

  // 랜딩 프리렌더는 브라우저가 셸을 먼저 칠하게 만든다. 이어서 클라이언트가 같은
  // 트리를 다시 마운트하므로, 두 렌더가 어긋나면 레이아웃 이동으로 드러난다.
  // Core Web Vitals의 "good" 상한(0.1)으로 그 회귀를 잡는다.
  if (clsP75 > CLS_BUDGET) {
    console.error(`error[LH-CLS-BUDGET]: CLS p75 ${clsP75.toFixed(3)} > ${CLS_BUDGET} — 프리렌더 결과와 클라이언트 렌더가 어긋난다`);
    failed = true;
  } else {
    console.log(`[lighthouse] PASS CLS p75 ${clsP75.toFixed(3)} / ${CLS_BUDGET}`);
  }
} finally {
  server.close();
}

process.exit(failed ? 1 : 0);
