# Verifier review

## Summary

Evidence is sufficient to gate the four worker reports, but not to accept them unchanged. The requirements, backend, frontend, data-model, and draft-skill reports cover the requested product scope and cite the key official wallet documentation. The chair must apply the corrections below before treating the design as build-ready, especially the cross-report authentication decision, tenant scoping of every model, ledger/pass model consistency, and the skill-output validation path.

Verdict: PASS WITH REQUIRED SYNTHESIS CORRECTIONS.

Official documentation spot checks:
- Django 5.2 is an LTS release: https://docs.djangoproject.com/en/5.2/releases/5.2/
- Apple PassKit pass creation and relevant locations (maximum ten): https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html
- Apple pass updates: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Updating.html
- Google Wallet REST resource/class list and class/object operations: https://developers.google.com/wallet/reference/rest
- Google class/object and JWT issuance flow: https://developers.google.com/wallet/retail/loyalty-cards/overview/add-to-google-wallet-flow
- Celery 5.6 task retry/idempotency behavior: https://docs.celeryq.dev/en/stable/userguide/tasks.html

## Decision verdicts

| Claim / decision | Source member | Status | Evidence and ruling |
|---|---|---|---|
| One shared PostgreSQL schema with tenant_id and Django enforcement | Requirements, data-model, backend | AGREE WITH CHANGES | Correctly matches the fixed stack and requirements. It is safe only if every tenant-owned model has tenant_id, every relation checks same tenant, and there is no unrestricted default manager. Add defense-in-depth tests and preferably DB constraints for cross-tenant relations. |
| Session cookies for dashboard; HMAC for tenant API | Backend | AGREE | Appropriate separation: browser session + CSRF and non-browser signed requests. The API credential must authenticate HMAC directly, not JWT. |
| Tenant API uses JWT | Data-model | WRONG | Conflicts with backend, requirements' credential-per-tenant seam, and draft skill, all of which specify HMAC. Pick HMAC for the MVP and remove JWT as the tenant API mechanism. |
| Self-sign Apple and Google passes | Requirements, backend, data-model | AGREE WITH CHANGES | Meets the explicit MVP requirement and preserves control. Add operational acceptance criteria for Apple certificate/pass-type provisioning, APNs authentication, Google issuer approval/service-account rotation, key storage, and per-tenant branding under the shared issuer. |
| Ledger is source of truth; pass is a projection | Requirements, backend, data-model, frontend | AGREE WITH CHANGES | Correct. Do not update a balance and ledger in mismatched paths. The projection task must receive a pass ID or canonical tenant-scoped ID and be idempotent. |
| API version from day one | Backend | AGREE WITH CHANGES | Correct principle, but the report contains both `/pi/v1/` (typo) and `/api/v1/`. Standardize on `/api/v1/` in the final plan and examples. |
| No public signup or subscription billing before final phase | Requirements, backend, frontend | CONFIRMED | Consistent throughout; P8 is the final phase and commercial terms remain offline before then. |
| Relevant locations are MVP and program-level | Requirements, data-model, backend | AGREE WITH CHANGES | Correct requirement and Apple supports up to ten relevant locations. Enforce the ten-location limit at validation time, and ensure pass-specific location projection is explicit if a customer pass can differ from its program. |
| Event ticket and boarding pass are later phases on the same pipeline | Requirements, data-model, backend | AGREE WITH CHANGES | Correct phase placement. The current schema has preliminary configs, but must define the common signer/interface and acceptance tests now; do not imply those later classes are fully issuable in MVP. |
| Google has seven current classes: loyalty, offer, gift card, event ticket, flight, transit, generic | Requirements, data-model | CONFIRMED | Matches the official REST reference spot check. Preserve Apple/Google asymmetry explicitly. |
| Frontend uses `?loc=` as a server-enforced filter | Frontend | CONFIRMED | Correctly states URL context is not authorization. Backend must enforce it on every relevant queryset and reject unauthorized IDs. |
| Idempotency key on ledger mutations | Requirements, frontend, backend, data-model | AGREE WITH CHANGES | Correct invariant. Use one header contract (`Idempotency-Key`) or one body contract, not both; persist a request fingerprint so reuse with a different payload returns 409. Handle concurrent duplicate requests with the unique constraint and retry/read-after-integrity-error path. |
| Platform-admin may view all tenant data through `all_tenants()` | Data-model | PARTIAL | The unrestricted manager is a sharp escape hatch. Make it unavailable to ordinary application code, require explicit tenant selection and audited authorization, and never expose a generic all-tenants queryset to a request path. |
| One membership may contain one optional location | Data-model | PARTIAL | Requirements allow staff assigned to multiple locations. Replace the single nullable `location` FK with a membership-location join table or explicit many-to-many scope. |

## Conflicts between areas

1. Authentication conflict: data-model says tenant API JWT (data-model.md lines 80–82), while backend and django-backend skill say HMAC-signed API requests. Ruling: HMAC for the MVP tenant API, session cookies for dashboard, signed short-lived enrollment token for public enrollment. Do not put authorization scope in an untrusted JWT claim.
2. Identity conflict: backend examples refer to `CustomerProgramBalance`, while data-model's concrete model files use `Pass` as the balance holder. Ruling: choose a canonical model. Prefer a separate customer-program balance/ledger aggregate plus a pass projection, or explicitly make Pass the aggregate and rename every reference consistently. The final plan must not mix both.
3. Ledger relation conflict: `LedgerEntry` declares `pass_field`, but the narrative and queries refer to `pass`; the data-model pseudocode also uses `pass`. Ruling: use a Python field such as `pass_record` with database column `pass_id`, or another unambiguous name, and update all services, queries, serializers, and indexes.
4. Tenant-scoping conflict: the concrete `Pass` model has no tenant FK or TenantScopedManager; many concrete program child models (design, reward, enrollment field, program-location, beacon, links, custom fields, configs, push messages, settings) also lack direct tenant scoping. Ruling: every tenant-owned model must either carry tenant_id or use a rigorously constrained relation with a manager/queryset that scopes through the parent; direct tenant_id is preferred for the stated invariant.
5. API contract conflict: backend examples include `/api/v1/` but the decision heading says `/pi/v1/`; body names `quantity` and also examples contain misspellings (`progam_id`, `quatity`). Ruling: standardize the final contract and validate generated OpenAPI examples.
6. Capability conflict: requirements says coupon/generic use issue/void, while several generic ledger descriptions focus on balance fields. Ruling: style-specific commands and immutable event types must be explicit; coupon/generic must not be forced through stamp/points balance logic.

## Security and tenancy findings

- HIGH: `TenantScopedManager._current_tenant` is a process-global class attribute. In a threaded web server, one request can overwrite another request's tenant context. Use request/context-local storage (for example contextvars) and clear it reliably, or require explicit tenant-scoped querysets in services; test concurrent requests.
- HIGH: Concrete models without tenant managers permit accidental unscoped reads and cross-tenant relations. Add tenant FK/managers or a base model and relation validation for every tenant-owned table.
- HIGH: `ProgramLocation`, `ProgramBeacon`, and similar join rows do not prove that the program and location/beacon belong to the same tenant. Add composite tenant-aware constraints/validation and service checks; otherwise an ID from tenant B could be attached to tenant A's program.
- HIGH: `Pass` has no tenant column/manager and its customer/program foreign keys are independently declared. Validate customer.tenant == program.tenant and use tenant-scoped lookups.
- MEDIUM: `WebhookSubscription.secret` is stored in plaintext while API credential secrets are hashed. Store a write-only encrypted secret or a hash where verification permits; rotate and audit it. Never return it in serializers.
- MEDIUM: The signed enrollment token carries tenant_id and program_id. Signature validation prevents tampering, but the implementation must verify token expiry, active program, and that the referenced program belongs to the signed tenant; rate-limit and avoid PII in the token.
- MEDIUM: Object-storage image keys are free-form strings. Generate tenant-prefixed keys server-side and authorize reads/writes through the program tenant; do not accept arbitrary bucket paths.
- MEDIUM: Platform-admin impersonation/tenant selection must be explicit, audited, and time-bounded. `all_tenants()` must not be callable from generic viewsets.
- Location scope is underspecified for a user working at two locations. Implement a membership-location join and apply it to customer discovery, ledger writes, analytics, exports, and program/location management.

## Ledger and pass findings

- HIGH: `LedgerEntry.quantity` is PositiveIntegerField and event direction is encoded by event type, but the concrete service examples use negative quantity for redeem and then `abs(quantity)`. Make the service take a positive quantity plus event type and compute signed balance transition centrally. Add DB/service tests for earn, redeem, issue, void, and concurrent duplicate requests.
- HIGH: `LedgerEntry.new_balance >= 0` alone does not prove the transition. Enforce `new_balance = previous_balance + signed_delta` in the service and immutable-row policy; add reconciliation tests/jobs.
- HIGH: The models expose `Pass.stamps_earned` and `Pass.points_balance` as ordinary writable fields. The final design must prevent generic serializers/admin from patching them and route all mutations through ledger services.
- HIGH: Coupon/generic issue and void need no-stamp-balance semantics. Define whether `new_balance` is nullable for non-balance events or use a separate event payload/state transition; do not use zero as an ambiguous balance.
- HIGH: The append-only claim is procedural only. Revoke model/admin update/delete permissions and add database/audit enforcement where feasible; correction is a new event.
- HIGH: Enrollment creates a ledger event in the backend narrative, but idempotent enrollment and the customer/program uniqueness race need an explicit transaction and stable idempotency key.
- MEDIUM: After-commit pass updates are correct in principle. Include an outbox/pass-update record so task enqueue failure after commit is recoverable; Celery retries alone cannot recover a task that was never published.
- MEDIUM: Google Wallet updates are object PATCHes and issuance uses class/object plus signed JWT. Keep class/object IDs tenant-safe and make object update tasks idempotent. Apple updates require the web service/APNs/device-registration lifecycle, not merely rebuilding a `.pkpass` download.
- MEDIUM: Time-zone handling is correctly called out but the model must require IANA-zone validation and define “today” using the event location timezone, not server UTC.

## Model review

The Python files compile syntactically (`python -m py_compile ...` passed), but they are not yet a coherent runnable Django model set.

Corrections required:
- `Pass` must have tenant ownership, a manager, timestamps/constraints/indexes consistent with the data-model, and explicit relation checks.
- `LedgerEntry.pass_field` naming is inconsistent with all surrounding code; standardize it.
- `Membership.location` supports only one location, contrary to the stated dual-location requirement.
- The model files import modules with relative imports but do not present a complete Django app layout/configuration; label them as illustrative drafts, not directly migration-ready code.
- `ProgramDesign`, `Reward`, `EnrollmentField`, `ProgramLocation`, `ProgramBeacon`, `UsefulLink`, `CustomField`, `StampImage`, all style config models, `PushMessage`, and `ProgramSettings` need tenant-safe query/access rules and cross-parent tenant validation.
- Program model has both generic stamp fields and `StoreCardConfig` stamp fields. Choose one source of truth; duplicate writable rule fields will drift.
- Data-model prose has several corruption/typo indicators (`Asia/Kuwaitt`, `is_delleted`, `..first()`, `requ...`, `Limitted`, `Insuffic ientBalance`). Correct all in the synthesis and do not copy these into code.
- The data-model says platform admins have “no access to tenant data without explicit tenant selection,” but the manager's `all_tenants()` is unguarded. Make the enforcement concrete.
- Check constraints should include valid status/event combinations and nonnegative values where applicable; `PositiveIntegerField` does not replace business transition tests.

## Skill review

- The draft skill content is substantively useful and aligned on “never trust tenant_id,” services, idempotency, Celery, and tests.
- Validation command run against `plan/skill-drafts` failed because that directory does not contain `.cursor/skills` or `.claude/skills`; the brief's validator command targets the final `plan/skills` directory. The worker claims validation, but the reported command cannot be independently reproduced from the draft directory. Chair must copy/finalize skills into the required `.cursor/skills/<name>/SKILL.md` and `.claude/skills/<name>/SKILL.md` layout and rerun `node /Users/fahad/council/check-skills.mjs /Users/fahad/council/output/plan/skills`.
- `django-backend.md` uses `TenantManager` while the concrete model draft uses `TenantScopedManager`; choose one name.
- `django-backend.md` examples contain `quantityt` and model names (`StaffProfile`, `ApplePass`, `CustomerProgramBalance`) not present in the concrete model drafts. Replace examples with the canonical model/service names.
- Skill drafts should include a concrete “add a tenant-scoped model / add a new pass style / add an API endpoint” checklist and the required cross-tenant relation test.
- i18n rules are directionally correct. Require RTL tests for enrollment and dashboard, Arabic plural tests, KWD three-decimal formatting, and location timezone formatting.

## Scope review

CONFIRMED:
- Platform-admin provisioning of tenant, owner, and first location is MVP.
- Store-card stamps and points, coupon, generic pass, enrollment link/QR, Apple and Google issuance, relevant locations, customer list, pass status, ledger, basic analytics, API credential, signed webhook seam, and CSV export are MVP.
- Event ticket, boarding pass, beacons, campaigns, automations/referrals/tiers, named connectors, developer portal, white-label, public signup, and subscription billing are later in the stated order.
- No Apple style or Google class is marked out of product scope. Apple/Google asymmetries are acknowledged.

Missing or under-specified MVP acceptance criteria:
- Platform-admin provisioning and owner credential setup flow, including Arabic/English and audit event.
- API credential creation/rotation/revocation and HMAC canonical request/signature/replay-window contract.
- Webhook delivery idempotency, signature format, retries, dead-letter visibility, and event IDs.
- Customer migration/import promised by the account-opening table but not clearly bounded with validation, deduplication, and balance provenance.
- Pass update status/outbox recovery and Apple device-registration/web-service endpoints.
- Store-card points rule semantics are not as complete as stamp semantics; specify earn basis, redemption unit, precision (integer points), and concurrency.
- Void authorization and state transitions for each pass style; coupon one-time use must be atomic.
- Ten-location Apple relevance limit and behavior when a tenant attaches more than ten locations.
- Location-scoped exports and analytics privacy rules.

The plan correctly avoids named POS connectors in MVP and does not introduce customer payments or SaaS billing early.

## Missing links/features discovered

- Add a canonical link from the public enrollment record to the issued Apple serial/device registrations and Google object ID, with revocation/update status.
- Add an outbox or durable pass-update record between ledger commit and Celery enqueue.
- Add audit events for platform-admin provisioning, credential rotation, impersonation, program publication, void, and data export.
- Add explicit tenant-consistency constraints for every multi-parent relation (customer/program/pass/location/beacon).
- Add a staff-location join model and tests for a staff member assigned to two locations.
- Add API rate limits and enrollment abuse protection as acceptance criteria.
- Add a documented policy for Apple/Google issuer credential scope and per-tenant branding under a shared platform issuer.

## Disagreements and ruling

- HMAC versus JWT for tenant API: backend/skill wins; HMAC is the required MVP contract. Data-model JWT claim is rejected.
- Pass versus CustomerProgramBalance as balance aggregate: neither report wins as written. Chair must choose one canonical aggregate and update every report/skill/example consistently; pass remains a projection if following the stated source-of-truth rule.
- Single location FK versus multiple locations: requirements wins. Use a join table/many-to-many scope.
- Program-level locations versus per-pass locations: program-level is the MVP default, but the projection should permit an explicit per-pass subset and enforce Apple's maximum.
- Self-sign versus provider: self-sign wins because it is an explicit decision requirement and keeps the MVP issuer pipeline under product control, provided the operational key-management work is included.
- Skill validator evidence: worker claims are not reproducible against drafts; final skill tree validation is required before synthesis is accepted.

## Confidence scores

- Requirements and release scope: 0.93
- Apple/Google pass capability mapping: 0.90
- Backend/API architecture: 0.78 (good coverage, but auth and API contract conflicts)
- Data model and tenancy safety: 0.55 (substantial inconsistencies and missing tenant scope)
- Ledger integrity and pass projection: 0.62 (correct intent, incomplete enforceable model)
- Frontend architecture and i18n/RTL: 0.86
- Skill drafts and conventions: 0.68 (useful content, inconsistent names and validator-path evidence)
- Overall final-map readiness before chair corrections: 0.70

## Gate

PASS WITH REQUIRED SYNTHESIS CORRECTIONS. Evidence is sufficient for the chair to synthesize; the gate is not approval to ship the drafts verbatim.
