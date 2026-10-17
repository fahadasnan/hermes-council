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

// Collect ALL network requests
const allNetwork = [];
page.on('request', req => {
  const url = req.url();
  if (url.includes('loopyloyalty.com') || url.includes('googleapis') || url.includes('stripe')) {
    allNetwork.push({
      url, method: req.method(), resourceType: req.resourceType(),
      postData: req.postData()?.substring(0, 1000) || null
    });
  }
});
page.on('response', async res => {
  const url = res.url();
  if (url.includes('loopyloyalty.com/api') || url.includes('loopyloyalty.com/v1')) {
    try {
      const body = await res.text();
      const last = allNetwork.findLast(r => r.url === url);
      if (last) last.responseBody = body.substring(0, 3000);
    } catch {}
  }
});

// Login
console.log('Logging in...');
await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' });
const userSel = 'input[type="email"], input[autocomplete="username"], input[name*="email" i], input[name*="user" i]';
await page.locator(userSel).first().fill(env.DASHBOARD_USER, { timeout: 15000 });
const pass = page.locator('input[type="password"]').first();
await pass.fill(env.DASHBOARD_PASS);
await pass.press('Enter');
await page.waitForFunction(() => !document.querySelector('input[type="password"]'), null, { timeout: 30000 }).catch(() => {});
await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2000);
console.log(`Logged in, landed on: ${page.url()}`);

// Navigate to dashboard home
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2000);
console.log(`Dashboard: ${page.url()}`);

// ============ HELPER: capture page state ============
async function capturePage(label) {
  const url = page.url();
  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 8000) || '');
  
  // Get all interactive elements with their links
  const elements = await page.evaluate(() => {
    const results = [];
    const seen = new Set();
    document.querySelectorAll('a[href], button, [role="link"], [role="button"], [role="menuitem"], [role="tab"], nav *, [class*="sidebar"] *, [class*="nav"] *').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const tag = el.tagName;
      const text = (el.textContent || '').trim().substring(0, 150);
      const href = el.href || el.getAttribute('data-href') || el.getAttribute('data-url') || '';
      const key = `${tag}:${text}:${href}`;
      if (seen.has(key) || !text) return;
      seen.add(key);
      results.push({
        tag, text,
        href: href.startsWith('http') ? href : '',
        className: (el.className || '').substring(0, 100),
        id: el.id || '',
        role: el.getAttribute('role') || '',
        ariaLabel: el.getAttribute('aria-label') || ''
      });
    });
    return results;
  });

  // Get all visible headings
  const headings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .filter(h => h.getBoundingClientRect().height > 0)
      .map(h => ({ level: h.tagName, text: h.textContent.trim().substring(0, 200) }));
  });

  return { label, url, title, headings, elements, bodyText: bodyText.substring(0, 5000) };
}

// ============ DISCOVER NAVIGATION ============
console.log('\n--- Capturing main dashboard ---');
const homePage = await capturePage('dashboard-home');

// Build a list of navigation destinations
const navDestinations = new Map();
homePage.elements.forEach(el => {
  if (el.href && el.href.startsWith(BASE) && !el.href.includes('/auth/') && !el.href.includes('logout')) {
    const path = new URL(el.href).pathname;
    if (!navDestinations.has(path)) {
      navDestinations.set(path, { href: el.href, text: el.text, from: homePage.url });
    }
  }
});

console.log(`Found ${navDestinations.size} unique navigation destinations`);

// Organize into categories
const mainNav = [];
const subNav = [];
const settingsNav = [];
const footerNav = [];

navDestinations.forEach((v, path) => {
  if (path === '/' || path === '' || path.startsWith('/manage') || path.startsWith('/campaign') || 
      path.startsWith('/card') || path.startsWith('/customer') || path.startsWith('/stamp') ||
      path.startsWith('/reward') || path.startsWith('/pass') || path.startsWith('/location') ||
      path.startsWith('/program') || path.startsWith('/analytics') || path.startsWith('/report')) {
    mainNav.push({ path, ...v });
  } else if (path.startsWith('/settings') || path.startsWith('/user') || path.startsWith('/account') ||
             path.startsWith('/billing') || path.startsWith('/subscription') || path.startsWith('/plan')) {
    settingsNav.push({ path, ...v });
  } else {
    subNav.push({ path, ...v });
  }
});

// ============ VISIT ALL PAGES ============
const allPages = [homePage];
const edges = []; // { from, to, type, evidence }

// Visit each main nav page
console.log('\n--- Visiting pages ---');
let pageCount = 0;
const MAX_PAGES = 50;

for (const item of [...mainNav, ...settingsNav, ...subNav]) {
  if (pageCount >= MAX_PAGES) break;
  try {
    console.log(`  Visiting: ${item.path}`);
    await page.goto(item.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);
    
    // Check for login redirect
    if (page.url().includes('/auth/login')) {
      console.log(`    -> Redirected to login (auth required or doesn't exist)`);
      edges.push({ from: 'dashboard', to: item.path, type: 'navigates-to', evidence: 'Redirected to login - may require subscription/permissions', weak: true });
      continue;
    }
    
    const pageData = await capturePage(item.path);
    allPages.push(pageData);
    pageCount++;
    
    // Record edge: dashboard -> this page
    edges.push({ from: 'dashboard', to: item.path, type: 'navigates-to', evidence: `Clicked nav link "${item.text}"` });
    
    // Find sub-navigation on this page (tabs, sub-pages)
    const subLinks = pageData.elements.filter(el => {
      return el.href && el.href.startsWith(BASE) && 
             el.href !== item.href && !el.href.includes('/auth/') &&
             (el.role === 'tab' || el.className.includes('tab') || el.className.includes('sub'));
    });
    
    for (const sub of subLinks) {
      const subPath = new URL(sub.href).pathname;
      edges.push({ from: item.path, to: subPath, type: 'navigates-to', evidence: `Tab/sub-link "${sub.text}" on page` });
    }
    
    // Check for create/edit buttons pointing to other features
    const actionLinks = pageData.elements.filter(el => {
      return el.href && el.href.includes(BASE) && 
             (el.text.toLowerCase().includes('create') || el.text.toLowerCase().includes('add') ||
              el.text.toLowerCase().includes('new') || el.text.toLowerCase().includes('edit'));
    });
    
    for (const al of actionLinks) {
      const targetPath = new URL(al.href).pathname;
      edges.push({ from: item.path, to: targetPath, type: 'navigates-to', evidence: `Action button "${al.text}" -> ${targetPath}` });
    }
    
  } catch (e) {
    console.log(`    Error: ${e.message}`);
    edges.push({ from: 'dashboard', to: item.path, type: 'navigates-to', evidence: `Error visiting: ${e.message}`, weak: true });
  }
}

// ============ ANALYZE API CALLS ============
console.log('\n--- Analyzing network requests ---');
const apiEndpoints = new Set();
const pageToApi = new Map();

allNetwork.forEach(req => {
  const url = req.url;
  if (url.includes('loopyloyalty.com/') && (url.includes('/api/') || url.includes('/v1/') || url.match(/\/[a-z]+\/[a-zA-Z0-9_-]{10,}/))) {
    try {
      const u = new URL(url);
      const endpoint = u.pathname.split('?')[0];
      apiEndpoints.add(`${req.method} ${endpoint}`);
    } catch {}
  }
});

// Group API calls by entity
const apiGroups = {};
apiEndpoints.forEach(ep => {
  const parts = ep.split(' ')[1].split('/').filter(Boolean);
  const entity = parts[0] || 'other';
  if (!apiGroups[entity]) apiGroups[entity] = [];
  apiGroups[entity].push(ep);
});

// ============ OUTPUT ============
const output = {
  baseUrl: BASE,
  landedOn: homePage.url,
  sessionInfo: await page.evaluate(() => {
    const info = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const val = sessionStorage.getItem(key);
      info[key] = key === 'jwt' ? val.substring(0, 20) + '...' : val;
    }
    return info;
  }),
  navDestinations: Object.fromEntries(navDestinations),
  allPages: allPages.map(p => ({
    label: p.label,
    url: p.url,
    title: p.title,
    headings: p.headings.slice(0, 30),
    elementCount: p.elements.length,
    keyElements: p.elements.filter(e => 
      e.role === 'tab' || e.text.length > 0 && e.text.length < 60 && (e.href || e.tag === 'BUTTON')
    ).slice(0, 50),
    bodyPreview: p.bodyText.substring(0, 2000)
  })),
  edges,
  apiEndpoints: [...apiEndpoints],
  apiGroups,
  rawNetworkCount: allNetwork.length
};

const outPath = `${OUT_DIR}/crawl-result.json`;
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\nDone! Output: ${outPath}`);
console.log(`Pages captured: ${allPages.length}`);
console.log(`Edges mapped: ${edges.length}`);
console.log(`API endpoints: ${apiEndpoints.size}`);
console.log(`Network requests: ${allNetwork.length}`);

await browser.close();