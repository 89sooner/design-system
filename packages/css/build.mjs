#!/usr/bin/env node
// Bundles and minifies the Conductor stylesheet with lightningcss (ADR-008, JOB-BUILD-002).
// The browserslist query is pinned to NFR-005's support range so that lightningcss
// never downlevels `@layer` or inlines custom properties (ADR-005, ADR-002).
// Refs: WP-008 WP-009 FR-CSS-001 FR-CSS-002 FR-CSS-003 FR-CSS-005 FR-TOK-009 FR-DX-001 FR-DX-003
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import browserslist from "browserslist";
import { browserslistToTargets, bundleAsync } from "lightningcss";
import { breakpoints } from "@conductor/tokens/breakpoints";
import { formatViolations, inspectBundle } from "./checks.mjs";

const PACKAGE_ROOT = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(PACKAGE_ROOT, "src");
const OUT_DIR = join(PACKAGE_ROOT, "dist");
const require = createRequire(import.meta.url);

/** `https://…`, `http://…` and protocol-relative `//…`. */
const REMOTE_SPECIFIER = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const MEDIA_PRELUDE = /@media((?:[^{]|\{[^{}]*\})*)\{/g;
const BREAKPOINT_REF = /\{\s*breakpoint\.([a-z]+)\s*\}/g;

class CssBuildError extends Error {
  constructor(code, message, hint) {
    super(message);
    this.code = code;
    this.hint = hint;
  }
}

/**
 * The layer order statement. It is read from src/layers.css so the order lives
 * in exactly one place, and it is prepended to the output rather than passed
 * through lightningcss: the minifier rewrites and splits a leading `@layer a,b;`
 * statement once those layers also have block bodies, which would violate
 * FR-CSS-001 AC-4 ("fixed as one line at the top of the artifact").
 */
const LAYER_STATEMENT = readFileSync(join(SRC_DIR, "layers.css"), "utf8").trim();

/** cdt.component arrives with WP-012 onward. */
const BUNDLES = [
  {
    out: "index.css",
    sources: ["tokens.css", "reset.css", "base.css", "layout.css", "utility.css"],
  },
  // FR-CSS-002's exception: the same stylesheet minus cdt.reset, for consumers
  // whose own global reset would collide. Refs: FR-DX-003 AC-4
  { out: "component.css", sources: ["tokens.css", "base.css", "layout.css", "utility.css"] },
];

const targets = browserslistToTargets(
  browserslist(undefined, { path: PACKAGE_ROOT, env: "production" }),
);

const substituteBreakpoints = (css, filename) =>
  css.replace(MEDIA_PRELUDE, (_match, prelude) => {
    const literal = prelude.replace(BREAKPOINT_REF, (_ref, name) => {
      const value = breakpoints[name];
      if (value !== undefined) return `${value}px`;

      resolverError = new CssBuildError(
        "CSS-UNKNOWN-BREAKPOINT",
        `unknown breakpoint \`breakpoint.${name}\` in ${filename}`,
        `available breakpoints: ${Object.keys(breakpoints).join(", ")}`,
      );
      throw resolverError;
    });
    return `@media${literal}{`;
  });

/**
 * `@conductor/tokens/tokens.css` resolves through the tokens package's `exports`
 * map — its public entry point, never a reach into its src/ or dist/
 * (FR-DX-001 AC-4). Entry files are synthesised in memory so that src/ holds
 * only the layer sources JOB-BUILD-002 names.
 */
const makeResolver = (entries) => ({
  resolve(specifier, from) {
    // Caught here rather than in inspectBundle: bundling would otherwise try to
    // read the URL off the filesystem and die with an ENOENT stack trace.
    if (REMOTE_SPECIFIER.test(specifier)) {
      resolverError = new CssBuildError(
        "CSS-REMOTE-FONT",
        `remote \`@import "${specifier}"\` in ${from}`,
        "the deployed artifact makes zero runtime network requests (NFR-002, FR-CSS-002 AC-4)",
      );
      throw resolverError;
    }

    return specifier.startsWith("@conductor/")
      ? require.resolve(specifier)
      : resolve(dirname(from), specifier);
  },
  read(file) {
    const virtual = entries.get(file);
    const css = virtual === undefined ? readFileSync(file, "utf8") : virtual;
    return substituteBreakpoints(css, file);
  },
});

/**
 * lightningcss rethrows a resolver failure as its own ResolverError and drops the
 * original instance, so the typed error is stashed here on the way out.
 */
let resolverError = null;

const buildBundle = async ({ out, sources }) => {
  const entryPath = join(SRC_DIR, `__entry.${out}`);
  const entrySource = sources.map((name) => `@import "./${name}";`).join("\n");

  const { code } = await bundleAsync({
    filename: entryPath,
    minify: true,
    targets,
    resolver: makeResolver(new Map([[entryPath, entrySource]])),
  });

  return { out, css: `${LAYER_STATEMENT}\n${code.toString()}` };
};

const fail = (lines) => {
  console.error(lines.join("\n"));
  console.error("no output written");
  process.exit(1);
};

let built;
try {
  built = await Promise.all(BUNDLES.map(buildBundle));
} catch (error) {
  if (resolverError === null) throw error;
  fail([
    `error[${resolverError.code}]: ${resolverError.message}`,
    `  hint: ${resolverError.hint}`,
  ]);
}

// Nothing is written until every bundle passes. A partial dist/ would let a
// downstream job consume a stylesheet that never cleared its gates.
const violations = built.flatMap(({ out, css }) => inspectBundle(css, `dist/${out}`));

if (violations.length > 0) fail([formatViolations(violations)]);

mkdirSync(OUT_DIR, { recursive: true });

for (const { out, css } of built) {
  writeFileSync(join(OUT_DIR, out), css);
  const gzip = gzipSync(css, { level: 9 }).length;
  console.log(`[css] wrote dist/${out} (${css.length} bytes, ${gzip} bytes gzipped)`);
}
