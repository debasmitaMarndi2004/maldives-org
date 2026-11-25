import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/about",
  "/account",
  "/admin",
  "/affiliate-disclosure",
  "/atolls",
  "/booking",
  "/booking/confirmation",
  "/cancellation-policy",
  "/checkout",
  "/compare",
  "/contact",
  "/cookies",
  "/deals",
  "/experiences",
  "/faq",
  "/flights",
  "/guesthouses",
  "/guides",
  "/how-it-works",
  "/partner",
  "/plan-your-trip",
  "/privacy",
  "/resorts",
  "/stay",
  "/terms",
  "/tours-and-activities",
  "/tours-and-activities/reef-snorkelling",
  "/transfers",
  "/wishlist",
  "/stay/overwater-romance",
  "/resorts/private-island-luxury",
  "/guesthouses/coral-garden-house",
  "/experiences/dive-with-manta-rays",
  "/guides/best-time-to-visit",
];

test("public routes render without application errors or external integration requests", async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  const origin = new URL(baseURL!).origin;
  const missingResources: string[] = [];
  const externalIntegrationRequests: string[] = [];
  page.on("request", (request) => {
    if (["document", "xhr", "fetch", "script"].includes(request.resourceType()) && new URL(request.url()).origin !== origin) {
      externalIntegrationRequests.push(request.url());
    }
  });
  page.on("response", (response) => {
    if (response.status() === 404 && !response.url().includes("favicon")) {
      missingResources.push(response.url());
    }
  });

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(200);
    // Ignore hidden streaming copies while requiring one accessible main region.
    await expect(page.getByRole("main"), route).toHaveCount(1);
    await expect(page.getByRole("main"), route).toBeVisible();
  }

  expect(missingResources).toEqual([]);
  expect(externalIntegrationRequests).toEqual([]);
});

test("anonymous visitors cannot open staff drafts", async ({ page }) => {
  for (const path of ["/admin/preview", "/admin/preview/reef-etiquette"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("main h1")).toHaveText(/Staff (sign in|access unavailable)/);
    await expect(page.getByRole("link", { name: "Preview draft" })).toHaveCount(0);
  }
  const response = await page.request.get("/admin");
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
});
