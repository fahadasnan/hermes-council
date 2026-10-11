# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: receipt.spec.ts >> a part-paid sale is settled from the sale drawer
- Location: e2e/receipt.spec.ts:91:1

# Error details

```
Error: {"code":500,"error_code":"unexpected_failure","msg":"Database error querying schema","error_id":"ebe7efa6-3b0a-41a4-b7ad-f3eb3a199ce3"}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  148 |   /** A staff-role login with the seed password. */
  149 |   email?: string;
  150 | };
  151 | 
  152 | /** A bookable staff member at one branch, eligible for `serviceIds`, with shifts and optionally a login. */
  153 | export async function createStaff(request: APIRequestContext, spec: StaffSpec): Promise<string> {
  154 |   let userId: string | null = null;
  155 |   if (spec.email) {
  156 |     const created = await request.post(`${API}/auth/v1/admin/users`, {
  157 |       headers: admin,
  158 |       data: { email: spec.email, password: PASSWORD, email_confirm: true },
  159 |     });
  160 |     expect(created.ok(), await created.text()).toBe(true);
  161 |     userId = ((await created.json()) as { id: string }).id;
  162 |     await insert(request, "memberships", { tenant_id: SETUP_TENANT, user_id: userId, role: "staff", branch_id: spec.branchId });
  163 |   }
  164 |   const staffId = await insertOne(request, "staff_members", {
  165 |     tenant_id: SETUP_TENANT,
  166 |     full_name_en: spec.name.en,
  167 |     full_name_ar: spec.name.ar,
  168 |     user_id: userId,
  169 |   });
  170 |   await insert(request, "staff_branch_assignments", { tenant_id: SETUP_TENANT, staff_id: staffId, branch_id: spec.branchId, is_default: true });
  171 |   await makeBookable(request, staffId, spec);
  172 |   return staffId;
  173 | }
  174 | 
  175 | /** Makes an existing staff member (already assigned to the branch) eligible for `serviceIds` and gives them shifts. */
  176 | export async function makeBookable(
  177 |   request: APIRequestContext,
  178 |   staffId: string,
  179 |   spec: Pick<StaffSpec, "branchId" | "serviceIds" | "shifts">,
  180 | ): Promise<void> {
  181 |   if (spec.serviceIds.length > 0) {
  182 |     await insert(
  183 |       request,
  184 |       "service_staff",
  185 |       spec.serviceIds.map((serviceId) => ({ tenant_id: SETUP_TENANT, service_id: serviceId, branch_id: spec.branchId, staff_id: staffId })),
  186 |     );
  187 |   }
  188 |   if (spec.shifts.length > 0) {
  189 |     await insert(
  190 |       request,
  191 |       "shifts",
  192 |       spec.shifts.map((shift) => ({
  193 |         tenant_id: SETUP_TENANT,
  194 |         staff_id: staffId,
  195 |         branch_id: spec.branchId,
  196 |         starts_at: kuwait(shift.day, shift.starts),
  197 |         ends_at: kuwait(shift.day, shift.ends),
  198 |       })),
  199 |     );
  200 |   }
  201 | }
  202 | 
  203 | /** Assigns an existing staff member to a second branch and makes them bookable there. */
  204 | export async function assignToBranch(
  205 |   request: APIRequestContext,
  206 |   staffId: string,
  207 |   spec: Pick<StaffSpec, "branchId" | "serviceIds" | "shifts">,
  208 | ): Promise<void> {
  209 |   await insert(request, "staff_branch_assignments", { tenant_id: SETUP_TENANT, staff_id: staffId, branch_id: spec.branchId, is_default: false });
  210 |   await makeBookable(request, staffId, spec);
  211 | }
  212 | 
  213 | /** A branch price for a service (`service_branch_overrides`). */
  214 | export async function setBranchPrice(request: APIRequestContext, serviceId: string, branchId: string, price: number): Promise<void> {
  215 |   await insert(request, "service_branch_overrides", { tenant_id: SETUP_TENANT, service_id: serviceId, branch_id: branchId, price_minor: price });
  216 | }
  217 | 
  218 | export async function createClient(
  219 |   request: APIRequestContext,
  220 |   client: {
  221 |     firstName: string;
  222 |     lastName: string;
  223 |     firstNameAlt?: string;
  224 |     lastNameAlt?: string;
  225 |     allergies?: string;
  226 |     phone?: string;
  227 |     /** Blocked from booking, with this reason. */
  228 |     blockedReason?: string;
  229 |   },
  230 | ): Promise<string> {
  231 |   return insertOne(request, "clients", {
  232 |     tenant_id: SETUP_TENANT,
  233 |     first_name: client.firstName,
  234 |     last_name: client.lastName,
  235 |     first_name_alt: client.firstNameAlt ?? null,
  236 |     last_name_alt: client.lastNameAlt ?? null,
  237 |     allergies: client.allergies ?? null,
  238 |     ...(client.phone ? { phone: client.phone } : {}),
  239 |     ...(client.blockedReason ? { is_blocked: true, blocked_reason: client.blockedReason } : {}),
  240 |   });
  241 | }
  242 | 
  243 | export async function accessToken(request: APIRequestContext, email: string, password = PASSWORD): Promise<string> {
  244 |   const response = await request.post(`${API}/auth/v1/token?grant_type=password`, {
  245 |     headers: { apikey: ANON_KEY },
  246 |     data: { email, password },
  247 |   });
> 248 |   expect(response.ok(), await response.text()).toBe(true);
      |                                                ^ Error: {"code":500,"error_code":"unexpected_failure","msg":"Database error querying schema","error_id":"ebe7efa6-3b0a-41a4-b7ad-f3eb3a199ce3"}
  249 |   return ((await response.json()) as { access_token: string }).access_token;
  250 | }
  251 | 
  252 | export type BookingItem = { service_id: string; staff_id: string; starts_at: string };
  253 | 
  254 | async function post(request: APIRequestContext, actor: string, route: string, data: unknown) {
  255 |   return request.post(functionUrl(API, "bookings", route), {
  256 |     headers: {
  257 |       apikey: ANON_KEY,
  258 |       authorization: `Bearer ${await accessToken(request, actor)}`,
  259 |       "idempotency-key": crypto.randomUUID(),
  260 |     },
  261 |     data,
  262 |   });
  263 | }
  264 | 
  265 | type Booking = { branchId: string; clientId: string | null; items: BookingItem[]; overrides?: string[]; overrideReason?: string };
  266 | 
  267 | const createBody = (booking: Booking) => ({
  268 |   tenant_id: SETUP_TENANT,
  269 |   branch_id: booking.branchId,
  270 |   client_id: booking.clientId,
  271 |   items: booking.items,
  272 |   ...(booking.overrides ? { overrides: booking.overrides } : {}),
  273 |   ...(booking.overrideReason ? { override_reason: booking.overrideReason } : {}),
  274 | });
  275 | 
  276 | /** POST /bookings/create as `actor`, whatever the answer: its status and body. */
  277 | export async function attemptCreate(request: APIRequestContext, actor: string, booking: Booking): Promise<{ status: number; body: unknown }> {
  278 |   const response = await post(request, actor, "create", createBody(booking));
  279 |   return { status: response.status(), body: await response.json() };
  280 | }
  281 | 
  282 | /** POST /bookings/create as `actor` (a front-desk login); returns the new appointment's id, ref and item ids. */
  283 | export async function create(request: APIRequestContext, actor: string, booking: Booking): Promise<{ id: string; ref: string; itemIds: string[] }> {
  284 |   const response = await post(request, actor, "create", createBody(booking));
  285 |   expect(response.status(), await response.text()).toBe(201);
  286 |   const { data } = (await response.json()) as { data: { id: string; ref_number: string; items: { id: string }[] } };
  287 |   return { id: data.id, ref: data.ref_number, itemIds: data.items.map((item) => item.id) };
  288 | }
  289 | 
  290 | /** POST /bookings/reschedule as `actor`, to `targetBranchId` (another branch moves the visit). */
  291 | export async function reschedule(
  292 |   request: APIRequestContext,
  293 |   actor: string,
  294 |   appointmentId: string,
  295 |   targetBranchId: string,
  296 |   items: { item_id: string; staff_id: string; starts_at: string }[],
  297 | ): Promise<void> {
  298 |   const response = await post(request, actor, "reschedule", { tenant_id: SETUP_TENANT, appointment_id: appointmentId, target_branch_id: targetBranchId, items });
  299 |   expect(response.ok(), await response.text()).toBe(true);
  300 | }
  301 | 
  302 | /** POST /bookings/create as `actor`; returns the new appointment's ref. */
  303 | export async function book(request: APIRequestContext, actor: string, booking: Booking): Promise<string> {
  304 |   return (await create(request, actor, booking)).ref;
  305 | }
  306 | 
  307 | export type RecordedOverride = { rule: string; action: string; reason: string | null; created_by: string };
  308 | 
  309 | /** The soft-rule overrides recorded for the Setup Studio appointment `ref` (read with the service key). */
  310 | export async function overridesOf(request: APIRequestContext, ref: string): Promise<RecordedOverride[]> {
  311 |   const found = await request.get(
  312 |     `${REST}/appointments?tenant_id=eq.${SETUP_TENANT}&ref_number=eq.${encodeURIComponent(ref)}&select=booking_overrides(rule,action,reason,created_by)`,
  313 |     { headers: admin },
  314 |   );
  315 |   expect(found.ok(), await found.text()).toBe(true);
  316 |   const [row] = (await found.json()) as { booking_overrides: RecordedOverride[] }[];
  317 |   if (!row) throw new Error(`no appointment ${ref}`);
  318 |   return row.booking_overrides;
  319 | }
  320 | 
  321 | /** POST /bookings/set-status as `actor`, a forward move (no override). */
  322 | export async function setStatus(request: APIRequestContext, actor: string, appointmentId: string, status: string): Promise<void> {
  323 |   const response = await post(request, actor, "set-status", { tenant_id: SETUP_TENANT, appointment_id: appointmentId, status });
  324 |   expect(response.ok(), await response.text()).toBe(true);
  325 | }
  326 | 
```