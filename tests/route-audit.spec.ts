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
  "/guesthouses",
  "/guides",
  "/hotelbeds-certification",
  "/how-it-works",
  "/partner",
  "/plan-your-trip",
  "/privacy",
  "/resorts",
  "/stay",
  "/terms",
  "/transfers",
  "/wishlist",
  "/stay/overwater-romance",
  "/resorts/private-island-luxury",
  "/guesthouses/coral-garden-house",
  "/experiences/dive-with-manta-rays",
  "/guides/best-time-to-visit",
];

test("all public routes render without a server error", async ({ page }) => {
  test.setTimeout(120_000);
  const missingResources: string[] = [];
  page.on("response", (response) => {
    if (response.status() === 404 && !response.url().includes("favicon")) {
      missingResources.push(response.url());
    }
  });

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main"), route).toBeVisible();
  }

  expect(missingResources).toEqual([]);
});
