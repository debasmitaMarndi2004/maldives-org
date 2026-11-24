import { expect, test } from "@playwright/test";
import { captureApplicationErrors } from "./browser-errors";

test("homepage discovery and menu currency controls work", async ({ page }) => {
  const { errors, unavailableMedia } = captureApplicationErrors(page);
  await page.goto("/");
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Find your perfect Maldives getaway." })).toBeVisible();
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByLabel("Mobile currency", { exact: true }).selectOption("INR");
  await expect(page.getByText("Maldives now · Malé", { exact: true })).toBeVisible();
  await expect(page.getByText(/Sample weather/)).toBeVisible();
  await page.getByRole("button", { name: "Close menu", exact: true }).click();
  await expect(page.locator(".experience-tile").first()).toContainText("₹");
  await expect(page.getByRole("button", { name: "Search stays", exact: true })).toHaveCount(0);
  await expect(page.locator(".search-card")).toHaveCount(0);
  if (unavailableMedia.length) await expect(page.locator('.experience-tile[data-media-state="fallback"]').first()).toBeVisible();

  expect(errors).toEqual([]);
});

test("security headers are present", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("booking request endpoint rejects invalid input without writing data", async ({ request }) => {
  const response = await request.post("/api/booking-requests", { data: { travelerName: "QA Traveller", travelerEmail: "not-an-email", offerTitle: "Test Maldives stay", offerType: "stay", guests: 2 } });
  expect(response.status()).toBe(400);
  expect((await response.json()).ok).toBe(false);
});

test("retired partner and payment routes cannot handle requests", async ({ request }) => {
  for (const path of [
    "/api/affiliates",
    "/api/hotelbeds/status",
    "/api/tours/viator",
    "/api/viator/products/preview",
    "/flights/embed",
    "/hotelbeds-certification",
    "/out/booking-com/preview",
    "/stay/partners/villa-park",
    "/tours-and-activities/embed",
    "/tours-and-activities/viator/preview",
    "/tours-and-activities/viator/preview/book",
  ]) {
    expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(404);
  }
  for (const path of ["/api/hotelbeds/search", "/api/hotelbeds/checkrate", "/api/hotelbeds/booking", "/api/stripe/checkout", "/api/stripe/webhook"]) {
    expect((await request.post(path, { data: {}, maxRedirects: 0 })).status(), path).toBe(404);
  }
});

test("dynamic content routes render", async ({ page }) => {
  for (const route of ["/stay/overwater-romance", "/resorts/private-island-luxury", "/guesthouses/coral-garden-house", "/experiences/dive-with-manta-rays", "/booking/MD-PREVIEW", "/booking/MD-PREVIEW/voucher", "/checkout"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("main")).toBeVisible();
  }
});
