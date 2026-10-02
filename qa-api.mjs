import { chromium } from 'file:///C:/Users/ADMIN/AppData/Local/Temp/maldives-qa-tools/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1364, height: 768 }, deviceScaleFactor: 1 });
const consoleIssues = [];
const missingResources = [];
page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') consoleIssues.push(`${msg.type()}: ${msg.text()}`); });
page.on('pageerror', (error) => consoleIssues.push(`pageerror: ${error.message}`));
page.on('response', (response) => { if (response.status() === 404) missingResources.push(response.url()); });

const routes = ['/booking', '/booking?type=stay&slug=overwater-romance', '/booking?type=experience&slug=dive-with-manta-rays', '/booking/confirmation', '/how-it-works', '/affiliate-disclosure'];
const routeChecks = [];
for (const route of routes) {
  const response = await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
  routeChecks.push({ route, status: response?.status() ?? null, hasMain: (await page.locator('main').count()) > 0, hasHeading: (await page.locator('h1').count()) > 0 });
}

await page.goto('http://localhost:3000/stay/overwater-romance', { waitUntil: 'networkidle' });
await Promise.all([page.waitForURL(/\/booking\?type=stay&slug=overwater-romance/), page.getByRole('link', { name: /Open booking flow/ }).click()]);
const stayBookingRoute = page.url();
await page.getByLabel('Full name').fill('QA Traveller');
await page.getByLabel('Email address').fill('qa@example.com');
await page.getByLabel('Check in').fill('2027-02-10');
await page.getByLabel('Check out').fill('2027-02-15');
await page.getByRole('checkbox').check();
await page.getByRole('button', { name: /Continue with this request/ }).click();
const submitted = await page.getByText('Your island plan is taking shape.').isVisible();
await Promise.all([page.waitForURL(/\/booking\/confirmation/), page.getByRole('link', { name: /See next steps/ }).click()]);
const confirmation = await page.getByText('Clear steps, no surprises.').isVisible();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await mobile.goto('http://localhost:3000/booking?type=experience&slug=dive-with-manta-rays', { waitUntil: 'networkidle' });
await mobile.screenshot({ path: 'C:/Users/ADMIN/.codex/visualizations/2026/10/01/01a0f756-7f37-7f81-8cb7-30296ae8d18e/booking-mobile.png', fullPage: true });
const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

console.log(JSON.stringify({ routeChecks, stayBookingRoute, submitted, confirmation, mobileOverflow, consoleIssues, missingResources }, null, 2));
await browser.close();
