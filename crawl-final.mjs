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

// Login
console.log('Logging in...');
await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(1000);
await page.locator('#username').first().fill(env.DASHBOARD_USER, { timeout: 10000 });
await page.locator('#password').first().fill(env.DASHBOARD_PASS);
await page.locator('#password').first().press('Enter');
await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);

// Dismiss any modals
async function dismiss() {
  for (const btn of ['button:has-text("Cancel")', 'button:has-text("×")', '[aria-label="Close"]']) {
    try {
      const el = page.locator(btn).first();
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) { await el.click(); await page.waitForTimeout(500); }
    } catch {}
  }
}

// Helper
async function cap(label) {
  return await page.evaluate((lbl) => {
    const gv = el => { const r = el.getBoundingClientRect(); return r.width>0 && r.height>0 && r.top<window.innerHeight && r.bottom>0; };
    const url = window.location.href;
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(gv).map(h => ({level:h.tagName,text:h.textContent.trim().substring(0,200)}));
    const interactive = [];
    document.querySelectorAll('a,button,[role="button"],[role="link"],[role="tab"],input[type="submit"],input[type="button"]').forEach(el => {
      if (!gv(el)) return;
      const text = (el.textContent||el.value||'').trim().substring(0,150);
      if (text) interactive.push({tag:el.tagName,text,href:el.href||'',uiSref:el.getAttribute('ui-sref')||'',ngClick:(el.getAttribute('ng-click')||'').substring(0,120)});
    });
    return {label:lbl,url,headings,interactive:interactive.slice(0,50),body:(document.body?.innerText||'').substring(0,3000)};
  }, label);
}

// ===== 1. CREATE AND SAVE A CARD =====
console.log('\n=== CREATING TEST CARD ===');
await page.goto(`${BASE}/dash`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismiss();

// Click Create New Card
await page.locator('button:has-text("Create New Card")').first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(3000);
await dismiss();
console.log(`Editor: ${page.url()}`);

// Go to Details tab
await page.locator('text=Details').first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismiss();

let detailsState = await cap('edit-details');
console.log(`Details page: ${detailsState.url}`);

// Fill in required fields
const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea')).filter(el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0&&r.top<window.innerHeight; }).map(el => ({tag:el.tagName,type:el.type,name:el.name,id:el.id,placeholder:el.placeholder,value:el.value})));
console.log('Inputs:', JSON.stringify(inputs.slice(0, 15), null, 2));

// Try to fill the form
try {
  // Business Name (may be required)
  const bizNameInput = page.locator('input[name="businessName"], input[placeholder*="Business"], input[id*="business"]').first();
  if (await bizNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await bizNameInput.fill('COUNCIL-TEST Business');
    console.log('Filled business name');
  }
  
  // Reward description  
  const rewardInput = page.locator('input[name="rewardName"], input[placeholder*="reward"], input[id*="reward"], textarea').first();
  if (await rewardInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await rewardInput.fill('COUNCIL-TEST Free Coffee');
    console.log('Filled reward');
  }

  // Card description
  const descInput = page.locator('input[name="cardDescription"], textarea[placeholder*="description"], input[placeholder*="description"]').first();
  if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await descInput.fill('COUNCIL-TEST Loyalty Card Description');
    console.log('Filled description');
  }

  // How to earn stamp
  const earnInput = page.locator('input[name="howToEarn"], textarea[placeholder*="earn"], input[placeholder*="earn"], textarea').nth(1).or(page.locator('textarea').first());
  // Try generic textareas
  const textareas = page.locator('textarea');
  const count = await textareas.count();
  console.log(`Found ${count} textareas`);
  for (let i = 0; i < count; i++) {
    const ta = textareas.nth(i);
    if (await ta.isVisible({ timeout: 500 }).catch(() => false)) {
      await ta.fill(`COUNCIL-TEST Earn stamps by visiting us!`);
      console.log(`Filled textarea ${i}`);
      if (i >= 2) break;
    }
  }
} catch (e) {
  console.log(`Fill error: ${e.message}`);
}

// Click Save
try {
  await page.locator('button:has-text("Save")').first().click({ timeout: 5000 });
  await page.waitForTimeout(4000);
  await dismiss();
  console.log(`After save: ${page.url()}`);
} catch (e) {
  console.log(`Save error: ${e.message}`);
}

// ===== 2. CHECK MANAGE MY CARDS for saved card =====
console.log('\n=== CHECK MANAGE MY CARDS ===');
await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismiss();
const mcState = await cap('manage-my-cards-final');
console.log(`URL: ${mcState.url}`);
console.log(`Headings: ${mcState.headings.map(h=>h.text).join(' | ')}`);
console.log(`Interactive: ${mcState.interactive.map(el=>`[${el.tag}]"${el.text}"`).join(', ')}`);
console.log(`Body: ${mcState.body?.substring(0, 1500)}`);

// Extract campaign ID from links
let campaignId = '';
for (const el of mcState.interactive) {
  const m = el.href.match(/\/([a-zA-Z0-9_-]{15,})/);
  if (m) { campaignId = m[1]; break; }
}
console.log(`Campaign ID: ${campaignId || 'NONE FOUND'}`);

// ===== 3. EXPLORE SETTINGS SUB-TABS =====
console.log('\n=== SETTINGS SUB-TABS ===');
await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
await dismiss();

// Click each settings tab
const settingsTabs = ['General', 'Business', 'Privacy', 'Password', 'Developer Tools', 'Delete', 'Plan', 'Credit Card', 'Invoices'];
for (const tab of settingsTabs) {
  try {
    console.log(`\n--- Settings: ${tab} ---`);
    const tabEl = page.locator(`a:has-text("${tab}")`).first();
    if (await tabEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tabEl.click({ timeout: 5000 });
      await page.waitForTimeout(1500);
      const s = await cap(`settings-${tab.toLowerCase()}`);
      console.log(`URL: ${s.url}, Headings: ${s.headings.map(h=>h.text).join(' | ')}`);
    } else {
      console.log(`  Tab "${tab}" not visible`);
    }
  } catch (e) {
    console.log(`  Error: ${e.message}`);
  }
}

await browser.close();
console.log('\nDone!');