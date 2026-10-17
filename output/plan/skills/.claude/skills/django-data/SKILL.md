---
name: django-data
description: Use when adding a Django model, writing a migration, or designing a new tenant-scoped table in backend/apps. Covers app layout, canonical model names, the TenantScopedManager with contextvars, direct tenant_id and composite same-tenant foreign keys, constraint patterns, the append-only ledger trigger, and the tenant-isolation pytest that must accompany every model.
---

# Django data conventions

## Quick start

Every tenant-owned model follows these rules:

1. Inherit `TenantOwnedModel` (from `apps/tenants/models.py`): direct `tenant` FK, `objects = TenantScopedManager()`, fenced `cross_tenant` manager. The base is abstract and **declares no primary key** (round 2 F-DB-3).
2. Declare the pk on each concrete model: `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)` for public-facing tables; `id = models.BigAutoField(primary_key=True)` for internal join tables (ADR-33). Do not inherit a pk.
3. `created_at` / `updated_at` timestamptz; `created_by` (nullable) where a user acts.
4. Explicit `Meta.db_table` (snake_case plural) and explicitly named constraints/indexes.
5. Composite same-tenant foreign keys for every multi-parent relation (ADR-10).
6. A tenant-isolation pytest trio (below) before the PR is reviewable.

Canonical model names are binding (loyalty-domain-glossary): `LedgerEntry`, `Balance`, `Pass`, `Membership`, `MembershipLocation`, `TenantScopedManager`, `ApiCredential`, `WebhookSubscription`, `WebhookDelivery`, `PassUpdate`, `AuditEvent`. `LedgerEntry.pass_record` has `db_column="pass_id"`.

## App layout

```
backend/
  apps/
    tenants/     # Tenant, Location, Membership, MembershipLocation, ApiCredential, platform.py
    users/       # User
    programs/    # Program, style configs, ProgramDesign, ProgramLocation, Reward, EnrollmentField, ...
    customers/   # Customer, Enrollment
    ledger/      # LedgerEntry, Balance (append-only log + cached aggregate)
    passes/      # Pass, DeviceRegistration, PassUpdate (outbox)
    webhooks/    # WebhookSubscription, WebhookDelivery
    audit/       # AuditEvent
```

One app per domain. No circular imports. Cross-app FKs use string references: `"customers.Customer"`. Shared abstractions (base model, manager) live in `apps/tenants/`.

## The tenant base model and manager

```python
# apps/tenants/models.py
import contextvars
from django.db import models

_current_tenant: contextvars.ContextVar["Tenant | None"] = contextvars.ContextVar(
    "current_tenant", default=None)

class TenantNotSupplied(Exception):
    pass

class TenantScopedManager(models.Manager):
    def get_queryset(self):
        qs = super().get_queryset()
        tenant = _current_tenant.get()
        if tenant is None:
            return qs.none()          # fail closed: never leak, never raise on reads
        return qs.filter(tenant=tenant)

    def for_tenant(self, tenant):     # the explicit form: required in services and Celery tasks
        return super().get_queryset().filter(tenant=tenant)

class TenantOwnedModel(models.Model):
    # No pk here (round 2 F-DB-3): each concrete model declares its own —
    # UUIDField for public-facing tables, BigAutoField for internal join
    # tables (ADR-33). An inherited UUID pk would contradict ADR-33.
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantScopedManager()
    cross_tenant = models.Manager()   # fenced: AST checker allowlist only (see rules)

    class Meta:
        abstract = True
```

Rules:

- Tenant context is the contextvar, set by `TenantMiddleware` and reset in a `finally`. Never a class attribute or a bare thread-local (a process-global leaks across requests — ADR-11).
- Services, management commands, and Celery tasks never rely on the contextvar; they call `.for_tenant(tenant)` explicitly. Implicit filtering is defense-in-depth for request paths only.
- Writes without a tenant raise `TenantNotSupplied` (enforced in `TenantOwnedModel.save()` when `tenant_id` is None).
- `cross_tenant` may be accessed only from `apps/tenants/platform.py`, `apps/passes/tasks.py` and `apps/webhooks/tasks.py` (outbox-driven tasks only, by primary key, each use audited), migrations, and the reconciliation job. The fence is an **attribute-access AST checker** (`scripts/check_cross_tenant.py` in CI), not an import grep — `Model.cross_tenant` is attribute access, nothing is imported, so an import check would catch zero violations (round 2 F-DB-5/F-verifier-2). Every use writes an `AuditEvent`.
- Parent tables declare `UniqueConstraint(fields=["id", "tenant_id"])` so children can reference the pair.

## Composite same-tenant relations (ADR-10)

A join row must prove both parents belong to the same tenant, in the database:

```python
class ProgramLocation(TenantOwnedModel):
    program = models.ForeignKey("programs.Program", on_delete=models.CASCADE)
    location = models.ForeignKey("tenants.Location", on_delete=models.CASCADE)
    # tenant_id is inherited; composite FKs pin both parents to it
    class Meta:
        db_table = "program_locations"
        constraints = [
            models.UniqueConstraint(fields=["program", "location"], name="uq_program_locations_program_location"),
            models.UniqueConstraint(fields=["id", "tenant_id"], name="uq_program_locations_id_tenant"),
            models.ForeignKeyConstraint(  # expressed via db constraints in the migration
                ["program_id", "tenant_id"], ["programs.id", "tenant_id"],
                name="fk_program_locations_program_tenant"),
            models.ForeignKeyConstraint(
                ["location_id", "tenant_id"], ["locations.id", "tenant_id"],
                name="fk_program_locations_location_tenant"),
        ]
```

(Django needs `ForeignKey(..., db_constraint=False)` plus the explicit `ForeignKeyConstraint`s, or `RunSQL`; the django-data tests include a working template.) An id from tenant B then physically cannot attach to tenant A's program. The same pattern guards `Pass` (customer+tenant, program+tenant), `Balance`, `MembershipLocation`, and `LedgerEntry`.

## Constraint patterns

- Unique per tenant: `UniqueConstraint(fields=["tenant", "name"], name="uq_<table>_tenant_name")`.
- Idempotency: `UniqueConstraint(fields=["tenant", "idempotency_key"], name="uq_ledger_entries_tenant_idempotency_key")`.
- Non-negative balances: `CheckConstraint(check=Q(stamps_current__gte=0), name="ck_balances_stamps_current_nonnegative")` — one per balance column.
- Balance-event pairing (ADR-5/6): a check constraint tying `event_type IN ('earn','redeem','reward_issued')` to `balance_id/previous_balance/new_balance` all non-null, and all other types to all-null.
- Append-only ledger: a `RunSQL` migration installs a trigger rejecting UPDATE and DELETE on `ledger_entries`. Test it with raw SQL.
- `RunSQL` also for `CREATE INDEX CONCURRENTLY` and partial indexes the ORM cannot express.

## Adding a tenant-scoped model (checklist)

1. Pick the app; check the glossary for the canonical name (add the term there in the same PR if new).
2. Inherit `TenantOwnedModel` (or justify a non-tenant table in the PR against an ADR).
3. Add composite same-tenant FKs for every relation to another tenant-owned row.
4. Add `Meta`: `db_table`, named constraints, indexes for the real query patterns.
5. `makemigrations <app>`; read the migration by hand (constraint names, no destructive ops).
6. Register in admin as read-only if it is ledger-adjacent (`Balance`, `LedgerEntry` are read-only or unregistered).
7. Write the isolation trio test (below) and the cross-tenant relation-attach test.
8. If serializers/views follow, the tenant field is never in the serializer; it is set from `request.tenant`.

## Migrations

- Always name constraints and indexes explicitly.
- Never add and drop a column's replacement in the same migration; use `SeparateDatabaseAndState` for data migrations.
- `makemigrations --check --dry-run` runs in CI: an uncommitted migration fails the build.

## Pytest: tenant isolation (required for every model)

```python
def test_tenant_isolation(db, tenant_a, tenant_b):
    obj = MyModel.objects.for_tenant(tenant_a).create(name="x")

    # reads under the other tenant see nothing
    assert MyModel.objects.for_tenant(tenant_b).count() == 0
    # fail-closed manager without context
    assert MyModel.objects.count() == 0

def test_cross_tenant_relation_rejected(db, tenant_a, tenant_b, program_a, location_b):
    with pytest.raises(IntegrityError):
        with transaction.atomic():
            ProgramLocation.objects.for_tenant(tenant_a).create(
                program=program_a, location=location_b, tenant=tenant_a)
```

A suite-level test enumerates all tenant-owned models and fails if any lacks `tenant_id`, the manager, or its isolation test (ADR-32).

## Naming

- Model PascalCase singular; table snake_case plural; FK field `customer` (Django adds `_id`); related names plural (`program.passes.all()`).
- Constraints: `uq_<table>_<fields>`, `ck_<table>_<rule>`, `fk_<table>_<purpose>`, `idx_<table>_<fields>`.
- Money columns are `*_minor` BigInt (integer minor units, ADR-21); balances are plain integers.

## Common pitfalls

- Relying on the implicit contextvar filter inside a Celery task (there is no request context): always `.for_tenant(tenant)`.
- Balances updated outside `ledger.services` — never; `Balance` writes happen only inside the entry's transaction (ADR-4).
- Serializers accepting `tenant_id` from the client — never.
- A join table with plain FKs and no composite tenant constraint — the DB cannot stop a cross-tenant attach.
- Copying from the illustrative drafts in `plan/django/*.py` — they predate the ADRs (ADR-44).

## Additional resources

- Rulings: `decisions.md` ADR-4, 5, 6, 8, 10, 11, 21, 32, 33, 44
- Endpoint/service conventions: django-backend skill; end-to-end recipe: feature-delivery skill
