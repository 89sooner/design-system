import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  define: {
    __CONDUCTOR_A11Y_FIXTURE__: JSON.stringify(process.env.CONDUCTOR_A11Y_FIXTURE ?? ""),
  },
  test: {
    root: fromRoot("./packages/react"),
    include: ["src/testing/a11y.browser.test.tsx"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    browser: {
      enabled: true,
      provider: "playwright",
      headless: true,
      instances: [{ browser: "chromium" }],
      screenshotDirectory: fromRoot("./test-results/screenshots"),
      screenshotFailures: true,
      commands: {
        writeAxeReport: async (_context, report: string) => {
          const outputDirectory = fromRoot("./test-results");
          await mkdir(outputDirectory, { recursive: true });
          await writeFile(`${outputDirectory}/axe-report.json`, report, "utf8");
        },
      },
    },
  },
});
