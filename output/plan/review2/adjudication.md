# Round 2 adjudication

Reviewer: verifier. Scope: adjudication of coverage.md, data-backend.md, decisions-audit.md, and plan-skills-audit.md against the round-1 plan. The four required reviewer files were present, readable, and non-truncated. `check-skills.mjs` and the reported Mermaid checks are green; those checks do not excuse the substantive findings below.

## Ruling method

Accept means the finding and its proposed direction are valid. Accept with changes means the issue is real but the chair must use the consolidated fix below. Reject means the evidence does not establish a plan defect or the issue is already bindingly resolved. Duplicate findings are retained by ID and merged into one chair action.

## Adjudication: coverage and product audit

| Finding | Ruling | Adjudication |
|---|---|---|
| F-PLAN-1 | ACCEPT | US-LOC-1 is an MVP requirement but Phase 1 only schedules the admin wizard's first location and no owner/manager CRUD task. Add location API, `/settings/locations` en/ar screens, deactivate/detach warning, scope tests, and the owner-adds-second-location acceptance test in Phase 1 Epic 1.3. |
| F-PLAN-2 | ACCEPT | The privacy requirement promises PII nulling while the Phase 3 backlog has no deletion service, endpoint, confirmation UI, audit event, or final pass void. Add the exact service/UI/acceptance text from the finding to Phase 3 Epic 3.4 and amend ADR-34 to name the action. |
| F-PIPE-1 | ACCEPT; merge with F-PIPE-1 (plan-skills), F-MISSING-15, F-CONSISTENCY-14/15/16 | The common brief makes the GlowDesk evidence pipeline mandatory, and the source plan has no evidence/progress/check/gate harness. Use one blocker action: Phase 0 creates `plan/evidence/`, `phase-0-progress.md`, `scripts/phase0-check.sh`, the dashboard Playwright evidence config, and the first gate; every phase/epic closes with the required review and gate packs; feature-delivery, react-frontend, and CONVENTIONS §9/§11 document the workflow. Do not add GlowDesk's Supabase/RLS/Deno/Lingui stack. |
| F-PIPE-2 | ACCEPT; merge with F-PIPE-2 (plan-skills) | `ar`-only journeys and absent light/dark evidence fail the explicit common brief. Replace every MVP user-facing journey requirement with `en` and `ar`; require light and dark screenshots in both languages through the evidence config. Update i18n-rtl, react-frontend, feature-delivery, and Phases 1–5 test plans. |
| F-SKILL-1 | ACCEPT; merge with F-DB-6 | `models.ForeignKeyConstraint` is not a Django API and cannot be the model example. Replace it with `ForeignKey(..., db_constraint=False)` plus migration `RunSQL` composite foreign keys, retain parent `(id, tenant_id)` uniqueness, and add the explicit pitfall. Apply to both skill trees. Django references checked: https://docs.djangoproject.com/en/stable/topics/composite-primary-key and https://docs.djangoproject.com/en/stable/ref/models/constraints/. |
| F-REQ-1 | ACCEPT | The requirements model list and `staff_member_id`/`ledger_event` wording conflict with ADR-44's binding `Membership`/`LedgerEntry` vocabulary. Correct requirements §2 exactly as proposed; record the correction in REVISION_LOG.md. |
| F-SKILL-2 | ACCEPT; merge with coverage's same issue | Currency is tenant-level, not location-level. Change the example to `useTenantSettings()` and format with `tenant.currency`; update both skill trees and wording. |
| F-SKILL-3 | ACCEPT | `key_id` equality lookup is not constant-time and need not be; only HMAC signature comparison uses `hmac.compare_digest`. Correct the django-backend wording and preserve timestamp/signature validation. |
| F-PLAN-3 | ACCEPT | The dependency diagram's solid chain incorrectly serializes later phases that the prose says depend only on earlier subsets. Correct the Mermaid edges/caption as proposed; distinguish hard dependency from staffing serialization in the Gantt. |
| F-PLAN-4 | ACCEPT WITH CHANGES | Split the clearly oversized MVP tasks (signer, enrollment, counter) into one-PR tasks. For Phases 6–13, require phase-start epic decomposition rather than pretending the one-line roadmap backlog is implementation-ready. |
| F-PLAN-5 | ACCEPT | The promised `sharingProhibited` and `authenticationRequired` fields need schema, projection, editor toggles, and acceptance coverage in Phase 2 Epic 2.1. |
| F-FE-1 | ACCEPT | The timeout protocol is safety-critical and a comment is insufficient. Add a concrete mutation/re-query example to react-frontend showing 10-second timeout, `sent/unconfirmed`, re-fetch, success if found, and explicit retry only if absent; never silently resend. |
| F-FE-2 | ACCEPT | The plan/ADR says polling-only MVP but the skill does not make the prohibition explicit. Add: “No WebSocket or SSE in MVP; pass status uses TanStack Query `refetchInterval` polling only.” |
| F-I18N-1 | ACCEPT | The skill requires bilingual wallet strings but Phase 2 Epic 2.1 does not explicitly build the editor. Add side-by-side en/ar wallet-facing fields and bilingual consent fields to Epic 2.1, with validation and tests. |
| F-GLOS-1 | REJECT AS A CHANGE; retain as a note | The comparison table's Loopy column is explicitly evidence terminology, not product naming. No correction is needed; chair may add a clarifying “evidence terminology only” note, but must not rename the source feature labels. |
| F-COV-1 | ACCEPT WITH CHANGES | Account deletion is a real surface in the evidence, but it is not an MVP requirement in the provided product brief. Do not silently expand MVP. Add it to the post-MVP privacy/account lifecycle backlog (or explicitly mark it deferred with owner-only authorization, password confirmation, exit reason, tenant data-retention/legal policy). It must not be confused with suspension or customer PII deletion. |
| F-COV-2 | ACCEPT WITH CHANGES | Email verification is a plausible operational gap, but the brief requires platform-admin-created tenants and owner setup links, not public signup. Add owner email verification/change-email behavior to the Phase 1 email ADR and tests only if the product owner requires verified addresses; otherwise explicitly record “setup-link delivery is the MVP owner activation mechanism; customer email verification is deferred.” Do not add an unsupported customer activation gate. |
| F-COV-3 | ACCEPT WITH CHANGES | Single-customer messaging is distinct from campaign messaging but is not an MVP brief requirement. Add it to the Phase 9/P4 messaging backlog as a separate owner-only action, or explicitly defer it; do not imply campaign segmentation covers it. |
| F-COV-4 | ACCEPT | Mixed-direction Arabic names plus Latin phone/numbers are common GCC data and need an explicit rendering test. Add an en/ar Playwright or component evidence case with `dir`, bidi isolation, and formatter assertions; use CSS logical properties. |
| F-COV-5 | ACCEPT | The plan states out-of-scope lookup returns 404 but Phase 3 lacks the exact test. Add a permission/API test: staff at A scanning a pass with events only at B receives 404 and no PII, while a two-location staff member can act at either selected location. |
| Custom labels/front fields (coverage table, not numbered) | ACCEPT WITH CHANGES | The evidence says premium-gated and the MVP brief does not require it. Clarify in requirements that custom front fields/label overrides are deferred unless the chair deliberately adds them; remove or define the unexplained `labels[]` API payload so it cannot imply an MVP promise. |
| Zapier, Vimeo tutorials, Intercom, setup wizard | REJECT as required features; ACCEPT documentation note | These are vendor/content/onboarding choices not mandated by the brief. Keep them out of MVP, but state “not in scope; API/webhooks and docs are the integration surface” where useful. |
| Settings billing, beacons, templates, campaigns, plan limits | ACCEPT existing deferral | These are correctly deferred by the source plan/ADR-28 or later-phase scope. Ensure the revision log does not misclassify them as omissions. |

## Adjudication: data/backend audit

| Finding | Ruling | Adjudication |
|---|---|---|
| F-DB-1 | ACCEPT | The canonical chain calls manager-only `for_tenant()` after a queryset method. Change to `Balance.objects.for_tenant(tenant).select_for_update().get(...)`; add the manager/queryset chaining pitfall to both django-backend copies. |
| F-DB-2 | ACCEPT | Celery has no request context, so fail-closed `objects.get()` cannot load the outbox row. Change task examples to the fenced accessor with explicit audit, and extend the narrowly scoped allowlist to outbox task files; document by-primary-key, audited use. The chair must ensure the task marks/updates rows through an approved service or explicit audited path. |
| F-DB-3 | ACCEPT | A UUID field on the abstract base contradicts ADR-33 bigserial internal join tables. Remove the base `id`; require concrete public models to declare UUID and internal join tables to declare `BigAutoField`, including the example. Apply to both django-data copies. |
| F-DB-4 | ACCEPT; merge any phase-order duplicate | ADR-9 writes `LedgerEntry` in Phase 2 while the table is created in Phase 3, and Phase 3 webhook fanout references Phase 5 tables. Create the ledger table/trigger in Phase 2 for enrollment use; create webhook subscription/delivery tables (empty, no UI) in Phase 3; leave Phase 5 UI/auth/delivery activation there. Update dependencies and acceptance tests. |
| F-DB-5 | ACCEPT | `Model.cross_tenant` is attribute access, so an import grep is vacuous. Replace the control with an AST checker (`scripts/check_cross_tenant.py`) and a precise allowlist matching F-DB-2; update ADR-11, CONVENTIONS, both skills, and Phase 0 backlog. |
| F-DB-6 | ACCEPT; merged into F-SKILL-1 | Same invalid Django API. One RunSQL implementation and one isolation test are the canonical fix; do not maintain competing ORM and SQL recipes. |
| F-DB-7 | ACCEPT WITH CHANGES | The read-only admin checklist is underspecified under fail-closed tenancy. Either remove tenant-owned models from admin, or define a `TenantAdminMixin` using an explicit support-session/tenant selection and add only the narrowly allowed admin file to the fence. Prefer removing admin registration unless a concrete operational need exists. |
| F-DB-8 | ACCEPT | Repair ADR-1's malformed header code span to `X-Api-Key: ***`, `X-Timestamp`, and `X-Signature` as separate well-formed headers. |
| Tenant isolation attack-path conclusions | ACCEPT WITH CONDITIONS | The safe conclusions depend on fixes F-DB-2, F-DB-5, and F-DB-6. The chair must not describe them as already safe until composite SQL FKs, worker access, and the AST fence are implemented and tested. |
| Ledger integrity conclusions | ACCEPT WITH CONDITION | Idempotency, signed deltas, append-only trigger, and reconciliation are coherent; enrollment sequencing is not. Apply F-DB-4 before claiming the ledger matrix is buildable. |

## Adjudication: decisions and conventions audit

All ADR-1 through ADR-44 received KEEP from the reviewer. I ACCEPT the KEEP verdicts except where the text itself must be amended by the fixes below; KEEP does not mean every current implementation example is correct.

| Finding(s) | Ruling | Consolidated chair instruction |
|---|---|---|
| F-MISSING-1 | ACCEPT WITH CHANGES | Add backup/restore ADR with explicit provider-neutral policy: WAL/PITR or equivalent, retention, RPO/RTO, encryption, access control, quarterly restore drill, and outbox replay. Do not hard-code “hourly pg_dump” as the only design. Add Phase 0 ops task and go-live restore evidence. |
| F-MISSING-2 | ACCEPT WITH CHANGES | Add audit retention/legal hold/PII-erasure policy to ADR-42. The proposed seven-year GCC minimum is not universally established by the supplied evidence; make retention a configurable legal decision with a default and deletion/archival controls approved by counsel. Add lifecycle task. |
| F-MISSING-3 | ACCEPT WITH CHANGES | Add an ADR for MVP search. Start with indexed Postgres search appropriate to actual fields/scale (pass-code exact/prefix and normalized customer identifiers; `tsvector` only where tested), define tenant/location scoping, and defer external search behind a measured growth trigger. Add indexes and benchmark acceptance. |
| F-MISSING-4 | ACCEPT WITH CHANGES | Add a feature-flag ADR defining platform vs tenant flags, source of truth, cache/invalidation, audit, rollout, and tests. Do not allow flags to bypass tenancy or ledger invariants. The proposed JSONB design is acceptable only after schema/query/ownership details are stated. |
| F-MISSING-5 | ACCEPT WITH CHANGES | Add environment/deployment ADR: local, staging with synthetic data and sandbox credentials, production; promotion gates, secrets, migration strategy, rollback, and deployment topology. “Blue-green” is not mandatory—choose based on Django migration compatibility. |
| F-MISSING-6 | ACCEPT | Add transactional-email provider abstraction, sender identity, bounce/complaint handling, setup-link expiry/resend, observability, and Phase 1 acceptance. Provider selection may remain an implementation choice behind the abstraction. |
| F-MISSING-7 | ACCEPT | Add queue routing policy and overload behavior for default, pass-push, and webhooks; include task routing tests and operational alerts. |
| F-MISSING-8 | ACCEPT WITH CHANGES | Add server-side image type/size/dimension validation and safe processing. Do not assert one universal Apple dimension or “original never stored” without checking style requirements and retention needs; encode per-style requirements and document rejection/derivative behavior. |
| F-MISSING-9 | ACCEPT | Add deterministic deduplication ADR: normalization, field configuration ownership, missing values, collisions, race behavior, and customer-vs-program scope. Ensure it agrees with ADR-9 and tests two-device races. |
| F-MISSING-10 | ACCEPT | Add forward-compatible migration policy: expand/contract, large-table operations, data migrations as commands, `makemigrations --check`, rollback/deploy compatibility, and destructive-operation approval. |
| F-MISSING-11 | ACCEPT WITH CHANGES | Consolidate PII classification, access/masking, encryption-at-rest responsibility, consent, deletion, token lifecycle, exports, retention, and audit. Avoid claiming Postgres TDE is available/configured without an infrastructure decision. |
| F-MISSING-12 | ACCEPT | Add monitoring/SLO and alert policy for DB/Redis/Celery readiness, pass-push success/failure, outbox dead letters, webhook failures, reconciliation drift, latency, and certificate expiry. Add Phase 0 observability and go-live evidence. Thresholds must be tunable, not treated as universal truth. |
| F-MISSING-13 | ACCEPT | Amend ADR-22: tenant-wide analytics use tenant default timezone; location-filtered analytics use location timezone; UI labels the bucket semantics. Add multi-zone fixtures. |
| F-MISSING-14 | ACCEPT | Add cache policy with tenant-prefixed keys, TTLs, invalidation/best-effort semantics, and explicit prohibition on caching ledger/balance truth. |
| F-MISSING-15 | ACCEPT; merged with F-PIPE-1 | Use the single GlowDesk pipeline action above, not a second competing ADR. If an ADR is desired, number it once and reference it from all affected docs. |
| F-CONSISTENCY-1 through 11, 13 | ACCEPT WITH CHANGES | These are real stale round-1 examples, not reasons to rewrite the round-1 files under reviewer rules. Add a clearly prominent superseded/illustrative header to backend.md and data-model.md pointing to ADR-44/CONVENTIONS as binding. The chair's revision log must list the stale names, thread-local, token, money, Pass-balance, JWT, endpoint, and direct-enqueue contradictions. Do not rely on a header to excuse code that agents are instructed to copy: canonical skills and implementation-plan snippets must be corrected too. |
| F-CONSISTENCY-12 | REJECT | The reviewer explicitly found Phase 2 “no balance columns” and Phase 3 balances consistent. No change. |
| F-CONSISTENCY-14/15/16 | ACCEPT; merged with F-PIPE-1 | Apply the one pipeline fix; no duplicate harness designs. |
| F-REVIEW-1 through F-REVIEW-10, F-REVIEW-12 through F-REVIEW-16 | ACCEPT AS RESOLVED | The cited ADRs and current plan text address these round-1 follow-ups. Retain them in the revision log as resolved; acceptance remains conditional on implementation staying aligned. |
| F-REVIEW-11 | ACCEPT WITH CHANGES | The per-tenant issuance path is only asserted, not documented. Add `docs/wallet/per-tenant-issuance.md` as roadmap documentation with certificate ownership, Pass Type ID scope, secret storage, rotation, revocation, and operational/legal prerequisites. |
| F-CONSISTENCY-8/9/10 | ACCEPT WITH CHANGES | The stale files contain real typos/path examples. Add superseded headers and correct any examples copied into binding skills/plan. Do not spend the chair's synthesis on editing prohibited round-1 reports. |

## Conflicts and duplicate resolution

1. GlowDesk: F-PIPE-1, F-MISSING-15, F-CONSISTENCY-14, F-CONSISTENCY-15, F-CONSISTENCY-16 are one blocker, not five. The canonical fix is one Phase 0 harness plus per-phase/per-epic evidence and bilingual/theme-complete Playwright requirements.
2. Composite FKs: F-SKILL-1 and F-DB-6 are one major. Use `db_constraint=False` ORM fields plus migration `RunSQL`; never show `models.ForeignKeyConstraint`.
3. Locations and privacy deletion: F-PLAN-1 and F-PLAN-2 are independent major MVP backlog omissions and both must be scheduled.
4. Currency: coverage's concern and F-SKILL-2 are one minor; tenant currency wins over active-location currency.
5. The coverage report calls some vendor/content surfaces missing while the brief does not require them. They are not MVP defects; mark them deferred/out of scope rather than adding them.
6. The data audit says `PassUpdate.objects.get()` is impossible under fail-closed access; the decisions audit calls the outbox architecture sound. The architecture is sound, but the task accessor is wrong. Correct the task and fence; do not reject ADR-17.
7. Decisions audit says all ADRs KEEP while simultaneously proposing 15 new ADRs. Ruling: existing ADRs remain, with the amendments above; add new numbered ADRs only for accepted missing operational decisions and do not renumber existing ADRs.

## Verifier sweep: additional findings

### F-verifier-1: Phase 2 enrollment writes a ledger row before its table exists
- Severity: blocker
- Location: ADR-9 and IMPLEMENTATION_PLAN.md Phase 2/3 database work.
- Problem: This is the concrete sequencing/security consequence of F-DB-4 and must be visible as a gate item: the public enrollment transaction cannot satisfy its idempotency and analytics contract if `ledger_entries` is absent.
- Fix: create the complete enrollment-compatible `ledger_entries` schema and append-only trigger in Phase 2; Phase 3 adds balances and balance-event constraints/services. Add a migration-order test that runs the Phase 2 enrollment transaction before Phase 3 code.

### F-verifier-2: Phase 0 acceptance still names an import-based cross-tenant check
- Severity: major
- Location: IMPLEMENTATION_PLAN.md Phase 0 acceptance and backlog; ADR-11/CONVENTIONS §5.5.
- Problem: Even after accepting F-DB-5, the plan says “cross_tenant import outside allowed files fails CI,” which cannot detect normal `Model.cross_tenant` attribute access.
- Fix: replace every import-grep phrase with “AST attribute-access checker fails `.cross_tenant` outside the allowlist,” add checker fixtures for allowed and forbidden files, and make it a Phase 0 gate.

### F-verifier-3: The plan's “all tenant-owned models inherit TenantOwnedModel” conflicts with the required bigserial exception
- Severity: major
- Location: CONVENTIONS §5.2, django-data rules, ADR-33.
- Problem: F-DB-3 identifies the base-class contradiction, but binding prose still says every tenant-owned model inherits a UUID-bearing base. After removing the base `id`, the inheritance rule can work, but the concrete-PK exception must be stated in all binding documents or an implementer will reintroduce UUID join keys.
- Fix: amend the rule to “every tenant-owned model inherits the base; each concrete model declares its PK: UUID public-facing, BigAutoField internal/join per ADR-33.” Add model-enumeration tests asserting both tenant fence and intended PK class.

### F-verifier-4: Phase 2 acceptance requires both languages but its test plan and evidence pipeline do not require both themes
- Severity: blocker
- Location: IMPLEMENTATION_PLAN.md Phase 2 acceptance/test plan; F-PIPE-2.
- Problem: Acceptance mentions `ar` and `en` strings, but the executable test says only Arabic and RTL snapshots. The common brief requires evidence screenshots in en/ar and light/dark.
- Fix: Phase 2 test plan must enumerate four evidence variants (en-light, en-dark, ar-light, ar-dark) plus phone viewport; apply the same matrix to every user-facing epic.

### F-verifier-5: Webhook schema is referenced in Phase 3 before Phase 5, but Phase 3 text says delivery is “dark” and may assume no tables
- Severity: major
- Location: IMPLEMENTATION_PLAN.md Phase 3 Celery/database text and Phase 5 schema text.
- Problem: The current wording is internally ambiguous: `_fanout_webhooks` is in the Phase 3 service contract while webhook tables are scheduled in Phase 5.
- Fix: implement F-DB-4's Phase 3 empty schema and make Phase 3 fanout a no-op over an existing empty subscription table; Phase 5 enables credential/subscription UI and delivery. Add a migration/schema smoke test.

## Ordered fix list for the chair

Blockers:

1. F-PIPE-1 / F-PIPE-2 / F-MISSING-15 / F-CONSISTENCY-14/15/16 / F-verifier-4 — add the Phase 0 GlowDesk evidence harness; progress rows, phase scripts/logging, epic reviews, phase gate packs, Playwright evidence config, and en/ar light/dark journeys across the plan and skills.
2. F-verifier-1 / F-DB-4 / F-verifier-5 — move the enrollment ledger schema into Phase 2 and webhook tables into Phase 3; add migration/order gates.

Majors:

3. F-SKILL-1 / F-DB-6 — replace nonexistent Django composite-FK API with RunSQL in both skill trees.
4. F-DB-1 — correct manager/queryset chaining in django-backend.
5. F-DB-2 — make outbox Celery access legal and audited under the fence.
6. F-DB-3 / F-verifier-3 — remove base UUID PK and document concrete UUID/BigAutoField choices everywhere.
7. F-DB-5 / F-verifier-2 — replace import grep with AST attribute-access fence.
8. F-PLAN-1 — schedule owner/manager location CRUD and tests.
9. F-PLAN-2 — schedule customer privacy deletion, audit, and pass void.
10. F-REQ-1 — correct requirements naming to ADR-44.
11. F-GOLIVE-1 — add backup/restore, monitoring, and legal/privacy go-live checks.
12. F-MISSING-1 through F-MISSING-6, F-MISSING-9, F-MISSING-11, F-MISSING-12, F-CONSISTENCY-1 through F-CONSISTENCY-7, F-CONSISTENCY-11, F-CONSISTENCY-13, and F-CONSISTENCY-16 — add the consolidated operational ADRs and stale-document binding headers/corrections as specified above.

Minors:

13. F-SKILL-2, F-FE-1, F-FE-2, F-I18N-1, F-COV-4, F-COV-5 — correct tenant money source, timeout example, polling rule, bilingual editor, mixed-direction test, and out-of-scope counter test.
14. F-DB-7, F-DB-8, F-MISSING-7, F-MISSING-8, F-MISSING-10, F-MISSING-13, F-MISSING-14, F-CONSISTENCY-8/9/10, F-PLAN-3/4/5, and F-REVIEW-11 — apply the accepted operational, wording, phase-diagram, task-sizing, pass-flag, and issuance-document fixes.
15. F-COV-1/2/3 and custom labels — explicitly defer or separately schedule these non-brief surfaces; do not silently claim MVP coverage.

## Confidence

- Tenant isolation and ledger sequencing: high confidence that the blockers/majors are real (0.97); the current design is not buildable until F-DB-2/4/5/6 are fixed.
- MVP/product coverage: high confidence (0.93) for location CRUD and privacy deletion; medium-high (0.84) for email verification, account deletion, and single-customer messaging because the brief does not mandate them.
- Frontend/RTL/evidence pipeline: high confidence (0.99); the common brief is explicit and the plan is ar-only in multiple executable test descriptions.
- Operational completeness: medium-high confidence (0.90); proposed retention, thresholds, provider, and deployment choices require owner/operations/legal confirmation, so they are accepted as missing decisions but not as mandatory exact values.
- Existing ADR coherence: medium-high confidence (0.88) after amendments; ADR intent is coherent, but stale round-1 examples and contradictory skill snippets remain dangerous until the chair applies the ordered list.

Counts after deduplication: 2 blocker bundles, 12 major bundles, and 3 minor/documentation bundles in the ordered list; the count is by consolidated chair action, not by source finding ID. No reviewer file was missing, so the verifier gate is PASS for adjudication and does not certify the unamended plan.
