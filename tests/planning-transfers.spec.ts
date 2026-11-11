import { expect, test } from "@playwright/test";
import { filterSampleTransferRoutes, sampleTransferRoutes } from "../lib/transfer-routes";
import { captureApplicationErrors } from "./browser-errors";

test("trip preferences survive Back navigation and invalid date ranges cannot advance", async ({ page }) => {
  const { errors } = captureApplicationErrors(page);
  await page.goto("/plan-your-trip");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page.getByRole("button", { name: "Show my trip", exact: false }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Enter valid arrival and departure dates.");
  await page.getByLabel("Arrival date", { exact: true }).fill("2027-06-12");
  await page.getByLabel("Departure date", { exact: true }).fill("2027-06-11");
  await page.getByRole("button", { name: "Show my trip", exact: false }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Departure must be after arrival.");
  await expect(page.getByText("Your planning preferences", { exact: true })).toHaveCount(0);
  await page.getByLabel("Departure date", { exact: true }).fill("2027-06-20");
  await page.getByLabel("Travellers", { exact: true }).selectOption("4");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: /Budget/ }).click();
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await expect(page.getByLabel("Arrival date", { exact: true })).toHaveValue("2027-06-12");
  await expect(page.getByLabel("Departure date", { exact: true })).toHaveValue("2027-06-20");
  await expect(page.getByLabel("Travellers", { exact: true })).toHaveValue("4");
  await page.getByRole("button", { name: "Show my trip", exact: false }).click();
  await expect(page.getByRole("status")).toContainText("2027-06-12");
  await expect(page.getByRole("status")).toContainText("2027-06-20");
  await expect(page.getByRole("status")).toContainText("4 travellers");
  await expect(page.getByRole("status")).toContainText("not date-specific availability");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Arrival date", { exact: true })).toHaveValue("2027-06-12");
  await expect(page.getByLabel("Travellers", { exact: true })).toHaveValue("4");
  expect(errors).toEqual([]);
});

test("transfer filtering matches both places and never invents matches", () => {
  expect(filterSampleTransferRoutes("airport", "maafushi").map((route) => route.slug)).toEqual(["airport-maafushi-speedboat"]);
  expect(filterSampleTransferRoutes("male", "dhigurah").map((route) => route.slug)).toEqual(["male-dhigurah-ferry"]);
  expect(filterSampleTransferRoutes("NO_MATCH", "NO_MATCH")).toEqual([]);
  expect(filterSampleTransferRoutes("", "")).toHaveLength(sampleTransferRoutes.length);
});

test("transfer search opens the selected sample route, handles empty results and preserves the legacy URL", async ({ page, request }) => {
  const { errors } = captureApplicationErrors(page);
  await page.goto("/transfers");
  await page.getByLabel("Starting point", { exact: true }).fill("Airport");
  await page.getByLabel("Destination", { exact: true }).fill("Maafushi");
  await page.getByRole("button", { name: "Find a route", exact: false }).click();
  await expect(page.locator(".route-list .route-row")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("1 sample route matches your search");
  await page.locator(".route-list .route-row").click();
  await expect(page).toHaveURL(/\/transfers\/airport-maafushi-speedboat$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Velana International Airport to Maafushi");
  await expect(page.getByRole("button", { name: "Transfer booking unavailable", exact: true })).toBeDisabled();
  await page.getByRole("link", { name: "Compare sample routes", exact: false }).click();
  await page.getByLabel("Starting point", { exact: true }).fill("NO_MATCH");
  await page.getByRole("button", { name: "Find a route", exact: false }).click();
  await expect(page.getByRole("status")).toContainText("No sample routes match this search");
  await expect(page.locator(".route-list .route-row")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear route search", exact: true }).click();
  await expect(page.locator(".route-list .route-row")).toHaveCount(4);
  expect((await request.get("/transfers/airport-to-island")).status()).toBe(200);
  expect((await request.get("/transfers/not-a-real-route")).status()).toBe(404);
  expect(errors).toEqual([]);
});
