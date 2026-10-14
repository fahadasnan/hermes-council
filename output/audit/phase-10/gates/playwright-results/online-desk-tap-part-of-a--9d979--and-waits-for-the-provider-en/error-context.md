# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: online-desk.spec.ts >> tap: part of a payment taken by link is refunded from the sale, and waits for the provider
- Location: e2e/online-desk.spec.ts:81:3

# Error details

```
Error: {"ok":false,"error":{"code":"INTERNAL","message":"PAYMENT_CREDENTIALS_KEY is not configured"}}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1   | import type { APIRequestContext } from "@playwright/test";
  2   | import { functionUrl } from "@repo/api";
  3   | import { accessToken, admin, ANON_KEY, API, REST } from "./bookingFixtures";
  4   | import type { Shop } from "./checkoutFixtures";
  5   | import { expect } from "./fixtures";
  6   | 
  7   | // Online money at the desk (Epic 10.8) against the fixture-replay server, as
  8   | // in apps/booking/e2e/payments.ts: the shop links its own provider with
  9   | // fabricated sandbox keys, and the edge runtime's provider calls go to the
  10  | // replay server (PAYMENTS_FAKE_ROUTING), so no test reaches MyFatoorah or Tap.
  11  | // Each shop's scenario is keyed by its API key's last four characters. The
  12  | // scenarios follow the documented shapes in
  13  | // supabase/functions/_shared/payments/fixtures/<provider>/.
  14  | 
  15  | const REPLAY = "http://127.0.0.1:54399";
  16  | 
  17  | export const PROVIDERS = ["myfatoorah", "tap"] as const;
  18  | export type Provider = (typeof PROVIDERS)[number];
  19  | 
  20  | export type OnlineShop = Shop & { provider: Provider; key: string };
  21  | 
  22  | type Exchange = {
  23  |   provider: Provider;
  24  |   request: { method: string; path: string; capture?: Record<string, string> };
  25  |   response: { status: number; body: unknown };
  26  |   repeat?: boolean;
  27  | };
  28  | 
  29  | const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
  30  | const scenarioKey = () => Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
  31  | 
  32  | async function serviceRpc<T>(request: APIRequestContext, fn: string, args: Record<string, unknown>): Promise<T> {
  33  |   const response = await request.post(`${REST}/rpc/${fn}`, {
  34  |     headers: admin,
  35  |     data: args,
  36  |   });
  37  |   expect(response.ok(), await response.text()).toBe(true);
  38  |   return (await response.json()) as T;
  39  | }
  40  | 
  41  | async function asOwner(request: APIRequestContext, shop: Shop) {
  42  |   return {
  43  |     apikey: ANON_KEY,
  44  |     authorization: `Bearer ${await accessToken(request, shop.owner)}`,
  45  |   };
  46  | }
  47  | 
  48  | /**
  49  |  * The owner links `provider` with fabricated sandbox keys (sealed by the
  50  |  * payments function, as from Settings); the connection is marked tested and
  51  |  * active as the testkit does, and the branch takes KNET and card online
  52  |  * through it, with `patch` added to its online payment settings. By default
  53  |  * the account refunds cards and KNET by API.
  54  |  */
  55  | export async function connectProvider(
  56  |   request: APIRequestContext,
  57  |   shop: Shop,
  58  |   provider: Provider,
  59  |   patch: Record<string, unknown> = {},
  60  |   capabilities: string[] = ["knet", "cards", "refunds_api", "knet_refunds_api"],
  61  | ): Promise<OnlineShop> {
  62  |   const key = scenarioKey();
  63  |   const headers = await asOwner(request, shop);
  64  |   const myfatoorah = provider === "myfatoorah";
  65  |   const saved = await request.post(functionUrl(API, "payments", "connection-save"), {
  66  |     headers,
  67  |     data: {
  68  |       tenant_id: shop.tenantId,
  69  |       provider,
  70  |       mode: "sandbox",
  71  |       account_country: myfatoorah ? "KW" : null,
  72  |       secret_key: myfatoorah ? `SK_KWT_fabricated-${key}` : `sk_test_e2e${key}`,
  73  |       webhook_secret: myfatoorah ? `fabricated-webhook-${key}` : null,
  74  |     },
  75  |   });
> 76  |   expect(saved.ok(), await saved.text()).toBe(true);
      |                                          ^ Error: {"ok":false,"error":{"code":"INTERNAL","message":"PAYMENT_CREDENTIALS_KEY is not configured"}}
  77  | 
  78  |   const owner = await request.get(`${REST}/memberships?tenant_id=eq.${shop.tenantId}&role=eq.tenant_owner&select=user_id`, {
  79  |     headers: admin,
  80  |   });
  81  |   const [ownerRow] = (await owner.json()) as { user_id: string }[];
  82  |   const scope = {
  83  |     p_actor: ownerRow!.user_id,
  84  |     p_tenant_id: shop.tenantId,
  85  |     p_provider: provider,
  86  |   };
  87  |   const { credentials_revision } = await serviceRpc<{
  88  |     credentials_revision: number;
  89  |   }>(request, "load_provider_connection", {
  90  |     p_tenant_id: shop.tenantId,
  91  |     p_provider: provider,
  92  |   });
  93  |   await serviceRpc(request, "record_provider_connection_test", {
  94  |     ...scope,
  95  |     p_revision: credentials_revision,
  96  |     p_result: "ok",
  97  |   });
  98  |   await serviceRpc(request, "update_provider_connection_checklist", {
  99  |     ...scope,
  100 |     p_steps: {},
  101 |     p_capabilities: capabilities,
  102 |   });
  103 |   await serviceRpc(request, "set_provider_connection_status", {
  104 |     ...scope,
  105 |     p_status: "active",
  106 |   });
  107 | 
  108 |   const settings = await request.post(`${REST}/rpc/update_branch_online_payment_settings`, {
  109 |     headers,
  110 |     data: {
  111 |       p_branch_id: shop.branchId,
  112 |       p_patch: { knet_provider: provider, card_provider: provider, ...patch },
  113 |     },
  114 |   });
  115 |   expect(settings.ok(), await settings.text()).toBe(true);
  116 |   return { ...shop, provider, key };
  117 | }
  118 | 
  119 | let sequence = 0;
  120 | 
  121 | /** One KNET charge the provider reports paid. */
  122 | function knetPaid(shop: OnlineShop): Exchange[] {
  123 |   if (shop.provider === "tap") {
  124 |     const id = `chg_TS05A10e2e${shop.key}${String(++sequence).padStart(6, "0")}`;
  125 |     const charge = (status: string) => ({
  126 |       id,
  127 |       object: "charge",
  128 |       live_mode: false,
  129 |       status,
  130 |       amount: "{{amount}}",
  131 |       currency: "KWD",
  132 |       metadata: { glowdesk_intent: "{{intent_id}}" },
  133 |       reference: { transaction: "{{intent_id}}", order: "{{intent_id}}" },
  134 |       source: { object: "source", id: "src_kw.knet" },
  135 |     });
  136 |     return [
  137 |       {
  138 |         provider: "tap",
  139 |         request: {
  140 |           method: "POST",
  141 |           path: "/v2/charges",
  142 |           capture: { intent_id: "/reference/transaction", amount: "/amount" },
  143 |         },
  144 |         response: {
  145 |           status: 200,
  146 |           body: {
  147 |             ...charge("INITIATED"),
  148 |             transaction: {
  149 |               amount: "{{amount}}",
  150 |               currency: "KWD",
  151 |               url: `${REPLAY}/__replay/hosted/tap/${shop.key}`,
  152 |             },
  153 |           },
  154 |         },
  155 |       },
  156 |       {
  157 |         provider: "tap",
  158 |         request: { method: "GET", path: `/v2/charges/${id}` },
  159 |         response: { status: 200, body: charge("CAPTURED") },
  160 |         repeat: true,
  161 |       },
  162 |       {
  163 |         provider: "tap",
  164 |         request: { method: "POST", path: "/v2/charges/list" },
  165 |         response: { status: 200, body: { object: "list", has_more: false, charges: [charge("CAPTURED")] } },
  166 |         repeat: true,
  167 |       },
  168 |     ];
  169 |   }
  170 |   const invoice = String(6_400_000 + Math.floor(Math.random() * 500_000) + ++sequence);
  171 |   const paymentId = `0707${invoice}0000${String(sequence).padStart(4, "0")}`;
  172 |   const ok = { IsSuccess: true, Message: "", ValidationErrors: null };
  173 |   return [
  174 |     {
  175 |       provider: "myfatoorah",
  176 |       request: {
```