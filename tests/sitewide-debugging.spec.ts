import { expect, test } from "@playwright/test";
import { exchangeRateSnapshot, fallbackRates } from "../lib/currency";
import { normalizeHotelbedsResults } from "../lib/hotelbeds-data";
import { normalizeSiteOrigin } from "../lib/site-origin";

test("partial currency data identifies estimated rates and never invents a timestamp", () => {
  const partial = exchangeRateSnapshot({ result: "success", rates: { USD: 1, EUR: 0.95, INR: -1 } });
  expect(partial.source).toBe("mixed");
  expect(partial.rates.EUR).toBe(0.95);
  expect(partial.rates.INR).toBe(fallbackRates.INR);
  expect(partial.estimatedCurrencies).toContain("INR");
  expect(partial.updatedAt).toBeNull();
  expect(exchangeRateSnapshot({ result: "success", base_code: "EUR", rates: { USD: 1 } }).source).toBe("fallback");
  const complete = exchangeRateSnapshot({ result: "success", base_code: "USD", rates: fallbackRates });
  expect(complete.source).toBe("open.er-api.com");
  expect(complete.estimatedCurrencies).toEqual([]);
});

test("SEO defaults use the production domain and preserve explicit local configuration", () => {
  for (const input of [undefined, "", "not a URL", "javascript:alert(1)", "https://user:password@example.test"]) {
    expect(normalizeSiteOrigin(input)).toBe("https://maldives.org");
  }
  expect(normalizeSiteOrigin("http://127.0.0.1:3000/path")).toBe("http://127.0.0.1:3000");
});

test("missing supplier ratings stay missing instead of becoming invented reviews", () => {
  for (const [rating, expected] of [[undefined, null], ["", null], [true, null], ["invalid", null], [4.8, 4.8], ["4.2", 4.2]] as const) {
    const result = normalizeHotelbedsResults({ hotels: { hotels: [{ code: "synthetic", name: "Local test fixture", rating, rooms: [{ rates: [{ rateKey: "synthetic", net: "100", currency: "USD" }] }] }] } }, "/test-image.jpg");
    expect(result).toHaveLength(1);
    expect(result[0].rating).toBe(expected);
  }
});

test("homepage search opens source-reviewed accommodations and labels sample estimates", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".experience-tile").first()).toContainText("Sample");
  await page.getByRole("button", { name: "Search Maldives", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Find your Maldives", exact: true });
  await dialog.getByRole("textbox", { name: "Search resorts, islands or experiences", exact: true }).fill("Villa Park");
  await dialog.getByRole("textbox").press("Enter");
  await expect(page).toHaveURL(/\/stay\/villa-park$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Villa Park");
});
