import { defineConfig } from "@playwright/test";

// Refs: CR-072 JOB-CI-005. In CI the suite builds and serves the docs site itself; a stray `test.only` fails the run,
// and a failing test keeps its trace for the uploaded results.
export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: { command: "pnpm build && pnpm preview --host 127.0.0.1", port: 4173, reuseExistingServer: !process.env.CI },
});
