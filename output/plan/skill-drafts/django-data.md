---
name: django-data
description: Use when adding a Django model, writing a migration, or designing a new tenant-scoped table. Covers app layout, naming, the tenant-scoped manager, constraint patterns, and the pytest that must accompany every model.
---

# Django Data

## Quick start

Every tenant-owned model follows these rules:

1. Import the tenant manager from `apps.tenants.models`
2. Set `objects = TenantScopedManager()`
3. Add `tenant = ForeignKey(Tenant, on_delete=CASCADE)`
4. Use `Meta.db_table` (no prefix)
5. Add indexes for the common query patterns
6. Write a tenant-isolation pytest

## App layout

```
backend/
  apps/
    tenants/        # Tenant, Location, Membership, Beacon, APICredential
    programs/        # Program, ProgramDesign, Reward, EnrollmentField, ...
    customers/       # Customer, CustomerEnrollment
    ledger/          # LedgerEntry (append-only)
    passes/          # Pass (wallet pass), PushMessage
```

One Django app per domain. No circular imports. Cross-app FKs use string references: `"customers.Customer"`.

## Required fields

Every model with an owner:

```python
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="...")
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)
```

Models with user attribution add:

```python
created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
```

## The tenant manager

```python
class TenantScopedManager(models.Manager):
    _current_tenant = None

    def get_queryset(self):
        qs = super().get_queryset()
        if self._current_tenant:
            return qs.filter(tenant=self._current_tenant)
        return qs.none()  # safe default: empty

    def for_tenant(self, tenant):
        return super().get_queryset().filter(tenant=tenant)
```

The middleware sets `TenantScopedManager.set_current_tenant(request.tenant)` at the start of every request. Every view, service, and command uses the scoped queryset by default.

**What a forgotten manager leaks:** A queryset without `.for_tenant()` returns rows from every tenant. The `get_queryset` override returns `none()` when no tenant is set, so forgotten tenant filtering returns zero results rather than leaking data.

## Constraint patterns

### Unique per tenant
```python
class Meta:
    constraints = [
        models.UniqueConstraint(fields=["tenant", "name"], name="uq_<model>_tenant_name"),
    ]
```

### Idempotency
```python
models.UniqueConstraint(fields=["tenant", "idempotency_key"], name="uq_<model>_idempotency")
```

### Check constraint
```python
models.CheckConstraint(check=models.Q(balance__gte=0), name="ck_balance_nonnegative")
```

### RunSQL where ORM cannot express
```python
migrations.RunSQL(
    "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_tenant_date ON ledger_entries (tenant_id, created_at)",
    reverse_sql="DROP INDEX IF EXISTS idx_ledger_tenant_date",
)
```

Use `RunSQL` for: concurrent index creation, partial indexes with conditions the ORM cannot express, and database functions.

## Adding a new tenant-scoped model

1. Choose the app (tenants, programs, customers, ledger, passes)
2. Create the model with `tenant`, `id` (UUID), timestamps
3. Add `objects = TenantScopedManager()`
4. Add indexes and constraints in Meta
5. Run `python manage.py makemigrations <app>`
6. Write the tenant-isolation pytest
7. Add the model to `apps/<app>/admin.py` (register with `TenantScopedAdmin`)

## Migrations

- Always name constraints and indexes explicitly
- Check the generated migration for `RunSQL DEFFERED` on constraint creation
- Never delete a column in the same migration that adds a replacement
- Use `SeparateDatabaseAndState` for data migrations

## Pytest: tenant isolation

Every new model must have a test that proves tenant A cannot read or write tenant B:

```python
def test_tenant_isolation(db):
    tenant_a = Tenant.objects.create(name="A", slug="a")
    tenant_b = Tenant.objects.create(name="B", slug="b")

    # Create under tenant A
    TenantScopedManager.set_current_tenant(tenant_a)
    obj = MyModel.objects.create(name="test")

    # Tenant B cannot see it
    TenantScopedManager.set_current_tenant(tenant_b)
    assert MyModel.objects.count() == 0

    # Tenant B cannot access it by id
    with pytest.raises(MyModel.DoesNotExist):
        MyModel.objects.get(id=obj.id)
```

## Naming conventions

- Model: PascalCase, singular (Customer, not Customers)
- Table: snake_case, plural (customers)
- FK: `model_name` (e.g. `customer`, not `customer_id`; Django adds `_id`)
- Related name: plural of the reverse relation (`program.passes.all()`)
- Constraint: `uq_<table>_<fields>` for unique, `ck_<table>_<rule>` for check

## Common pitfalls

- Forgetting `.for_tenant()` on a raw queryset. Use the manager override; it returns empty when no tenant is set.
- Using `.get()` without tenant scope. Prefer `.filter(tenant=).first()` or wrap in try/except.
- Serializers that accept a tenant_id from the client. Never trust client-side tenant selection.
- Balance fields that are updated directly. Always go through the ledger service (`LedgerService.earn()`).
