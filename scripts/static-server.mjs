// Refs: CR-070 NFR-001 FR-DOC-001 AC-3
// 문서 사이트 정적 산출물을 서버 런타임 없이 서빙한다. 배포 대상(GitHub Pages)처럼
// 텍스트 자원은 요청이 gzip을 받을 때 gzip으로 보낸다 — 압축하지 않은 전송은 실제
// 방문자가 받지 않는 조건이라, 그 위에서 잰 LCP는 CSS 바이트 증가에만 끌려 예산 끝으로
// 밀려 갔다(CR-070).
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

export const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".md": "text/markdown; charset=utf-8",
  ".woff2": "font/woff2",
};

/** 이미 압축된 형식(PNG, WOFF2)은 다시 압축하지 않는다. */
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".md"]);

export const isCompressible = (path) => COMPRESSIBLE.has(extname(path));

/** `Accept-Encoding` 값이 gzip을 허용하는지(`gzip;q=0`은 거부). */
export const acceptsGzip = (header = "") =>
  header.split(",").some((part) => {
    const [coding, ...params] = part.trim().toLowerCase().split(";");
    const q = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
    return (coding === "gzip" || coding === "*") && (q === undefined || Number(q.slice(2)) > 0);
  });

/** 요청 경로를 dist 안의 파일로 푼다. 확장자가 없거나 없는 파일은 SPA 폴백(index.html). */
export const resolveFile = (dist, url) => {
  const path = normalize(decodeURIComponent(new URL(url, "http://localhost").pathname)).replace(/^([/\\])+/, "");
  const target = join(dist, path);
  return existsSync(target) && extname(target) !== "" ? target : join(dist, "index.html");
};

/** 정적 파일 + SPA 폴백만 있는 서버. 압축 결과는 파일별로 한 번만 만든다. */
export function createStaticServer(dist, { compress = true } = {}) {
  const gzipCache = new Map();
  return createServer((request, response) => {
    const file = resolveFile(dist, request.url);
    try {
      const body = readFileSync(file);
      const headers = { "content-type": MIME[extname(file)] ?? "application/octet-stream" };
      if (compress && isCompressible(file)) {
        headers.vary = "Accept-Encoding";
        if (acceptsGzip(request.headers["accept-encoding"])) {
          if (!gzipCache.has(file)) gzipCache.set(file, gzipSync(body));
          headers["content-encoding"] = "gzip";
          response.writeHead(200, headers);
          response.end(gzipCache.get(file));
          return;
        }
      }
      response.writeHead(200, headers);
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
}
