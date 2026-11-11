import { expect, test } from "@playwright/test";
import { captureApplicationErrors } from "./browser-errors";
import { VIATOR_WIDGET_SOURCE } from "../lib/viator-widget";

// Keep editorial regressions independent of the live third-party widget network.
test.beforeEach(async ({ page }) => {
  await page.route(VIATOR_WIDGET_SOURCE, route => route.fulfill({ contentType: "application/javascript", body: "/* external widget omitted in editorial-only tests */" }));
});

for (const width of [360, 390, 412, 768, 1280]) {
  test(`dedicated tours page works at ${width}px without simulated booking`, async ({ page }) => {
    const { errors } = captureApplicationErrors(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("link", { name: "Explore Activities", exact: true }).click();
    await expect(page).toHaveURL(/\/tours-and-activities$/);
    await expect(page).toHaveTitle("Tours & Activities in the Maldives — Maldives.org");
    await expect(page.getByRole("heading", { name: "Tours & activities in the Maldives", exact: true })).toBeVisible();
    await page.getByRole("main").getByText("Explore our activity ideas & planning guides", { exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(5);
    await page.getByRole("group", { name: "Activity categories", exact: true }).getByRole("button", { name: "Snorkelling", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Reef snorkelling", exact: true })).toBeVisible();
    await page.reload();
    await page.getByRole("main").getByText("Explore our activity ideas & planning guides", { exact: true }).click();
    await expect(page.getByRole("group", { name: "Activity categories", exact: true }).getByRole("button", { name: "Snorkelling", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("link", { name: "Explore idea", exact: true }).click();
    await expect(page).toHaveURL(/\/tours-and-activities\/reef-snorkelling$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reef snorkelling");
    await expect(page.getByRole("button", { name: "Partner booking unavailable", exact: true })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("tour search, empty state and reset preserve URL state", async ({ page }) => {
  await page.goto("/tours-and-activities");
  await page.getByRole("main").getByText("Explore our activity ideas & planning guides", { exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Search activities", exact: true });
  await search.fill("sunset");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page).toHaveURL(/guideQ=sunset/);
  await search.fill("NO_MATCH_ACTIVITY");
  await expect(page.getByText("No activity ideas match these filters. Try another search or clear the category.")).toBeVisible();
  await page.getByRole("button", { name: "Show all activities", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(5);
  await expect(page).toHaveURL(/\/tours-and-activities$/);
});

test("new guides have canonical metadata and preserve original experience routes", async ({ page, request }) => {
  await page.goto("/tours-and-activities/sunset-cruise");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://maldives.org/tours-and-activities/sunset-cruise");
  await page.getByText("Existing experience preview", { exact: true }).click();
  await page.getByRole("link", { name: "View original preview", exact: false }).click();
  await expect(page).toHaveURL(/\/experiences\/sunset-cruise$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sunset cruise");
  expect((await request.get("/tours-and-activities/not-a-real-idea")).status()).toBe(404);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/tours-and-activities/sunset-cruise");
});
