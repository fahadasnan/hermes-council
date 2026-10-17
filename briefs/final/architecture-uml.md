# Architecture and UML

Output: `{{COUNCIL_DIR}}/output/plan/final/drafts/architecture-uml.md`

Every diagram must match the revised `decisions.md` and `sql/`. Under each diagram, explain in a short paragraph what it shows and why it is designed that way, referencing the ADRs.

1. System context and containers (C4 level 1 and 2 as Mermaid flowcharts): users, merchant React app, public enrollment page, Django and Django REST framework, Postgres, Redis, Celery, object storage, Apple Wallet and Google Wallet.
2. Deployment and environments: local, staging, production; CI/CD path; how the web process and the Celery worker deploy separately so a bad worker deploy does not take down a stamp that is already committed.
3. Domain model: a class diagram per area (tenancy and locations, staff, programs and rewards, customers and passes, the earn/redeem ledger, settings) and one ER diagram per area with keys, tenant_id/location_id and the main constraints (ledger idempotency, non-negative balance, composite foreign keys).
4. Sequence diagrams for: sign-in and tenant/location selection; publishing a program; customer enrollment from a signed link through to a saved pass; a stamp that is idempotent; a redemption that cannot go below zero; a pass update that fails and is retried; tenant onboarding; a Django request showing auth, tenant queryset, idempotency and error format.
5. State diagrams for: program, pass, reward, tenant (trial/active/suspended) where applicable.
6. Security model: a diagram and table of roles x actions x enforcement point (tenant manager, DRF permission, service, Celery task), and the tenant isolation attack paths from round 2 with how each is closed.
7. Data access map: for every MVP write path, which Django service owns it and which queryset it uses, and why.
8. Residual issues found while doing the above.
