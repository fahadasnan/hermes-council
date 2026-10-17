import { chromium } from 'playwright';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = dirname(fileURLToPath(import.meta.url));
function loadEnv(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(readFileSync(path, 'utf8').split('\n').filter(l => l.trim() && !l.trim().startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]; }));
}
const env = { ...loadEnv(`${DIR}/.env`), ...process.env };
const BASE = 'https://app.loopyloyalty.com';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Track ALL POST/PUT/PATCH/DELETE API calls
const mutations = [];
page.on('request', req => {
  const url = req.url();
  if (url.includes('loopyloyalty.com/') && ['POST','PUT','PATCH','DELETE'].includes(req.method()) &&
      !url.match(/\.(css|js|png|jpg|gif|svg|ico|woff|ttf)(\?|$)/) &&
      !url.includes('/styles/') && !url.includes('/js/') && !url.includes('/images/') && !url.includes('/config/') &&
      !url.includes('google') && !url.includes('clarity') && !url.includes('stripe') && !url.includes('facebook') &&
      !url.includes('intercom') && !url.includes('youtube') && !url.includes('googletagmanager')) {
    mutations.push({ url, method: req.method(), postData: req.postData()?.substring(0, 3000) || null, time: Date.now() });
  }
});
page.on('response', async res => {
  const url = res.url();
  const match = mutations.findLast(r => r.url === url && !r.responseStatus);
  if (match) {
    match.responseStatus = res.status();
    try { match.responseBody = (await res.text()).substring(0, 3000); } catch {}
  }
});
// Also track GET API responses
const gets = [];
page.on('response', async res => {
  const url = res.url();
  if (url.includes('loopyloyalty.com/') && res.request().method() === 'GET' &&
      !url.match(/\.(css|js|png|jpg|gif|svg|ico|woff|ttf)(\?|$)/) &&
      !url.includes('/styles/') && !url.includes('/js/') && !url.includes('/images/') && !url.includes('/config/') &&
      !url.includes('google') && !url.includes('clarity') && !url.includes('stripe') && !url.includes('facebook') &&
      !url.includes('intercom') && !url.includes('youtube') && !url.includes('googletagmanager')) {
    const path = new URL(url).pathname;
    if (!gets.find(g => g.path === path)) {
      try {
        gets.push({ path, status: res.status(), body: (await res.text()).substring(0, 2000) });
      } catch {}
    }
  }
});

// Login
console.log('=== LOGIN ===');
await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(1000);
const user = page.locator('#username, input[type="text"][name="username"]').first();
await user.waitFor({ state: 'visible', timeout: 15000 });
await user.fill(env.DASHBOARD_USER);
const pass = page.locator('#password').first();
if (!(await pass.isVisible().catch(() => false))) await user.press('Enter');
await pass.waitFor({ state: 'visible', timeout: 15000 });
await pass.fill(env.DASHBOARD_PASS);
await pass.press('Enter');
await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);
console.log(`Auth: ${page.url()}`);

// Helper: capture
async function capture(label) {
  return await page.evaluate((lbl) => {
    const gv = (el) => { const r = el.getBoundingClientRect(); return r.width>0 && r.height>0 && r.top<window.innerHeight && r.bottom>0; };
    const url = window.location.href;
    const title = document.title;
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(gv).map(h => ({ level: h.tagName, text: h.textContent.trim().substring(0,200) }));
    const interactive = [];
    const seen = new Set();
    document.querySelectorAll('a,button,[role="button"],[role="link"],[role="tab"],input[type="submit"],input[type="button"]').forEach(el => {
      if (!gv(el)) return;
      const text = (el.textContent || el.value || '').trim().substring(0,150);
      const key = `${el.tagName}:${text}`;
      if (!text || seen.has(key)) return;
      seen.add(key);
      interactive.push({ tag: el.tagName, text, href: el.href||'', uiSref: el.getAttribute('ui-sref')||'', ngClick: (el.getAttribute('ng-click')||'').substring(0,150) });
    });
    const tables = Array.from(document.querySelectorAll('table')).filter(gv).map(t => ({ headers: Array.from(t.querySelectorAll('th')).map(th=>th.textContent.trim()), rows: t.querySelectorAll('tbody tr').length }));
    const bodyText = (document.body?.innerText||'').substring(0,6000);
    return { label: lbl, url, title, headings, interactive, tables, bodyText };
  }, label);
}

// Dismiss any premium modal
async function dismissModal() {
  try {
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelBtn.click();
      await page.waitForTimeout(1000);
      console.log('  Dismissed premium modal');
    }
    const closeBtn = page.locator('button:has-text("×"), [aria-label="Close"]').first();
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      console.log('  Dismissed close button');
    }
  } catch {}
}

// ===== START: Go to dashboard, navigate to My Cards, create a card =====
await page.goto(`${BASE}/dash`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismissModal();

console.log('\n=== DASHBOARD ===');
let state = await capture('dash');
console.log(`URL: ${state.url}`);
console.log(`Headings: ${state.headings.map(h=>h.text).join(' | ')}`);

// Click "Create New Card" on dashboard
console.log('\n=== CREATING CARD ===');
try {
  const createBtn = page.locator('button:has-text("Create New Card")').first();
  if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(3000);
  }
} catch (e) { console.log(`Create btn: ${e.message}`); }
await dismissModal();

let cardState = await capture('create-card');
console.log(`After create click: ${cardState.url}`);
console.log(`Headings: ${cardState.headings.map(h=>h.text).join(' | ')}`);
console.log(`Forms: ${cardState.interactive.length} interactive elements`);
cardState.interactive.slice(0, 30).forEach(el => console.log(`  [${el.tag}] "${el.text}"`));

// The card creation might redirect us to the card editor or show a form
// Check body text for clues
console.log(`Body: ${cardState.bodyText?.substring(0, 1000)}`);

// ===== NAVIGATE TO ALL KNOWN CARD SUB-PAGES =====
// First, check if we have a campaignId from the URL
let campaignId = '';
const urlMatch = cardState.url.match(/\/(?:edit|overview|customers|insights|messages)\/([a-zA-Z0-9_-]+)/);
if (urlMatch) campaignId = urlMatch[1];
console.log(`\nCampaign ID: ${campaignId || 'not found yet'}`);

// Try going to /manage-my-cards to see if there's a card
await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismissModal();

const cardsPage = await capture('manage-my-cards');
console.log(`\n=== MANAGE MY CARDS ===`);
console.log(`URL: ${cardsPage.url}`);
console.log(`Headings: ${cardsPage.headings.map(h=>h.text).join(' | ')}`);
console.log(`Tables: ${JSON.stringify(cardsPage.tables)}`);
console.log(`Interactive: ${cardsPage.interactive.map(el => `[${el.tag}] "${el.text}"`).join(', ')}`);
console.log(`Body preview: ${cardsPage.bodyText?.substring(0, 1500)}`);

// Check if there's a cards list or table
if (cardsPage.tables.length > 0) {
  console.log(`\nTable data: ${JSON.stringify(cardsPage.tables)}`);
}

// Try to find campaign/card links
const cardLinks = cardsPage.interactive.filter(el => 
  el.href.includes('/edit/') || el.href.includes('/overview/') || 
  el.href.includes('/customers/') || el.href.includes('/insights/') ||
  el.href.includes('/messages/') || el.text.includes('Edit') || el.text.includes('View')
);
console.log(`Card-related links: ${JSON.stringify(cardLinks)}`);

// Extract campaignId from any links
for (const link of cardLinks) {
  const m = link.href.match(/\/([a-zA-Z0-9_-]{15,})/);
  if (m && !campaignId) campaignId = m[1];
}

// ===== EXPLORE CARD SUB-PAGES =====
if (campaignId) {
  const subPages = [
    { url: `/edit/${campaignId}/design`, label: 'edit-design' },
    { url: `/edit/${campaignId}/details`, label: 'edit-details' },
    { url: `/edit/${campaignId}/locations`, label: 'edit-locations' },
    { url: `/edit/${campaignId}/data`, label: 'edit-data' },
    { url: `/edit/${campaignId}/labels`, label: 'edit-labels' },
    { url: `/edit/${campaignId}/support`, label: 'edit-support' },
    { url: `/overview/${campaignId}`, label: 'overview' },
    { url: `/customers/${campaignId}`, label: 'customers' },
    { url: `/insights/${campaignId}`, label: 'insights' },
    { url: `/messages/${campaignId}`, label: 'messages' },
  ];

  const subPageResults = [];
  for (const sp of subPages) {
    console.log(`\n=== ${sp.label} ===`);
    try {
      await page.goto(`${BASE}${sp.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      await dismissModal();
      const cap = await capture(sp.label);
      subPageResults.push(cap);
      console.log(`URL: ${cap.url}`);
      console.log(`Headings: ${cap.headings.map(h=>h.text).join(' | ')}`);
      console.log(`Interactive (${cap.interactive.length}):`);
      cap.interactive.slice(0, 20).forEach(el => console.log(`  [${el.tag}] "${el.text}"`));
      console.log(`Tables: ${cap.tables.length}, body: ${cap.bodyText?.substring(0, 300)}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
  
  writeFileSync(`${DIR}/crawl-output/card-pages.json`, JSON.stringify(subPageResults, null, 2));
}

// ===== DUMP ALL API ENDPOINTS =====
console.log(`\n=== API GET ENDPOINTS (${gets.length}) ===`);
gets.forEach(g => console.log(`  GET ${g.path} -> ${g.status}`));

console.log(`\n=== API MUTATIONS (${mutations.length}) ===`);
const uniqueMutations = new Map();
mutations.forEach(m => {
  const path = new URL(m.url).pathname;
  const key = `${m.method} ${path}`;
  if (!uniqueMutations.has(key)) uniqueMutations.set(key, m);
});
uniqueMutations.forEach((v,k) => {
  console.log(`  ${k} -> ${v.responseStatus || 'no response'} ${v.postData ? `postData: ${v.postData.substring(0,200)}` : ''}`);
});

// ===== EXPLORE SETTINGS SUB-PAGES =====
console.log(`\n=== SETTINGS ===`);
await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismissModal();
const settingsState = await capture('settings');
console.log(`URL: ${settingsState.url}`);
console.log(`Headings: ${settingsState.headings.map(h=>h.text).join(' | ')}`);
console.log(`Settings tabs: ${settingsState.interactive.filter(el => el.href === `${BASE}/` || el.uiSref).map(el => `[${el.tag}] "${el.text}" -> ${el.uiSref||el.href}`).join(', ')}`);

// Save
const output = {
  campaignId,
  cardsPage,
  cardLinks,
  mutations: [...uniqueMutations.values()].map(v => ({method: v.method, path: new URL(v.url).pathname, status: v.responseStatus, postData: v.postData?.substring(0,500)})),
  getEndpoints: gets.map(g => ({path: g.path, status: g.status})),
};
writeFileSync(`${DIR}/crawl-output/card-explore.json`, JSON.stringify(output, null, 2));
console.log(`\nDone! campaignId=${campaignId}`);

await browser.close();