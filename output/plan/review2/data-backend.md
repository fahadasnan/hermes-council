# Data model, Django API, security and worker audit (round 2)

Reviewer: cartographer. Date: 2026-10-17. Brief: `briefs/data-backend.md`; common rules in `briefs/common.md`.

Audit targets: `data-model.md`, `django/*.py`, `backend.md`, the database/backend parts of `CONVENTIONS.md`, and the `django-data`, `django-backend`, `loyalty-platform-architecture` skills (`.cursor` and `.claude` copies, verified identical by `check-skills.mjs`).

Checks run:
- `node /Users/fahad/council/check-skills.mjs /Users/fahad/council/output/plan/skills` → OK (7 skills, trees identical).
- `node /Users/fahad/council/check-mermaid.mjs` on `backend.md`, `data-model.md`, `CONVENTIONS.md`, `IMPLEMENTATION_PLAN.md` → all diagrams parse (4, 4, 1, 2).
- Django 5.2 `manager.py` source read from the canonical repo to verify manager method resolution (evidence in F-DB-1/F-DB-2).
- Apple PassKit "Updating a Pass" doc read to verify the push model the plan depends on (no finding — see "Verified accurate").
- Django composite-PK docs read to verify the composite-FK claim (corroborates plan-skills-audit's F-SKILL-1).

Round-1 status note: every verifier HIGH finding from `review.md` is addressed by an ADR (ADR-4/5/6/8/9/10/11/12/13/17/18/21/22), and ADR-44 explicitly demotes the `plan/django/*.py` drafts and the round-1 `data-model.md`/`backend.md` specifics to "illustrative drafts, superseded". I therefore audit the **current binding layer** (ADRs → CONVENTIONS → skills → IMPLEMENTATION_PLAN) and flag only what is still wrong or newly wrong there.

---

### F-DB-1: The django-backend skill's canonical `earn()` example cannot run — `select_for_update()` chained before `for_tenant()` raises `AttributeError`
- Severity: **major** (the skill is the authority Phase 0 rewrites the models from, per ADR-44; it teaches an unbuildable pattern and the exact bug its own pitfall list warns about)
- Location: `skills/.claude/skills/django-backend/SKILL.md` §"The ledger service pattern", line 96: `balance = Balance.objects.select_for_update().for_tenant(tenant).get(id=balance_id)`
- Problem: `select_for_update()` exists on the **manager** only because `BaseManager._get_queryset_methods` copies queryset methods onto it; calling it returns a plain `QuerySet`. `for_tenant` is defined on `TenantScopedManager` only, and `QuerySet` has no `__getattr__` passthrough — so `.for_tenant(...)` on the returned queryset raises `AttributeError: 'QuerySet' object has no attribute 'for_tenant'`. An agent copying the canonical example gets a crash at the first earn; a "fix by instinct" reorder that keeps manager methods after queryset methods would also silently drop the `FOR UPDATE` clause if anyone wrote `for_tenant()` (manager) after a queryset method chain.
- Evidence: Django 5.2 `django/db/models/manager.py` (read from https://raw.githubusercontent.com/django/django/stable/5.2.x/django/db/models/manager.py): `class Manager(BaseManager.from_queryset(QuerySet))`, `_get_queryset_methods` → `manager_method` returns `getattr(self.get_queryset(), name)(...)`; `TenantScopedManager.for_tenant` calls `super().get_queryset()` which yields a fresh `QuerySet` with no `for_tenant`.
- Fix: in django-backend (both copies) change the line to
  `balance = Balance.objects.for_tenant(tenant).select_for_update().get(id=balance_id)`
  and add to "Common pitfalls": "**Chaining manager-only methods after queryset methods** (`objects.select_for_update().for_tenant(t)`) — manager helpers (`for_tenant`) exist only on the manager; once you call a queryset method you get a `QuerySet` and manager helpers are gone (AttributeError). Always start with `.for_tenant(tenant)`." Same repair in any service snippet that chains (`_fanout_webhooks`, `PassUpdate.objects.for_tenant(...)` usages are fine as written).
- Affects: `django-backend` skill (both trees); no ADR change (ADR-6/8 semantics unaffected); the django-data skill's `TenantScopedManager` definition is fine as-is.

### F-DB-2: Outbox-driven Celery tasks are unbuildable as specified — the fail-closed manager makes `PassUpdate.objects.get(...)` always raise, and the `cross_tenant` allowlist gives tasks no legal accessor
- Severity: **major** (every pass push and webhook delivery task — the worker half of the ledger-vs-projection contract, ADR-17 — fails at its first line)
- Location: `skills/.claude/skills/django-backend/SKILL.md` §"Celery tasks" line 137 (`pu = PassUpdate.objects.get(id=pass_update_id)`); `CONVENTIONS.md` §5 rules 3–5; `decisions.md` ADR-11 (allowlist: "platform.py, migrations, and the reconciliation job"); `IMPLEMENTATION_PLAN.md` Phase 2/3 worker tasks.
- Problem: `PassUpdate.objects` is the `TenantScopedManager`; in a Celery worker there is no request context, `get_queryset()` fails closed and returns `none()`, so `.get(id=...)` raises `PassUpdate.DoesNotExist` **always** — the task can never succeed. The skill's own pitfall list says tasks must not rely on the contextvar, but its example does exactly that (plain `objects`). The escape hatch `Model.cross_tenant` is forbidden everywhere except `apps/tenants/platform.py`, migrations, and the reconciliation job — so outbox tasks have no legal way to read their row. Two contradictions: the example vs the pitfall text, and the task signature vs the fence.
- Evidence: `CONVENTIONS.md` §5.4 "No tenant set → reads return `none()`"; §5.5 allowlist excludes `apps/passes/tasks.py`; django-backend line 137 uses `PassUpdate.objects.get`. Manager fail-closed behavior verified in the django-data skill's own `TenantScopedManager.get_queryset` (`return qs.none()` when the contextvar is unset).
- Fix (paste-ready):
  1. django-backend §"Celery tasks": `pu = PassUpdate.cross_tenant.get(id=pass_update_id)` with comment `# fenced manager: outbox tasks are context-free; every use writes an AuditEvent`.
  2. `decisions.md` ADR-11 and `CONVENTIONS.md` §5.5: extend the allowlist to "`apps/tenants/platform.py`, `apps/passes/tasks.py`, `apps/webhooks/tasks.py` (outbox-driven tasks only, by primary key, each use audited), migrations, and the reconciliation job".
  3. Add a django-backend pitfall: "**`Model.objects.get()` inside a Celery task** — the contextvar is unset in workers, the fail-closed manager returns `none()`, and every `.get()` raises `DoesNotExist`. Outbox tasks read their row via `Model.cross_tenant` (audited) or an explicit `.for_tenant(tenant_id)` after resolving the tenant from the row."
- Affects: `django-backend` skill, `CONVENTIONS.md` §5.5, `decisions.md` ADR-11, `IMPLEMENTATION_PLAN.md` Phase 2 Epic 2.6 / Phase 5 Epic 5.3 acceptance tests ("killing the worker mid-flow … delivers the pending pass update" would otherwise never pass).

### F-DB-3: `TenantOwnedModel` hardcodes a UUID primary key, contradicting ADR-33's bigserial join tables
- Severity: **major** (a direct ADR-vs-skill contradiction in the base class every Phase 0 model inherits)
- Location: `skills/.claude/skills/django-data/SKILL.md` §"The tenant base model and manager" (lines 62–73: `class TenantOwnedModel(models.Model): id = models.UUIDField(primary_key=True, ...)`), §"Quick start" rule 2; `decisions.md` ADR-33; ADR-10/CONVENTIONS §5.2 ("every tenant-owned model inherits `TenantOwnedModel`").
- Problem: ADR-33 mandates bigserial PKs for the internal join tables `MembershipLocation`, `EnrollmentField`, `ProgramLocation`, `UsefulLink`, `CustomField`, `StampImage`, `ProgramSettings`; ADR-10 + CONVENTIONS §5.2 + the django-data skill's own rule 1 mandate that **every** tenant-owned model inherits `TenantOwnedModel` — which declares the pk as UUID. A join table cannot satisfy both. An agent inherits the base and silently ships UUID PKs on hot join tables (index bloat ADR-33 exists to avoid), or skips the base and loses the manager/fence/checklist.
- Evidence: ADR-33 ("Pure internal/join tables (`MembershipLocation`, `EnrollmentField`, `ProgramLocation`, `UsefulLink`, `CustomField`, `StampImage`, `ProgramSettings`) use bigserial"); django-data skill lines 62–73 (`id = models.UUIDField(primary_key=True ...)` inside the abstract base) and line 12 ("every tenant-owned model follows these rules: 1. Inherit `TenantOwnedModel`").
- Fix: remove the `id` field from the abstract `TenantOwnedModel` in the django-data skill (keep `tenant`, timestamps, `objects`, `cross_tenant`), and restate rule 2: "Declare the pk on each concrete model: `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)` for public-facing tables; `id = models.BigAutoField(primary_key=True)` for internal join tables (ADR-33). Do not inherit an pk." Update the `ProgramLocation` example accordingly (it inherits the base and must add its own `BigAutoField` pk).
- Affects: `django-data` skill (both trees); `IMPLEMENTATION_PLAN.md` Phase 0 Epic 0.2 (the base model task); ADR-33 and ADR-10 need no change (the skill was wrong, not the ADRs).

### F-DB-4: Phase placement contradiction — Phase 2 enrollment and the Phase 3 ledger service write tables that are created in Phase 3 and Phase 5
- Severity: **major** (unbuildable as sequenced: Phase 2 code writes to a table that does not exist; Phase 3 service code queries two tables that do not exist)
- Location: `decisions.md` ADR-9 (enrollment transaction "append `enroll` `LedgerEntry` … outbox row"), `IMPLEMENTATION_PLAN.md` Phase 2 "Database work" (no `ledger_entries`), Phase 3 "Database work" (`ledger_entries` + trigger), Phase 3 "Django services" (`_fanout_webhooks` in the django-backend skill's canonical `earn()`), Phase 5 "Database work" (`webhook_subscriptions`, `webhook_deliveries`).
- Problem: (a) ADR-9 makes the Phase 2 `customers.services.enroll()` append an `enroll` `LedgerEntry`, but `ledger_entries` (table + append-only trigger) is Phase 3 database work — Phase 2 as scoped cannot write the enrollment event that analytics later counts as the acquisition source. (b) The canonical `earn()` in the django-backend skill (Phase 3) calls `_fanout_webhooks(tenant, entry)`, which must query `WebhookSubscription` and write `WebhookDelivery` rows — both tables arrive in Phase 5. Phase 3's text says delivery "stays dark … (outbox rows accumulate only if subscriptions exist — none yet)", but even reading subscriptions crashes when the table is missing.
- Evidence: IMPLEMENTATION_PLAN Phase 2 Database work lists `programs`, `passes`, `customers` apps only; Phase 3 Database work creates `ledger_entries`/`balances`; Phase 5 Database work creates `api_credentials`, `webhook_subscriptions`, `webhook_deliveries`. ADR-9/ADR-17 and CONVENTIONS §7.1 put the `enroll` entry and the delivery-row fanout inside the write transactions.
- Fix (paste-ready):
  1. Move into Phase 2 "Database work" (Epic 2.7): "`ledger_entries` table (all columns per ADR-5/6, unique `(tenant, idempotency_key)`, the balance-events check constraint, the UPDATE/DELETE trigger via `RunSQL`) — used by `enroll` events only until Phase 3; no `Balance` yet." Acceptance line: "enrollment appends an `enroll` ledger entry (re-enrollment replays it idempotently per ADR-9)."
  2. Move `webhook_subscriptions` + `webhook_deliveries` **schema** creation from Phase 5 into Phase 3 "Database work" ("tables exist, empty — no subscription UI until Phase 5"), keeping all Phase 5 credential/subscription UI, HMAC middleware, and delivery tasks in Phase 5. Phase 5's Database work then reads "no new tables".
  3. Add a Phase 3 note: "`_fanout_webhooks` returns zero rows while no subscriptions exist (the tables exist from this phase)."
- Affects: `IMPLEMENTATION_PLAN.md` Phase 2/3/5 database work, epics 2.7, 3.1, 5.3 and their acceptance criteria; `decisions.md` ADR-9/17 unchanged in substance.

### F-DB-5: The `cross_tenant` fence is specified as an import check, but usage is attribute access — the CI gate as written is vacuous
- Severity: **major** (a security control that is specified but unenforceable as written; the fence is the only thing keeping `all_tenants`-style reads out of request paths)
- Location: `decisions.md` ADR-11 ("A lint rule (flake8 plugin or grep-based CI check) fails any other **import**"); `CONVENTIONS.md` §5.5 ("`cross_tenant` is import-restricted (CI grep check)"); django-data skill line 80; django-backend pitfall ("Trusting `cross_tenant` outside platform.py → CI fails").
- Problem: The fenced manager is reached by **attribute access** (`Program.cross_tenant.all()`), not by importing anything — there is no `cross_tenant` symbol to import, and `Model.cross_tenant` resolves through the descriptor. A grep/CI check restricted to imports catches zero violations while passing green. Every document specifies the gate in import terms, so the build implements a check that proves nothing and the fence is effectively decorative.
- Evidence: django-data skill `TenantOwnedModel` (`cross_tenant = models.Manager()` — an attribute, read via `Model.cross_tenant`); no import is required or possible for attribute access.
- Fix: standardize on an **attribute-access lint**: a small AST checker script (`scripts/check_cross_tenant.py`, run in CI backend job) that fails any `Attribute`/`AttributeAccess` node ending in `.cross_tenant` outside the allowlist files (per F-DB-2's extended list) — e.g. built on `ast` or as a flake8 plugin (`flake8-cross-tenant`). Update ADR-11, CONVENTIONS §5.5 ("**attribute-access lint** (`scripts/check_cross_tenant.py`), not an import grep — attribute access cannot be import-checked"), and both skills' wording. Alternative accepted: funnel all cross-tenant access through one function `apps/tenants/platform.py:cross_tenant(model)` so the symbol really is importable and import-greppable; pick one in the ADR.
- Affects: ADR-11, `CONVENTIONS.md` §5.5, django-data + django-backend skills, Phase 0 Epic 0.2 (the "cross_tenant fence + CI grep check" task becomes the AST checker task).

### F-DB-6 (corroboration): `models.ForeignKeyConstraint` does not exist in Django 5.2 — the composite same-tenant FK must be `RunSQL`
- Severity: **major** (independensively confirmed; filed by plan-skills-audit as F-SKILL-1 — recorded here because django-data is in this brief's scope and ADR-10/ADR-32 depend on this mechanism)
- Location: `skills/.claude/skills/django-data/SKILL.md` §"Composite same-tenant relations" (the `Meta.constraints` block).
- Evidence: https://docs.djangoproject.com/en/stable/topics/composite-primary-key — "Relationship fields, including generic relations do not support composite primary keys"; `ForeignObject` "doesn't create … foreign key constraints or indexes in the database". `Meta.constraints` accepts `CheckConstraint`, `UniqueConstraint`, `ExclusionConstraint`, `DeferrableUniqueConstraint` (https://docs.djangoproject.com/en/stable/ref/models/constraints/). No `ForeignKeyConstraint` class exists in `django.db.models`.
- Fix: as in plan-skills-audit F-SKILL-1 (`db_constraint=False` + `RunSQL` composite FKs in the migration + a pitfall entry). Additionally the parent-side prerequisite must be stated in the skill: Postgres requires the referenced `(id, tenant_id)` pair to be backed by a unique constraint on the **parent** table — the skill's line "Parent tables declare `UniqueConstraint(fields=['id','tenant_id'])`" is correct and must stay.
- Affects: django-data skill only (both trees).

### F-DB-7: The read-only Django admin the django-data checklist registers is unreachable — the fail-closed manager and the fence leave it no legal queryset
- Severity: **minor**
- Location: `skills/.claude/skills/django-data/SKILL.md` checklist step 6 ("register in admin as read-only if it is ledger-adjacent"); `CONVENTIONS.md` §5.4/§5.5.
- Problem: Django admin reads through `Model.objects` (the scoped manager): with no contextvar in admin requests the list is permanently empty; using `cross_tenant` in `admin.py` violates the (extended per F-DB-2) allowlist and fails CI. So step 6 produces an admin that is either blank or illegal — nobody specified how admin (or any non-request, non-task context, e.g. `manage.py shell`) is supposed to see rows.
- Fix: replace step 6 with: "Register in admin only behind an explicit `TenantAdminMixin` whose `get_queryset` calls `.for_tenant(request.tenant)` derived from a selected membership (support session), or skip admin entirely for tenant-owned models (dashboard views are the surface). Add `admin.py` to the `cross_tenant` allowlist **only** if a read-only platform ModelAdmin is actually wanted, with audit events." Alternatively drop step 6.
- Affects: django-data skill; Phase 0 Epic 0.2 if admin scaffolding is in scope.

### F-DB-8: ADR-1's canonical HMAC header contract line is garbled
- Severity: **minor**
- Location: `decisions.md` ADR-1 "Canonical contract" first bullet: "`X-Api-Key: *** `X-Timestamp: <unix_seconds>` …"
- Problem: The binding contract's first header has a masked value pasted where the placeholder belongs and a missing closing backtick — an agent transcribing the canonical contract gets a malformed header line (`X-Api-Key: ***`), and the `X-Signature` bullet is the only well-formed one.
- Fix: rewrite the bullet as: "- Headers: `X-Api-Key: <key_id>`, `X-Timestamp: <unix_seconds>`, `X-Signature: hex(HMAC-SHA256(secret, signing_string))`."
- Affects: `decisions.md` only; the skills (`django-backend`, `loyalty-platform-architecture`) already state it correctly.

---

## Tenant isolation: attack paths tried (brief item 1)

Per model (current binding layer, i.e. the ADR-10/11 pattern the skills teach; the `django/*.py` drafts are exempt per ADR-44):

| Attack path | Result |
|---|---|
| Viewset queryset without tenant filter | Fail-closed `TenantScopedManager.get_queryset()` → `none()`; CONVENTIONS §5.4 + django-backend "explicit, not the implicit contextvar" — safe. |
| Client-sent `tenant_id` in body/URL/param | ADR-1/2/3 + CONVENTIONS §5.1 ban it; serializers never carry tenant (django-backend checklist step 1) — safe. |
| Cross-tenant relation attach (`ProgramLocation(program=A, location=B)`) | Composite same-tenant FKs (ADR-10) make it impossible at the DB — **but only after F-DB-6's RunSQL fix**; as the skill stands today the pattern is unbuildable (major). |
| Cross-tenant read by guessed UUID | 404-not-403 policy (CONVENTIONS §5.8, error table) — safe. |
| Threaded/async request bleed on tenant context | contextvar + fail-closed + Phase 0 concurrency test (ADR-11) — safe. |
| Celery payload inheriting request tenant | ADR-11 "tasks pass the tenant explicitly" — **broken in practice**: the canonical task example ignores this (F-DB-2). |
| `all_tenants`/`cross_tenant` escape hatch from ordinary code | fence exists but its CI gate is vacuous as specified (F-DB-5). |
| Object-storage key as an IDOR vector | server-generated tenant-prefixed keys, validated prefixes (ADR-20) — safe. |
| Location scoping (brief item 2) | `MembershipLocation` M2M + `request.location_scope` set-ids + `?loc=` validated-against-scope (ADR-12/40); two-location staff test required in Phase 1 — safe; the round-1 single-FK draft is superseded (ADR-44). |

## Ledger integrity checks (brief item 3)

Commit-before-task: outbox row written in the ledger transaction, `on_commit` enqueues by row id, sweeper recovers lost enqueues (ADR-17) — sound. Idempotency: `(tenant, idempotency_key)` unique + fingerprint replay/conflict + concurrent-duplicate catch (ADR-13) — sound. Negative balances: `_signed_delta` + `Balance` check constraints + `INSUFFICIENT_BALANCE` (ADR-6/27) — sound. Append-only: DB trigger + unregistered/readonly admin + reconciliation (ADR-8) — sound, but see F-DB-7 (admin path). "Today" boundaries: event-location timezone with IANA validation (ADR-22) — sound. One gap: the `enroll` event's table is sequenced after the code that writes it (F-DB-4).

## Verified accurate (claims I checked rather than assumed)

- Apple pass-update model: APNs push with an **empty JSON payload**, device then re-fetches via the PassKit web service; `410` → delete registrations — matches Apple's "Updating a Pass" (https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Updating.html).
- ADR-23's Google class set and backend.md's REST resources match https://developers.google.com/wallet/reference/rest (offerClass exists; the round-1 data-model §1.3 "no coupon-specific class" nuance is superseded by ADR-23 anyway).
- ADR-22 `zoneinfo.available_timezones()` is the correct stdlib validation call.
- ADR-21 minor-unit integers with per-currency exponent is correct for KWD/BHD (3) and SAR/AED/QAR (2); ISO-4217 consistent.
- Money/stamps on the wire (decimal strings, integers) and "client-sent balances cannot be written" (services-only writes, ADR-4/27) are consistently specified across CONVENTIONS, django-backend, and the glossary-level docs.
- MVP write paths: every ledger mutation is a named service (`earn/redeem/issue_pass/void_pass/reward`) and CRUD-only resources are viewsets — consistent across backend.md §3.2, CONVENTIONS §4, django-backend checklist.
- Celery retry/dead-letter matrix (backend.md §6.2, django-backend tasks) is coherent with the outbox design; `acks_late` + idempotent tasks correct.
- The `django/*.py` drafts compile (verified in round 1) and every verifier flag against them maps to a live ADR — nothing round-1-flagged remains unfixed except via the skill bugs above, which ADR-44 makes load-bearing ("Phase 0 rewrites them following the django-data skill").

## Summary

| Id | Severity | Title |
|---|---|---|
| F-DB-1 | major | django-backend canonical `earn()` chain `select_for_update().for_tenant()` raises AttributeError |
| F-DB-2 | major | Outbox Celery tasks unreadable: fail-closed manager + `cross_tenant` allowlist leave no legal accessor |
| F-DB-3 | major | `TenantOwnedModel` UUID pk contradicts ADR-33 bigserial join tables |
| F-DB-4 | major | Phase 2/3 code writes `ledger_entries`/webhook tables created in Phase 3/5 |
| F-DB-5 | major | `cross_tenant` "import" CI gate is vacuous — usage is attribute access |
| F-DB-6 | major | (corroborates F-SKILL-1) `models.ForeignKeyConstraint` nonexistent; composite FK must be RunSQL |
| F-DB-7 | minor | Read-only Django admin unreachable through the fail-closed manager and fence |
| F-DB-8 | minor | ADR-1 canonical HMAC header line garbled |

Counts: 0 blockers, 6 major, 2 minor. 8 findings.