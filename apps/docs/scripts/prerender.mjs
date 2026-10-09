#!/usr/bin/env node
// Refs: WP-028 NFR-001 FR-DOC-001
// vite build --ssr 산출물(dist-server)로 랜딩 경로를 렌더해 dist/index.html의
// 루트 노드에 주입한다. 클라이언트는 같은 트리를 다시 마운트하므로 시각적 결과는
// 동일하고, 첫 페인트만 JS 로드보다 앞선다.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = resolve(DOCS, "dist/index.html");

// App의 초기 테마 계산(readTheme)이 참조하는 브라우저 표면의 최소 셰임이다.
// 프리렌더는 다크(기준 테마)로 그리고, 실제 테마는 첫 페인트 전 인라인 스니펫이
// html 속성으로 정하므로 색은 CSS 변수를 통해 곧바로 올바르게 칠해진다.
globalThis.window = {
  localStorage: { getItem: () => null },
  matchMedia: () => ({ matches: true }),
};

const { render } = await import(resolve(DOCS, "dist-server/entry-server.js"));
const html = render(process.env.DOCS_BASE ?? "/");

const marker = '<div id="root"></div>';
const indexHtml = readFileSync(INDEX, "utf8");
if (!indexHtml.includes(marker)) {
  console.error("error[PRERENDER-MARKER]: dist/index.html에서 빈 루트 노드를 찾지 못했다");
  process.exit(1);
}
if (html.length < 500 || !html.includes("cdt-app-shell")) {
  console.error("error[PRERENDER-EMPTY]: 프리렌더 결과가 문서 셸을 포함하지 않는다");
  process.exit(1);
}
// 모듈 스크립트 태그를 <head>에서 본문 끝으로 옮긴다 (CR-042). 모듈 스크립트는 어차피
// 지연 실행되지만 *다운로드*는 파서가 태그를 만나는 순간 시작된다. <head>에 두면 진입
// 청크(약 400KB)가 스타일시트와 처음부터 대역폭을 나눠 쓰고, Fast 3G에서 첫 페인트는
// 스타일시트 도착까지 기다리므로 LCP가 그만큼 늦어진다(NFR-001). 본문 끝에 두면
// 프리렌더된 HTML이 다 읽힌 뒤에야 스크립트 요청이 시작돼 스타일시트가 먼저 내려온다.
// 실측(샌드박스 Lighthouse, 동일 산출물): 2862ms → 2668ms.
const MODULE_SCRIPT = /\s*<script type="module" crossorigin src="[^"]+"><\/script>/;
const scriptTag = indexHtml.match(MODULE_SCRIPT)?.[0]?.trim();
if (scriptTag === undefined) {
  console.error("error[PRERENDER-SCRIPT]: dist/index.html에서 모듈 스크립트 태그를 찾지 못했다");
  process.exit(1);
}
const withPrerender = indexHtml.replace(MODULE_SCRIPT, "").replace(marker, `<div id="root">${html}</div>`).replace("</body>", `    ${scriptTag}\n  </body>`);
writeFileSync(INDEX, withPrerender, "utf8");
rmSync(resolve(DOCS, "dist-server"), { recursive: true, force: true });
console.log(`[prerender] injected ${html.length} chars into dist/index.html`);
