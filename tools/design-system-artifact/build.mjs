#!/usr/bin/env node
// Rebuilds the files of the Conductor design system artifact on claude.ai from this repository.
//
//   pnpm ds:artifact               # builds tokens → css → react and the docs component catalog first
//   pnpm ds:artifact --skip-build  # reuses the existing dist/ and generated/ outputs
//
// Output: tools/design-system-artifact/out/project/** (gitignored) plus out/publish.json, which
// lists the files to publish and the images to upload. See README.md beside this file.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bundleComponents, bundleHeader } from "./lib/bundle.mjs";
import { componentReadme, toDeclarations } from "./lib/docs.mjs";
import { compilePreviews, DEFAULT_PREVIEW_HEIGHT, pickRules, PREVIEW_CLASSES, PREVIEW_HEIGHTS, previewHtml } from "./lib/previews.mjs";
import { declaredNames, toBundleCss } from "./lib/stylesheet.mjs";
import { duplicateNames, toArtifactTokens } from "./lib/tokens.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = join(HERE, "out");
const PROJECT = join(OUT, "project");
const NAMESPACE = "Conductor";
/** Uploaded to the artifact's asset store rather than published as files. */
const ASSET_EXTENSIONS = /\.(svg|png|jpe?g|gif|webp|mp4|webm|pdf)$/i;

const fromRoot = (...parts) => join(ROOT, ...parts);
const read = (...parts) => readFileSync(fromRoot(...parts), "utf8");
const readJson = (...parts) => JSON.parse(read(...parts));

function write(path, contents) {
  const target = join(PROJECT, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function run(command, args) {
  console.log(`[ds:artifact] ${command} ${args.join(" ")}`);
  execFileSync(command, args, { cwd: ROOT, stdio: "inherit" });
}

function buildInputs() {
  run("pnpm", ["--filter", "@conductor-by-89soone/tokens", "run", "build"]);
  run("pnpm", ["--filter", "@conductor-by-89soone/css", "run", "build"]);
  run("pnpm", ["--filter", "@conductor-by-89soone/react", "run", "build"]);
  run("node", ["apps/docs/scripts/build-component-catalog.mjs"]);
}

function requireInputs(paths) {
  const missing = paths.filter((path) => !existsSync(fromRoot(path)));
  if (missing.length > 0) throw new Error(`missing build output: ${missing.join(", ")} — run without --skip-build`);
}

/** The esbuild the React package already builds with (through tsup), so no new dependency is needed. */
function loadEsbuild() {
  const fromReact = createRequire(fromRoot("packages/react/package.json"));
  return createRequire(fromReact.resolve("tsup"))("esbuild");
}

const listFiles = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

const gitRef = () => `main@${execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim()}`;

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  if (!process.argv.includes("--skip-build")) buildInputs();
  requireInputs([
    "packages/tokens/dist/tokens.json",
    "packages/tokens/dist/index.js",
    "packages/css/dist/index.css",
    "packages/css/dist/agent.css",
    "packages/react/dist/index.js",
    "apps/docs/src/generated/component-meta.json",
  ]);
  const esbuild = loadEsbuild();
  rmSync(OUT, { recursive: true, force: true });

  // Hand-written brand book, cover, logo notes and logo files.
  cpSync(join(HERE, "static"), PROJECT, { recursive: true });

  // Tokens.
  const provenance = { ref: option("--ref") ?? gitRef(), synced: option("--synced") ?? new Date().toISOString().slice(0, 10) };
  const { tokens, declared } = toArtifactTokens(readJson("packages/tokens/dist/tokens.json"), provenance);
  const duplicates = duplicateNames(tokens);
  if (duplicates.length > 0) throw new Error(`duplicate token names: ${duplicates.join(", ")}`);
  write("tokens.json", `${JSON.stringify(tokens, null, 1)}\n`);

  // Stylesheet.
  const bundleCss = toBundleCss([read("packages/css/dist/index.css"), read("packages/css/dist/agent.css")], declared);
  // Component-local properties (`--cdt-badge-tone` …) are not tokens; only a token tokens.json owns is a leak.
  const leaked = declaredNames(bundleCss).filter((name) => declared.includes(name));
  if (leaked.length > 0) throw new Error(`bundle.css still declares tokens owned by tokens.json: ${leaked.join(", ")}`);
  write("components/bundle.css", bundleCss);

  // Components.
  const meta = readJson("apps/docs/src/generated/component-meta.json");
  const script = await bundleComponents(esbuild, {
    reactEntry: fromRoot("packages/react/dist/index.js"),
    tokensEntry: fromRoot("packages/tokens/dist/index.js"),
    nodePaths: [fromRoot("packages/react/node_modules")],
    resolveDir: fromRoot("packages/react"),
  });
  write("components/bundle.js", bundleHeader(NAMESPACE, meta.map(({ name }) => name)) + script);

  const tokensModule = await import(fromRoot("packages/tokens/dist/index.js"));
  write("components/index.d.ts", toDeclarations(read("packages/react/etc/react.api.md"), { statusIcons: tokensModule.STATUS_ICONS, severityIcons: tokensModule.SEVERITY_ICONS }));

  const previews = await compilePreviews(esbuild, read("apps/docs/src/catalog.tsx"));
  const previewCss = pickRules([read("apps/docs/src/styles/base.css"), read("apps/docs/src/styles/catalog.css")], PREVIEW_CLASSES);
  for (const component of meta) {
    write(`components/${component.name}/README.md`, componentReadme(component));
    write(
      `components/${component.name}/preview.html`,
      previewHtml({ name: component.name, group: component.family, height: PREVIEW_HEIGHTS[component.name] ?? DEFAULT_PREVIEW_HEIGHT, script: previews, css: previewCss }),
    );
  }

  // What to send: every text file under project/ as a file, images as asset uploads.
  const paths = listFiles(PROJECT).map((path) => `project/${relative(PROJECT, path).split("\\").join("/")}`).sort();
  const publish = { ref: provenance.ref, files: paths.filter((path) => !ASSET_EXTENSIONS.test(path)), assets: paths.filter((path) => ASSET_EXTENSIONS.test(path)) };
  writeFileSync(join(OUT, "publish.json"), `${JSON.stringify(publish, null, 1)}\n`);

  const counted = Object.values(tokens).filter((family) => family !== null && typeof family === "object" && Array.isArray(family.tokens));
  console.log(
    `[ds:artifact] ${provenance.ref}: ${counted.reduce((sum, family) => sum + family.tokens.length, 0)} tokens, ${meta.length} components, ` +
      `${publish.files.length} files and ${publish.assets.length} assets in ${relative(ROOT, OUT)}`,
  );
}

main().catch((error) => {
  console.error(`[ds:artifact] ${error.message}`);
  process.exit(1);
});
