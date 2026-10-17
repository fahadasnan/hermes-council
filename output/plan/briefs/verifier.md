# Brief: Challenge the design (verifier)

Output: /Users/fahad/council/output/plan/review.md

Inputs: requirements.md, data-model.md, django/, backend.md, frontend.md, skill-drafts/*.md in /Users/fahad/council/output/plan/.

Act as the council's sceptic. For every "Proposed decision" (PD-...):

1. Check it against the requirements (multi-tenant, multi-location, Arabic/RTL, MVP scope, wallet passes in the MVP, Django as the only write path) and against the other areas' decisions. Flag conflicts explicitly (e.g. the frontend sends a tenant id the API trusts; a balance can be patched through a generic viewset).
2. Verify factual claims about Django, Django REST framework, Celery, Apple Wallet, and Google Wallet against current official docs (web search; cite URLs). Flag anything outdated or wrong.
3. Give a verdict per decision: AGREE / AGREE WITH CHANGES (say what) / DISAGREE (give the alternative and why).

Also review:

- Tenant isolation: try to find a path where one tenant could read or write another tenant's data, or a location-scoped user could reach another location (a model without the tenant manager, a serializer that accepts `tenant_id`, a Celery task that trusts a payload tenant id, an object-storage path, a forged enrollment link).
- Ledger integrity: double stamps, redeem below zero, a balance column that can be edited without a ledger event, a pass that shows a different balance than the ledger, a pass push that runs inside the same transaction as the stamp, time zone mistakes on "stamps today".
- Model drafts: obvious Django mistakes, missing indexes on tenant and location, missing uniqueness on idempotency keys, missing constraints.
- Skill drafts: conflicts with each other or with the decisions; vague rules; missing "how to add X" steps.
- MVP scope: anything essential missing for us to create a tenant for a business, and for that business to issue a store card, a coupon, and a generic pass, attach relevant locations, enroll a customer, and update the pass; any Apple pass style or current Google Wallet class marked out of scope; event ticket and boarding pass left as a schema rewrite instead of a later phase on the same signer; public signup or subscription billing placed anywhere except the last phase.

Sections of review.md: Summary, Decision verdicts table, Conflicts between areas, Security and tenancy findings, Ledger and pass findings, Model review, Skill review, Scope review, Open questions for the owner.
