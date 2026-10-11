# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: client-history.spec.ts >> the profile lists visits at every branch the reader sees, labelled by branch, with the no-show count
- Location: e2e/client-history.spec.ts:23:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'Appointments by staff' }).locator('[data-event-id]').filter({ hasText: 'en-mv3tld743vx' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('region', { name: 'Appointments by staff' }).locator('[data-event-id]').filter({ hasText: 'en-mv3tld743vx' }) with timeout 5000ms
  - waiting for getByRole('region', { name: 'Appointments by staff' }).locator('[data-event-id]').filter({ hasText: 'en-mv3tld743vx' })

```

```yaml
- link "Skip to main content":
  - /url: "#main"
- complementary:
  - navigation "Main":
    - list:
      - listitem:
        - link "Home":
          - /url: /?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "My day":
          - /url: /my-day?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Calendar":
          - /url: /calendar?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Clients":
          - /url: /clients?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Team":
          - /url: /team?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Catalogue":
          - /url: /catalogue?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Sales":
          - /url: /sales?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Reports":
          - /url: /reports?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Messages":
          - /url: /messages?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Activity":
          - /url: /audit?branch=00000000-0000-4000-a000-000000000005
      - listitem:
        - link "Settings":
          - /url: /settings?branch=00000000-0000-4000-a000-000000000005
- banner:
  - paragraph: Setup Studio
  - text: Owner Branch
  - combobox "Branch":
    - option "All branches"
    - option "Hawally"
    - option "Jahra" [selected]
  - group "Cash register"
  - button "Search clients, appointments and sales": Search Ctrl K
  - button "العربية"
  - button "Salma Setup"
- main:
  - heading "Calendar" [level=1]
  - button "Quick sale"
  - button "New appointment" [disabled]
  - radiogroup "Calendar view":
    - radio "Day" [checked]
    - radio "Week"
  - button "Previous day"
  - button "Today"
  - button "Next day"
  - heading "Monday, October 12" [level=2]
  - button "All staff members"
  - text: Service category
  - combobox "Service category":
    - option "All categories" [selected]
  - text: Go to date
  - textbox "Go to date": 2026-10-12
  - status "Loading"
  - status
- status
- alert
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | import { nextFullDay } from "./blockedTimeFlows";
  3  | import { assignToBranch, create, createClient, createService, createStaff, kuwait, setStatus } from "./bookingFixtures";
  4  | import { expect, signIn, test } from "./fixtures";
  5  | import { newPersonPage, unique } from "./memberFlows";
  6  | import { kuwaitToday } from "./shiftFlows";
  7  | import { SETUP_BRANCH } from "./staffFlows";
  8  | import type { Strings } from "./strings";
  9  | 
  10 | // The client profile lists the client's visits across branches, labelled by
  11 | // branch, with their no-show count; RLS decides which branches a reader sees.
  12 | 
  13 | async function openProfile(page: Page, s: Strings, email: string, clientId: string) {
  14 |   await page.goto("/login");
  15 |   await signIn(page, s, email);
  16 |   await expect(page).toHaveURL(/\?branch=/);
  17 |   await page.goto(`/clients/${clientId}`);
  18 |   return page.getByRole("region", { name: s.appointments, exact: true });
  19 | }
  20 | 
  21 | const stat = (card: ReturnType<Page["getByRole"]>, label: string) => card.locator("dl > div").filter({ hasText: label }).locator("dd");
  22 | 
  23 | test("the profile lists visits at every branch the reader sees, labelled by branch, with the no-show count", async ({
  24 |   page,
  25 |   browser,
  26 |   request,
  27 |   s,
  28 |   appLocale,
  29 | }) => {
  30 |   const id = unique(appLocale);
  31 |   const day = nextFullDay(kuwaitToday());
  32 |   const serviceId = await createService(request, { en: `Facial ${id}`, ar: `تنظيف بشرة ${id}` }, { duration: 60 });
  33 |   const staffId = await createStaff(request, {
  34 |     name: { en: `Mona ${id}`, ar: `منى ${id}` },
  35 |     branchId: SETUP_BRANCH.hawally,
  36 |     serviceIds: [serviceId],
  37 |     shifts: [{ day, starts: "09:00", ends: "14:00" }],
  38 |   });
  39 |   await assignToBranch(request, staffId, { branchId: SETUP_BRANCH.jahra, serviceIds: [serviceId], shifts: [{ day, starts: "14:00", ends: "22:00" }] });
  40 |   const clientId = await createClient(request, { firstName: "Sara", lastName: id, firstNameAlt: "سارة", lastNameAlt: id });
  41 |   const at = (branchId: string, time: string) => ({
  42 |     branchId,
  43 |     clientId,
  44 |     items: [{ service_id: serviceId, staff_id: staffId, starts_at: kuwait(day, time) }],
  45 |   });
  46 |   const hawally = await create(request, "setup-reception@spacorner.test", at(SETUP_BRANCH.hawally, "10:00"));
  47 |   const missed = await create(request, "setup-reception@spacorner.test", at(SETUP_BRANCH.hawally, "12:00"));
  48 |   await setStatus(request, "setup-reception@spacorner.test", missed.id, "no_show");
  49 |   const jahra = await create(request, "setup-owner@spacorner.test", at(SETUP_BRANCH.jahra, "16:00"));
  50 | 
  51 |   // The owner sees both branches.
  52 |   const card = await openProfile(page, s, "setup-owner@spacorner.test", clientId);
  53 |   await expect(stat(card, s.appointments)).toHaveText("3");
  54 |   await expect(stat(card, s.noShows)).toHaveText("1");
  55 |   const upcoming = card.getByRole("list", { name: s.upcoming }).getByRole("listitem");
  56 |   await expect(upcoming).toHaveCount(2);
  57 |   await expect(upcoming.nth(0)).toContainText(s.hawally);
  58 |   await expect(upcoming.nth(0)).toContainText(hawally.ref);
  59 |   await expect(upcoming.nth(1)).toContainText(s.jahra);
  60 |   await expect(upcoming.nth(1)).toContainText(jahra.ref);
  61 |   // A no-show is history even when its time is still ahead.
  62 |   const past = card.getByRole("list", { name: s.past }).getByRole("listitem");
  63 |   await expect(past).toHaveCount(1);
  64 |   await expect(past.first()).toContainText(missed.ref);
  65 |   await expect(past.first()).toContainText(s.noShow);
  66 | 
  67 |   // The ref opens that branch's day on the calendar.
  68 |   await upcoming.nth(1).getByRole("link", { name: jahra.ref }).click();
  69 |   await expect(page).toHaveURL(new RegExp(`/calendar\\?.*branch=${SETUP_BRANCH.jahra}`));
  70 |   await expect(page).toHaveURL(new RegExp(`date=${day}`));
> 71 |   await expect(page.getByRole("region", { name: s.appointmentsByStaff }).locator("[data-event-id]").filter({ hasText: id })).toBeVisible();
     |                                                                                                                              ^ Error: expect(locator).toBeVisible() failed
  72 | 
  73 |   // Hawally's front desk sees only Hawally's visits, and only those count.
  74 |   const reception = await newPersonPage(browser, appLocale);
  75 |   const hawallyCard = await openProfile(reception, s, "setup-reception@spacorner.test", clientId);
  76 |   await expect(stat(hawallyCard, s.appointments)).toHaveText("2");
  77 |   await expect(stat(hawallyCard, s.noShows)).toHaveText("1");
  78 |   await expect(hawallyCard.getByRole("list", { name: s.upcoming }).getByRole("listitem")).toHaveCount(1);
  79 |   await expect(hawallyCard).not.toContainText(jahra.ref);
  80 |   await reception.context().close();
  81 | });
  82 | 
```