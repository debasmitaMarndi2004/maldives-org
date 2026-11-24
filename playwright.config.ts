import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  outputDir: "/tmp/maldives-m3a-test-results",
  use: {
    baseURL,
    launchOptions: executablePath ? { executablePath } : {},
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: process.env.PLAYWRIGHT_USE_PRODUCTION === "1"
      ? "npm run start -- --hostname 127.0.0.1 -p 3000"
      : "npm run dev -- --hostname 127.0.0.1 -p 3000",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { NEXT_PUBLIC_SITE_URL: baseURL },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" } },
  ],
});
