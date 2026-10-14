# Phase 10 Plan Conformance Audit

Auditor: kanban task t_7a9efeba
Date: 2026-10-14
Repository: /Users/fahad/GlowDesk (branch main, HEAD 22475a43acdfcc9683eb8e90d4709e59633a5363)
Gates reference: /Users/fahad/council/output/audit/phase-10/gates/GATES.md
Briefs: common.md + conformance.md (phase-10)

---

## 1. Spec extraction

Phase 10 has **no `#### Subphase 10.x` headings** in any plan file. Its structure is one
phase-level section (`### Phase 10: Online payments & deposits`) whose **Backlog** is
organized into **9 epics (10.1-10.9)**. Count: 0 formal subphases; 9 epics; the audit is
organized by epic plus the phase-level sections (header, database work, edge functions,
screens, acceptance criteria, test plan, exit criteria).

Cross-check of the three plan files (the phase text claims "the same text appears in
`IMPLEMENTATION_PLAN.md`, `parts/11-delivery-plan.md` and `PLAN.md`; only the heading
line differs"):
- `plan/parts/11-delivery-plan.md` lines 1765-2016.
- `plan/PLAN.md` lines 3943-4195.
- `plan/IMPLEMENTATION_PLAN.md` lines 651-900.
- Verified: extracted ranges are byte-identical except the heading line (`### Phase 10:
  Online payments & deposits` vs `## Phase 10: Online payments & deposits (18 ew)`)
  and a trailing blank/`---`. **The claim holds; no precedence conflict.**

Implementation history: 10.1-T1 .. 10.9-T7 on stacked branches
(`fn/payments-contract` → `db/payments` → `fn/payments` → `feat/payments-settings` →
`db/payments-ledger` → `fn/payments-runtime` → `fn/payments-adapters` →
`fn/payments-myfatoorah` / `fn/payments-tap` → `feat/payments-booking` →
`feat/payments-desk` → `feat/payments-hardening`), merged in `9bbdd7e` ("Merge Phase 10:
online payments on each tenant's MyFatoorah and Tap"), finalized by `22475a4`
("fix(ci): install Deno for payment E2E and raise the short booking-load ceiling").
All 24 phase-10 migrations (20261018100000..20261025100000) are present and applied
(db:reset applies 93 migrations).

**Gate re-verification (I re-ran the four FAIL gates; the common brief permits
`supabase test db` and read-only psql; the repository was not modified):**

| Gate | GATES.md result | My re-run | Verdict |
|---|---|---|---|
| 3 db:test | FAIL (harness crash) | PASS — 78 files, 3,167 tests, "All tests successful." Result: PASS | Environmental at gate time; full suite green now |
| 5 type drift | FAIL (generated empty) | PASS — regenerated `database.types.ts` is byte-identical to committed (raw diff 0 lines; normalized diff 0 lines) | No drift on current state |
| 6 fn:test | FAIL (14 suites) | PASS — 14/14 suites, 0 failed (repro log: "Deno suites: 14 passed, 0 failed") | Environmental at gate time |
| 8 Playwright | FAIL (225/240) | Not run (brief forbids) | 14 payment failures all `PAYMENT_CREDENTIALS_KEY is not configured` — local runtime env gap, documented in `.env.example`; team evidence shows the same specs passing |

The gates' written root-cause for db:test ("`public.online_verifications` does not exist
in the current schema") is **incorrect** — the table exists
(`supabase/migrations/20261017100400_online_booking_rpcs.sql:29`; live probe:
`to_regclass('public.online_verifications')` returns the relation). The gate run caught
the local database in a migrated-away state (the same run's smoke test saw only the
default extension set), which did not reproduce after the final db:reset.

---

## 2. Checklist by epic

Evidence conventions: `migration <file>` = supabase/migrations; `pgTAP <nn>` =
supabase/tests/<nn>_*.test.sql; "evidence 10.<n>" = plan/evidence/10.<n>/; all suites
re-run and passing by me on 2026-10-14 unless marked NOT VERIFIABLE LOCALLY.

### Epic 10.1 Discovery and the shared provider contract, both providers (1.5 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| Provider facts register `docs/payments/provider-facts.md`, one official URL + fetch date per fact, unverified stays unverified, no fee/approval-rate/settlement numbers | Backlog [Ops] | DONE | docs/payments/provider-facts.md: 22 MyFatoorah rows + 19 Tap rows, all fetched 2026-10-11..13, one URL per fact, "unverified" rows explicit (e.g. KNET refund by API, transaction listing MyFatoorah), "No fees, approval rates or settlement times" rule at line 13; closes F-DB-12 |
| Resolve unverified/conflicting items; apply narrowings; chair ruling recorded | Backlog [Ops] | DONE | provider-facts.md "Resolutions and narrowings applied" table (KNET authorize, KNET card-on-file, refund idempotency, reconciliation source, etc.); chair ruling "no MyFatoorah card on file" 2026-10-11 (provider-facts.md:118-129); unresolved items tracked as "Questions for the providers" |
| `_shared/payments/contract.ts` + `money.ts`, golden conversion tests (KWD 3 decimals, 2-decimal currencies) | Backlog [Edge Function] | DONE | supabase/functions/_shared/payments/contract.ts + money.ts; money_test.ts incl. golden table; evidence 10.1/02-money-goldens.json (19 golden rows over 6 currencies); `_shared` suite passes (fn:test re-run) |
| Merchant onboarding kit, connection checklist content en+ar; SpaCorner starts both KYC tracks | Backlog [Ops] | DONE (kit) / tracked (KYC) | docs/payments/merchant-onboarding.md: 11 step keys with en+ar text; provider onboarding table in plan/evidence/phase-10-progress.md tracks SpaCorner KYC (not yet started — owner Ops item, NOT VERIFIABLE LOCALLY) |
| Sandbox accounts at both providers; fixture recording and scrubbing procedure | Backlog [Ops] | DONE (procedure) / tracked (accounts) | docs/payments/fixtures.md (sandbox accounts, fixture layout, recording steps, scrubbing, re-signing with fixed test secrets); _shared/payments/fixtures/scrub.ts + scrub_test.ts (7); sandbox accounts "to open" — owner Ops item |
| Threat-model addendum: webhook forgery, cross-tenant, credential exposure, redirect tampering, replay | Backlog [Ops] | DONE | docs/security/public-booking-threat-model.md "Phase 10 addendum: online payments" threats 16-27 with controls and per-threat test links; payments launch gate (3/8 items ticked locally, 5 hosted-only) |

**10.1 verdict: DONE** (remaining items are provider-external and tracked).

### Epic 10.2 Provider connections (2 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| Migration: `payment_provider_connections`, `payment_provider_credentials` (deny-all), `branch_online_payment_settings`; RPCs `save_provider_connection`, `set_provider_connection_status`, `update_branch_online_payment_settings` | Backlog [DB] | DONE | migration 20261018100000_payment_connections.sql:45-83 (connections: status draft→testing→active⇄suspended→disconnected, capabilities CHECK, one per tenant+provider), 85-99 (credentials: ciphertext, nonce, key version, hints), 101-120 (branch settings); revoke all on credentials from anon/authenticated/**service_role** (lines 214-217); pgTAP 059 (82, passing) |
| pgTAP: owner-only connections, credentials denied to every API role, branch enablement only from same-tenant active connections | Backlog [DB] | DONE | pgTAP 059_payment_connections (82 assertions, passing in re-run); matrix sweep 045 includes the relations |
| `_shared/payments/crypto.ts` AES-256-GCM, key version, rotation helper; connection loader (decrypt in memory only; log scrubbing) | Backlog [Edge Function] | DONE | _shared/payments/crypto.ts (keyring `version:base64`, AES-256-GCM with connection id+mode as associated data, timingSafeEqual at :184); connections.ts (loadStoredConnection/unsealConnection); logging.ts redacts sk_live_/sk_test_/SK_XXX_/bearer tokens; crypto_test.ts (7), connections_test.ts (3); pgTAP via fn:test pass |
| `payments` function: config, ADR-27 list, owner connection routes, `connection-test` against sandbox | Backlog [Edge Function] | DONE | supabase/functions/payments/ (routes.ts: connections, connection-save, connection-test, connection-activate, connection-disconnect, checklist-update, intent-status, x-sweep, reconciliation-run, x-reconcile, x-ops-alerts, ops-status); config.toml [functions.payments] verify_jwt=false; monitors.json:72-80 (payments, payments-ops); ADR-27 decisions.md:482 names payments |
| Settings → Online payments: provider cards, checklist, write-only credentials, test, go-live, disconnect (owner; en and ar) | Backlog [Frontend] | DONE | apps/back-office/src/features/payments/routes.tsx (/settings/online-payments + /reconciliation); components incl. write-only keys form; e2e/online-payments.spec.ts (en+ar); evidence 10.2/03-frontend-tests.txt + screens/ (24) |
| Branch editor → Online payments tab (owner or branch manager) | Backlog [Frontend] | DONE | apps/back-office/src/features/settings/components/BranchPaymentsTab.tsx; settings/routes.tsx:88 (online-payments tab); e2e/branch-online-payments.spec.ts (en+ar) |
| `PAYMENT_CREDENTIALS_KEY` + `PAYMENTS_WEBHOOK_URL` in runbooks and `.env.example`; key rotation runbook | Backlog [Ops] | DONE | supabase/functions/.env.example:83-102 (both keys + PAYMENTS_FAKE_ROUTING, documented local placeholder, "local stack only"); docs/runbooks/payment-credentials-key-rotation.md; staging-deploy.md:51-64; production-project.md:39; payments-cutover.md:13 |

**10.2 verdict: DONE**

### Epic 10.3 Ledger extensions, intents, holds, saved cards, fee sales, reports (2 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| Migration: `payments` online columns and checks; nullable `sale_id` for deposits, `created_by` for gateway rows | Backlog [DB] | DONE | migration 20261019100100_payments_online_ledger.sql:19-44 (method check gains knet_online/card_online; provider, payment_intent_id composite FK, gateway_reference unique per provider, appointment_id composite FK; payments_unlinked_deposit; payments_actor) |
| Narrowed immutability guard (prepayment link only, `PREPAYMENT_LINKED` audit) and refund guard (unlinked deposits by appointment; pending refund intents in cap) | Backlog [DB] | DONE | same migration:254-296 `payments_guard_update` (only sale_id null→live sale of own appointment, else `money_rows_are_immutable`/`prepayment_link_mismatch`; PREPAYMENT_LINKED audit row:281-286); pgTAP 061 (40 assertions incl. 3.500+6.500 of 10.000 and a third refused) |
| Migration: `payment_intents`, `payment_webhook_events`, `slot_holds` (exclusion constraint; holds busy in `booking_check_conflicts`, `booking_slots_internal`, `online_available_slots`), `client_saved_cards`, `client_saved_card_refs` | Backlog [DB] | DONE | migration 20261019100000_payment_intents_holds_cards.sql:33-61 slot_holds with EXCLUDE USING gist (staff_id, busy_range) WHERE active (line 60); 20261019100200_slot_holds_busy.sql (holds busy in booking_check_conflicts `slot_held_conflict`, desk+online slots); pgTAP 062 (17); 060 (38); webhook events and saved-card refs deny-all |
| `sale_items` `fee`+`fee_kind`; `create_sale` links deposits and refuses `deposit_exceeds_total`; `create_fee_sale`; `refund_payment` with amount; `void_sale` refuses online payments | Backlog [DB] | DONE | migration 20261019100300_deposits_fees_partial_refunds.sql (deposit_exceeds_total at :440; fee sale at :705; refund_payment p_amount_minor; void_sale sale_has_online_payments); pgTAP 063 (59) |
| Reports: online methods in payments/daily summaries; multi-rate ADR-51 step 7 on read in `report_taxes_summary` + golden fixtures shared with packages/core; `report_deposits_held` | Backlog [DB] | DONE | migration 20261019100400_reports_online_payments.sql (report_taxes_summary redefined per rate key; report_deposits_held at :503); packages/core/src/refunds.ts + refunds.fixtures.ts (R01-R06 goldens); checkout/refund_tax_parity_test.ts; pgTAP 064 (28) |
| pgTAP: matrix, one-way link, cap with pending refunds, holds vs desk bookings, fee sales, report reconciliation with online rows | Backlog [DB] | DONE | pgTAP 060-064, all passing in re-run (3,167 total) |

**10.3 verdict: DONE**

### Epic 10.4 Payment runtime (1.5 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| `payment_finalize`: idempotent by gateway reference; hold conversion; late success; amount/currency check; ledger rows on capture and confirmed refunds | Backlog [DB] | DONE | migration 20261020100100_payment_finalize.sql (:189-193 amount/currency mismatch → anomaly, nothing written; payment_next_charge_status/refund_status at :200-201; booking_create_internal booked_via='online' at :59); pgTAP 066 (47) |
| pg_cron jobs: hold and intent expiry, capture sweep, webhook event purge | Backlog [DB] | DONE | migration 20261020100200_payment_jobs.sql:197-200 (expire-payment-intents '* * * * *', payment-sweep '* * * * *', purge-payment-webhook-events '5 4 * * *'); pgTAP 067 (16) |
| `webhooks` `POST /payments`: provider detection, intent match, tenant credentials, signature verification, event store, re-query, finalize | Backlog [Edge Function] | DONE | supabase/functions/webhooks/payments.ts (64 KB body cap; 400/403/503 mapping); routes.ts:16 POST /payments auth:none; webhooks/payments_test.ts (4); forgery_test.ts (4 cases both providers) |
| Shared verify/re-query/finalize path used by `online-booking/pay-status` and the payment-link return | Backlog [Edge Function] | DONE | _shared/payments/runtime.ts (`settleIntent`, `handleWebhook`, `performAction`); used by online-booking/pay-status (payment.ts) and checkout refund/fee routes |
| Shared contract suite: every operation; valid/invalid/wrong-tenant signatures; duplicate events; status mapping; money conversion | Backlog [Edge Function] | DONE | _shared/payments/contract_suite.ts + fixtures/reference_adapter.ts; myfatoorah/contract_test.ts (17 cases) + tap/contract_test.ts (16 cases); contract_suite tests pass under fn:test |
| Local fixture-replay server + `PAYMENTS_FAKE_ROUTING` (local stack only) | Backlog [Edge Function] | DONE | _shared/payments/fixtures/replay.ts; fake_routing.ts (:31-32 refuses non-local SUPABASE_URL, local base check); .env.example:96-102; apps/back-office/playwright.config.ts:35-36 starts it as a webServer |

**10.4 verdict: DONE**

### Epic 10.5 MyFatoorah adapter and sandbox suite (2 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| `_shared/payments/myfatoorah/`: create intent (KNET, CARD; `IntegrationUrls.Webhook`; our intent id echoed), redirect, status query, Webhook V2 verification, capture/release (one per invoice), refund and partial refund (async review pending), token charge where approved | Backlog [Edge Function] | DONE (token charge intentionally absent by chair ruling) | myfatoorah/adapter.ts (ExternalIdentifier echo :265; IntegrationUrls.Webhook :273; KNET immediately captured; one capture/release per invoice; refunds by MakeRefund; `canSaveCard` false → no chargeSavedCard, per chair ruling 2026-10-11, provider-facts.md:103/115); myfatoorah/contract_test.ts (17 cases, 5 refusals, 8 signed events) |
| Contract suite green on MyFatoorah fixtures + own cases (refund status events, duplicate events, one-capture rule) | Backlog [Edge Function] | DONE | fixtures/myfatoorah/ (17 scenarios); suite passes in fn:test re-run (`_shared` 235+ tests) |
| Live sandbox run of every path; fixtures recorded and scrubbed; capabilities filled | Backlog [Ops] | NOT VERIFIABLE LOCALLY | Declared open: phase-10-progress.md Provider onboarding row "Sandbox run of the adapter … not run (10.5 shipped on documented shapes)"; fixtures are transcribed documented shapes, scrubbed; requires provider test account + owner go-ahead |
| SpaCorner's MyFatoorah KYC and feature approvals tracked in its connection checklist | Backlog [Ops] | tracked / NOT VERIFIABLE LOCALLY | Onboarding table (progress file): "not started"; the in-app checklist (merchant-onboarding.md keys) will track it |

**10.5 verdict: DONE locally; sandbox-run acceptance criterion pending (external), see exit criteria.**

### Epic 10.6 Tap adapter and sandbox suite (2 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| `_shared/payments/tap/`: charges (`src_kw.knet`, `src_card`/`src_all`, `post.url`, `reference.idempotent`, intent id echoed), redirect, retrieve, `hashstring` verification, authorize→capture through Charges (credit cards; KNET as 10.1 ruled), refunds with idempotent reference, saved-card charge (`customer_initiated:false` + payment agreement) | Backlog [Edge Function] | DONE | tap/adapter.ts (post.url :228/307/338; idempotent capture `capture-<auth id>`; KNET KWD-only; hashstring.ts constant-time; saved-card via one-use token + customer_initiated:false); tap/contract_test.ts (16 cases, 5 refusals, 5 signed events); evidence 10.6/02-function-tests.txt (56 tests) |
| Contract suite green on Tap fixtures + own cases (authorization expiry, KNET KWD-only, amount decimals) | Backlog [Edge Function] | DONE | fixtures/tap/ (17 scenarios); suite passes under fn:test re-run |
| Live sandbox run; fixtures recorded and scrubbed; capabilities filled | Backlog [Ops] | NOT VERIFIABLE LOCALLY | Same as 10.5: progress file "not run (10.6 shipped on documented shapes)"; hashstring formula documented but examples unreproducible → sandbox run mandatory before live (provider-facts.md:110) |
| SpaCorner's Tap KYC and saved-card enablement tracked | Backlog [Ops] | tracked / NOT VERIFIABLE LOCALLY | Provider onboarding table (progress file); saved-card enablement "not requested" (owner Ops) |

**10.6 verdict: DONE locally; sandbox-run acceptance criterion pending (external).**

### Epic 10.7 Payment at booking (2.5 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| `online-booking/pay-start` and `pay-status`; deposit computed half-up per ADR-51; hold and intent created together | Backlog [Edge Function] | DONE | routes.ts:30-31 (pay-start, pay-status), online-booking/payment.ts; migration 20261020100000 `online_pay_start` (hold under staff lock, charge intent, half-up percent, per-client hold limit); pgTAP 065 (42); start_charge_test.ts (9), payment_test.ts (8) |
| Card on file: consent recorded with the intent; saved card stored on confirmation; revocation | Backlog [Edge Function] | DONE | migration 20261022100000_online_payment_booking.sql (`payment_saved_card_store`, `online_saved_card_revoke`, consent bound to intent); sealed AES-GCM (crypto.ts sealSavedCard); revoked from manage link; pgTAP 070 (50) |
| Confirmation shows the deposit; en and ar templates | Backlog [Edge Function] | DONE | migration 20261022100100_online_payment_confirmation.sql (language kept in draft; booking_confirmation v2 en/ar with BOOKING_PAYMENT_LABELS); compose_test.ts + snapshots; check-templates.ts passes |
| Booking app payment step, provider redirect, result page and manage-page deposit; reserved `/p/` and `/l/` routes | Backlog [Frontend] | DONE | apps/booking/src/features/booking/routes.tsx:83-109 (m/, u/, p/, l/ lazy routes); components: PaymentChoice.tsx, PayResultPage.tsx, PayLinkPage.tsx, ManagePage (deposit + saved cards + revoke); ReviewStep shows amount due; 51 new strings en+ar |
| Playwright en and ar: deposit, full, failed and expired on each provider through fixture replay; axe and CSP checks | Backlog [Frontend] | DONE | apps/booking/e2e/pay.spec.ts (24, en-mobile/ar-mobile/en-desktop); evidence 10.7/04-playwright.txt (rented booking run passed); CSP asserted per page (shell.spec.ts); fixture replay via PAYMENTS_FAKE_ROUTING |

**10.7 verdict: DONE**

### Epic 10.8 Desk: payment links, partial refunds, fees (2.5 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| `checkout/pay-link` (balance or fee remainder; email; QR) | Backlog [Edge Function] | DONE | checkout/routes.ts:28-29 (pay-link, pay-link-cancel); online.ts handlePayLink; migration 20261023100000 `create_payment_link`/`cancel_payment_link`/`online_pay_link_view`/`online_pay_link_start`; link page `/l/` (a9b53bc); QR + copy dialog (PayLinkDialog.tsx) |
| `checkout/refund` with amount (online: refund intent; manual: immediate row) | Backlog [Edge Function] | DONE | checkout/routes.ts:25-26 (refund with amount_minor, refund-confirm owner-only); online.ts handleRefund → refundNow (refunded/pending/manual/queued/unknown/failed); runthrough claims before send (payment_refund_claim) |
| `checkout/fee` (owner or manager): fee sale, deposit first, then saved card, else payment link | Backlog [Edge Function] | DONE | checkout/routes.ts:30-31 (fee, fee-charge); online.ts collectFee (deposit → saved card via chargeSavedCard → link); create_fee_sale RPC (owner/manager of branch); pgTAP 063, 071 |
| Templates: payment link, fee charged, refund issued (en and ar) | Backlog [Edge Function] | DONE | _shared/templates/index.ts:424/469/508 (payment_link, fee_charged, refund_issued v1) with en+ar; templates_snapshot_test.ts; Mailpit checks |
| Checkout deposit line and "Send payment link"; refund dialog with amount, reallocation preview and pending state | Backlog [Frontend] | DONE | AppointmentPayments.tsx (:67 "Deposit paid online"); SaleDrawer.tsx (:337 "Send payment link"); PayLinkDialog.tsx; RefundDialog with ADR-51 tax preview; online-desk.spec.ts (10, en+ar) + evidence 10.8/04-playwright.txt |
| Appointment drawer deposit and fee actions; payments list, sale detail, daily summary and the deposits-held report | Backlog [Frontend] | DONE | checkout AppointmentPayments (fee actions :145); FeeDialog.tsx; reports/routes.tsx:70 (/reports/deposits); payments list with provider+reference; deposits-held report screen; e2e online-desk.spec.ts + reconciliation.spec.ts |

**10.8 verdict: DONE**

### Epic 10.9 Reconciliation, hardening, production cutover (2 ew)

| Item | Section | Status | Evidence |
|---|---|---|---|
| `payment_reconciliation_runs` + daily enqueue per connection and branch business date | Backlog [DB] | DONE | migration 20261024100000_payment_reconciliation.sql (runs status queued|running|balanced|exceptions|incomplete; no signed delta; exceptions list; enqueue cron hourly :20; pgmq ADR-33); pgTAP 072 (59) |
| `payments` reconciliation consumer: provider listing where verified (Tap), else re-query of every intent touched that day (MyFatoorah); match by gateway reference, amount, currency; exceptions | Backlog [Edge Function] | DONE | payments/reconcile.ts (x-reconcile, reconciliation-run, x-ops-alerts, ops-status); runtime.ts listTenantCharges/observeIntent; tap adapter lists charges (`POST /v2/charges/list`); reconcile_test.ts (5) |
| Reconciliation screen (owner) | Backlog [Frontend] | DONE | payments/routes.tsx:25 (/settings/online-payments/reconciliation); reconciliation.spec.ts (en+ar, both providers) passing per evidence 10.9/05-playwright.txt |
| Alerts: signature failures, unmatched events, intents stuck pending, reconciliation exceptions (Sentry + monitors.json) | Backlog [Ops] | DONE (local) / NOT VERIFIABLE LOCALLY (Sentry) | payment_ops_alerts deny-all table (10.9-T1); payments/reconcile.ts x-ops-alerts → Sentry + /ops-status; monitors.json:78-80 payments-ops; docs/runbooks/payment-alerts.md; hosted Sentry wiring is a cutover step |
| Security review: credential leakage scan, forgery + cross-tenant suite, threat-model launch gate | Backlog [Ops] | DONE | checkout/payments_leakage_test.ts (both providers, 24 responses/58 log lines/14 tables/34 fixtures scanned clean); webhooks/forgery_test.ts (4 cases both providers); plan/evidence/10.9/06-threat-tests.md covers threats 16-27; launch gate locally-ticked items verified |
| Production cutover runbook per provider; SpaCorner cutover on MyFatoorah and Tap | Backlog [Ops] | PARTIAL | docs/runbooks/payments-cutover.md complete (secrets, webhook URL HTTPS, cron jobs, monitors, per-provider test→live steps, rollback by branch mode none/Pause); **actual cutover NOT VERIFIABLE LOCALLY** and not done (KYC pending) |

**10.9 verdict: DONE locally; cutover external.**

---

## 3. ADRs

| ADR | Cited for | Honored? | Evidence |
|---|---|---|---|
| ADR-34 amendment A1 (tenant-owned merchants, one payments ledger, methods + online) | whole phase | YES | decisions.md:256-264 A1; ledger shape kept (one payments table, positive refund rows, cap trigger); method check gains knet_online/card_online (20261019100100:19-21); no wallet (no balance tables) |
| ADR-51 step 7 (refund reallocation, half-up) + order/rounding | deposits, refunds | YES | checkout_refund_tax_share/allocation (10.3-T5); packages/core refunds.ts + R01-R06 goldens; parity test vs SQL; deposit percent half-up in online_pay_start/amountDueOnline |
| ADR-10 round 2 (refunds/voids owner+manager only; receptionist forbidden) | refunds, fees | YES | checkout/scope.ts REFUND_ROLES ["tenant_owner","branch_manager"]; refund-confirm owner-only (online.ts:203 `["tenant_owner"]`); fee owner/manager (`create_fee_sale` RPC checks) |
| ADR-2 (catalogue item types) | sale_items fee | YES | sale_items.item_type gains 'fee' + fee_kind (20261019100300) |
| ADR-3 (no KNET recurring; memberships Phase 14) | fee charging, saved cards | YES | KNET payers get a link for a fee remainder (contract.ts canChargeSavedCard/canSaveCard false for knet); provider-facts.md:102 |
| ADR-18 (no wallet/balances; pass-through costs) | scope | YES | no wallet tables; tenant's own merchants; Phase 17 never reuses credentials (provider-facts.md/onboarding kit) |
| ADR-20 (RLS, composite FKs, tenant boundary in DB) | all tables | YES | composite FKs on every new table; deny-all policies on credentials/refs/webhook events/sweep marks; pgTAP 059-072 role matrices passing |
| ADR-24 layer 2 (advisory lock; busy sources) | slot holds | YES | slot_holds busy in booking_check_conflicts under booking_lock_staff (10.3-T3); exclusion constraint 20261019100000:60; pgTAP 062 |
| ADR-27 (one function per bounded context) | payments joins list | YES | decisions.md:482 updated; payments function isolated; fn:test passes 14/14 |
| ADR-31 (idempotency keys; gateway reference as key) | runtime | YES | payment_finalize idempotent by gateway_reference (unique per provider); Idempotency-Key on pay-start/link-pay/refund via standard wrapper |
| ADR-32 (shared redeploy + Deno-compatible validation) | _shared/payments | YES | config.toml functions; _shared/payments type-checked in fn:check; every importing function redeploys (documented in progress) |
| ADR-33 (pgmq for queues) | reconciliation enqueue | YES | payment_reconcile pgmq message + consumer kick (20261024100000) |
| ADR-46 round 2 (financial rows immutable) | payments guard | YES | payments_guard_update (one-way prepayment link only) replaces payments_immutable; deletes refused (20261019100100:297-299) |
| ADR-47 (rate limiter) | public payment routes | YES | pay-start/pay-status/pay-retry/pay-link/link-pay quotas (10.7-T2, 10.8-T2); rate_limit.ts |
| F-DB-12 (KNET-no-recurring re-verification) | facts | YES | provider-facts.md rows; closed in 10.1-T2 |
| F-PLAN-17 (scheduled phase binding) | whole phase | YES | binding status note + identical text in all three plan files; scheduled 2026-10-11 |

No ADR violation found.

---

## 4. Deviations

Declared (in commit messages, progress file, REVIEW.md, provider-facts.md or runbooks) — **DEVIATED-JUSTIFIED**:

1. **Live sandbox runs not performed before Epics 10.5/10.6 exit.** The acceptance criteria say "once against the live MyFatoorah/Tap sandbox before Epic 10.5/10.6 exits". Both adapters shipped on documented-shape fixtures instead; recorded in phase-10-progress.md Provider onboarding ("not run … shipped on documented shapes") and the epics' REVIEW.md (partial). Reason: sandbox accounts are an owner Ops item requiring provider test credentials and the owner's go-ahead. Justified and declared; **but it means those two acceptance criteria are not yet met** — the plan's own exit criteria require the chair to rule a split exit if provider work is pending.
2. **No MyFatoorah card on file (chair ruling 2026-10-11).** The plan's narrowing said the chair rules between a CSP exception and no card on file; the ruling was "none" and is recorded in provider-facts.md, ADR-34 A1, the onboarding kit and the launch gate. Code enforces it (CHECK on connections, no chargeSavedCard on the adapter).
3. **KNET never authorize/captures on either provider** (narrowing → immediate capture). Declared in provider-facts.md "Resolutions and narrowings applied" → `captureMode(…,"knet")` is immediate.
4. **Refund idempotency narrowed**: Tap and MyFatoorah refunds are not idempotent by documentation; refunds are never resent, timed-out refunds are re-queried. Declared as "Corrections to ADR-34 amendment A1" in provider-facts.md:81-95.
5. **`10.6-T1` runs before `10.5-T1`** — the capture-reference fix was committed while the Tap adapter branch was forming; both adapters then built on it. Epic order text is advisory; no impact found.
6. **Migration 20261022100000 edited by 10.7-T3** (b6845b4) after 10.7-T1 (ee05442) created it, adding the visitor's language to the draft. CONVENTIONS §3.2 says never edit an applied migration; the progress file records it as "edit to `20261022100000`, not yet released" — i.e. edited before the phase merged to main, within the same stacked branch chain. The final migration set passes a clean `supabase db reset` (93 migrations). Marked DEVIATED-JUSTIFIED (pre-release edit, declared, no applied-migration rewrite on main).
7. **CI booking-load ceiling raised 1 s → 1.5 s for the 30-second runner sample** (22475a4): declared in the commit; the 5-minute local run keeps NFR-4 1 s; justified as runner-contention headroom with evidence of 1,102/1,208 ms passes on a shared runner.
8. **Webhook events stored scrubbed** (payload hash + scrubbed payload) instead of the raw payload the plan implies (`payload hash and scrubbed payload` in the DB-work bullet) — matches the plan text.

Nothing found that deviates **unjustified**. No later-phase work pulled into Phase 10 except what the plan declares (saved cards / merchant-initiated charges are Phase 10's own; Phase 14 memberships merely reuse them — noted, not built).

---

## 5. Process (CONVENTIONS §8, §9)

- **Branches**: stacked branches `fn/payments-contract`, `db/payments`, `fn/payments`, `feat/payments-settings`, `db/payments-ledger`, `fn/payments-runtime`, `fn/payments-adapters`, `fn/payments-myfatoorah`, `fn/payments-tap`, `feat/payments-booking`, `feat/payments-desk`, `feat/payments-hardening` — prefixes feat/db/fn per CONVENTIONS §8 (fn is the documented Edge Function type in scope list). Merged via `9bbdd7e`. OK.
- **Commits**: task commits use `10.<epic>-T<n>: <subject>` code labels (e.g. "10.9-T2: reconciliation consumer …") rather than `type(scope): subject`; two commits do use CC ("docs(plan): …", "fix(ci): install Deno …"). Same pattern as Phase 9 (flagged minor there); **flag again as minor (F-5)**.
- **One logical change per commit**: the task-tagged commits are each one coherent task with its own check run recorded. OK.
- **No applied migration edited after merge**: the only in-phase edit (20261022100000) predates the merge; the merged migration chain is a clean set (db:reset applies all 93, db:test green). OK.
- **Generated files committed**: `packages/db/src/database.types.ts` committed and **byte-identical to a fresh `supabase gen types typescript --local`** (verified diff 0 lines). OK.
- **No secrets or local-only files committed**: only `.env.example` files are tracked (`git ls-files` shows no .env/.env.local/start-secrets); `supabase/functions/.env`, `apps/back-office/.env.local` are gitignored (verified with `git check-ignore`). Test keys are fabricated in code (`sk_test_fab…` etc., from bytes, no key literal — progress file 10.2-T2). OK.
- **Definition of done**: each task ran `scripts/phase10-check.sh` with a full check recorded in phase-10-progress.md; every task row lists tests and deviations. The repo's gates confirm: install-frozen-lockfile PASS, db:reset PASS, db:lint PASS-with-caveats (known harness-only lint notes), verify PASS (111 files / 883 vitest / 100% coverage, size budgets ok incl. booking 100.97/120 kB).

---

## 6. Docs and skills

- Skills: `.cursor/skills/` and `.claude/skills/` **identical** (`diff -rq` clean). The `supabase-edge-functions` and `react-frontend` skills gained Phase 10 notes (both copies); `spa-domain-glossary` gained the payment vocabulary (Provider connection, Payment intent, Gateway reference, Deposit, Prepayment link, Slot hold, Payment link, Saved card, Merchant-initiated charge, KNET/Card online — .cursor/skills/spa-domain-glossary/SKILL.md:52-76). Verified present in both copies.
- Glossary updated in the same work (10.2-T6/…-T8 skill notes commit per epic). OK.
- README: still describes how to run everything (db:reset/types/test, fn:test, e2e incl. booking; copy functions/.env.example); Phase 10's operational docs live in docs/runbooks (payments-cutover, payment-alerts, payment-credentials-key-rotation) and docs/payments (provider-facts, merchant-onboarding, fixtures). The README does not point at the payment screens or the fixture-replay server — minor doc gap (F-6), the commands remain accurate.

---

## 7. Dependencies

- Phase 9 (built): `online-booking`, `webhooks`, `notifications`, `apps/booking` + CSP — all present and extended (pay-start/pay-status in online-booking; POST /payments in webhooks; templates in notifications; booking app payment step). OK.
- Phase 6 (ledger/checkout): one payments table reused; checkout extended (refund with amount, pay-link, fee, refund-confirm). OK.
- Phase 5 (slot/conflict): booking_slots_internal / booking_check_conflicts extended with holds under the advisory lock. OK.
- Phase 7 (reports): report_payments_summary / report_daily_sales / report_taxes_summary extended; report_deposits_held new. OK.
- External: provider KYC/feature approvals + sandbox accounts + live cutover — **pending, tracked, NOT VERIFIABLE LOCALLY.**
- Next-phase needs: Phase 14 reuses card on file + merchant-initiated charges (both delivered); Phase 11 payment context for the portal (tables/functions exist); Phase 17 explicitly never reuses these connections (documented). Nothing the next phases need from Phase 10 is missing on the local side.

---

## 8. Findings

### F-CONFORMANCE-1: Exit criteria not fully met locally — live cutover and sandbox runs pending
- Severity: minor (external dependency) — but **requires chair ruling per the phase text**
- Location: phase exit criteria (11-delivery-plan.md:1927); progress file Provider onboarding table
- Problem: the exit criteria require both providers cut over on SpaCorner's own merchants with a smallest-amount live charge/refund and a week of zero-delta reconciliation, and the 10.5/10.6 acceptance criteria require one live sandbox run per provider. The progress file records: sandbox accounts "to open", SpaCorner KYC "not started", sandbox runs "not run", cutover not started. The plan itself says "If either provider's KYC is still pending, the phase does not exit unless the chair rules a split exit."
- Evidence: plan/evidence/phase-10-progress.md Provider onboarding rows; 10.5/10.6 REVIEW.md "partial"; docs/runbooks/payments-cutover.md exists but nothing ticked.
- Fix: chair rules a split exit (or the cutover completes after KYC); audit adopts the chair's ruling; none of this is fixable in code.
- Plan item: Exit criteria; acceptance criteria 10.5/10.6 sandbox runs

### F-CONFORMANCE-2: The gates' FAIL results were caused by local environment state, not code — re-runs are green
- Severity: minor (operations note for the record)
- Location: gates/GATES.md vs my re-runs
- Problem: db:test, type-drift, fn:test and the 14 Playwright payment failures all stem from the local runtime env/db state at gate time (missing PAYMENT_CREDENTIALS_KEY in the local runtime `.env`, schema cache, migrated-away DB), not from the committed code. My re-runs: pgTAP 78 files/3,167 tests PASS; generated types byte-identical; fn:test 14/14 PASS.
- Evidence: repro logs in this run (dbtest-repro.log, fntest-repro.log, types-repro.ts); gate-db-test.log vs live probe showing `public.online_verifications` exists; GATES.md:38 misattributes it.
- Fix: none in code. For future gates: `cp supabase/functions/.env.example supabase/functions/.env` before starting the stack (this is exactly what 22475a4 adds to CI).
- Plan item: Test plan / acceptance criteria (Playwright journeys)

### F-CONFORMANCE-3: Playwright payment specs depend on a local runtime env key that a plain clone does not set
- Severity: minor
- Location: supabase/functions/.env.example:91-102; README.md:51; apps/back-office/e2e/onlineFixtures.ts:76
- Problem: `connection-save` seals credentials under `PAYMENT_CREDENTIALS_KEY`; the local edge runtime only gets it from `supabase/functions/.env`, which a fresh clone doesn't have (the README tells you to copy .env.example, but the payment E2E additionally needs the fixture replay server running — the Playwright config starts it, and CI now copies the file). Developer friction only; documented.
- Evidence: gate-playwright.log: 12 occurrences of `PAYMENT_CREDENTIALS_KEY is not configured`; .env.example documents the keys; CI fix 22475a4.
- Fix: already fixed in CI (22475a4 "Prepare Edge Function .env: cp …"); optionally add a one-line README note under "Edge Functions" pointing at docs/payments/fixtures.md for payment E2E.
- Plan item: Secrets and test hooks bullet

### F-CONFORMANCE-4: 1 non-payment Playwright failure (blocked-time [en]) is a pre-existing test flake, not a Phase 10 regression
- Severity: minor (observation)
- Location: apps/back-office/e2e/blocked-time.spec.ts:20 (staff-add toast, staffFlows.ts:44)
- Problem: the [en] run failed at the *setup* step "expect 'Staff member added.' visible" (toast within 5 s); the identical scenario **passed in [ar] in the same gate run**, and the failing code is the Phase 2 staff-add form, untouched by Phase 10. No Phase 10 dependency.
- Evidence: gate-playwright.log:8 (✘) vs :126 (✓ ar); error-context.md (form button disabled at snapshot).
- Fix: none required; re-run on a quiet machine. (Not a Phase 10 finding — recorded for the chair's completeness view.)
- Plan item: n/a

### F-CONFORMANCE-5: Task commits do not use Conventional Commits format
- Severity: minor
- Location: git log 0009d0c..9bbdd7e (~60 commit subjects "10.x-Tn: …")
- Problem: CONVENTIONS §8 requires `type(scope): subject` (≤72 chars). The task commits carry task-code labels instead; two commits (docs(plan), fix(ci)) do comply. Same pattern flagged in the Phase 9 conformance audit (F-CONFORMANCE-2).
- Evidence: `git log --oneline | head -60`: "10.9-T7: evidence, review, build note …", etc.
- Fix: squash-merge task chains with CC subjects, or amend CONVENTIONS to accept `10.<epic>-T<n>` labels for internal task commits (declared alternative).
- Plan item: CONVENTIONS §8

### F-CONFORMANCE-6: README has no pointer to the payment features or fixture-replay server
- Severity: minor
- Location: README.md (no mention of payments, MyFatoorah, Tap, /p/, /l/, docs/payments/)
- Problem: the conformance brief asks that the README still describes how to run what the phase delivered. Commands remain valid, but a reader of the README cannot learn that online payments exist or how to run the payment E2E (replay server, PAYMENT_CREDENTIALS_KEY already covered by the .env.example copy instruction).
- Evidence: grep "payment" README.md → no payment content (the only hit is "pgTAP" matching the word boundary); docs/payments/* and docs/runbooks/* exist but are not linked from README.
- Fix: add 3-4 lines to README "Booking page / payments" section: Settings → Online payments; payment E2E needs the fixture replay server (docs/payments/fixtures.md) and PAYMENT_CREDENTIALS_KEY; production cutover in docs/runbooks/payments-cutover.md.
- Plan item: conformance brief item 6 (docs)

---

## 9. Full checklist table

| Subphase/Epic | Item | Section | Status | Evidence |
|---|---|---|---|---|
| Phase header | Goal (pay online KNET/card via MyFatoorah/Tap into tenant's merchant: deposit/full at booking, balance, fees, refunds, daily reconciliation) | Goal | DONE | payment_intents/connections/ledger/finalize/reconciliation all present; pgTAP 059-072 |
| Phase header | What the business can do (6 bullets) | Features | DONE | each maps to 10.2/10.7/10.8/10.9 deliverables above |
| Phase header | Scope: one provider-neutral contract, two adapters, tenant-owned merchants, checklist, branch enablement, payment at booking, deposits as prepayments, settle online, card on file, fees, online refunds, one webhook URL, daily reconciliation, facts register, out-of-scope respected | Scope | DONE | contract_suite.ts both adapters; tenant-scoped connections; merchant-onboarding kit; provider-facts; payments_guard_update; card on file (Tap); one POST /webhooks/payments; reconciliation; out-of-scope items absent |
| Phase header | Provider facts re-verified (binding) | Scope | DONE | provider-facts.md closes F-DB-12 |
| Phase header | Database work bullet (13 items: connections, credentials deny-all, branch settings, intents, webhook events, slot_holds, saved cards, reconciliation runs, payments columns, refund guard, immutability, checkout/sales, finalize, reports, pg_cron) | Database | DONE | migrations 20261018100000..20261025100000, each verified above |
| Phase header | Edge Functions bullet (7 items: _shared/payments, payments fn, online-booking pay-start/status, checkout pay-link/refund/fee, webhooks POST /payments, notifications templates, secrets/test hooks) | Edge Functions | DONE | files verified above; .env.example keys present |
| Phase header | Frontend screens bullet (4 items: owner settings+reconciliation, branch tab, desk screens, booking app /p/ and /l/) | Screens | DONE | features/payments, BranchPaymentsTab, AppointmentPayments/SaleDrawer/FeeDialog, booking routes p/ l/ |
| Phase header | Acceptance criteria (MyFatoorah path 8, Tap path 8, shared 12) | Acceptance | DONE locally / NOT VERIFIABLE LOCALLY for live-sandbox rows (MF intent/redirect/webhook/capture/failed/full-refund/partial-refund/replay; Tap same; shared tenant-matching, credentials, routing, amount/currency, deposits, fees, settle, tax, late success, reconciliation, locales) | shared contract suite + pgTAP 059-072 + Playwright specs on replayed fixtures; live sandbox rows pending (F-CONFORMANCE-1) |
| Phase header | Test plan (contract suite, pgTAP rows, concurrency, Playwright via fixture replay, live sandbox, security) | Tests | DONE locally | contract_suite/reference_adapter; pgTAP 059-072; concurrency_test.ts (4); e2e pay/pay-link/online-desk/reconciliation; leak scan; live sandbox pending |
| 10.1 | facts register | Backlog | DONE | docs/payments/provider-facts.md |
| 10.1 | resolve unverified/conflicting; narrowings; chair ruling | Backlog | DONE | provider-facts.md:97-129 |
| 10.1 | contract.ts + money.ts + golden tests | Backlog | DONE | money_test.ts; evidence 10.1/02 |
| 10.1 | merchant onboarding kit en/ar; SpaCorner KYC | Backlog | DONE (kit)/tracked (KYC) | merchant-onboarding.md |
| 10.1 | sandbox accounts; fixture recording/scrubbing procedure | Backlog | DONE (procedure)/tracked (accounts) | fixtures.md; scrub.ts |
| 10.1 | threat-model addendum | Backlog | DONE | threats 16-27 + gate |
| 10.2 | connections/credentials/settings migration + RPCs | Backlog | DONE | 20261018100000; pgTAP 059 |
| 10.2 | crypto.ts + loader + log scrubbing | Backlog | DONE | crypto.ts/connections.ts/logging.ts |
| 10.2 | payments function + owner routes + connection-test | Backlog | DONE | payments/routes.ts; key_test.ts |
| 10.2 | Settings → Online payments | Backlog | DONE | features/payments; online-payments.spec.ts |
| 10.2 | Branch editor Online payments tab | Backlog | DONE | BranchPaymentsTab.tsx |
| 10.2 | secrets in runbooks/.env.example; rotation runbook | Backlog | DONE | .env.example:83-102; runbooks |
| 10.3 | payments online columns/checks | Backlog | DONE | 20261019100100 |
| 10.3 | immutability guard + refund guard | Backlog | DONE | 20261019100100; pgTAP 061 |
| 10.3 | intents/webhook events/holds/saved cards | Backlog | DONE | 20261019100000; pgTAP 060/062 |
| 10.3 | fee sales, deposits, refund w/amount, void refuses online | Backlog | DONE | 20261019100300; pgTAP 063 |
| 10.3 | reports + ADR-51 step 7 on read + deposits-held | Backlog | DONE | 20261019100400; packages/core goldens; pgTAP 064 |
| 10.3 | pgTAP for the epic | Backlog | DONE | 060-064 passing |
| 10.4 | payment_finalize | Backlog | DONE | 20261020100100; pgTAP 066 |
| 10.4 | pg_cron expiry/sweep/purge | Backlog | DONE | 20261020100200:197-200; pgTAP 067 |
| 10.4 | webhooks POST /payments | Backlog | DONE | webhooks/payments.ts; tests |
| 10.4 | shared verify/requery/finalize path | Backlog | DONE | runtime.ts |
| 10.4 | shared contract suite | Backlog | DONE | contract_suite.ts |
| 10.4 | fixture-replay server + PAYMENTS_FAKE_ROUTING | Backlog | DONE | replay.ts; fake_routing.ts |
| 10.5 | MyFatoorah adapter | Backlog | DONE | myfatoorah/adapter.ts (+ no token charge, ruling) |
| 10.5 | MF contract suite green + own cases | Backlog | DONE | fixtures/myfatoorah; contract_test.ts |
| 10.5 | live sandbox run; fixtures scrubbed; capabilities | Backlog | NOT VERIFIABLE LOCALLY | declared open (F-CONFORMANCE-1) |
| 10.5 | SpaCorner MF KYC tracked | Backlog | tracked / NOT VERIFIABLE LOCALLY | progress table |
| 10.6 | Tap adapter | Backlog | DONE | tap/adapter.ts |
| 10.6 | Tap contract suite green + own cases | Backlog | DONE | fixtures/tap; contract_test.ts |
| 10.6 | live sandbox run; fixtures scrubbed; capabilities | Backlog | NOT VERIFIABLE LOCALLY | declared open |
| 10.6 | SpaCorner Tap KYC + saved-card enablement tracked | Backlog | tracked / NOT VERIFIABLE LOCALLY | progress table |
| 10.7 | pay-start + pay-status; hold+intent; half-up deposit | Backlog | DONE | 20261020100000; online-booking payment.ts |
| 10.7 | card on file: consent/store/revoke | Backlog | DONE | 20261022100000; crypto sealSavedCard |
| 10.7 | confirmation shows deposit; en/ar | Backlog | DONE | 20261022100100; templates v2 |
| 10.7 | booking app payment step/redirect/result/manage; /p/ /l/ | Backlog | DONE | booking routes.tsx:83-109 |
| 10.7 | Playwright en/ar deposit/full/failed/expired; axe+CSP | Backlog | DONE | pay.spec.ts; evidence 10.7 |
| 10.8 | checkout/pay-link | Backlog | DONE | online.ts; pay_link_test.ts |
| 10.8 | checkout/refund with amount | Backlog | DONE | online.ts handleRefund |
| 10.8 | checkout/fee (owner/manager) | Backlog | DONE | online.ts collectFee; create_fee_sale |
| 10.8 | templates payment_link/fee_charged/refund_issued en/ar | Backlog | DONE | templates/index.ts:424/469/508 |
| 10.8 | checkout deposit line + send link + refund dialog | Backlog | DONE | AppointmentPayments/SaleDrawer/PayLinkDialog |
| 10.8 | appointment drawer fees; lists; deposits-held report | Backlog | DONE | FeeDialog; reports /deposits |
| 10.9 | reconciliation runs + enqueue | Backlog | DONE | 20261024100000; pgTAP 072 |
| 10.9 | reconciliation consumer (Tap list / MF re-query) | Backlog | DONE | reconcile.ts; runtime.ts |
| 10.9 | reconciliation screen (owner) | Backlog | DONE | payments/routes.tsx:25; spec |
| 10.9 | alerts (Sentry + monitors.json) | Backlog | DONE (local) | payment_ops_alerts; monitors.json:78 |
| 10.9 | security review (leak scan, forgery, launch gate) | Backlog | DONE | leakage/forgery tests; 06-threat-tests.md |
| 10.9 | production cutover runbook + SpaCorner cutover | Backlog | PARTIAL (runbook DONE; cutover pending) | payments-cutover.md; F-CONFORMANCE-1 |
| Exit | every acceptance criterion green in CI | Exit | DONE locally (re-runs green); live-sandbox rows pending | my re-runs; evidence files |
| Exit | MF and Tap cut over on SpaCorner merchants; smallest-amount live charge/refund; zero-delta week | Exit | NOT VERIFIABLE LOCALLY / pending | progress table; chair must rule split exit |

## 10. One-line status per epic and phase exit criteria

| Epic | Status |
|---|---|
| 10.1 Discovery & shared contract | PASS |
| 10.2 Provider connections | PASS |
| 10.3 Ledger, intents, holds, cards, fees, reports | PASS |
| 10.4 Payment runtime | PASS |
| 10.5 MyFatoorah adapter | PASS locally (sandbox run pending) |
| 10.6 Tap adapter | PASS locally (sandbox run pending) |
| 10.7 Payment at booking | PASS |
| 10.8 Desk: links, refunds, fees | PASS |
| 10.9 Reconciliation, hardening, cutover | PASS locally (cutover pending) |

**Phase exit criteria**: the code side is complete and green (my re-runs: pgTAP 3,167 tests, fn:test 14/14, zero type drift, `pnpm verify` per gate 7). The live cutover criteria (SpacCorner merchants live, smallest-amount live charge/refund per provider, one week of zero-delta reconciliation, sandbox runs before 10.5/10.6 exit) are **NOT VERIFIABLE LOCALLY and not done**; per the phase text (11-delivery-plan.md:1927) the phase does not formally exit unless the **chair rules a split exit**. Recommendation: grant the split exit for the code, with the open Ops items (F-CONFORMANCE-1) tracked to the cutover gate.

## Summary table

| ID | Severity | Title |
|---|---|---|
| F-CONFORMANCE-1 | minor (chair decision required) | Exit criteria: live sandbox runs, KYC and cutover pending — not verifiable locally |
| F-CONFORMANCE-2 | minor | Gate FAILs were local-environment artifacts; re-runs green (pgTAP 3167, fn:test 14/14, no drift) |
| F-CONFORMANCE-3 | minor | Payment Playwright needs runtime env key; clone must copy .env.example (fixed in CI) |
| F-CONFORMANCE-4 | minor | blocked-time [en] gate failure is a pre-existing setup flake (passed in ar) |
| F-CONFORMANCE-5 | minor | Task commits use 10.x-Tn labels, not Conventional Commits (CONVENTIONS §8) |
| F-CONFORMANCE-6 | minor | README has no payment pointer/fixture-replay note |

**Severity counts: 0 blocker, 0 major, 6 minor** (plus one chair decision on exit criteria).