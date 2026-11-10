import { expect, test } from "@playwright/test";
import {
  canLoadTravelpayoutsDrive,
  TRAVELPAYOUTS_DRIVE_BOOTSTRAP,
  TRAVELPAYOUTS_DRIVE_ID,
  TRAVELPAYOUTS_DRIVE_SOURCE,
  type DrivePermissions,
} from "../lib/travelpayouts-drive";
import { affiliateHandoffPath } from "../lib/affiliate-providers";
import { approvedAffiliateFixtures } from "./fixtures/affiliate-links";

// These tests never download or execute the unverified vendor script. The
// isolated bootstrap test substitutes a local counter; it verifies our loader,
// not vendor link rewriting, privacy behavior, or an enabled Next.js deployment.
const granted: DrivePermissions = {
  enabled: true,
  sourceVerified: true,
  attributionProtectionVerified: true,
  privacyReviewed: true,
  consentGranted: true,
};

test("Drive loading fails closed unless every explicit permission is granted", () => {
  expect(canLoadTravelpayoutsDrive({} as DrivePermissions)).toBe(false);
  expect(canLoadTravelpayoutsDrive({
    enabled: false,
    sourceVerified: false,
    attributionProtectionVerified: false,
    privacyReviewed: false,
    consentGranted: false,
  })).toBe(false);
  expect(canLoadTravelpayoutsDrive(granted)).toBe(true);

  for (const permission of Object.keys(granted) as (keyof DrivePermissions)[]) {
    expect(canLoadTravelpayoutsDrive({ ...granted, [permission]: false }), permission).toBe(false);
    const missing: Partial<DrivePermissions> = { ...granted };
    delete missing[permission];
    expect(canLoadTravelpayoutsDrive(missing as DrivePermissions), `missing ${permission}`).toBe(false);
  }
});

test("disabled application emits no Drive script, resource hints, or vendor request across navigation", async ({ page }) => {
  const vendorRequests: string[] = [];
  await page.route(/https?:\/\/(?:[^/]+\.)?emrldco\.com\//, async (route) => {
    // A regression is recorded and blocked before it can contact the vendor.
    vendorRequests.push(route.request().url());
    await route.abort("blockedbyclient");
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const html = await response!.text();
  expect(html).not.toContain(TRAVELPAYOUTS_DRIVE_SOURCE);
  await expect(page.getByRole("heading", { name: "Find your perfect Maldives." })).toBeVisible();

  const assertAbsent = async () => {
    await expect(page.locator(`script[id="${TRAVELPAYOUTS_DRIVE_ID}"], script[id="${TRAVELPAYOUTS_DRIVE_ID}-source"]`)).toHaveCount(0);
    await expect(page.locator('script[src*="emrldco.com"]')).toHaveCount(0);
    await expect(page.locator('link[href*="emrldco.com"][rel~="preconnect"], link[href*="emrldco.com"][rel~="preload"], link[href*="emrldco.com"][rel~="dns-prefetch"]')).toHaveCount(0);
    expect(vendorRequests).toEqual([]);
  };
  await assertAbsent();

  // Exercise a client-side route transition as well as the initial document.
  await page.getByRole("link", { name: "Discover Experiences", exact: false }).click();
  await expect(page).toHaveURL(/\/experiences$/);
  await expect(page.getByRole("main")).toBeVisible();
  await assertAbsent();
});

test("our bootstrap inserts one asynchronous mocked source and leaves existing links unchanged", async ({ page }) => {
  let mockedRequests = 0;
  const blockedRequests: string[] = [];
  await page.route("**/*", async (route) => {
    if (route.request().url() === TRAVELPAYOUTS_DRIVE_SOURCE) {
      mockedRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "window.__maldivesDriveMockExecutions = (window.__maldivesDriveMockExecutions || 0) + 1;",
      });
      return;
    }
    blockedRequests.push(route.request().url());
    await route.abort("blockedbyclient");
  });
  await page.setContent('<main><a id="local-link" href="/stay">Local discovery</a><a id="competing-link" href="https://www.viator.com/?utm_source=isolated-bootstrap-test">Existing partner</a></main>');
  const originalLinks = await page.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  await page.addScriptTag({ content: TRAVELPAYOUTS_DRIVE_BOOTSTRAP });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "__maldivesDriveMockExecutions"))).toBe(1);
  await page.addScriptTag({ content: TRAVELPAYOUTS_DRIVE_BOOTSTRAP });

  const source = page.locator(`script[id="${TRAVELPAYOUTS_DRIVE_ID}-source"]`);
  await expect(source).toHaveCount(1);
  await expect(source).toHaveAttribute("src", TRAVELPAYOUTS_DRIVE_SOURCE);
  await expect(source).toHaveAttribute("data-cmp-ab", "2");
  expect(await source.evaluate((script) => (script as HTMLScriptElement).async)).toBe(true);
  expect(mockedRequests).toBe(1);
  expect(await page.evaluate(() => Reflect.get(window, "__maldivesDriveMockExecutions"))).toBe(1);
  expect(await page.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(originalLinks);
  expect(blockedRequests).toEqual([]);
});

test("disabled Drive leaves approved competing affiliate handoffs intact", async ({ request }) => {
  const competingLinks = approvedAffiliateFixtures.filter((fixture) => fixture.provider !== "travelpayouts");
  expect(competingLinks.map((fixture) => fixture.provider).sort()).toEqual(["booking-com", "getyourguide", "viator"]);
  for (const fixture of competingLinks) {
    const response = await request.get(affiliateHandoffPath(fixture), { maxRedirects: 0 });
    expect([302, 303, 307]).toContain(response.status());
    expect(response.headers().location).toBe(fixture.url);
  }
});
