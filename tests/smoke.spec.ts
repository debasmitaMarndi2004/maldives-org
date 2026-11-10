import { expect, test } from "@playwright/test";
import { captureApplicationErrors } from "./browser-errors";

test("homepage partner search and currency controls work", async ({ page }, testInfo) => {
  const { errors, unavailableMedia } = captureApplicationErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Find your perfect Maldives." })).toBeVisible();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByLabel("Mobile currency", { exact: true }).selectOption("INR");
    await page.getByRole("button", { name: "Close menu" }).click();
  } else {
    await page.getByLabel("Currency", { exact: true }).selectOption("INR");
  }
  await expect(page.locator(".stay-footer").first()).toContainText("₹");
  await expect(page.getByTitle("Travelpayouts flight search")).toBeVisible();
  await expect(page.getByRole("button", { name: "Search stays" })).toHaveCount(0);
  if (unavailableMedia.length) await expect(page.locator('.stay-image[data-media-state="fallback"]').first()).toBeVisible();

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

test("direct supplier confirmation endpoints stay disabled in affiliate MVP", async ({ request }) => {
  const checkRate = await request.post("/api/hotelbeds/checkrate", { data: { rateKeys: ["qa-rate-key"] } });
  expect([400, 503]).toContain(checkRate.status());
  expect((await checkRate.json()).ok).toBe(false);

  const booking = await request.post("/api/hotelbeds/booking", {
    data: {
      confirm: true,
      internalReference: "MD-QA-PREVIEW",
      rateKey: "qa-rate-key",
      holder: { name: "QA", surname: "Traveller" },
      paxes: [{ name: "QA", surname: "Traveller" }],
    },
  });
  expect([409, 503]).toContain(booking.status());
  expect((await booking.json()).ok).toBe(false);
});

test("dynamic content routes render", async ({ page }) => {
  for (const route of ["/stay/overwater-romance", "/resorts/private-island-luxury", "/guesthouses/coral-garden-house", "/experiences/dive-with-manta-rays", "/booking/MD-PREVIEW", "/booking/MD-PREVIEW/voucher", "/hotelbeds-certification", "/checkout"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("main")).toBeVisible();
  }
});
