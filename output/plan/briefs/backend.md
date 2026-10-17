# Brief: Django API, services, and wallet worker (linker)

Output: /Users/fahad/council/output/plan/backend.md

1. App boundaries inside one Django project: tenants, programs, customers, ledger, passes, analytics. One web process serves the API. A separate Celery worker does pass pushes. Weigh what belongs in a model, a service module, a DRF view, and a Celery task. The stamp path is one `transaction.atomic` block with `select_for_update` on the balance, then an enqueue after commit.
2. API surface for the MVP: resources, methods, who may call them, and which writes are services rather than generic viewsets (earn, redeem, enroll, publish). The React app is the only client. No direct database access from the browser.
3. Request anatomy: project layout (`backend/config`, `backend/apps/<name>`), DRF viewsets vs API views, serializers as the write boundary, auth (choose session cookies or JWT and justify it; derive tenant and location from the user), error model (stable error codes, HTTP status mapping, i18n-ready messages), idempotency keys for earn and redeem, logging, and CORS for the Vite app. The customer enrollment endpoint is unauthenticated until the customer is created; scope it to a tenant with a signed enrollment link and rate-limit it.
4. Passes: how an earn or redeem updates the Apple Wallet and Google Wallet pass. Cover certificates and issuer credentials as secrets, the Celery task, what happens when the push fails (ledger already committed, task retried, dead letter), and voiding a pass. Cite current Apple, Google, Django, and Celery docs.
5. Async work: pass-update retries and, later, campaigns. Redis is the broker. Define retry and dead-letter behaviour. Do not design a card-payment gateway; this product does not take customer payments in the MVP. Subscription billing for tenants who buy the SaaS is a later phase: name the decision and defer the provider choice with the criteria (invoicing in Kuwait, KNET if card billing is required).
6. Environments and delivery: local dev (Django, Postgres, Redis), staging and production, secrets (wallet certificates never in the repo), CI (tests, migrations check, lint, type check of the frontend), deploying the web process and the worker separately so a bad worker deploy does not have to take down stamps already committed. Version the API so already-issued passes and the current frontend keep working.
7. Observability and reliability: logs, error tracking, health checks, rate limiting on public enrollment and on the stamp endpoint, timeouts.
8. Diagrams: component diagram (merchant app, enrollment page, Django, Postgres, Redis, Celery, object storage, Apple, Google) and sequence diagrams for "customer enrolls and saves a pass" and "staff member stamps a card".

Draft the skill `django-backend`: how to add an endpoint, where services live, serializer and permission conventions, tenant context, idempotency, Celery tasks, pytest, and local run commands.

Add your "Proposed decisions" section.
