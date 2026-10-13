// Refs: WP-034 CR-048 FR-DOC-008 API-DOC-002 JOB-BUILD-004
// JOB-BUILD-004 step ⑤: writes DESIGN.md, llms.txt, tokens.md and components/<Name>.md into dist/.
// Runs after the static build so the files sit next to the site; any failure exits non-zero and
// the deploy never ships a half-written set (FR-DOC-008 exception handling).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normaliseBase, renderComponentMd, renderDesignMd, renderLlmsTxt, renderTokensMd } from "./agent-docs.mjs";

const docs = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const artifact = readJson(require.resolve("@conductor-by-89soone/tokens/tokens.json"));
const contrast = readJson(require.resolve("@conductor-by-89soone/tokens/contrast-report.json"));
const components = readJson(resolve(docs, "src/generated/component-meta.json"));
const { version } = readJson(resolve(docs, "../../packages/react/package.json"));
const base = normaliseBase(process.env.DOCS_BASE);
const dist = resolve(docs, "dist");

const files = new Map([
  ["DESIGN.md", renderDesignMd({ tokens: artifact.tokens, themes: artifact.themes, contrast, components, version })],
  ["llms.txt", renderLlmsTxt({ components, base, version })],
  ["tokens.md", renderTokensMd({ tokens: artifact.tokens, themes: artifact.themes, version })],
  ...components.map((component) => [`components/${component.name}.md`, renderComponentMd(component, { base })]),
]);

mkdirSync(resolve(dist, "components"), { recursive: true });
for (const [path, content] of files) writeFileSync(resolve(dist, path), content, "utf8");
console.log(`[agent-docs] wrote ${files.size} files (${components.length} component pages) under ${base}`);
