# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: receipt.spec.ts >> the receipt prints every mandated element in its own language, 80 mm wide in print
- Location: e2e/receipt.spec.ts:139:1

# Error details

```
Error: {"code":"PGRST002","details":null,"hint":null,"message":"Could not query the database for the schema cache. Retrying."}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1   | import type { APIRequestContext, Page } from "@playwright/test";
  2   | import type { SaleCreateInput } from "@repo/validation";
  3   | import { addDays } from "./blockedTimeFlows";
  4   | import { admin, create, createClient, createService, createStaff, kuwait, REST, SETUP_TENANT, setStatus } from "./bookingFixtures";
  5   | import { attemptRefund, attemptVoid, createSale, enableTips, ensureRegisterOpen, openCalendar, saleOf } from "./checkoutFixtures";
  6   | import { expect, signIn, test } from "./fixtures";
  7   | import { unique } from "./memberFlows";
  8   | import { kuwaitToday } from "./shiftFlows";
  9   | import { SETUP_BRANCH } from "./staffFlows";
  10  | import type { AppLocale, Strings } from "./strings";
  11  | 
  12  | // The sale drawer and the 80 mm receipt at Setup Studio: en at Hawally (the
  13  | // receptionist sells, the manager refunds and voids), ar at Jahra (the owner
  14  | // does everything; it is the only Jahra login). Sales are made through the
  15  | // checkout function; the drawer settles and the receipt prints them.
  16  | 
  17  | const place = (appLocale: AppLocale) =>
  18  |   appLocale === "en"
  19  |     ? { branchId: SETUP_BRANCH.hawally, seller: "setup-reception@spacorner.test", refunder: "setup-manager@spacorner.test" }
  20  |     : { branchId: SETUP_BRANCH.jahra, seller: "setup-owner@spacorner.test", refunder: "setup-owner@spacorner.test" };
  21  | 
  22  | const PHONE = "+96522667788";
  23  | const CLIENT_PHONE = "+96555443322";
  24  | 
  25  | /** Receipt details on the branch; the receipt prints them in its language. */
  26  | async function brandBranch(request: APIRequestContext, branchId: string) {
  27  |   const response = await request.patch(`${REST}/branches?id=eq.${branchId}`, {
  28  |     headers: admin,
  29  |     data: {
  30  |       address: "Block 2, Tunis Street",
  31  |       phone: PHONE,
  32  |       receipt_header_en: "Thank you for visiting",
  33  |       receipt_header_ar: "شكراً لزيارتكم",
  34  |       receipt_footer_en: "See you soon",
  35  |       receipt_footer_ar: "نراكم قريباً",
  36  |     },
  37  |   });
> 38  |   expect(response.ok(), await response.text()).toBe(true);
      |                                                ^ Error: {"code":"PGRST002","details":null,"hint":null,"message":"Could not query the database for the schema cache. Retrying."}
  39  | }
  40  | 
  41  | async function namesOf(request: APIRequestContext, branchId: string) {
  42  |   const [tenant] = (await (await request.get(`${REST}/tenants?id=eq.${SETUP_TENANT}&select=name_en,name_ar`, { headers: admin })).json()) as {
  43  |     name_en: string;
  44  |     name_ar: string;
  45  |   }[];
  46  |   const [branch] = (await (await request.get(`${REST}/branches?id=eq.${branchId}&select=name_en,name_ar`, { headers: admin })).json()) as {
  47  |     name_en: string;
  48  |     name_ar: string;
  49  |   }[];
  50  |   const [tax] = (await (
  51  |     await request.get(`${REST}/tax_rates?tenant_id=eq.${SETUP_TENANT}&is_default=eq.true&select=name_en,name_ar`, { headers: admin })
  52  |   ).json()) as { name_en: string | null; name_ar: string | null }[];
  53  |   return { tenant: tenant!, branch: branch!, tax: tax! };
  54  | }
  55  | 
  56  | async function appointmentItems(request: APIRequestContext, appointmentId: string): Promise<{ id: string; staff_id: string }[]> {
  57  |   const response = await request.get(`${REST}/appointment_items?appointment_id=eq.${appointmentId}&select=id,staff_id&order=sort_order`, {
  58  |     headers: admin,
  59  |   });
  60  |   expect(response.ok(), await response.text()).toBe(true);
  61  |   return (await response.json()) as { id: string; staff_id: string }[];
  62  | }
  63  | 
  64  | /** A visit tomorrow for a new client with one 25.000 service, marked arrived. */
  65  | async function arrivedVisit(request: APIRequestContext, appLocale: AppLocale, id: string) {
  66  |   const { branchId, seller } = place(appLocale);
  67  |   const day = addDays(kuwaitToday(), 1);
  68  |   const serviceId = await createService(request, { en: `Haircut ${id}`, ar: `قص ${id}` }, { duration: 60, price: 25_000 });
  69  |   const staffName = { en: `Mona ${id}`, ar: `منى ${id}` };
  70  |   const staffId = await createStaff(request, { name: staffName, branchId, serviceIds: [serviceId], shifts: [{ day, starts: "09:00", ends: "22:00" }] });
  71  |   const client = { firstName: "Sara", lastName: id, firstNameAlt: "سارة", lastNameAlt: `العلي ${id}`, phone: CLIENT_PHONE };
  72  |   const clientId = await createClient(request, client);
  73  |   const visit = await create(request, seller, {
  74  |     branchId,
  75  |     clientId,
  76  |     items: [{ service_id: serviceId, staff_id: staffId, starts_at: kuwait(day, "15:00") }],
  77  |   });
  78  |   await setStatus(request, seller, visit.id, "arrived");
  79  |   const [item] = await appointmentItems(request, visit.id);
  80  |   return { day, visit, clientId, staffId, staffName, client, itemId: item!.id };
  81  | }
  82  | 
  83  | async function openReceipt(page: Page, s: Strings, actor: string, saleId: string, lang: AppLocale) {
  84  |   await page.goto("/login");
  85  |   await signIn(page, s, actor);
  86  |   await expect(page).toHaveURL(/\?branch=/);
  87  |   await page.goto(`/sales/${saleId}/receipt?lang=${lang}`);
  88  |   return page.locator("article[lang]");
  89  | }
  90  | 
  91  | test("a part-paid sale is settled from the sale drawer", async ({ page, request, s, appLocale }) => {
  92  |   const id = unique(appLocale);
  93  |   const { branchId, seller } = place(appLocale);
  94  |   await ensureRegisterOpen(request, seller, branchId);
  95  |   const { day, visit, clientId, itemId } = await arrivedVisit(request, appLocale, id);
  96  |   const sale = await createSale(request, seller, {
  97  |     tenant_id: SETUP_TENANT,
  98  |     branch_id: branchId,
  99  |     appointment_id: visit.id,
  100 |     client_id: clientId,
  101 |     lines: [{ type: "appointment_item", appointment_item_id: itemId }],
  102 |     tips: [],
  103 |     payments: [{ method: "knet_terminal", amount_minor: 10_000 }],
  104 |     expected: { total_minor: 25_000, tip_minor: 0, grand_total_minor: 25_000 },
  105 |   });
  106 |   expect(sale.status).toBe("part_paid");
  107 | 
  108 |   await openCalendar(page, s, seller, branchId, day);
  109 |   const byStaff = page.getByRole("region", { name: s.appointmentsByStaff });
  110 |   await byStaff.locator("[data-event-id]:not([id^='time-grid-event-copy-'])").filter({ hasText: id }).first().click();
  111 |   const appointment = page.getByRole("dialog", { name: new RegExp(id) });
  112 |   await appointment.getByRole("button", { name: s.viewSale }).click();
  113 | 
  114 |   const drawer = page.getByRole("dialog", { name: s.sale, exact: true });
  115 |   await expect(drawer).toContainText(sale.invoice_number);
  116 |   await expect(drawer.getByText(s.partPaid, { exact: true })).toBeVisible();
  117 |   await expect(drawer.getByRole("link", { name: s.printReceipt })).toHaveAttribute("href", `/sales/${sale.id}/receipt`);
  118 |   await expect(drawer.getByText(s.balanceDue)).toBeVisible();
  119 | 
  120 |   await drawer.getByRole("button", { name: s.settleBalance }).click();
  121 |   await drawer.getByRole("group", { name: s.addAPayment }).getByRole("button", { name: s.cash, exact: true }).click();
  122 |   await expect(drawer.getByRole("group", { name: s.cash, exact: true }).getByRole("textbox", { name: s.amount })).toHaveValue("15.000");
  123 |   await drawer.getByRole("button", { name: s.recordPayment }).dblclick();
  124 |   await expect(drawer.getByText(s.paidInFull(sale.invoice_number))).toBeVisible();
  125 |   await expect(drawer.getByText(s.paid, { exact: true })).toBeVisible();
  126 |   await expect(drawer.getByRole("button", { name: s.settleBalance })).toHaveCount(0);
  127 | 
  128 |   // Settled once: a cash payment in the open register clears the balance.
  129 |   const stored = await saleOf(request, { id: sale.id });
  130 |   expect(stored.status).toBe("completed");
  131 |   expect(stored.totals.due_minor).toBe(0);
  132 |   expect(stored.payments.map((p) => [p.payment_method, p.amount_minor])).toEqual([
  133 |     ["knet_terminal", 10_000],
  134 |     ["cash", 15_000],
  135 |   ]);
  136 |   expect(stored.payments[1]!.register_session_id).not.toBeNull();
  137 | });
  138 | 
```