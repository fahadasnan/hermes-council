# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> home >> staff see their own appointments and no sales
- Location: e2e/home.spec.ts:85:3

# Error details

```
Error: {"code":500,"error_code":"unexpected_failure","msg":"Database error checking email","error_id":"d19ebb14-48ab-474c-af76-118629c336bb"}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  145 | };
  146 | 
  147 | /** A branch's register sessions as stored (service read), oldest first. */
  148 | export async function registerSessionsOf(request: APIRequestContext, branchId: string): Promise<StoredRegisterSession[]> {
  149 |   const select = "id,closed_at,opening_cash_minor,expected_cash_minor,counted_cash_minor,difference_minor,close_note";
  150 |   const response = await request.get(`${REST}/register_sessions?branch_id=eq.${branchId}&select=${select}&order=opened_at`, { headers: admin });
  151 |   expect(response.ok(), await response.text()).toBe(true);
  152 |   return (await response.json()) as StoredRegisterSession[];
  153 | }
  154 | 
  155 | /** POST /checkout/refund as `actor`, whatever the answer. */
  156 | export function attemptRefund(request: APIRequestContext, actor: string, input: { tenantId?: string; paymentId: string; reason: string }) {
  157 |   return attempt(request, actor, "refund", { tenant_id: input.tenantId ?? SETUP_TENANT, payment_id: input.paymentId, reason: input.reason });
  158 | }
  159 | 
  160 | /** POST /checkout/void as `actor`, whatever the answer. */
  161 | export function attemptVoid(request: APIRequestContext, actor: string, input: { tenantId?: string; saleId: string; reason: string }) {
  162 |   return attempt(request, actor, "void", { tenant_id: input.tenantId ?? SETUP_TENANT, sale_id: input.saleId, reason: input.reason });
  163 | }
  164 | 
  165 | const TOTALS = [
  166 |   "subtotal_minor",
  167 |   "line_discount_minor",
  168 |   "sale_discount_fixed_minor",
  169 |   "sale_discount_percent_bp",
  170 |   "sale_discount_minor",
  171 |   "tax_minor",
  172 |   "total_minor",
  173 |   "tip_minor",
  174 |   "grand_total_minor",
  175 |   "paid_minor",
  176 |   "due_minor",
  177 | ] as const;
  178 | 
  179 | export type StoredSale = {
  180 |   id: string;
  181 |   invoice_number: string;
  182 |   status: string;
  183 |   appointment_id: string | null;
  184 |   client_id: string | null;
  185 |   totals: Record<(typeof TOTALS)[number], number>;
  186 |   payments: { payment_type: string; payment_method: string; amount_minor: number; register_session_id: string | null }[];
  187 | };
  188 | 
  189 | /**
  190 |  * Sales as stored (service read), oldest first: by id, by appointment, or by
  191 |  * a line's English or Arabic name (a quick sale's custom item).
  192 |  */
  193 | export async function salesOf(
  194 |   request: APIRequestContext,
  195 |   by: { id: string } | { appointmentId: string } | { itemName: string },
  196 | ): Promise<StoredSale[]> {
  197 |   const filter =
  198 |     "id" in by
  199 |       ? `id=eq.${by.id}`
  200 |       : "appointmentId" in by
  201 |         ? `appointment_id=eq.${by.appointmentId}`
  202 |         : `items.or=${encodeURIComponent(`(name_en.eq."${by.itemName}",name_ar.eq."${by.itemName}")`)}`;
  203 |   const select = `id,invoice_number,status,appointment_id,client_id,${TOTALS.join(",")},items:sale_items!inner(name_en,name_ar),payments(payment_type,payment_method,amount_minor,register_session_id,created_at)`;
  204 |   const response = await request.get(`${REST}/sales?${filter}&select=${select}&order=created_at`, { headers: admin });
  205 |   expect(response.ok(), await response.text()).toBe(true);
  206 |   const rows = (await response.json()) as (Record<string, unknown> & { payments: (StoredSale["payments"][number] & { created_at: string })[] })[];
  207 |   return rows.map((row) => ({
  208 |     id: String(row.id),
  209 |     invoice_number: String(row.invoice_number),
  210 |     status: String(row.status),
  211 |     appointment_id: (row.appointment_id as string | null) ?? null,
  212 |     client_id: (row.client_id as string | null) ?? null,
  213 |     totals: Object.fromEntries(TOTALS.map((key) => [key, Number(row[key])])) as StoredSale["totals"],
  214 |     payments: [...row.payments]
  215 |       .sort((a, b) => a.created_at.localeCompare(b.created_at))
  216 |       .map(({ payment_type, payment_method, amount_minor, register_session_id }) => ({
  217 |         payment_type,
  218 |         payment_method,
  219 |         amount_minor: Number(amount_minor),
  220 |         register_session_id,
  221 |       })),
  222 |   }));
  223 | }
  224 | 
  225 | /** The one sale matching `by`; fails when there are none or several. */
  226 | export async function saleOf(request: APIRequestContext, by: Parameters<typeof salesOf>[1]): Promise<StoredSale> {
  227 |   const sales = await salesOf(request, by);
  228 |   expect(sales, `sales for ${JSON.stringify(by)}`).toHaveLength(1);
  229 |   return sales[0]!;
  230 | }
  231 | 
  232 | export type Shop = { id: string; tenantId: string; branchId: string; owner: string };
  233 | 
  234 | /**
  235 |  * A tenant of its own, provisioned like a real sign-up (`provision_tenant`)
  236 |  * with a fresh owner login (seed password) and one branch open every day.
  237 |  */
  238 | export async function freshShop(request: APIRequestContext, label: string): Promise<Shop> {
  239 |   const id = `${label}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  240 |   const owner = `owner-${id}@checkout.test`;
  241 |   const created = await request.post(`${API}/auth/v1/admin/users`, {
  242 |     headers: admin,
  243 |     data: { email: owner, password: PASSWORD, email_confirm: true },
  244 |   });
> 245 |   expect(created.ok(), await created.text()).toBe(true);
      |                                              ^ Error: {"code":500,"error_code":"unexpected_failure","msg":"Database error checking email","error_id":"d19ebb14-48ab-474c-af76-118629c336bb"}
  246 |   const ownerId = ((await created.json()) as { id: string }).id;
  247 |   const provisioned = await request.post(`${REST}/rpc/provision_tenant`, {
  248 |     headers: admin,
  249 |     data: {
  250 |       p_tenant: { name_en: `Checkout ${id}`, name_ar: `محل ${id}`, slug: `checkout-${id}` },
  251 |       p_branch: {
  252 |         name_en: `Main ${id}`,
  253 |         name_ar: `الرئيسي ${id}`,
  254 |         invoice_prefix: "INV",
  255 |         hours: Array.from({ length: 7 }, (_, day) => ({ day_of_week: day, opens_at: "09:00", closes_at: "21:00" })),
  256 |       },
  257 |       p_owner_id: ownerId,
  258 |       p_requested_by: "e2e checkout fixtures",
  259 |     },
  260 |   });
  261 |   expect(provisioned.ok(), await provisioned.text()).toBe(true);
  262 |   const { tenant_id: tenantId, branch_id: branchId } = (await provisioned.json()) as { tenant_id: string; branch_id: string };
  263 |   return { id, tenantId, branchId, owner };
  264 | }
  265 | 
  266 | /** A manager or receptionist login at the shop's branch (seed password). */
  267 | export async function addMember(request: APIRequestContext, shop: Shop, role: "branch_manager" | "receptionist"): Promise<string> {
  268 |   const email = `${role === "branch_manager" ? "manager" : "reception"}-${shop.id}@checkout.test`;
  269 |   const created = await request.post(`${API}/auth/v1/admin/users`, {
  270 |     headers: admin,
  271 |     data: { email, password: PASSWORD, email_confirm: true },
  272 |   });
  273 |   expect(created.ok(), await created.text()).toBe(true);
  274 |   const userId = ((await created.json()) as { id: string }).id;
  275 |   await insert(request, "memberships", { tenant_id: shop.tenantId, user_id: userId, role, branch_id: shop.branchId });
  276 |   return email;
  277 | }
  278 | 
  279 | export type ShopVisit = { id: string; itemId: string; clientId: string; label: string };
  280 | 
  281 | async function bookingCall(request: APIRequestContext, actor: string, route: string, data: unknown) {
  282 |   const response = await request.post(functionUrl(API, "bookings", route), {
  283 |     headers: { apikey: ANON_KEY, authorization: `Bearer ${await accessToken(request, actor)}`, "idempotency-key": crypto.randomUUID() },
  284 |     data,
  285 |   });
  286 |   expect(response.ok(), await response.text()).toBe(true);
  287 |   return ((await response.json()) as { data: { id: string } }).data;
  288 | }
  289 | 
  290 | export type ShopCatalogue = { serviceId: string; staffId: string; clientId: string; label: string };
  291 | 
  292 | /**
  293 |  * One 60-minute service at `priceMinor`, a new staff member who does it on a
  294 |  * 09:00-21:00 shift on `day` (Kuwait), and a new client.
  295 |  */
  296 | export async function shopCatalogue(request: APIRequestContext, shop: Shop, opts: { day: string; priceMinor: number }): Promise<ShopCatalogue> {
  297 |   const label = shop.id;
  298 |   const tenant = { tenant_id: shop.tenantId };
  299 |   const [category] = await insert(request, "service_categories", { ...tenant, name_en: "Services" });
  300 |   const [service] = await insert(request, "services", {
  301 |     ...tenant,
  302 |     category_id: category!.id,
  303 |     name_en: `Facial ${label}`,
  304 |     name_ar: `تنظيف بشرة ${label}`,
  305 |     duration_minutes: 60,
  306 |     price_minor: opts.priceMinor,
  307 |   });
  308 |   const [staff] = await insert(request, "staff_members", { ...tenant, full_name_en: `Huda ${label}`, full_name_ar: `هدى ${label}` });
  309 |   await insert(request, "staff_branch_assignments", { ...tenant, staff_id: staff!.id, branch_id: shop.branchId, is_default: true });
  310 |   await insert(request, "service_staff", { ...tenant, service_id: service!.id, branch_id: shop.branchId, staff_id: staff!.id });
  311 |   await insert(request, "shifts", {
  312 |     ...tenant,
  313 |     staff_id: staff!.id,
  314 |     branch_id: shop.branchId,
  315 |     starts_at: kuwait(opts.day, "09:00"),
  316 |     ends_at: kuwait(opts.day, "21:00"),
  317 |   });
  318 |   const [client] = await insert(request, "clients", {
  319 |     ...tenant,
  320 |     first_name: "Noor",
  321 |     last_name: label,
  322 |     first_name_alt: "نور",
  323 |     last_name_alt: `الصباح ${label}`,
  324 |   });
  325 |   return { serviceId: service!.id, staffId: staff!.id, clientId: client!.id, label };
  326 | }
  327 | 
  328 | /**
  329 |  * A visit at the shop on `day` 15:00 (Kuwait) for the `shopCatalogue`
  330 |  * service, staff member and client, booked through the bookings function as
  331 |  * `actor` and marked arrived, ready for checkout.
  332 |  */
  333 | export async function shopVisit(
  334 |   request: APIRequestContext,
  335 |   shop: Shop,
  336 |   actor: string,
  337 |   opts: { day: string; priceMinor: number },
  338 | ): Promise<ShopVisit> {
  339 |   const { serviceId, staffId, clientId, label } = await shopCatalogue(request, shop, opts);
  340 |   const visit = await bookingCall(request, actor, "create", {
  341 |     tenant_id: shop.tenantId,
  342 |     branch_id: shop.branchId,
  343 |     client_id: clientId,
  344 |     items: [{ service_id: serviceId, staff_id: staffId, starts_at: kuwait(opts.day, "15:00") }],
  345 |   });
```