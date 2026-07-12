import { defineConfig } from "tsup";

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
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  splitting: true,
  treeshake: true,
  target: "es2022",
  external: ["react", "react-dom", "lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip"],
});
