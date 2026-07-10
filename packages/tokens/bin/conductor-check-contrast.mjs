#!/usr/bin/env node
// Bin shim for API-TOK-003. The CLI itself is `dist/contrast-cli.js`; this wrapper exists so the
// executable carries a shebang without the bundler having to inject one.
//
// `dist/` is a build artifact, so on a clean checkout the CLI does not exist until `pnpm build` has
// run. A module-resolution stack trace does not say that; this does.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cli = new URL("../dist/contrast-cli.js", import.meta.url);

if (existsSync(fileURLToPath(cli))) {
  await import(cli.href);
} else {
  console.error("error[TOK-BUILD]: packages/tokens/dist/contrast-cli.js is missing");
  console.error("  hint: run `pnpm build` before `pnpm check:contrast`.");
  process.exitCode = 1;
}
