---
name: django-backend
description: Use when adding Django REST API endpoints, services, serializers, Celery tasks, or modifying the ledger. Covers project layout, tenant scoping, idempotency, permissions, pytest conventions, and local run commands.
---

# Django Backend Conventions

## Quick Start / Rules

### Run locally

```bash
cd backend
docker compose up -d      # Postgres + Redis
python manage.py migrate
python manage.py runserver
celery -A config worker -Q default,pass_push,webhooks -c 4 -l INFO
```

### Project layout

```
backend/
  config/               # Django settings, urls, wsgi, celery
    settings/
      base.py           # Shared settings, never imported directly by apps
      development.py    # from .base import *
      staging.py
      production.py
  apps/                 # One Django app per domain
    <app>/
      models.py         # Django models (tenant_id on every row)
      services.py       # Business logic (earn, redeem, enroll, publish)
      signer.py         # (passes only) Build .pkpass / JWT
      tasks.py          # Celery tasks (pass_push, fire_webhooks)
      permissions.py    # DRF permission classes
      api/
        views.py        # DRF viewsets and API views
        serializers.py  # Write boundary: validation + transformation
        urls.py
      tests/
        test_services.py
        test_api.py
        factories.py    # Factory boy factories
```

### Adding an endpoint

1. **Serializer** in `api/serialziers.py` — all validation lives here. Read and write serializers may differ.
2. **View** the right abstraction:
   - CRUD on one model → `ModelViewSet` + `TenantScopedModelViewSet` (custom base)
   - Business logic touching multiple models → `APIView` that calls a service
   - List endpoints → `ReadOnlyModelViewSet`
3. **URL** in `api/urls.py`, included in `config/urls.py` under `/api/v1/`.
4. **Permission** class: every view MUST have `permission_classes`. Base classes:
   - `IsOwner`: tenant owner only
   - `IsLocationManager`: owner or location manager
   - `IsStaff`: any authenticated staff user
   - `IsStaffOrApiCredential`: staff session OR HMAC-signed API request
   - `AllowAny`: enrollment only (scoped by signed token)
5. **Test** in `tests/test_api.py` — at minimum: auth required, tenant isolation, happy path.

### Tenant context

Never read `tenant_id` from request data, URL, or query string. Derive it from auth:

```python
# settings.py middleware
MIDDLEWARE = [
    ...
    'apps.tenants.middleware.TenantMiddleware',  # after auth
]

# In a view
class MyView(APIView):
    def get(self, request):
        # request.tenant is set by middleware
        programs = Program.objects.filter(tenant=request.tenant)
        # or use the scoped manager:
        programs = Program.objects.all()  # auto-filtered by TenantManager
```

The tenant manager:

```python
# apps/tenants/managers.py
class TenantManager(models.Manager):
    def get_queryset(self):
        if current_tenant := get_current_tenant():  # thread-local
            return super().get_queryset().filter(tenant=current_tenant)
        return super().get_queryset()

class TenantOwnedModel(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    objects = TenantManager()
    all_objects = models.Manager()  # admin only

    class Meta:
        abstract = True
```

### Idempotency

Every ledger write (earn, redeeem, void) MUST accept an `idempotency_key`. The service checks before creating the entry:

```python
# apps/ledger/services.py
def earn(*, customer_id, program_id, quantity, idempotency_key, ...):
    with transaction.atomic():
        # Check for duplicate
        existing = LedgerEntry.objects.filter(
            tenant=current_tenant, idempotency_key=idempotency_key
        ).first()
        if existing:
            raise IdemptencyConflict(existing)

        balance = CustomerProgramBalance.objects.select_for_update().get(...)
        balance.current_stamps += quantityt
        balance.save()

        entry = LedgerEntry.objects.create(
            ...
            idempotency_key=idempotency_key,
        )

    # After commit:
    transaction.on_commit(lambda: [
        apple_push_pass.delay(...),
        fire_webhooks.delay(...),
    ])

    return entr
```

Database-level safety net:

```python
class LedgerEntry(TenantOwnedModel):
    idempotency_key = models.UUIDField()
    ...
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'idempotency_key'],
                name='uq_ledger_entry_idempotency'
            )
        ]
```

### Permissions

```python
# apps/users/permissions.py
class TenantScopedPermission(permissions.BasePermission):
    """Base: user must be authenticated and belong to a tenant."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request, 'tenant')

class IsOwner(TenantScopedPermission):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.staff_profile.role == 'owner'

class IsLocationManager(TenantScopedPermission):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.staff_profile.role in ('owner', 'location_manager')

class IsStaff(TenantScopedPermision):
    def has_permission(self, requeest, view):
        return super().has_permission(request, view)

class CanManageStaff(permissions.BasePermission):
    """Only owner can create/edit/delete staff."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user.is_authenticated
        return request.user.staff_profile.role == 'owner'
```

### Celery tasks

```python
# apps/passes/tasks.py
from config.celery import app

@app.task(
    bind=True,
    max_retries=5,
    default_retry_delay=5,  # starts here, exponential backoff
    acks_late=True,
    queue='pass_push',
)
def apple_push_pass(self, apple_pass_id):
    from apps.passes.models import ApplePass
    from apps.passes.signer import sign_and_push_apple

    try:
        apple_pass = ApplePass.objects.get(id=apple_pass_id)
        sign_and_push_apple(apple_pass)
    except Exception as exc:
        self.retry(exc=exc, countdown=5 ** sel.request.retries)
```

Always enqueue AFTER the transaction commits:

```python
transaction.on_commit(lambda: apple_push_pass.delay(apple_pass_id))
```

### Serializer conventions

- Write serializers: `serializer.save()` never calls a service. The view calls the service, the serializer only validates and deserializes.
- Read serializers: flat, no nested saves.
- Tenant field: never in the serializer. Set from `request.tenant` in the view's `perform_create`.
- ID fields: use `customer_id`, `program_id`, `location_id` for foreign keys in request bodies. NOT `customer`, `program`, `location`.

```python
class EarnSerializer(serializers.Serializer):
    customer_id = serializers.UUIDField()
    program_id = serializers.UUIDField()
    location_id = serializers.UUIDField(required=False)
    quantity = serializers.IntegerField(min_value=1, max_value=100)
    idempotency_key = serializers.UUIDField()
```

### Testing (pytest)

```python
# conftest.py — session-scoped tenant fixtures
@pytest.fixture
def tenant(db):
    return Tenant.objects.create(name="test-tenant", slug="test")

@pytest.fixture
def owner(tenant, db):
    user = User.objects.create_user(username="owner", password="pass")
    StaffProfile.objects.create(user=user, tenant=tenant, role="owner")
    return user

@pytest.fixture
def api_client(owner):
    client = APIClient()
    client.force_authenticate(user=owner)
    return client

# test_earn.py
def test_earn_creates_ledger_entry(api_client, program, customer_program):
    response = api_client.post("/api/v1/ledger/earn/", {
        "customer_id": str(customer_program.customer_id),
        "program_id": str(program.id),
        "quantity": 1,
        "idempotency_key": str(uuid.uuid4()),
    })
    assert response.status_code == 200
    assert response.data["current_stamps"] == 1
```

Run: `pytest apps/ -x --cov=apps`

### Environment variables

```
DATABASE_URL=postgres://user:pass@localhost:5432/walletpass
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=<django-secret>
APPLE_PASS_CERT_PATH=/run/secrets/apple-pass.p12
APPLE_PASS_CERT_PASSWORD=<password>
APPLE_APNS_KEY_PATH=/run/secrets/apns-key.p8
APPLE_APNS_KEY_ID=<key-id>
APPLE_APNS_TEAM_ID=<team-id>
GOOGLE_WALLET_SERVICE_ACCOUNT=/run/secrets/google-wallet.json
GOOGLE_WALLET_ISSUER_ID=<issuer-id>
AWS_ACCESS_KEY_ID=<s3-key>
AWS_SECRET_ACCESS_KEY=<s3-secret>
AWS_STORAGE_BUCKET_NAME=walletpass-assets
SENTRY_DSN=<sentry-url>  # optional
```

Never commit `.env` files. Use `.env.example` with placeholder values.

### Common pitfalls

- **Forgetting `select_for_update`**: Two concurrent earns can both read stale balance → wrong stamp count. Always lock the balance row.
- **Enqueueing before commit**: If the task runs before the transaction commits, it sees stale data. Always `transaction.on_commit`.
- **Serializer.save() doing too much**: Serializers validate shape. Services own business logic. A serializer should never call `earn()` or `send_email()`.
- **Tenant from request data**: An attacker can send `"tenant_id": "someone-else"`. The middleware sets `request.tenant` from auth; use that.

## Examples

### Add a new endpoint: list customer's passes

1. `apps/customers/api/serializers.py`:
```python
class CustomerPassSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplePass
        fields = ['id', 'serial_number', 'push_status', 'created_at']
```

2. `apps/customers/api/views.py`:
```python
class CustmerPassListView(generics.ListAPIView):
    serializer_class = CustomerPassSerializer
    permission_classes = [IsStaff]

    def get_queryset(self):
        return ApplePass.objects.filter(
            customer_program__customer_id=self.kwargs['customer_id'],
        ).order_by('-created_at')
```

3. `apps/customers/api/urls.py`:
```python
path('<uuid:customer_id>/passes/', CustomerPassListView.as_view()),
```

4. Test:
```python
def test_list_customer_passes(api_client, customer_program, apple_pass):
    response = api_client.get(f"/api/v1/customers/{customer_program.customer_id}/passes/")
    assert response.status_code == 200
    assert len(response.data) == 1
```

### Add a Celery task: expire old passes

```python
# apps/passes/tasks.py
@app.task(queue='default')
def expire_past_relevance_passes():
    """Daily: void passes whose relevant_date has passed by 48h."""
    cutoff = timezone.now() - timedelta(hours=48)
    passes = ApplePass.objects.filter(
        relevant_date__lt=cutoff,
        is_voided=False,
    )
    for p in passes:
        void_and_push_pass(p.id)
```

Register in Celery beat:
```python
# config/celery.py
app.conf.beat_schedule = {
    'expire-passes-daily': {
        'task': 'apps.psses.tasks.expire_past_relevance_passes',
        'schedule': crontab(hour=3, minute=0),
    },
}
```

## Additional resources

- Django 5.2 docs: https://docs.djangoproject.com/en/5.2/
- DRF docs: https://www.django-rest-framework.org/
- Celery docs: https://docs.celeryq.dev/en/stable/
- Apple PassKit docs: https://developer.apple.com/documentation/passkit
- Google Wallet docs: https://developers.google.com/wallet