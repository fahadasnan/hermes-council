# Phase 9 verifier adjudication

## Verdict: FAIL

Phase 9 does not meet its own exit and acceptance criteria. The gate run records failures in both pgTAP (5 of 2,511 assertions) and back-office Playwright (77 of 216 tests), and the plan's WhatsApp end-to-end acceptance criterion is explicitly deferred rather than met. The plan also lists basic booking analytics as a Phase 9.4 deliverable, but the frontend auditor found no implementation or approved deferral. This is a FAIL under the verifier rule; the fact that some failures may be fixtures or infrastructure does not turn failed required gates into passing gates.

## Verification basis and repository state

- Repository: `/Users/fahad/GlowDesk`.
- Branch and HEAD: `feat/phase-9-evidence`, `3209ce046a7d1c0ad3ce0984d1d6aef5002f54ed`.
- `git status --short --branch` reports the same six pre-existing changed/untracked entries recorded before and after the gates in `gates/git-status-before.txt`, `gates/git-status-after.txt`, and `GATES.md:10-18,82-84`. The repository was not modified by this verification.
- Date recorded by the audit materials: 2026-10-11.
- Primary sources checked: the complete Phase 9 section of `plan/parts/11-delivery-plan.md:1594-1763`, the related binding scope in `plan/IMPLEMENTATION_PLAN.md:645-649`, `plan/decisions.md` / the F-PLAN-16 references, the four auditor reports, `gates/GATES.md`, the raw pgTAP and Playwright logs, and the cited Phase 9 test/evidence files.

The conformance checklist does enumerate all four plan subphases (9.1-9.4) and the phase-level exit criteria, so it is not missing a subphase. It is not a complete row-by-row checklist of every required category, however: some explicit “none” areas, dependencies, and acceptance/test distinctions are omitted or merged, and it does not reconcile all gate rows with the evidence pack. I corrected the consequential acceptance and gate statuses below rather than treating the checklist's summary verdicts as authoritative.

## Acceptance-criteria spot checks and overrides

| Plan section | Criterion | Adjudicated status | Evidence and ruling |
|---|---|---|---|
| 9.1 | Storage design document is complete and CI-testable | DONE | `plan/evidence/9.1/01-storage-policies.txt:3-51` records all 47 assertions passing, including anon denial and cross-tenant/cross-branch read/write denials; `database.md:19-26` identifies the storage design document and pgTAP 048. |
| 9.1 | Threat model reviewed and signed off; limiter covers public endpoints with quotas | DONE, with launch follow-up | `plan/evidence/phase-9-gates/COUNCIL.md:59-80` maps threats to tests and evidence; `GATES.md:88-96` describes the launch-gate review. Open operational monitoring and hosted client-IP confirmation remain launch risks, not evidence of a locally demonstrated cross-tenant defect. |
| 9.2 | Public booking completes end to end and appears in back-office calendar | DONE on recorded task evidence; official gate evidence incomplete | `plan/evidence/phase-9-progress.md` row 9.4-T6 records 89 booking E2E passes and 1 skip across three projects; the gates pack did not rerun this suite (frontend.md:35-39). Treat the acceptance as demonstrated in the recorded task run, but require the missing official gate run under F-VERIFIER-1. |
| 9.2 | Burst of 100 requests/minute is rate-limited | DONE | `plan/evidence/9.2/03-burst-429.json:2-24` records 100 requests, 60 allowed, 40 limited with 429, and a distinct IP still receiving 200. |
| 9.2 | Public endpoints cannot enumerate clients or appointments | DONE on recorded evidence | `plan/evidence/9.2/05-no-pii-payloads.json:2-48` records public page/slot response key allowlists with no client or appointment fields; the database report also cites negative tests 050-053. |
| 9.3 | Confirmation email and SMS arrive within two minutes | PARTIAL; criterion not met | `plan/evidence/9.3/08-confirmation-latency.json:2-10` demonstrates the email path at 10,206 ms. The plan's criterion at `11-delivery-plan.md:1709` also requires SMS, which is deliberately off at launch (COUNCIL.md:116,184). The conformance report's DONE label is incorrect. |
| 9.3 | Reminder fires at the configured interval; failure is retried and logged | DONE on recorded evidence | `backend.md:99-120,203-210` cites pgTAP 055, scheduler and Deno consumer tests, retry/dead-letter coverage, and quiet-hour evidence. No conflicting gate result was found for this criterion. |
| 9.3 | WhatsApp message sent to a test number through a connected business number | NOT DONE; declared deferral does not satisfy acceptance | `11-delivery-plan.md:1711,1715` requires a test-number/sandbox test. `COUNCIL.md:116,184` says the adapters are switched off pending registrations; `BranchMessagesTab.tsx:172-180` renders WhatsApp disabled as “Not available yet.” The operational reason is documented, so this is a justified deviation in disclosure, but the criterion remains unmet and the exit criterion at line 1610 is not DONE. |
| 9.3 | History shows sent/delivered/failed with retry information | DONE on recorded task evidence | `phase-9-progress.md` row 9.5-T3 describes the en/ar messages specs; `frontend.md:204-210` checks the log, filters, retry confirmation and usage screen. |
| 9.3 | Client data export request generates and emails CSV within 24 hours | DEVIATED-JUSTIFIED | The implementation sends a one-time download link, not an attachment; `COUNCIL.md:130` records the change. `plan/evidence/9.3/06-data-access.json:17-47` demonstrates approval, link arrival within 20 seconds, CSV download, one-time expiry and masked message data. The deviation is explicit and technically reasonable. |
| 9.4 | Staff avatar uploads and displays on calendar/booking site | DEVIATED-JUSTIFIED / not implemented | F-PLAN-16 makes upload capability conditional on an upload feature being scheduled (`IMPLEMENTATION_PLAN.md:647-648`; `REVISION_LOG.md:92`), and COUNCIL.md:121,186 records storage design only and no committed uploads. This is not an undeclared defect, but it must not be reported as implemented. |
| 9.4 | Branch logo and cover configurable | DEVIATED-JUSTIFIED / not implemented | Same conditional upload decision and explicit deferral at `COUNCIL.md:186`. |
| 9.4 | Public page serves at most 2s p95 with caching | PARTIAL | `online-load.json:2-52` records 20 rps, p95 38.3 ms slots and 37 ms create locally; `online-booking/handlers.ts:121-136` sets `Cache-Control: public, max-age=60` on the page route. The CDN deployment and slot-engine cache layer are not evidenced; the local latency result does not prove those features exist. |
| Phase | Public booking serves correct live-engine slots | DONE on recorded evidence | `database.md:59-80` and `conformance.md:56-68` cite online RPC/engine parity and public booking evidence. This is consistent with the recorded evidence; the failed test gate is separately blocking. |
| Phase | Confirmation and reminder emails/SMS within two minutes | NOT DONE | Email timing is demonstrated, but SMS is off at launch, so the combined exit criterion is not met. See the 9.3 ruling above. |
| Phase | WhatsApp works end to end | NOT DONE | The adapters being present does not satisfy the end-to-end exit criterion while they are disabled and no business-number test is run. See F-FE-2. |
| Phase | Threat model reviewed and signed off | DONE | COUNCIL.md:59-80 and the threat-model review gate provide recorded evidence. |
| Phase | Storage documented and CI-tested | DONE | `docs/architecture/storage.md` and pgTAP 048 evidence (`01-storage-policies.txt:3-51`). |

## Gate adjudication

| Gate | Result | Verifier ruling |
|---|---|---|
| `pnpm install --frozen-lockfile` | PASS | `GATES.md:39`; no dispute. |
| `supabase db reset` | PASS | `GATES.md:40`; 70 migrations plus seed. |
| `supabase test db` / pgTAP | FAIL | Raw log `003-pnpm-db-test.log:1-8`: 2,506/2,511 passed, with five failures: 029 test 14, 050 tests 56-57, and 056 tests 7 and 9. The 050/056 assertions concern Phase 9; 029 is the invoice-number assertion (`supabase/tests/029_checkout_matrix.test.sql:146-147`). I do not accept the auditors' unverified characterization that all five are harmless seed mismatches. In particular, the unexpected fourth `INV-1` must be reconciled against the fixture and numbering invariant, not made green by weakening the assertion without explanation. This remains a failed required gate. |
| `supabase db lint --level warning` | PASS with warnings | `GATES.md:42,96`; reported warnings only. |
| Type drift | PASS | `GATES.md:43`; no substantive drift. |
| `pnpm fn:test` | PASS | `GATES.md:44`; 13 suites, no failures. |
| `pnpm verify` | PASS | `GATES.md:45,79-80`; 792 Vitest tests, typecheck, lint, builds and size limits reported green. |
| Back-office Playwright | FAIL | `GATES.md:46,65-71` and `008-pnpm-playwright.log:1-45`: 139/216 passed, 77 failed. The English sign-in cascade has infrastructure symptoms, but the gate file itself also identifies real failures (realtime cross-session delivery and the Arabic touch-drag time mismatch). Frontend.md's assertion that all 77 failures are infrastructure is therefore rejected. No evidence justifies treating the overall gate as PASS. |
| Final database reset | PASS | `GATES.md:47`; `009-final-db-reset.log:1-3` confirms clean reset. |

The task-level booking E2E evidence (89 passed/1 skipped) and the local performance evidence exist, but neither appears as an executed gate in the official `GATES.md` table. The gate table records only nine gates, while the conformance report refers to a performance “gate 14”; that discrepancy needs to be resolved in the final gate ledger.

## Findings adjudication

### Accepted

1. **F-DB-1 / F-TEST-1 — pgTAP suite fails. Accept; severity changed from minor to blocker for the gate.** The log confirms five failing assertions (four in Phase 9 tests and one in the pre-existing checkout test). The evidence establishes failure, not that every mismatch is benign. Fix the fixture or implementation so the tests correctly isolate their cases and assert the intended invariants; specifically explain and resolve the extra `INV-1` in `029_checkout_matrix.test.sql:146-147`. Do not simply change expected values to match unexplained output. Then rerun pgTAP and record a zero-failure result. Plan item: Phase 9 tests and required gate.

2. **F-FE-1 / F-P9-BOOKING-ANALYTICS-1 — basic booking analytics absent. Accept; severity changed to blocker.** The explicit Phase 9.4 feature at `11-delivery-plan.md:1741` is not implemented and no deferral is recorded. The frontend report's search and conformance report's same finding support the absence; I found no contrary analytics artifact in the evidence reviewed. Implement basic view/conversion metrics and an owner-visible surface, or amend the plan through a recorded decision before claiming the phase complete. Plan item: 9.4 features delivered.

3. **F-FE-2 — WhatsApp setup and end-to-end acceptance are unmet. Accept with changed status and blocker severity.** The deferral is declared and reasonable as an operational choice, so it is not an undisclosed deviation. It does not, however, satisfy the explicit WhatsApp setup screen, test-number acceptance, or phase exit criterion. Either complete the connected setup and sandbox test, or formally amend the phase/exit criteria to move WhatsApp out of Phase 9 and into the launch gate; do not label it DONE meanwhile. Plan items: 9.3 screens/acceptance and phase exit.

4. **F-FE-3 / F-TEST-2 — Playwright evidence and failures. Accept with changes; severity changed to blocker as a failed gate.** The English cascade appears infrastructure-related in the individual contexts reported by the frontend auditor, but the shared gate summary explicitly identifies real realtime and touch-drag failures. Isolate infra failures from product failures on a clean stack; fix any reproducible product regression, including the two named cases, then rerun the full suite to a passing result. The older live walk is useful evidence but cannot replace the failed gate. Plan item: required UI regression gate.

5. **F-FE-4 — public booking E2E absent from official gate run. Accept with changes; major.** The previous 9.4-T6 run demonstrates substantial booking coverage, so the suite was not wholly untested. The council gate nevertheless omits that suite, despite the plan requiring both-locale public booking E2E. Add the booking Playwright projects to the official gate script/ledger and rerun on the final commit. Plan item: 9.2 tests.

6. **F-P9-CDN-1 — CDN and slot-engine cache incomplete. Accept with changes; major for the missing planned cache feature, not for latency.** The local benchmark meets the stated p95 budget and the page route has a 60-second cache header, so the report's broad claim of “no caching” is too strong. The evidence does not show CDN configuration or a slot-engine cache layer. Either implement and verify those layers (CDN in staging is not verifiable locally), or formally defer the feature and accurately document the available local cache behavior. Plan item: 9.4 features delivered and performance acceptance.

7. **F-VERIFIER-1 — gate ledger omits required booking E2E and does not reconcile the cited performance run. Accept; major.** `GATES.md:35-47` lists nine gates only, while `frontend.md:35-39` says the booking E2E was omitted and `conformance.md:123,126` cites performance gate 14 / `online-load.json`. Update the council gate runner and `GATES.md` so every claimed required test has an explicit command, exit status and log, then rerun the omitted suites. This finding overlaps F-FE-4 on booking E2E; treat them as one fix instruction, not two independent test suites.

### Accepted as justified deviations or evidence limitations; not defects

- **F-P9-BRANDING-1** and **F-P9-DB-COLUMNS-1 / F-STORAGE-1**: reject as defects. The plan makes actual upload capability conditional on scheduling an upload feature (`IMPLEMENTATION_PLAN.md:647-648`), and the council explicitly defers logo/cover uploads (`COUNCIL.md:121,186`). Storage design shipped; there is no evidence that unused avatar/logo columns were separately scheduled. Report these as conditional deferrals, not implemented features.
- **F-P9-SUBPHASE-1**: reject. The internal task numbering/repartitioning is documented in `phase-9-progress.md` and COUNCIL.md, and the conformance checklist evaluates all four actual plan subphases. It is not a missing user deliverable.
- **F-FE-5**: reject as a defect. The black/white QR rendering exception is documented and its QR decoding test is cited; do not replace it with theme colors that could impair scanning. The suggested code placement is optional cleanup, not a phase finding.
- **F-FE-6**: accept that the recorded Arabic touch-drag test failed, but reject attribution as a Phase 9 frontend defect: the auditors identify the calendar component as pre-existing/out of Phase 9. It remains part of the failed overall Playwright gate until the owning regression is corrected or the test is shown to be invalid.
- **F-DB-2**: rejected/retracted by the database auditor itself; no finding remains. The owner check precedes the underlying usage reads, and the auditor concluded no change is required.
- **F-DB-3**: reject as a defect. Owner-only `data_access_requests` reads are documented by the auditor as intentional privacy scope (NFR-11), not an ADR violation.
- **F-DB-4**: retain as `NOT VERIFIABLE LOCALLY`, not a failure. The database auditor could not perform live attack testing because of local tool restrictions. Code/test evidence exists, but it does not prove a live API attack exercise; stage verification should include a scoped authorization/tenant-isolation test before launch.
- **F-DB-1 / F-TEST-1** and **F-FE-3 / F-TEST-2** are duplicates as noted above; each pair has one ordered fix instruction.

## Checklist omissions filled by this verifier

The checklist in `conformance.md` covers the required four plan subphases in order, but it compresses or omits some explicit categories. The source reports and evidence support the following additional statuses:

- **9.1:** Database work, Edge Functions, screens and i18n/RTL are explicitly none by the plan (`11-delivery-plan.md:1623-1627`); dependencies are 8.1, not independently demonstrated as locally live (`:1635`); bucket-policy tests and review gate are covered above.
- **9.2:** Database work is none by plan (`:1656`); dependency 9.1 is implemented; the Edge Function, public SPA and i18n/RTL work are evidenced in backend/frontend reports. Public journey E2E has historical evidence but is absent from the council gate ledger.
- **9.3:** Dependency on 9.2 and Phase 7.3 is described in the plan (`:1717`) and reported implemented. Email is locally demonstrated; SMS/WhatsApp are deferred and therefore do not satisfy their written criteria. The one-time export link is a justified, documented deviation.
- **9.4:** Database URL columns, screens, and CDN/cache are not fully implemented; avatar/branding upload scope is conditionally deferred, but analytics has no recorded deferral. The performance benchmark passes locally, while cloud CDN behavior remains not verifiable locally.
- **Phase risks:** COUNCIL.md:146-151 states that `MESSAGE_CAP_ALERT_RATIO` is unused and no monitor reads `rate_limit_trips`; it is documented as a pre-switch-on launch follow-up. Keep it visible as an operational launch risk, not as evidence of a demonstrated tenant-isolation flaw.

## Ordered fix list

### Blockers
1. **F-DB-1 / F-TEST-1** — `supabase/tests/029_checkout_matrix.test.sql:146-147`, `supabase/tests/050_online_schema.test.sql:263-268`, `supabase/tests/056_data_access.test.sql:78-85`, and the responsible fixture/implementation: resolve all five pgTAP failures without weakening the tested invariants; rerun `supabase test db` to zero failures.
2. **F-FE-1 / F-P9-BOOKING-ANALYTICS-1** — Phase 9.4 booking implementation and/or `plan/parts/11-delivery-plan.md`: implement basic booking views/conversion tracking and its owner-visible metrics, or record an approved plan amendment/deferment.
3. **F-FE-2** — `apps/back-office/src/features/settings/components/BranchMessagesTab.tsx`, WhatsApp integration/runbook, and the phase plan: deliver the setup plus a successful connected-number sandbox test, or formally move the feature and acceptance criteria to a launch gate and stop representing Phase 9 as complete.
4. **F-FE-3 / F-TEST-2** — the Playwright gate configuration and any failing calendar/realtime tests or implementation: isolate infra failure, fix reproducible product failures, and rerun to a passing 216-test result (with any intentionally excluded case justified and recorded).

### Majors
5. **F-FE-4 / F-VERIFIER-1** — council gate script and `gates/GATES.md`: include the public booking Playwright projects and the claimed performance benchmark with explicit command, result and log; rerun on the audited HEAD.
6. **F-P9-CDN-1** — `apps/booking` deployment/cache configuration and `supabase/functions/online-booking` slot path, or the phase plan: implement/verify CDN and slot-engine caching, or explicitly defer them. Preserve the existing local p95 evidence and page cache header in either outcome.

There are no accepted minor defects after duplicate merging and rejection of the justified/no-change findings. A later chair report should retain the FAIL verdict until the blockers above are resolved or the product owner formally changes the applicable acceptance criteria and the required gates pass.