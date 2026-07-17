// Refs: CR-031 DEV-024 FR-DOC-001
// GitHub Pages has no server-side rewrite. Convert legacy path-based documentation URLs into
// HashRouter URLs before React loads, so a Pages 404 response can never leave the app blank.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docs = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.DOCS_BASE ?? "/";
const normalisedBase = `/${base.replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");
const fallback = `<!doctype html><meta charset="utf-8"><title>Conductor Design System</title><script>const b=${JSON.stringify(normalisedBase)};const p=location.pathname.startsWith(b)?location.pathname.slice(b.length - 1):location.pathname;location.replace(b+"#"+(p.startsWith("/")?p:"/"+p)+location.search+location.hash);</script>`;

writeFileSync(resolve(docs, "dist/404.html"), fallback, "utf8");
