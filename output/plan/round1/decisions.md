# Architecture decisions

Chair's rulings for the wallet-pass SaaS (Kuwait/GCC). Date: 2026-10-17.

Inputs: `requirements.md`, `data-model.md`, `backend.md`, `frontend.md`, the skill drafts in `skill-drafts/`, the illustrative model drafts in `django/`, and the verifier gate in `review.md` (verdict: PASS WITH REQUIRED SYNTHESIS CORRECTIONS). Every correction the verifier required is adopted below; where the chair rules differently, the ADR says so and why.

Every later document (`IMPLEMENTATION_PLAN.md`, `CONVENTIONS.md`, the skills in `skills/`) follows these decisions. If a document disagrees with an ADR, the ADR wins.

## How to read this file

- ADR-1 to ADR-25 resolve the verifier's required corrections and the cross-report conflicts. These are the load-bearing decisions.
- ADR-26 to ADR-44 rule on every member proposal (PD-*) and on the gaps the verifier found.
- The mapping table at the end shows where each member proposal was ruled.

Statuses: **Accepted** (build it this way), **Accepted with changes** (build it with the stated amendment), **Rejected** (do not build), **Deferred** (decide later, at the stated trigger).

## Canonical names (ADR-44 rules on these; stated up front because every ADR uses them)

| Concept | Canonical name | Table | Rejected variants |
|---|---|---|---|
| Ledger event row | `LedgerEntry` | `ledger_entries` | `LedgerEvent`, `ledger_events` |
| Balance aggregate | `Balance` | `balances` | `CustomerProgramBalance`, balances stored on `Pass` |
| Wallet pass projection | `Pass` | `passes` | `ApplePass`/`GooglePass` split |
| Dashboard user's tenant link | `Membership` | `memberships` | `StaffProfile`, `StaffMember` |
| Membership location scope | `MembershipLocation` | `membership_locations` | single nullable `Membership.location` FK |
| Tenant queryset choke point | `TenantScopedManager` | — | `TenantManager` |
| Ledger FK to a pass | field `pass_record`, column `pass_id` | — | `pass_field`, `pass` |
| Tenant API auth | HMAC-SHA256 signed request | — | JWT |
| API prefix | `/api/v1/` | — | `/pi/v1/`, unversioned `/api/` |
| Idempotency contract | `Idempotency-Key` HTTP header | — | body field `idempotency_key` |

---

# Part A: required corrections and cross-report conflicts

### ADR-1: Tenant API authenticates with HMAC-signed requests, not JWT
- Status: Accepted (verifier ruling; resolves conflict 1)
- Context: `data-model.md` §2.2 proposed JWT for the tenant API. `backend.md` §3.3/§9.2 and the django-backend skill draft proposed HMAC-signed requests with a per-tenant credential. The two cannot both be right, and the verifier ruled the JWT claim WRONG.
- Decision: The tenant API (the seam a store's POS/online system calls) authenticates with an `ApiCredential` (key id + secret) and an HMAC-SHA256 signature over a canonical request string. No JWT anywhere in the MVP. The server resolves the tenant from the credential, never from the request body or a token claim.
- Canonical contract:
  - Headers: `X-Api-Key: ***`, `X-Timestamp: <unix_seconds>`, `X-Signature: hex(HMAC-SHA256(secret, signing_string))`.
  - Signing string: `{METHOD}\n{PATH}\n{TIMESTAMP}\n{SHA256_HEX(body)}` (hashing the body avoids whitespace ambiguity in the raw-body variant the backend draft showed).
  - Replay window: reject timestamps more than 300 s from server time. Constant-time signature comparison.
  - Per-credential rate limits (see ADR-43).
- Alternatives: OAuth2 client-credentials (heavier for a POS integration; no authorization-server need yet); JWT (rejected: puts scope in a claim the verifier explicitly warned against trusting, adds refresh/rotation machinery for a server-to-server channel).
- Consequences: one auth middleware for the tenant API; credential creation/rotation screens in tenant settings (Phase 5); the developer-facing contract is four headers and one HMAC, documentable on a single page.
- Source: backend (proposed), data-model (opposed), verifier verdict: HMAC wins.

### ADR-2: Dashboard authenticates with session cookies
- Status: Accepted
- Context: The React dashboard is same-origin with the Django API in every deployed environment.
- Decision: Django session auth + CSRF for the dashboard and the platform-admin area. `SameSite=Lax`, HttpOnly cookies. DRF `SessionAuthentication`. No tokens in browser storage.
- Alternatives: JWT with refresh/rotation (rejected: complexity with no benefit same-origin); token in localStorage (rejected: XSS-exposed).
- Escape hatch: if the dashboard ever deploys to a different origin, switch to JWT in httpOnly cookies; documented in CONVENTIONS.md, not built now.
- Consequences: Vite dev server proxies `/api` to Django; `GET /api/v1/auth/me/` returns user, active membership, role, permitted location ids.
- Source: PD-DM-2 (in part), PD-BACKEND-2; verifier: AGREE.

### ADR-3: Enrollment uses a stable public URL, not a short-lived token
- Status: Accepted with changes (amends backend §3.4, satisfies verifier MEDIUM finding)
- Context: Enrollment links are printed as QR codes and put on shop counters; they must stay valid for the life of the program. The backend draft's "signed token with tenant_id and program_id" and the data-model's signed-token variant both create a long-lived bearer credential in a public URL, which the verifier flagged (expiry, program-active checks, PII, rate limiting).
- Decision: The enrollment URL is `https://enroll.<domain>/{tenant_slug}/{program_slug}/`. It carries no secret. The server resolves tenant and program from the slugs and enforces: tenant active, program status `active`, program published. Location attribution (which branch's QR it is) travels as a signed, expiring `?t=` parameter produced by the dashboard; a missing or invalid tag simply means "no location attribution", never "deny enrollment". Enrollment submissions are rate-limited per IP and per program (ADR-43), collect only the program's configured fields, and never put PII in any URL.
- Alternatives: signed token as the whole URL (rejected: expiry fights the printed-QR use case, and the token becomes a bearer secret); unguessable random path segment (kept as an option: program_slug is tenant-chosen, and a program can be paused to kill its link instantly).
- Consequences: no token revocation machinery; pausing/archiving a program disables enrollment; the signed attribution tag is the only crypto in the enrollment path and it is optional and low-value.
- Source: verifier security findings (MEDIUM), requirements §2; amends backend §3.4.

### ADR-4: `Balance` is the canonical aggregate; `Pass` holds no balance fields
- Status: Accepted (resolves conflict 2, verifier rulings on ledger findings)
- Context: `backend.md` examples mutated `CustomerProgramBalance`; `data-model.md`'s concrete `Pass` model carried writable `stamps_earned`/`points_balance`. The verifier refused both as written and required one canonical aggregate with the pass as a projection.
- Decision:
  - `Balance` (table `balances`) is the single cached aggregate per (customer, program) for store-card programs: `tenant`, `customer`, `program`, `stamps_current`, `stamps_lifetime`, `points_balance`, `rewards_earned`, `cycle`, timestamps. Unique on `(customer, program)`. All columns `>= 0` by check constraint.
  - `Balance` rows are written **only** by `ledger.services` inside the same atomic block as the `LedgerEntry` that justifies them, under `select_for_update()`. No serializer, admin, view, or task may write them. Django admin registers `Balance` read-only.
  - `Pass` carries **no** balance columns. It is the wallet projection: identifiers (Apple serial/pass type id/auth token, Google class/object id), `code` (the counter-visible pass code), `status`, `pass_data` (style-specific display jsonb), push state. The pass serializer reads balances from `Balance` at projection time.
  - Coupon, generic, event-ticket, and boarding-pass programs have **no** `Balance` row. Their lifecycle is issue/void/check-in events only (ADR-6, ADR-25).
- Alternatives: `Pass` as the aggregate (rejected: forces coupons and tickets to carry stamp columns, and mixes projection with truth); pure SUM-on-read with no cached column (rejected at the counter's <1.5 s p95 with row locks; PD-scope-2 already chose cached-with-reconciliation).
- Consequences: one lock target for concurrency; the reconciliation job compares `Balance` against `SUM` over `ledger_entries`; `django/*.py` drafts that put balances on `Pass` are superseded (ADR-44).
- Source: verifier conflict 2 ruling; PD-scope-2; PD-BACKEND-4.

### ADR-5: `LedgerEntry` naming, and its pass FK is `pass_record`
- Status: Accepted (resolves conflict 3)
- Context: The concrete model declared `pass_field` while every narrative and query used `pass`. `pass` shadows nothing in Python but reads ambiguously and broke the drafts' own examples.
- Decision: The event model is `LedgerEntry` (table `ledger_entries`). Its FK to the pass is Python field `pass_record` with `db_column="pass_id"`, nullable. Its FK to the aggregate is `balance`, nullable. A check constraint requires: balance-affecting event types have `balance_id IS NOT NULL AND previous_balance IS NOT NULL AND new_balance IS NOT NULL`; non-balance event types have all three NULL. Every service, serializer, index, and skill example uses these names.
- Alternatives: renaming to `pass` with `related_name` gymnastics (rejected: `pass` is a Python keyword-adjacent readability trap and the drafts already diverged); renaming the model to `LedgerEvent` (rejected: `LedgerEntry` is what backend, data-model, and the API surface already use; the glossary skill is corrected instead).
- Consequences: indexes `(pass_record_id, created_at)` → column `pass_id`; the glossary and django-data/django-backend skills adopt these names.
- Source: verifier conflict 3 ruling.

### ADR-6: Event types are immutable, quantity is always positive, and the sign comes from the event type
- Status: Accepted (verifier HIGH ledger findings)
- Context: The drafts encoded direction inconsistently: `quantity` "always positive" in the field table, negative quantities and `abs()` in the service pseudocode, and coupon/generic squeezed through balance fields with `new_balance = 0` ambiguity.
- Decision:
  - Event-type enum (append-only; new types arrive only by migration + ADR): `enroll`, `earn`, `redeem`, `reward_issued`, `issue`, `void`, `check_in`, `correction`, `import`.
  - Balance-affecting types: `earn` (delta `+quantity`), `redeem` (delta `−quantity`), `reward_issued` (delta `−reward.stamps_required` for stamp programs; see ADR-7). All other types are non-balance and store NULL balances (ADR-5).
  - `quantity` is a `PositiveIntegerField` and is **never** negative. The signed delta is computed in exactly one place, `ledger.services._signed_delta(entry_type, quantity)`. The service enforces `new_balance == previous_balance + delta` before insert and raises on mismatch; `Balance` check constraints and the non-negative rule are the DB safety net.
  - Redeem validates against the locked `Balance` row: insufficient balance raises `INSUFFICIENT_BALANCE` (422). Zero is never used as a sentinel; a coupon's "used" state is the `void`/`redeem` event plus `Pass.status`, not a balance.
  - `correction` reverses a prior entry by referencing it in `metadata.corrects_entry_id` with an opposite-sign effect expressed through its own type/quantity; rows are never edited.
- Alternatives: signed quantity column (rejected: direction implicit in data, `abs()` bugs already observed); separate tables per event kind (rejected: one append-only log is the audit story).
- Consequences: service tests must cover earn, redeem, reward_issued, issue, void, over-redeem, and concurrent duplicates for every style; the reconciliation job sums signed deltas per balance.
- Source: verifier ledger findings HIGH 1–4; requirements US-LGR-*.

### ADR-7: Stamp reward auto-issue consumes the target from the cycle counter
- Status: Accepted (chair synthesis of US-LGR-5 and ADR-6's formula rule)
- Context: Requirements demand "at exactly the target a reward is issued; the next earn starts a new cycle". A silent reset of `stamps_current` would break `new = previous + delta` and erase auditability.
- Decision: For stamp programs, when an `earn` would take `stamps_current` to or past the program's `StoreCardConfig.stamps_required`, the same transaction appends a `reward_issued` entry with `previous_balance = stamps_current_after_earn`, `new_balance = previous_balance − stamps_required`, `quantity = 1`, `metadata = {reward_id, cycle}`; increments `Balance.rewards_earned` and `Balance.cycle`; and `stamps_lifetime` is untouched by the consumption. Points programs have no auto-issue: rewards cost points and are redeemed explicitly (`redeem` with the points cost).
- Alternatives: reset-to-zero outside the ledger (rejected: unverifiable); lifetime-counter-only model with no cycles (rejected: contradicts US-LGR-5).
- Consequences: the pass projection shows `stamps_current / stamps_required`; reward messages configured on `Reward` render on the pass after a `reward_issued` event; analytics counts `reward_issued` separately from `redeem`.
- Source: requirements US-LGR-5; verifier scope finding "points rule semantics incomplete" (now specified).

### ADR-8: Append-only is enforced, not just promised
- Status: Accepted (verifier HIGH finding 5)
- Context: "Never update or delete ledger rows" was procedural in the drafts.
- Decision: Three layers. (1) A Postgres trigger on `ledger_entries` raises on UPDATE and DELETE (created in the initial ledger migration via `RunSQL`). (2) Django admin does not register `LedgerEntry` for change/delete; the model's `save()` raises for instances with a pk, and `delete()` always raises. (3) A nightly Celery reconciliation job recomputes every `Balance` from the log and writes discrepancies to an ops-visible report; mismatch pages on-call. Corrections are `correction` entries (ADR-6).
- Alternatives: ORM discipline alone (rejected by verifier); event-sourcing store outside Postgres (rejected: one database is the ops story).
- Consequences: the trigger must be handled in test fixtures (factories insert only, which they already do); any future legitimate migration touching ledger rows needs an explicit ADR.
- Source: verifier ledger findings; PD-scope-2.

### ADR-9: Enrollment is one transaction with a deterministic idempotency key
- Status: Accepted (verifier HIGH finding 6)
- Context: Enrollment creates a customer, a pass, and an `enroll` ledger event; a double submit or a race between two devices must not create two customers or two passes.
- Decision: `customers.services.enroll()` runs in one `transaction.atomic()`: dedupe lookup on the tenant's configured unique field(s) (e.g. normalized mobile or email) → get-or-create `Customer` → unique constraint `(customer, program)` on `Enrollment` catches the concurrent duplicate → create `Pass` (unique `(customer, program)`) → append `enroll` `LedgerEntry` with idempotency key `enroll:{enrollment_id}` (server-derived, not client-supplied) → outbox row for the first pass projection (ADR-17). On `IntegrityError`, the transaction retries once and returns the existing pass. The response contains the Apple `.pkpass` URL and the Google "Add to Wallet" JWT link.
- Alternatives: client-generated key for enrollment (rejected: the public page is anonymous; a server-derived key is deterministic and needs no client trust); advisory locks (unnecessary given the unique constraints).
- Consequences: returning customers re-adding a pass get the same `Pass` row re-projected (US-ENR-3); the enroll event is the acquisition source for analytics.
- Source: verifier ledger findings; requirements US-ENR-1..3.

### ADR-10: Every tenant-owned model carries a direct `tenant_id`; multi-parent joins prove same-tenant in the database
- Status: Accepted (verifier conflict 4 and HIGH tenancy findings 2–4)
- Context: The concrete drafts left `Pass` and most program-child models (design, rewards, enrollment fields, program-location, beacons, links, custom fields, style configs, push messages, settings) without tenant scoping, and join rows like `ProgramLocation` could not prove the program and the location belonged to the same tenant.
- Decision:
  - Every tenant-owned table has a direct `tenant_id` FK — including `Pass` and every program-child table — not scope-through-parent. The redundancy is deliberate: it makes the manager, the constraints, and every query uniform.
  - Same-tenant relations are enforced with composite foreign keys. Parent tables declare a unique constraint on `(id, tenant_id)`; child rows store both FK columns and reference the pair, e.g. `ProgramLocation(tenant_id, program_id, location_id)` with `ForeignKey(program, ...) ` expressed as `UniqueConstraint`-backed composite references (`program_id, tenant_id` → `programs.id, tenant_id`; same for `location_id, tenant_id`). An id from tenant B physically cannot attach to tenant A's program.
  - `Pass` gets the same treatment for both `customer_id, tenant_id` and `program_id, tenant_id`.
  - Service-layer validation duplicates the check with a clear error message; the DB constraint is the guarantee.
- Alternatives: scope-through-parent with constrained querysets (rejected by verifier: one forgotten join leaks); Postgres RLS (rejected in ADR-32).
- Consequences: migrations carry composite FKs (django-data skill documents the pattern); every new tenant-owned model follows the "add a tenant-scoped model" checklist in the django-data skill.
- Source: verifier conflict 4, HIGH findings 2–4.

### ADR-11: Tenant context lives in a contextvar; `TenantScopedManager` fails closed; the unfiltered manager is fenced
- Status: Accepted (verifier HIGH finding 1 and `all_tenants()` PARTIAL ruling)
- Context: The draft manager stored `_current_tenant` as a process-global class attribute — one request could overwrite another's tenant in a threaded server — and the platform-admin escape hatch `all_tenants()` was callable from anywhere.
- Decision:
  - Tenant context is a `contextvars.ContextVar` set by `TenantMiddleware` from the authenticated session, the HMAC credential, or the enrollment path, and reset in a `finally` on every request. Celery tasks never inherit request context: every service and task called outside a request passes the tenant explicitly.
  - `TenantScopedManager.get_queryset()` filters by the contextvar tenant; with no tenant set it returns `none()` (reads) — fail closed, never fail open. Writes without a tenant raise `TenantNotSupplied`.
  - Services and workers use the explicit form `Model.objects.for_tenant(tenant)`; the implicit contextvar filtering is defense-in-depth for request-path code, not the primary contract.
  - The unfiltered manager is `Model.cross_tenant`, defined once on the abstract base. It may be imported only by `apps/tenants/platform.py` (platform-admin services), migrations, and the reconciliation job. A lint rule (flake8 plugin or grep-based CI check) fails any other import. Every `cross_tenant` use writes an audit event (ADR-42). Platform-admin tenant selection is explicit, audited, and time-bounded (impersonation session with expiry); no generic viewset ever exposes a cross-tenant queryset.
- Alternatives: thread-locals (rejected: breaks under async workers and leaks across pooled threads); mandatory explicit scoping with no implicit manager (kept as the service-layer rule, but the fail-closed manager stays as the safety net).
- Consequences: a concurrency test (two parallel requests, different tenants) is part of Phase 0 acceptance; the django-data skill teaches `for_tenant()` first.
- Source: verifier HIGH finding 1; PD-DM-1 amendment.

### ADR-12: Staff scope is a set of locations via `MembershipLocation`
- Status: Accepted (verifier conflict on single-location FK; requirements win)
- Context: The data-model gave `Membership` one nullable `location` FK; requirements state a staff member can work at two or more locations.
- Decision: `Membership(user, tenant, role, is_active)` with a M2M `locations` through `MembershipLocation(membership, location)` (composite same-tenant FK per ADR-10). Semantics: for `owner` and `manager`, an empty location set means "all locations of the tenant"; for `staff`, at least one location is required (model clean + DB check via trigger-free service validation). `request.location_scope` is the resolved id set. It filters customer discovery (customers with ledger events at those locations), counter actions (the event's `location_id` must be in scope), analytics, and exports. A staff member with two locations selects the acting location at the counter (default: their only location; explicit pick otherwise), and every `LedgerEntry` stores `location_id` and `created_by`.
- Alternatives: one membership row per location (rejected: splits identity and role); single FK (rejected by verifier).
- Consequences: the staff CRUD screen edits a location multi-select; tests must include the two-location staff member (verifier requirement).
- Source: verifier model review; requirements §2.

### ADR-13: One idempotency contract — the `Idempotency-Key` header, with a payload fingerprint
- Status: Accepted with changes (verifier AGREE WITH CHANGES; resolves header-vs-body split)
- Context: The frontend draft sent an `Idempotency-Key` header; the backend/tenant-API drafts put `idempotency_key` in the JSON body. The verifier required one contract, fingerprint-based conflict detection, and a concurrency-safe path.
- Decision:
  - Every ledger-mutating POST (dashboard, counter, and tenant API: earn, redeem, issue, void) requires the header `Idempotency-Key: <uuid>` exactly once. The body carries no key. Requests without it get `400 VALIDATION_ERROR`.
  - `LedgerEntry` stores `idempotency_key` (unique per tenant — DB constraint `uq_ledger_entries_tenant_idempotency_key`) and `request_fingerprint` = SHA-256 of method + path + canonical body.
  - Replay with the same key **and** matching fingerprint: return the original result with `200` and header `Idempotent-Replay: true`. Same key, different fingerprint: `409 IDEMPOTENCY_CONFLICT`. Concurrent duplicates: the loser of the unique-constraint race catches `IntegrityError`, re-reads inside a fresh transaction, and follows the replay/conflict rule.
- Alternatives: body-only key (rejected: the header keeps the contract transport-level and identical for webhooks' consumers and API clients); no fingerprint (rejected: silently returns a stale result for a different payload).
- Consequences: one middleware/serializer concern; the counter's retry-with-same-key behavior (ADR-38) and the tenant API docs share the rule; tests cover replay, conflict, and concurrency.
- Source: verifier decision verdict on idempotency; PD-FE-4; backend §4.5.

### ADR-14: `/api/v1/` everywhere, OpenAPI published from day one
- Status: Accepted with changes (fixes the `/pi/v1/` typo and unversioned frontend paths)
- Context: The backend report contained both `/pi/v1/` (heading typo) and `/api/v1/`; frontend examples used unversioned `/api/...`.
- Decision: All HTTP API routes live under `/api/v1/`. The Apple PassKit web service keeps Apple's own fixed URL structure under `/passkit/` (Apple dictates its paths; it is version-independent). drf-spectacular publishes OpenAPI 3 at `/api/schema/` from the first phase; CI validates that generated examples match serializer fields (catching `progam_id`/`quatity`-class typos mechanically). The frontend `apiFetch` base path is `/api/v1`.
- Alternatives: unversioned until v2 (rejected by PD-BACKEND-3 already); version in a header (rejected: URL version is the documented, cache-friendly convention).
- Consequences: every skill example and the implementation plan use `/api/v1/`; v2 policy per backend §7.6 (parallel mount, sunset header).
- Source: verifier conflict 5; PD-BACKEND-3.

### ADR-15: Relevant locations attach at program level, cap 10, projected per pass
- Status: Accepted with changes (verifier AGREE WITH CHANGES)
- Context: The brief requires relevant locations on any pass; Apple allows at most 10 per pass; the drafts attached locations to programs without enforcing the cap or defining per-pass behavior.
- Decision: `ProgramLocation(tenant, program, location, show_on_card, address_on_card, lock_screen_message)` is the MVP attachment (unique per program+location, composite tenant FKs per ADR-10). Program-level validation rejects an 11th attachment (`422 VALIDATION_ERROR`, message states Apple's limit). The pass projection function takes an explicit location list — default: the program's active attachments at projection time — so a later phase can pass a per-pass subset without schema change; the projector itself hard-caps at 10 and orders by proximity relevance rules per style. Removing a location detaches on the next pass update (outbox-driven, ADR-17). `relevantText` per location comes from `lock_screen_message`.
- Alternatives: per-pass location rows from day one (rejected: no MVP requirement, adds write surface); silently truncating to 10 (rejected: the operator must know the cap was hit).
- Consequences: one location-picker component in the program editor for every style; projection tests include the 10-cap and the detach-on-update case.
- Source: verifier decision verdict; PD-scope-3; Apple citation: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html

### ADR-16: Style-specific configuration lives only in per-style config tables
- Status: Accepted with changes (verifier: program duplicated stamp fields)
- Context: `Program` carried `stamps_required`/`points_per_stamp` **and** `StoreCardConfig` carried `stamps_required` "mirrored for query speed". Two writable copies drift.
- Decision: `Program` holds only style-independent fields (name, slug, `pass_style`, derived `google_class`, status, terms/consent, expiry, issuer contact). All rule fields live in the 1:1 config table for the style: `StoreCardConfig` (card_type: stamps|points|stamps_and_points, stamps_required 1–30, points rules per ADR-7/§points below), `CouponConfig` (single_use, offer copy), `GenericConfig` (free-text field definitions), `EventTicketConfig` and `BoardingPassConfig` (created by their own phases' migrations, interface agreed now per ADR-25). Nothing mirrors a config field onto `Program`; queries join the config. Points rule semantics (verifier gap): earn basis is `points_per_visit` or `points_per_currency_unit` (integer points, rounding down), redemption costs are integer points on `Reward.points_cost`, concurrency is the same `select_for_update` on `Balance`.
- Alternatives: jsonb config on `Program` (rejected in PD-DM-6 already: no typed validation); mirrored fields (rejected by verifier).
- Consequences: the program editor renders a per-style section from a discriminated union; adding a style adds a table and a section, never a `Program` migration.
- Source: PD-DM-6; verifier model review.

### ADR-17: A durable outbox bridges the ledger commit and every async effect
- Status: Accepted (verifier MEDIUM finding; "missing links" item)
- Context: `transaction.on_commit(... .delay())` loses the effect if the broker is down or the process dies between commit and enqueue. Celery retries cannot recover a task that was never published.
- Decision: Inside the same transaction as each ledger write (and enrollment, void, program publish, design change), the service inserts a `PassUpdate` row (`tenant`, `pass_record` FK, `trigger_entry` FK, `status` pending→enqueued→done/failed, `attempts`, `last_error`) and/or a `WebhookDelivery` row per subscribed endpoint. `on_commit` enqueues the Celery task with the outbox row id; the task is idempotent (re-projects from current state, marks the row done). A beat job (`sweep_outbox`, every 60 s) re-enqueues rows stuck in `pending` past 30 s and retries `failed` rows with backoff up to 5 attempts, then dead-letters them to an ops-visible list and (for pass updates) sets `Pass.push_status = failed`, which the customer-detail screen surfaces with a manual "repush" action. Webhook deliveries get the same treatment with their own dead-letter log visible to the tenant.
- Alternatives: on_commit-only (rejected by verifier); a generic outbox library / CDC (rejected: two purpose-built tables are enough and stay in the same Postgres).
- Consequences: no effect is lost without a row proving it; the enrollment → pass link the verifier asked for is canonical: `Enrollment` ↔ `Pass` ↔ `DeviceRegistration` (Apple) / `google_object_id` (Google), with `PassUpdate` as the delivery state.
- Source: verifier ledger findings MEDIUM; missing-links list.

### ADR-18: Webhook secrets are encrypted at rest and write-only; credential secrets are hashed
- Status: Accepted (verifier MEDIUM finding)
- Context: `WebhookSubscription.secret` was plaintext while API credential secrets were hashed.
- Decision: The webhook signing secret is stored encrypted (Fernet with a key from the secret store, not `SECRET_KEY` alone), is write-only in every serializer (never returned after creation; the UI offers "rotate", not "reveal"), and rotation is audited. ApiCredential secrets remain hashed (argon2/bcrypt), shown exactly once at creation. Both support rotation with a grace window: the new secret is accepted immediately, the old one for a configurable overlap (default 24 h) so a POS keeps working during changeover.
- Alternatives: hash-only webhook secrets (impossible: we must produce signatures, so we need the plaintext); plaintext (rejected).
- Consequences: a key-compromise runbook can rotate the encryption key by re-encrypting rows; delivery failures caused by rotation show clearly in the delivery log.
- Source: verifier security findings MEDIUM.

### ADR-19: Platform admins never browse tenant data; impersonation is explicit, audited, time-bounded
- Status: Accepted (verifier PARTIAL ruling on `all_tenants()`)
- Context: The drafts gave platform admin an unrestricted manager and a viewset pattern returning `Program.objects.all()`.
- Decision: Platform-admin views list tenants and tenant metadata only. Entering a tenant's data requires starting an explicit "support session": pick a tenant, state a reason, get a time-bounded (default 30 min) impersonation context that sets the contextvar tenant exactly like a real membership would. Start, every request within, and end of a support session write audit events (ADR-42). `cross_tenant` (ADR-11) is never reachable from a viewset; the admin tenant list uses a dedicated platform service, not a generic queryset.
- Alternatives: god-mode read-all (rejected by verifier); no admin data access at all (rejected: support realistically needs it).
- Consequences: the admin area's screens are: tenant list, tenant detail (metadata + counts), create tenant wizard, support-session button; the audit log screen shows support sessions.
- Source: verifier decision verdict; data-model §5.1 amendment.

### ADR-20: Object-storage keys are server-generated and tenant-prefixed
- Status: Accepted (verifier MEDIUM finding)
- Context: Design uploads took free-form image keys in the drafts.
- Decision: The upload endpoint (`POST /api/v1/uploads/`) accepts file bytes plus purpose (`logo`, `icon`, `strip`, `stamp`, ...), validates type/size server-side (client pre-checks too), and returns the storage key it generated: `{tenant_id}/{program_id|design}/{purpose}/{uuid}.{ext}`. Clients never supply a bucket path; the pass signer and the design serializers accept only keys matching the requesting tenant's prefix (validated, not trusted). Buckets are private; reads go through short-lived signed URLs minted per request.
- Alternatives: presigned direct uploads with client-chosen keys (rejected: arbitrary-path writes); public bucket (rejected: customer-facing assets are tenant-branded, not secret, but enumeration and overwrite risk is pointless).
- Consequences: one upload service; image constraints (Apple's per-style sizes) validated in one place.
- Source: verifier security findings MEDIUM.

### ADR-21: Money is stored as integer minor units with the currency exponent
- Status: Accepted (chair resolves requirements-vs-data-model conflict; verifier did not rule)
- Context: Requirements NFR said "store as minor-unit integers per currency exponent"; the data-model said `DecimalField(12,3)` everywhere. KWD and BHD have 3 decimals; SAR/AED/QAR have 2; a fixed 3-decimal decimal column misrepresents 2-decimal currencies and invites float-adjacent bugs.
- Decision: Money columns are `BigIntegerField` minor units plus the currency code from the owning tenant (`Reward.cost_minor`, `Tenant.currency` ISO-4217, exponent looked up from a currency table in code, KWD default = 3). The API serializes money as a decimal **string** with the currency's exponent ("12.500" KWD); the frontend formats via `Intl.NumberFormat` with digits from the currency (ADR-39). Stamp and point balances are plain integers, never money.
- Alternatives: `DecimalField(12,3)` (rejected: hard-codes KWD's exponent into every currency); floats (never).
- Consequences: one `Money` value object in the backend (`minor`, `currency`) with serialization helpers; analytics ROI screen converts at the edges only.
- Source: requirements §5 vs data-model §4.1; chair ruling.

### ADR-22: UTC storage, IANA-validated zones, and "today" is location-local
- Status: Accepted with changes (verifier MEDIUM finding)
- Context: The drafts said UTC + location display but did not validate zone strings (the data-model's default was literally misspelled `Asia/Kuwaitt`) and left day-boundary math undefined.
- Decision: `USE_TZ=True`, everything stored UTC. `Tenant.timezone` and `Location.timezone` are validated against the IANA zone database (`zoneinfo.available_timezones()`) at the model layer; default `Asia/Kuwait`. All analytics day buckets, "today" filters, expiry-date math, and relevant-date computations use the **event location's** timezone (falling back to tenant default when an event has no location). The frontend always passes `timeZone` to `Intl.DateTimeFormat` from API data (ADR-39).
- Alternatives: per-tenant naive timestamps (rejected); server-UTC day boundaries (rejected: Kuwait-day analytics would be wrong for any Gulf tenant east/west of it).
- Consequences: TruncDate annotations in analytics take an explicit tz; tests cover a midnight-boundary event.
- Source: verifier ledger findings MEDIUM (timezone); data-model typos list.

### ADR-23: One program style (Apple) is canonical; the Google class is derived; asymmetries issue per-side
- Status: Accepted (verifier CONFIRMED the seven Google classes; mapping made explicit)
- Context: The product must issue all five Apple styles and all seven current Google classes without forcing either taxonomy onto the other.
- Decision: `Program.pass_style` is one of the five Apple styles (`store_card`, `coupon`, `event_ticket`, `boarding_pass`, `generic`) and is the canonical style. `google_class` is **derived, never independently chosen**: `store_card`→`loyalty` (or `gift_card` when `StoreCardConfig.card_type` marks a gift variant); `coupon`→`offer`; `event_ticket`→`event_ticket`; `boarding_pass`→`flight` or `transit` by `BoardingPassConfig.transport_type`; `generic`→`generic`. Derivation lives in one function `passes.google_class_for(program)` covered by tests. Where one side has no equivalent (Apple has no transit style; Google has no coupon-vs-ID split), issuance proceeds independently per platform: each program issues on both platforms via its own pipeline, and a platform-specific capability (Apple beacons, Google's transit grouping) degrades to "not present" on the other, never to "pass not issued".
- Citations: Apple styles — https://developer.apple.com/documentation/walletpasses ; Google classes — https://developers.google.com/wallet/reference/rest (both spot-checked by the verifier).
- Alternatives: Google-class-canonical (rejected: Apple's style set drives pass.json structure); a lowest-common-denominator model (rejected: loses transit/gift-card fidelity).
- Consequences: the class/object lifecycle differs per platform (Apple: pass type id + serial + device registrations + APNs; Google: class per program created at publish, object per pass, PATCH to update) but both hang off the same `Pass` row and the same outbox.
- Source: requirements §1; data-model §1.4; verifier CONFIRMED.

### ADR-24: Self-sign Apple and Google passes behind a signer interface, on one platform issuer
- Status: Accepted with changes (verifier AGREE WITH CHANGES: operational acceptance criteria required)
- Context: PD-scope-6, PD-DM-3, and PD-BACKEND-1 all proposed self-signing. The verifier agreed but required the operational work to be explicit, not assumed.
- Decision: We sign ourselves. No pass provider. Architecture: `passes/signer.py` exposes `SignerInterface` with `build_pkpass(pass_record) -> bytes`, `apple_push(pass_record)`, `google_class_payload(program)`, `google_object_payload(pass_record)`, `google_jwt_url(pass_record)`; the MVP ships `SelfSigner`. A provider could be swapped in later behind the same interface (optionality kept, not built). MVP issuer posture: **one** Apple Pass Type ID per style per environment and **one** Google Wallet issuer for the platform; tenant branding is per-program design data under the shared issuer; a documented path to per-tenant certificates exists but is a post-MVP phase. All certificates/keys live in secret storage (K8s secrets or AWS Secrets Manager), loaded at call time, never in the repo, never cached on disk in the image.
- Operational acceptance criteria (Phase 2 exit, per verifier): Apple Pass Type ID + pass certificate provisioned per environment; APNs token-based auth (.p8, key id, team id) working against sandbox and production; the PassKit web service (register/unregister/serials/pass download) authenticated by per-pass auth tokens; Google issuer approved for production with a service-account key and a rehearsed rotation; a cert-expiry calendar alert (Apple certs expire annually); a runbook for "Apple cert expired" and "Google key rotated" tested in staging.
- Alternatives: pass provider (rejected: per-pass cost, external customer data, feature-lag risk, and the brief's control requirement); per-tenant certificates in MVP (deferred: multiplies issuer ops before the first tenant is live).
- Consequences: ~500 lines of signer + web-service code owned once; worker queues per ADR-17; cost model is fixed infrastructure, which suits GCC volume scaling.
- Source: PD-scope-6, PD-DM-3, PD-BACKEND-1; verifier AGREE WITH CHANGES. Apple web service: https://developer.apple.com/library/archive/documentation/PassKit/Reference/PassKit_WebService/ ; Google issuance flow: https://developers.google.com/wallet/retail/loyalty-cards/overview/add-to-google-wallet-flow

### ADR-25: Event ticket and boarding pass ride the MVP pipeline; the MVP proves the interface but does not issue them
- Status: Accepted with changes (verifier AGREE WITH CHANGES)
- Context: The brief requires the signer and program schema to accept event ticket and boarding pass from the MVP so later phases add fields and screens, not a pipeline. The verifier warned against implying those styles are issuable in MVP.
- Decision: In the MVP: `pass_style` enum includes all five styles; `SignerInterface` is style-parameterized and ships one projection function per style with `event_ticket`/`boarding_pass` raising a clear `StyleNotYetAvailable` at the API boundary (program creation for those styles is rejected with `422` until their phase); the config-table pattern (ADR-16) and the common pass features (barcode, design, relevant locations, relevant date, update push, void) are defined against the shared interface; acceptance tests assert a new style needs **zero** changes to `Pass`, `LedgerEntry`, the outbox, or the push tasks — only a config table, a projection function, editor screens, and enum activation. Phases P1/P2 then add `EventTicketConfig`/`BoardingPassConfig` migrations, projection fields (semantic tags, seats, flight legs), check-in events, and screens.
- Alternatives: build all five styles in MVP (rejected: scope); design only three and refactor later (rejected by the brief).
- Consequences: the MVP test suite includes the "style-additivity" contract test; `relevantDate` plumbing exists in MVP (schema + projection no-op) because tickets need it in P1.
- Source: verifier decision verdict; requirements §4 non-MVP stories.

---

# Part B: member proposals and verifier gap items

### ADR-26: One `Program` model with a pass style, not per-style products
- Status: Accepted — PD-scope-1 as proposed.
- Context: five Apple pass styles risk becoming five subsystems, and the brief forbids forcing coupons or tickets through a stamp ledger.
- Decision: a single `programs` table + per-style config tables (ADR-16) + one signer parameterized by style + one program editor with per-style sections.
- Alternatives: separate models and pipelines per style (rejected: duplicates signer, editor, and ledger per style, and turns later phases into rework instead of additions).
- Consequences: later phases add fields and screens; stamp/points are store-card rule sets only; coupons/tickets never touch a stamp ledger (ADR-6).
- Source: requirements PD-scope-1; verifier unchallenged.

### ADR-27: Balances are cached, ledger-owned, and reconciled — never independently editable
- Status: Accepted — PD-scope-2 as proposed, realized by ADR-4/6/8.
- Context: stamp counters on cards tempt a mutable counter; double-credit and drift are the failure modes the evidence product exhibits.
- Decision: cached `Balance` columns written only by the ledger service inside the entry's transaction; non-negative check constraints; nightly reconciliation from `SUM(signed deltas)`.
- Alternatives: pure SUM-on-read with no cached column (rejected: counter p95 latency and lock contention); a freely editable counter (rejected: violates ledger-is-truth).
- Source: PD-scope-2; verifier AGREE WITH CHANGES (changes adopted in ADR-4/6/8).

### ADR-28: No plans, limits, or billing before the final phase; billing provider chosen then, against fixed criteria
- Status: Accepted — PD-scope-4 and PD-BACKEND-6 as proposed.
- Context: the evidence product gates features by subscription plan; our commercial terms are offline invoices until self-serve, and the brief fixes signup/billing as the last phase.
- Alternatives: ship internal limit/billing scaffolding in the MVP (rejected: unused machinery for many phases, and gating could creep forward in violation of the brief).
- Decision: no plan tables, no feature gates, no checkout before P8. Config may carry unlimited-default gate keys but nothing reads them for enforcement. Commercial terms are invoiced offline. When P8 starts, evaluate providers against: Kuwait payment rails (KNET/card), multi-currency incl. 3-decimal KWD, subscription-management API able to drive limits, GCC presence. Candidates noted by backend: Stripe, Tap Payments, MyFatuora. The provisioning service used by platform admin is the same one public signup calls in P8 (requirements US-P8 acceptance).
- Source: PD-scope-4, PD-BACKEND-6; verifier CONFIRMED ("no signup/billing pulled forward").

### ADR-29: CSV export is standard from MVP, scoped by role
- Status: Accepted — PD-scope-5 as proposed.
- Context: the evidence product gates CSV export to its top plan; GCC businesses demand data portability and the privacy NFR requires export capability.
- Alternatives: gate export behind a future plan field (rejected: friction we should not copy).
- Decision: customer and ledger CSV export for owners (tenant-wide) and location managers (their locations only, per ADR-12 scoping). No plan gate, ever. Exports are async (Celery) with a download link, access-audited (ADR-42), and location-scoped exports must not leak other locations' rows (verifier gap item adopted as an acceptance criterion).
- Source: PD-scope-5; verifier scope finding "location-scoped exports".

### ADR-30: Analytics carries location and staff filters from day one
- Status: Accepted — PD-scope-7 as proposed.
- Context: the evidence product carries location and staff on every event but exposes filters nowhere — a confirmed gap, cheap for us to close because events already carry both dimensions.
- Alternatives: ship without filters for parity (rejected: the gap is a selling point, not a feature to match).
- Decision: every analytics view (tenant dashboard, program overview, transaction list) filters by location and staff, server-enforced against the requester's scope. Events already carry `location_id` and `created_by`; aggregates group by both. Performance target: <2 s p95 for a 100k-event tenant (requirements NFR), met with the ledger indexes; materialized daily aggregates deferred until a tenant outgrows plain queries (data-model §7.3).
- Source: PD-scope-7; requirements US-ANA-1..3.

### ADR-31: Void authorization — staff may void only as part of their own coupon redemption
- Status: Accepted — PD-scope-8 as proposed.
- Context: counter reality — a redeemed single-use coupon must be voidable by the staff member performing the redemption, without manager approval.
- Alternatives: all voids manager-only (rejected: blocks the counter flow); staff void anything (rejected: abuse risk).
- Decision: standalone void requires manager or owner (within location scope); staff may void a single-use coupon atomically inside their redemption action at the counter (it *is* the redemption). Every void stores reason + actor; voided is terminal for the pass (state machine: issued → voided | expired; no resurrection — re-enrollment issues a new pass). Coupon one-time-use consumption is atomic: the redeem+void pair commits in one transaction or not at all (verifier gap item adopted).
- Source: PD-scope-8; verifier scope finding "void authorization and state transitions".

### ADR-32: One shared Postgres schema with `tenant_id`, enforced in Django, constrained in the DB — no RLS, no schema-per-tenant
- Status: Accepted with changes — PD-DM-1 / PD-BACKEND-5 as proposed plus the verifier's defense-in-depth conditions.
- Context: how to isolate tenant data on the fixed PostgreSQL stack shared by every member report.
- Decision: single shared schema; every tenant-owned row has `tenant_id` (ADR-10); `TenantScopedManager` (ADR-11); DB constraints for the invariants the ORM must not bypass: idempotency uniqueness, non-negative balances, composite same-tenant FKs, the ledger UPDATE/DELETE trigger. Defense-in-depth tests are mandatory per model (cross-tenant read, cross-tenant write, cross-tenant relation attach) and a suite-level test enumerates all tenant-owned models and fails if any lacks `tenant_id`, the manager, or the isolation test.
- Alternatives: django-tenants schema-per-tenant (rejected: migration and pooling ops cost at SaaS scale); Postgres RLS (rejected: logic splits into SQL, complicates migrations/testing; the fixed stack says enforce in Django; DB constraints carry the hard rules).
- Source: PD-DM-1, PD-BACKEND-5; verifier AGREE WITH CHANGES.

### ADR-33: Hybrid IDs — UUIDs for public-facing rows, bigserial for internal joins
- Status: Accepted — PD-DM-4 as proposed.
- Context: primary-key strategy balancing enumeration safety against index size on high-volume tables.
- Alternatives: UUIDs everywhere (rejected: index bloat on large join tables); auto-increment everywhere (rejected: guessable public ids).
- Decision: `Tenant`, `Location`, `Program`, `Customer`, `Pass`, `Balance`, `LedgerEntry`, `ApiCredential` use UUIDv4 PKs (public URLs, no enumeration). Pure internal/join tables (`MembershipLocation`, `EnrollmentField`, `ProgramLocation`, `UsefulLink`, `CustomField`, `StampImage`, `ProgramSettings`) use bigserial. Serial numbers that appear in third-party systems (Apple serial, Google object id) are generated per their platform rules, namespaced by issuer id.
- Source: PD-DM-4; unchallenged.

### ADR-34: Deletion policy — soft-delete customers, archive programs, never delete passes or ledger rows
- Status: Accepted with changes — PD-DM-5 amended (hard-deleting published programs/passes strands issued wallet passes).
- Context: deletion must coexist with passes already living in customers' wallets and with privacy erasure requests.
- Alternatives: hard-delete programs and passes as proposed (rejected: strands issued passes and breaks audit references); soft-delete everything (rejected: configuration detritus with no audit value accumulates).
- Decision: `Customer`: soft delete (`is_deleted`, `deleted_at`); a privacy deletion request additionally nulls PII (name → anonymous marker, email/mobile/data → null) while keeping anonymized ledger aggregates (requirements privacy NFR). `Program`: drafts may be hard-deleted; once published, a program can only be `paused` or `archived` — never deleted, because issued passes reference it. `Pass`: never hard-deleted while any device registration or Google object exists; `voided` is terminal; a `purge_expired_passes` beat job voids (not deletes) passes past expiry rules. `LedgerEntry`: never (ADR-8).
- Source: PD-DM-5; chair amendment per verifier pass-projection concerns.

### ADR-35: pnpm workspace with two Vite apps and shared packages
- Status: Accepted — PD-FE-1 as proposed.
- Context: three surfaces share types and translations but have very different bundle, auth, and deploy needs.
- Alternatives: one app with route-level splitting (rejected: the enrollment bundle ships dashboard weight and import risk); three apps (rejected: the admin area needs no separate deploy).
- Decision: `frontend/dashboard` (merchant + platform-admin routes), `frontend/enrollment` (public, phone-first), shared `frontend/packages/api-types` and `frontend/packages/messages`. The enrollment app never imports dashboard code (ESLint `no-restricted-imports`); bundle budgets per frontend §9.
- Source: PD-FE-1; unchallenged.

### ADR-36: TanStack Query for all server state; polling (not websockets) for pass-push status
- Status: Accepted — PD-FE-2 as proposed.
- Context: shared server entities render on several screens, and the counter needs "pass updating" feedback after a committed ledger write.
- Alternatives: Redux Toolkit Query, SWR, raw fetch + context (rejected: weaker dedup/invalidation story); websockets (rejected: no evidence the counter needs sub-second push — polling suffices because the ledger already committed).
- Decision: query-key factory `qk`, invalidate-after-mutate, optimistic updates only at the counter (ADR-38), `refetchInterval` polling while `push_status = pending`, cheap `GET /api/v1/passes/{id}/status/` endpoint for it. No realtime infra until evidence demands it.
- Source: PD-FE-2; unchallenged.

### ADR-37: React Hook Form + Zod, mirrored validators, OpenAPI codegen as the exit path
- Status: Accepted — PD-FE-3 as proposed.
- Context: the same validation rules exist in DRF serializers and browser forms; hand duplication drifts.
- Alternatives: single-source OpenAPI codegen from day one (deferred: the API surface is not yet stable); client-side validation only (rejected: the server is authoritative in all cases).
- Decision: one Zod schema per form in `packages/api-types/validators/<entity>.ts`, each with a comment naming the DRF serializer it mirrors; PR review checks drift; when the API stabilizes, generate from the drf-spectacular schema (ADR-14) and delete hand mirrors. Server validation is authoritative in all cases.
- Source: PD-FE-3; unchallenged.

### ADR-38: Client-generated `Idempotency-Key` on every ledger mutation; optimistic UI only at the counter
- Status: Accepted — PD-FE-4 as proposed, conformed to ADR-13's header contract.
- Context: double-taps and flaky shop networks must not double-credit a customer at the counter.
- Alternatives: disable-only buttons (rejected: a retry after timeout still duplicates); server-side dedupe by request hash without a client key (rejected: cannot distinguish an intentional second stamp from a replay).
- Decision: `crypto.randomUUID()` at press time, sent as the `Idempotency-Key` header, reused verbatim on retry (never regenerated), button disabled via mutation `isPending`, visible rollback + "retry (same key)" toast on failure, 10 s timeout → "sent, unconfirmed" → ledger re-query before any resend. Offline queueing in IndexedDB with keys intact is the stretch; the banner + disabled state is the MVP floor.
- Source: PD-FE-4; verifier AGREE WITH CHANGES (changes = ADR-13).

### ADR-39: i18next with six-form Arabic plurals; RTL via `dir` + CSS logical properties; `Intl` for all formatting
- Status: Accepted with changes — PD-FE-5 plus the verifier's test requirements.
- Context: the market requires full English/Arabic bilingual operation with RTL from day one, KWD 3-decimal money, and per-location timezones.
- Alternatives: react-intl or LinguiJS (rejected: team velocity with i18next's plural and namespace model); LTR-first with Arabic retrofitted (rejected: violates the brief and costs more later).
- Decision: as proposed in frontend §5 (shared catalogs, CI key-parity gate, logical properties with a stylelint ban on physical directions, pass previews exempt). Verifier additions adopted as acceptance criteria: Playwright RTL journeys for **both** enrollment and dashboard; unit tests for all six Arabic plural forms of every counted string; KWD 3-decimal formatting tests (and a 2-decimal currency test proving exponent-from-currency); location-timezone formatting tests (same instant renders differently per location zone).
- Source: PD-FE-5; verifier skill review.

### ADR-40: Active location is a `?loc=` search param; the server enforces it
- Status: Accepted — PD-FE-6 as proposed; verifier CONFIRMED.
- Context: managers deep-link scoped views to each other; the scope must survive refresh and sharing, and must never be client-trusted.
- Alternatives: location in session state only (rejected: not shareable or deep-linkable); location in the URL path (rejected: complicates every route).
- Decision: `LocationSwitcher` writes `?loc=`, `useActiveLocation()` reads it, and the API treats it strictly as a requested filter: it re-derives the user's permitted set (`request.location_scope`, ADR-12) and rejects ids outside it with 403, never trusting the param for authorization.
- Source: PD-FE-6; verifier CONFIRMED.

### ADR-41: One `<QueryState>` contract over design-skill primitives; visuals come only from the Airbnb design skill
- Status: Accepted — PD-FE-7 as proposed.
- Context: the Airbnb design skill owns visuals; features must not restyle primitives or invent their own loading states.
- Alternatives: per-feature loading/empty/error handling (rejected: inconsistent UX and design-skill drift into feature code).
- Decision: `shared/ui` re-exports the design skill's primitives with app contracts (loading/empty/error, RTL-safe icons, field wiring). Features compose, never restyle. Colors/typography/spacing are the design skill's property; the only tenant-settable colors are pass content (program design), not dashboard style.
- Source: PD-FE-7; unchallenged.

### ADR-42: One audit-event stream for sensitive actions
- Status: Accepted (verifier missing-links item)
- Context: The verifier required audit events for platform-admin provisioning, credential rotation, impersonation, program publication, void, and data export; requirements already demanded an append-only audit trail for mutations.
- Decision: `AuditEvent` (table `audit_events`, append-only like the ledger): `tenant` (nullable — platform-level events have none), `actor_user`, `actor_kind` (user|api_credential|system), `action` (enum: tenant.provisioned, tenant.suspended, support_session.started/ended, credential.created/rotated/revoked, webhook.rotated, program.published/paused/archived, pass.voided, export.completed, staff.created/role_changed/deactivated, customer.pii_deleted), `object_type`, `object_id`, `metadata` jsonb, `created_at`. Written inside the same transaction as the action where possible. Owner-visible for their tenant (settings → audit log); platform events visible only to platform admins.
- Alternatives: reuse the ledger for audit (rejected: audit covers non-ledger actions and platform-level events with no tenant); an external logging service as the only record (rejected: owners need an in-product, queryable view).
- Source: verifier missing links; requirements §5 audit NFR.

### ADR-43: Rate limits and enrollment abuse protection are acceptance criteria, not afterthoughts
- Status: Accepted (verifier missing-links item)
- Context: the public enrollment endpoint and the tenant API are exposed surfaces; abuse protection was described narratively but never made checkable.
- Alternatives: a CAPTCHA vendor on enrollment from day one (deferred: third-party dependency; honeypot + form-age + rate limits are the MVP floor, and the vendor seam stays open).
- Decision: defaults (DRF throttles, per-scope): enrollment POST 20/min/IP and 60/hour/program; ledger earn 60/min/staff-user; tenant API 120/min/credential (per-tenant configurable); everything else 120/min/user. 429 with `RATE_LIMITED` and Retry-After. Enrollment additionally: honeypot field + minimum form-age check (no CAPTCHA vendor in MVP; the seam exists), and per-program enrollment spikes surface in ops logs. Limits live in settings, tunable without deploy.
- Source: verifier missing links; backend §8.2 numbers adopted.

### ADR-44: Canonical naming, and the status of the draft model files
- Status: Accepted (verifier conflict resolutions + skill review)
- Context: the four reports and five skill drafts each invented slightly different names for the same concepts (`LedgerEvent`/`LedgerEntry`, `CustomerProgramBalance`/`Pass`/`Balance`, `StaffProfile`/`StaffMember`/`Membership`, `TenantManager`/`TenantScopedManager`), and the verifier made consistent naming a synthesis condition.
- Alternatives: keep each member's local names inside their own area (rejected: two names for one concept is precisely the drift the verifier flagged, and the skills would teach contradictions).
- Decision: The canonical names table at the top of this file is binding for code, docs, skills, and tests: `LedgerEntry`, `Balance`, `Pass`, `Membership`/`MembershipLocation`, `TenantScopedManager`, `pass_record`/`pass_id`, `ApiCredential`, `WebhookSubscription`, `WebhookDelivery`, `PassUpdate` (outbox), `AuditEvent`. Rejected variants (`LedgerEvent`, `CustomerProgramBalance`, `StaffProfile`, `StaffMember` as a table, `TenantManager`, `ApplePass`/`GooglePass` as separate models) must not appear in new code. The files in `plan/django/*.py` are **illustrative drafts**: they predate these rulings (balances on `Pass`, single-location membership, JWT auth, typos like `Asia/Kuwaitt`, `is_delleted`, `quantityt`, `progam_id`, `quatity`). Phase 0 rewrites them as real Django apps following the django-data skill; nothing copies from them verbatim. The loyalty-domain-glossary skill is corrected to these names (it is the naming authority for domain terms, EN/AR labels, and invariants).
- Source: verifier model review, conflicts 2/3, skill review.

---

## Mapping: every member proposal → ruling

| Proposal | Member | Ruling |
|---|---|---|
| PD-scope-1 one program model | requirements | ADR-26 Accepted |
| PD-scope-2 ledger-derived balances | requirements | ADR-27 Accepted (via ADR-4/6/8) |
| PD-scope-3 program-level relevant locations | requirements | ADR-15 Accepted with changes |
| PD-scope-4 no plans/billing before P8 | requirements | ADR-28 Accepted |
| PD-scope-5 export standard | requirements | ADR-29 Accepted |
| PD-scope-6 self-sign passes | requirements | ADR-24 Accepted with changes |
| PD-scope-7 analytics filters day one | requirements | ADR-30 Accepted |
| PD-scope-8 coupon void at counter | requirements | ADR-31 Accepted |
| PD-DM-1 shared schema tenancy | data-model | ADR-32 Accepted with changes |
| PD-DM-2 session auth (dashboard) | data-model | ADR-2 Accepted; its "tenant API uses JWT" half Rejected by ADR-1 |
| PD-DM-3 self-sign | data-model | ADR-24 Accepted with changes |
| PD-DM-4 hybrid IDs | data-model | ADR-33 Accepted |
| PD-DM-5 soft/hard delete split | data-model | ADR-34 Accepted with changes |
| PD-DM-6 per-style config tables | data-model | ADR-16 Accepted with changes |
| PD-BACKEND-1 self-sign | backend | ADR-24 Accepted with changes |
| PD-BACKEND-2 session + HMAC | backend | ADR-1, ADR-2 Accepted |
| PD-BACKEND-3 API versioning | backend | ADR-14 Accepted with changes (typo fixed) |
| PD-BACKEND-4 ledger is truth, pass projection | backend | ADR-4 Accepted |
| PD-BACKEND-5 shared schema, no RLS | backend | ADR-32 Accepted with changes |
| PD-BACKEND-6 billing deferred with criteria | backend | ADR-28 Accepted |
| PD-FE-1 pnpm workspace, two apps | frontend | ADR-35 Accepted |
| PD-FE-2 TanStack Query + polling | frontend | ADR-36 Accepted |
| PD-FE-3 RHF + Zod mirrors | frontend | ADR-37 Accepted |
| PD-FE-4 client idempotency key | frontend | ADR-38 Accepted (conformed to ADR-13) |
| PD-FE-5 i18next + logical RTL | frontend | ADR-39 Accepted with changes |
| PD-FE-6 `?loc=` param | frontend | ADR-40 Accepted |
| PD-FE-7 QueryState + design-skill layer | frontend | ADR-41 Accepted |

Rejected outright: JWT as the tenant-API mechanism (ADR-1); balances on `Pass` / `CustomerProgramBalance` as written (ADR-4); process-global tenant context (ADR-11); single-location membership (ADR-12); plaintext webhook secrets (ADR-18); `DecimalField(12,3)` as the money representation (ADR-21); unguarded `all_tenants()` (ADR-19); short-lived signed enrollment token as the enrollment URL (ADR-3).

Deferred: per-tenant Apple/Google issuer credentials (post-MVP, path documented in ADR-24); billing provider choice (P8 trigger, criteria in ADR-28); OpenAPI→Zod codegen (trigger: API surface stable, ADR-37); materialized analytics views (trigger: tenant event volume, ADR-30); realtime counter push (trigger: evidence, ADR-36); NFC (P3+ seam, requirements catalogue).
