import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        browserName: "firefox",
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        browserName: "webkit",
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
