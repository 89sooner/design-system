// Refs: WP-026 FR-QA-004 JOB-CI-003
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./visual",
  outputDir: "../../test-results/visual",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      args: ["--disable-font-subpixel-positioning", "--disable-lcd-text", "--font-render-hinting=none"],
    },
  },
  webServer: {
    command: "pnpm --filter docs preview --host 127.0.0.1",
    port: 4173,
    reuseExistingServer: false,
  },
});

