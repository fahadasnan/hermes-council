---
name: loyalty-platform-architecture
description: Use when starting any work on the wallet-pass SaaS, deciding where code belongs, or reviewing architecture-level choices. Covers the fixed stack (Django, PostgreSQL, Celery, Redis, React/TypeScript), the multi-tenant model, repository layout, data access rules, the ledger-is-truth/pass-is-projection rule, and links to the other convention skills.
---

# Loyalty platform architecture

Multi-tenant wallet-pass SaaS for Kuwait and the GCC. A tenant is a business; we provision accounts (public signup and billing exist only in the final phase). The product issues every Apple Wallet pass style (store card, coupon, event ticket, boarding pass, generic) and every current Google Wallet class (loyalty, offer, gift card, event ticket, flight, transit, generic), with relevant locations on any pass.

Authority order: `decisions.md` (ADRs) > `CONVENTIONS.md` > the skills. If code disagrees with an ADR, the ADR wins.

## Fixed stack

- Backend: Django 5.2 LTS + Django REST Framework + drf-spectacular (OpenAPI). One web service owns tenants, programs, customers, the ledger, passes, and the API.
- Database: PostgreSQL, one shared schema. Every tenant-owned row has `tenant_id`. Isolation is enforced in Django (tenant-scoped manager + permissions) with DB constraints for the rules the ORM must not bypass. No Supabase, no RLS, no Edge Functions.
- Worker: Celery + Redis. A ledger write commits, enqueues through a durable outbox, and returns; the worker signs and pushes wallet updates and retries failures.
- Files: S3-compatible object storage, private bucket, server-generated tenant-prefixed keys only.
- Frontend: React + TypeScript (strict) + Vite, pnpm workspace. Two apps: merchant dashboard (incl. platform-admin routes) and the public enrollment page. Visual style comes exclusively from the owner's Airbnb design skill.

## The three clients

| Client | Auth | Notes |
|---|---|---|
| Dashboard SPA (merchant + platform admin) | Session cookie + CSRF | Server derives tenant and location scope from the membership. Never trusts client tenant ids. |
| Public enrollment page | None (public program URL) | Stable URL `/{tenant_slug}/{program_slug}/`; optional signed location-attribution tag. |
| Store systems (tenant API) | HMAC-SHA256 signed request | `X-Api-Key`, `X-Timestamp`, `X-Signature` over `{METHOD}\n{PATH}\n{TIMESTAMP}\n{SHA256(body)}`; ±300 s window. Outbound webhooks are signed the same family of way. |

## Core domain (canonical names — see loyalty-domain-glossary)

`Tenant` → `Location`, `Membership` (user × tenant × role × locations), `Program` (one Apple pass style + a per-style config table), `Customer`, `Enrollment`, `Pass` (wallet projection), `Balance` (cached aggregate, store-card programs only), `LedgerEntry` (append-only log, the source of truth), `PassUpdate`/`WebhookDelivery` (outbox), `ApiCredential`, `WebhookSubscription`, `AuditEvent`.

Non-negotiable invariants:

1. The ledger is the source of truth; a pass is a projection. Balances are written only by `ledger.services` inside the entry's transaction, under `select_for_update`.
2. `LedgerEntry` rows are immutable (DB trigger rejects UPDATE/DELETE). Corrections are new `correction` entries.
3. Every ledger-mutating POST requires an `Idempotency-Key` header (UUID). Same key + same payload fingerprint replays the original result (200); same key + different payload is 409.
4. A wallet push failure never blocks or rolls back a ledger write; the outbox sweeper retries and dead-letters visibly.
5. Coupon/generic/ticket passes have no balance. Their lifecycle is issue/void/check-in events. Never force them through stamp/points logic.
6. Money is integer minor units + currency code (KWD exponent 3); stamps and points are plain integers.

## Repository layout and where code lives

```
repo/
  backend/
    config/            # settings, urls, celery, wsgi
    apps/
      tenants/         # Tenant, Location, Membership, ApiCredential, platform.py (the ONLY cross-tenant code)
      users/           # User, auth endpoints, permissions.py
      programs/        # Program + style configs, design, rewards, enrollment fields, program locations
      customers/       # Customer, Enrollment, enroll() service
      ledger/          # LedgerEntry, Balance, earn/redeem/issue/void services
      passes/          # Pass, DeviceRegistration, PassUpdate outbox, signer.py, web_service.py, tasks.py
      webhooks/        # WebhookSubscription, WebhookDelivery, delivery tasks
      analytics/       # read-only aggregates (no models)
      audit/           # AuditEvent
  frontend/
    dashboard/         # merchant SPA + /admin routes, e2e/
    enrollment/        # public enrollment app (never imports dashboard code)
    packages/api-types # DTOs + Zod validator mirrors
    packages/messages  # en.json, ar.json
  deploy/  docs/
```

Placement rules:

- Business logic (anything touching two models, locking a row, or having post-commit effects) is a function in `apps/<app>/services.py`. Views call services; serializers only validate shape; tasks only orchestrate.
- Wallet formats are built only in `passes/signer.py` behind `SignerInterface`. Adding a pass style adds a config table, a projection function, and editor screens — never changes to `Pass`, `LedgerEntry`, or the push tasks.
- Cross-tenant queries live only in `apps/tenants/platform.py`, migrations, and the reconciliation job; `cross_tenant` usage elsewhere fails CI and always writes an `AuditEvent`.
- The frontend talks only to `/api/v1/` through `apiFetch`. No direct DB/Redis/S3 access from any client; uploads go through the API.

## Request → tenant flow

Middleware resolves the tenant from the session membership, the HMAC credential, or the enrollment path into a contextvar (never a process-global). `TenantScopedManager` filters by it and fails closed (`none()` without a tenant; writes raise). Services and Celery tasks pass the tenant explicitly with `.for_tenant(tenant)`. Location scope (`request.location_scope`) is a set of location ids from `MembershipLocation`; a client `?loc=` param is a requested filter validated against that set, never authorization.

## Phasing (what exists when)

MVP = foundation, provisioning, programs + pass pipeline + enrollment, ledger + counter, analytics + export, tenant API + webhooks. Later in order: event ticket, boarding pass, beacons (+NFC seam), push campaigns, automations/referrals/tiers, named connectors + developer portal, white-label. Last and only last: public signup + subscription billing. No earlier phase may depend on billing, and no plan limits are enforced before that phase.

## Additional resources

- Domain terms and labels: loyalty-domain-glossary skill
- Models and migrations: django-data skill
- Endpoints, services, tasks, tests: django-backend skill
- Screens, state, forms: react-frontend skill
- Arabic/RTL and formatting: i18n-rtl skill
- End-to-end task recipe: feature-delivery skill
- Full rulings and plan: `decisions.md`, `CONVENTIONS.md`, `IMPLEMENTATION_PLAN.md` in the planning docs
