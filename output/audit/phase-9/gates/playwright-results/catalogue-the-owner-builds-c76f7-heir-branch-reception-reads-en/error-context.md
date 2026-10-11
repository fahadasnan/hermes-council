# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalogue.spec.ts >> the owner builds the menu; one branch opts out; the manager changes only their branch; reception reads
- Location: e2e/catalogue.spec.ts:20:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Catalogue', level: 1 })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Catalogue', level: 1 }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Catalogue', level: 1 })

```

```yaml
- banner:
  - text: GlowDesk
  - button "العربية"
- main:
  - status "Loading your account"
  - status "Loading your account"
- status
- alert
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | import { expect } from "./fixtures";
  3  | import type { Strings } from "./strings";
  4  | 
  5  | // Catalogue journeys shared by catalogue.spec.ts and the Phase 3 evidence run.
  6  | 
  7  | const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  8  | 
  9  | /** Opens the hub with a branch filter ("all" for every branch). */
  10 | export async function openCatalogue(page: Page, s: Strings, branch: string) {
  11 |   // A just-submitted sign-in must land before a full page load.
  12 |   await expect(page).not.toHaveURL(/\/login/);
  13 |   await page.goto(`/catalogue?branch=${branch}`);
> 14 |   await expect(page.getByRole("heading", { level: 1, name: s.catalogue })).toBeVisible();
     |                                                                            ^ Error: expect(locator).toBeVisible() failed
  15 | }
  16 | 
  17 | export const categoryLinks = (page: Page, s: Strings) =>
  18 |   page.getByRole("navigation", { name: s.categories }).getByRole("listitem").getByRole("link");
  19 | 
  20 | /** Category names in menu order, without the "All categories" entry. */
  21 | export async function categoryOrder(page: Page, s: Strings): Promise<string[]> {
  22 |   return (await categoryLinks(page, s).allTextContents()).slice(1).map((text) => text.trim());
  23 | }
  24 | 
  25 | export async function addCategory(page: Page, s: Strings, names: { nameEn: string; nameAr: string }) {
  26 |   await page.getByRole("button", { name: s.newCategory }).click();
  27 |   const drawer = page.getByRole("dialog");
  28 |   await drawer.getByLabel(s.nameEn).fill(names.nameEn);
  29 |   await drawer.getByLabel(s.nameAr).fill(names.nameAr);
  30 |   await drawer.getByRole("button", { name: s.addCategory }).click();
  31 |   await expect(page.getByText(s.categoryAdded)).toBeVisible();
  32 | }
  33 | 
  34 | /** Picks a category in the hub; the services table is then named after it. */
  35 | export async function openCategory(page: Page, s: Strings, category: string) {
  36 |   await categoryLinks(page, s)
  37 |     .filter({ hasText: new RegExp(`^${escape(category)}`) })
  38 |     .click();
  39 |   await expect(servicesTable(page, s, category)).toBeVisible();
  40 | }
  41 | 
  42 | export const servicesTable = (page: Page, s: Strings, category: string) =>
  43 |   page.getByRole("table", { name: s.servicesIn(category) });
  44 | 
  45 | export const serviceRow = (page: Page, s: Strings, category: string, marker: string) =>
  46 |   servicesTable(page, s, category).getByRole("row", { name: new RegExp(escape(marker)) });
  47 | 
  48 | export const editorPanel = (page: Page, name: string) => page.getByRole("tabpanel", { name });
  49 | 
  50 | export type NewService = {
  51 |   nameEn: string;
  52 |   nameAr: string;
  53 |   duration: string;
  54 |   bufferBefore: string;
  55 |   bufferAfter: string;
  56 |   price: string;
  57 | };
  58 | 
  59 | /** Fills the Definition tab of the service editor. */
  60 | export async function fillDefinition(page: Page, s: Strings, service: NewService) {
  61 |   const definition = editorPanel(page, s.definitionTab);
  62 |   await definition.getByLabel(s.nameEn).fill(service.nameEn);
  63 |   await definition.getByLabel(s.nameAr).fill(service.nameAr);
  64 |   await definition.getByLabel(s.durationMinutes).fill(service.duration);
  65 |   await definition.getByLabel(s.bufferBefore).fill(service.bufferBefore);
  66 |   await definition.getByLabel(s.bufferAfter).fill(service.bufferAfter);
  67 |   await definition.getByLabel(s.price).fill(service.price);
  68 | }
  69 | 
  70 | /** The service id from the editor URL. */
  71 | export function serviceIdFromUrl(page: Page): string {
  72 |   const id = /\/catalogue\/services\/([0-9a-f-]{36})/.exec(page.url())?.[1];
  73 |   if (!id) throw new Error(`not on a service editor: ${page.url()}`);
  74 |   return id;
  75 | }
  76 | 
```