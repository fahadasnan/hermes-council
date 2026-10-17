import { chromium } from 'playwright';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = `${DIR}/crawl-output`;
mkdirSync(OUT_DIR, { recursive: true });

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
const BASE = 'https://app.loopyloyalty.com';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Collect network
const allNetwork = [];
page.on('request', req => {
  const url = req.url();
  if (url.includes('loopyloyalty.com') && !url.includes('google') && !url.includes('clarity') && !url.includes('stripe') && !url.includes('facebook') && !url.includes('intercom') && !url.includes('youtube')) {
    allNetwork.push({ url, method: req.method(), postData: req.postData()?.substring(0, 1000) || null });
  }
});

// Login
console.log('=== LOGIN ===');
await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(1000);
const userSel = 'input[type="email"], input[autocomplete="username"], input[name*="email" i], input[name*="user" i]';
const user = page.locator(userSel).first();
await user.waitFor({ state: 'visible', timeout: 15000 });
await user.fill(env.DASHBOARD_USER);
const pass = page.locator('input[type="password"]').first();
if (!(await pass.isVisible().catch(() => false))) await user.press('Enter');
await pass.waitFor({ state: 'visible', timeout: 15000 });
await pass.fill(env.DASHBOARD_PASS);
await pass.press('Enter');
await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);
console.log(`Logged in: ${page.url()}`);

// Go to dashboard home
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
await page.waitForTimeout(3000);
console.log(`Dashboard: ${page.url()}`);

// Helper: get page state
async function getState(label) {
  return await page.evaluate((lbl) => {
    const url = window.location.href;
    const title = document.title;
    
    // Headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter(h => h.getBoundingClientRect().height > 0)
      .map(h => ({ level: h.tagName, text: h.textContent.trim().substring(0, 200) }));
    
    // All visible links and buttons
    const interactive = [];
    const seen = new Set();
    document.querySelectorAll('a, button, [role="button"], [role="link"], [role="tab"], [ng-click]:not(script), [data-ng-click]:not(script), [ui-sref]:not(script)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0) {
        const text = (el.textContent || '').trim().substring(0, 150);
        const key = `${el.tagName}:${text}`;
        if (!text || seen.has(key)) return;
        seen.add(key);
        interactive.push({
          tag: el.tagName,
          text,
          href: el.href || '',
          uiSref: el.getAttribute('ui-sref') || '',
          ngClick: (el.getAttribute('ng-click') || el.getAttribute('data-ng-click') || '').substring(0, 200),
          className: (el.className || '').substring(0, 150)
        });
      }
    });
    
    // Tables
    const tables = Array.from(document.querySelectorAll('table')).map(t => {
      const headers = Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim());
      const rowCount = t.querySelectorAll('tbody tr').length;
      return { headers, rowCount };
    });
    
    // Any form inputs
    const forms = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
    }).map(el => ({
      tag: el.tagName,
      type: el.type || '',
      name: el.name || '',
      placeholder: el.placeholder || '',
      id: el.id || ''
    }));
    
    // Body text preview
    const bodyText = document.body?.innerText?.substring(0, 5000) || '';
    
    return { label: lbl, url, title, headings, interactive, tables, forms, bodyText };
  }, label);
}

// ===== INITIAL STATE =====
console.log('\n=== INITIAL STATE (manage-my-cards) ===');
let state = await getState('manage-my-cards');
console.log(`URL: ${state.url}`);
state.headings.forEach(h => console.log(`  ${h.level}: ${h.text}`));
state.interactive.forEach(el => console.log(`  [${el.tag}] "${el.text}" | uiSref=${el.uiSref} | ngClick=${el.ngClick}`));
console.log(`Tables: ${state.tables.length}`);
console.log(`Forms: ${state.forms.length}`);

// Try to open hamburger menu - click "Toggle navigation"
const toggleBtn = state.interactive.find(el => el.text.includes('Toggle'));
if (toggleBtn) {
  console.log('\n=== TOGGLING NAVIGATION ===');
  try {
    await page.locator('button:has-text("Toggle navigation")').first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const navState = await getState('nav-open');
    console.log(`After toggle - interactive: ${navState.interactive.length}`);
    navState.interactive.forEach(el => console.log(`  [${el.tag}] "${el.text}" | uiSref=${el.uiSref} | ngClick=${el.ngClick}`));
  } catch (e) {
    console.log(`Toggle failed: ${e.message}`);
  }
}

// ===== CLICK EACH NAV ITEM =====
const navTargets = [
  { name: 'Dashboard', selector: 'text=Dashboard', urlCheck: 'dash' },
  { name: 'My Cards', selector: 'text=My Cards', urlCheck: 'manage-my-cards' },
  { name: 'Create New Card', selector: 'text=Create New Card', urlCheck: 'campaign' },
  { name: 'Subusers', selector: 'text=Subusers', urlCheck: 'subuser' },
  { name: 'Start', selector: 'text=Start', urlCheck: 'start' },
  { name: 'Settings', selector: 'text=Settings', urlCheck: 'settings' },
  { name: 'Help', selector: 'text=Help', urlCheck: 'help' },
];

const allStates = [state]; // Start with initial state
const edges = []; // graph edges

for (const target of navTargets) {
  console.log(`\n=== NAVIGATING TO: ${target.name} ===`);
  try {
    // Try to click the nav item (might need to reopen menu)
    const link = page.locator(target.selector).first();
    if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
      await link.click({ timeout: 5000 });
    } else {
      // Maybe it's hidden in collapsed menu - try opening first
      try {
        await page.locator('button:has-text("Toggle navigation")').first().click({ timeout: 3000 });
        await page.waitForTimeout(800);
        await link.click({ timeout: 5000 });
      } catch {
        console.log(`  Could not find/click "${target.name}"`);
        continue;
      }
    }
    await page.waitForTimeout(2000);
    
    const newState = await getState(target.name);
    console.log(`  URL: ${newState.url}`);
    console.log(`  Headings: ${newState.headings.map(h => `${h.level}:${h.text}`).join(' | ') || '(none)'}`);
    console.log(`  Interactive: ${newState.interactive.length} items`);
    newState.interactive.slice(0, 30).forEach(el => 
      console.log(`    [${el.tag}] "${el.text}" | uiSref=${el.uiSref} | ngClick=${el.ngClick}`)
    );
    console.log(`  Tables: ${newState.tables.length}`);
    console.log(`  Forms: ${newState.forms.length}`);
    
    // Record edge
    edges.push({ from: state.url, to: newState.url, type: 'navigates-to', via: target.name, fromLabel: state.label, toLabel: newState.label });
    
    allStates.push(newState);
    state = newState;
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

// ===== CREATE A TEST CARD =====
console.log('\n=== CREATING TEST CARD ===');
try {
  // Navigate to My Cards first
  await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Click Create New Card
  const createLink = page.locator('text=Create New Card').first();
  if (await createLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await createLink.click({ timeout: 5000 });
    await page.waitForTimeout(3000);
    const createState = await getState('create-card');
    console.log(`Create card page: ${createState.url}`);
    console.log(`Forms: ${JSON.stringify(createState.forms)}`);
    console.log(`Headings: ${createState.headings.map(h => h.text)}`);
    
    allStates.push(createState);
    edges.push({ from: 'manage-my-cards', to: createState.url, type: 'navigates-to', via: 'Create New Card' });
  }
} catch (e) {
  console.log(`Create card error: ${e.message}`);
}

// ===== ANALYZE API CALLS =====
console.log('\n=== API CALLS ===');
const uniqueApis = new Map();
allNetwork.forEach(req => {
  const url = req.url;
  if (url.includes('/api/') || url.includes('/v1/') || url.match(/\/[a-z]+\/[a-zA-Z0-9_-]{10,}/)) {
    const path = new URL(url).pathname.split('?')[0];
    const key = `${req.method} ${path}`;
    if (!uniqueApis.has(key)) {
      uniqueApis.set(key, { method: req.method, path, postData: req.postData });
    }
  }
});
uniqueApis.forEach((v, k) => console.log(`  ${k} ${v.postData ? '(has POST data)' : ''}`));

// ===== FINAL OUTPUT =====
const output = {
  allStates: allStates.map(s => ({
    label: s.label,
    url: s.url,
    headings: s.headings,
    interactiveSummary: s.interactive.slice(0, 50),
    tableCount: s.tables.length,
    formCount: s.forms.length,
    bodyPreview: s.bodyText?.substring(0, 1000)
  })),
  edges,
  apiEndpoints: [...uniqueApis.keys()],
};

writeFileSync(`${OUT_DIR}/full-crawl.json`, JSON.stringify(output, null, 2));
console.log(`\n=== DONE ===`);
console.log(`Pages: ${allStates.length}, Edges: ${edges.length}, APIs: ${uniqueApis.size}`);
console.log(`Output: ${OUT_DIR}/full-crawl.json`);

await browser.close();