import { defineConfig, devices } from "@playwright/test";

// Refs: CR-075 WP-042 DEV-065 NFR-005 JOB-CI-007. NFR-005 supports Chrome, Firefox, Safari and Edge; the docs e2e
// suite and every browser test ran in Chromium only. This smoke suite runs the same built site in each engine
// Playwright ships. Edge is Chromium, so the chromium project stands for both.
export default defineConfig({
  testDir: "./e2e-cross",
  forbidOnly: !!process.env.CI,
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: { command: "pnpm build && pnpm preview --host 127.0.0.1", port: 4173, reuseExistingServer: !process.env.CI },
});
