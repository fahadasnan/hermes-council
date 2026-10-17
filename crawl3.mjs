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
const context = await browser.newContext();
const page = await context.newPage();

// ===== LOGIN (proven pattern) =====
console.log('Logging in...');
await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(1000);

const userSel = 'input[type="email"], input[autocomplete="username"], input[name*="email" i], input[name*="user" i]';
const user = page.locator(userSel).first();
await user.waitFor({ state: 'visible', timeout: 15000 });
await user.fill(env.DASHBOARD_USER);

const PASS_SEL = 'input[type="password"]';
const pass = page.locator(PASS_SEL).first();
if (!(await pass.isVisible().catch(() => false))) {
  await user.press('Enter');
}
await pass.waitFor({ state: 'visible', timeout: 15000 });
await pass.fill(env.DASHBOARD_PASS);
await pass.press('Enter');

await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);
console.log(`After login URL: ${page.url()}`);

// Navigate to main dashboard
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
await page.waitForTimeout(3000);
console.log(`Dashboard URL: ${page.url()}`);

// ===== CAPTURE PAGE STATE =====
async function capture() {
  return await page.evaluate(() => {
    const url = window.location.href;
    const title = document.title;
    
    // Get ALL text content chunks with their containers
    const textNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text && text.length > 1) {
        const parent = node.parentElement;
        if (parent) {
          const rect = parent.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
          textNodes.push({
            text: text.substring(0, 200),
            tag: parent.tagName,
            class: (parent.className || '').substring(0, 80),
            href: parent.href || '',
            id: parent.id || '',
            visible: isVisible,
            top: Math.round(rect.top)
          });
        }
      }
    }
    
    // Headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({ level: h.tagName, text: h.textContent.trim().substring(0, 200), top: Math.round(h.getBoundingClientRect().top) }));
    
    // Specific attributes
    const ngClicks = Array.from(document.querySelectorAll('[ng-click], [data-ng-click]'))
      .map(el => ({ text: (el.textContent || '').trim().substring(0, 100), ngClick: el.getAttribute('ng-click') || el.getAttribute('data-ng-click') || '', tag: el.tagName }));
    
    const uiSrefs = Array.from(document.querySelectorAll('[ui-sref]'))
      .map(el => ({ text: (el.textContent || '').trim().substring(0, 100), uiSref: el.getAttribute('ui-sref') || '', tag: el.tagName }));
    
    return { url, title, headings, textNodes: textNodes.slice(0, 300), ngClicks, uiSrefs };
  });
}

const state = await capture();

// ===== OUTPUT =====
console.log('\n=== HEADINGS ===');
state.headings.forEach(h => console.log(`  ${h.level} "${h.text}" (top:${h.top})`));

console.log('\n=== ANGULAR ROUTES (ui-sref) ===');
state.uiSrefs.forEach(s => console.log(`  [${s.tag}] "${s.text}" -> ${s.uiSref}`));

console.log('\n=== NG-CLICKS ===');
state.ngClicks.forEach(c => console.log(`  [${c.tag}] "${c.text}" -> ${c.ngClick}`));

console.log('\n=== VISIBLE TEXT NODES (filtered to likely nav/button items) ===');
const navTexts = state.textNodes.filter(t => 
  t.visible && t.text.length > 2 && t.text.length < 80 &&
  (t.tag === 'A' || t.tag === 'BUTTON' || t.tag === 'SPAN' || t.tag === 'LI' || t.tag === 'DIV') &&
  t.href
);
navTexts.forEach(t => console.log(`  [${t.tag}] "${t.text}" -> ${t.href.substring(0, 100)} | top:${t.top}`));

// Look for sidebar pattern
console.log('\n=== ALL LINKS ===');
const allLinks = state.textNodes.filter(t => t.href && t.visible && t.text.length > 1);
allLinks.forEach(t => console.log(`  [${t.tag}] "${t.text}" -> ${t.href.substring(0, 100)}`));

// Dump full text for analysis
const fullText = state.textNodes.map(t => `[${t.tag}] top:${t.top} ${t.visible ? 'VIS' : 'HID'} "${t.text}"`).join('\n');
writeFileSync(`${OUT_DIR}/full-text-dump.txt`, fullText);
console.log(`\nFull text dump written to ${OUT_DIR}/full-text-dump.txt`);

// Save JSON
writeFileSync(`${OUT_DIR}/state.json`, JSON.stringify(state, null, 2));
console.log(`State JSON written to ${OUT_DIR}/state.json`);

await browser.close();