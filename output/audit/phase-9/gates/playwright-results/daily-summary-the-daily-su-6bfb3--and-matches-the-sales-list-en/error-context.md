# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: daily-summary.spec.ts >> the daily summary adds up the day, flags the out-of-session refund, and matches the sales list
- Location: e2e/daily-summary.spec.ts:15:1

# Error details

```
Error: {"ok":false,"error":{"code":"UNAUTHENTICATED","message":"Invalid or expired session"}}

expect(received).toBe(expected) // Object.is equality

Expected: "register_already_open"
Received: undefined
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - generic [ref=f1e3]:
    - link "Skip to main content" [ref=f1e4] [cursor=pointer]:
      - /url: "#main"
    - complementary [ref=f1e5]:
      - navigation "Main" [ref=f1e6]:
        - list [ref=f1e7]:
          - listitem [ref=f1e8]:
            - link "Home" [ref=f1e9] [cursor=pointer]:
              - /url: /?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e10]:
            - link "My day" [ref=f1e11] [cursor=pointer]:
              - /url: /my-day?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e12]:
            - link "Calendar" [ref=f1e13] [cursor=pointer]:
              - /url: /calendar?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e14]:
            - link "Clients" [ref=f1e15] [cursor=pointer]:
              - /url: /clients?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e16]:
            - link "Team" [ref=f1e17] [cursor=pointer]:
              - /url: /team?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e18]:
            - link "Catalogue" [ref=f1e19] [cursor=pointer]:
              - /url: /catalogue?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e20]:
            - link "Sales" [ref=f1e21] [cursor=pointer]:
              - /url: /sales?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e22]:
            - link "Reports" [ref=f1e23] [cursor=pointer]:
              - /url: /reports?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e24]:
            - link "Messages" [ref=f1e25] [cursor=pointer]:
              - /url: /messages?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e26]:
            - link "Activity" [ref=f1e27] [cursor=pointer]:
              - /url: /audit?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - listitem [ref=f1e28]:
            - link "Settings" [ref=f1e29] [cursor=pointer]:
              - /url: /settings?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
    - banner [ref=f1e30]:
      - generic [ref=f1e31]:
        - paragraph [ref=f1e32]: Checkout summary-mv3tldxmpovf
        - generic [ref=f1e33]: Owner
        - group "Branch (locked)" [ref=f1e34]:
          - paragraph [ref=f1e38]: Main summary-mv3tldxmpovf
        - group "Cash register" [ref=f1e39]:
          - generic [ref=f1e40]: Register closed
          - button "Open register" [ref=f1e41] [cursor=pointer]
      - generic [ref=f1e42]:
        - button "Search clients, appointments and sales" [ref=f1e43] [cursor=pointer]:
          - generic [ref=f1e47]: Search
          - generic [ref=f1e48]: Ctrl K
        - button "العربية" [ref=f1e49] [cursor=pointer]
        - button "owner-summary-mv3tldxmpovf@checkout.test" [ref=f1e51] [cursor=pointer]:
          - text: owner-summary-mv3tldxmpovf@checkout.test
          - generic [aria-hidden] [ref=f1e52]: ▾
    - main [ref=f1e53]:
      - generic [ref=f1e54]:
        - generic [ref=f1e55]:
          - link "Back to settings" [ref=f1e56] [cursor=pointer]:
            - /url: /settings?branch=5b1b2c11-6d77-450d-b90a-56ec12824e1d
          - heading "Business details" [level=1] [ref=f1e58]
        - generic [ref=f1e61]:
          - generic [ref=f1e62]:
            - generic [ref=f1e63]: Business name (English)
            - textbox "Business name (English)" [ref=f1e64]: Checkout summary-mv3tldxmpovf
          - generic [ref=f1e65]:
            - generic [ref=f1e66]: Business name (Arabic)
            - textbox "Business name (Arabic)" [ref=f1e67]: محل summary-mv3tldxmpovf
          - generic [ref=f1e68]:
            - generic [ref=f1e69]: Default language for new team members
            - combobox "Default language for new team members" [ref=f1e70] [cursor=pointer]:
              - option "English"
              - option "العربية" [selected]
          - generic [ref=f1e71]:
            - generic [ref=f1e72]:
              - generic [ref=f1e73]: Currency
              - combobox "Currency" [ref=f1e74] [cursor=pointer]:
                - option "AED"
                - option "BHD"
                - option "KWD" [selected]
                - option "OMR"
                - option "QAR"
                - option "SAR"
            - paragraph [ref=f1e75]: You can change the currency until the first sale. After that it is locked.
          - button "Save" [ref=f1e77] [cursor=pointer]
  - generic:
    - status
    - alert
```

# Test source

```ts
  1   | import type { APIRequestContext, Page } from "@playwright/test";
  2   | import { functionUrl } from "@repo/api";
  3   | import type { SaleCreateInput } from "@repo/validation";
  4   | import { accessToken, admin, ANON_KEY, API, insert, kuwait, REST, SETUP_TENANT } from "./bookingFixtures";
  5   | import { expect, PASSWORD, signIn } from "./fixtures";
  6   | import type { Strings } from "./strings";
  7   | 
  8   | // Phase 6 checkout fixtures. Money only moves through the checkout function
  9   | // as a real login (ADR-28); the service key reads results back and sets up
  10  | // branch config, never sales, payments or register rows. The en and ar
  11  | // projects check out at different Setup Studio branches (Hawally, Jahra) so
  12  | // they never share a register; register-day and refund/void journeys get a
  13  | // tenant of their own from `freshShop`.
  14  | 
  15  | type Envelope<T> = { data: T } | { error: { code: string; message: string; details?: Record<string, unknown> } };
  16  | 
  17  | async function post(request: APIRequestContext, actor: string, route: string, data: unknown) {
  18  |   return request.post(functionUrl(API, "checkout", route), {
  19  |     headers: {
  20  |       apikey: ANON_KEY,
  21  |       authorization: `Bearer ${await accessToken(request, actor)}`,
  22  |       "idempotency-key": crypto.randomUUID(),
  23  |     },
  24  |     data,
  25  |   });
  26  | }
  27  | 
  28  | async function attempt<T>(request: APIRequestContext, actor: string, route: string, data: unknown) {
  29  |   const response = await post(request, actor, route, data);
  30  |   return { status: response.status(), body: (await response.json()) as Envelope<T> };
  31  | }
  32  | 
  33  | const detailOf = (body: Envelope<unknown>, key: string) => ("error" in body ? body.error.details?.[key] : undefined);
  34  | const reasonOf = (body: Envelope<unknown>) => detailOf(body, "reason");
  35  | 
  36  | /** Turns tips on at a branch (Setup Studio branches start with them off). */
  37  | export async function enableTips(request: APIRequestContext, branchId: string, presets = [10, 15, 20]): Promise<void> {
  38  |   const response = await request.patch(`${REST}/branches?id=eq.${branchId}`, {
  39  |     headers: admin,
  40  |     data: { tips_enabled: true, tip_presets_percent: presets },
  41  |   });
  42  |   expect(response.ok(), await response.text()).toBe(true);
  43  | }
  44  | 
  45  | /** The branch's open register session, opening one as `actor` when there is none. */
  46  | export async function ensureRegisterOpen(
  47  |   request: APIRequestContext,
  48  |   actor: string,
  49  |   branchId: string,
  50  |   opts: { tenantId?: string; openingCashMinor?: number } = {},
  51  | ): Promise<string> {
  52  |   const { status, body } = await attempt<{ id: string }>(request, actor, "register-open", {
  53  |     tenant_id: opts.tenantId ?? SETUP_TENANT,
  54  |     branch_id: branchId,
  55  |     opening_cash_minor: opts.openingCashMinor ?? 0,
  56  |   });
  57  |   if (status === 201 && "data" in body) return body.data.id;
> 58  |   expect(reasonOf(body), JSON.stringify(body)).toBe("register_already_open");
      |                                                ^ Error: {"ok":false,"error":{"code":"UNAUTHENTICATED","message":"Invalid or expired session"}}
  59  |   return String(detailOf(body, "session_id"));
  60  | }
  61  | 
  62  | /**
  63  |  * Closes a session as `actor` (an owner or manager). The function wants the
  64  |  * expected cash the closer saw; a first call with none learns it from the
  65  |  * register_changed refusal. Counted defaults to expected: no difference.
  66  |  */
  67  | export async function closeRegister(
  68  |   request: APIRequestContext,
  69  |   actor: string,
  70  |   sessionId: string,
  71  |   opts: { tenantId?: string; countedCashMinor?: number } = {},
  72  | ): Promise<void> {
  73  |   const close = (expected: number) =>
  74  |     attempt(request, actor, "register-close", {
  75  |       tenant_id: opts.tenantId ?? SETUP_TENANT,
  76  |       session_id: sessionId,
  77  |       counted_cash_minor: opts.countedCashMinor ?? Math.max(expected, 0),
  78  |       expected_cash_minor: expected,
  79  |     });
  80  |   const first = await close(-1);
  81  |   if (first.status === 200) return;
  82  |   expect(reasonOf(first.body), JSON.stringify(first.body)).toBe("register_changed");
  83  |   const expected = Number(detailOf(first.body, "expected_cash_minor"));
  84  |   const second = await close(expected);
  85  |   expect(second.status, JSON.stringify(second.body)).toBe(200);
  86  | }
  87  | 
  88  | /** POST /checkout/register-close as `actor`, whatever the answer. */
  89  | export function attemptCloseRegister(
  90  |   request: APIRequestContext,
  91  |   actor: string,
  92  |   input: { tenantId: string; sessionId: string; countedCashMinor: number; expectedCashMinor: number },
  93  | ) {
  94  |   return attempt(request, actor, "register-close", {
  95  |     tenant_id: input.tenantId,
  96  |     session_id: input.sessionId,
  97  |     counted_cash_minor: input.countedCashMinor,
  98  |     expected_cash_minor: input.expectedCashMinor,
  99  |   });
  100 | }
  101 | 
  102 | /** Closes every session left open at Setup Studio (an interrupted run), counted = expected, as the owner. */
  103 | export async function closeLeftoverRegisters(request: APIRequestContext): Promise<number> {
  104 |   const open = await request.get(`${REST}/register_sessions?tenant_id=eq.${SETUP_TENANT}&closed_at=is.null&select=id`, { headers: admin });
  105 |   expect(open.ok(), await open.text()).toBe(true);
  106 |   const sessions = (await open.json()) as { id: string }[];
  107 |   for (const session of sessions) await closeRegister(request, "setup-owner@spacorner.test", session.id);
  108 |   return sessions.length;
  109 | }
  110 | 
  111 | export type CreatedSale = { id: string; invoice_number: string; status: string };
  112 | 
  113 | /** POST /checkout/create-sale as `actor`; the caller sends the expected totals it computed. */
  114 | export async function createSale(request: APIRequestContext, actor: string, input: SaleCreateInput): Promise<CreatedSale> {
  115 |   const { status, body } = await attempt<CreatedSale>(request, actor, "create-sale", input);
  116 |   expect(status, JSON.stringify(body)).toBe(201);
  117 |   return (body as { data: CreatedSale }).data;
  118 | }
  119 | 
  120 | /** POST /checkout/create-sale as `actor`, whatever the answer. */
  121 | export function attemptSale(request: APIRequestContext, actor: string, input: SaleCreateInput) {
  122 |   return attempt<CreatedSale>(request, actor, "create-sale", input);
  123 | }
  124 | 
  125 | /** A walk-in sale of one custom item at `shop` (its default tax rate is zero-rated, so total = price). */
  126 | export function walkInSale(shop: Shop, priceMinor: number, payments: SaleCreateInput["payments"]): SaleCreateInput {
  127 |   return {
  128 |     tenant_id: shop.tenantId,
  129 |     branch_id: shop.branchId,
  130 |     lines: [{ type: "manual_item", name_en: `Gift voucher ${shop.id}`, unit_price_minor: priceMinor }],
  131 |     tips: [],
  132 |     payments,
  133 |     expected: { total_minor: priceMinor, tip_minor: 0, grand_total_minor: priceMinor },
  134 |   };
  135 | }
  136 | 
  137 | export type StoredRegisterSession = {
  138 |   id: string;
  139 |   closed_at: string | null;
  140 |   opening_cash_minor: number;
  141 |   expected_cash_minor: number | null;
  142 |   counted_cash_minor: number | null;
  143 |   difference_minor: number | null;
  144 |   close_note: string | null;
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
```