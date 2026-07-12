import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

/**
 * Workspace packages resolve to their sources during tests so that `pnpm test`
 * does not require a prior `pnpm build`. Runtime and bundler resolution still go
 * through each package's `exports` map.
 */
const alias = {
  "@conductor/tokens": fromRoot("./packages/tokens/src/index.ts"),
  "@conductor/react": fromRoot("./packages/react/src/index.ts"),
};

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "tokens",
          root: fromRoot("./packages/tokens"),
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "css",
          root: fromRoot("./packages/css"),
          environment: "node",
          include: ["test/**/*.test.ts"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "react",
          root: fromRoot("./packages/react"),
          environment: "jsdom",
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
          exclude: ["src/**/*.browser.test.tsx"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "docs",
          root: fromRoot("./apps/docs"),
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
    ],
  },
});
