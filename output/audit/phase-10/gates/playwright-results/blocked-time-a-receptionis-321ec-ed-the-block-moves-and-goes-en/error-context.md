# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blocked-time.spec.ts >> a receptionist blocks time at their branch; overlaps and appointments are explained; the block moves and goes
- Location: e2e/blocked-time.spec.ts:20:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Staff member added.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Staff member added.') with timeout 5000ms
  - waiting for getByText('Staff member added.')

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
        - link "Reports":
          - /url: /reports?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Messages":
          - /url: /messages?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Activity":
          - /url: /audit?branch=00000000-0000-4000-a000-000000000004
      - listitem:
        - link "Settings":
          - /url: /settings?branch=00000000-0000-4000-a000-000000000004
- banner:
  - paragraph: Setup Studio
  - text: Branch manager
  - group "Branch (locked)":
    - paragraph: Hawally
  - group "Cash register":
    - text: Register closed
    - button "Open register"
  - button "Search clients, appointments and sales": Search Ctrl K
  - button "العربية"
  - button "Maryam Hawally"
- main:
  - link "Back to staff":
    - /url: /team/staff?branch=00000000-0000-4000-a000-000000000004
  - heading "Add staff member" [level=1]
  - heading "Details" [level=2]
  - text: Full name (English)
  - textbox "Full name (English)": Block en-mv7zvzaa6lc
  - text: Full name (Arabic)
  - textbox "Full name (Arabic)": حجب en-mv7zvzaa6lc
  - text: Job title (English)
  - textbox "Job title (English)"
  - text: Job title (Arabic)
  - textbox "Job title (Arabic)"
  - text: Phone
  - textbox "Phone"
  - text: Email
  - textbox "Email"
  - text: Needed only if they will sign in.
  - checkbox "Can be booked" [checked]
  - text: Can be booked Turn off for staff members who don't take appointments.
  - group "Branches":
    - text: Branches
    - paragraph: Choose where they work. They appear in each branch's staff list and schedule.
    - checkbox "Hawally" [checked]
    - text: Hawally
    - checkbox "Bookable at Hawally" [checked]
    - text: Bookable at Hawally
  - button "Add staff member" [disabled]
- status
- alert
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | import { expect } from "./fixtures";
  3  | import type { Strings } from "./strings";
  4  | 
  5  | // Staff journeys shared by staff.spec.ts and the Phase 2 evidence run.
  6  | 
  7  | export const SETUP_BRANCH = {
  8  |   hawally: "00000000-0000-4000-a000-000000000004",
  9  |   jahra: "00000000-0000-4000-a000-000000000005",
  10 | } as const;
  11 | 
  12 | export async function openStaffList(page: Page, s: Strings, branchId?: string) {
  13 |   if (branchId) {
  14 |     // A just-submitted sign-in must land before a full page load.
  15 |     await expect(page).not.toHaveURL(/\/login/);
  16 |     await page.goto(`/team/staff?branch=${branchId}`);
  17 |   } else {
  18 |     await page.getByRole("link", { name: s.team, exact: true }).click();
  19 |   }
  20 |   await expect(page.getByRole("heading", { level: 1, name: s.staffMembers })).toBeVisible();
  21 | }
  22 | 
  23 | export type NewStaff = {
  24 |   nameEn: string;
  25 |   nameAr: string;
  26 |   email?: string;
  27 |   /** Branch labels to tick; the active branch starts ticked. */
  28 |   branches: string[];
  29 |   defaultBranch?: string;
  30 | };
  31 | 
  32 | /** Fills the new-staff form from the list page and saves; ends on the new staff member's editor. */
  33 | export async function addStaff(page: Page, s: Strings, staff: NewStaff) {
  34 |   await page.getByRole("link", { name: s.addStaffMember }).click();
  35 |   await expect(page.getByRole("heading", { level: 1, name: s.addStaffMember })).toBeVisible();
  36 |   await page.getByLabel(s.fullNameEn).fill(staff.nameEn);
  37 |   await page.getByLabel(s.fullNameAr).fill(staff.nameAr);
  38 |   if (staff.email) await page.getByLabel(s.email).fill(staff.email);
  39 |   for (const branch of staff.branches) {
  40 |     await page.getByRole("checkbox", { name: branch, exact: true }).check();
  41 |   }
  42 |   if (staff.defaultBranch) await page.getByLabel(s.defaultBranch).selectOption({ label: staff.defaultBranch });
  43 |   await page.getByRole("button", { name: s.addStaffMember }).click();
> 44 |   await expect(page.getByText(s.staffAdded)).toBeVisible();
     |                                              ^ Error: expect(locator).toBeVisible() failed
  45 |   await expect(page).toHaveURL(/\/team\/staff\/[0-9a-f-]{36}/);
  46 | }
  47 | 
  48 | export const staffRow = (page: Page, marker: string) => page.getByRole("row", { name: new RegExp(marker) });
  49 | 
```