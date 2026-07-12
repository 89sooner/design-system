#!/usr/bin/env node
// Refs: WP-026 FR-QA-004 AC-3 JOB-CI-003
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--update")) {
  console.error("error[VISUAL_ARGS]: use `pnpm test:visual` or `pnpm test:visual --update`");
  process.exit(2);
}

const playwrightArgs = [
  "compose",
  "-f",
  "compose.visual.yml",
  "run",
  "--rm",
  "--build",
  "--quiet-build",
  "visual",
  "pnpm",
  "exec",
  "playwright",
  "test",
  "--config",
  "apps/docs/playwright.visual.config.ts",
];
if (args[0] === "--update") playwrightArgs.push("--update-snapshots=all");

const result = spawnSync("docker", playwrightArgs, { env: process.env, stdio: "inherit" });
if (result.error !== undefined) {
  console.error(`error[VISUAL_RUNNER]: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
