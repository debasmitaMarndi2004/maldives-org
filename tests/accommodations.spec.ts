import { expect, test } from "@playwright/test";
import { accommodations } from "../lib/accommodations/catalog";
import { accommodationFilterQuery, filterAccommodations, parseAccommodationFilters } from "../lib/accommodations/search";
import { captureApplicationErrors } from "./browser-errors";

test("catalog filters combine verified fields and reject unknown filter values", () => {
  const filters = parseAccommodationFilters(new URLSearchParams("q=nautica&atoll=North+Mal%C3%A9+Atoll&amenity=Diving&amenity=Spa&type=Resort"));
  expect(filterAccommodations(filters).map((p) => p.slug)).toEqual(["villa-nautica"]);
  const roundtrip = parseAccommodationFilters(new URLSearchParams(accommodationFilterQuery(filters)));
  expect(roundtrip).toEqual(filters);
  expect(parseAccommodationFilters(new URLSearchParams("type=Fake&island=Fake&atoll=Fake&amenity=Fake")).type).toBe("");
  expect(accommodations.every((p) => !Object.hasOwn(p, "price") && !Object.hasOwn(p, "rating"))).toBe(true);
});

for (const width of [360, 390, 412, 768, 1280]) {
  test(`accommodation discovery is usable at ${width}px`, async ({ page }) => {
    const { errors } = captureApplicationErrors(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/stay");
    await expect(page).toHaveTitle("Hotels & Resorts in the Maldives — Maldives.org");
    await expect(page.locator(".directory-grid article")).toHaveCount(5);
    await page.getByRole("searchbox", { name: "Search stays", exact: true }).fill("villa");
    await page.getByLabel("Atoll", { exact: true }).selectOption("North Malé Atoll");
    await expect(page.locator(".directory-grid article")).toHaveCount(1);
    await expect(page).toHaveURL(/atoll=North/);
    await page.reload();
    await expect(page.getByLabel("Atoll", { exact: true })).toHaveValue("North Malé Atoll");
    await expect(page.locator(".directory-grid article")).toHaveCount(1);
    await page.getByRole("link", { name: "Explore stay", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Villa Nautica", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Check availability", exact: true })).toBeDisabled();
    await expect(page.getByRole("status").filter({ hasText: "Booking partner unavailable" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("island, type and amenities preserve a shareable result and clear correctly", async ({ page }) => {
  await page.goto("/stay");
  await page.getByLabel("Island", { exact: true }).selectOption("Maafushi");
  await page.getByLabel("Accommodation type", { exact: true }).selectOption("Hotel");
  await page.getByText("Amenities", { exact: true }).click();
  await page.getByRole("checkbox", { name: "Infinity pool", exact: true }).check();
  await expect(page.locator(".directory-grid article")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Kaani Palm Beach", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Clear filters/ }).click();
  await expect(page.locator(".directory-grid article")).toHaveCount(5);
  await expect(page).toHaveURL(/\/stay$/);
  await page.getByRole("link", { name: "Guesthouses", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Verified guesthouse listings are on their way." })).toBeVisible();
  await expect(page.locator(".directory-grid article")).toHaveCount(0);
});

test("details have source attribution and SEO without invented commercial facts", async ({ page, request }) => {
  await page.goto("/stay/villa-park");
  await expect(page).toHaveTitle("Villa Park · Sun Island — Maldives.org");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://maldives.org/stay/villa-park");
  await expect(page.getByRole("link", { name: "Official property/operator website", exact: false })).toHaveAttribute("href", "https://villaresorts.com/villa-park/");
  await expect(page.getByText("Original thematic artwork · not a photograph of Villa Park")).toBeVisible();
  await expect(page.locator('a[href^="/stay/partners/"]')).toHaveCount(0);
  await expect(page.locator('script[src*="stay22.com"]')).toHaveCount(0);
  const missing = await request.get("/stay/not-a-real-accommodation");
  expect(missing.status()).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/stay/villa-park");
  expect(sitemap).not.toContain("/stay/private-island-luxury");
  await page.goto("/stay/private-island-luxury");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
