import { expect, test } from "@playwright/test";
import { captureApplicationErrors } from "./browser-errors";

for (const width of [360, 390, 412, 1280]) {
  test(`homepage discovery remains usable at ${width}px`, async ({ page }) => {
    const { errors } = captureApplicationErrors(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Find your perfect Maldives getaway.", exact: true })).toBeVisible();
    for (const name of ["Search Flights", "Find Stays", "Explore Activities"]) {
      await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Explore the Maldives", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Plan Your Maldives Trip", exact: true })).toBeVisible();
    // These sections are explicitly protected by the user's scope.
    await expect(page.getByRole("heading", { name: "Do something unforgettable.", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Paradise in your inbox.", exact: true })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation", exact: true })).toBeVisible();
    await page.getByLabel("Mobile currency", { exact: true }).selectOption("INR");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile navigation", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open menu", exact: true })).toBeFocused();
    await expect(page.locator(".experience-tile").first()).toContainText("₹");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("discovery actions retain real internal destinations", async ({ page }) => {
  await page.goto("/");
  for (const [name, href] of [["Search Flights", "/flights"], ["Find Stays", "/stay"], ["Explore Activities", "/tours-and-activities"], ["Read travel guide", "/guides"]]) {
    await expect(page.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
  const islands = page.getByRole("list", { name: "Maldives islands", exact: true });
  for (const [name, slug] of [["Malé", "male"], ["Maafushi", "maafushi"], ["Hulhumalé", "hulhumale"], ["Dhigurah", "dhigurah"]]) {
    await expect(islands.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", `/islands/${slug}`);
  }
  await expect(page.getByRole("link", { name: "View All Islands", exact: false })).toHaveAttribute("href", "/atolls");
  await page.getByRole("link", { name: "Find Stays", exact: true }).click();
  await expect(page).toHaveURL(/\/stay$/);
  await expect(page.getByRole("main")).toBeVisible();
});

test("header search finds an existing island and closes after navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search Maldives", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Find your Maldives", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Search resorts, islands or experiences", exact: true }).fill("Male");
  await dialog.getByRole("navigation", { name: "Search suggestions", exact: true }).getByRole("link", { name: /^Malé(?:\s|↗|$)/ }).click();
  await expect(page).toHaveURL(/\/islands\/male$/);
  await expect(page.getByRole("heading", { name: "Malé", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Find your Maldives", exact: true })).toHaveCount(0);
});

test("header search submits to the existing stay filter and Escape restores focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search Maldives", exact: true });
  await trigger.click();
  let dialog = page.getByRole("dialog", { name: "Find your Maldives", exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  dialog = page.getByRole("dialog", { name: "Find your Maldives", exact: true });
  await dialog.getByRole("textbox", { name: "Search resorts, islands or experiences", exact: true }).fill("QA_NO_MATCH_937");
  await dialog.getByRole("button", { name: "Search stays", exact: true }).click();
  await expect(page).toHaveURL(/\/stay\?q=QA_NO_MATCH_937$/);
  await expect(page.getByText("No stays match this search yet. Try another island, style or budget.", { exact: true })).toBeVisible();
});

test("header search Enter opens the exact matching experience", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search Maldives", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Find your Maldives", exact: true });
  const input = dialog.getByRole("textbox", { name: "Search resorts, islands or experiences", exact: true });
  await input.fill("súnset CRUISE");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/experiences\/sunset-cruise$/);
  await expect(page.getByRole("heading", { name: "Sunset cruise", exact: true })).toBeVisible();
});

test("business navigation is truthful about unavailable functionality", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const business = page.getByRole("button", { name: "Business Directory", exact: true });
  await business.click();
  await expect(page.getByRole("status").filter({ hasText: "The business directory is not available yet." })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.keyboard.press("Escape");
  await expect(business).toBeFocused();
  await expect(page.getByText("The business directory is not available yet.", { exact: true })).toHaveCount(0);
});
