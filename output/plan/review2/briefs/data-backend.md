# Data, security and backend audit

Output: `/Users/fahad/council/output/plan/review2/data-backend.md`

Audit `data-model.md`, every file in `django/`, `backend.md`, the database and backend parts of `CONVENTIONS.md`, and the `django-data`, `django-backend` and `loyalty-platform-architecture` skills.

1. Tenant isolation. For every model: is `tenant` present where needed, does the model use the tenant-scoped manager, can a user of tenant A read or write tenant B rows through any path (a generic viewset, a serializer field, a Celery payload, an object-storage key, a foreign key pointing across tenants)? Write each attack path you tried and its result.
2. Location scoping. Can a location manager or stamper act on another location? Can staff assigned to two locations see the right data in each?
3. Ledger integrity. Check that a balance cannot change without a ledger event, that the same idempotency key cannot apply twice, that a redeem cannot go below zero, and that a pass update failure does not roll back or double-apply the ledger. The stamp transaction must commit before the Celery task runs. Check that "stamps today" uses the location time zone across midnight.
4. Money and counts. Stamp and point balances are integers. Where a reward has a currency value, KWD uses 3 decimals (`Decimal`, rounding, sums). Client-sent balances cannot be written.
5. Model correctness. Read every model as if it were the start of a Django project: app boundaries, missing indexes on foreign keys and tenant filters, constraints the ORM cannot express and whether `RunSQL` is specified, `on_delete` behaviour, and anything the round 1 review flagged that is still unfixed.
6. API and worker. Check auth (the server derives tenant scope), idempotency for writes, the boundary between the web process and Celery, secrets, logging and error format, local dev, and CI. Check that every MVP write path is a named service or a deliberate viewset, and that the choice is consistent across documents.
7. Async and integrations. Celery retries, the dead-letter path, and the Apple Wallet / Google Wallet decision: is the comparison accurate and current (verify on the web), and is issuance, update, and failure handling reflected in the MVP rather than deferred?
8. Skills. For the three skills above: would they teach correct, secure conventions? Flag anything that contradicts the models, `decisions.md` or `CONVENTIONS.md`.
