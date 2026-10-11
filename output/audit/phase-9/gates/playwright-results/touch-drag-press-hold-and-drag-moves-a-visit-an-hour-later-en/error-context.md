# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: touch-drag.spec.ts >> press, hold and drag moves a visit an hour later
- Location: e2e/touch-drag.spec.ts:70:1

# Error details

```
Error: {"code":"PGRST205","details":null,"hint":null,"message":"Could not find the table 'public.service_categories' in the schema cache"}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1   | import type { APIRequestContext } from "@playwright/test";
  2   | import { functionUrl } from "@repo/api";
  3   | import { expect, PASSWORD } from "./fixtures";
  4   | 
  5   | // Phase 5 booking fixtures. Each run provisions its own Setup Studio staff,
  6   | // services, clients and shifts with the local service key (never touching the
  7   | // SpaCorner seed), then books through the bookings function as a front-desk
  8   | // login, never by writing appointments directly. Global setup retires earlier
  9   | // runs' staff (`retireLeftoverStaff`); `pnpm db:reset` clears everything.
  10  | 
  11  | export const API = "http://127.0.0.1:54321";
  12  | export const REST = `${API}/rest/v1`;
  13  | // The local stack's well-known keys (supabase/functions/_shared/testing.ts).
  14  | export const ANON_KEY =
  15  |   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
  16  | const SERVICE_KEY =
  17  |   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
  18  | 
  19  | export const SETUP_TENANT = "00000000-0000-4000-9000-000000000003";
  20  | export const admin = { apikey: SERVICE_KEY, authorization: `Bearer ${SERVICE_KEY}`, prefer: "return=representation" };
  21  | 
  22  | export async function insert<T = { id: string }>(request: APIRequestContext, table: string, data: unknown): Promise<T[]> {
  23  |   const response = await request.post(`${REST}/${table}`, { headers: admin, data });
  24  |   expect(response.ok(), `${table}: ${await response.text()}`).toBe(true);
  25  |   return (await response.json()) as T[];
  26  | }
  27  | 
  28  | async function insertOne(request: APIRequestContext, table: string, data: unknown): Promise<string> {
  29  |   const [row] = await insert(request, table, data);
  30  |   if (!row) throw new Error(`no ${table} row returned`);
  31  |   return row.id;
  32  | }
  33  | 
  34  | /** A Kuwait wall-clock time on `day` as an instant with its offset. */
  35  | export const kuwait = (day: string, time: string) => `${day}T${time}:00+03:00`;
  36  | 
  37  | const FIXTURE_CATEGORY = "Booking fixtures";
  38  | let fixtureCategory: Promise<string> | null = null;
  39  | 
  40  | /**
  41  |  * The one category every fixture service shares. Categories append to the menu, so creating them
  42  |  * while catalogue.spec reorders its own breaks that test; global setup creates it before any worker.
  43  |  */
  44  | export async function ensureFixtureCategory(request: APIRequestContext): Promise<string> {
  45  |   const found = await request.get(
  46  |     `${REST}/service_categories?tenant_id=eq.${SETUP_TENANT}&name_en=eq.${encodeURIComponent(FIXTURE_CATEGORY)}&select=id&order=created_at&limit=1`,
  47  |     { headers: admin },
  48  |   );
> 49  |   expect(found.ok(), await found.text()).toBe(true);
      |                                          ^ Error: {"code":"PGRST205","details":null,"hint":null,"message":"Could not find the table 'public.service_categories' in the schema cache"}
  50  |   const [row] = (await found.json()) as { id: string }[];
  51  |   return row?.id ?? insertOne(request, "service_categories", { tenant_id: SETUP_TENANT, name_en: FIXTURE_CATEGORY });
  52  | }
  53  | 
  54  | /** Fixture staff names end with their run's id: e2e `… en-<id>` or `… ar-<id>`, Deno `… <runId>`. */
  55  | const FIXTURE_STAFF_NAME = " ((en|ar)-)?[0-9a-z]{10,14}$";
  56  | 
  57  | /**
  58  |  * Fixture staff stay active until `pnpm db:reset`, and every run adds about 64 at Hawally. Past roughly
  59  |  * 130 the calendar's per-staff reads slow until journeys time out, so global setup retires the earlier
  60  |  * runs' (and the Deno suites') staff before any worker starts. Pages send some id lists in one URL that
  61  |  * the gateway rejects past ~8 KB: the blocked-time page every staff member of the branch (inactive ones
  62  |  * included) and the calendar every person holding an appointment that day. So retired fixture staff also
  63  |  * lose their branch assignments, and their visits from today on are cancelled through the bookings
  64  |  * function; appointments are never written directly. Only Setup Studio staff whose name ends with a run
  65  |  * id are touched.
  66  |  */
  67  | export async function retireLeftoverStaff(request: APIRequestContext): Promise<{ staff: number; appointments: number }> {
  68  |   const name = (column: string) => `${column}.match."${FIXTURE_STAFF_NAME}"`;
  69  |   const fixtureStaff = `staff_members?tenant_id=eq.${SETUP_TENANT}&or=${encodeURIComponent(`(${name("full_name_en")},${name("full_name_ar")})`)}`;
  70  |   const retired = await request.patch(`${REST}/${fixtureStaff}&is_active=is.true&select=id`, {
  71  |     headers: admin,
  72  |     data: { is_active: false },
  73  |   });
  74  |   expect(retired.ok(), await retired.text()).toBe(true);
  75  | 
  76  |   const inactive = await request.get(`${REST}/${fixtureStaff}&is_active=is.false&select=id`, { headers: admin });
  77  |   expect(inactive.ok(), await inactive.text()).toBe(true);
  78  |   const ids = ((await inactive.json()) as { id: string }[]).map((row) => row.id);
  79  |   const today = kuwait(new Date(Date.now() + 3 * 3_600_000).toISOString().slice(0, 10), "00:00");
  80  |   const visits = new Set<string>();
  81  |   for (let start = 0; start < ids.length; start += 100) {
  82  |     const chunk = ids.slice(start, start + 100).join(",");
  83  |     const unassigned = await request.delete(`${REST}/staff_branch_assignments?tenant_id=eq.${SETUP_TENANT}&staff_id=in.(${chunk})`, {
  84  |       headers: admin,
  85  |     });
  86  |     expect(unassigned.ok(), await unassigned.text()).toBe(true);
  87  |     const held = await request.get(
  88  |       `${REST}/appointments?tenant_id=eq.${SETUP_TENANT}&status=in.(booked,confirmed,arrived)&scheduled_end=gt.${encodeURIComponent(today)}` +
  89  |         `&select=id,items:appointment_items!appointment_items_appointment_id_tenant_id_fkey!inner(staff_id)&items.staff_id=in.(${chunk})`,
  90  |       { headers: admin },
  91  |     );
  92  |     expect(held.ok(), await held.text()).toBe(true);
  93  |     for (const row of (await held.json()) as { id: string }[]) visits.add(row.id);
  94  |   }
  95  |   if (visits.size > 0) await cancelAll(request, [...visits]);
  96  |   return { staff: ((await retired.json()) as unknown[]).length, appointments: visits.size };
  97  | }
  98  | 
  99  | /** POST /bookings/cancel for each visit as the Setup Studio owner (every branch), with one sign-in. */
  100 | async function cancelAll(request: APIRequestContext, appointmentIds: string[]) {
  101 |   const reasons = await request.get(
  102 |     `${REST}/cancellation_reasons?tenant_id=eq.${SETUP_TENANT}&is_active=is.true&name_en=eq.${encodeURIComponent("Client request")}&select=id`,
  103 |     { headers: admin },
  104 |   );
  105 |   expect(reasons.ok(), await reasons.text()).toBe(true);
  106 |   const [reason] = (await reasons.json()) as { id: string }[];
  107 |   if (!reason) throw new Error("Setup Studio has no active “Client request” cancellation reason");
  108 |   const token = await accessToken(request, "setup-owner@spacorner.test");
  109 |   const cancel = async (appointmentId: string) => {
  110 |     const response = await request.post(functionUrl(API, "bookings", "cancel"), {
  111 |       headers: { apikey: ANON_KEY, authorization: `Bearer ${token}`, "idempotency-key": crypto.randomUUID() },
  112 |       data: { tenant_id: SETUP_TENANT, appointment_id: appointmentId, cancellation_reason_id: reason.id },
  113 |     });
  114 |     expect(response.ok(), await response.text()).toBe(true);
  115 |   };
  116 |   for (let start = 0; start < appointmentIds.length; start += 8) {
  117 |     await Promise.all(appointmentIds.slice(start, start + 8).map(cancel));
  118 |   }
  119 | }
  120 | 
  121 | function fixtureCategoryId(request: APIRequestContext): Promise<string> {
  122 |   fixtureCategory ??= ensureFixtureCategory(request);
  123 |   return fixtureCategory;
  124 | }
  125 | 
  126 | export async function createService(
  127 |   request: APIRequestContext,
  128 |   name: { en: string; ar: string },
  129 |   opts: { duration?: number; price?: number } = {},
  130 | ): Promise<string> {
  131 |   const categoryId = await fixtureCategoryId(request);
  132 |   return insertOne(request, "services", {
  133 |     tenant_id: SETUP_TENANT,
  134 |     category_id: categoryId,
  135 |     name_en: name.en,
  136 |     name_ar: name.ar,
  137 |     duration_minutes: opts.duration ?? 60,
  138 |     price_minor: opts.price ?? 5000,
  139 |   });
  140 | }
  141 | 
  142 | export type StaffSpec = {
  143 |   name: { en: string; ar: string };
  144 |   branchId: string;
  145 |   serviceIds: string[];
  146 |   /** One shift per entry, Kuwait wall-clock. */
  147 |   shifts: { day: string; starts: string; ends: string }[];
  148 |   /** A staff-role login with the seed password. */
  149 |   email?: string;
```