#!/usr/bin/env node
// Bin shim for FR-TOK-001 AC-3. The CLI itself is `dist/lint-cli.js`; this wrapper exists so the
// executable carries a shebang without the bundler having to inject one.
//
// `dist/` is a build artifact, so on a clean checkout the CLI does not exist until `pnpm build` has
// run. A module-resolution stack trace does not say that; this does.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cli = new URL("../dist/lint-cli.js", import.meta.url);

if (existsSync(fileURLToPath(cli))) {
  await import(cli.href);
} else {
  console.error("error[TOK-BUILD]: packages/tokens/dist/lint-cli.js is missing");
  console.error("  hint: run `pnpm build` before `pnpm lint:tokens`.");
  process.exitCode = 1;
}
