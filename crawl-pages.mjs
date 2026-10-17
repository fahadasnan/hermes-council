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
await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 }); await page.waitForTimeout(1000);
await page.locator('#username').first().fill(env.DASHBOARD_USER, { timeout: 10000 });
await page.locator('#password').first().fill(env.DASHBOARD_PASS);
await page.locator('#password').first().press('Enter');
await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {}); await page.waitForTimeout(3000);

async function dismiss() {
  for (const btn of ['button:has-text("Cancel")', 'button:has-text("×")', '[aria-label="Close"]']) {
    try { const el = page.locator(btn).first(); if (await el.isVisible({timeout:1000}).catch(()=>false)) { await el.click(); await page.waitForTimeout(500); } } catch {}
  }
}

async function cap(label) {
  return await page.evaluate((lbl) => {
    const gv = el => { const r = el.getBoundingClientRect(); return r.width>0 && r.height>0 && r.top<window.innerHeight && r.bottom>0; };
    const url = window.location.href;
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(gv).map(h => ({level:h.tagName,text:h.textContent.trim().substring(0,200)}));
    const interactive = [];
    document.querySelectorAll('a,button,[role="button"],[role="link"],[role="tab"],input[type="submit"]').forEach(el => {
      if (!gv(el)) return;
      const text = (el.textContent||el.value||'').trim().substring(0,150);
      if (text) interactive.push({tag:el.tagName,text,href:el.href||'',uiSref:el.getAttribute('ui-sref')||''});
    });
    return {label:lbl,url,headings,interactive:interactive.slice(0,60),body:(document.body?.innerText||'').substring(0,3000)};
  }, label);
}

const results = [];

// Go to manage-my-cards
await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(()=>{}); await page.waitForTimeout(2000); await dismiss();
const mc = await cap('manage-my-cards');
results.push(mc);
console.log('=== MANAGE MY CARDS ===');
console.log(`Headings: ${mc.headings.map(h=>h.text).join(' | ')}`);
console.log(`Interactive: ${mc.interactive.map(el=>`[${el.tag}]"${el.text}"->${el.href||el.uiSref}`).join('\n  ')}`);
console.log(`Body: ${mc.body?.substring(0, 2000)}`);

// Click MANAGE button
console.log('\n=== CLICK MANAGE ===');
try {
  await page.locator('button:has-text("MANAGE")').first().click({ timeout: 5000 });
  await page.waitForTimeout(3000); await dismiss();
  const manage = await cap('manage-card');
  results.push(manage);
  console.log(`URL: ${manage.url}, Headings: ${manage.headings.map(h=>h.text).join(' | ')}`);
  console.log(`Interactive: ${manage.interactive.map(el=>`[${el.tag}]"${el.text}"->${el.href||el.uiSref}`).join('\n  ')}`);
  console.log(`Body: ${manage.body?.substring(0, 1500)}`);
} catch(e) { console.log(`Error: ${e.message}`); }

// Click Insights nav
console.log('\n=== CLICK INSIGHTS ===');
try {
  await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{}); await page.waitForTimeout(1500); await dismiss();
  const insLink = page.locator('a:has-text("Insights")').first();
  if (await insLink.isVisible({ timeout: 3000 }).catch(()=>false)) {
    await insLink.click({ timeout: 5000 });
    await page.waitForTimeout(3000); await dismiss();
    const ins = await cap('insights');
    results.push(ins);
    console.log(`URL: ${ins.url}, Headings: ${ins.headings.map(h=>h.text).join(' | ')}`);
    console.log(`Interactive: ${ins.interactive.map(el=>`[${el.tag}]"${el.text}"`).join(', ')}`);
    console.log(`Body: ${ins.body?.substring(0, 2000)}`);
  }
} catch(e) { console.log(`Error: ${e.message}`); }

// Click Subusers nav
console.log('\n=== CLICK SUBUSERS ===');
try {
  await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{}); await page.waitForTimeout(1500); await dismiss();
  const subLink = page.locator('a:has-text("Subusers")').first();
  if (await subLink.isVisible({ timeout: 3000 }).catch(()=>false)) {
    await subLink.click({ timeout: 5000 });
    await page.waitForTimeout(3000); await dismiss();
    const sub = await cap('subusers');
    results.push(sub);
    console.log(`URL: ${sub.url}, Headings: ${sub.headings.map(h=>h.text).join(' | ')}`);
    console.log(`Body: ${sub.body?.substring(0, 1000)}`);
  }
} catch(e) { console.log(`Error: ${e.message}`); }

// Click Start nav
console.log('\n=== CLICK START ===');
try {
  await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{}); await page.waitForTimeout(1500); await dismiss();
  const startLink = page.locator('a:has-text("Start")').first();
  if (await startLink.isVisible({ timeout: 3000 }).catch(()=>false)) {
    await startLink.click({ timeout: 5000 });
    await page.waitForTimeout(3000); await dismiss();
    const start = await cap('start');
    results.push(start);
    console.log(`URL: ${start.url}, Headings: ${start.headings.map(h=>h.text).join(' | ')}`);
    console.log(`Body: ${start.body?.substring(0, 1500)}`);
  }
} catch(e) { console.log(`Error: ${e.message}`); }

writeFileSync(`${DIR}/crawl-output/final-pages.json`, JSON.stringify(results, null, 2));
console.log(`\nSaved ${results.length} pages`);
await browser.close();