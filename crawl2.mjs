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

// Collect network requests
const allNetwork = [];
page.on('request', req => {
  const url = req.url();
  allNetwork.push({
    url, method: req.method(), resourceType: req.resourceType(),
    postData: req.postData()?.substring(0, 2000) || null,
    timestamp: Date.now()
  });
});
page.on('response', async res => {
  const url = res.url();
  try {
    const body = await res.text();
    const last = allNetwork.findLast(r => r.url === url && !r.responseBody);
    if (last) last.responseBody = body.substring(0, 2000);
  } catch {}
});

// Login
console.log('Logging in...');
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
const userSel = 'input[type="email"], input[autocomplete="username"], input[name*="email" i]';
await page.locator(userSel).first().fill(env.DASHBOARD_USER, { timeout: 15000 }).catch(() => {});
const pass = page.locator('input[type="password"]').first();
if (await pass.isVisible().catch(() => false)) {
  await pass.fill(env.DASHBOARD_PASS);
  await pass.press('Enter');
  await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
}
await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2000);
console.log(`Current URL: ${page.url()}`);

// ============ HELPER: extract page state ============
async function getState(label) {
  return await page.evaluate(() => {
    const url = window.location.href;
    const title = document.title;
    const bodyText = document.body?.innerText?.substring(0, 10000) || '';
    
    // All nav elements
    const navElements = [];
    document.querySelectorAll('nav a, nav button, [class*="sidebar"] a, [class*="sidebar"] button, [class*="topbar"] a, [class*="topbar"] button, [class*="header"] a, [class*="header"] button, [class*="menu"] a, [class*="menu"] button, [class*="nav-item"], [role="navigation"] a, [role="navigation"] button').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        navElements.push({
          tag: el.tagName,
          text: (el.textContent || '').trim().substring(0, 100),
          href: el.href || '',
          className: (el.className || '').substring(0, 200),
          id: el.id || ''
        });
      }
    });
    
    // All clickable elements (buttons, links, tabs)
    const interactive = [];
    const seen = new Set();
    document.querySelectorAll('a, button, [role="tab"], [role="button"], [role="link"], [role="menuitem"], [ng-click], [data-ng-click], [ui-sref]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const text = (el.textContent || '').trim().substring(0, 150);
      const key = `${el.tagName}:${text}:${el.href || ''}`;
      if (!text || seen.has(key)) return;
      seen.add(key);
      interactive.push({
        tag: el.tagName,
        text,
        href: el.href || '',
        className: (el.className || '').substring(0, 150),
        id: el.id || '',
        role: el.getAttribute('role') || '',
        ngClick: el.getAttribute('ng-click') || '',
        uiSref: el.getAttribute('ui-sref') || '',
        dataNgClick: el.getAttribute('data-ng-click') || '',
        ariaLabel: el.getAttribute('aria-label') || ''
      });
    });
    
    // Headings
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter(h => h.getBoundingClientRect().height > 0)
      .map(h => ({ level: h.tagName, text: h.textContent.trim().substring(0, 200) }));
    
    // Angular state
    const angularState = {};
    try {
      const root = document.querySelector('[ng-app], [data-ng-app], body');
      if (root) {
        const scope = angular?.element(root)?.scope?.();
        if (scope) angularState.hasScope = true;
      }
    } catch {}
    
    // URL hash/Angular route
    const hashUrl = window.location.hash;
    
    return { url, title, headings, navElements, interactive: interactive.slice(0, 100), bodyText, hashUrl, angularState };
  });
}

// ============ INITIAL STATE ============
console.log('\n=== INITIAL STATE ===');
const initialState = await getState('initial');
console.log(`URL: ${initialState.url}`);
console.log(`Headings: ${initialState.headings.map(h => h.text).join(' | ')}`);
console.log(`Nav elements: ${initialState.navElements.length}`);
initialState.navElements.forEach(n => console.log(`  NAV: [${n.tag}] "${n.text}" -> ${n.href || '(no href)'} | class=${n.className.substring(0, 80)}`));
console.log(`Interactive: ${initialState.interactive.length}`);
initialState.interactive.forEach(n => console.log(`  INT: [${n.tag}] "${n.text}" | ngClick=${n.ngClick} | uiSref=${n.uiSref}`));

// Look for main nav structure
const mainNavItems = initialState.navElements.filter(n => n.text && n.text.length < 50);
console.log(`\nMain nav items: ${mainNavItems.length}`);
mainNavItems.forEach(n => console.log(`  "${n.text}"`));

// Extract sidebar/topbar nav
const sidebarNav = initialState.interactive.filter(n => 
  n.className.includes('sidebar') || n.className.includes('nav-') || n.className.includes('main-nav')
);
console.log(`\nSidebar/topbar nav: ${sidebarNav.length}`);

// FORCE extract ALL visible text elements to understand the page structure
const allVisibleText = await page.evaluate(() => {
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    const parent = node.parentElement;
    if (text && text.length > 2 && parent) {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight) {
        texts.push({ text, tag: parent.tagName, class: parent.className?.substring(0, 60) || '' });
      }
    }
  }
  return texts.slice(0, 200);
});
console.log('\n=== ALL VISIBLE TEXT ===');
allVisibleText.forEach(t => console.log(`  [${t.tag}] "${t.text.substring(0, 80)}" class="${t.class.substring(0, 40)}"`));

// Check the page body text
console.log('\n=== BODY TEXT (first 2000 chars) ===');
console.log(initialState.bodyText.substring(0, 2000));

await browser.close();