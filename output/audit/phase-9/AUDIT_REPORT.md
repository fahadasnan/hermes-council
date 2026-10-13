# Phase 9 audit report

## Verdict: PASS

Phase 9 is complete for the locally auditable implementation, with minor fixes remaining. The verifier found no accepted blockers or major findings, and all 10 gates in the fresh gate report exited successfully. The most important remaining work is operational: real SMS and WhatsApp delivery, hosted performance/CDN checks, and several production launch controls have not been demonstrated locally and must remain open before launch. The accepted council deferral of avatar and branding uploads is not a binding Phase 9 commitment under ADR-17. The ten accepted findings are minor and do not overturn the phase verdict.

| Subphase | Status | Summary |
|---|---|---|
| 9.1 Storage and public-booking threat model | Done with fixes | Storage policies, threat model and limiter are implemented and tested; hosted client-IP behavior remains a launch gate. |
| 9.2 Public booking page | Done with fixes | Public booking, slot engine, anti-bot controls and cross-tenant protections passed local tests; minor findings remain. |
| 9.3 Notifications | Done with fixes | Local email, queue, retry, data access and channel setup passed; registered-sender SMS/WhatsApp and real-provider timing remain unverified. |
| 9.4 Booking-site polish and avatars | Done with fixes | Slot cache and booking analytics are implemented. Upload/branding work is an accepted deferral; CDN and staging performance remain launch gates. |

## What was audited

- Repository: `/Users/fahad/GlowDesk`.
- Branch: `feat/phase-9-evidence`.
- HEAD: `21574dbb760366123ec462d87906d208a9f45779`.
- Working tree: no tracked modifications; two pre-existing untracked entries, `.pnpm-store/` and `.seed-pw`.
- Audit date: 2026-10-13.
- The verifier confirmed that the code directories relevant to the phase did not change between tested commit `ee4e639` and the audited HEAD; intervening changes were evidence and documentation (`adjudication.md:5,54`).
- The repository was treated as read-only. The gate run reset the local database before and after its stateful tests; this chair review did not reset the database or run Playwright.

The audited scope is the full Phase 9 section of `plan/parts/11-delivery-plan.md:1596-1763`, including subphases 9.1 through 9.4 and the phase-level exit criteria. The binding interpretation follows `plan/decisions.md:11-12`: ADRs take precedence, and detailed post-MVP backlogs are illustrative scheduling input, not binding task commitments.

## Gates

All rows below are from `gates/GATES.md:21-34`. Each command exited 0.

| Gate | Command/check | Result | Key detail |
|---:|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | PASS | Already up to date. |
| 2 | `pnpm db:reset` | PASS | 73 migrations applied and seed loaded. |
| 3 | `pnpm db:test` | PASS | 64 files; 2,583 pgTAP tests passed. |
| 4 | `pnpm db:lint` | PASS with warnings | Warnings remain in `checkout_compute_totals`, `create_sale`, `settle_balance` and `void_sale`; they are casts, volatility annotations and shadowed variables (`GATES.md:28,54`). |
| 5 | Type-drift check | PASS | Generated types match `packages/db/src/database.types.ts`. |
| 6 | `pnpm fn:test` | PASS | 13 Deno suites passed. |
| 7 | `pnpm verify` | PASS | Strict i18n compile, typecheck, lint, CSS lint, 801 Vitest tests at 100% configured core coverage, both app builds and all five size budgets passed. |
| 8 | Booking Playwright | PASS | 89 passed, 1 expected skip, 0 failed. Projects: en-mobile, ar-mobile and en-desktop. |
| 9 | Back-office Playwright | PASS | 222 passed, 0 failed. Projects: en and ar. |
| 10 | Final `pnpm db:reset` | PASS | Database reset to the clean seeded state. |

The fresh audit gate report has 10/10 exit-zero gates (`gates/GATES.md:21-34`). Separately, the committed phase evidence records 17/17 gates passing, including the performance and evidence suites (`plan/evidence/phase-9-gates/GATES.md:25-42`; `adjudication.md:5,54`). That evidence includes a local `perf:online` run with slots p95 12.8 ms, create p95 139.6 ms and a 0.998 slot-cache hit ratio (`plan/evidence/phase-9-gates/GATES.md:38-42,104-112`). It is not a substitute for staging or CDN verification.

Aggregate test counts: pgTAP 2,583 passed; Deno 13 suites passed; Vitest 801 passed; booking Playwright 89 passed and 1 skipped; back-office Playwright 222 passed. No failures were reported (`gates/GATES.md:36-55`).

## Exit and acceptance criteria

Status meanings follow the common brief. `NOT VERIFIABLE LOCALLY` is not a failure; it means the proof needs a hosted environment or a real provider. Evidence details and the corrected provider-dependent statuses are in `adjudication.md:42-48` and the referenced gate/evidence files.

### Phase-level exit criteria

| Criterion | Status | Evidence |
|---|---|---|
| Public booking serves correct slots from the live slot engine. | DONE | Booking e2e and slot parity evidence; `supabase/tests/052_online_rpcs.test.sql:183-211,326-328`; local live slot check (`adjudication.md:45,48`). |
| Confirmation and reminder email/SMS arrive within two minutes. | NOT VERIFIABLE LOCALLY for real providers | Local email through fake SMTP/Mailpit arrived in about 10 seconds; this does not prove real SMS/provider timing. `plan/evidence/9.3/08-confirmation-latency.json:1-10`; local-provider distinction in `adjudication.md:37,46,48`. |
| WhatsApp notifications work end to end. | NOT VERIFIABLE LOCALLY | Twilio adapter and channel tests exist, but delivery through a registered business sender and approved template is still an open Ops launch gate (`COUNCIL.md:118-119`; `adjudication.md:37,46`). |
| Threat model reviewed and signed off. | DONE | `docs/security/public-booking-threat-model.md`; council review and control/test table (`COUNCIL.md:77,86-107,115-117`). |
| Storage design documented and CI-tested. | DONE | `docs/architecture/storage.md` and pgTAP 048 (`adjudication.md:48`; `database.md:241-264`). |

### Subphase 9.1: Storage and public-booking threat model

| Acceptance criterion | Status | Evidence |
|---|---|---|
| Storage design is complete and CI-testable; bucket-policy tests prove RLS mirroring. | DONE | `docs/architecture/storage.md`; migration `supabase/migrations/20261017100000_storage_design.sql`; pgTAP 048 (`conformance.md:24-34`). |
| Threat model is reviewed and signed off; rate-limiter design covers public endpoints with documented quotas. | DONE | `docs/security/public-booking-threat-model.md`; limiter implementation and quotas; council threat review (`backend.md:21-25`; `COUNCIL.md:86-107,115-117`). |

### Subphase 9.2: Public booking page

| Acceptance criterion | Status | Evidence |
|---|---|---|
| A public booking completes end to end and the appointment appears in the back-office calendar. | DONE | `apps/booking/e2e/book.spec.ts:11-50`; 89 booking tests passed, 1 skipped; DB/RPC and cross-tenant negatives (`adjudication.md:45`; `gates/GATES.md:32-33`). |
| A burst of 100 requests per minute from one IP is rate-limited. | DONE | `plan/evidence/9.2/03-burst-429.json:1-24`: 60 accepted and 40 rejected; rate-limit pgTAP 049 (`adjudication.md:45`). |
| Public endpoints cannot be used to enumerate clients or appointments. | DONE | `plan/evidence/9.2/06-cross-tenant-negative.json:1-50`; RPC tests `supabase/tests/052_online_rpcs.test.sql:183-211,326-328`; neutral responses checked in handlers tests (`adjudication.md:45,52`). |

### Subphase 9.3: Notifications

| Acceptance criterion | Status | Evidence |
|---|---|---|
| Confirmation email and SMS arrive within two minutes. | PARTIAL / NOT VERIFIABLE LOCALLY for real SMS/provider timing | Local fake-SMTP email reached Mailpit in about 10 seconds. Actual SMS/provider timing is not established locally (`plan/evidence/9.3/08-confirmation-latency.json:1-10`; `adjudication.md:37,46`). |
| Reminders fire at the configured interval; failed sends are retried and logged. | DONE | Injected-clock and deduplication evidence `plan/evidence/9.3/01-reminder-once.json:1-54`; retry/dead-letter evidence `plan/evidence/9.3/02-retry-then-dead.json:1-50`; pgTAP 055 and consumer tests (`adjudication.md:46`). |
| WhatsApp reaches a test number through the connected business number. | NOT VERIFIABLE LOCALLY | Adapter, fake-channel and template tests are present; the registered sender/template delivery remains open (`COUNCIL.md:118-119`; `adjudication.md:46`). |
| Notification history shows sent, delivered and failed states with retry information. | DONE | Message ledger and UI tests; `apps/back-office/e2e/messages.spec.ts:70-113`; gate 9 has 222 passing tests (`adjudication.md:46`; `gates/GATES.md:33`). |
| Client data export generates and emails a CSV within 24 hours. | DONE for the implemented link-based export | Owner approval, an Arabic link email, CSV download, masked message rows and single-use behavior are recorded in `plan/evidence/9.3/06-data-access.json:1-48`; UI test `apps/back-office/e2e/data-access.spec.ts:51-115` (`adjudication.md:46`). The implementation emails a one-time expiring link rather than attaching a CSV, a reported deviation noted below. |

### Subphase 9.4: Booking-site polish and avatars

The verifier applies ADR-17 and the explicit council ruling: avatar uploads, branding screens and URL columns remain accepted deferrals and are marked not implemented, not done. They are not binding scheduled commitments for this post-MVP phase (`plan/decisions.md:12`; `plan/parts/11-delivery-plan.md:1592-1594`; `COUNCIL.md:29-36`).

| Acceptance criterion | Status | Evidence |
|---|---|---|
| Staff avatar uploads and displays on the calendar and booking site. | DEFERRED, accepted by council | No upload UI; remains marked not implemented (`COUNCIL.md:29-30`; `conformance.md:119-143`). Not a phase failure under ADR-17. |
| Booking-site logo and cover image are configurable per branch. | DEFERRED, accepted by council | No branding editor; council accepted the deferral (`COUNCIL.md:29-30,118-129`; `conformance.md:119-143`). |
| Public booking page serves at or below 2 seconds p95 with caching. | NOT VERIFIABLE LOCALLY for CDN/staging; local measurements pass | Local `perf:online` measures slots p95 12.8 ms and create p95 139.6 ms with cache hit ratio 0.998. CDN and staging performance remain open launch gates (`plan/evidence/phase-9-gates/GATES.md:38-42,104-112`; `COUNCIL.md:118`). |

## Plan checklist

The checklist below covers the phase header and every subphase category required by the common brief. `DONE` denotes evidence-backed local implementation. `DEVIATED-JUSTIFIED` denotes a reported implementation choice that follows the controlling ADR or a sound technical reason. Accepted deferrals and hosted checks are labelled explicitly rather than counted as completed code.

### 9.1 Storage and public-booking threat model

- Features: DONE — private tenant/branch-prefixed Storage design; public-booking threat model; per-tenant limiter design (migration `20261017100000_storage_design.sql`, `20261017100100_rate_limits.sql`; `database.md:218-222`).
- Database: DONE — Storage bucket/policies and rate-limit tables; extra DB implementation is consistent with the plan (`database.md:218-222`).
- Edge Functions: N/A — no functions required by the plan.
- Screens: N/A — no screens required by the plan.
- i18n/RTL: N/A — no user-facing screens in this subphase.
- Tests: DONE — pgTAP 048 Storage policy tests, pgTAP 049 rate-limiter tests, threat-model review (`conformance.md:27-35`; `COUNCIL.md:115-117`).
- Backlog: DONE — Storage configuration, policy tests, threat-model review and limiter design are implemented (`conformance.md:32-35`).

### 9.2 Public booking page

- Features: DONE — public booking flow, branch links/QR, rate limits, anti-bot checks, no public PII enumeration (`conformance.md:45-49`).
- Database: DEVIATED-JUSTIFIED — online settings, RPCs and internal engine wrappers were added although the plan's simplified line says no database work; the verifier accepts this architecture as necessary to reuse the Phase 5 engine securely (`database.md:224-227`; `COUNCIL.md:156`).
- Edge Functions: DONE with reported route/trigger adjustment — `slots`, `create`, verification and manage routes use the online-booking function. Confirmation is triggered by the database outbox rather than a separate `confirm` route; the review records this implementation choice (`backend.md:29-37`; `adjudication.md:45`).
- Screens: DONE — responsive public SPA and back-office branch booking-link/QR controls (`frontend.md:55-69,112-118`).
- i18n/RTL: DONE — EN/AR booking flow; RTL geometry and locale catalog checks passed (`frontend.md:59,80-86`).
- Tests: DONE — booking e2e, rate limits, race/idempotency, PII and cross-tenant negatives (`adjudication.md:45`; `COUNCIL.md:62-78`).
- Backlog: DONE — public app, links/QR, slots/create, anti-bot and RTL work are represented in the implementation (`conformance.md:62-68`).

### 9.3 Notifications

- Features: DONE locally — notification ledger, reminder scheduling, retry/dead-letter, data access and channel readiness exist. Real provider delivery is NOT VERIFIABLE LOCALLY and remains an open operational gate (`backend.md:39-49`; `COUNCIL.md:118-129`).
- Database: DONE — notification ledger/outbox, pg_cron scheduler, delivery records and export-request flow (`database.md:229-232`).
- Edge Functions: DEVIATED-JUSTIFIED — implementation routes and SQL scheduler differ from the plan sketch; reviews document the renamed/expanded routes and pg_cron scheduler; ADR-30 treats invocation shape as an implementation detail (`backend.md:41-49`; `adjudication.md:47`).
- Screens: DONE — message history, channel setup/test-message controls, data-access requests and receipt email screens (`frontend.md:63-70,120-125`).
- i18n/RTL: DONE — EN/AR catalogs, strict compile and RTL/bidi isolation checks passed (`frontend.md:80-86`; `gates/GATES.md:31`).
- Tests: DONE locally — pgTAP scheduler/data-access tests, Deno consumer/provider tests and back-office specs pass. Live registered-sender SMS/WhatsApp is NOT VERIFIABLE LOCALLY (`adjudication.md:46`; `COUNCIL.md:62-84,118-119`).
- Backlog: DONE for local code and screens; provider registration/configuration remains an open Ops launch gate (`conformance.md:104-113`; `COUNCIL.md:118-129`).

### 9.4 Booking-site polish and avatars

- Features: DONE — slot cache and basic booking analytics. Avatar/branding upload features are DEFERRED by council under ADR-17/ADR-43 and remain explicitly not implemented. CDN configuration and staging performance are NOT VERIFIABLE LOCALLY (`backend.md:51-58`; `COUNCIL.md:25,29-36,118`).
- Database: DONE for implemented cache/analytics; avatar/logo URL columns are an accepted deferral, not a missing binding commitment (`backend.md:55-58`; `adjudication.md:9,34,36`).
- Edge Functions: N/A — no required new function for the implemented cache/analytics work.
- Screens: DONE — booking analytics report exists; avatar/branding screens are accepted deferrals (`frontend.md:127-130`; `COUNCIL.md:29-30`).
- i18n/RTL: DONE for the delivered analytics and booking screens; locale and RTL checks passed (`frontend.md:59,63-69,80-86`).
- Tests: DONE for the local slot cache, booking analytics and app journeys; CDN/staging benchmark is NOT VERIFIABLE LOCALLY (`COUNCIL.md:25-26,53-84,118`).
- Backlog: analytics dashboard DONE; avatar upload, branding editor and URL columns DEFERRED by council; CDN/staging checks remain open launch-gate work (`COUNCIL.md:29-36,118`).

## Deviations

### Reported and justified or accepted

- Subphase 9.2 adds settings, online RPCs and booking-engine internals despite the simplified plan line “Database work: none.” The verifier accepts the extra work as architecturally necessary to expose the existing engine safely (`database.md:224-227`; `COUNCIL.md:156`).
- Booking confirmation is delivered through the appointment outbox trigger and notification consumer, rather than a separate `confirm` route; email identity verification also uses email codes. The implementation and review record this choice (`backend.md:33-37`; `adjudication.md:45`).
- Subphase 9.3 uses expanded route names and a SQL/pg_cron reminder scheduler instead of copying the plan's route sketch. The backend review reports the change and ADR-30 permits route shape to be an implementation detail (`backend.md:47`; `adjudication.md:47`).
- Data export emails a one-time link to the CSV rather than attaching the CSV. This was reported as a deviation; evidence shows approval, link delivery and CSV access (`backend.md:47`; `plan/evidence/9.3/06-data-access.json:1-48`).
- Avatar, branding and URL-column work remains deferred under ADR-17/ADR-43. The council explicitly accepted the deferral and requires those items to remain marked not implemented, not done (`plan/decisions.md:12`; `COUNCIL.md:29-36`).
- Hosted WhatsApp/SMS, CDN, staging performance and hosted security/configuration checks are launch-gate items, not local pass claims (`COUNCIL.md:118-129`).

### Undeclared or requiring follow-up

- F-CONFORMANCE-2: Phase 9 task commit subjects use task-code prefixes rather than the required Conventional Commit form. The verifier accepts this as a minor finding; the release history should use compliant subjects or conventions should explicitly state the audit-branch exception (`conformance.md:311-317`; `adjudication.md:35`).
- F-verifier-1: the conformance report marked live WhatsApp and provider-dependent timing as done despite open launch-gate evidence. This is an evidence-status/reporting error, not a code failure. Correct the statuses to `NOT VERIFIABLE LOCALLY` and retain the operational owners (`conformance.md:95-99,112-115,149-155`; `COUNCIL.md:118-129`; `adjudication.md:58-64`).

## Findings

No accepted blockers or majors. Ten accepted minor findings follow. The exact fix prompts below are concrete actions from the verifier's adjudication; source locations are included for traceability.

### Accepted minor findings

#### F-DATABASE-1: Authenticated can execute validation helpers despite migration revokes
- Location: `supabase/migrations/20261017100200_online_booking_schema.sql:293-294`; live privilege evidence in `database.md:137-145,286-292`.
- Problem: migration revokes execution of both settings-validation helpers, but the database audit reports that `authenticated` can execute the boolean helper. These helpers perform pure JSON validation and have no data access, so this is privilege drift, not a tenant-data exposure.
- Fix: add a follow-up migration revoking `EXECUTE` from `authenticated` for `online_settings_bool(jsonb,text)` and `online_settings_int(jsonb,text,integer,integer,text)`, unless the grant is intentionally required and documented. Do not edit the applied migration.

#### F-backend-1: Tenant message-cap and limiter-trip alerts are not wired
- Location: `supabase/functions/_shared/rate_limit_quotas.ts:36`; council launch-gate details in `COUNCIL.md:94,99,127,176-183`.
- Problem: the message-cap alert ratio is defined but not consumed, and there is no monitor reading per-tenant limiter trips. This is a documented launch-gate gap; the cap limits code-email volume, but no alert fires before or at the threshold.
- Fix: wire a monitor/alert for daily per-tenant limiter trips and code-email-cap usage before switch-on, with threshold and alert-delivery tests; otherwise remove the unused ratio constant until the monitor ships.

#### F-backend-2: CLI-hosted self-hosted stack can satisfy the local test-hook guard
- Location: `supabase/functions/_shared/local_stack.ts:1-10`; council risk in `COUNCIL.md:211` and `backend.md:81-87`.
- Problem: a Supabase CLI-hosted stack also uses `http://kong:8000`, which the local-stack guard classifies as local. Fake routing, channel, Turnstile or backoff hooks could therefore be enabled on that self-hosted stack if misconfigured. No current production exposure was found.
- Fix: require an explicit local-only marker for test hooks, refuse fake routing/channel/Turnstile/backoff settings when `FUNCTIONS_PUBLIC_URL` is set, and add tests for both local and CLI-hosted configurations.

#### F-FRONT-1: Booking document language and direction are set after catalogue load
- Location: `apps/booking/index.html:2`; `packages/i18n/src/I18nProvider.tsx:65-67`; evidence and suggested correction in `frontend.md:143-149`.
- Problem: the document begins with `lang="en"` and no `dir`; locale attributes are assigned after the asynchronous catalogue load. An Arabic deep link has a short pre-hydration interval with incorrect document metadata.
- Fix: set initial `lang` and `dir` synchronously from the URL/browser locale using a same-origin boot script, or set them in a layout effect before awaiting the catalogue.

#### F-FRONT-2: Hardcoded QR and print-card dimensions bypass design tokens
- Location: `apps/back-office/src/features/settings/components/OnlineBooking.module.css:29-30`; `OnlineCard.module.css:21,35-47`; evidence in `frontend.md:151-157`.
- Problem: QR dimensions and print-card type sizes use raw px/mm values instead of the shared token layer. The print-specific mm dimensions may be appropriate, but the values should be named and centralized.
- Fix: add named QR/print tokens in `packages/ui/src/tokens.css` and use them from both feature stylesheets, keeping physical print dimensions in the shared token layer.

#### F-FRONT-3: Booking app requests a missing favicon
- Location: `apps/booking/index.html`; observed 404 in `frontend.md:159-165`.
- Problem: a booking-page visit generates a missing `favicon.ico` request.
- Fix: add a real icon asset under `apps/booking/public/` and link it from `apps/booking/index.html`.

#### F-FRONT-5: Two components construct date formatters directly
- Location: `apps/back-office/src/features/messages/components/MessageLogPage.tsx:414-417`; `apps/booking/src/features/booking/components/DateStep.tsx:7-18`; evidence in `frontend.md:175-181`.
- Problem: both call sites use `Intl.DateTimeFormat` directly instead of the centralized i18n formatting helpers. Output is correct, but the formatting rule is split across feature code.
- Fix: add tested month/year and weekday-short helpers in `packages/i18n/src/format.ts` and replace both direct constructions.

#### F-CONFORMANCE-2: Phase task commits do not follow Conventional Commits
- Location: Phase 9 task commit history; sample and evidence in `conformance.md:311-317`.
- Problem: task-code subjects such as `9.2-T6: ...` do not follow the repository's stated `type(scope): subject` convention.
- Fix: use Conventional Commit subjects when preparing/squashing the release history, or amend `plan/CONVENTIONS.md` to document a narrow audit-branch exception.

#### F-CONFORMANCE-5: CI has no Phase 9 online-booking performance benchmark
- Location: `.github/workflows/ci.yml:450-555`; evidence and narrowed ruling in `adjudication.md:38`.
- Problem: the local online-booking benchmark passed, but the current CI performance job does not run a Phase 9 booking/slot benchmark. This is a CI observability gap, not evidence that local performance fails.
- Fix: add an automated booking-page/online-slot benchmark with a stated threshold to CI, or list the existing online benchmark as a mandatory staging launch gate and do not describe it as CI-gated.

#### F-verifier-1: Provider-dependent acceptance statuses overstate local evidence
- Location: `conformance.md:95-99,112-115,149-155`; contrary launch-gate evidence in `COUNCIL.md:118-129` and `plan/evidence/9.3/REVIEW.md:107,113-115`.
- Problem: the conformance report marked real WhatsApp delivery and provider-dependent SMS/email timing done even though only the local fake-provider path was exercised and the real-sender check remains open.
- Fix: mark live WhatsApp delivery and real-provider timing `NOT VERIFIABLE LOCALLY`; preserve launch-gate owners and do not claim hosted messaging readiness until registered-sender/staging evidence exists.

### Rejected findings

- F-DATABASE-2 and F-CONFORMANCE-3: rejected as duplicates concerning avatar/branding URL columns. ADR-17 says post-MVP backlog detail is not binding, and council explicitly accepted the deferral. Keep these items labelled not implemented, not done (`adjudication.md:9,16,34,36`; `COUNCIL.md:29-36`).
- F-FRONT-4: rejected because back-office locale follows persisted preference under ADR-40; the observed difference from booking URL locale is intentional (`adjudication.md:28`; `frontend.md:167-173`).
- F-FRONT-6: rejected because channel readiness and test-message paths are asserted in `channels.spec.ts` and `message-settings.spec.ts`; aggregate gate count does not establish missing coverage (`adjudication.md:30`; `apps/back-office/e2e/channels.spec.ts:27-80`).
- F-CONFORMANCE-1: rejected as a major because it treated accepted avatar/branding deferrals and hosted CDN configuration as binding local deliverables; ADR-17 and the council decision control (`adjudication.md:9,34`).
- F-CONFORMANCE-4: rejected as a code defect. The local fake-SMTP email path passed; real-provider SMS/timing is `NOT VERIFIABLE LOCALLY`, not a local failure (`adjudication.md:37,46`).

## Not verifiable locally

These items remain open launch gates. Passing local tests does not authorize hosted messaging or deployment.

| Item | What will prove it |
|---|---|
| Real SMS and WhatsApp delivery, including registered sender and approved template | Ops sends a test message from Settings → Messages → Channels through the registered sender to a test number; retain provider and application evidence (`COUNCIL.md:118-119`). |
| Real SMTP deliverability and authentication configuration | Ops configures SMTP on port 465, SPF, DKIM, DMARC and hosted Auth SMTP, then records delivery evidence (`COUNCIL.md:123`). |
| CDN caching and hosted booking performance | Ops configures CDN behavior for the booking route; backend lead runs `perf:online` in staging and records the budget and cache-hit results (`COUNCIL.md:118`). |
| Hosted client-IP header and CORS | Backend lead verifies the hosted client-IP header cannot be spoofed and checks the deployed function's own CORS responses (`COUNCIL.md:122,125`). |
| Tenant-isolation attack test against staging | Backend lead performs and records the authorized scoped staging test (`COUNCIL.md:120`). |
| Self-hosted public function URL and public API links | Ops sets `FUNCTIONS_PUBLIC_URL` and verifies data-access links and `List-Unsubscribe` use the public API (`COUNCIL.md:121`). |
| Production origin, CSP and Turnstile configuration | Ops configures booking origin, `ALLOWED_ORIGINS`, `BOOKING_PUBLIC_URL`, live CSP and production Turnstile keys (`COUNCIL.md:124`). |
| Queue/dead-letter and limiter/message-cap alerts | Ops/backend lead wires and verifies monitors and alerts (`COUNCIL.md:126-127`). |
| Arabic/English privacy notice, SMTP region and deployment approval | Product owner/legal confirm privacy notice and ADR-48 region; owner provides explicit go-ahead (`COUNCIL.md:128-129`). |

## Fix prompt

```text
Fix the phase 9 audit findings below in /Users/fahad/GlowDesk, in order.
Context: @plan/parts/11-delivery-plan.md @plan/decisions.md @plan/CONVENTIONS.md
Skills: /feature-delivery /spa-domain-glossary /spa-platform-architecture /supabase-database /supabase-edge-functions /react-frontend /i18n-rtl /airbnb-design

1. F-DATABASE-1: supabase/migrations/ - add a follow-up migration explicitly revoking EXECUTE from authenticated for online_settings_bool(jsonb,text) and online_settings_int(jsonb,text,integer,integer,text), unless the grants are intentionally required and documented.
2. F-backend-1: scripts/ops/ and monitoring/runbook - wire daily per-tenant rate-limit-trip and message-cap alerts; test thresholds and alert delivery before switch-on, or remove the unused ratio constant until monitoring ships.
3. F-backend-2: supabase/functions/_shared/local_stack.ts and tests - require an explicit local-only marker for fake hooks and refuse them when FUNCTIONS_PUBLIC_URL is configured; test local and CLI-hosted cases.
4. F-FRONT-1: apps/booking/index.html or a same-origin boot script and I18nProvider - set locale-derived lang and dir before catalogue loading.
5. F-FRONT-2: packages/ui/src/tokens.css and the cited feature CSS files - replace raw QR/type dimensions with named shared tokens, keeping print-specific dimensions in the token layer.
6. F-FRONT-3: apps/booking/index.html and apps/booking/public/ - add a real favicon asset and link it.
7. F-FRONT-5: packages/i18n/src/format.ts and both cited components - centralize month/year and weekday formatting and add formatter tests.
8. F-CONFORMANCE-2: release history or plan/CONVENTIONS.md - use Conventional Commit subjects when preparing release history, or explicitly document an audit-branch exception.
9. F-CONFORMANCE-5: .github/workflows/ci.yml / performance scripts or the launch checklist - add a Phase 9 booking/slot benchmark with an explicit threshold, or make the online performance check a mandatory staging gate rather than claiming CI coverage.
10. F-verifier-1: conformance.md and the release checklist - mark real WhatsApp delivery and provider-dependent SMS/email timing NOT VERIFIABLE LOCALLY; keep them open until registered-sender/staging evidence exists.

Rules: never edit an applied migration (add a new one); keep both skill copies identical; use Conventional Commits. Done = every gate in the audit passes again and each fixed acceptance criterion is demonstrated by a test.
```

## Finding totals

| Severity | Accepted | Rejected |
|---|---:|---:|
| Blocker | 0 | 0 |
| Major | 0 | 1 |
| Minor | 10 | 5 |

The rejected-major count is F-CONFORMANCE-1. Rejected minor counts include the duplicate deferrals, intentional locale behavior, existing channel-test coverage and the provider-timing status correction. Full ruling references are in `adjudication.md:66-83`.