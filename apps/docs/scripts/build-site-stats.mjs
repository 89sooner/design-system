// Refs: CR-042 FR-DOC-001 FR-DOC-002 FR-DOC-004
// The landing page (W-001) quotes how much the system covers — components, tokens, contrast
// checks, themes. Those numbers are read from the build artifacts rather than typed into the
// screen, for the same reason the Foundations screens read `tokens.json` (FR-DOC-002 AC-1):
// a hand-written count drifts the first time a package grows.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const generated = fileURLToPath(new URL("../src/generated", import.meta.url));

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const tokens = readJson(`${root}/packages/tokens/dist/tokens.json`);
const contrastPath = `${root}/packages/tokens/dist/contrast-report.json`;
const contrast = existsSync(contrastPath) ? readJson(contrastPath) : null;
// Written by build-component-catalog.mjs, which runs first in the docs build.
const components = readJson(`${generated}/component-meta.json`);

const themes = new Set();
for (const token of tokens.tokens) for (const theme of Object.keys(token.values ?? {})) themes.add(theme);

const stats = {
  components: components.length,
  tokens: tokens.tokens.length,
  contrastChecks: contrast?.summary?.checks ?? null,
  contrastPassed: contrast?.summary?.passed ?? null,
  themes: themes.size,
};

mkdirSync(generated, { recursive: true });
writeFileSync(`${generated}/site-stats.json`, `${JSON.stringify(stats, null, 2)}\n`);
console.log(`[docs] site stats: ${stats.components} components, ${stats.tokens} tokens, ${stats.contrastPassed}/${stats.contrastChecks} contrast checks, ${stats.themes} themes`);
