import { expect, test } from "@playwright/test";

const widgetRoute = "https://tpscr.com/content?**";

test("trial loads once below the original search and preserves new dashboard attribution", async ({ page }) => {
  let requests = 0;
  await page.route(widgetRoute, route => {
    requests++;
    const params = new URL(route.request().url()).searchParams;
    expect(params.get("trs")).toBe("598417");
    expect(params.get("shmarker")).toBe("678887");
    expect(params.get("promo_id")).toBe("7879");
    expect(params.get("campaign_id")).toBe("100");
    expect(params.get("searchUrl")).toBe("www.aviasales.com/search");
    expect(params.get("show_hotels")).toBe("false");
    expect(params.get("powered_by")).toBe("false");
    expect(params.get("no_labels")).toBe("");
    // Synthetic vendor fixture, not evidence of real Aviasales search availability.
    return route.fulfill({ contentType: "application/javascript", body: `const host=document.currentScript.parentElement;const form=document.createElement('form');form.innerHTML='<label>Flight origin<input aria-label="Flight origin"></label><button type="button">Find flights</button>';host.appendChild(form);` });
  });
  await page.goto("/");
  const widget = page.getByRole("region", { name: "Search flights" });
  await expect(widget).toHaveAttribute("data-widget-state", "ready");
  await expect(page.getByRole("button", { name: "Search stays", exact: true })).toBeVisible();
  const searchBox = (await page.locator(".search-card").boundingBox())!;
  const widgetBox = (await widget.boundingBox())!;
  expect(widgetBox.y).toBeGreaterThanOrEqual(searchBox.y + searchBox.height);
  await widget.getByLabel("Flight origin").fill("Delhi");
  await expect(widget.getByLabel("Flight origin")).toHaveValue("Delhi");
  expect(requests).toBe(1);
  await expect(widget.locator('script[src^="https://tpscr.com/content?"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel("Check in").fill("2027-02-10");
  await page.getByLabel("Check out").fill("2027-02-15");
  await page.getByRole("button", { name: "Search stays", exact: true }).click();
  await expect(page).toHaveURL(/\/stay\?/);
  await expect(page.locator("#maldives-flight-search-trial")).toHaveCount(0);
});

test("blocked trial stays compact and does not hide the original search", async ({ page }, testInfo) => {
  await page.route(widgetRoute, route => route.abort());
  await page.goto("/");
  const widget = page.getByRole("region", { name: "Search flights" });
  await expect(widget).toHaveAttribute("data-widget-state", "unavailable");
  await expect(widget.getByRole("status")).toContainText("original stay search above is still available");
  await expect(page.getByRole("button", { name: "Search stays", exact: true })).toBeVisible();
  expect((await widget.boundingBox())!.height).toBeLessThan(300);
  await page.locator(".site-main").screenshot({ path: `/tmp/flight-trial-${testInfo.project.name}.png`, animations: "disabled" });
});

test("a downloaded script without visible controls times out instead of showing a blank box", async ({ page }) => {
  await page.clock.install();
  await page.route(widgetRoute, route => route.fulfill({ contentType: "application/javascript", body: "/* no search form rendered */" }));
  await page.goto("/");
  const widget = page.getByRole("region", { name: "Search flights" });
  await expect(widget).toHaveAttribute("data-widget-state", "loading");
  await page.clock.runFor(12500);
  await expect(widget).toHaveAttribute("data-widget-state", "unavailable");
  await expect(page.getByRole("button", { name: "Search stays", exact: true })).toBeVisible();
});
