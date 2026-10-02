import { expect, test } from "@playwright/test";

test("homepage search and currency controls work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Find your perfect Maldives." })).toBeVisible();
  await page.getByLabel("Currency").selectOption("INR");
  await expect(page.locator(".stay-footer").first()).toContainText("₹");
  await page.getByLabel("Check in").fill("2027-02-10");
  await page.getByLabel("Check out").fill("2027-02-15");
  await page.getByRole("button", { name: "Search stays" }).click();
  await expect(page).toHaveURL(/\/stay\?/);
  expect(errors).toEqual([]);
});

test("booking request endpoint gives a safe preview without Supabase", async ({ request }) => {
  const response = await request.post("/api/booking-requests", { data: { travelerName: "QA Traveller", travelerEmail: "qa@example.com", offerTitle: "Test Maldives stay", offerType: "stay", guests: 2 } });
  expect(response.status()).toBe(202);
  await expect(response).toBeOK();
  expect((await response.json()).mode).toBe("preview");
});

test("dynamic content routes render", async ({ page }) => {
  for (const route of ["/stay/overwater-romance", "/resorts/private-island-luxury", "/guesthouses/coral-garden-house", "/experiences/dive-with-manta-rays", "/booking/MD-PREVIEW", "/checkout"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  }
});
