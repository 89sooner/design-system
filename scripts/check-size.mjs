#!/usr/bin/env node
// Refs: WP-025 FR-DX-003 NFR-001 JOB-CI-004
import { readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import esbuildPlugin from "@size-limit/esbuild";
import filePlugin from "@size-limit/file";
import sizeLimit from "size-limit";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_PATH = resolve(ROOT, "size-report.json");
const BUTTON_PATH = resolve(ROOT, process.env.CONDUCTOR_SIZE_FIXTURE === "missing" ? "packages/react/dist/__missing.js" : "packages/react/dist/index.js");
const CSS_PATH = resolve(ROOT, "packages/css/dist/index.css");
const BUTTON_BUDGET = process.env.CONDUCTOR_SIZE_FIXTURE === "button" ? 1 : 4 * 1024;
const CSS_BUDGET = process.env.CONDUCTOR_SIZE_FIXTURE === "css" ? 1 : 20 * 1024;

const displayPath = (path) => isAbsolute(path) ? relative(ROOT, path) : path;
const formatBytes = (bytes) => bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(2)} KiB`;

async function readManifest(path) {
  return JSON.parse(await readFile(resolve(ROOT, path), "utf8"));
}

function contributingModules(metafile) {
  const totals = new Map();
  for (const output of Object.values(metafile?.outputs ?? {})) {
    for (const [path, input] of Object.entries(output.inputs ?? {})) {
      totals.set(path, (totals.get(path) ?? 0) + input.bytesInOutput);
    }
  }
  return [...totals]
    .filter(([path, bytes]) => bytes > 0 && !path.includes("size-limit-"))
    .sort((left, right) => right[1] - left[1])
    .map(([path, bytes]) => ({ path: displayPath(path), bytes }));
}

async function measureButton() {
  const check = {
    files: [BUTTON_PATH],
    import: { [BUTTON_PATH]: "{ Button }" },
    ignore: ["react", "react-dom", "lucide-react"],
    gzip: true,
  };
  const [result] = await sizeLimit([filePlugin, esbuildPlugin], { checks: [check] });
  return { bytes: result.size, modules: contributingModules(check.esbuildMetafile) };
}

async function measureCss() {
  const [result] = await sizeLimit([filePlugin], {
    checks: [{ files: [CSS_PATH], gzip: true }],
  });
  return { bytes: result.size, modules: [{ path: displayPath(CSS_PATH), bytes: result.size }] };
}

async function main() {
  try {
    const [button, css, reactManifest, cssManifest] = await Promise.all([
      measureButton(),
      measureCss(),
      readManifest("packages/react/package.json"),
      readManifest("packages/css/package.json"),
    ]);
    const contracts = {
      reactSideEffectsFalse: reactManifest.sideEffects === false,
      cssSideEffectsDeclared: Array.isArray(cssManifest.sideEffects) && cssManifest.sideEffects.includes("*.css"),
    };
    const budgets = [
      { name: "@conductor/react Button", gzipBytes: button.bytes, limitBytes: BUTTON_BUDGET, passed: button.bytes <= BUTTON_BUDGET, modules: button.modules },
      { name: "@conductor/css index.css", gzipBytes: css.bytes, limitBytes: CSS_BUDGET, passed: css.bytes <= CSS_BUDGET, modules: css.modules },
    ];
    const report = {
      generatedAt: new Date().toISOString(),
      compression: "gzip level 9",
      contracts,
      budgets,
    };
    await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    for (const budget of budgets) {
      const label = budget.passed ? "PASS" : "FAIL";
      console.log(`[size] ${label} ${budget.name}: ${formatBytes(budget.gzipBytes)} / ${formatBytes(budget.limitBytes)}`);
    }
    console.log(`[size] ${contracts.reactSideEffectsFalse && contracts.cssSideEffectsDeclared ? "PASS" : "FAIL"} sideEffects contracts`);

    const failures = budgets.filter((budget) => !budget.passed);
    if (!contracts.reactSideEffectsFalse) failures.push({ name: "@conductor/react sideEffects must be false", modules: [] });
    if (!contracts.cssSideEffectsDeclared) failures.push({ name: "@conductor/css sideEffects must include *.css", modules: [] });
    if (failures.length === 0) return;

    console.error(`error[SIZE_LIMIT]: ${failures.length} budget or package contract exceeded`);
    for (const failure of failures) {
      console.error(`  ${failure.name}`);
      for (const module of failure.modules) console.error(`    - ${module.path}: ${formatBytes(module.bytes)}`);
    }
    process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeFile(REPORT_PATH, `${JSON.stringify({ generatedAt: new Date().toISOString(), error: message }, null, 2)}\n`, "utf8");
    console.error(`error[SIZE_CHECK]: ${message}`);
    process.exitCode = 1;
  }
}

await main();
