import { test, expect } from "@playwright/test";
import { whiteLabelQuery } from "../lib/white-label";

// Synthetic vendor module tests our wiring; it is never deployed or called live inventory.
const moduleFixture=`
const config=window.TPWL_CONFIGURATION;
if(config.flightParams.destination!=='MLE')throw Error('MLE default missing');
if(config.resultsURL!==location.origin+location.pathname)throw Error('External results URL');
const p=new URLSearchParams(location.search);
let initial={origin:'',destination:config.flightParams.destination,date:'2027-02-10',passengers:'2',currency:'USD'};
try{if(p.has('flightSearch'))initial=JSON.parse(p.get('flightSearch'));}catch{}
const root=document.getElementById('tpwl-search').attachShadow({mode:'open'});
root.innerHTML='<style>form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:8px}label{min-width:0}input,select{box-sizing:border-box;max-width:100%;width:100%}</style><form><label>Origin airport<input name="origin"></label><label>Destination<input name="destination"></label><label>Departure<input name="date" type="date"></label><label>Passengers<select name="passengers"><option>1</option><option>2</option><option>3</option></select></label><label>Currency<select name="currency" aria-label="Currency"><option>USD</option><option>INR</option></select></label><button>Search flights</button></form>';
const form=root.querySelector('form');for(const [k,v]of Object.entries(initial))form.elements.namedItem(k).value=v;
const tickets=document.getElementById('tpwl-tickets').attachShadow({mode:'open'});
form.onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));const url=new URL(location.href);url.searchParams.set('flightSearch',JSON.stringify(data));url.searchParams.set('currency',data.currency);history.replaceState(null,'',url.href);window.dispatchEvent(new Event('urlchange'));tickets.innerHTML='<p>TEST FIXTURE — not a real fare</p><a href="https://www.aviasales.com/" target="_blank" rel="noopener">Book with provider</a>';};
`;
const source="https://tpscr.com/wl_web/main.js?wl_id=24430";
async function mock(page:import('@playwright/test').Page){
 let requests=0;
 await page.route(source,r=>{requests++;return r.fulfill({contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body:moduleFixture});});
 return ()=>requests;
}

test('provider URL state drops marker and external destination overrides',()=>{
 expect(whiteLabelQuery(new URLSearchParams('flightSearch=abc&currency=INR&marker=evil&resultsURL=https://evil.test'))).toBe('flightSearch=abc&currency=INR');
});

test('embed headers permit only same-origin framing while app protection remains',async({request})=>{
 const r=await request.get('/flights/embed');expect(r.headers()['x-frame-options']).toBe('SAMEORIGIN');expect(r.headers()['content-security-policy']).toContain("frame-ancestors 'self'");
 const html=await r.text();expect(html).toContain('wl_id=24430');expect(html.match(/id="tpwl-search"/g)).toHaveLength(1);expect(html.match(/id="tpwl-tickets"/g)).toHaveLength(1);expect(html).not.toContain('emrldco.com');
 const home=await request.get('/');expect(home.headers()['x-frame-options']).toBe('DENY');
});

for(const width of [360,390,412])test(`embedded flow at ${width}px preserves inputs and does not navigate off-site (fixture)`,async({page})=>{
 const count=await mock(page);await page.setViewportSize({width,height:850});await page.goto('/flights');
 const frame=page.frameLocator('iframe[title="Aviasales search and flight results"]');
 await expect(frame.getByLabel('Destination',{exact:true})).toHaveValue('MLE');
 await frame.getByLabel('Origin airport').fill('JFK');await frame.getByLabel('Passengers').selectOption('3');await frame.getByLabel('Currency',{exact:true}).selectOption('INR');await frame.getByLabel('Departure').fill('2027-03-15');
 await frame.getByRole('button',{name:'Search flights',exact:true}).click();await expect(frame.getByText('TEST FIXTURE — not a real fare')).toBeVisible();
 await expect(page).toHaveURL(/\/flights\?flightSearch=/);
 expect(new URL(page.url()).hostname).toBe('127.0.0.1');
 await expect(frame.getByLabel('Passengers')).toHaveValue('3');await expect(frame.getByLabel('Departure')).toHaveValue('2027-03-15');
 await expect(frame.getByRole('link',{name:'Book with provider'})).toHaveAttribute('href','https://www.aviasales.com/');
 expect(count()).toBe(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.reload();await expect(frame.getByLabel('Origin airport')).toHaveValue('JFK');await expect(frame.getByLabel('Passengers')).toHaveValue('3');await expect(frame.getByLabel('Currency',{exact:true})).toHaveValue('INR');
});

test('Next client navigation back creates one fresh vendor document',async({page})=>{
 const count=await mock(page);await page.goto('/');await page.getByRole('link',{name:'Search flights',exact:false}).first().click();
 let frame=page.frameLocator('iframe[title="Aviasales search and flight results"]');await expect(frame.getByLabel('Destination',{exact:true})).toHaveValue('MLE');expect(count()).toBe(1);
 await page.getByRole('link',{name:'Maldives.org home'}).click();await page.getByRole('link',{name:'Search flights',exact:false}).first().click();
 frame=page.frameLocator('iframe[title="Aviasales search and flight results"]');await expect(frame.getByLabel('Destination',{exact:true})).toHaveValue('MLE');expect(count()).toBe(2);
});

test('failed loader provides an honest error without external search controls',async({page})=>{
 await page.route(source,r=>r.abort());await page.route('https://tpscr.com/content?**',r=>r.fulfill({contentType:'application/javascript',body:'/* unavailable fixture */'}));
 await page.goto('/flights');await expect(page.getByRole('status')).toContainText('could not load');
 await page.evaluate(()=>window.postMessage({type:'maldives-tpwl',ready:true,query:'resultsURL=https://evil.test'},window.location.origin));await expect(page.getByRole('status')).toContainText('could not load');
 await expect(page.getByRole('button',{name:'Use external Aviasales search instead'})).toHaveCount(0);await expect(page.locator('script[src^="https://tpscr.com/content?"]')).toHaveCount(0);
});

for(const reduced of [false,true])test(`results scroll once after search; reduced motion=${reduced}`,async({page})=>{
 await mock(page);await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
 await page.addInitScript(()=>{
  const w=window as typeof window & {flightScrolls:ScrollToOptions[]};w.flightScrolls=[];
  const native=window.scrollTo.bind(window);
  window.scrollTo=((...args: unknown[])=>{if(args[0]&&typeof args[0]==='object'&&'behavior' in args[0])w.flightScrolls.push(args[0] as ScrollToOptions);Reflect.apply(native,window,args);}) as typeof window.scrollTo;
 });
 await page.goto('/flights');const frame=page.frameLocator('iframe[title="Aviasales search and flight results"]');await expect(frame.getByLabel('Destination',{exact:true})).toHaveValue('MLE');
 await expect(page.getByText('Choose your departure airport and explore flight options with Aviasales.',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Use external Aviasales search instead'})).toHaveCount(0);
 await frame.getByLabel('Origin airport').fill('JFK');
 const scrolls=()=>page.evaluate(()=>(window as typeof window & {flightScrolls:ScrollToOptions[]}).flightScrolls);
 expect(await scrolls()).toEqual([]);
 await frame.getByRole('button',{name:'Search flights',exact:true}).click();
 await expect.poll(async()=>(await scrolls()).length).toBe(1);
 expect((await scrolls())[0].behavior).toBe(reduced?'instant':'smooth');
 await page.waitForTimeout(1200);expect((await scrolls()).length).toBe(1);
});
