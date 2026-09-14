import { defineConfig } from "tsup";
import { readFile, writeFile, readdir } from "node:fs/promises";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/action.tsx",
    "src/cx.ts",
    "src/data.tsx",
    "src/feedback.tsx",
    "src/form.tsx",
    "src/overlay.tsx",
    "src/shell.tsx",
    "src/status.tsx",
    "src/surface.tsx",
    "src/types.ts",
    "src/interaction.tsx",
    "src/workbench.tsx",
    "src/relation.tsx",
    "src/stylesheet-warning.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  // Preserve module boundaries: the server barrel only re-exports client leaves.
  bundle: false,
  splitting: false,
  treeshake: false,
  async onSuccess() {
    const clientEntries = new Set(["action", "data", "feedback", "form", "overlay", "shell", "status", "surface", "interaction", "workbench", "relation"]);
    for (const file of await readdir("dist")) {
      if (!file.endsWith(".js")) continue;
      const path = `dist/${file}`;
      let source = await readFile(path, "utf8");
      source = source.replace(/(from\s+["'])(\.\/[^"']+?)(["'])/g, (_match, before, specifier, after) => `${before}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${after}`);
      if (clientEntries.has(file.slice(0, -3))) source = `"use client";\n${source}`;
      await writeFile(path, source);
    }
  },
  target: "es2022",
  external: ["react", "react-dom", "lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
});
