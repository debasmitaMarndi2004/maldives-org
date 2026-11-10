import { expect, test } from "@playwright/test";
async function openFallback(page: import('@playwright/test').Page) {
 await page.route('https://tpscr.com/wl_web/main.js?wl_id=24430',r=>r.abort());
 await page.goto('/');
 await page.getByRole('link',{name:'Search flights',exact:false}).first().click();
 await page.getByRole('button',{name:'Use external Aviasales search instead'}).click();
}
const source="https://tpscr.com/content?**";
test('external fallback loads once with exact account settings',async({page})=>{
 let calls=0;
 await page.route(source,route=>{calls++;const p=new URL(route.request().url()).searchParams;expect(p.get('dark')).toBe('#000000');expect(p.has('no_labels')).toBe(false);expect(p.get('shmarker')).toBe('678887');expect(p.get('trs')).toBe('598417');expect(p.get('promo_id')).toBe('7879');expect(p.get('campaign_id')).toBe('100');expect(p.get('searchUrl')).toBe('www.aviasales.com/search');return route.fulfill({contentType:'application/javascript',body:`const form=document.createElement('form');form.innerHTML='<label>Flight origin<input aria-label="Flight origin"></label><button type="button">Find flights</button>';const host=document.createElement('div');document.currentScript.parentElement.appendChild(host);host.attachShadow({mode:'open'}).appendChild(form);`});});
 await openFallback(page);const widget=page.getByRole('region',{name:'Search flights'});await expect(widget).toHaveAttribute('data-widget-state','ready');await widget.getByLabel('Flight origin').fill('Delhi');await expect(widget.getByLabel('Flight origin')).toHaveValue('Delhi');expect(calls).toBe(1);await expect(widget.locator('script[src^="https://tpscr.com/content?"]')).toHaveCount(1);await expect(page.locator('.search-card')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('failed external fallback stays compact',async({page})=>{
 await page.route(source,route=>route.abort());await openFallback(page);const widget=page.getByRole('region',{name:'Search flights'});await expect(widget).toHaveAttribute('data-widget-state','unavailable');await expect(widget.getByRole('status')).toContainText('Please try again later');expect((await widget.boundingBox())!.height).toBeLessThan(300);
});
test('download without form times out instead of leaving an empty box',async({page})=>{
 await page.clock.install();await page.route(source,route=>route.fulfill({contentType:'application/javascript',body:'/* empty fixture */'}));await openFallback(page);const widget=page.getByRole('region',{name:'Search flights'});await expect(widget).toHaveAttribute('data-widget-state','loading');await expect(widget.locator('script')).toHaveCount(1);await page.clock.runFor(12500);await expect(widget).toHaveAttribute('data-widget-state','unavailable');
});
