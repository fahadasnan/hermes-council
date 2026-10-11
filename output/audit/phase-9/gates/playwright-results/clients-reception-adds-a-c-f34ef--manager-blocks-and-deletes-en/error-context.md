# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clients.spec.ts >> reception adds a client, is warned about a shared phone, keeps notes and finds them; a manager blocks and deletes
- Location: e2e/clients.spec.ts:21:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Client added.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Client added.') with timeout 5000ms
  - waiting for getByText('Client added.')

```

```yaml
- link "Skip to main content":
  - /url: "#main"
- complementary:
  - navigation "Main":
    - list:
      - listitem:
        - link "Home":
          - /url: /?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "My day":
          - /url: /my-day?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Calendar":
          - /url: /calendar?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Clients":
          - /url: /clients?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Team":
          - /url: /team?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Catalogue":
          - /url: /catalogue?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Sales":
          - /url: /sales?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Messages":
          - /url: /messages?branch=00000000-0000-4000-a000-000000000004
- banner:
  - paragraph: Setup Studio
  - text: Receptionist
  - group "Branch (locked)":
    - paragraph: Hawally
  - group "Cash register": Register open Expected cash KWD 0.000
  - button "Search clients, appointments and sales": Search Ctrl K
  - button "العربية"
  - button "Reem Hawally"
- main:
  - link "Clients":
    - /url: /clients?branch=00000000-0000-4000-a000-000000000004
  - heading "New client" [level=1]
  - paragraph: Only the first name is required. Add a phone so we can spot duplicates.
  - alert: Your session has ended. Sign in again to continue.
  - group "Name":
    - text: Name First name
    - textbox "First name": Amira
    - text: Last name
    - textbox "Last name": en-mv3tldphadq
    - text: Optional. First name (other script)
    - textbox "First name (other script)": أَمِيرة
    - text: The name in Arabic or English letters, whichever the name above isn't in. Last name (other script)
    - textbox "Last name (other script)": en-mv3tldphadq
    - text: Optional.
  - group "Contact":
    - text: Contact Phone
    - textbox "Phone": "93513749"
    - text: A local number gets +965 automatically. Email
    - textbox "Email"
    - text: Optional. Preferred language
    - combobox "Preferred language":
      - option "Not set" [selected]
      - option "Arabic"
      - option "English"
    - text: Source
    - combobox "Source":
      - option "Walk-in (default)" [selected]
      - option "Walk-in"
      - option "Referral"
      - option "Instagram"
      - option "Website"
      - option "Phone call"
      - option "Imported"
  - group "Safety":
    - text: Safety Allergies
    - textbox "Allergies": Nuts
    - text: Shown to everyone who serves this client, staff included. Alerts
    - textbox "Alerts"
    - text: Medical or care notes the therapist must know, such as pregnancy.
  - group "More details":
    - text: More details Date of birth
    - textbox "Date of birth"
    - text: Optional. Gender
    - combobox "Gender":
      - option "Not set" [selected]
      - option "Female"
      - option "Male"
    - text: Tags
    - textbox "Tags"
    - text: Press Enter to add a tag, such as vip or regular.
    - button "Add tag" [disabled]
    - list "Added tags":
      - listitem:
        - text: vip
        - button "Remove tag vip"
  - button "Add client"
  - link "Cancel":
    - /url: /clients?branch=00000000-0000-4000-a000-000000000004
- status
- alert
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | import { expect } from "./fixtures";
  3  | import type { AppLocale, Strings } from "./strings";
  4  | 
  5  | // Clients journeys shared by clients.spec.ts and the Phase 4 evidence run.
  6  | // Writes go to Setup Studio: the Deno suite expects SpaCorner's seeded
  7  | // duplicates (+96550010001 → Fatima, Mariam) to be the only ones there.
  8  | 
  9  | /** A Kuwaiti mobile no seed client has (seed phones are +965500100NN). */
  10 | export const runPhone = () => `9${Math.floor(Math.random() * 1e7).toString().padStart(7, "0")}`;
  11 | 
  12 | export type NewClient = {
  13 |   firstName: string;
  14 |   lastName?: string;
  15 |   firstNameAlt?: string;
  16 |   lastNameAlt?: string;
  17 |   phone: string;
  18 |   allergies?: string;
  19 |   tag?: string;
  20 | };
  21 | 
  22 | /** The name the list and profile show: Arabic script in Arabic, Latin in English. */
  23 | export function shownName(client: NewClient, appLocale: AppLocale): string {
  24 |   const arabic = /[\u0600-\u06FF]/;
  25 |   const primary = [client.firstName, client.lastName].filter(Boolean).join(" ");
  26 |   const alt = [client.firstNameAlt, client.lastNameAlt].filter(Boolean).join(" ");
  27 |   if (!alt) return primary;
  28 |   const primaryIsArabic = arabic.test(client.firstName);
  29 |   return (appLocale === "ar") === primaryIsArabic ? primary : alt;
  30 | }
  31 | 
  32 | export async function openClients(page: Page, s: Strings) {
  33 |   await page.getByRole("navigation").getByRole("link", { name: s.clients, exact: true }).click();
  34 |   await expect(page.getByRole("heading", { level: 1, name: s.clients })).toBeVisible();
  35 | }
  36 | 
  37 | export async function fillClient(page: Page, s: Strings, client: NewClient) {
  38 |   await page.getByLabel(s.firstName, { exact: true }).fill(client.firstName);
  39 |   if (client.lastName) await page.getByLabel(s.lastName, { exact: true }).fill(client.lastName);
  40 |   if (client.firstNameAlt) await page.getByLabel(s.firstNameAlt, { exact: true }).fill(client.firstNameAlt);
  41 |   if (client.lastNameAlt) await page.getByLabel(s.lastNameAlt, { exact: true }).fill(client.lastNameAlt);
  42 |   await page.getByLabel(s.phone, { exact: true }).fill(client.phone);
  43 |   if (client.allergies) await page.getByLabel(s.allergies, { exact: true }).fill(client.allergies);
  44 |   if (client.tag) {
  45 |     await page.getByLabel(s.tags, { exact: true }).fill(client.tag);
  46 |     await page.getByRole("button", { name: s.addTag }).click();
  47 |   }
  48 | }
  49 | 
  50 | /** Opens the editor from the list and submits; the caller handles a duplicate warning. */
  51 | export async function submitNewClient(page: Page, s: Strings, client: NewClient) {
  52 |   await page.getByRole("link", { name: s.newClient }).click();
  53 |   await expect(page.getByRole("heading", { level: 1, name: s.newClient })).toBeVisible();
  54 |   await fillClient(page, s, client);
  55 |   await page.getByRole("button", { name: s.addClient }).click();
  56 | }
  57 | 
  58 | export async function expectProfile(page: Page, s: Strings, name: string) {
> 59 |   await expect(page.getByText(s.clientAdded)).toBeVisible();
     |                                               ^ Error: expect(locator).toBeVisible() failed
  60 |   await expect(page).toHaveURL(/\/clients\/[0-9a-f-]{36}(\?.*)?$/);
  61 |   await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  62 | }
  63 | 
  64 | export const clientIdFromUrl = (page: Page) => new URL(page.url()).pathname.split("/")[2]!;
  65 | 
  66 | export function listSearch(page: Page, s: Strings) {
  67 |   return page.getByRole("main").getByLabel(s.searchClients);
  68 | }
  69 | 
  70 | export function clientsTable(page: Page) {
  71 |   return page.getByRole("main").getByRole("table");
  72 | }
  73 | 
  74 | export async function addNote(page: Page, s: Strings, text: string) {
  75 |   await page.getByLabel(s.newNote).fill(text);
  76 |   await page.getByRole("button", { name: s.addNote }).click();
  77 |   await expect(page.getByText(s.noteAdded)).toBeVisible();
  78 |   await expect(page.getByRole("list", { name: s.notes })).toContainText(text);
  79 | }
  80 | 
  81 | /** A small CSV in the project language's template headers. */
  82 | export function importCsv(s: Strings, rows: Array<[string, string, string]>): string {
  83 |   const lines = [[s.firstName, s.lastName, s.phone], ...rows].map((cells) => cells.join(","));
  84 |   return `${lines.join("\r\n")}\r\n`;
  85 | }
  86 | 
```