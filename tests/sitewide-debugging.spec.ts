import { expect, test } from "@playwright/test";
import { fallbackRateSnapshot, fallbackRates, supportedCurrencies } from "../lib/currency";
import { normalizeSiteOrigin } from "../lib/site-origin";

test("planning currency rates are labeled as estimates", async ({ request }) => {
  const response = await request.get("/api/currency/rates");
  expect(response.status()).toBe(200);
  const snapshot = fallbackRateSnapshot();
  expect(await response.json()).toEqual(snapshot);
  expect(snapshot).toMatchObject({
    source: "fallback",
    rates: fallbackRates,
    estimatedCurrencies: [...supportedCurrencies],
    updatedAt: null,
  });
});

test("SEO defaults use the production domain and preserve explicit local configuration", () => {
  for (const input of [undefined, "", "not a URL", "javascript:alert(1)", "https://user:password@example.test"]) {
    expect(normalizeSiteOrigin(input)).toBe("https://maldives.org");
  }
  expect(normalizeSiteOrigin("http://127.0.0.1:3000/path")).toBe("http://127.0.0.1:3000");
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
