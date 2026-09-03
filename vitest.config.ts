import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

/**
 * Workspace packages resolve to their sources during tests so that `pnpm test`
 * does not require a prior `pnpm build`. Runtime and bundler resolution still go
 * through each package's `exports` map.
 */
const alias = {
  "@conductor-by-89soone/tokens": fromRoot("./packages/tokens/src/index.ts"),
  "@conductor-by-89soone/react": fromRoot("./packages/react/src/index.ts"),
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
      {
        // 릴리스 게이트 스크립트는 실제 git 저장소를 만들어 확인한다 (DEV-040).
        test: {
          name: "scripts",
          root: fromRoot("./scripts"),
          environment: "node",
          include: ["*.test.mjs"],
        },
      },
    ],
  },
});
