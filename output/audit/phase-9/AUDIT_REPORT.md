# Phase 9 audit report: online booking and notifications

## Verdict

FAIL. Phase 9 is not complete against its written exit criteria. Four blockers remain: the required pgTAP suite fails five assertions, the basic booking analytics deliverable is absent without an approved deferral, SMS/WhatsApp end-to-end acceptance is not met, and the back-office Playwright gate fails 77 of 216 tests. The main implementation is substantial: storage controls, public booking, notification infrastructure and the English/Arabic booking journey have recorded passing evidence. The fixes are bounded but require code or a formal plan change, a clean rerun of failed gates, and missing booking-app E2E coverage in the official gate ledger. The verifier's evidence gate passed; its phase verdict is FAIL (adjudication.md:3-5, 58-72).

| Plan subphase | Status | Product-owner summary |
|---|---|---|
| 9.1 Storage and public booking threat model | Done with fixes | Storage, rate limiting and threat-model checks are evidenced; pgTAP still fails at the phase gate. |
| 9.2 Public booking page | Done with fixes | The flow, rate limiting and privacy protections have recorded passing evidence; the booking Playwright suite was not run by the official gates. |
| 9.3 Notifications | Incomplete | Email and reminders work in local evidence, but SMS and WhatsApp acceptance and the WhatsApp setup screen are not delivered. |
| 9.4 Booking-site polish and avatars | Incomplete | Conditional avatar/branding uploads are deferred, but basic analytics is missing and caching is only partly evidenced. |

## What was audited

- Repository: `/Users/fahad/GlowDesk`.
- Branch: `feat/phase-9-evidence`.
- HEAD: `3209ce046a7d1c0ad3ce0984d1d6aef5002f54ed`.
- Working tree: uncommitted changes were present. `git status --short --branch` showed `M docs/security/public-booking-threat-model.md`, `M package.json`, and untracked `.pnpm-store/`, `.seed-pw`, `plan/evidence/phase-9-gates/`, and `scripts/perf/online-load.ts`. The gate record says this state was identical before and after its checks (gates/GATES.md:3-18, 82-84; adjudication.md:7-13). The audit did not modify the repository.
- Audit date: 2026-10-11 (+03), from the audit materials and local system date.
- Scope: the complete Phase 9 section, including plan subphases 9.1-9.4, all stated exit criteria, applicable ADRs and the gate results. Plan source: `plan/parts/11-delivery-plan.md:1596-1763`. The implementation's additional 9.5 work is treated as supporting work, not a plan subphase.
- Binding-rule review: the verifier checked the plan, implementation-plan decision F-PLAN-16, relevant ADRs, evidence and all four auditor reports. It rejected the prior PASS summaries wherever they conflicted with failed required gates or unmet written acceptance criteria (adjudication.md:13-15, 40-83).

## Gates

| Gate | Result | Key detail and evidence |
|---|---|---|
| `pnpm install --frozen-lockfile` | PASS (exit 0) | Already up to date; gates/GATES.md:35-40, log `001-pnpm-install-frozen-lockfile.log`. |
| `supabase db reset` | PASS (exit 0) | 70 migrations plus seed; gates/GATES.md:40, log `002-pnpm-db-reset.log`. |
| `supabase test db` (pgTAP) | FAIL (exit 1) | 2,506/2,511 passed; five assertions failed, detailed below. gates/GATES.md:41, 49-63; `003-pnpm-db-test.log:1-9`. |
| `supabase db lint --level warning` | PASS with warnings (exit 0) | Warnings only; gates/GATES.md:42, log `004-pnpm-db-lint.log`. |
| Type drift | PASS (exit 0) | No substantive drift; generated types match committed types (2,267 lines). gates/GATES.md:43, log `005-type-drift.log`. |
| `pnpm fn:test` (Deno) | PASS (exit 0) | 13 suites, zero failures. gates/GATES.md:44, log `006-pnpm-fn-test.log`. |
| `pnpm verify` | PASS (exit 0) | Typecheck, lint, 792 Vitest tests, builds and size limits passed. gates/GATES.md:45, 73-80, log `007-pnpm-verify.log`. |
| Back-office Playwright | FAIL (exit 1) | 139/216 passed; 77 failed, zero skipped. Failures include an English sign-in cascade and named realtime and touch-drag failures. gates/GATES.md:46, 65-71, 75-80; `008-pnpm-playwright.log:1-46`. The verifier did not accept the claim that all failures were infrastructure. |
| Final `supabase db reset` | PASS (exit 0) | Clean reset; gates/GATES.md:47, log `009-final-db-reset.log`. |

The five pgTAP failures are: invoice-number assertion 029 test 14 (four `INV-1` rows found, three expected); 050 tests 56-57 (nine consent audit rows vs three expected; six appointments with online source vs zero expected); and 056 tests 7 and 9 (data-access row counts differ from expected). The logs prove the assertions fail; they do not prove all discrepancies are harmless fixture mismatches. In particular, the extra invoice number must be reconciled against the invariant and fixture before changing the test (003-pnpm-db-test.log:3-8; adjudication.md:46, 60).

The official gate ledger has nine rows and omits the booking-app Playwright run. The progress record reports a prior booking run of 89 passed and one skipped, but that historical run does not replace an official run on the audited HEAD. The conformance report also cites performance “gate 14,” while the council GATES.md has no such row; the available local performance evidence is `online-load.json` (adjudication.md:54, 68-72; frontend.md:35-39; conformance.md:123, 126; plan/evidence/phase-9-progress.md:81).

## Exit and acceptance criteria

Phase-level exit criteria are listed first, followed by each plan subphase. Statuses reflect the verifier's rulings rather than the auditors' summary PASS labels.

### Phase-level exit criteria

| Criterion | Status | Evidence |
|---|---|---|
| Public booking serves correct slots from the live slot engine | DONE on recorded task evidence; official gate evidence incomplete | The verifier accepts the recorded live-engine and booking evidence. The booking E2E suite was not included in the official gate run. Evidence: adjudication.md:23, 34, 54; `plan/evidence/phase-9-progress.md:81`; backend.md:59-80. |
| Confirmation and reminder emails/SMS arrive within two minutes | NOT DONE | Email arrived in about 10 seconds in the local evidence, but SMS is disabled at launch. The combined email/SMS criterion therefore remains unmet. Evidence: `plan/evidence/9.3/08-confirmation-latency.json:2-10`; `COUNCIL.md:116, 184`; adjudication.md:26, 35. |
| WhatsApp notifications work end to end | NOT DONE | Adapters exist but are switched off, with no connected business-number test. A declared deferral explains the choice but does not satisfy the criterion. Evidence: `COUNCIL.md:116, 184`; `BranchMessagesTab.tsx:172-180`; adjudication.md:28, 36. |
| Threat model reviewed and signed off | DONE, with launch follow-up | Threats map to controls and tests; hosted client-IP confirmation and monitoring remain open launch items. Evidence: `COUNCIL.md:59-97`; gates/GATES.md:88-96; adjudication.md:22, 37. |
| Storage design documented and CI-tested | DONE | Storage documentation and pgTAP 048 are recorded; its 47 assertions passed. Evidence: `docs/architecture/storage.md`; `plan/evidence/9.1/01-storage-policies.txt:3-51`; adjudication.md:21, 38. |

### Subphase 9.1 acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Storage design is complete and CI-testable, with bucket-policy tests proving RLS mirroring | DONE | 47 storage-policy assertions passed, including anon denial and cross-tenant/branch read and write denials. `plan/evidence/9.1/01-storage-policies.txt:3-51`; database.md:19-26. |
| Threat model is reviewed and signed off; rate-limiter design covers public endpoints with documented quotas | DONE, with launch follow-up | Review and test mapping are recorded; hosted client-IP confirmation and operational monitoring remain open before launch. `COUNCIL.md:59-97`; adjudication.md:22. |

### Subphase 9.2 acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Public booking completes end to end and appears in the back-office calendar | DONE on recorded task evidence; official gate evidence incomplete | Progress row 9.4-T6 records 89 passed and one skipped across three projects; official council gates omitted this suite. `plan/evidence/phase-9-progress.md:81`; frontend.md:35-39; adjudication.md:23. |
| A burst of 100 requests per minute from one IP is rate-limited | DONE | Evidence records 100 requests, 60 allowed and 40 limited with 429; a distinct IP received 200. `plan/evidence/9.2/03-burst-429.json:2-24`; conformance.md:66-68. |
| Public endpoints cannot enumerate clients or appointments | DONE on recorded evidence | Public response allowlists contain no client or appointment fields; negative tests are cited. `plan/evidence/9.2/05-no-pii-payloads.json:2-48`; adjudication.md:25. |

### Subphase 9.3 acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Appointment confirmation email and SMS arrive within two minutes | PARTIAL; criterion not met | Email is recorded at approximately 10 seconds; SMS is switched off. `plan/evidence/9.3/08-confirmation-latency.json:2-10`; adjudication.md:26. |
| Reminder fires at the configured interval; failures are retried and logged | DONE on recorded evidence | pgTAP 055, scheduler/consumer tests, retry/dead-letter and quiet-hours evidence are cited. backend.md:99-120, 203-210; adjudication.md:27. |
| WhatsApp notification is sent to a test number through a connected business number | NOT DONE | Provider adapters are switched off and there is no connected-number test. `COUNCIL.md:116, 184`; adjudication.md:28. |
| Notification history shows sent, delivered and failed messages with retry information | DONE on recorded task evidence | Message-log screens, filters and retry confirmation were exercised; see frontend.md:204-210 and adjudication.md:29. |
| Client data-export request generates and emails a CSV within 24 hours | DEVIATED-JUSTIFIED | Implementation sends a one-time download link rather than an attachment; the council records the change and evidence demonstrates approval, download and expiry. `COUNCIL.md:130`; `plan/evidence/9.3/06-data-access.json:17-47`; adjudication.md:30. |

### Subphase 9.4 acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Staff avatar uploads successfully and displays on the calendar and booking site | DEVIATED-JUSTIFIED; not implemented | Upload scope is conditional under F-PLAN-16; no upload UI was committed. `plan/IMPLEMENTATION_PLAN.md:647-648`; `COUNCIL.md:121, 186`; adjudication.md:31. |
| Booking-site logo and cover are configurable per branch | DEVIATED-JUSTIFIED; not implemented | Council explicitly deferred logo and cover uploads. `COUNCIL.md:186`; adjudication.md:32. |
| Public booking page serves at most two seconds p95 with caching | PARTIAL | Local performance evidence is within budget and the page route sets a 60-second cache header; CDN configuration and slot-engine cache are not evidenced. `online-load.json:2-52`; `supabase/functions/online-booking/handlers.ts:121-136`; adjudication.md:33. |

## Plan checklist

Statuses are applied to the full plan sections. “None” means the plan explicitly has no item in that category, not that work is missing. Plan section line references below refer to `plan/parts/11-delivery-plan.md`.

### Subphase 9.1: Storage and public booking threat model (plan lines 1614-1641)

- Features: DONE. Private tenant/branch-prefixed Storage design, threat model and per-tenant limiter with documented quotas (1618-1621; database.md:19-41).
- Database: NONE by plan; Storage bucket configuration is infrastructure (1623).
- Edge Functions: NONE by plan (1625).
- Screens: NONE by plan (1627).
- i18n/RTL: NONE by plan; no screens (1627).
- Tests: DONE for bucket-policy tests and threat-model review gate (1633; `01-storage-policies.txt:3-51`; `COUNCIL.md:59-97`). The full pgTAP gate remains failed because of other assertions, including Phase 9 tests.
- Dependencies: 8.1 is stated. The council records Phase 8 skipped; the verifier did not treat this as a locally proven production dependency (1635; adjudication.md:89; phase-9-progress.md:46-48).
- Backlog: DONE for bucket config/policies, bucket-policy CI tests, threat-model document/review and limiter design (1637-1641; conformance.md:41-44).

### Subphase 9.2: Public booking page (plan lines 1645-1681)

- Features: DONE on recorded implementation evidence: public service/staff/time/confirm flow, shared slot engine, branch links/QR, rate limiting and no PII enumeration (1649-1654; conformance.md:56-60).
- Database: NONE by plan; it consumes the Phase 5 engine (1656).
- Edge Functions: DONE: `online-booking` routes for slots, public create and notification-triggered confirmation are present (1658-1659; backend.md:304-313).
- Screens: DONE: responsive public SPA with English and Arabic evidence (1661; frontend.md:96-140).
- i18n/RTL: DONE on recorded evidence: complete catalogs and full Arabic RTL flow (1663; frontend.md:142-163).
- Tests: PARTIAL as an official gate. Burst and PII tests are evidenced; booking E2E previously passed 89 with one skip but was not rerun in the council gate (1665-1670; `plan/evidence/phase-9-progress.md:81`; adjudication.md:68).
- Dependencies: 9.1 limiter/threat model is implemented (1672; database.md:28-41).
- Backlog: DONE for app scaffold/flow, links/QR, slots/create/confirm, anti-bot and RTL (1674-1681; conformance.md:69-75).

### Subphase 9.3: Notifications (plan lines 1685-1729)

- Features: PARTIAL. Email, reminders, history, receipts and data access are evidenced. SMS/WhatsApp setup and connected-number delivery are deferred; provider adapters exist but are off (1689-1695; adjudication.md:26-30).
- Database: DONE for notification ledger and reminder scheduling, with a failing pgTAP suite that must be reconciled before the gate passes (1697-1700; database.md:89-122; `003-pnpm-db-test.log:5-8`).
- Edge Functions: PARTIAL. Notification dispatch, export and provider adapter exist; live WhatsApp delivery is not established (1701-1704; backend.md:315-329; adjudication.md:28).
- Screens: PARTIAL. History and data-export screens exist; the required WhatsApp connection/setup screen is absent and is replaced by a disabled channel row (1706; frontend.md:204-227; adjudication.md:28, 64).
- i18n/RTL: DONE for implemented screens and catalogs based on frontend audit; provider setup cannot be verified while off (frontend.md:142-163, 204-227).
- Tests: PARTIAL. Scheduler, Deno consumer and local email evidence exist. WhatsApp sandbox testing is absent; pgTAP has two failed 056 assertions and two 050 failures; required channel acceptance is unmet (1715; adjudication.md:46, 64).
- Dependencies: 9.2 and Phase 7.3 are reported implemented (1717; conformance.md:325-328).
- Backlog: PARTIAL. Core DB/function/history/export work is present; WhatsApp setup, business-number/template approval and SMS/provider switch-on remain deferred (1719-1729; `COUNCIL.md:116, 184`).

### Subphase 9.4: Booking-site polish and avatars (plan lines 1733-1761)

- Features: PARTIAL. Avatar/branding uploads are conditionally deferred; CDN and slot-engine caching are not evidenced; basic analytics is absent without a recorded deferral (1735-1741; adjudication.md:31-33, 62, 70).
- Database: PARTIAL. Storage exists, but the planned relevant avatar/logo URL columns are not fully supplied in Phase 9 migrations; the verifier rejects this as a separate defect because upload capability was conditionally deferred (1743; adjudication.md:76, 92).
- Edge Functions: PARTIAL. Public booking routes exist; no slot-engine cache layer is evidenced (1740; handlers.ts:121-136; adjudication.md:33, 70).
- Screens: PARTIAL. Avatar editor and branding editor are absent under the upload deferral; booking analytics surface is also absent and not deferred (1745; frontend.md:247-271; adjudication.md:62, 76).
- i18n/RTL: PARTIAL by scope: the existing public booking pages are verified in English and Arabic, but no evidence exists for the missing analytics, avatar or branding screens (frontend.md:142-163, 241-275).
- Tests: PARTIAL. Local p95 benchmark passes; no upload or branding journey tests, no CDN deployment evidence, and the booking E2E run is missing from the official gate ledger (1752; adjudication.md:33, 54, 70-72).
- Dependencies: Storage (9.1) and booking site (9.2) are implemented (1754; adjudication.md:92).
- Backlog: PARTIAL. Avatar/branding work is conditionally deferred; CDN configuration and basic analytics remain unimplemented without an approved deferral (1756-1761; adjudication.md:62, 70, 76).

## Deviations

- WhatsApp and SMS are switched off at launch: DECLARED and operationally justified, but they do not satisfy the written 9.3 test-number, SMS and phase exit acceptance criteria. The setup screen is also missing. Either implement provider setup and demonstrate the tests, or formally amend the phase criteria and move these commitments to the launch gate. Evidence: `COUNCIL.md:116, 184`; plan `11-delivery-plan.md:1706-1715, 1610`; adjudication.md:28, 35-36, 64.
- Avatar and branding uploads: DEVIATED-JUSTIFIED under F-PLAN-16's conditional upload scope and the council deferral. Do not report those uploads as implemented. Evidence: `plan/IMPLEMENTATION_PLAN.md:647-648`; `COUNCIL.md:121, 186`; adjudication.md:31-32, 76.
- Booking analytics: DEVIATED-UNJUSTIFIED. The plan explicitly calls for basic views/conversion metrics, and there is no approved deferral. Evidence: `11-delivery-plan.md:1741, 1761`; frontend.md:300-322; adjudication.md:62.
- CDN and slot-engine cache: PARTIAL / not evidenced. The local page cache header and latency budget pass, but CDN deployment and a slot-engine cache are not shown. The verifier accepts implementation/verification or a formal deferral as the resolution. Evidence: `handlers.ts:121-136`; `online-load.json:2-52`; adjudication.md:33, 70.
- Client data export: DEVIATED-JUSTIFIED. A one-time expiring link replaces a CSV attachment; this is documented and tested. Evidence: `COUNCIL.md:130`; `9.3/06-data-access.json:17-47`; adjudication.md:30.
- Internal subphase numbering differs from the plan, with the public SPA delivered in implementation epic 9.4 and extra back-office work tracked as 9.5. This is documented; verifier rejected it as a defect. Evidence: conformance.md:15-17, 201-205; adjudication.md:77.

## Findings

Accepted findings are grouped by verifier severity. Duplicate auditor IDs are merged as directed in the adjudication; findings below are the final actionable set.

### Blockers

#### F-DB-1 / F-TEST-1: Required pgTAP gate fails
- Severity: blocker.
- Location: `supabase/tests/029_checkout_matrix.test.sql:146-147`; `supabase/tests/050_online_schema.test.sql:263-268`; `supabase/tests/056_data_access.test.sql:78-85`; failing gate `003-pnpm-db-test.log:1-8`.
- Problem: five assertions fail, including Phase 9 consent, online-source and data-access counts, plus an invoice-number invariant. This is a required gate failure; the logs do not establish that all failures are harmless seed data.
- Evidence: `003-pnpm-db-test.log:3-8` records exact actual and expected values; adjudication.md:46, 60.
- Fix: isolate or correct the fixtures and implementation so all five assertions pass without weakening the intended invariants. Specifically explain and resolve the fourth `INV-1` against the three-branch invariant, then rerun `supabase test db` and record zero failures.
- Plan item: Phase 9 tests and subphases 9.2/9.3 database work.

#### F-FE-1 / F-P9-BOOKING-ANALYTICS-1: Basic booking analytics is missing
- Severity: blocker.
- Location: `plan/parts/11-delivery-plan.md:1741, 1761`; absence in `apps/booking/`, `apps/back-office/` and related implementation (frontend.md:300-322).
- Problem: views and conversion metrics are an explicit 9.4 deliverable. No tracking, owner-visible metrics or approved deferral was found.
- Evidence: frontend.md:300-322; adjudication.md:62.
- Fix: implement basic booking view and conversion tracking with an owner-visible metrics surface and tests, or record an approved plan amendment moving the feature out of Phase 9 before claiming completion.
- Plan item: 9.4 features and backlog.

#### F-FE-2: WhatsApp setup and SMS/WhatsApp end-to-end acceptance are unmet
- Severity: blocker.
- Location: `apps/back-office/src/features/settings/components/BranchMessagesTab.tsx:172-180`; plan `11-delivery-plan.md:1706-1715, 1610`.
- Problem: channels are disabled and marked “Not available yet”; there is no connected-number WhatsApp test, and SMS is off. This declared deferral does not meet the explicit subphase and phase acceptance criteria.
- Evidence: `COUNCIL.md:116, 184`; frontend.md:211-220; adjudication.md:26, 28, 35-36, 64.
- Fix: provide the setup flow and configured sandbox/business-number test for WhatsApp and demonstrate the SMS acceptance, or formally amend Phase 9 acceptance and move those commitments to a launch gate. Do not mark the phase complete while the current criteria remain.
- Plan item: 9.3 screens/acceptance and phase exit criteria.

#### F-FE-3 / F-TEST-2: Required back-office Playwright gate fails
- Severity: blocker.
- Location: gate `008-pnpm-playwright.log:1-46`; detailed gate summary `GATES.md:65-71`.
- Problem: 77 of 216 tests fail. English setup failures appear to cascade from environment issues, but the gate also identifies realtime cross-session and Arabic touch-drag failures. The verifier rejects treating all failures as infrastructure; the result remains a failed required gate, irrespective of whether every failure belongs to Phase 9.
- Evidence: `008-pnpm-playwright.log:9-20, 39, 46`; adjudication.md:51, 66.
- Fix: rerun on a clean stack to separate environment failures from product failures; fix reproducible failures, including the named realtime/touch-drag cases or prove a test invalid with a recorded rationale, then rerun the full suite to a passing result.
- Plan item: required UI regression gate.

### Majors

#### F-FE-4 / F-VERIFIER-1: Official gates omit booking E2E and do not reconcile the performance result
- Severity: major.
- Location: `gates/GATES.md:35-47`; `plan/evidence/phase-9-gates/run-gates.sh:86`; `plan/evidence/phase-9-progress.md:81`.
- Problem: the official gate ledger contains nine gates and no public booking Playwright run. The historical 89-pass/1-skip run does not prove the audited HEAD. The conformance report cites performance “gate 14,” which the official ledger does not reconcile.
- Evidence: frontend.md:35-39; conformance.md:123, 126; adjudication.md:54, 68-72.
- Fix: update the council gate runner and GATES.md with the public booking Playwright projects and the claimed performance benchmark, each with exact command, exit code, result and log; rerun them on the audited HEAD. This is one merged finding, not two independent booking-E2E fixes.
- Plan item: 9.2 tests and official gate traceability.

#### F-P9-CDN-1: CDN and slot-engine caching are not evidenced
- Severity: major.
- Location: plan `11-delivery-plan.md:1740, 1750, 1760`; `supabase/functions/online-booking/handlers.ts:121-136`.
- Problem: local latency is within budget and the page route sets `Cache-Control: public, max-age=60`, but neither CDN configuration nor a slot-engine cache layer is evidenced. A passing local p95 benchmark does not prove those planned cache layers exist.
- Evidence: `online-load.json:2-52`; frontend.md:255-266; adjudication.md:33, 70.
- Fix: implement and verify CDN configuration and slot-engine caching, or record a formal plan deferral that preserves the measured local p95 and accurately describes the current page cache behavior. Verify CDN behavior in staging.
- Plan item: 9.4 features, performance acceptance and backlog.

### Rejected or not defects

- F-P9-BRANDING-1 and F-P9-DB-COLUMNS-1 / F-STORAGE-1: rejected as defects because actual upload capability is conditional under F-PLAN-16 and logo/cover upload was explicitly deferred. Keep these marked not implemented/deferred, not DONE (adjudication.md:76).
- F-P9-SUBPHASE-1: rejected; implementation subphase repartitioning is documented and all four plan subphases were evaluated (adjudication.md:77).
- F-FE-5: rejected as a defect; QR black-on-white rendering is documented and decode-tested. Moving the renderer is optional cleanup (adjudication.md:78).
- F-FE-6: the Arabic touch-drag failure is accepted as a real gate failure, but rejected as a Phase 9 frontend defect because the calendar code is pre-existing. It remains part of F-FE-3 until fixed or proven invalid (adjudication.md:79).
- F-DB-2 was retracted by its auditor; F-DB-3 is intentional owner-only privacy scope (adjudication.md:80-81).
- No accepted minor defect remains after deduplication and these rulings (adjudication.md:107).

## Not verifiable locally

- Live WhatsApp/SMS delivery through registered provider accounts and a connected WhatsApp business number requires provider registration and credentials. The current local adapters are switched off. Later proof: approved credentials/configuration plus a test-number delivery recorded in the launch evidence. This operational limit does not excuse the unmet current acceptance criterion (adjudication.md:28, 74-82; COUNCIL.md:116, 184).
- CDN behavior and hosted deployment settings cannot be proved by the local stack. Later proof: staging deployment/configuration, cache behavior for the public page and slot responses, and a staging performance run (adjudication.md:33, 70).
- Live API attack testing was not completed because of local tool restrictions. Later proof: a scoped staging authorization and tenant-isolation attack test before production, as recommended in database.md:191-201 and retained by adjudication.md:82.
- Hosted client-IP header confirmation, provider SMTP setup and operational monitoring are open launch checks, not demonstrated local failures. Evidence and owners are listed in `plan/evidence/phase-9-gates/COUNCIL.md:81-97`.

## Fix prompt

```text
Fix the phase 9 audit findings below in /Users/fahad/GlowDesk, in order.
Context: @plan/parts/11-delivery-plan.md @plan/decisions.md @plan/CONVENTIONS.md
Skills: /feature-delivery /spa-domain-glossary /spa-platform-architecture /supabase-database /supabase-edge-functions /react-frontend /i18n-rtl /airbnb-design

1. F-DB-1 / F-TEST-1: supabase/tests/029_checkout_matrix.test.sql, supabase/tests/050_online_schema.test.sql, supabase/tests/056_data_access.test.sql and the responsible fixtures/implementation - resolve all five failing pgTAP assertions without weakening invariants. Explain and resolve the unexpected fourth INV-1, then rerun `supabase test db` to zero failures.
2. F-FE-1 / F-P9-BOOKING-ANALYTICS-1: Phase 9.4 booking implementation and/or plan - implement basic booking views/conversion tracking and an owner-visible metrics surface with tests, or record an approved plan amendment/deferment.
3. F-FE-2: apps/back-office/src/features/settings/components/BranchMessagesTab.tsx, WhatsApp integration/runbook and phase plan - deliver the setup plus connected-number sandbox test and demonstrate SMS acceptance, or formally amend the Phase 9 criteria and move these commitments to a launch gate. Do not represent current acceptance as DONE.
4. F-FE-3 / F-TEST-2: Playwright gate configuration and any failing calendar/realtime tests or implementation - isolate infrastructure failures, fix reproducible product failures (including realtime cross-session and touch-drag), or document why a failing test is invalid; rerun the full back-office suite to a passing result.
5. F-FE-4 / F-VERIFIER-1: council gate runner and gates/GATES.md - include public booking Playwright projects and the cited performance benchmark, record exact commands/results/logs, and rerun on the final audited commit.
6. F-P9-CDN-1: apps/booking deployment/cache configuration and supabase/functions/online-booking slot path, or the phase plan - implement and verify CDN and slot-engine caching, or formally defer them while preserving the local p95 evidence and accurately documenting the page cache header. Verify the CDN in staging.

Rules: never edit an applied migration (add a new one); keep both skill copies identical; Conventional Commits. Done = every gate in the audit passes again and each fixed acceptance criterion is demonstrated by a test. If acceptance criteria are formally amended, record the approved decision and verify all remaining criteria and gates.
```

## Summary of accepted findings

| ID | Severity | Title |
|---|---|---|
| F-DB-1 / F-TEST-1 | blocker | Required pgTAP suite fails five assertions |
| F-FE-1 / F-P9-BOOKING-ANALYTICS-1 | blocker | Basic booking analytics missing without deferral |
| F-FE-2 | blocker | WhatsApp/SMS acceptance unmet and setup screen absent |
| F-FE-3 / F-TEST-2 | blocker | Required back-office Playwright gate fails |
| F-FE-4 / F-VERIFIER-1 | major | Official gates omit booking E2E and do not reconcile performance run |
| F-P9-CDN-1 | major | CDN and slot-engine cache are not evidenced |

Count: 4 blockers, 2 majors, 0 minors.
