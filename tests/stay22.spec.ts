import { expect, test } from "@playwright/test";
import { accommodations } from "../lib/accommodations/catalog";
import { accommodationPartnerDocument } from "../lib/accommodations/partner-document";
import { isStay22Host, isStay22SupplierDestination, parseStay22Links, STAY22_BOOTSTRAP, STAY22_LMA_ID, STAY22_SCRIPT_URL, type Stay22Link } from "../lib/stay22";

// Synthetic test records only. Never deployed as approved commercial destinations;
// browser mocks do not request suppliers, make bookings or exercise real attribution.
const fixture: Stay22Link = { slug: "villa-park", supplier: "booking-com", url: "https://www.booking.com/hotel/mv/local-test-property.html", approved: true, reviewedOn: "2026-11-10" };
const known = new Set(accommodations.map((p) => p.slug));

test("Stay22 accepts only reviewed untagged supported property links", () => {
  expect(parseStay22Links(undefined, known).status).toBe("unconfigured");
  expect(parseStay22Links(JSON.stringify([fixture]), known).links).toEqual([fixture]);
  for (const url of ["https://www.booking.com/", fixture.url + "?aid=other-affiliate", fixture.url + "#x", fixture.url + "?next=https://evil.test", "javascript:alert(1)", "https://www.booking.com.evil.test/hotel/mv/test.html", "https://www.booking.com:443/hotel/mv/test.html", "https://www.booking.com/hotel/mv/%2e%2e.html", "https://user@www.booking.com/hotel/mv/test.html"]) {
    expect(isStay22SupplierDestination("booking-com", url), url).toBe(false);
  }
  for (const record of [{ ...fixture, slug: "fake" }, { ...fixture, approved: false }, { ...fixture, reviewedOn: "2026-02-31" }, { ...fixture, supplier: "travelpayouts" }, { ...fixture, extra: true }]) {
    expect(parseStay22Links(JSON.stringify([record]), known).status).toBe("invalid");
  }
  expect(parseStay22Links(JSON.stringify([fixture, fixture]), known).status).toBe("invalid");
  expect(isStay22Host("maldives.org")).toBe(true);
  expect(isStay22Host("www.maldives.org")).toBe(true);
  expect(isStay22Host("maldives.org.evil.test")).toBe(false);
  expect(isStay22Host("localhost")).toBe(false);
});

test("unconfigured route is a separate no-store document without Drive or Stay22", async ({ request }) => {
  const response = await request.get("/stay/partners/villa-park");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  const html = await response.text();
  expect(html).toContain("Partner booking unavailable.");
  expect(html).not.toContain(STAY22_SCRIPT_URL);
  expect(html).not.toContain("emrldco.com");
  expect(html).not.toContain("/_next/");
  expect((await request.get("/stay/partners/villa-park?url=https://evil.test")).status()).toBe(400);
  expect((await request.get("/stay/partners/not-a-real-property")).status()).toBe(404);
});

test("isolated loader waits for choice, runs once and enables only converted links (mock)", async ({ page }) => {
  let requests = 0;
  await page.route(STAY22_SCRIPT_URL, async (route) => {
    requests++;
    await route.fulfill({ contentType: "text/javascript", body: "document.querySelector('[data-stay22-partner]').href='https://www.stay22.com/allez/booking?test=synthetic';" });
  });
  await page.route("https://maldives.org/stay/partners/villa-park", (route) => route.fulfill({ contentType: "text/html", body: accommodationPartnerDocument(accommodations[0], [fixture], true) }));
  await page.goto("https://maldives.org/stay/partners/villa-park");
  const partner = page.locator("[data-stay22-partner]");
  await expect(partner).toHaveAttribute("inert", "");
  expect(requests).toBe(0);
  await page.getByRole("button", { name: "Load Stay22 partner links" }).click();
  await expect(partner).toHaveAttribute("aria-disabled", "false");
  await expect(partner).not.toHaveAttribute("inert", "");
  expect(await page.evaluate(() => (window as unknown as { Stay22: { params: { lmaID: string } } }).Stay22.params.lmaID)).toBe(STAY22_LMA_ID);
  await page.addScriptTag({ content: STAY22_BOOTSTRAP });
  expect(requests).toBe(1);
  await expect(page.locator(`script[src="${STAY22_SCRIPT_URL}"]`)).toHaveCount(1);
  await expect(page.locator('script[src*="emrldco.com"]')).toHaveCount(0);
  await expect(partner).toHaveAttribute("rel", "sponsored noopener noreferrer");
  // Inspect destination; never follow a supplier/commission URL in these tests.
  await expect(partner).toHaveAttribute("href", "https://www.stay22.com/allez/booking?test=synthetic");
});

test("a loaded script without confirmed rewriting keeps booking disabled (mock)", async ({ page }) => {
  await page.clock.install();
  await page.route(STAY22_SCRIPT_URL, (route) => route.fulfill({ contentType: "text/javascript", body: "/* fixture: loads but does not convert */" }));
  await page.route("https://maldives.org/stay/partners/villa-park", (route) => route.fulfill({ contentType: "text/html", body: accommodationPartnerDocument(accommodations[0], [fixture], true) }));
  await page.goto("https://maldives.org/stay/partners/villa-park");
  await page.getByRole("button", { name: "Load Stay22 partner links" }).click();
  await page.clock.fastForward(16000);
  await expect(page.getByRole("status")).toContainText("could not be confirmed");
  await expect(page.locator("[data-stay22-partner]")).toHaveAttribute("inert", "");
});

test("existing installation is detected without injecting another script (mock)", async ({ page }) => {
  let requests = 0;
  await page.route(STAY22_SCRIPT_URL, (route) => { requests++; return route.fulfill({ contentType: "text/javascript", body: "/* synthetic existing installation */" }); });
  await page.route("https://maldives.org/stay/partners/villa-park", (route) => route.fulfill({ contentType: "text/html", body: accommodationPartnerDocument(accommodations[0], [fixture], true) }));
  await page.goto("https://maldives.org/stay/partners/villa-park");
  await page.addScriptTag({ url: STAY22_SCRIPT_URL });
  await page.getByRole("button", { name: "Load Stay22 partner links" }).click();
  expect(requests).toBe(1);
  await expect(page.locator(`script[src="${STAY22_SCRIPT_URL}"]`)).toHaveCount(1);
});

test("a conflicting LMA account is not overwritten or loaded (mock)", async ({ page }) => {
  let requests = 0;
  await page.addInitScript(() => { Reflect.set(window, "Stay22", { params: { lmaID: "synthetic-other-installation" } }); });
  await page.route(STAY22_SCRIPT_URL, (route) => { requests++; return route.abort(); });
  await page.route("https://maldives.org/stay/partners/villa-park", (route) => route.fulfill({ contentType: "text/html", body: accommodationPartnerDocument(accommodations[0], [fixture], true) }));
  await page.goto("https://maldives.org/stay/partners/villa-park");
  await page.getByRole("button", { name: "Load Stay22 partner links" }).click();
  await expect(page.getByRole("status")).toContainText("different Stay22 installation");
  expect(requests).toBe(0);
  await expect(page.locator("[data-stay22-partner]")).toHaveAttribute("inert", "");
});

test("vendor network failure cannot activate booking (mock)", async ({ page }) => {
  await page.route(STAY22_SCRIPT_URL, (route) => route.abort("failed"));
  await page.route("https://maldives.org/stay/partners/villa-park", (route) => route.fulfill({ contentType: "text/html", body: accommodationPartnerDocument(accommodations[0], [fixture], true) }));
  await page.goto("https://maldives.org/stay/partners/villa-park");
  await page.getByRole("button", { name: "Load Stay22 partner links" }).click();
  await expect(page.getByRole("status")).toContainText("could not load");
  await expect(page.locator("[data-stay22-partner]")).toHaveAttribute("inert", "");
});
