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

test("listing details remain accessible without live partner checkout", async ({ page }) => {
  for (const route of ["/stay/overwater-romance", "/stay/private-island-luxury", "/experiences/dive-with-manta-rays", "/experiences/sunset-cruise"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByText("Live booking is currently unavailable on Maldives.org.", { exact: true })).toBeVisible();
    await expect(page.locator('a[rel~="sponsored"], a[href^="/out/"]')).toHaveCount(0);
  }
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
  await page.route("**/api/inquiries", (route) => {
    if (mode === "preview") return route.continue();
    return route.fulfill({ status: 503, json: { ok: false, message: "Enquiry temporarily unavailable" } });
  });
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
  await page.goto("/");
  await page.getByLabel("Email address", { exact: true }).fill("qa@example.invalid");
  await page.getByRole("button", { name: "Sign me up" }).click();
  await expect(page.locator("#newsletter").getByRole("status")).toContainText(/preview/i);
  await expect(page.locator("#newsletter").getByRole("status")).not.toContainText("You’re on the list");
});

test("legacy booking parameters do not start a transaction", async ({ page }) => {
  await page.goto("/booking?supplier=hotelbeds&hotel=preview&rateKey=preview&price=1&currency=USD");
  await expect(page.getByRole("heading", { name: "Booking is currently unavailable" })).toBeVisible();
  await expect(page.getByRole("main").locator("form, iframe")).toHaveCount(0);
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Online checkout is unavailable" })).toBeVisible();
  await expect(page.getByRole("main").locator("form, iframe")).toHaveCount(0);
});
