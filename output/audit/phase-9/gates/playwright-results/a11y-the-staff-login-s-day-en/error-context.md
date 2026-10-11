# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> the staff login's day
- Location: e2e/a11y.spec.ts:129:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[aria-busy="true"]')
Expected: 0
Received: 2
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" locator('[aria-busy="true"]') with timeout 5000ms
  - waiting for locator('[aria-busy="true"]')
    14 × locator resolved to 2 elements
       - unexpected value "2"

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - generic [ref=f1e3]:
    - banner [ref=f1e4]:
      - generic [ref=f1e5]: GlowDesk
      - button "العربية" [ref=f1e6] [cursor=pointer]
    - main [ref=f1e7]:
      - generic [ref=f1e9]:
        - status "Loading your account" [ref=f1e10]
        - status "Loading your account" [ref=f1e12]
  - generic:
    - status
    - alert
```

# Test source

```ts
  1   | import { mkdirSync, writeFileSync } from "node:fs";
  2   | import { fileURLToPath } from "node:url";
  3   | import AxeBuilder from "@axe-core/playwright";
  4   | import type { APIRequestContext, Page, TestInfo } from "@playwright/test";
  5   | import { addDays } from "./blockedTimeFlows";
  6   | import { admin, REST } from "./bookingFixtures";
  7   | import { createSale, freshShop, openCalendar, shopVisit, type Shop, type ShopVisit } from "./checkoutFixtures";
  8   | import { expect, signIn, test } from "./fixtures";
  9   | import { ROUTES, routeUrl, type RouteLogin, type RouteParams, type RoutePath } from "./routes";
  10  | import { kuwaitToday } from "./shiftFlows";
  11  | import type { Strings } from "./strings";
  12  | 
  13  | // WCAG 2.1 A/AA sweep with axe: every route in e2e/routes.ts in light and dark
  14  | // (the project gives the language), then the dialogs and drawers open. Serious
  15  | // and critical violations fail; every violation is attached to the report, and
  16  | // with A11Y_EVIDENCE=1 written to plan/evidence/7.4/a11y/.
  17  | 
  18  | const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
  19  | const BLOCKING = new Set(["serious", "critical"]);
  20  | const THEMES = ["light", "dark"] as const;
  21  | const PRICE = 12_000;
  22  | const EVIDENCE = fileURLToPath(new URL("../../../plan/evidence/7.4/a11y/", import.meta.url));
  23  | 
  24  | type Theme = (typeof THEMES)[number];
  25  | type Finding = { where: string; theme: Theme; url: string; rule: string; impact: string; help: string; targets: string[]; detail: string };
  26  | 
  27  | const pathsFor = (login: RouteLogin) => (Object.keys(ROUTES) as RoutePath[]).filter((path) => ROUTES[path] === login);
  28  | 
  29  | async function setTheme(page: Page, theme: Theme) {
  30  |   await page.evaluate((value) => window.localStorage.setItem("theme", value), theme);
  31  | }
  32  | 
  33  | /**
  34  |  * Waits for the page to stop loading and moving: no request for 500 ms, no busy region, and no
  35  |  * finite animation or transition still running (axe reads a fading dialog's half-blended colours).
  36  |  */
  37  | async function settle(page: Page) {
  38  |   await page.waitForLoadState("networkidle");
> 39  |   await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
      |                                                    ^ Error: expect(locator).toHaveCount(expected) failed
  40  |   await page.waitForFunction(() =>
  41  |     document.getAnimations().every((animation) => animation.playState !== "running" || animation.effect?.getTiming().iterations === Infinity),
  42  |   );
  43  | }
  44  | 
  45  | async function audit(page: Page, where: string, theme: Theme, findings: Finding[]) {
  46  |   const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  47  |   for (const violation of results.violations) {
  48  |     findings.push({
  49  |       where,
  50  |       theme,
  51  |       url: new URL(page.url()).pathname,
  52  |       rule: violation.id,
  53  |       impact: violation.impact ?? "unknown",
  54  |       help: violation.help,
  55  |       targets: violation.nodes.map((node) => node.target.join(" ")),
  56  |       detail: violation.nodes[0]?.failureSummary ?? "",
  57  |     });
  58  |   }
  59  | }
  60  | 
  61  | async function visit(page: Page, url: string, where: string, theme: Theme, findings: Finding[]) {
  62  |   await page.goto(url);
  63  |   await settle(page);
  64  |   await audit(page, where, theme, findings);
  65  | }
  66  | 
  67  | async function report(findings: Finding[], name: string, testInfo: TestInfo, appLocale: string) {
  68  |   const body = JSON.stringify(findings, null, 2);
  69  |   await testInfo.attach(`axe-${name}-${appLocale}.json`, { body, contentType: "application/json" });
  70  |   if (process.env.A11Y_EVIDENCE === "1") {
  71  |     mkdirSync(EVIDENCE, { recursive: true });
  72  |     writeFileSync(`${EVIDENCE}${name}-${appLocale}.json`, `${body}\n`);
  73  |   }
  74  |   const blocking = findings.filter((finding) => BLOCKING.has(finding.impact));
  75  |   expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  76  | }
  77  | 
  78  | /** A shop of the run's own: a visit marked arrived, and a second visit sold by card. */
  79  | async function a11yShop(request: APIRequestContext, appLocale: string) {
  80  |   const shop = await freshShop(request, `a11y-${appLocale}`);
  81  |   const day = addDays(kuwaitToday(), 1);
  82  |   const arrived = await shopVisit(request, shop, shop.owner, { day, priceMinor: PRICE });
  83  |   const sold = await shopVisit(request, shop, shop.owner, { day, priceMinor: PRICE });
  84  |   const sale = await createSale(request, shop.owner, {
  85  |     tenant_id: shop.tenantId,
  86  |     branch_id: shop.branchId,
  87  |     appointment_id: sold.id,
  88  |     client_id: sold.clientId,
  89  |     lines: [{ type: "appointment_item", appointment_item_id: sold.itemId }],
  90  |     tips: [],
  91  |     payments: [{ method: "knet_terminal", amount_minor: PRICE }],
  92  |     expected: { total_minor: PRICE, tip_minor: 0, grand_total_minor: PRICE },
  93  |   });
  94  |   const first = async (table: string) => {
  95  |     const response = await request.get(`${REST}/${table}?tenant_id=eq.${shop.tenantId}&select=id&limit=1`, { headers: admin });
  96  |     const [row] = (await response.json()) as { id: string }[];
  97  |     return row!.id;
  98  |   };
  99  |   const params: RouteParams = {
  100 |     saleId: sale.id,
  101 |     clientId: arrived.clientId,
  102 |     staffId: await first("staff_members"),
  103 |     serviceId: await first("services"),
  104 |     branchId: shop.branchId,
  105 |   };
  106 |   return { shop, day, arrived, sold, params };
  107 | }
  108 | 
  109 | test.describe.configure({ timeout: 10 * 60_000 });
  110 | test.use({ actionTimeout: 15_000 });
  111 | 
  112 | test("signed-out pages and the no-access page", async ({ page, s, appLocale }, testInfo) => {
  113 |   const findings: Finding[] = [];
  114 |   await page.goto("/login");
  115 |   for (const theme of THEMES) {
  116 |     await setTheme(page, theme);
  117 |     for (const path of pathsFor("signedOut")) await visit(page, path, path, theme, findings);
  118 |   }
  119 |   await page.goto("/login");
  120 |   await signIn(page, s, "nobody@spacorner.test", undefined, { shell: false });
  121 |   await expect(page).toHaveURL(/\/no-access/);
  122 |   for (const theme of THEMES) {
  123 |     await setTheme(page, theme);
  124 |     await visit(page, "/no-access", "/no-access", theme, findings);
  125 |   }
  126 |   await report(findings, "signed-out", testInfo, appLocale);
  127 | });
  128 | 
  129 | test("the staff login's day", async ({ page, s, appLocale }, testInfo) => {
  130 |   const findings: Finding[] = [];
  131 |   await page.goto("/login");
  132 |   await signIn(page, s, "staff@spacorner.test");
  133 |   for (const theme of THEMES) {
  134 |     await setTheme(page, theme);
  135 |     for (const path of pathsFor("staff")) await visit(page, path, path, theme, findings);
  136 |   }
  137 |   await report(findings, "staff", testInfo, appLocale);
  138 | });
  139 | 
```