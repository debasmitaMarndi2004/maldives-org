import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";
import { approvedAffiliateFixtures } from "./tests/fixtures/affiliate-links";

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
    // Never reuse a service with unknown credentials or affiliate configuration.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // Isolated test-service namespace: never inherit live database, email,
      // supplier or payment credentials. Only synthetic affiliate fixtures are enabled.
      NEXT_PUBLIC_SITE_URL: baseURL,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      SUPABASE_SECRET_KEY: "",
      RESEND_API_KEY: "",
      RESEND_FROM_EMAIL: "",
      ADMIN_NOTIFICATION_EMAIL: "",
      STRIPE_SECRET_KEY: "",
      STRIPE_WEBHOOK_SECRET: "",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "",
      HOTELBEDS_HOTEL_API_KEY: "",
      HOTELBEDS_HOTEL_SECRET: "",
      HOTELBEDS_ACTIVITIES_API_KEY: "",
      HOTELBEDS_ACTIVITIES_SECRET: "",
      HOTELBEDS_TRANSFERS_API_KEY: "",
      HOTELBEDS_TRANSFERS_SECRET: "",
      HOTELBEDS_MTLS_CERT_BASE64: "",
      HOTELBEDS_MTLS_KEY_BASE64: "",
      HOTELBEDS_MTLS_CA_BASE64: "",
      HOTELBEDS_MALDIVES_HOTEL_CODES: "",
      HOTELBEDS_BOOKING_MODE: "disabled",
      VIATOR_API_KEY: "",
      ANTHROPIC_API_KEY: "",
      AFFILIATE_APPROVED_LINKS_JSON: JSON.stringify(approvedAffiliateFixtures),
      TRAVELPAYOUTS_DRIVE_ENABLED: "false",
      STAY22_ENABLED: "false",
      STAY22_APPROVED_LINKS_JSON: "",
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" } },
  ],
});
