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
writeFileSync(INDEX, indexHtml.replace(marker, `<div id="root">${html}</div>`), "utf8");
rmSync(resolve(DOCS, "dist-server"), { recursive: true, force: true });
console.log(`[prerender] injected ${html.length} chars into dist/index.html`);
