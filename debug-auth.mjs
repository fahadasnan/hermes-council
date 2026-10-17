import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = dirname(fileURLToPath(import.meta.url));
const STATE = `${DIR}/auth.json`;

function loadEnv(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .filter((l) => l.trim() && !l.trim().startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
}

const env = { ...loadEnv(`${DIR}/.env`), ...process.env };
const dashboardUrl = env.DASHBOARD_URL;
const loginUrl = env.DASHBOARD_LOGIN_URL || dashboardUrl;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Log in using password
await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

const USER_SEL = [
  'input[autocomplete="username"]',
  'input[type="email"]',
  'input[type="tel"]',
  'input[name*="email" i]',
  'input[name*="phone" i]',
  'input[name*="user" i]',
  'input[id*="email" i]',
  'input[id*="user" i]',
  'input[name*="login" i]',
].join(', ');

const user = page.locator(USER_SEL).first();
await user.waitFor({ state: 'visible', timeout: 20000 });
await user.fill(env.DASHBOARD_USER);

const PASS_SEL = 'input[type="password"]';
const pass = page.locator(PASS_SEL).first();
if (!(await pass.isVisible().catch(() => false))) {
  await user.press('Enter');
}
await pass.waitFor({ state: 'visible', timeout: 20000 });
await pass.fill(env.DASHBOARD_PASS);
await pass.press('Enter');

// Wait for login to complete
await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);

console.log(`Landed on: ${page.url()}`);

// Dump ALL cookies
const cookies = await context.cookies();
console.log('\n=== ALL COOKIES ===');
cookies.forEach(c => {
  console.log(`${c.name}: domain=${c.domain} path=${c.path} httpOnly=${c.httpOnly} secure=${c.secure} sameSite=${c.sameSite}`);
  console.log(`  value=${c.value.substring(0, 100)}`);
});

// Dump localStorage
const ls = await page.evaluate(() => {
  const items = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    items[key] = localStorage.getItem(key).substring(0, 200);
  }
  return items;
});
console.log('\n=== LOCAL STORAGE ===');
Object.entries(ls).forEach(([k, v]) => console.log(`${k}: ${v}`));

// Dump sessionStorage
const ss = await page.evaluate(() => {
  const items = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    items[key] = sessionStorage.getItem(key).substring(0, 200);
  }
  return items;
});
console.log('\n=== SESSION STORAGE ===');
Object.entries(ss).forEach(([k, v]) => console.log(`${k}: ${v}`));

// Now save and try to reuse
await context.storageState({ path: STATE, indexedDB: true });
console.log(`\nSaved to ${STATE}`);

// Navigate to the dashboard homepage 
await page.goto('https://app.loopyloyalty.com', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
console.log(`After navigating to home: ${page.url()}`);

// Check if still logged in
const isOnLogin = page.url().includes('/auth/login');
console.log(`On login page: ${isOnLogin}`);

if (!isOnLogin) {
  // Snapshot the dashboard
  const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 5000) || '');
  console.log('\n=== DASHBOARD BODY TEXT ===');
  console.log(bodyText);
}

await browser.close();