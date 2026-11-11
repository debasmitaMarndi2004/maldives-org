import { expect, test, type Page } from "@playwright/test";
import { VIATOR_PARTNER_ID, VIATOR_WIDGET_REF, VIATOR_WIDGET_SOURCE } from "../lib/viator-widget";

const mainSource = "https://www.viator.com/orion/partner/widget-main.js";
const bookingUrl = "https://www.viator.com/?pid=P00323298&mcid=42383&campaign=synthetic%2Btest&tag=one&tag=two";
// Synthetic vendor fixtures validate integration only; these are not real tours.
async function mockViator(page: Page) {
  let requests = 0;
  await page.route(VIATOR_WIDGET_SOURCE, async route => {
    requests++;
    await route.fulfill({ contentType: "application/javascript", body: `if(!document.querySelector('script[data-vi-widget]')){const script=document.createElement('script');script.dataset.viWidget='1';script.async=true;script.src=${JSON.stringify(mainSource)};document.head.appendChild(script);}` });
  });
  await page.route(mainSource, route => route.fulfill({ contentType: "application/javascript", body: `if(!window.__VIATOR_WIDGET_SCR){window.__VIATOR_WIDGET_SCR=true;document.querySelectorAll('[data-vi-partner-id]').forEach(container=>{const frame=document.createElement('iframe');frame.title='Synthetic Viator fixture';frame.style='width:100%;height:0;border:0';container.appendChild(frame);window.addEventListener('message',event=>{if(event.source===frame.contentWindow&&event.origin==='https://www.viator.com'&&event.data.id==='vi-wm')frame.style.height=event.data.h+'px';});frame.src='https://www.viator.com/widget/partner/'+container.dataset.viPartnerId+'/'+container.dataset.viWidgetRef;});}` }));
  await page.route(`https://www.viator.com/widget/partner/${VIATOR_PARTNER_ID}/${VIATOR_WIDGET_REF}`, route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:15px;font:16px system-ui;background:#effaf6;box-sizing:border-box}a{display:inline-block;color:#09664d;padding:12px 0}</style><h2>TEST FIXTURE — not real tour inventory</h2><p>Integration test content only.</p><a href="${bookingUrl.replaceAll("&", "&amp;")}" target="_blank" rel="noopener">View synthetic partner destination</a><script>parent.postMessage({id:'vi-wm',h:260},'*');</script></html>` }));
  return () => requests;
}

test("isolated document uses fixed dashboard values and excludes competing scripts", async ({ request }) => {
  const response = await request.get("/tours-and-activities/embed");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
  expect(response.headers()["cache-control"]).toContain("no-store");
  const html = await response.text();
  expect(html).toContain(`data-vi-partner-id="${VIATOR_PARTNER_ID}"`);
  expect(html).toContain(`data-vi-widget-ref="${VIATOR_WIDGET_REF}"`);
  expect(html.match(/<script async src="https:\/\/www.viator.com\/orion\/partner\/widget.js"><\/script>/g)).toHaveLength(1);
  for (const excluded of ["emrldco.com", "letmeallez.js", "lma.stay22.com", "exp-api-key"]) expect(html).not.toContain(excluded);
  expect((await request.get("/tours-and-activities/embed?url=https://evil.example")).status()).toBe(400);
  expect((await request.get("/")).headers()["x-frame-options"]).toBe("DENY");
});

for (const width of [360, 390, 412, 768, 1280]) {
  test(`widget integrates responsively at ${width}px without changing editorial filters (fixture)`, async ({ page }) => {
    const count = await mockViator(page);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/tours-and-activities");
    await expect(page).toHaveTitle("Tours & Activities in the Maldives — Maldives.org");
    const section = page.getByRole("region", { name: "Explore Viator Experiences", exact: true });
    await expect(section.getByRole("status")).toContainText("Experiences provided by Viator");
    const embed = page.frameLocator('iframe[title="Viator Maldives tours and activities"]');
    const vendor = embed.frameLocator('iframe[title="Synthetic Viator fixture"]');
    await expect(vendor.getByRole("heading")).toContainText("TEST FIXTURE");
    await expect(vendor.getByRole("link")).toHaveAttribute("href", bookingUrl);
    await expect(section).toContainText("Viator for booking and payment");
    await page.getByRole("button", { name: "Snorkelling", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "Reef snorkelling", exact: true })).toBeVisible();
    expect(count()).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await vendor.locator("body").evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("client navigation and reload create exactly one installation per document (fixture)", async ({ page }) => {
  const count = await mockViator(page);
  await page.goto("/");
  await expect(page.locator('iframe[title="Viator Maldives tours and activities"]')).toHaveCount(0);
  await page.getByRole("link", { name: "Explore Activities", exact: true }).click();
  const section = page.getByRole("region", { name: "Explore Viator Experiences", exact: true });
  await expect(section.getByRole("status")).toContainText("Experiences provided by Viator");
  expect(count()).toBe(1);
  await page.getByRole("link", { name: "Maldives.org home", exact: true }).click();
  await page.getByRole("link", { name: "Explore Activities", exact: true }).click();
  await expect(section.getByRole("status")).toContainText("Experiences provided by Viator");
  expect(count()).toBe(2);
  await section.getByRole("button", { name: "Reload Viator experiences", exact: true }).click();
  await expect(section.getByRole("status")).toContainText("Experiences provided by Viator");
  expect(count()).toBe(3);
  const embed = page.frameLocator('iframe[title="Viator Maldives tours and activities"]');
  await expect(embed.locator(`script[src="${VIATOR_WIDGET_SOURCE}"]`)).toHaveCount(1);
  await expect(embed.locator("script[data-vi-widget]")).toHaveCount(1);
});

test("script failure has an accessible error and spoofed messages cannot activate it", async ({ page }) => {
  await page.route(VIATOR_WIDGET_SOURCE, route => route.abort());
  await page.goto("/tours-and-activities");
  const section = page.getByRole("region", { name: "Explore Viator Experiences", exact: true });
  await expect(section.getByRole("status")).toContainText("could not load");
  await page.evaluate(() => window.postMessage({ type: "maldives-viator-widget", ready: true, height: 500 }, location.origin));
  await expect(section.getByRole("status")).toContainText("could not load");
  await expect(page.getByRole("article")).toHaveCount(5);
  await mockViator(page);
  await section.getByRole("button", { name: "Reload Viator experiences", exact: true }).click();
  await expect(section.getByRole("status")).toContainText("Experiences provided by Viator");
});

test("a loaded script without rendered content times out rather than claiming inventory", async ({ page }) => {
  await page.route(VIATOR_WIDGET_SOURCE, route => route.fulfill({ contentType: "application/javascript", body: "/* no widget content */" }));
  await page.goto("/tours-and-activities");
  const section = page.getByRole("region", { name: "Explore Viator Experiences", exact: true });
  await expect(section.getByRole("status")).toContainText("Loading");
  await page.clock.install();
  await page.clock.fastForward(26000);
  await expect(section.getByRole("status")).toContainText("could not load");
});
