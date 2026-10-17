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

// Collect ALL network - particularly API calls (filtered to loopyloyalty internal)
const apiCalls = [];
page.on('request', req => {
  const url = req.url();
  if (url.includes('loopyloyalty.com/') && !url.match(/\.(css|js|png|jpg|gif|svg|ico|woff|ttf)(\?|$)/) && !url.includes('/styles/') && !url.includes('/js/') && !url.includes('/images/') && !url.includes('/config/') && !url.includes('google') && !url.includes('clarity') && !url.includes('stripe') && !url.includes('facebook') && !url.includes('intercom') && !url.includes('youtube') && !url.includes('googletagmanager')) {
    apiCalls.push({ url, method: req.method(), postData: req.postData()?.substring(0, 2000) || null, time: Date.now() });
  }
});
page.on('response', async res => {
  const url = res.url();
  const match = apiCalls.findLast(r => r.url === url && !r.responseStatus);
  if (match) {
    match.responseStatus = res.status();
    try { match.responseBody = (await res.text()).substring(0, 3000); } catch {}
  }
});

// Login
console.log('Logging in...');
await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(1000);
const user = page.locator('input[type="email"], input[autocomplete="username"], input[name*="email" i], input[name*="user" i]').first();
await user.waitFor({ state: 'visible', timeout: 15000 });
await user.fill(env.DASHBOARD_USER);
const pass = page.locator('input[type="password"]').first();
if (!(await pass.isVisible().catch(() => false))) await user.press('Enter');
await pass.waitFor({ state: 'visible', timeout: 15000 });
await pass.fill(env.DASHBOARD_PASS);
await pass.press('Enter');
await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);
console.log(`Auth done: ${page.url()}`);

// Helper: capture state
async function capture(label) {
  return await page.evaluate((lbl) => {
    function getVisible(el) {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
    }
    const url = window.location.href;
    const title = document.title;
    
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter(h => getVisible(h)).map(h => ({ level: h.tagName, text: h.textContent.trim().substring(0, 200) }));
    
    const interactive = [];
    const seen = new Set();
    document.querySelectorAll('a,button,[role="button"],[role="link"],[role="tab"],input[type="submit"],input[type="button"]').forEach(el => {
      if (!getVisible(el)) return;
      const text = (el.textContent || el.value || '').trim().substring(0, 150);
      const key = `${el.tagName}:${text}:${el.href||''}`;
      if (!text || seen.has(key)) return;
      seen.add(key);
      interactive.push({ tag: el.tagName, text, href: el.href||'', uiSref: el.getAttribute('ui-sref')||'', ngClick: (el.getAttribute('ng-click')||'').substring(0,200), className: (el.className||'').substring(0,100) });
    });
    
    const tables = Array.from(document.querySelectorAll('table')).filter(t => getVisible(t)).map(t => {
      const hdrs = Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim());
      const rows = t.querySelectorAll('tbody tr').length;
      return { headers: hdrs, rows };
    });
    
    const forms = Array.from(document.querySelectorAll('input,select,textarea')).filter(el => getVisible(el)).map(el => ({
      tag: el.tagName, type: el.type||'', name: el.name||'', placeholder: el.placeholder||'', id: el.id||''
    }));
    
    return { label: lbl, url, title, headings, interactive, tables, forms, bodyPreview: (document.body?.innerText||'').substring(0,4000) };
  }, label);
}

// Navigate to manage-my-cards 
await page.goto(`${BASE}/manage-my-cards`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);

// ===== APPROACH 1: Try clicking via JavaScript =====
console.log('\n=== TRYING JS CLICKS ON NAV ITEMS ===');
const navClicks = await page.evaluate(() => {
  const results = [];
  // Find all nav items
  const navItems = document.querySelectorAll('[ng-click*="navigateToState"]');
  navItems.forEach(el => {
    const text = (el.textContent||'').trim();
    const stateObj = el.getAttribute('ng-click');
    results.push({ text, ngClick: stateObj, visible: el.getBoundingClientRect().width > 0 });
  });
  
  // Also find items inside the sidebar
  const sidebar = document.querySelector('[class*="sidebar"], [class*="nav-menu"], [class*="side-menu"], nav, [role="navigation"]');
  if (sidebar) {
    results.push({ sidebarFound: true, sidebarClass: sidebar.className?.substring(0,100) || '', sidebarTag: sidebar.tagName });
    const items = sidebar.querySelectorAll('a, button, [ng-click]');
    items.forEach(el => {
      const text = (el.textContent||'').trim();
      if (text) results.push({ sidebarItem: text, tag: el.tagName, ngClick: el.getAttribute('ng-click')||'', uiSref: el.getAttribute('ui-sref')||'', href: el.href||'' });
    });
  }
  return results;
});
console.log(JSON.stringify(navClicks, null, 2));

// ===== APPROACH 2: Use Angular injector to navigate =====
console.log('\n=== ANGULAR ROUTE NAVIGATION ===');

// Try to get Angular state info and navigate programmatically
const angularInfo = await page.evaluate(() => {
  try {
    // Try to find Angular's injector
    const root = document.querySelector('[ng-app], [data-ng-app]') || document.body;
    const injector = angular?.element(root)?.injector?.();
    if (injector) {
      const state = injector.get('$state');
      const states = state.get().map(s => ({ name: s.name, url: s.url }));
      return { hasAngular: true, currentState: state.current?.name, allStates: states };
    }
  } catch (e) {
    return { error: e.message };
  }
  return { hasAngular: false };
});
console.log(JSON.stringify(angularInfo, null, 2));

// Navigate via Angular's $state
const states = ['container.dash', 'container.manage-my-cards', 'container.settings'];
const allPages = [];

for (const stateName of states) {
  console.log(`\n--- Navigating to: ${stateName} ---`);
  try {
    await page.evaluate((sn) => {
      const root = document.querySelector('[ng-app], [data-ng-app]') || document.body;
      const injector = angular.element(root).injector();
      const state = injector.get('$state');
      state.go(sn);
    }, stateName);
    await page.waitForTimeout(2000);
    
    const cap = await capture(stateName);
    allPages.push(cap);
    console.log(`URL: ${cap.url}`);
    console.log(`Headings: ${cap.headings.map(h => `${h.level}:${h.text}`).join(' | ')}`);
    console.log(`Interactive (${cap.interactive.length}):`);
    cap.interactive.slice(0, 20).forEach(el => console.log(`  [${el.tag}] "${el.text}"`));
    console.log(`Tables: ${cap.tables.length}, Forms: ${cap.forms.length}`);
    console.log(`Body preview: ${cap.bodyPreview?.substring(0, 500)}`);
  } catch (e) {
    console.log(`Error navigating to ${stateName}: ${e.message}`);
    // Fallback: navigate by URL
    const urlMap = {
      'container.dash': `${BASE}/manage-my-cards`, // dashboard often redirects
      'container.manage-my-cards': `${BASE}/manage-my-cards`,
      'container.settings': `${BASE}/settings`
    };
    try {
      await page.goto(urlMap[stateName], { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const cap = await capture(stateName + '-fallback');
      allPages.push(cap);
      console.log(`Fallback URL: ${cap.url}, Headings: ${cap.headings.map(h => h.text).join(' | ')}`);
    } catch {}
  }
}

// ===== APPROACH 3: Click nav items by evaluating their click handlers =====
console.log('\n=== FORCE-CLICK NAV ITEMS ===');

// Get the actual state objects that navigateToState uses
const stateMappings = await page.evaluate(() => {
  const mappings = [];
  document.querySelectorAll('[ng-click*="navigateToState"]').forEach(el => {
    const text = (el.textContent||'').trim();
    const onclick = el.getAttribute('ng-click') || '';
    // Try to get the state object
    try {
      const scope = angular.element(el).scope();
      if (scope && scope.obj && scope.obj.state) {
        mappings.push({ text, stateName: scope.obj.state, url: scope.obj.url });
      } else {
        mappings.push({ text, onclick });
      }
    } catch {
      mappings.push({ text, onclick });
    }
  });
  return mappings;
});
console.log('State mappings:', JSON.stringify(stateMappings, null, 2));

// Try navigating to each discovered state
for (const mapping of stateMappings) {
  if (!mapping.stateName) continue;
  console.log(`\n--- Nav: ${mapping.text} -> ${mapping.stateName} ---`);
  try {
    // Click the element to trigger navigation
    await page.evaluate((text) => {
      const els = document.querySelectorAll('[ng-click*="navigateToState"]');
      for (const el of els) {
        if ((el.textContent||'').trim() === text) {
          el.click();
          return true;
        }
      }
      return false;
    }, mapping.text);
    await page.waitForTimeout(2000);
    const cap = await capture(mapping.text);
    allPages.push(cap);
    console.log(`URL: ${cap.url}, Headings: ${cap.headings.map(h => h.text).join(' | ')}`);
    cap.interactive.slice(0, 15).forEach(el => console.log(`  [${el.tag}] "${el.text}"`));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

// ===== DUMP API CALLS =====
console.log(`\n=== API CALLS (${apiCalls.length}) ===`);
const uniqueApis = new Map();
apiCalls.forEach(r => {
  const path = new URL(r.url).pathname.split('?')[0];
  const key = `${r.method} ${path}`;
  if (!uniqueApis.has(key)) uniqueApis.set(key, r);
});
uniqueApis.forEach((v, k) => {
  console.log(`  ${k} -> ${v.responseStatus || 'no response yet'} ${v.postData ? '(POST)' : ''}`);
});

// ===== SAVE OUTPUT =====
const output = {
  pages: allPages,
  apiCalls: [...uniqueApis.values()].map(v => ({
    method: v.method,
    path: new URL(v.url).pathname,
    status: v.responseStatus,
    hasPostData: !!v.postData,
    responsePreview: (v.responseBody || '').substring(0, 500)
  })),
  navMappings: stateMappings,
  angularInfo
};

writeFileSync(`${OUT_DIR}/interactive-crawl.json`, JSON.stringify(output, null, 2));
console.log(`\nSaved to ${OUT_DIR}/interactive-crawl.json (${allPages.length} pages)`);

await browser.close();