---
name: django-backend
description: Use when adding Django REST API endpoints, services, serializers, permissions, HMAC auth, Celery tasks, wallet signer code, or modifying the ledger in backend/apps. Covers project layout, tenant scoping, the ledger service pattern, Idempotency-Key handling, the canonical error model, wallet push tasks, pytest conventions, and local run commands.
---

# Django backend conventions

Canonical model names are binding (loyalty-domain-glossary + ADR-44): `LedgerEntry`, `Balance`, `Pass`, `Membership`, `TenantScopedManager`, `ApiCredential`. Rejected variants (`CustomerProgramBalance`, `StaffProfile`, `ApplePass`/`GooglePass`, `TenantManager`) must not appear. `LedgerEntry.pass_record` → column `pass_id`. API prefix is `/api/v1/`. Auth: session for dashboard, HMAC for tenant API, public URL for enrollment.

## Run locally

```bash
cd backend
docker compose up -d      # Postgres + Redis
python manage.py migrate
python manage.py runserver
celery -A config worker -Q default,pass_push,webhooks -c 4 -l INFO
celery -A config beat     # separate process, one instance only
```

## Project layout

```
backend/
  config/               # settings/{base,development,staging,production}.py, urls.py, celery.py, wsgi.py
  apps/
    <app>/
      models.py         # TenantOwnedModel subclasses (django-data skill)
      services.py       # business logic: earn, redeem, enroll, publish — functions, not classes
      exceptions.py     # InsufficientBalance, IdempotencyConflict, StyleNotYetAvailable
      signer.py         # (passes only) SignerInterface + SelfSigner
      web_service.py    # (passes only) Apple PassKit endpoints
      tasks.py          # Celery tasks
      permissions.py    # DRF permission classes
      api/
        views.py        # DRF viewsets / APIViews (call services)
        serializers.py  # validation only — never calls a service or writes a balance
        urls.py
      tests/
        test_services.py  test_api.py  factories.py
```

## Adding an endpoint (checklist)

1. Serializer in `api/serializers.py` — all validation here; FK inputs are `<entity>_id`; the tenant field is never in the serializer.
2. View: CRUD on one model → `ModelViewSet` on a tenant-scoped base; business logic across models / row locks / post-commit effects → `APIView` that calls a service; read-only list → `ReadOnlyModelViewSet`.
3. URL in `api/urls.py`, included under `/api/v1/`.
4. Permission class — every view declares `permission_classes` explicitly. Bases: `IsOwner`, `IsManager` (owner or location manager), `IsStaff`, `IsStaffOrApiCredential`, `AllowAny` (enrollment/public only, scope-derived).
5. Ledger-mutating POST: require the `Idempotency-Key` header (below).
6. OpenAPI: drf-spectacular picks it up; CI diff-checks generated examples against serializer fields (catches `progam_id`/`quatity`-class typos).
7. Tests: auth required, permission per role, tenant isolation (404 not 403 cross-tenant), happy path, error code.

## Tenant and location context

Never read `tenant_id` from body, URL, or query. `TenantMiddleware` resolves it into a contextvar from the session membership, the HMAC credential, or the enrollment path, and sets `request.tenant` + `request.location_scope` (the set of permitted location ids). Views/services filter with `.for_tenant(request.tenant)`; a client `?loc=` param is a requested filter validated against `request.location_scope`, never authorization (ADR-40).

```python
class ProgramViewSet(ModelViewSet):
    permission_classes = [IsManager]
    def get_queryset(self):
        return Program.objects.for_tenant(self.request.tenant)  # explicit, not the implicit contextvar
```

## HMAC auth for the tenant API (ADR-1)

```python
# Headers: X-Api-Key, X-Timestamp (unix seconds), X-Signature
# signing_string = f"{method}\n{path}\n{timestamp}\n{sha256_hex(body)}"
# signature      = hmac.new(secret, signing_string.encode(), sha256).hexdigest()
```

Validate: look up `ApiCredential` by exact `key_id` equality (a public identifier — timing leakage is not a concern; round 2 F-SKILL-3) → reject if timestamp outside ±300 s → reject on signature mismatch using the constant-time compare (`hmac.compare_digest`) — constant-time applies to the **signature** only → reject if `is_active` false, expired, or tenant suspended → set `request.tenant` from the credential, never the body. Per-credential throttle (default 120/min). Rotation: accept both old and new secret during the grace window (default 24 h).

## Idempotency (ADR-13) — every ledger write

Header `Idempotency-Key: <uuid>` is required on earn/redeem/issue/void from every client. Missing → `400 VALIDATION_ERROR`. The service stores the key + a request fingerprint (SHA-256 of method+path+canonical body):

- Same key, same fingerprint → return the original result, `200`, header `Idempotent-Replay: true`.
- Same key, different fingerprint → `409 IDEMPOTENCY_CONFLICT`.
- Concurrent duplicate → the unique constraint `(tenant, idempotency_key)` makes one lose; catch `IntegrityError`, re-read in a fresh transaction, apply the replay/conflict rule.

## The ledger service pattern (ADR-4, 6, 8, 17)

One `transaction.atomic()`; balances written only here, never in a view/serializer/task:

```python
# apps/ledger/services.py
def earn(*, tenant, balance_id, quantity, idempotency_key, request_fingerprint,
         location_id=None, actor=None) -> LedgerEntry:
    with transaction.atomic():
        existing = LedgerEntry.objects.for_tenant(tenant).filter(
            idempotency_key=idempotency_key).first()
        if existing:
            return _replay_or_conflict(existing, request_fingerprint)  # 200-replay or raise IdempotencyConflict

        balance = Balance.objects.for_tenant(tenant).select_for_update().get(id=balance_id)
        # manager-only methods (for_tenant) FIRST, queryset methods after (round 2 F-DB-1)
        delta = _signed_delta("earn", quantity)                 # the ONLY place a sign is computed
        previous = balance.stamps_current
        new = previous + delta
        if new < 0:
            raise InsufficientBalance(current=previous, required=quantity)

        entry = LedgerEntry.objects.for_tenant(tenant).create(
            tenant=tenant, customer=balance.customer, program=balance.program,
            balance=balance, pass_record=balance.pass_for_update(),
            location_id=location_id, event_type="earn", quantity=quantity,   # quantity always positive
            previous_balance=previous, new_balance=new,
            idempotency_key=idempotency_key, request_fingerprint=request_fingerprint,
            created_by=actor)

        balance.stamps_current = new
        balance.stamps_lifetime += quantity
        balance.save(update_fields=["stamps_current", "stamps_lifetime", "updated_at"])

        _maybe_auto_issue_reward(tenant, balance, entry)         # ADR-7: reward_issued consumes the target
        pu = PassUpdate.objects.for_tenant(tenant).create(       # outbox row, same transaction (ADR-17)
            tenant=tenant, pass_record=entry.pass_record, trigger_entry=entry, status="pending")
        wd = _fanout_webhooks(tenant, entry)                     # WebhookDelivery rows, same transaction

    transaction.on_commit(lambda: (                              # enqueue AFTER commit, by outbox id
        apple_push_pass.delay(pu.id), google_push_pass.delay(pu.id),
        [deliver_webhook.delay(d.id) for d in wd]))
    return entry
```

Rules this encodes: `quantity` is a positive int; the sign comes from `_signed_delta(event_type, quantity)` in exactly one place; `new_balance == previous_balance + delta` before insert; coupon/generic/ticket paths write NULL balances (ADR-5); `LedgerEntry` rows are never updated (DB trigger); corrections are `correction` entries; a failed push never rolls back the ledger.

## Error model (CONVENTIONS §4)

Domain exceptions map to stable codes in one handler: `VALIDATION_ERROR` 400, `NOT_AUTHENTICATED` 401, `PERMISSION_DENIED` 403, `NOT_FOUND` 404 (cross-tenant reads return 404, never 403), `IDEMPOTENCY_CONFLICT` 409, `INSUFFICIENT_BALANCE`/`PROGRAM_INACTIVE`/`PASS_VOIDED`/`STYLE_NOT_AVAILABLE` 422, `RATE_LIMITED` 429 (+ Retry-After). Shape `{"error": {"code", "message", "details"}}`; codes never localize, `message` may.

## Celery tasks

```python
@app.task(bind=True, max_retries=5, default_retry_delay=5, acks_late=True, queue="pass_push")
def apple_push_pass(self, pass_update_id):
    # fenced manager (round 2 F-DB-2): outbox tasks are context-free — the fail-closed
    # objects manager returns none() here, so .get() would always raise DoesNotExist.
    # cross_tenant is allowlisted for outbox task files only, by primary key,
    # and every use writes an AuditEvent (ADR-11).
    pu = PassUpdate.cross_tenant.get(id=pass_update_id)
    try:
        signer.apple_push(pu.pass_record)               # SignerInterface (ADR-24)
        pu.mark_done()
    except DeviceTokenInvalid:                          # APNs 410
        pu.pass_record.device_registrations.filter(...).delete(); pu.mark_done()
    except TransientError as exc:
        pu.record_attempt(exc); self.retry(exc=exc, countdown=5 ** self.request.retries)
```

- Always enqueue via `transaction.on_commit`, by outbox row id — never fire-and-forget a `.delay()` that can be lost between commit and enqueue (ADR-17).
- Tasks are idempotent: they re-project from current state and mark the outbox row done. Marks/updates go through an approved service or the explicit audited `cross_tenant` path — never an unscoped write.
- Queues: `default`, `pass_push`, `webhooks`; every task declares its queue explicitly and a routing test asserts it (ADR-50). 4xx from Google = do not retry; 5xx/network = retry with backoff; after 5, dead-letter (sweeper sets `Pass.push_status=failed`, visible with a manual repush).
- Beat: `sweep_outbox` (60 s), `reconcile` (nightly), `purge_expired_passes`, `expire_credentials`.

## Wallet signer (ADR-24, 25)

`passes/signer.py` exposes `SignerInterface` (`build_pkpass`, `apple_push`, `google_class_payload`, `google_object_payload`, `google_jwt_url`); MVP ships `SelfSigner`. One projection function per style; `event_ticket`/`boarding_pass` raise `StyleNotYetAvailable` at the API boundary until their phase, but the interface already accepts them. Apple style is canonical; `google_class_for(program)` derives the Google class. Certs load from secret storage at call time — never in the repo, never cached on disk. Relevant locations cap at 10 in the projector.

## Serializer conventions

- Write serializers validate shape only; `serializer.save()` never calls a service or writes a balance. The view calls the service.
- FK inputs: `customer_id`, `program_id`, `location_id`. Not `customer`/`program`.
- Money in/out is a decimal string with the currency exponent (`"12.500"` KWD); stored as integer minor units (ADR-21).

## Testing (pytest, factory boy)

```python
def test_earn_creates_ledger_entry(api_client, store_card_balance):
    r = api_client.post("/api/v1/ledger/earn/",
        {"balance_id": str(store_card_balance.id), "quantity": 1},
        HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()))
    assert r.status_code == 201 and r.data["new_balance"] == 1

def test_earn_replay_is_idempotent(...):     # same key + same body → 200 + Idempotent-Replay
def test_earn_conflict_on_changed_payload(...): # same key + different body → 409
def test_concurrent_duplicate_earn(...):      # two threads, one key → one entry
def test_redeem_insufficient_balance(...):    # → 422 INSUFFICIENT_BALANCE
def test_cross_tenant_earn_is_404(...):       # tenant B's balance under tenant A → 404
```

Run: `pytest apps/ -x --cov=apps`. Coverage gate: 90% on ledger/passes/tenants, 80% elsewhere. Every ledger action is tested across the ADR-6 matrix (happy/replay/conflict/concurrent/insufficient/voided/wrong-scope). The append-only trigger is tested with raw SQL UPDATE/DELETE.

## Environment variables

```
DATABASE_URL  REDIS_URL  SECRET_KEY
APPLE_PASS_CERT_PATH  APPLE_PASS_CERT_PASSWORD
APPLE_APNS_KEY_PATH  APPLE_APNS_KEY_ID  APPLE_APNS_TEAM_ID
GOOGLE_WALLET_SERVICE_ACCOUNT  GOOGLE_WALLET_ISSUER_ID
AWS_ACCESS_KEY_ID  AWS_SECRET_ACCESS_KEY  AWS_STORAGE_BUCKET_NAME
WEBHOOK_SECRET_ENCRYPTION_KEY     # Fernet, from the secret store — not SECRET_KEY (ADR-18)
SENTRY_DSN
```

Never commit `.env`; `.env.example` carries placeholders. Wallet certs live in secret storage, loaded at call time.

## Common pitfalls

- Forgetting `select_for_update` on the `Balance` row → two concurrent earns corrupt the count. Always lock.
- **Chaining manager-only methods after queryset methods** (`objects.select_for_update().for_tenant(t)`) — manager helpers (`for_tenant`) exist only on the manager; once you call a queryset method you get a plain `QuerySet` and the manager helpers are gone (`AttributeError`), and a naive reorder can silently drop `FOR UPDATE`. Always start with `.for_tenant(tenant)`, then `.select_for_update()` (round 2 F-DB-1).
- **`Model.objects.get()` inside a Celery task** — the contextvar is unset in workers, the fail-closed manager returns `none()`, and every `.get()` raises `DoesNotExist`. Outbox tasks read their row via `Model.cross_tenant` (allowlisted, by primary key, audited) or an explicit `.for_tenant(tenant_id)` after resolving the tenant from the row (round 2 F-DB-2).
- Enqueueing before commit → the task sees stale data or a rolled-back row. Always `transaction.on_commit`.
- A `.delay()` with no outbox row → a lost effect on broker outage. Write the outbox row in the transaction (ADR-17).
- `serializer.save()` doing business logic → services own logic; serializers validate shape.
- Reading `tenant_id` from request data → an attacker sends someone else's. Use `request.tenant`.
- Negative `quantity` or `abs(quantity)` gymnastics → quantity is positive; the sign is `_signed_delta`'s job.
- Using `cross_tenant` outside the allowlist (platform.py, the outbox task files, migrations, reconciliation) → the AST checker `scripts/check_cross_tenant.py` fails CI, and every legal use must audit (ADR-11).

## Additional resources

- Rulings: `decisions.md` ADR-1, 4, 5, 6, 11, 13, 14, 17, 24, 25, 44, 50
- Models/migrations: django-data skill. End-to-end recipe: feature-delivery skill.
- Django 5.2 https://docs.djangoproject.com/en/5.2/ · DRF https://www.django-rest-framework.org/ · Celery https://docs.celeryq.dev/en/stable/
- Apple PassKit web service https://developer.apple.com/library/archive/documentation/PassKit/Reference/PassKit_WebService/ · Google Wallet https://developers.google.com/wallet/reference/rest
