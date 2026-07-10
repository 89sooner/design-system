import { defineConfig } from "tsup";

/**
 * First build pass: compile the CLIs so that `conductor-build-tokens` can regenerate
 * `src/tokens.ts` and `src/breakpoints.ts` before the second pass type-checks and bundles them.
 *
 * `conductor-check-contrast` (API-TOK-003) and `conductor-lint-tokens` (FR-TOK-001 AC-3) are built
 * here too. Neither reads `src/tokens.ts`, so building them in the first pass is safe and it means
 * `pnpm check:contrast` and `pnpm lint:tokens` have a binary the moment `pnpm build` has run.
 *
 * `clean` is off in both passes. FR-TOK-003 requires a failed build to leave the previous
 * artifacts intact, and wiping `dist/` up front would destroy them before resolution even runs.
 */
export default defineConfig({
  entry: ["src/cli.ts", "src/contrast-cli.ts", "src/lint-cli.ts"],
  format: ["esm"],
  dts: false,
  clean: false,
  splitting: false,
  treeshake: true,
  target: "es2022",
});
