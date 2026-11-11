import { expect, test } from "@playwright/test";
import { atollDestinations, destinationSlug, findAtollDestination, findIslandDestination, islandDestinations } from "../lib/destination-slugs";

test("destination slug normalization preserves names and legacy atoll identities", () => {
  expect(destinationSlug("Kaafu / Malé")).toBe("kaafu-male");
  expect(destinationSlug("  Hulhumalé  ")).toBe("hulhumale");
  expect(findAtollDestination("kaafu-mal-")?.name).toBe("Kaafu / Malé");
  expect(findAtollDestination("kaafu-male")?.name).toBe("Kaafu / Malé");
  expect(findAtollDestination("not-a-real-atoll")).toBeUndefined();
  expect(findIslandDestination("not-a-real-island")).toBeUndefined();
});

test("atoll links use the canonical slug and old published alias stays available", async ({ page, request }) => {
  await page.goto("/atolls");
  const link = page.getByRole("link", { name: /Kaafu \/ Malé/ });
  await expect(link).toHaveAttribute("href", "/atolls/kaafu-male");
  await link.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kaafu / Malé");
  const legacy = await request.get("/atolls/kaafu-mal-");
  expect(legacy.status()).toBe(200);
  const html = await legacy.text();
  expect(html).toContain("Kaafu / Malé");
  expect(html).toContain('rel="canonical" href="https://maldives.org/atolls/kaafu-male"');
});

test("existing destination URLs preserve accurate names and resolve successfully", async ({ page, request }) => {
  for (const destination of atollDestinations) {
    expect((await request.get(`/atolls/${destination.slug}`)).status(), destination.name).toBe(200);
  }
  for (const destination of islandDestinations) {
    await page.goto(`/islands/${destination.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(destination.name);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://maldives.org/islands/${destination.slug}`);
  }
});

test("unknown destination, experience and guide URLs return actual HTTP 404", async ({ request }) => {
  for (const route of ["/islands/not-a-real-island", "/atolls/not-a-real-atoll", "/experiences/not-a-real-experience", "/guides/not-a-real-guide"]) {
    expect((await request.get(route)).status(), route).toBe(404);
  }
});
