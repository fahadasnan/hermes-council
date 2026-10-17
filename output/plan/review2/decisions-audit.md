# Decisions and conventions audit

Auditor: linker (Hermes Agent). Date: 2026-10-17. Based on brief /Users/fahad/council/output/plan/review2/briefs/decisions-audit.md.

Mermaid validation: CONVENTIONS.md (1 diagram OK), decisions.md (0 blocks), data-model.md (4 OK), backend.md (4 OK), frontend.md (2 OK), IMPLEMENTATION_PLAN.md (2 OK). Skills validation: 7 skills OK, .cursor/.claude copies identical.

---

## Part 1: Per-ADR verdicts (ADR-1 through ADR-44)

### ADR-1: Tenant API HMAC — KEEP
- The decision is correct. HMAC is simpler than JWT for server-to-server integration, avoids refresh/rotation machinery, and mirrors the signed-webhook return path.
- Evidence: backend.md proposed HMAC; data-model.md proposed JWT (overruled); verifier ruled HMAC, ADR-1 adopts the ruling.
- Web verification: HMAC for API auth is a standard pattern used by Stripe, AWS, etc. No concerns.

### ADR-2: Dashboard session cookies — KEEP
- Correct for a same-origin SPA. Escape hatch to JWT in httpOnly cookies if origins diverge is documented.
- Evidence: PD-BACKEND-2, PD-DM-2 (in part). No contradiction in any downstream document.

### ADR-3: Stable public enrollment URL — KEEP
- Correct for printed QR codes that cannot expire. The optional signed `?t=` location tag is a clean attribution mechanism.
- Evidence: amends backend §3.4's short-lived-token approach. Verifier MEDIUM finding resolved.

### ADR-4: Balance as canonical aggregate — KEEP
- The correct architecture choice. Separating balance from pass projection prevents coupon/ticket programs carrying dead balance columns and makes concurrency control single-target.
- Evidence: resolved verifier conflict 2. data-model.md's Pass.stamps_earned/points_balance and backend.md's CustomerProgramBalance are both superseded.

### ADR-5: LedgerEntry naming — KEEP
- `pass_record` resolves the `pass` ambiguity cleanly. The check constraint pairing for balance/non-balance events is well-designed.
- Evidence: all skills use canonical names. CONVENTIONS.md §3 documents the exception.

### ADR-6: Immutable event types, positive quantity — KEEP
- Signed delta in one place (`_signed_delta`) eliminates the direction bugs seen in the round 1 drafts.
- Evidence: the draft services used negative quantity and `abs()` — this ADR fixes that root cause.

### ADR-7: Stamp reward auto-issue — KEEP
- Consuming from cycle counter preserves auditability. The reward_issued entry stores the cycle number. `stamps_lifetime` is untouched — correct.
- Evidence: fully specified now (verifier gap "points rule semantics incomplete").

### ADR-8: Append-only enforced — KEEP
- Three-layer enforcement (trigger, model save/delete, reconciliation) is the right depth. The nightly reconciliation job is especially valuable as the long-stop guarantee.
- Evidence: backed by PostgreSQL trigger via `RunSQL`, reconciliation compares Balance against SUM over ledger.

### ADR-9: Enrollment one transaction + idempotency — KEEP
- Server-derived idempotency key (`enroll:{enrollment_id}`) is correct for an anonymous public page.
- Evidence: unique constraints on Enrollment and Pass catch concurrent duplicates. Idempotent replay returns existing pass.

### ADR-10: Direct tenant_id + composite FKs — KEEP
- Critical for safety. The composite FK pattern (child stores `(parent_id, tenant_id)` referencing parent's `UNIQUE(id, tenant_id)`) is the strongest DB-level isolation without RLS.
- Evidence: verifier HIGH findings 2-4. This is the single most important tenancy decision. The django-data skill documents the checklist.

### ADR-11: Contextvar tenant context, fail-closed manager — KEEP
- contextvars is the correct choice over thread-locals (breaks under async/threaded servers). Fail-closed (`none()` on reads, raise on writes) is essential.
- Evidence: verifier HIGH finding 1. Web verification: contextvars is Python's standard for request-scoped state; Django's own signal dispatcher uses them. django-boundary (a third-party library) uses the same pattern.

### ADR-12: MembershipLocation M2M — KEEP
- Matches the brief ("staff at two or more locations"). The empty-set-means-all-locations rule for owner/manager is pragmatic.
- Evidence: requirements §2 explicitly requires multi-location staff. data-model.md's single nullable FK overruled.

### ADR-13: Idempotency-Key header with fingerprint — KEEP
- One contract for all clients (dashboard, counter, tenant API). The fingerprint-based conflict detection closes the "same key, different payload" ambiguity.
- Evidence: header-vs-body split resolved. Unique constraint on (tenant, idempotency_key) backs it.

### ADR-14: /api/v1/ everywhere — KEEP
- Fixes the `/pi/v1/` typo and unversioned frontend paths. URL versioning is the right choice (cache-friendly, visible in every log and request).
- Evidence: round 1 conflict 5 resolved. OpenAPI published from day one increases confidence.

### ADR-15: Program-level locations cap 10 — KEEP
- Apple's hard limit. Per-pass location subsets deferred to a later phase (correct: no MVP requirement).
- Evidence: Apple documentation confirms max 10. Web search confirms: "Each Apple Wallet pass can contain a maximum of 10 locations."

### ADR-16: Per-style config tables — KEEP
- Removes the `stamps_required` mirroring bug where `Program` and `StoreCardConfig` both held it. Queries join the config table.
- Evidence: verifier model review caught the duplication. Per-style tables are the right pattern for future style extensibility.

### ADR-17: Durable outbox — KEEP
- Critical for reliability. `transaction.on_commit(.delay())` alone loses tasks if the broker is down. The outbox row written in the same transaction is recoverable.
- Evidence: verifier MEDIUM finding. Sweeper re-enqueues every 60s. Dead-letter visible to tenant.

### ADR-18: Encrypted webhook secrets, hashed credential secrets — KEEP
- Correct asymmetry: we must produce HMAC signatures for webhooks, so webhook secrets need reversible encryption (Fernet). Credentials only need verification, so hashed (bcrypt). Rotation with grace window is standard.
- Evidence: verifier MEDIUM finding. Rotation grace window prevents POS interruption.

### ADR-19: Platform admin impersonation — KEEP
- Support sessions with explicit reason, time-bound expiry, and audit events. No god-mode viewset.
- Evidence: verifier PARTIAL ruling resolved. `cross_tenant` fenced and import-restricted.

### ADR-20: Server-generated tenant-prefixed object storage keys — KEEP
- Private bucket with short-lived signed URLs. Client never supplies a path. Correct.
- Evidence: verifier MEDIUM finding.

### ADR-21: Integer minor units for money — KEEP
- Correct for Gulf currencies: KWD and BHD have 3 decimals; SAR/AED/QAR have 2. A fixed `DecimalField(12,3)` would misrepresent 2-decimal currencies.
- Evidence: requirements NFR vs data-model conflict resolved. Serialized as decimal STRING with currency code. Web verification: KWD/BHD = 3 decimals (1000 fils per dinar), SAR/AED/QAR = 2 decimals (100 halalas/fils per riyal/dirham).

### ADR-22: UTC storage, IANA zone validation, location-local "today" — KEEP
- Fixes the `Asia/Kuwaitt` typo in data-model.md. Location-timezone day buckets are correct for analytics.
- Evidence: verifier MEDIUM finding. IANA validation via `zoneinfo.available_timezones()`.

### ADR-23: Apple style canonical, Google class derived — KEEP
- The mapping is complete and asymmetry is explicitly handled. The `google_class_for()` derivation function is testable.
- Evidence: verifier CONFIRMED the seven Google classes. Adding a style adds a projection function and derivation entry.

### ADR-24: Self-sign with ops criteria — KEEP
- The right business decision: no per-pass cost, full design control. Phase 2 exit criteria make the operational work explicit.
- Evidence: verifier AGREE WITH CHANGES. Web verification: Apple Pass Type ID certificates expire annually and must be replaced. Apple confirms: "If your certificate expires... you'll no longer be able to sign new passes or send updates."
- Minor concern: the ops criteria are listed as acceptance criteria in Phase 2 but the IMPLEMENTATION_PLAN.md Phase 2 backlog does not have a dedicated epic/task for the cert-expiry calendar alert and runbook. The Phase 2 acceptance criteria text mentions them but the backlog tasks don't include an ops item for it. See F-CONSISTENCY-3.

### ADR-25: Event ticket/boarding pass ride MVP pipeline — KEEP
- The style-additivity contract test makes the interface explicit. 422 on creation of those styles in MVP is correct.
- Evidence: verifier AGREE WITH CHANGES. `relevantDate` plumbing exists in MVP schema.

### ADR-26: One Program model — KEEP
- Uncontroversial. Per-style config tables (ADR-16) handle the variance.

### ADR-27: Cached and reconciled balances — KEEP
- Realized through ADR-4/6/8. `select_for_update` + non-negative checks + nightly reconciliation = sound.

### ADR-28: No plans/billing before P8 — KEEP
- Correct per the brief. Gate keys default unlimited. Criteria documented for P8 provider choice (KNET/card, KWD 3dp, GCC presence). Candidates noted: Stripe, Tap Payments, MyFatoorah.

### ADR-29: CSV export standard from MVP — KEEP
- Correct: GCC businesses demand data portability. Location-scoped exports is a verifier-adopted acceptance criterion.

### ADR-30: Analytics with location/staff filters — KEEP
- Closing the gap the evidence product never closed. Filters from day one, events already carry both dimensions.

### ADR-31: Void authorization — KEEP
- Coupon void allowed for staff as part of atomic redeem+void. Standalone voids require manager+. State machine: issued→voided|expired, terminal.

### ADR-32: Shared schema with tenant_id, no RLS — KEEP
- The right choice for Django. RLS moves logic to SQL, complicates migrations. The DB constraints carry the hard rules; Django carries the rest.
- Evidence: Composite FKs (ADR-10) + contextvars (ADR-11) + model-enumeration test = sufficient defense.
- Web verification: django-boundary library uses the same contextvars + ORM pattern without RLS.

### ADR-33: Hybrid IDs — KEEP
- UUIDv4 for public-facing, bigserial for internal join tables. Standard pattern for this trade-off.

### ADR-34: Soft/hard delete — KEEP with amendment note
- Customer soft-delete + PII nulling for privacy is correct. Programs: drafts soft-delete, published → pause/archive. Passes never hard-deleted while devices exist. Ledger never deleted.
- **But**: The original PD-DM-5 proposal was "Programs and passes are hard-deleted" — the ADR correctly amended this. The amendment should be explicitly cited in the mapping table as "amended" rather than just "Accepted with changes" since the proposal was substantively wrong for published programs.

### ADR-35: pnpm workspace — KEEP
- Two Vite apps (dashboard + enrollment) with shared packages. Cross-import ban enforced by eslint.

### ADR-36: TanStack Query + polling — KEEP
- Polling pass-push status every 3s. No websocket infrastructure. Correct for MVP.

### ADR-37: RHF + Zod mirrors — KEEP
- Hand-mirrored validators with OpenAPI codegen deferred. PR review checks drift. Correct staging.

### ADR-38: Client idempotency key — KEEP
- `crypto.randomUUID()` at press time, reused on retry. Timeout → "sent, unconfirmed" → re-query. Correct.

### ADR-39: i18next + Arabic six-form plurals + RTL — KEEP
- Correct for the market. Key-parity CI gate. All formatting through `Intl`. Playwright RTL journeys for both dashboard and enrollment. Verifier test requirements adopted.

### ADR-40: ?loc= search param — KEEP
- URL-resident, shareable, server-validated. Correct.

### ADR-41: QueryState + design-skill primitives — KEEP
- Correct separation of concerns. Features compose, never restyle.

### ADR-42: Audit event stream — KEEP
- Append-only, separate from ledger, owner-visible for their tenant. Covers provisioning, suspension, credential rotation, void, export, PII deletion.

### ADR-43: Rate limits — KEEP
- Defaults are reasonable. Enrollment 20/min/IP + 60/hour/program. Earn 60/min/staff. Tenant API 120/min/credential. Enrollment honeypot + form-age checks as additional protections.

### ADR-44: Canonical naming — KEEP
- Binding names table at top of decisions.md. Draft model files (`django/*.py`) labeled as illustrative only. Skills use canonical names. This is the synthesis glue.

---

## Part 2: Missing ADRs — decisions the project needs that have no ADR

### F-MISSING-1: Database backup and restore policy
- Severity: major
- Location: no ADR exists; closest mention is go-live checklist item 9 ("Database rollback = restore point + outbox replay")
- Problem: There is no ADR defining backup frequency, retention, point-in-time recovery, restore procedure, or RPO/RTO targets. The go-live checklist mentions "restore point" in passing but does not specify what it is.
- Evidence: ADR-8 mentions reconciliation but not backup. IMPLEMENTATION_PLAN.md Phase 0 has no backup task.
- Fix: Add ADR-45: "PostgreSQL backups via pg_dump or WAL archiving every hour with 30-day retention; point-in-time recovery tested quarterly; restores follow a documented runbook that includes outbox replay."
- Affects: IMPLEMENTATION_PLAN.md Phase 0 (add backup task), go-live checklist

### F-MISSING-2: Audit log retention and pruning
- Severity: major
- Location: ADR-42 defines what is audited but not retention
- Problem: Audit events grow unboundedly. No pruning policy, no archiving strategy. GDPR may require deletion of audit data after a retention period.
- Evidence: ADR-42 only defines the schema, not lifecycle. No mention of retention in any ADR.
- Fix: Add to ADR-42 or create ADR-45: "Audit events retained for 7 years (GCC regulatory minimum); automated archival to cold storage after 2 years; PII-related audit rows deleted alongside the customer's PII erasure request."
- Affects: audit app, IMPLEMENTATION_PLAN.md Phase 4

### F-MISSING-3: Search strategy
- Severity: major
- Location: no ADR exists
- Problem: Counter tool needs fast pass-code lookup; customer list needs name/phone search; analytics needs filtering. Postgres ILIKE won't scale past thousands of rows; no full-text search or external search service is specified.
- Evidence: frontend.md §6 mentions debounced search. CONVENTIONS.md §4 says "Transaction lists are server-side searchable/filterable." No underlying search mechanism.
- Fix: Add ADR-46: "MVP uses PostgreSQL `tsvector` with a generated column on Customer (name, email, mobile) and basic `LIKE` on pass codes. Vector indexes created in Phase 0. Elasticsearch/Meilisearch deferred to a tenant-growth trigger."
- Affects: Phase 0 (tsvector migration), django-data skill (add search index conventions)

### F-MISSING-4: Feature flags
- Severity: major
- Location: no formal ADR; ADR-28 mentions "gate keys may exist in config but default unlimited"
- Problem: The plan references "gate keys" and "feature flags" (ADR-28, IMPLEMENTATION_PLAN.md Phase 13) but no ADR defines the mechanism. Will flags be database-driven, environment-variable-driven, or a third-party service? How are they toggled without deploy? How are they tested?
- Evidence: IMPLEMENTATION_PLAN.md Phase 13: "limit-check middleware reading plan config"; Phase 12: "NFC-disabled builds emit no `nfc` key"
- Fix: Add ADR-47: "Feature flags live in a `tenant_features` table (jsonb column `gates`); defaults from Django settings with env-var overrides for platform-wide flags. Tenant-scoped flags are overridable per tenant via a platform-admin screen. Flag checks are cheap (cached in Redis with 60s TTL) and never block a ledger write."
- Affects: tenants app, platform-admin screens, Phase 0 (flag cache infrastructure)

### F-MISSING-5: Environments and deployment topology
- Severity: major
- Location: backend.md §7 covers some environment details but no ADR exists
- Problem: No ADR defines the environment topology (development, staging, production), deploy strategy (blue-green? rolling?), staging data policy (anonymized prod? synthetic?), or promotion gates. The plan operates on "CI green = deployable" but doesn't say how.
- Evidence: IMPLEMENTATION_PLAN.md Phase 0 mentions "k8s/helm skeletons" but no environment topology. backend.md §7.1 mentions Docker Compose for dev but no environment ADR.
- Fix: Add ADR-48: "Environments: development (local Docker Compose), staging (K8s, sandbox wallet certs, synthetic data only), production (K8s, real certs, real data). Deploy strategy: blue-green via K8s deployments. Staging promotion gate: CI green + smoke tests + wallet sandbox tests. Database: staging gets a synthetic seed, never prod data."
- Affects: IMPLEMENTATION_PLAN.md (add environment setup tasks), deploy/ directory

### F-MISSING-6: Email deliverability and sender identity
- Severity: major
- Location: no ADR; Phase 1 mentions "send credential-setup email (console backend in dev)"
- Problem: The owner credential-setup email is a critical path (no email = owner can't log in). No ADR covers email provider, sender identity, bounce handling, or the fact that Phase 12 adds tenant-branded email.
- Evidence: Phase 1: "Send credential-setup email." Phase 12: "Existing email tasks switch to the tenant's branded templates." No ADR for the email pipeline.
- Fix: Add ADR-49: "Transactional email via a provider (Postmark/SendGrid/SES) with a shared sender identity in MVP. Per-tenant sender identity arrives with white-label (Phase 12). Bounces are logged and surfaced in the audit log. Credential-setup links expire in 24h with a resend action."
- Affects: Phase 1 (email task), Phase 12 (branded email)

### F-MISSING-7: Celery queue design and task routing
- Severity: minor
- Location: backend.md §6.1 covers basic config but no ADR
- Problem: Queue design affects reliability: should pass pushes be on a separate queue from webhooks? What happens if the pass-push queue backs up? The backend draft says `-Q default,pass_push,webhooks` but this should be an ADR.
- Evidence: backend.md §6.1: "celery -A config worker -Q default,pass_push,webhooks -c 4"
- Fix: Add ADR-50: "Three queues: `default` (beat jobs: sweep_outbox, reconcile, purge), `pass_push` (Apple APNs, Google Wallet PATCH), `webhooks` (outbound delivery). Workers are deployed separately: one process pool for default+webhooks, one for pass_push (APNs rate limits are queue-local). Task routing is explicit per queue in task definitions."
- Affects: backend.md §6, celery.py config

### F-MISSING-8: Image processing for pass assets
- Severity: minor
- Location: no ADR; data-model.md defines image fields but not processing
- Problem: Apple Wallet requires specific image dimensions per style. The plan says "upload → return key" but does not specify resizing, format conversion, or rejection of wrong sizes before upload.
- Evidence: requirements §1: "Supported images: logo, icon, strip" per style. Apple's documentation specifies exact dimensions.
- Fix: Add ADR-51: "Uploads are validated server-side for type (PNG), dimensions (per style from Apple's documented sizes), and size (max 1 MB). Server resizes to exact required dimensions if within a tolerance band; rejects if too far off. Thumbnails generated server-side. Original never stored."
- Affects: uploads service, program editor validation

### F-MISSING-9: Customer deduplication strategy
- Severity: major
- Location: ADR-9 mentions "dedupe lookup on the tenant's configured unique field(s)" but no ADR defines how the tenant configures this
- Problem: Customer deduplication is critical (US-ENR-3). What fields can be chosen as unique? Mobile? Email? Both? What if the tenant picks mobile but a customer has no phone? How are existing duplicates handled?
- Evidence: ADR-9: "tenant's configured unique field(s) (e.g. normalized mobile or email)." requirements.md §2: "Customers are shared tenant-wide... dedupe on the tenant's configured unique fields."
- Fix: Add ADR-52: "Each program's EnrollmentField with `is_unique=true` becomes a deduplication field for that program's enrollment. Tenant-wide deduplication uses a tenant-level setting: `unique_customer_fields` (ordered list, default ['mobile']). Enrollment lookup normalizes (mobile: E.164, email: lowercase) and matches any configured field. If a match is found, the enrollment joins the existing customer. If a program requires a field not present on the matched customer, it prompts for the missing data."
- Affects: customers app, enrollment service, EnrollmentField model

### F-MISSING-10: Database migration policy
- Severity: minor
- Location: no ADR; CONVENTIONS.md §10 requires PR checklist item "Migrations reviewed by hand (constraint names, no destructive ops without a plan)"
- Problem: No policy on forward-only vs rollback, zero-downtime migrations, or how to handle data migrations for large tables.
- Fix: Add ADR-53: "Migrations are forward-only. Rollback = deploy previous version + migration to undo. No data migrations in schema migrations (use management commands). Destructive operations (column drops, table drops) require a two-deploy cycle: (1) stop writing the column, (2) next deploy drops it. `makemigrations --check` in CI."
- Affects: CONVENTIONS.md §10, django-data skill

### F-MISSING-11: PII handling and privacy
- Severity: major
- Location: ADR-34 covers Customer soft-delete; ADR-9 mentions PII not in URL; but no standalone privacy ADR
- Problem: GDPR-like requirements (privacy NFR) are scattered. Staff PII masking is defined in one place (CONVENTIONS §5, data-model §5.4), consent in another, customer deletion in ADR-34. No unified policy on what is PII, where it's stored, who can see it, and how long it's kept.
- Fix: Add ADR-54: "PII = name, email, mobile, enrollment data, device push tokens. Storage: encrypted at rest (Postgres TDE or volume encryption). Access: role-gated per the permissions matrix (§3 requirements). Masking: staff see first name + last initial; email/mobile masked `c***@example.com`. Deletion: soft-delete + PII nulling, ledger aggregates preserved. Device tokens deleted on unregister."
- Affects: customers app, permissions, enrollment service

### F-MISSING-12: Monitoring and alerting
- Severity: major
- Location: backend.md §8 covers health checks and Sentry but no ADR
- Problem: Production operations need defined alerting: what pages on-call? What are the SLOs? How is pass-push failure rate monitored?
- Fix: Add ADR-55: "Monitoring: structured logs to a central sink (ELK/Grafana Loki). Metrics: Counter earn p95 latency, pass push success rate, outbox dead-letter count, webhook delivery failure rate. Alerts: >5% pass push failure over 5 min → page; >0 dead letters for >30 min → page; DB connection pool >80% → warn. Health checks at /health/ready/ (DB + Redis + Celery ping)."
- Affects: Phase 0 (observability epic), ops runbooks

### F-MISSING-13: Time zone configuration for analytics
- Severity: minor
- Location: ADR-22 covers time zone storage and validation but does not specify how analytics day boundaries resolve when a tenant has multiple locations in different zones
- Problem: If a tenant has locations in Kuwait (UTC+3) and Dubai (UTC+4), a "daily" analytics view must pick a zone. ADR-22 says "the event location's timezone" for day buckets but analytics dashboards are tenant-wide.
- Evidence: ADR-22: "All analytics day buckets, 'today' filters... use the event location's timezone (falling back to tenant default when an event has no location)."
- Fix: Amend ADR-22: "Tenant-wide analytics use the tenant's default timezone for aggregation buckets. Per-location analytics use the location's timezone. The 'today' filter at dashboard level uses the tenant default timezone; at program level, the user picks a specific location's timezone. This is documented in the analytics screen, not hidden."
- Affects: ADR-22 text, analytics services

### F-MISSING-14: Cache strategy
- Severity: minor
- Location: no ADR; Redis is listed as "cache" in CONVENTIONS.md §1
- Problem: Redis is described as "Celery broker, result backend, cache" but what is cached? How long? What invalidation?
- Evidence: data-model.md §7.1: "cachable for 60s." No formal cache policy.
- Fix: Add ADR-56: "Cache: Django's Redis cache backend. Cached: program design for pass projection (60s), analytics aggregates (60s), tenant settings (300s), rate-limit counters. Never cached: ledger entries, balances, individual pass status. Cache keys are tenant-prefixed. Cache is best-effort; misses fall through to DB."
- Affects: Phase 0 (cache config), analytics services

### F-MISSING-15: GlowDesk coding pipeline integration
- Severity: blocker
- Location: no ADR; the common brief requires the GlowDesk pipeline to be written into the plan
- Problem: The common brief mandates: "Copy the rhythm, not the spa stack." The IMPLEMENTATION_PLAN.md does not incorporate:
  - Phase progress file (`plan/evidence/phase-<n>-progress.md`) with commit SHAs
  - Phase check scripts (`scripts/phase<n>-check.sh`) with logs in `/tmp/`
  - Evidence packs per epic (`plan/evidence/<epic>/REVIEW.md`)
  - Phase gate packs (`plan/evidence/phase-<n>-gates/GATES.md`)
  - Playwright evidence config
  - Phase 0 harness creation
  These are not suggestions; the brief says "This is a blocker if the plan or the skills leave it out."
- Evidence: Common brief lines 19-27. GlowDesk files show the exact pattern: `phase-10-progress.md` (one row per task with commit SHA), `phase10-check.sh` (logs to `/tmp/`), `10.1/REVIEW.md` (numbered evidence), `phase-5-gates/GATES.md` (gate matrix with exit codes). 
- Fix: The chair must write a new ADR (ADR-57) defining the evidence pipeline, update IMPLEMENTATION_PLAN.md Phase 0 to include harness creation, add the progress-file and check-script pattern to the feature-delivery skill, and add evidence-pack tasks to every phase's backlog. The exact GlowDesk artifacts to replicate:
  1. `plan/evidence/phase-<n>-progress.md` — created in Phase 0, one row per task with commit SHA
  2. `scripts/phase<n>-check.sh` — created in Phase 0, logs to `/tmp/phase<n>-check/`
  3. `plan/evidence/<epic>/REVIEW.md` + numbered evidence — last task of each epic
  4. `plan/evidence/phase-<n>-gates/GATES.md` + gate script + results — last task of each phase
  5. `apps/dashboard/playwright.evidence.config.ts` — Phase 0, patterned on GlowDesk's config
- Affects: IMPLEMENTATION_PLAN.md (all phases), feature-delivery and react-frontend skills, CONVENTIONS.md §9 (testing standards)

---

## Part 3: Consistency — contradictions between CONVENTIONS.md and other documents

### F-CONSISTENCY-1: backend.md uses rejected model names throughout
- Severity: major
- Location: CONVENTIONS.md §3 names table (binding) vs backend.md examples
- Problem: backend.md §2.1 uses `StaffProfile` (rejected), `ApplePass`/`GooglePass` (rejected), `CustomerProgramBalance` (rejected), `TenantManager` (rejected). Decisions.md ADR-44 explicitly rejects all of these. Section 12's skill draft reference uses `TenantManager`.
- Evidence: backend.md line 143: "StaffProfile"; line 147: "ApplePass, GooglePass"; line 166: "class TenantManager"; line 241: "CustomerProgramBalance.objects.select_for_update()". ADR-44: "Rejected variants... must not appear in new code."
- Fix: backend.md is a Round 1 plan deliverable and cannot be edited per the rules. However, the chair should add a header note to backend.md: "This file predates the ADR-44 naming rulings. Refer to decisions.md's canonical names table for binding names. The illustrative code examples in this file use names that were rejected in ADR synthesis."
- Affects: backend.md (add note), anyone reading backend.md without reading decisions.md first

### F-CONSISTENCY-2: backend.md uses thread-local instead of contextvars
- Severity: major
- Location: CONVENTIONS.md §5 rule 3 (contextvars) vs backend.md §2.2
- Problem: CONVENTIONS.md §5: "Tenant context is a contextvar set by middleware and reset in finally." backend.md §2.2 line 177: "`current_tenant` is a thread-local set by middleware." ADR-11 explicitly rejects thread-locals.
- Evidence: backend.md line 177: "thread-local set by middleware." ADR-11: "contextvars.ContextVar set by TenantMiddleware... not a bare thread-local (a process-global leaks across requests)."
- Fix: Same as F-CONSISTENCY-1 — add header note to backend.md.

### F-CONSISTENCY-3: backend.md enrollment endpoint uses short-lived token, contradicts ADR-3
- Severity: major
- Location: CONVENTIONS.md §1 (stable public URL) vs backend.md §3.4
- Problem: backend.md §3.4: "POST /api/v1/enroll/{signed_token}/" with a short-lived signed token. ADR-3: "The enrollment URL is `https://enroll.<domain>/{tenant_slug}/{program_slug}/`... carries no secret." ADR-3 explicitly says "The backend draft's 'signed token with tenant_id and program_id'... create a long-lived bearer credential in a public URL."
- Evidence: backend.md line 311-315. ADR-3: "Alternatives: signed token as the whole URL (rejected)."
- Fix: Add header note to backend.md. CONVENTIONS.md is correct.

### F-CONSISTENCY-4: backend.md money handling contradicts ADR-21
- Severity: major
- Location: CONVENTIONS.md §4 (decimal strings, integer minor units) vs backend.md service examples and data-model.md
- Problem: backend.md's earn service example (line 249-250) mutates `balance.current_stamps += quantity` directly — this treats stamps as integers on the Balance model (correct post-ADR-4), but the original data-model.md §4.1 says `DecimalField(12,3)` for money columns. data-model.md's Reward model uses `decimal(12,3)` for cost. ADR-21 overrules with `BigIntegerField` minor units.
- Evidence: data-model.md line 365: "cost | decimal(12,3) | NULL." ADR-21: "Money columns are BigIntegerField minor units plus the currency code."
- Fix: data-model.md needs the same header note. No editing per rules.

### F-CONSISTENCY-5: data-model.md Pass model has balance columns
- Severity: major
- Location: CONVENTIONS.md §7 (Balance separate from Pass) vs data-model.md §3.2 Pass table
- Problem: data-model.md line 479-480: Pass has `stamps_earned` and `points_balance` as writable fields. ADR-4: "Pass carries no balance columns." The data-model ERD (lines 193-196) even shows these columns.
- Evidence: data-model.md lines 479-480. ADR-4: "Pass carries no balance columns. It is the wallet projection."
- Fix: Add header note to data-model.md. The django-data skill correctly omits balance columns from Pass.

### F-CONSISTENCY-6: data-model.md Membership has single nullable location FK
- Severity: major
- Location: CONVENTIONS.md §5 rule 7 (MembershipLocation M2M) vs data-model.md §3.2 Membership
- Problem: data-model.md line 267: "location | FK -> Location | NULL | NULL = all locations for this tenant." ADR-12: "Membership(user, tenant, role, is_active) with a M2M locations through MembershipLocation."
- Evidence: data-model.md ERD line 127: "Membership ||--o| Location : scoped_to" (one-to-one-or-none). ADR-12: "a M2M locations through MembershipLocation."
- Fix: Add header note to data-model.md.

### F-CONSISTENCY-7: data-model.md uses JWT for tenant API
- Severity: major
- Location: CONVENTIONS.md §5 (server derives tenant from HMAC credential) vs data-model.md §2.2
- Problem: data-model.md line 81: "Tenant API: JWT auth. The JWT carries the tenant id." ADR-1: "The tenant API authenticates with an ApiCredential... and an HMAC-SHA256 signature."
- Evidence: data-model.md line 81. ADR-1: "No JWT anywhere in the MVP."
- Fix: Add header note.

### F-CONSISTENCY-8: data-model.md has `Asia/Kuwaitt` typo and other corruption
- Severity: minor (already caught by verifier)
- Location: CONVENTIONS.md vs data-model.md
- Problem: data-model.md line 222: `'Asia/Kuwaitt'` (extra 't'); line 446: `is_de leted` (space); line 596: `Insuffic ientBalance`; line 620: `..first()`; line 637: `abs(quan tity)`. All known from the verifier review. ADR-22 fixes the timezone typo; ADR-34 fixes the soft-delete field.
- Evidence: verifier model review. ADR-44: "typos like Asia/Kuwaitt, is_delleted, quantityt, progam_id, quatity."
- Fix: These are in data-model.md (round 1), not in any round 2 file. The ADRs have corrected the substantive errors.

### F-CONSISTENCY-9: backend.md API resource map has typos and non-canonical paths
- Severity: minor
- Location: CONVENTIONS.md §4 API conventions vs backend.md §3.1
- Problem: backend.md lines 195-218 contain: `{id)` (unmatched brace), `staf` (missing 'f'), `tenat` (missing 'n'), `location_maager`, `passt/webService`, `PssKit`, `aut token`, `enollment`, incorrect body field `idempotency_key` (should be header), and the enrollment URL uses `POST /enroll/{signed_token}/` which ADR-3 rejects.
- Evidence: Multiple lines in backend.md §3.1. ADR-14 fixes the `/pi/v1/` typo.
- Fix: Add header note.

### F-CONSISTENCY-10: frontend.md ledger endpoint path
- Severity: minor
- Location: CONVENTIONS.md §4 (verb sub-paths: `/api/v1/ledger/earn/`) vs frontend.md §4
- Problem: frontend.md line 97: "POST /api/ledger/entries" — uses `/api/` (unversioned), /entries (plural) rather than the canonical `/api/v1/ledger/earn/`. The diagram on line 211 also uses `/api/ledger/entries`.
- Evidence: frontend.md line 97: "POST /api/ledger/entries". CONVENTIONS.md §4: "POST /api/v1/ledger/earn/".
- Fix: Add header note to frontend.md. The frontend skill and ADR-14 use the correct path.

### F-CONSISTENCY-11: backend.md earn service uses `Pass` as balance holder
- Severity: major
- Location: CONVENTIONS.md §7 (Balance is separate) vs backend.md §3.2 earn example
- Problem: backend.md lines 240-291: the earn service acts on `CustomerProgramBalance` (rejected name) and mutates `stamps_earned` on it. ADR-4: "Balance (table balances) is the single cached aggregate." The service should lock and update a Balance row, not a Pass.
- Evidence: backend.md line 241: "CustomerProgramBalance.objects.select_for_update().get(...)" . ADR-4: "Balance rows are written only by ledger.services inside the same atomic block as the LedgerEntry."
- Fix: Add header note.

### F-CONSISTENCY-12: IMPLEMENTATION_PLAN.md Phase 2 says "no balance columns" on Pass but Phase 3's balance columns reference is unclear
- Severity: minor
- Location: IMPLEMENTATION_PLAN.md Phase 2 vs Phase 3
- Problem: Phase 2 explicitly says "Pass (tenant FK!, no balance columns, ADR-4/10)". Phase 3 creates `balances` table. This is consistent. No contradiction found here — this is a verification that the implementation plan follows ADR-4.

### F-CONSISTENCY-13: backend.md has `on_commit` direct enqueue without outbox
- Severity: major
- Location: CONVENTIONS.md §7 rule 1 (outbox rows in transaction) vs backend.md §3.2
- Problem: backend.md lines 281-289: `transaction.on_commit(lambda: [apple_push_pass.delay(...), google_push_pass.delay(...), fire_webhooks.delay(...)])` — this is direct Celery enqueue without outbox rows. ADR-17: "Inside the same transaction... inserts a PassUpdate row and/or a WebhookDelivery row... on_commit enqueues the Celery task with the outbox row id."
- Evidence: backend.md lines 281-289. ADR-17: "the service inserts a PassUpdate row... and the outbox sweeper re-enqueues rows stuck in pending."
- Fix: Add header note.

### F-CONSISTENCY-14: IMPLEMENTATION_PLAN.md Phase 0 evidence harness is missing
- Severity: blocker
- Location: CONVENTIONS.md §9 (testing standards) vs IMPLEMENTATION_PLAN.md Phase 0
- Problem: The common brief requires Phase 0 to create the evidence harness (folders, Playwright evidence config, check-script pattern). IMPLEMENTATION_PLAN.md Phase 0 does not include this. The Phase 0 backlog mentions CI pipelines but does not create `plan/evidence/`, `playwright.evidence.config.ts`, or `scripts/phase0-check.sh`.
- Evidence: Common brief lines 25-26. IMPLEMENTATION_PLAN.md Phase 0 backlog: Epics 0.1-0.5 — no evidence-pack tasks.
- Fix: Add to IMPLEMENTATION_PLAN.md Phase 0: Epic 0.6 Evidence harness: create `plan/evidence/` directory, `phase-0-progress.md`, `scripts/phase0-check.sh` (pattern), `apps/dashboard/playwright.evidence.config.ts`, and run the first gate pack. Add evidence tasks to every subsequent phase.
- Affects: IMPLEMENTATION_PLAN.md (all phases), feature-delivery skill, CONVENTIONS.md §9

### F-CONSISTENCY-15: feature-delivery skill does not reference the GlowDesk pipeline
- Severity: blocker
- Location: /Users/fahad/council/output/plan/skills/.cursor/skills/feature-delivery/SKILL.md
- Problem: The feature-delivery skill outlines the task→PR path (11 steps) but does not include: writing the phase progress row with commit SHA, running the phase check script, or producing evidence/REVIEW.md and gate packs. The common brief requires these.
- Evidence: Current feature-delivery skill steps 1-11: model, migration, service, permission, API, UI, worker, tests, docs, PR. Missing: "Write the progress-file row with the commit SHA", "Run `scripts/phase<n>-check.sh` and verify all gates", "For the last epic task: write `plan/evidence/<epic>/REVIEW.md`".
- Fix: Add step 12 to the feature-delivery skill: "Progress & evidence: after merge, add a row to `plan/evidence/phase-<n>-progress.md` with the commit SHA. Run `scripts/phase<n>-check.sh`. If this is the last task of an epic, produce `plan/evidence/<epic>/REVIEW.md` + numbered artifacts. If the last task of a phase, produce `plan/evidence/phase-<n>-gates/`."
- Affects: feature-delivery skill (both .cursor and .claude copies)

### F-CONSISTENCY-16: CONVENTIONS.md §9 testing standards mentions Playwright but not evidence config
- Severity: major
- Location: CONVENTIONS.md §9 vs common brief
- Problem: CONVENTIONS.md §9 lists Playwright journeys but does not mention the evidence config (`playwright.evidence.config.ts`), the evidence pack structure, or the phase-gate pattern. Testing is described as code practices, not as the evidence pipeline the brief requires.
- Evidence: CONVENTIONS.md §9: "Playwright golden journeys: login per role..." No mention of evidence packs per epic or phase gates.
- Fix: Add to CONVENTIONS.md §9: "Evidence pipeline (from the GlowDesk rhythm): every phase creates `plan/evidence/phase-<n>-progress.md` (one row per task, with commit SHA). The last task of each epic writes `plan/evidence/<epic>/REVIEW.md` + numbered artifacts. The last task of each phase writes `plan/evidence/phase-<n>-gates/GATES.md`, runs the gate script, and records the results. `scripts/phase<n>-check.sh` logs to `/tmp/`, not the repo."
- Affects: CONVENTIONS.md §9

---

## Part 4: Round 1 review follow-up — unresolved items from review.md

### F-REVIEW-1: Skill validator evidence — RESOLVED
- The verifier reported that skill validation could not be reproduced against the draft directory. The chair copied skills to the final layout. Current validation: `node check-skills.mjs skills/` returns "OK: 7 skill(s), .cursor and .claude copies identical." Resolved.

### F-REVIEW-2: Platform-admin provisioning flow — RESOLVED
- Verifier: "Platform-admin provisioning and owner credential setup flow, including Arabic/English and audit event." ADR-19 specifies support sessions; Phase 1 includes the wizard with en/ar. Resolved.

### F-REVIEW-3: API credential lifecycle — RESOLVED
- Verifier: "API credential creation/rotation/revocation and HMAC canonical request." ADR-1 specifies the HMAC contract; ADR-18 specifies rotation with grace window; Phase 5 implements credential management. Resolved.

### F-REVIEW-4: Webhook delivery idempotency — RESOLVED
- Verifier: "Webhook delivery idempotency, signature format, retries, dead-letter visibility." CONVENTIONS.md §7 rule 7 specifies at-least-once, versioned, idempotent on event id, retry 2/4/8/16/32s, dead-letter with manual retry. ADR-17 covers the outbox pattern. Resolved.

### F-REVIEW-5: Customer migration/import — RESOLVED
- Verifier: "Customer migration/import... with validation, deduplication, and balance provenance." Phase 3 includes CSV import with `import` events and `metadata.provenance`. Resolved.

### F-REVIEW-6: Pass update status/outbox recovery — RESOLVED
- Verifier: "Pass update status/outbox recovery and Apple device-registration/web-service endpoints." ADR-17 covers the outbox sweeper and dead-letter; ADR-24 covers the PassKit web service. Resolved.

### F-REVIEW-7: Store-card points rule semantics — RESOLVED
- Verifier: "Store-card points rule semantics are not as complete as stamp semantics." ADR-16 specifies: "earn basis is points_per_visit or points_per_currency_unit (integer points, rounding down), redemption costs are integer points on Reward.points_cost, concurrency is the same select_for_update on Balance." Resolved.

### F-REVIEW-8: Void authorization and state transitions — RESOLVED
- Verifier: "Void authorization and state transitions for each pass style; coupon one-time use must be atomic." ADR-31 specifies the authorization matrix; coupon atomic redeem+void is explicit. Resolved.

### F-REVIEW-9: Ten-location Apple relevance limit — RESOLVED
- Verifier: "Ten-location Apple relevance limit and behavior when a tenant attaches more than ten." ADR-15: "Program-level validation rejects an 11th attachment (422)." Resolved.

### F-REVIEW-10: Location-scoped exports and analytics privacy — RESOLVED
- Verifier: "Location-scoped exports and analytics privacy rules." ADR-29 specifies location-scoped exports; ADR-30 specifies location/staff filters on analytics. Resolved.

### F-REVIEW-11: Apple/Google issuer credential scope — PARTIALLY RESOLVED
- Verifier: "A documented policy for Apple/Google issuer credential scope and per-tenant branding under a shared platform issuer." ADR-24 states "documented path to per-tenant certificates exists but is a post-MVP phase." However, this is deferred, not resolved. The policy for how per-tenant certs would work under a shared platform issuer is described as a "documented path" but no such document exists yet.
- Severity: minor (post-MVP)
- Fix: Create a placeholder doc `docs/wallet/per-tenant-issuance.md` with the outline of the path: one Pass Type ID per style per tenant, generated from the tenant's own Apple Developer account, stored per-tenant in secret storage. This is roadmap documentation, not code.

### F-REVIEW-12: Audit events for platform-admin actions — RESOLVED
- Verifier: "Add audit events for platform-admin provisioning, credential rotation, impersonation, program publication, void, and data export." ADR-42 enumerates exactly these actions. Resolved.

### F-REVIEW-13: Tenant-consistency constraints — RESOLVED
- Verifier: "Add explicit tenant-consistency constraints for every multi-parent relation." ADR-10 specifies composite same-tenant FKs. django-data skill documents the pattern. Resolved.

### F-REVIEW-14: Staff-location join model — RESOLVED
- Verifier: "Add a staff-location join model and tests for a staff member assigned to two locations." ADR-12 specifies MembershipLocation M2M. Phase 0 creates the table. Resolved.

### F-REVIEW-15: API rate limits and enrollment abuse — RESOLVED
- Verifier: "Add API rate limits and enrollment abuse protection as acceptance criteria." ADR-43 specifies per-endpoint limits, enrollment honeypot + form-age. Resolved.

### F-REVIEW-16: Enrollment-to-pass canonical link — RESOLVED
- Verifier: "Add a canonical link from the public enrollment record to the issued Apple serial/device registrations and Google object ID." ADR-17: "Enrollment ↔ Pass ↔ DeviceRegistration (Apple) / google_object_id (Google), with PassUpdate as the delivery state." Resolved.

---

## Part 5: Factual claim verification

### Verified claims (all correct):
1. Django 5.2 LTS supported to April 2028 — CONFIRMED. Source: https://www.djangoproject.com/download/ shows end of extended support April 2028.
2. Apple PassKit relevant locations max 10 — CONFIRMED. Source: Apple documentation and multiple third-party confirmations cite a 10-location limit.
3. Apple Pass Type ID certificates expire annually and must be replaced — CONFIRMED. Source: Apple Developer support page and PassKit support pages confirm annual expiry. Cannot be renewed, only replaced.
4. contextvars is the correct pattern for request-scoped state in Django — CONFIRMED. Source: Django forum discussions, django-boundary library, and Python PEP 567 all support contextvars for this use case. The Django forum explicitly warns against thread-locals for async contexts.

### Potential concerns:
5. backend.md's Celery example (line 628) uses `os.envirn.setdefault('DJANGO_SETTINGS_MODULe', ...)` with typos. This is illustrative code (not production), but the typos could mislead.
6. CONVENTIONS.md Mermaid diagram (lines 16-55) is valid (confirmed by check-mermaid.mjs). The architecture diagram correctly shows the outbox pattern (dotted `.->` for on_commit + outbox) which matches ADR-17.

---

## Summary table

| ID | Severity | Title |
|---|---|---|
| ADR-1 through ADR-44 | — | All 44 ADRs: verdict KEEP |
| F-MISSING-1 | major | Database backup and restore policy |
| F-MISSING-2 | major | Audit log retention and pruning |
| F-MISSING-3 | major | Search strategy (tsvector vs LIKE vs external) |
| F-MISSING-4 | major | Feature flags mechanism |
| F-MISSING-5 | major | Environments and deployment topology |
| F-MISSING-6 | major | Email deliverability and sender identity |
| F-MISSING-7 | minor | Celery queue design and task routing |
| F-MISSING-8 | minor | Image processing for pass assets |
| F-MISSING-9 | major | Customer deduplication strategy |
| F-MISSING-10 | minor | Database migration policy |
| F-MISSING-11 | major | PII handling and privacy (unified) |
| F-MISSING-12 | major | Monitoring and alerting |
| F-MISSING-13 | minor | Time zone configuration for multi-zone tenant analytics |
| F-MISSING-14 | minor | Cache strategy |
| F-MISSING-15 | blocker | GlowDesk coding pipeline integration |
| F-CONSISTENCY-1 | major | backend.md uses rejected model names |
| F-CONSISTENCY-2 | major | backend.md uses thread-local instead of contextvars |
| F-CONSISTENCY-3 | major | backend.md enrollment uses short-lived token |
| F-CONSISTENCY-4 | major | backend.md/data-model.md money handling (Decimal vs int minor) |
| F-CONSISTENCY-5 | major | data-model.md Pass has balance columns |
| F-CONSISTENCY-6 | major | data-model.md Membership has single nullable location FK |
| F-CONSISTENCY-7 | major | data-model.md uses JWT for tenant API |
| F-CONSISTENCY-8 | minor | data-model.md typos (Asia/Kuwaitt, is_de leted) |
| F-CONSISTENCY-9 | minor | backend.md API resource map typos |
| F-CONSISTENCY-10 | minor | frontend.md ledger endpoint path mismatch |
| F-CONSISTENCY-11 | major | backend.md earn service uses Pass as balance holder |
| F-CONSISTENCY-12 | minor | IMPLEMENTATION_PLAN.md Phase 2/3 balance handling verified consistent |
| F-CONSISTENCY-13 | major | backend.md uses direct on_commit enqueue without outbox |
| F-CONSISTENCY-14 | blocker | IMPLEMENTATION_PLAN.md Phase 0 missing evidence harness |
| F-CONSISTENCY-15 | blocker | feature-delivery skill missing GlowDesk pipeline steps |
| F-CONSISTENCY-16 | major | CONVENTIONS.md §9 missing evidence pipeline documentation |
| F-REVIEW-1 through F-REVIEW-16 | — | All 16 verifier findings addressed; 15 RESOLVED, 1 PARTIALLY RESOLVED (F-REVIEW-11) |

## Counts

- **Blocker**: 3 (F-MISSING-15, F-CONSISTENCY-14, F-CONSISTENCY-15)
- **Major**: 15 (F-MISSING-1 through 6, 9, 11, 12; F-CONSISTENCY-1 through 7, 11, 13, 16)
- **Minor**: 8 (F-MISSING-7, 8, 10, 13, 14; F-CONSISTENCY-8, 9, 10, 12)
- **Resolved from review.md**: 15 resolved, 1 partially resolved
- **ADRs recommended for addition**: 15 (F-MISSING-1 through F-MISSING-15)

All 44 existing ADRs receive verdict KEEP. The plan's decisions are internally coherent and the chair's synthesis is thorough. The two principal gaps are: (1) the GlowDesk evidence pipeline (blocker, mandated by the common brief), and (2) operational ADRs that every production system needs (backups, monitoring, email, search, feature flags, environments).