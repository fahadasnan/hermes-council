# Phase 9 audit adjudication

Verdict: PASS (local implementation and evidence gate). This is not approval to switch on hosted SMS/WhatsApp or to deploy: the recorded operational launch gate still has open, externally verifiable items.

Evidence gate: PASS. The four audit reports and the gate report are present and contain enough traceable evidence to complete adjudication. All 10 gates in `/Users/fahad/council/output/audit/phase-9/gates/GATES.md` report exit 0. The repo's committed phase evidence also records 17/17 gates passing, including the used-database pgTAP run and local online performance run (`/Users/fahad/GlowDesk/plan/evidence/phase-9-gates/GATES.md:25-42`). The audited checkout is `/Users/fahad/GlowDesk`, branch `feat/phase-9-evidence`, HEAD `21574dbb760366123ec462d87906d208a9f45779`; working tree has only the two pre-existing untracked entries `.pnpm-store/` and `.seed-pw`. The source/code directories checked have no differences between the code-tested commit `ee4e639` and HEAD; HEAD's intervening changes are evidence and documentation.

## Scope and binding interpretation

The conformance report correctly identifies four plan subphases and the phase-level exit criteria (`conformance.md:10-14, 147-155`). However, it treats the detailed subphase 9.4 backlog as binding. That is contrary to the higher-priority ADR-17: post-MVP phase task detail/backlogs are illustrative scheduling input, not binding commitments (`/Users/fahad/GlowDesk/plan/decisions.md:12`; `/Users/fahad/GlowDesk/plan/parts/11-delivery-plan.md:1592-1594`). The later council record explicitly accepted deferring avatars, branding, and URL columns, kept them marked not implemented, and recorded CDN/staging checks as launch-gate work (`/Users/fahad/GlowDesk/plan/evidence/phase-9-gates/COUNCIL.md:29-36, 118-129`). Those omissions therefore do not support a phase-blocking finding. The decision-level phase exit criteria remain in scope; where a criterion requires a real provider or hosted environment unavailable locally, the common brief requires `NOT VERIFIABLE LOCALLY`, not a failure.

## Finding-by-finding rulings

### Database audit

- F-DATABASE-1 — Accept, minor. The migration explicitly revokes `EXECUTE` for both validation helpers from `authenticated` (`supabase/migrations/20261017100200_online_booking_schema.sql:293-294`), while the database report records a live `has_function_privilege` result showing authenticated can execute the boolean helper (`database.md:137-145, 286-292`). I could not independently reproduce the live query because the local database on port 54322 timed out; this is a documented, harmless privilege drift for pure validation functions, not a tenant/data access path. Fix: add a new migration explicitly revoking both signatures from `authenticated` after the grants that currently override the original revokes, or document the intentional grant and remove the misleading revoke.
- F-DATABASE-2 — Reject. This duplicates F-CONFORMANCE-3 and concerns the deferred avatar/branding work, not a binding Phase 9 scheduled commitment. ADR-17 and the explicit council deferral above control. Do not add a migration solely to close this finding; keep the URL columns in the deferred upload/branding work item.

### Backend audit

- F-backend-1 — Accept, minor. The 80% cap constant and `rate_limit_trips` have no monitor consumer; this is independently acknowledged as open in the council launch gate (`COUNCIL.md:94, 99, 127, 176-183`). Fix: wire a monitor/alert for daily per-tenant limiter trips and code-email-cap usage before switch-on, or remove the unused ratio constant until that monitor ships.
- F-backend-2 — Accept, minor. `isLocalStack` explicitly classifies `kong` as local (`supabase/functions/_shared/local_stack.ts:1-10`), while the runbook/council note says a self-hosted CLI stack also uses `http://kong:8000` and must not enable fake test hooks (`COUNCIL.md:211`; `backend.md:81-87`). This is a defensive-configuration edge, not evidence of current production exposure. Fix: make test-hook enablement require an explicit local-only marker and refuse fake routing/channel/Turnstile/backoff settings when `FUNCTIONS_PUBLIC_URL` is set; add tests for CLI-hosted and local cases.

### Frontend, i18n and RTL audit

- F-FRONT-1 — Accept, minor. The report's source chain shows the static English document root and that locale attributes are set only after the asynchronous catalogue load (`frontend.md:143-149`). Fix: set initial `lang`/`dir` synchronously from URL/browser locale in a same-origin boot script or a layout effect before awaiting the catalogue.
- F-FRONT-2 — Accept, minor. Raw dimensions/type values are identified at `frontend.md:151-157`; they are small token-convention deviations, not a functional or safety failure. Fix: use existing design tokens or add named QR/print-card tokens in the shared token layer, then reference those tokens from the feature CSS.
- F-FRONT-3 — Accept, minor. The live audit observed the booking app requesting a missing favicon (`frontend.md:159-165`). Fix: add a real icon asset and a `<link rel="icon">` in `apps/booking/index.html`.
- F-FRONT-4 — Reject. The report itself notes this is intentional and compliant: ADR-40 makes back-office locale follow stored preference, whereas the public booking app deliberately uses URL locale (`frontend.md:167-173`). No defect is established; no change is required.
- F-FRONT-5 — Accept, minor. The two direct `Intl.DateTimeFormat` call sites are identified in `frontend.md:175-181`; output is correct but bypasses the centralized formatter convention. Fix: add a shared month/year and weekday formatter with tests in `packages/i18n/src/format.ts` and use it at both call sites.
- F-FRONT-6 — Reject. This is a reporting-granularity concern, not missing test coverage. `apps/back-office/e2e/channels.spec.ts:27-80` asserts readiness, switch behavior, test SMS/email outcomes and audit rows; the gate reports 222 back-office tests passing (`gates/GATES.md:32-35`). No additional test is needed to close a defect.

### Plan-conformance audit

- F-CONFORMANCE-1 — Reject as a major. The reported missing avatar upload, branding editor, and CDN configuration correspond to illustrative subphase detail, and avatar/branding are expressly accepted deferrals; CDN configuration and staging performance remain owned launch-gate items (`COUNCIL.md:29-30, 118`). The conformance report's own body records these features as absent (`conformance.md:119-143`), so they must remain labelled deferred/not implemented, not complete. Their absence does not fail this local implementation verdict under ADR-17.
- F-CONFORMANCE-2 — Accept, minor. The report's sample task-code commit format does not follow the stated Conventional Commit format (`conformance.md:311-317`). Fix: use Conventional Commit messages when creating/squashing the release history, or explicitly amend the convention to permit task-code prefixes on audit branches only.
- F-CONFORMANCE-3 — Reject. Duplicate of F-DATABASE-2 and covered by the same accepted deferral; URL columns should be delivered with the later upload/branding work, with matching RLS/path validation.
- F-CONFORMANCE-4 — Reject as a defect; correct the status to NOT VERIFIABLE LOCALLY. The email-only local confirmation path reached Mailpit in about 10 seconds (`plan/evidence/9.3/08-confirmation-latency.json:1-10`), but the compound email/SMS provider timing criterion is not proven against real hosted providers. No local failure is evidenced; do not label the real-provider part DONE or failed.
- F-CONFORMANCE-5 — Accept, minor, with narrower wording. A local online performance run exists: the committed gate evidence records slots p95 12.8 ms, create p95 139.6 ms and a 0.998 slot-cache hit ratio (`plan/evidence/phase-9-gates/GATES.md:38-42, 104-112`). The current CI performance job has other performance workloads but no Phase-9 online-booking/CDN benchmark (`.github/workflows/ci.yml:450-555`). This is a CI observability gap, not proof the locally measured requirement fails. Fix: add an automated booking-page/online-slot benchmark with an explicit threshold to CI, or keep it as a named, mandatory staging launch-gate check and avoid claiming it is CI-gated.

## Checklist and evidence spot-check

The checklist covers 9.1-9.4 and the phase exit section. I re-opened the complete phase specification (`plan/parts/11-delivery-plan.md:1596-1763`), the plan authority note, council rulings, gate logs, and the acceptance evidence cited below. Every applicable `DONE` acceptance claim checked is supported; three conformance statuses need correction:

- 9.1 Storage and threat-model acceptance: storage policy evidence is tied to pgTAP 048 and the threat model/review is recorded in the council file (`COUNCIL.md:77, 86-107, 115-117`). Gate output confirms pgTAP passes (2,583/0) and Deno/Vitest/Playwright pass (`gates/db-test.log:1-5`, `fn-test.log:1-15`, `verify.log:1-10`, `playwright-booking.log:1-5`).
- 9.2 end-to-end booking: the booking spec books through the real UI and checks the booked state (`apps/booking/e2e/book.spec.ts:11-50`); 89 tests passed with one expected skip (`gates/playwright-booking.log:1-2`). The burst acceptance is directly evidenced by 100 requests, 60 allowed and 40 rejected (`plan/evidence/9.2/03-burst-429.json:1-24`). Cross-tenant service/staff and verification negatives are evidenced in `plan/evidence/9.2/06-cross-tenant-negative.json:1-50` and database RPC tests (`supabase/tests/052_online_rpcs.test.sql:183-211, 326-328`).
- 9.3 reminder scheduling and deduplication is evidenced by the injected-clock artifact showing one queue message at each configured offset and no duplicate on repeated scheduler runs (`plan/evidence/9.3/01-reminder-once.json:1-54`); retry/dead-letter behavior is evidenced by five recorded transient attempts ending dead (`plan/evidence/9.3/02-retry-then-dead.json:1-50`). The data-access artifact records owner approval, an Arabic link email in about 20 seconds, a CSV download, masked message rows and single-use behavior (`plan/evidence/9.3/06-data-access.json:1-48`); UI coverage is visible in `apps/back-office/e2e/data-access.spec.ts:51-115` and `messages.spec.ts:70-113`. Channel readiness and local fake-SMS/email test messages are asserted in `apps/back-office/e2e/channels.spec.ts:27-80`. However, WhatsApp sent through a registered business sender is still explicitly open (`COUNCIL.md:118-119`) and must be NOT VERIFIABLE LOCALLY, not DONE. Email confirmation latency is locally proven with the fake SMTP provider, but live SMS/provider delivery is not.
- 9.4 avatar and branding items are intentionally deferred; they are not binding backlog commitments under ADR-17. The local online performance measurements are evidenced, while CDN and staging performance remain open and NOT VERIFIABLE LOCALLY.
- Phase exit criteria: correct slots, threat-model review and Storage documentation/CI testing have evidence (`COUNCIL.md:62-83, 115-117`). Real SMS/WhatsApp end-to-end delivery and provider timing have not been exercised; revise these statuses to NOT VERIFIABLE LOCALLY and retain the open launch-gate owners (`COUNCIL.md:118-129`).

## Independent security and gate sweep

The principal major claim was rechecked against ADR-17 and the council record and is rejected as above. For tenant isolation, the audited artifacts include explicit negative cases pairing tenant A's page with tenant B's service/staff and checking zero appointments created (`plan/evidence/9.2/06-cross-tenant-negative.json:1-50`); the database test rejects foreign tenant/branch combinations (`supabase/tests/052_online_rpcs.test.sql:183-211, 326-328`). The database audit reports RLS, composite tenant foreign keys and SECURITY DEFINER grant checks, with 2,583 pgTAP assertions passing (`database.md:57-84, 90-135, 149-160`; `gates/db-test.log:1-5`). The backend audit also records scope re-derivation, function-secret checks and idempotency tests; no blocker or major isolation defect is evidenced in the source/report set checked.

No failing gate is present. The fresh audit gate report lists 10/10 exit-zero gates; committed phase evidence lists 17/17 exit-zero gates, including the reset, performance and evidence suites. The phase source code is unchanged between the commit cited by the latter run and audited HEAD, as checked with `git diff ee4e639..HEAD` limited to migrations, functions, apps, packages and `.github` (empty).

## New verifier finding

### F-verifier-1: Provider-dependent acceptance statuses overstate local evidence
- Severity: minor
- Location: `conformance.md:95-99, 112-115, 149-155`; contrary evidence: `plan/evidence/phase-9-gates/COUNCIL.md:118-129` and `plan/evidence/9.3/REVIEW.md:107, 113-115`.
- Problem: conformance marks a WhatsApp test-number acceptance and the phase-level WhatsApp end-to-end criterion DONE, while the recorded launch gate says the real registered-sender test is still open. The compound email/SMS timing item also cannot be wholly marked DONE from a fake-SMTP local test.
- Evidence: 9.3 review states SMS/WhatsApp require follow-up before switch-on; council marks real SMS/WhatsApp test as Open. The local confirmation evidence uses provider `fake+smtp`.
- Fix: amend conformance/adjudication statuses to NOT VERIFIABLE LOCALLY for live WhatsApp and real-provider timing, preserve the owner/ops launch-gate entries, and do not claim hosted messaging readiness until those checks pass.
- Plan item: Phase 9 exit criteria; subphase 9.3 acceptance criteria.

## Merged finding summary

| ID | Ruling | Severity | Title |
|---|---|---|---|
| F-DATABASE-1 | Accept | Minor | Authenticated can execute validation helpers despite migration revokes |
| F-backend-1 | Accept | Minor | Tenant message-cap and limiter-trip alerts not wired |
| F-backend-2 | Accept | Minor | CLI-hosted self-hosted stack can satisfy the local test-hook guard |
| F-FRONT-1 | Accept | Minor | Booking document language/direction set after catalogue load |
| F-FRONT-2 | Accept | Minor | Hardcoded QR/print CSS dimensions and type sizes |
| F-FRONT-3 | Accept | Minor | Booking favicon returns 404 |
| F-FRONT-5 | Accept | Minor | Two feature call sites bypass shared Intl formatters |
| F-CONFORMANCE-2 | Accept | Minor | Phase task commits do not follow Conventional Commits |
| F-CONFORMANCE-5 | Accept with narrower wording | Minor | No Phase-9 online-booking benchmark in CI |
| F-verifier-1 | Add | Minor | Provider-dependent acceptance statuses overstate local evidence |

Rejected: F-DATABASE-2, F-FRONT-4, F-FRONT-6, F-CONFORMANCE-1, F-CONFORMANCE-3, F-CONFORMANCE-4. F-DATABASE-2/F-CONFORMANCE-3 duplicate a justified deferral; F-CONFORMANCE-4 is a status correction to NOT VERIFIABLE LOCALLY rather than a code finding.

Counts: 0 blockers, 0 majors, 10 accepted minors. No gate failures. Verdict is PASS under the verifier rule: accepted findings are minor only; the unavailable hosted-provider criteria are explicitly NOT VERIFIABLE LOCALLY, not recorded as failures. The implementation is not cleared for hosted messaging/launch while the launch-gate rows remain open.

## Ordered fix list

1. F-DATABASE-1 — `supabase/migrations/`: add a follow-up migration explicitly revoking `EXECUTE` from `authenticated` for both `online_settings_bool(jsonb,text)` and `online_settings_int(jsonb,text,integer,integer,text)`, unless the grant is intentionally required and documented.
2. F-backend-1 — `scripts/ops/` and monitoring/runbook: add per-tenant daily rate-limit trip and message-cap alerts; test the threshold and alert delivery before switch-on.
3. F-backend-2 — `supabase/functions/_shared/local_stack.ts` and tests: require an explicit local-only environment marker for fake hooks; refuse those hooks when `FUNCTIONS_PUBLIC_URL` is configured.
4. F-FRONT-1 — `apps/booking/index.html` or a same-origin boot script and `I18nProvider`: set locale-derived `lang` and `dir` before catalogue loading.
5. F-FRONT-2 — `packages/ui/src/tokens.css` and the cited feature CSS files: replace raw QR/type dimensions with named tokens, retaining print-specific dimensions in the shared token layer.
6. F-FRONT-3 — `apps/booking/index.html` and `apps/booking/public/`: add a real favicon and link it.
7. F-FRONT-5 — `packages/i18n/src/format.ts` and both cited components: centralize month/year and weekday formatting and add formatter tests.
8. F-CONFORMANCE-2 — release history or `plan/CONVENTIONS.md`: use Conventional Commit subjects when preparing the release history, or explicitly document the audit-branch exception.
9. F-CONFORMANCE-5 — `.github/workflows/ci.yml` / performance scripts or the launch checklist: add a Phase-9 booking/slot benchmark with an explicit threshold, or identify the existing online performance check as a mandatory staging gate rather than CI coverage.
10. F-verifier-1 — `conformance.md` and the release checklist: mark real WhatsApp delivery and provider-dependent SMS/email timing NOT VERIFIABLE LOCALLY; keep them open until registered-sender/staging evidence exists.
