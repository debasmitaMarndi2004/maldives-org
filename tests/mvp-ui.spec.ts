import { expect, test } from "@playwright/test";
import { captureApplicationErrors } from "./browser-errors";

for (const width of [360, 390, 412]) {
  test(`mobile navigation and currency controls respond at ${width}px`, async ({ page }) => {
    const { errors } = captureApplicationErrors(page);
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page.getByLabel("Mobile currency", { exact: true }).selectOption("INR");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
    await expect(page.locator(".experience-tile").first()).toContainText("₹");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Stay", exact: true }).click();
    await expect(page).toHaveURL(/\/stay$/);
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("category directories constrain inventory, filtering handles empty results, and map returns to list", async ({ page }) => {
  await page.goto("/resorts");
  await expect(page.locator(".directory-grid .stay-card").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Coral Garden House", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Maafushi Morning", exact: true })).toHaveCount(0);
  await page.goto("/guesthouses");
  await expect(page.getByRole("heading", { name: "Verified guesthouse listings are on their way.", exact: true })).toBeVisible();
  await expect(page.locator(".directory-grid .stay-card")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Private Island Luxury", exact: true })).toHaveCount(0);
  await page.goto("/stay");
  await page.getByPlaceholder("Search stays or islands").fill("NO_MATCH_REGRESSION");
  await expect(page.getByText("No stays match this search yet. Try another island, style or budget.")).toBeVisible();
  await page.getByPlaceholder("Search stays or islands").fill("");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.getByText("Map preview", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Back to list" }).click();
  await expect(page.locator("#results")).toBeVisible();
  await expect(page.locator(".directory-grid .stay-card").first()).toBeVisible();
});

test("approved providers are disclosed and missing approvals offer only details", async ({ page }) => {
  for (const [route, provider] of [["/stay/overwater-romance", "Travelpayouts"], ["/stay/private-island-luxury", "Booking.com"], ["/experiences/dive-with-manta-rays", "Viator"], ["/experiences/sunset-cruise", "GetYourGuide"]]) {
    await page.goto(route);
    const action = page.getByRole("link", { name: `Continue on ${provider}`, exact: false });
    await expect(action).toBeVisible();
    await expect(action).toHaveAttribute("href", /^\/out\//);
    await expect(action).toHaveAttribute("target", "_blank");
    await expect(action).toHaveAttribute("rel", /sponsored/);
    await expect(page.getByText("Booking, payment, final prices and availability are handled on the partner website. Opens in a new tab.")).toBeVisible();
  }
  await page.goto("/stay/coral-garden-house");
  await expect(page.getByText("Partner booking is not available for this listing yet.")).toBeVisible();
  await expect(page.locator('a[href^="/out/"]')).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View stay details", exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: /request to book/i })).toHaveCount(0);
});

test("affiliate service errors offer a retry without exposing an outbound link", async ({ page }) => {
  let available = false;
  await page.route("**/api/affiliates", async (route) => {
    if (available) await route.continue();
    else await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporarily unavailable" }) });
  });
  await page.goto("/stay/private-island-luxury");
  await expect(page.getByText("Partner links are temporarily unavailable.")).toBeVisible();
  await expect(page.locator('a[href^="/out/"]')).toHaveCount(0);
  available = true;
  await page.getByRole("button", { name: "Retry partner links" }).click();
  await expect(page.getByRole("link", { name: "Continue on Booking.com", exact: false })).toBeVisible();
});

test("remote image failure preserves the original hero and shows fallback only on listing media", async ({ page }) => {
  const { errors } = captureApplicationErrors(page);
  await page.route("https://images.unsplash.com/**", (route) => route.abort("failed"));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Find your perfect Maldives getaway." })).toBeVisible();
  // Next.js may briefly retain an additional hidden streaming segment.
  const hero = page.locator("[data-home-hero]:visible");
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveCSS("background-image", /\/images\/home-redesign\/hero\.webp/);
  await expect(hero).not.toHaveAttribute("data-media-state", /loading|fallback/);
  await expect(page.locator('.experience-tile[data-media-state="fallback"]').first()).toBeVisible();
  await expect(page.locator('.experience-tile[data-media-state="fallback"]').first()).toHaveCSS("background-image", /island-fallback\.svg/);
  expect(errors).toEqual([]);
});

test("contact preview is clearly not a saved enquiry and failed requests show an error", async ({ page }) => {
  let mode: "preview" | "error" = "preview";
  await page.route("**/api/inquiries", (route) => route.fulfill({ status: mode === "preview" ? 202 : 503, contentType: "application/json", body: JSON.stringify(mode === "preview" ? { ok: true, mode: "preview" } : { ok: false, message: "Enquiry temporarily unavailable" }) }));
  const fillContact = async () => {
    await page.getByLabel("Your name").fill("Local QA");
    await page.getByLabel("Email", { exact: true }).fill("qa@example.invalid");
    await page.getByLabel("How can we help?").fill("Intercepted browser test; never stored or sent.");
    await page.getByRole("button", { name: "Send enquiry" }).click();
  };
  await page.goto("/contact");
  await fillContact();
  await expect(page.getByRole("status")).toContainText("was not stored or sent");
  mode = "error";
  await page.reload();
  await fillContact();
  await expect(page.locator("form").getByRole("alert")).toContainText("Enquiry temporarily unavailable");
});

test("newsletter preview never claims a subscription was created", async ({ page }) => {
  await page.route("**/api/newsletter", (route) => route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ ok: true, mode: "preview" }) }));
  await page.goto("/");
  await page.getByLabel("Email address", { exact: true }).fill("qa@example.invalid");
  await page.getByRole("button", { name: "Sign me up" }).click();
  await expect(page.locator("#newsletter").getByRole("status")).toContainText(/preview/i);
  await expect(page.locator("#newsletter").getByRole("status")).not.toContainText("You’re on the list");
});

test("payment processing is disabled and forged live booking queries cannot activate a transaction", async ({ request, page }) => {
  for (const endpoint of ["/api/stripe/checkout", "/api/stripe/webhook", "/api/hotelbeds/booking", "/api/hotelbeds/checkrate"]) {
    const response = await request.post(endpoint, { data: {} });
    expect([409, 503]).toContain(response.status());
    expect((await response.json()).ok).toBe(false);
  }
  await page.goto("/booking?supplier=hotelbeds&hotel=forged&rateKey=forged&price=1&currency=USD&checkIn=2027-02-10&checkOut=2027-02-15");
  await expect(page.getByRole("button", { name: /confirm hotelbeds booking/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /continue to stripe/i })).toHaveCount(0);
  await page.goto("/checkout");
  await expect(page.getByRole("button", { name: /continue to stripe/i })).toHaveCount(0);
});
