#!/usr/bin/env node
// Bundles and minifies the Conductor stylesheet with lightningcss (ADR-008).
// The browserslist query is pinned to NFR-005's support range so that lightningcss
// never downlevels `@layer` or inlines custom properties (ADR-005, ADR-002).
// Refs: WP-001 FR-DX-001
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import browserslist from "browserslist";
import { browserslistToTargets, bundle } from "lightningcss";

const PACKAGE_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(PACKAGE_ROOT, "dist");

const targets = browserslistToTargets(
  browserslist(undefined, { path: PACKAGE_ROOT, env: "production" }),
);

const { code } = bundle({
  filename: resolve(PACKAGE_ROOT, "src/index.css"),
  minify: true,
  targets,
});

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "index.css"), code);

console.log(`[css] wrote dist/index.css (${code.length} bytes)`);
