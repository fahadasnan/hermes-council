# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: touch-drag.spec.ts >> a quick swipe that starts on a card scrolls and leaves the visit where it was
- Location: e2e/touch-drag.spec.ts:91:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByRole('region', { name: 'المواعيد حسب الموظف' }).locator('[data-event-id]:not([id^=\'time-grid-event-copy-\'])').filter({ hasText: 'ar-mv3tmynhyt2' }).locator('.gd-event-time')
Expected pattern: /15:00\s*–\s*16:00/
Received string:  "12:30 – 13:30"
Timeout: 5000ms

Call log:
  - Expect "toHaveText" getByRole('region', { name: 'المواعيد حسب الموظف' }).locator('[data-event-id]:not([id^=\'time-grid-event-copy-\'])').filter({ hasText: 'ar-mv3tmynhyt2' }).locator('.gd-event-time') with timeout 5000ms
  - waiting for getByRole('region', { name: 'المواعيد حسب الموظف' }).locator('[data-event-id]:not([id^=\'time-grid-event-copy-\'])').filter({ hasText: 'ar-mv3tmynhyt2' }).locator('.gd-event-time')
    14 × locator resolved to <span class="gd-event-time">12:30 – 13:30</span>
       - unexpected value "12:30 – 13:30"

```

```yaml
- text: 12:30 – 13:30
```

# Test source

```ts
  1   | import type { CDPSession, Locator, Page } from "@playwright/test";
  2   | import { addDays } from "./blockedTimeFlows";
  3   | import { book, createClient, createService, createStaff, kuwait } from "./bookingFixtures";
  4   | import { expect, signIn, test } from "./fixtures";
  5   | import { unique } from "./memberFlows";
  6   | import { kuwaitToday } from "./shiftFlows";
  7   | import { SETUP_BRANCH } from "./staffFlows";
  8   | import type { Strings } from "./strings";
  9   | 
  10  | // Moving appointments on a tablet (768x1024, touch): a press-and-hold drag
  11  | // moves a visit, a tap opens it, and a quick swipe that starts on a card
  12  | // scrolls without moving it. Touch moves go through Chromium's input
  13  | // pipeline (CDP), the same path a finger takes.
  14  | 
  15  | test.use({ hasTouch: true, viewport: { width: 768, height: 1024 } });
  16  | test.skip(({ browserName }) => browserName !== "chromium", "touch moves are dispatched through CDP");
  17  | 
  18  | const EVENT = "[data-event-id]:not([id^='time-grid-event-copy-'])";
  19  | // BookingCalendar draws 24px per slot; Hawally keeps the default 15-minute step.
  20  | const PX_PER_MINUTE = 24 / 15;
  21  | // schedule-x starts a drag 150 ms after the finger lands.
  22  | const HOLD_MS = 300;
  23  | 
  24  | const timeOf = (event: Locator) => event.locator(".gd-event-time");
  25  | const hours = (start: string, end: string) => new RegExp(`${start}\\s*–\\s*${end}`);
  26  | 
  27  | async function oneBooked(page: Page, s: Strings, id: string, day: string) {
  28  |   const serviceId = await createService(page.request, { en: `Facial ${id}`, ar: `تنظيف بشرة ${id}` }, { duration: 60 });
  29  |   const staffId = await createStaff(page.request, {
  30  |     name: { en: `Mona ${id}`, ar: `منى ${id}` },
  31  |     branchId: SETUP_BRANCH.hawally,
  32  |     serviceIds: [serviceId],
  33  |     shifts: [{ day, starts: "09:00", ends: "22:00" }],
  34  |   });
  35  |   const clientId = await createClient(page.request, { firstName: "Sara", lastName: id, firstNameAlt: "سارة", lastNameAlt: id });
  36  |   await book(page.request, "setup-reception@spacorner.test", {
  37  |     branchId: SETUP_BRANCH.hawally,
  38  |     clientId,
  39  |     items: [{ service_id: serviceId, staff_id: staffId, starts_at: kuwait(day, "15:00") }],
  40  |   });
  41  |   await page.goto("/login");
  42  |   await signIn(page, s, "setup-reception@spacorner.test");
  43  |   await expect(page).toHaveURL(/\?branch=/);
  44  |   await page.goto(`/calendar?branch=${SETUP_BRANCH.hawally}&date=${day}&staff=${encodeURIComponent(JSON.stringify([staffId]))}`);
  45  |   const event = page.getByRole("region", { name: s.appointmentsByStaff }).locator(EVENT).filter({ hasText: id });
  46  |   await expect(() => event.scrollIntoViewIfNeeded({ timeout: 1_000 })).toPass({ timeout: 5_000 });
  47  |   await expect(timeOf(event)).toHaveText(hours("15:00", "16:00"));
  48  |   return event;
  49  | }
  50  | 
  51  | async function startPoint(event: Locator) {
  52  |   const box = await event.boundingBox();
  53  |   if (!box) throw new Error("not on screen");
  54  |   return { x: box.x + box.width / 2, y: box.y + Math.min(12, box.height / 2) };
  55  | }
  56  | 
  57  | /** One finger from `from`, `dy` pixels down in `steps` moves `stepMs` apart, after holding still `holdMs`. */
  58  | async function touchGesture(cdp: CDPSession, from: { x: number; y: number }, dy: number, opts: { holdMs: number; steps: number; stepMs: number }) {
  59  |   const touch = (type: "touchStart" | "touchMove" | "touchEnd", y?: number) =>
  60  |     cdp.send("Input.dispatchTouchEvent", { type, touchPoints: y === undefined ? [] : [{ x: from.x, y, id: 1 }] });
  61  |   await touch("touchStart", from.y);
  62  |   await new Promise((resolve) => setTimeout(resolve, opts.holdMs));
  63  |   for (let step = 1; step <= opts.steps; step += 1) {
  64  |     await touch("touchMove", from.y + (dy * step) / opts.steps);
  65  |     await new Promise((resolve) => setTimeout(resolve, opts.stepMs));
  66  |   }
  67  |   await touch("touchEnd");
  68  | }
  69  | 
  70  | test("press, hold and drag moves a visit an hour later", async ({ page, s, appLocale }) => {
  71  |   const id = unique(appLocale);
  72  |   const sara = appLocale === "ar" ? `سارة ${id}` : `Sara ${id}`;
  73  |   const event = await oneBooked(page, s, id, addDays(kuwaitToday(), 1));
  74  |   const cdp = await page.context().newCDPSession(page);
  75  | 
  76  |   await touchGesture(cdp, await startPoint(event), 60 * PX_PER_MINUTE, { holdMs: HOLD_MS, steps: 20, stepMs: 16 });
  77  |   await expect(timeOf(event)).toHaveText(hours("16:00", "17:00"));
  78  |   await expect(page.getByText(s.movedTo(sara))).toBeVisible();
  79  | });
  80  | 
  81  | test("a tap opens the visit without moving it", async ({ page, s, appLocale }) => {
  82  |   const id = unique(appLocale);
  83  |   const event = await oneBooked(page, s, id, addDays(kuwaitToday(), 1));
  84  | 
  85  |   await event.tap();
  86  |   await expect(page.getByRole("dialog", { name: new RegExp(id) })).toBeVisible();
  87  |   await page.keyboard.press("Escape");
  88  |   await expect(timeOf(event)).toHaveText(hours("15:00", "16:00"));
  89  | });
  90  | 
  91  | test("a quick swipe that starts on a card scrolls and leaves the visit where it was", async ({ page, s, appLocale }) => {
  92  |   const id = unique(appLocale);
  93  |   const sara = appLocale === "ar" ? `سارة ${id}` : `Sara ${id}`;
  94  |   const event = await oneBooked(page, s, id, addDays(kuwaitToday(), 1));
  95  |   const cdp = await page.context().newCDPSession(page);
  96  | 
  97  |   // A flick upwards lasting longer than the 150 ms drag delay.
  98  |   const from = await startPoint(event);
  99  |   await touchGesture(cdp, from, -240, { holdMs: 0, steps: 15, stepMs: 20 });
  100 |   await page.waitForTimeout(1_000);
> 101 |   await expect(timeOf(event)).toHaveText(hours("15:00", "16:00"));
      |                               ^ Error: expect(locator).toHaveText(expected) failed
  102 |   expect((await startPoint(event)).y, "the grid scrolled").toBeLessThan(from.y - 100);
  103 |   await expect(page.getByText(s.movedTo(sara))).toHaveCount(0);
  104 | });
  105 | 
```