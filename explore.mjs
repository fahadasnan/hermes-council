import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = dirname(fileURLToPath(import.meta.url));
const STATE = `${DIR}/auth.json`;
const OUT = `${DIR}/explore-output.json`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: STATE });
const page = await context.newPage();

// Start collecting network requests
const networkLog = [];
page.on('request', req => {
  if (req.url().includes('api') || req.url().includes('app.loopyloyalty.com')) {
    networkLog.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      headers: req.headers(),
      postData: req.postData()?.substring(0, 500)
    });
  }
});

page.on('response', async res => {
  const req = res.request();
  if (req.url().includes('api') || req.url().includes('app.loopyloyalty.com')) {
    const entry = networkLog.find(e => e.url === req.url() && !e.status);
    if (entry) {
      entry.status = res.status();
      try {
        const body = await res.text();
        entry.responseBody = body.substring(0, 2000);
      } catch {}
    }
  }
});

async function snapshot(name) {
  const html = await page.evaluate(() => {
    // Get all interactive elements and their text
    const elements = [];
    document.querySelectorAll('a, button, input, select, textarea, h1, h2, h3, h4, h5, h6, [role="link"], [role="button"], [role="menuitem"], [role="tab"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight) {
        elements.push({
          tag: el.tagName,
          text: (el.textContent || '').trim().substring(0, 120),
          href: el.href || '',
          type: el.type || '',
          id: el.id || '',
          class: (el.className || '').substring(0, 100),
          placeholder: el.placeholder || '',
          role: el.getAttribute('role') || ''
        });
      }
    });
    return { elements, bodyText: document.body?.innerText?.substring(0, 5000) || '' };
  });
  return {
    name,
    url: page.url(),
    title: await page.title(),
    html
  };
}

const results = {
  pages: [],
  network: networkLog,
  errors: []
};

// Navigate to dashboard
await page.goto('https://app.loopyloyalty.com', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => results.errors.push('goto: ' + e.message));
await page.waitForTimeout(2000);

// Check where we landed
const currentUrl = page.url();
results.landedOn = currentUrl;

if (currentUrl.includes('/auth/login') || currentUrl.includes('/login') || currentUrl.includes('/signin')) {
  results.loggedIn = false;
  results.pages.push(await snapshot('login-page'));
} else {
  results.loggedIn = true;
  results.pages.push(await snapshot('dashboard-home'));

  // Find all navigation links
  const links = await page.evaluate(() => {
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    return allLinks.map(a => ({
      text: a.textContent.trim().substring(0, 100),
      href: a.href,
      className: a.className
    })).filter(l => l.href && l.href.includes('app.loopyloyalty.com'));
  });
  results.navLinks = links;

  // Find all sidebar/nav items
  const navItems = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('nav a, [class*="sidebar"] a, [class*="nav"] a, [class*="menu"] a').forEach(a => {
      if (a.href && a.href.includes('app.loopyloyalty.com')) {
        items.push({ text: a.textContent.trim().substring(0, 100), href: a.href });
      }
    });
    // Also look for any clickable items
    document.querySelectorAll('[class*="sidebar"] [role="link"], [class*="nav"] [role="link"], [class*="sidebar"] button, [class*="nav"] button').forEach(el => {
      items.push({ text: el.textContent.trim().substring(0, 100), href: 'clickable', tag: el.tagName });
    });
    return items;
  });
  results.navItems = navItems;

  // Try visiting each nav link and capturing its page
  if (links.length > 0) {
    const visited = new Set();
    const uniqueLinks = links.filter(l => {
      const key = l.href;
      if (visited.has(key)) return false;
      visited.add(key);
      return true;
    });

    // Visit up to 30 pages
    for (let i = 0; i < Math.min(uniqueLinks.length, 30); i++) {
      try {
        await page.goto(uniqueLinks[i].href, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const snap = await snapshot(uniqueLinks[i].text || uniqueLinks[i].href);
        results.pages.push(snap);
      } catch (e) {
        results.errors.push(`nav to ${uniqueLinks[i].href}: ${e.message}`);
      }
    }
  }

  // Go back to home and look for dropdowns/settings menus
  try {
    await page.goto('https://app.loopyloyalty.com', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    // Look for user menu / settings
    const userMenuLinks = await page.evaluate(() => {
      const links = [];
      // Click on profile/avatar if exists
      const avatar = document.querySelector('[class*="avatar"], [class*="profile"], [class*="user"], [alt*="profile"], [class*="account"]');
      return links;
    });
  } catch (e) {
    results.errors.push('home return: ' + e.message);
  }
}

// Save raw results
writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log(`Output written to ${OUT}`);
console.log(`Logged in: ${results.loggedIn}`);
console.log(`Landed on: ${results.landedOn}`);
console.log(`Pages captured: ${results.pages.length}`);
console.log(`Nav links found: ${(results.navLinks || []).length}`);

await browser.close();