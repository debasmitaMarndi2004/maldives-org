import { expect, test, type Page } from "@playwright/test";
import { maldivesDestinationIds, normalizeViatorTour, parseTourFilters, viatorSearchRequest } from "../lib/tours/viator-data";

const raw = {
  productCode: "QA100P1", title: "TEST FIXTURE — Maldives reef tour", description: "Synthetic integration data, not a real tour offer.", status: "ACTIVE",
  destinations: [{ ref: "4673", primary: true }],
  productUrl: "https://www.viator.com/tours/Male/Fixture/d4673-QA100P1?mcid=42383&pid=P00323298&medium=api&tag=a%2Bb&tag=two",
  images: [{ isCover: true, variants: [{ width: 720, url: "https://media-cdn.tripadvisor.com/test-fixture.jpg" }] }],
  reviews: { combinedAverageRating: 4.7, totalReviews: 23 }, pricing: { currency: "USD", summary: { fromPrice: 90 } }, duration: { fixedDurationInMinutes: 180 },
};
const geography = { destinations: [{ destinationId: 4673, name: "Malé", parentDestinationId: 4672 }, { destinationId: 4672, name: "Maldives", parentDestinationId: 1 }, { destinationId: 6, name: "Turkey", parentDestinationId: 1 }] };
const tour = normalizeViatorTour(raw, maldivesDestinationIds(geography))!;

test("both official search builders pin Maldives across every supported filter", () => {
  for (const q of ["", "Maldives"]) {
    const params = new URLSearchParams({ q, category: "Snorkelling", maxPrice: "150", duration: "240", sort: "price-asc", currency: "INR", page: "2" });
    const filters = parseTourFilters(params)!;
    expect(filters).not.toBeNull();
    const request = viatorSearchRequest(filters);
    const body = JSON.parse(JSON.stringify(request.body));
    expect(body.currency).toBe("INR");
    const filtering = body.productFiltering || body.filtering;
    expect(filtering.destination).toBe("4672");
    expect(filtering.tags).toEqual([11912]);
    expect(filtering.durationInMinutes.to).toBe(240);
    expect(q ? filtering.price.to : filtering.highestPrice).toBe(150);
    expect(q ? body.searchTypes[0].pagination.start : body.pagination.start).toBe(13);
  }
  for (const query of ["destination=Turkey", "url=https://evil.example", "category=Unknown", "currency=MVR", "maxPrice=-1", "maxPrice=NaN", "page=0", "page=101", "page=1&page=2", "duration=999", "sort=evil", `q=${"a".repeat(121)}`]) expect(parseTourFilters(new URLSearchParams(query)), query).toBeNull();
  const ratedText = viatorSearchRequest(parseTourFilters(new URLSearchParams("q=reef&sort=rating-desc"))!).body;
  expect("productSorting" in ratedText && ratedText.productSorting).toEqual({ sort: "REVIEW_AVG_RATING" });
});

test("provider normalization verifies geography, tracking and missing information", () => {
  const ids = maldivesDestinationIds(geography);
  expect(ids.has("4673")).toBe(true);
  expect(ids.has("6")).toBe(false);
  expect(normalizeViatorTour({ ...raw, destinations: [{ ref: "6" }] }, ids)).toBeNull();
  expect(normalizeViatorTour({ ...raw, status: "INACTIVE" }, ids)).toBeNull();
  const valid = normalizeViatorTour(raw, ids)!;
  expect(valid.bookingUrl).toBe(raw.productUrl);
  expect(valid.rating).toBe(4.7);
  const missing = normalizeViatorTour({ ...raw, reviews: {}, pricing: {}, images: [], duration: {}, productUrl: "javascript:alert(1)" }, ids)!;
  for (const field of ["rating", "reviews", "price", "image", "durationMinutes", "bookingUrl"] as const) expect(missing[field]).toBeNull();
  for (const url of ["https://www.viator.com.evil.example/tours/Male/test", "https://www.viator.com/?url=https://evil.example", "https://user:secret@www.viator.com/", "https://www.viator.com:8443/"]) expect(normalizeViatorTour({ ...raw, productUrl: url }, ids)?.bookingUrl).toBeNull();
});

async function mockCatalog(page: Page, empty = false) {
  const requests: URL[] = [];
  await page.route("https://media-cdn.tripadvisor.com/**", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="400"><rect width="720" height="400" fill="#b8e6e9"/><text x="35" y="100" font-size="28">TEST IMAGE — not a tour photo</text></svg>' }));
  await page.route("**/api/tours/viator?**", async route => {
    const url = new URL(route.request().url()); requests.push(url);
    const publicTour = { ...tour, bookingUrl: undefined };
    const isEmpty = empty || url.searchParams.get("q") === "no-match";
    await route.fulfill({ json: { ok: true, tours: isEmpty ? [] : [{ ...publicTour, currency: url.searchParams.get("currency") || "USD", hasBookingLink: true }], total: isEmpty ? 0 : 25, page: Number(url.searchParams.get("page") || "1"), currency: url.searchParams.get("currency") || "USD", sandbox: false } });
  });
  return requests;
}

for (const width of [360, 390, 412, 768, 1280]) test(`native API cards and filters remain usable at ${width}px (synthetic fixture)`, async ({ page }) => {
  const requests = await mockCatalog(page);
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/tours-and-activities");
  await expect(page).toHaveTitle("Tours & Activities in the Maldives — Maldives.org");
  const section = page.getByRole("region", { name: "Find your Maldives experience", exact: true });
  await expect(section.getByRole("article")).toHaveCount(1);
  if (width === 1280) expect((await section.getByRole("article").first().boundingBox())!.width).toBeGreaterThan(350);
  await expect(section).toContainText("$90.00");
  await expect(section.getByRole("link", { name: "View tour details", exact: false })).toHaveAttribute("href", "/tours-and-activities/viator/QA100P1");
  await page.getByRole("searchbox", { name: "Search Viator tours", exact: true }).fill("reef");
  await page.getByRole("button", { name: "Search tours", exact: false }).click();
  await expect(section.getByRole("status")).toContainText("25 tours match");
  expect(requests[requests.length - 1].searchParams.get("q")).toBe("reef");
  await section.getByRole("button", { name: "Snorkelling", exact: true }).click();
  await expect(section.getByRole("status")).toContainText("25 tours match");
  expect(requests[requests.length - 1].searchParams.get("category")).toBe("Snorkelling");
  await page.getByLabel("Maximum price (USD)", { exact: true }).fill("150");
  await section.getByRole("combobox", { name: "Duration", exact: true }).selectOption("240");
  await section.getByRole("combobox", { name: "Sort by", exact: true }).selectOption("price-asc");
  await page.getByRole("button", { name: "Search tours", exact: false }).click();
  await expect(section.getByRole("status")).toContainText("25 tours match");
  expect(requests[requests.length - 1].searchParams.get("maxPrice")).toBe("150");
  await section.getByRole("button", { name: "Next tours", exact: true }).click();
  await expect(section.getByRole("navigation")).toContainText("Page 2");
  await page.reload();
  await expect(page.getByRole("region", { name: "Find your Maldives experience" }).getByRole("navigation")).toContainText("Page 2");
  await page.getByRole("button", { name: "Clear tour filters", exact: true }).click();
  await expect(section.getByRole("button", { name: "All activities", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("searchbox", { name: "Search Viator tours", exact: true }).fill("no-match");
  await page.getByRole("button", { name: "Search tours", exact: false }).click();
  await expect(section.getByRole("heading", { name: "No tours match these filters.", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("search failures offer retry and preserve optional widget and editorial guides", async ({ page }) => {
  await page.route("**/api/tours/viator?**", route => route.fulfill({ json: { ok: false, message: "Synthetic service unavailable." } }));
  await page.goto("/tours-and-activities");
  await expect(page.getByRole("heading", { name: "Tour search is unavailable right now.", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry tour search", exact: true })).toBeVisible();
  await page.getByRole("main").getByText("Explore our activity ideas & planning guides", { exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(5);
  await expect(page.getByRole("region", { name: "Find your Maldives experience", exact: true }).getByText("Use the original Viator widget instead", { exact: true })).toBeVisible();
});

test("native API and booking handoffs reject caller-supplied redirects before provider access", async ({ request }) => {
  for (const query of ["destination=Turkey", "url=https://evil.example", "category=evil", "page=0", "currency=MVR"]) expect((await request.get(`/api/tours/viator?${query}`)).status()).toBe(400);
  expect((await request.post("/api/tours/viator", { data: {} })).status()).toBe(405);
  const handoff = await request.get("/tours-and-activities/viator/QA100P1/book?url=https://evil.example", { maxRedirects: 0 });
  expect(handoff.status()).toBe(400);
  expect(handoff.headers().location).toBeUndefined();
  const missing = await request.get("/tours-and-activities/viator/QA100P1/book", { maxRedirects: 0 });
  expect(missing.status()).toBe(503);
  expect(missing.headers().location).toBeUndefined();
});

test("sandbox results cannot masquerade as live offers and old queries cannot overwrite newer searches", async ({ page }) => {
  await page.route("**/api/tours/viator?**", async route => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("q") === "old") await new Promise(resolve => setTimeout(resolve, 600));
    const publicTour = { ...tour, bookingUrl: undefined };
    await route.fulfill({ json: { ok: true, tours: [{ ...publicTour, hasBookingLink: false }], total: 1, page: 1, currency: "USD", sandbox: true } }).catch(() => {});
  });
  await page.goto("/tours-and-activities");
  const section = page.getByRole("region", { name: "Find your Maldives experience", exact: true });
  await expect(section.getByRole("status")).toContainText("Sandbox test data");
  await page.getByRole("searchbox", { name: "Search Viator tours", exact: true }).fill("old");
  await page.getByRole("button", { name: "Search tours", exact: false }).click();
  await page.getByRole("searchbox", { name: "Search Viator tours", exact: true }).fill("new");
  await page.getByRole("button", { name: "Search tours", exact: false }).click();
  await expect(page).toHaveURL(/q=new/);
  await expect(section.getByRole("status")).toContainText("Sandbox test data");
  await expect(section.getByRole("link", { name: /Check availability/ })).toHaveCount(0);
});
