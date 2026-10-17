---
name: feature-delivery
description: Use when implementing any backlog task end to end in the wallet-pass SaaS — the full recipe from model to merged PR. Covers the task lifecycle (phase progress file, model, migration, service, permission, API, UI, tests, docs, check script, evidence, PR), the definition of done, the commit message format, the PR checklist, and the extra steps for tenant-scoped models, ledger-touching changes, new pass styles, and new API endpoints.
---

# Feature delivery: backlog task to merged PR

One backlog task = one PR (the implementation plan sizes tasks for this). This is the ordered recipe; the domain skills (django-data, django-backend, react-frontend, i18n-rtl) hold the detailed rules, and `decisions.md` (ADRs) outranks everything.

## The end-to-end path

0. **Claim the task in the phase progress file (ADR-57, the GlowDesk rhythm).** Add your row to `plan/evidence/phase-<n>-progress.md` in this task's own commit (task id, branch, commit SHA, tests run, deviations). After a context reset, reread this file first and never redo or skip a finished task from memory. Run `scripts/phase<n>-check.sh <task-id>` before opening the PR — full logs land in `/tmp/phase<n>-check/<task>/`, never in the repo. The last task of an epic writes `plan/evidence/<epic>/REVIEW.md` plus the numbered artifacts that prove the acceptance criteria (saved test output, Playwright screenshots); the last task of a phase writes the `plan/evidence/phase-<n>-gates/` pack.
1. **Read the task's ADRs.** Every plan task references the decisions it implements. If the task and an ADR conflict, stop and get the ADR amended first — code never silently deviates.
2. **Model** (if the task touches data): canonical name from the glossary; `TenantOwnedModel`; direct `tenant_id`; composite same-tenant FKs for every relation; named constraints; `*_minor` BigInt for money, plain ints for balances. Checklist: django-data skill.
3. **Migration**: generated, then read by hand (constraint names, no destructive ops, no add+drop in one migration). `makemigrations --check` passes in CI.
4. **Service**: business logic is a keyword-only function in `apps/<app>/services.py`. Ledger-touching logic follows the ADR-4/6/13/17 pattern: one atomic block, `select_for_update` on `Balance`, `Idempotency-Key` + fingerprint handling, outbox rows in-transaction, `on_commit` enqueue by outbox id. Domain exceptions in `exceptions.py`.
5. **Permission**: pick/compose the DRF bases (`IsOwner`, `IsManager`, `IsStaff`, `IsStaffOrApiCredential`, `AllowAny` for scoped public only) and apply the location-scope filter from `request.location_scope`. Cross-tenant access returns 404.
6. **API**: serializer (validation only; `<entity>_id` inputs; no tenant field), view calling the service, URL under `/api/v1/`, stable error codes, drf-spectacular schema regenerated. Ledger mutations require the `Idempotency-Key` header.
7. **UI**: route + guard, feature folder, DTO + Zod validator mirror in `packages/api-types`, `qk` keys, query/mutation hooks through `apiFetch`, `<QueryState>` for loading/empty/error, design-skill primitives only, strings in en.json AND ar.json, logical-properties CSS. Counter-adjacent mutations follow the same-key retry protocol.
8. **Worker** (if async effects): outbox-row-driven Celery task, idempotent, retry policy per queue, dead-letter visibility; beat entry if periodic.
9. **Tests** (written alongside, not after):
   - Backend: tenant-isolation trio for any new model; the ledger matrix (happy/replay/conflict/concurrent/insufficient/voided/wrong-scope) for any ledger path; API tests (auth, per-role permission, isolation-404, error codes); signer golden files for projection changes.
   - Frontend: form/validator tests; mutation-protocol tests where applicable; formatter tests for any new money/date/count rendering; Playwright journeys for golden flows, in `en` **and** `ar` for anything user-visible, with light and dark screenshots in both languages for the evidence pack (ADR-57 — round 2 F-PIPE-2).
10. **Docs**: runbook changes for ops behavior; the store-developer guide for tenant-API changes; audit events wired for sensitive actions.
11. **PR**: commit format below, checklist completed, OpenAPI + DTO mirrors updated, one task only.

## Commit format

`<type>(<scope>): <subject>` — types `feat|fix|refactor|perf|test|docs|chore|ops`; scope = app or area (`ledger`, `passes`, `programs`, `dashboard`, `enrollment`, `ci`, `deploy`); subject imperative, ≤72 chars. Body: what and why, plus `ADR-<n>` references for every decision implemented. Example:

```
feat(ledger): add reward auto-issue on stamp threshold

Consumes stamps_required from the cycle counter in the same atomic
block as the earn; emits reward_issued with metadata {reward_id, cycle}
and increments Balance.cycle. Lifetime counter untouched.

ADR-7, ADR-6
```

## PR checklist (required, from CONVENTIONS §10)

- [ ] One backlog task; linked.
- [ ] ADRs followed; deviations carry an ADR change in this PR.
- [ ] Tenant scoping: `tenant_id`, manager, composite FKs, isolation tests.
- [ ] Ledger writes only via services; no direct `Balance`/`Pass` mutation; idempotency honored.
- [ ] Migration reviewed by hand.
- [ ] Tests: backend trio + service matrix; frontend states + formatters; strings in en and ar.
- [ ] No secrets, no client-trusted tenant/location ids, no physical-direction CSS.
- [ ] OpenAPI regenerated; DTO/validator mirrors updated.

Review: one approval minimum; ledger, tenancy, and signer changes need a second backend-owner approval.

## Definition of done (CONVENTIONS §11)

Merged to `main` behind no dead flags; migrations applied in staging; CI green including new tests; en/ar complete; OpenAPI + mirrors updated; audit events wired; docs/runbooks touched where behavior changed; phase acceptance criteria unbroken; loading/empty/error states render through `<QueryState>` for anything user-visible; the task's row in `plan/evidence/phase-<n>-progress.md` names the commit, the checks run (`scripts/phase<n>-check.sh`), and any deviation; epics close with `plan/evidence/<epic>/REVIEW.md` + numbered artifacts and phases with `plan/evidence/phase-<n>-gates/GATES.md` (ADR-57).

## Special recipes

**Add a tenant-scoped model**: django-data checklist steps 1–8, in order; the suite-level model-enumeration test must pass without edits (it fails any model missing `tenant_id`, the manager, or isolation tests).

**Add an API endpoint**: django-backend checklist — serializer → view → URL → permission → OpenAPI → tests. Ledger-mutating? Add the `Idempotency-Key` requirement and the replay/conflict tests. Tenant-API-exposed? Enable `IsStaffOrApiCredential` and add the HMAC contract test.

**Add a new pass style** (ADR-25 contract): config table migration; enum activation; one projection function in `passes/signer.py` + golden-file tests; editor section from the style discriminated union + Zod validator; `google_class_for` derivation row + test. `Pass`, `LedgerEntry`, the outbox, and the push tasks must not change — the style-additivity contract test enforces this and fails the PR otherwise.

**Touch the ledger**: read ADR-4/5/6/7/8/13/17 first. New event type? It arrives by migration + ADR only. Balance semantics change? `_signed_delta` is the only place signs exist; the check-constraint pairing (balance events ↔ non-null balances) must stay true; add reconciliation fixtures.

## Additional resources

- django-data, django-backend, react-frontend, i18n-rtl, loyalty-domain-glossary, loyalty-platform-architecture skills
- `decisions.md`, `CONVENTIONS.md`, `IMPLEMENTATION_PLAN.md` in the planning docs
