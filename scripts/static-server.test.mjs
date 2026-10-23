/**
 * The Lighthouse gate serves the docs build the way the deployment target does: text assets go out
 * gzip-encoded when the request accepts gzip, binaries and refusing clients get identity bytes, and
 * unknown paths fall back to the SPA shell.
 *
 * Refs: CR-070 NFR-001 FR-DOC-001
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { acceptsGzip, createStaticServer, isCompressible } from "./static-server.mjs";

let dist;
let server;
let origin;
const CSS = ".a{color:red}".repeat(200);

const get = (path, acceptEncoding) =>
  new Promise((resolve, reject) => {
    const headers = acceptEncoding === undefined ? {} : { "accept-encoding": acceptEncoding };
    request(`${origin}${path}`, { headers }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({ headers: response.headers, body: Buffer.concat(chunks) }));
    }).on("error", reject).end();
  });

beforeAll(async () => {
  dist = mkdtempSync(join(tmpdir(), "static-server-"));
  mkdirSync(join(dist, "assets"));
  writeFileSync(join(dist, "index.html"), "<!doctype html><title>shell</title>");
  writeFileSync(join(dist, "assets/app.css"), CSS);
  writeFileSync(join(dist, "assets/logo.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  server = createStaticServer(dist);
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  origin = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => {
  server.close();
  rmSync(dist, { recursive: true, force: true });
});

describe("CR-070 NFR-001: static server for the Lighthouse gate", () => {
  it("gzips a text asset when the request accepts gzip, and the bytes round-trip", async () => {
    const { headers, body } = await get("/assets/app.css", "gzip, deflate, br");
    expect(headers["content-encoding"]).toBe("gzip");
    expect(headers.vary).toBe("Accept-Encoding");
    expect(body.length).toBeLessThan(CSS.length);
    expect(gunzipSync(body).toString()).toBe(CSS);
  });

  it("sends identity bytes when the request does not accept gzip", async () => {
    for (const encoding of [undefined, "identity", "gzip;q=0"]) {
      const { headers, body } = await get("/assets/app.css", encoding);
      expect(headers["content-encoding"]).toBeUndefined();
      expect(body.toString()).toBe(CSS);
    }
  });

  it("never re-compresses binary formats", async () => {
    const { headers, body } = await get("/assets/logo.png", "gzip");
    expect(headers["content-encoding"]).toBeUndefined();
    expect(headers["content-type"]).toBe("image/png");
    expect(body.length).toBe(4);
  });

  it("falls back to the SPA shell for extensionless and missing paths", async () => {
    for (const path of ["/components/Button", "/assets/missing.js"]) {
      const { headers, body } = await get(path, "gzip");
      expect(headers["content-type"]).toBe("text/html; charset=utf-8");
      expect(gunzipSync(body).toString()).toContain("<title>shell</title>");
    }
  });

  it("keeps the request header parser honest", () => {
    expect(acceptsGzip("gzip")).toBe(true);
    expect(acceptsGzip("br, gzip;q=0.8")).toBe(true);
    expect(acceptsGzip("*")).toBe(true);
    expect(acceptsGzip("gzip;q=0")).toBe(false);
    expect(acceptsGzip("br")).toBe(false);
    expect(acceptsGzip("")).toBe(false);
    expect(isCompressible("a/b.css")).toBe(true);
    expect(isCompressible("a/b.woff2")).toBe(false);
  });
});
