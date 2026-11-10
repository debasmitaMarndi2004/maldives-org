import { expect, test } from "@playwright/test";

test("flight widget stays isolated, keeps attribution and preserves the hidden original search", async ({ page }) => {
  await page.goto("/");
  const frame = page.frameLocator('iframe[title="Travelpayouts flight search"]');
  const script = frame.locator('script[src^="https://tpscr.com/content?"]');
  await expect(script).toHaveCount(1);
  const url = new URL((await script.getAttribute("src"))!);
  expect(url.searchParams.get("trs")).toBe("598417");
  expect(url.searchParams.get("shmarker")).toBe("678887");
  expect(url.searchParams.get("campaign_id")).toBe("111");
  // Inject a local fixture into the sandbox; this does not verify the real vendor.
  await script.evaluate(() => {
    const form = document.createElement("form");
    form.innerHTML = '<label>From<input aria-label="From"></label><button type="button">Search flights</button>';
    document.body.appendChild(form);
    let isolated = false;
    try { void parent.document.body; } catch { isolated = true; }
    document.body.dataset.isolated = String(isolated);
  });
  await expect(frame.locator("body")).toHaveAttribute("data-isolated", "true");
  await frame.getByLabel("From").fill("Delhi");
  await expect(frame.getByRole("button", { name: "Search flights" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find your perfect Maldives." })).toBeVisible();
  await expect(page.locator(".search-card")).toHaveCount(1);
  await expect(page.locator(".search-card")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("widget script error provides an honest unavailable message", async ({ page }) => {
  await page.goto("/");
  const frame = page.frameLocator('iframe[title="Travelpayouts flight search"]');
  await frame.locator('script[src]').evaluate(script => script.dispatchEvent(new Event("error")));
  await expect(frame.getByRole("status")).toContainText("Flight search is unavailable");
  await expect(page.locator(".search-card")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTitle("Travelpayouts flight search")).toHaveCount(0);
  await page.getByLabel("Check in").fill("2027-02-10");
  await page.getByLabel("Check out").fill("2027-02-15");
  await page.getByRole("button", { name: "Search stays" }).click();
  await expect(page).toHaveURL(/\/stay\?/);
  await expect(page.getByRole("main")).toBeVisible();
});

test("a script load without rendered controls cannot leave a blank widget", async ({ page }, testInfo) => {
  await page.goto("/");
  const frame = page.frameLocator('iframe[title="Travelpayouts flight search"]');
  await frame.locator('script[src]').evaluate(script => script.dispatchEvent(new Event("load")));
  await expect(frame.getByRole("status")).toBeVisible();
  expect(await page.getByTitle("Travelpayouts flight search").evaluate(el => el.getBoundingClientRect().height)).toBeLessThan(150);
  // A different window must not be able to fake readiness and prevent fallback.
  await page.evaluate(() => window.postMessage({ type: "maldives-flight-widget", ready: true, height: 999 }, "*"));
  await expect(page.locator(".search-card")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTitle("Travelpayouts flight search")).toHaveCount(0);
  await page.locator(".search-card").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/tmp/maldives-flight-recovery-${testInfo.project.name}.png` });
});
