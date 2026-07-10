import { defineConfig } from "tsup";

/**
 * Second build pass, run after `conductor-build-tokens` has regenerated the token modules.
 * Produces the artifact layout `conductor_data_model.md` section 5 fixes:
 * `dist/index.{js,d.ts}`, `dist/tokens.{js,d.ts}`, `dist/breakpoints.{js,d.ts}`.
 *
 * `splitting` is off so each entry stands alone and `dist/tokens.js` needs no shared chunk.
 */
export default defineConfig({
  entry: ["src/index.ts", "src/tokens.ts", "src/breakpoints.ts"],
  format: ["esm"],
  dts: true,
  clean: false,
  splitting: false,
  treeshake: true,
  target: "es2022",
});
