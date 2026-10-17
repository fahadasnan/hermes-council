# Implementation plan and skills audit (round 2)

Reviewer: cartographer. Date: 2026-10-17. Brief: `plan-skills-audit.md`; common rules in `briefs/common.md`.

Checks run:
- `node check-skills.mjs /Users/fahad/council/output/plan/skills` → **OK: 7 skills, .cursor and .claude copies identical**.
- `node check-mermaid.mjs` on `IMPLEMENTATION_PLAN.md`, `CONVENTIONS.md`, `data-model.md`, `backend.md`, `frontend.md`, `decisions.md` → all parse (2, 1, 4, 4, 2, 0 diagrams).
- All round-1 deliverables named in `briefs/common.md` exist on disk (requirements, data-model, django/*.py, backend, frontend, skill-drafts, review, decisions, IMPLEMENTATION_PLAN, CONVENTIONS, both skill trees). No missing/truncated deliverable.
- GlowDesk pipeline files read and compared: `.cursor/skills/feature-delivery/SKILL.md`, `plan/evidence/phase-10-progress.md`, `plan/evidence/10.1/REVIEW.md`, `plan/evidence/phase-5-gates/GATES.md`, `apps/back-office/playwright.evidence.config.ts`, `scripts/phase10-check.sh`.

---

### F-PIPE-1: The GlowDesk coding pipeline is entirely absent from the plan, CONVENTIONS, and feature-delivery
- Severity: **blocker**
- Location: `IMPLEMENTATION_PLAN.md` (all phases; Phase 0 backlog), `CONVENTIONS.md` §9–§11, `skills/.claude/skills/feature-delivery/SKILL.md` (whole file), `skills/.claude/skills/react-frontend/SKILL.md` §Testing
- Problem: The common brief requires the build to run on GlowDesk's rhythm: `plan/evidence/phase-<n>-progress.md` (one row per task, written in that task's commit, with the SHA), `scripts/phase<n>-check.sh` (logs to `/tmp`), per-epic `plan/evidence/<epic>/REVIEW.md` + numbered proof artifacts, per-phase `plan/evidence/phase-<n>-gates/` (GATES.md + script + gate results), a Playwright evidence config, and a Phase 0 task that creates the harness. None of this exists. The plan's "Test plan" bullets are prose intents with no durable evidence; nothing tells an agent after a context reset which tasks are done; no epic or phase has a close-out artifact. GlowDesk's own skill makes this the spine of delivery (`.cursor/skills/feature-delivery/SKILL.md` steps 1, 8, 9; `phase-10-progress.md` "never redo or skip a task from memory"; `phase-5-gates/GATES.md` gate table + `exit-codes.txt`).
- Evidence: `IMPLEMENTATION_PLAN.md` Phase 0 backlog (lines 92–97) creates repo/CI/tenancy/auth/frontend/observability but no `plan/evidence/` harness, no check-script pattern, no evidence Playwright config. `grep -ri evidence IMPLEMENTATION_PLAN.md CONVENTIONS.md` → 0 hits. `feature-delivery/SKILL.md` has 11 delivery steps and none mentions the progress file, the check script, or evidence artifacts.
- Fix (paste-ready):
  1. Add to `IMPLEMENTATION_PLAN.md` Phase 0 scope: "Evidence harness: `plan/evidence/` tree, `scripts/phase0-check.sh` (the pattern all later `phase<n>-check.sh` copy), and `frontend/dashboard/playwright.evidence.config.ts` (workers:1, screenshot project, runs against a built preview)."
  2. Add Epic 0.6 Evidence harness: "[Ops] `plan/evidence/` skeleton + `phase-0-progress.md` with the T0 baseline row; [Ops] `scripts/phase0-check.sh` (compose up, migrate, pytest, ruff, makemigrations --check, vitest, eslint, stylelint, key parity — one PASS/FAIL line per step, full logs under `/tmp/phase0-check/<task>/`); [Ops] `playwright.evidence.config.ts` + first light/dark en/ar screenshot spec."
  3. Add to every phase's backlog a final task: "[Ops] evidence `plan/evidence/<n.x>/`: numbered artifacts (saved pytest/vitest output, Playwright screenshots light+dark en+ar) + `REVIEW.md` naming what shipped, the commit SHAs, and deviations from the plan."
  4. Add to every phase's exit criteria: "the phase is not done without `plan/evidence/phase-<n>-gates/` (`GATES.md`, `run-gates.sh`, per-gate results and exit codes)."
  5. Add a step 0 to `feature-delivery/SKILL.md` "## The delivery path": "**0. Claim the task in the phase progress file.** Add your row to `plan/evidence/phase-<n>-progress.md` in this task's commit (task id, branch, commit SHA, tests run, deviations). After a context reset, reread this file first and never redo a finished task. Run `scripts/phase<n>-check.sh <task-id>` — full logs land in `/tmp`, never in the repo. The last task of an epic writes `plan/evidence/<epic>/REVIEW.md` + numbered proof artifacts; the last task of a phase writes the phase gates pack."
  6. Add to `CONVENTIONS.md` §11 (definition of done): "…and the task's row in `plan/evidence/phase-<n>-progress.md` names the commit, the checks run, and any deviation; epics close with `plan/evidence/<epic>/REVIEW.md` and phases with `plan/evidence/phase-<n>-gates/GATES.md`."
- Affects: every phase's backlog and exit criteria; `feature-delivery`, `react-frontend` skills; `CONVENTIONS.md` §9–§11.

### F-PIPE-2: Playwright journeys are specified in Arabic only; the pipeline requires English AND Arabic, light and dark
- Severity: **blocker** (required change left out of the test plan)
- Location: `IMPLEMENTATION_PLAN.md` Phase 1 test plan ("Playwright: admin creates tenant, owner first login in `ar`"), Phase 2 test plan ("Playwright enrollment journey in `ar` with RTL snapshots"), Phase 3/4 test plans; `skills/.claude/skills/react-frontend/SKILL.md` line 40 ("a Playwright journey … in `ar`") and §Testing ("enrollment in `ar`"); `skills/.claude/skills/i18n-rtl/SKILL.md` §Required tests (RTL journeys in `ar` only)
- Problem: The common brief requires user-facing Playwright journeys in **both English and Arabic**, and evidence-pack screenshots **light and dark in both languages** (GlowDesk: `phase-10-progress.md` T0 "Playwright regression set (en + ar)"; GlowDesk feature-delivery step 8 "if added, it runs in `en` and `ar`"). The plan and two skills specify `ar`-only journeys and never mention light/dark themes, so the evidence pack would be unbuildable as specified.
- Fix: replace each occurrence with "Playwright journeys in `en` and `ar`" and add to the i18n-rtl required-tests list: "- **Evidence screenshots**: every user-facing epic's evidence pack includes light and dark screenshots in both `en` and `ar` (GlowDesk rhythm), taken via `playwright.evidence.config.ts`." In `react-frontend/SKILL.md` §Testing change "enrollment in `ar` on a phone viewport" to "every golden journey runs in `en` and `ar`; the enrollment journey additionally on a phone viewport". In `feature-delivery/SKILL.md` step 9 frontend bullet change "in `ar` where user-visible" to "in `en` and `ar` for anything user-visible, with light and dark screenshots in the evidence pack".
- Affects: F-PIPE-1's evidence tasks (both languages × both themes); `i18n-rtl`, `react-frontend`, `feature-delivery` skills; phase 1–5 test plans.

### F-SKILL-1: django-data teaches a nonexistent Django API (`models.ForeignKeyConstraint`)
- Severity: **major** (a skill that teaches an unbuildable convention)
- Location: `skills/.claude/skills/django-data/SKILL.md` lines 92–104 ("Composite same-tenant relations"), constraint list item in `Meta.constraints`
- Problem: The `ProgramLocation` example puts `models.ForeignKeyConstraint(...)` inside `Meta.constraints`. Django 5.2 has no such class; `Meta.constraints` accepts `CheckConstraint`, `UniqueConstraint`, `ExclusionConstraint`, `DeferrableUniqueConstraint` only. Django's ORM cannot express a composite (multi-column) foreign key; the docs state relationship fields do not support composite primary keys and `ForeignObject` "doesn't create … foreign key constraints" — so the DB-level composite FK must be `RunSQL`. An agent following the skill writes code that crashes at import.
- Evidence: https://docs.djangoproject.com/en/stable/topics/composite-primary-key ("Relationship fields … do not support composite primary keys"); https://docs.djangoproject.com/en/stable/ref/models/constraints/ (constraint class list); the skill's own parenthetical admits the workaround but still shows the invalid API as the primary example.
- Fix: replace the `Meta.constraints` block in the example with:

  ```python
  # models.py: declare the FKs without ORM-level composite enforcement
  program = models.ForeignKey("programs.Program", on_delete=models.CASCADE,
                              db_constraint=False)
  location = models.ForeignKey("tenants.Location", on_delete=models.CASCADE,
                              db_constraint=False)
  class Meta:
      db_table = "program_locations"
      constraints = [
          models.UniqueConstraint(fields=["program", "location"],
                                  name="uq_program_locations_program_location"),
          models.UniqueConstraint(fields=["id", "tenant_id"],
                                  name="uq_program_locations_id_tenant"),
      ]
  ```

  and add: "The composite same-tenant FKs (`(program_id, tenant_id) → programs(id, tenant_id)` and `(location_id, tenant_id) → locations(id, tenant_id)`) are added in the same app's migration with `migrations.RunSQL('ALTER TABLE program_locations ADD CONSTRAINT fk_program_locations_program_tenant FOREIGN KEY (program_id, tenant_id) REFERENCES programs (id, tenant_id) …')` — the ORM cannot express them (Django composite-PK docs). `makemigrations` must then be run with the `db_constraint=False` fields so Django does not emit the plain FK constraint." Add a pitfall: "Writing `models.ForeignKeyConstraint` — it does not exist; the composite FK is RunSQL in the migration."
- Affects: `django-data` skill (both copies); the isolation test `test_cross_tenant_relation_rejected` now proves the RunSQL constraint; `decisions.md` ADR-10 wording unchanged.

### F-REQ-1: requirements.md uses the canonical names ADR-44 bans
- Severity: **major** (plan documents contradict the naming authority the skills enforce)
- Location: `requirements.md` §2 line 105 ("Model: `tenant`, `location`, `staff_member`, `program`, `customer`, `pass`, `ledger_event`") and line 122 ("Ledger events always carry `location_id` and `staff_member_id`")
- Problem: ADR-44 and `loyalty-domain-glossary` make `Membership` (no `StaffMember`/`staff_member` table — "the domain phrase 'staff member' means a membership with role staff") and `LedgerEntry` (rejected variant `LedgerEvent`) binding. `requirements.md` models `staff_member` and `ledger_event` as tables, the exact rejected variants. Anyone implementing from requirements.md builds banned names; the glossary says rejected variants "must not appear in new code" — but they appear in the plan corpus.
- Fix: replace line 105 with "Model: `Tenant`, `Location`, `Membership` (staff are memberships with role staff), `Program`, `Customer`, `Pass`, `LedgerEntry` (the append-only event log)." Replace line 122's "`location_id` and `staff_member_id`" with "`location_id` and the acting membership (`created_by`)". Note in `REVISION_LOG.md` that requirements §2's model list is corrected to ADR-44 names.
- Affects: `requirements.md` §2; no ADR change; glossary/skills unchanged (they are already correct).

### F-PLAN-1: No backlog task delivers the owner/manager location-management screens (US-LOC-1 orphaned)
- Severity: **major** (MVP requirement with no task; the first business cannot add its second location)
- Location: `IMPLEMENTATION_PLAN.md` Phase 1 frontend screens (line 111) and Epic 1.3; `requirements.md` US-LOC-1 / §3 matrix rows "Create/edit/deactivate locations"
- Problem: Phase 1's screens are admin wizard (first location only), `/staff`, `/settings/*`, audit log. Phase 2 only attaches existing locations to programs. No epic ever builds the owner/manager screen to add, edit (address, coordinates, relevance text), or deactivate locations — yet US-LOC-1 is an MVP story and the permission matrix grants managers "Yes (own locations only)". The go-live checklist ("first location(s)", plural) and US-ENR location tagging both assume it exists.
- Fix: add to Phase 1 scope "locations management screens for owner (all) and manager (own locations)" and to Epic 1.3: "[API] location CRUD endpoints (owner all / manager own-scope; ADR-12 scope tests); [Frontend] `/settings/locations` list + create/edit (name, address, map picker, display address, lock-screen relevance text) en/ar; [API] location deactivate with program-detach warning." Acceptance criterion addition: "an owner adds a second location and it is immediately attachable in the Phase 2 program editor (integration note in Epic 2.3)."
- Affects: Phase 1 backlog/acceptance; Phase 2 Epic 2.3 (cap UX now has real locations to pick); go-live item 1 unchanged.

### F-PLAN-2: The privacy PII-deletion flow is required but has no backlog task
- Severity: **major**
- Location: `requirements.md` §5 Privacy ("deletion request removes the customer's PII while keeping anonymized ledger aggregates"); `loyalty-domain-glossary` **customer** ("a privacy deletion nulls PII and keeps anonymized ledger aggregates"); `IMPLEMENTATION_PLAN.md` Phase 3 (Epic 3.4 covers soft delete + import only)
- Problem: The requirement and the glossary both specify an anonymizing deletion; no phase scope, API, screen, or backlog task implements it. ADR-34 covers soft-delete/archive policy, not the PII-nulling action. This is a privacy obligation with a consent trail captured at enrollment — it cannot ship silently later.
- Fix: add to Phase 3 scope: "customer privacy deletion (owner action: null contact PII on soft-deleted customer, keep anonymized ledger aggregates, write `customer.pii_deleted` audit event, enqueue final pass void)". Add Epic 3.4 task: "[API] privacy deletion service + audit + final pass void; [Frontend] deletion confirm dialog in `/customers/:id`." Acceptance criterion: "after privacy deletion the customer row has null PII, aggregates still reconcile, the pass is voided, and the action is in the audit log."
- Affects: Phase 3 scope/backlog/acceptance; `django-data` pitfall list unchanged; ADR-34 gains one line noting the PII-nulling action.

### F-GOLIVE-1: Go-live checklist omits backups and monitoring
- Severity: **major** (brief item 4 requires them; a first-business go-live without a verified backup is a data-loss exposure)
- Location: `IMPLEMENTATION_PLAN.md` "# Go-live checklist — first business" items 1–10
- Problem: The audit brief requires the checklist to cover "program setup for the first business, wallet certificates, backups, monitoring, support, legal/privacy, Arabic content review, and a rollback that does not strand issued passes." Present: program setup (1), certificates (2), support (6, 8), Arabic review (3, 4), rollback (9). Missing: any backup/restore item and any monitoring/alerting item; legal/privacy is only implicit (consent review in item 3).
- Fix: add items after item 8:
  "8a. **Backups.** Nightly Postgres backups + WAL archiving verified by an actual restore drill into staging this week (restore-point runbook); S3 asset bucket versioning on; Redis treated as volatile (outbox rows are in Postgres). 8b. **Monitoring.** Sentry/GlitchTip error alerts verified firing from staging; health endpoints watched by the uptime probe; the outbox dead-letter and `reconcile` drift alerts armed and routed to on-call; cert-expiry alert (item 2) confirmed delivered to a human inbox. 8c. **Legal/privacy.** Enrollment consent text and privacy notice reviewed against the tenant's data obligations (PII deletion procedure demonstrated to the owner: request → anonymize → audit)."
- Affects: `IMPLEMENTATION_PLAN.md` go-live checklist; Phase 0 observability backlog gains "[Ops] backup + WAL config and a restore-drill runbook" (it currently has none).

### F-PLAN-3: Dependency diagram's solid chain contradicts the phase-text dependencies
- Severity: **minor**
- Location: `IMPLEMENTATION_PLAN.md` "Phase dependency diagram" (lines 13–33) vs Phase 8 ("Dependencies. Phase 2 pipeline, Phase 5"), Phase 9 (Phase 3 + Phase 2), Phase 12 (Phases 2 + 5), Phase 11 (Phase 5)
- Problem: The diagram draws one solid chain P0→…→P13, i.e. every later phase hard-depends on its predecessor; the phase text says Phase 8 needs only 2+5 (not 7), Phase 9 needs 3 (+2), Phase 12 needs 2+5. The Gantt repeats the same false serialization. The prose "the MVP is strictly linear" is true only for Phases 0–5.
- Fix: in the diagram replace the segment `P5 --> P6 --> P7 --> P8 --> P9 --> P10 --> P11 --> P12 --> P13` with `P5 --> P6 --> P7`, `P2 -.-> P8`, `P5 -.-> P8`, `P2 -.-> P9` (keep `P3 -.-> P9`), `P3 --> P10` (hard: automations need the ledger), `P9 -.-> P10`, `P5 -.-> P11` (keep), `P2 -.-> P12`, `P5 -.-> P12`, `P1 -.-> P13` (keep). Update the caption: "Solid = hard dependency (Phases 0–5 are strictly linear; automations hard-require the Phase 3 ledger). Dotted = soft reuse." The Gantt may stay as the staffing serialization but its caption should say the later phases are staffed sequentially, not dependency-ordered.
- Affects: the diagram and its caption only; no phase text change.

### F-SKILL-2: i18n-rtl money example reads the currency from the location, but currency is tenant-level
- Severity: **minor** (would teach a wrong data path)
- Location: `skills/.claude/skills/i18n-rtl/SKILL.md` line 44 (`formatMoney(reward.cost_minor, loc.currency, i18n.language)` where `loc` is `useActiveLocation()`)
- Problem: `requirements.md` §2 and `data-model` scope currency to the **tenant** ("Settings (currency, timezone defaults, language) | Tenant"); locations carry a timezone override, not a currency. The example formats money with the active location's currency, which does not exist on that object; an agent copying it builds a broken lookup.
- Fix: replace with `const { data: tenant } = useTenantSettings();` and `formatMoney(reward.cost_minor, tenant.currency, i18n.language)`, and change rule 7's wording "the exponent comes from the currency" to "…from the **tenant's** currency (`GET /api/v1/tenant/settings/`), never assumed, never read from the location".
- Affects: `i18n-rtl` skill (both copies); `react-frontend` skill's money mentions are already tenant-neutral.

### F-SKILL-3: django-backend's HMAC step describes an impossible constant-time key lookup
- Severity: **minor**
- Location: `skills/.claude/skills/django-backend/SKILL.md` line 72 ("look up `ApiCredential` by `key_id` (constant-time compare)")
- Problem: The credential is fetched by `key_id` via a normal DB equality lookup — that is not constant-time and cannot be; only the **signature** comparison can be. As written an agent may hunt for a nonexistent constant-time query API or, worse, skip the real constant-time compare believing it already happened. (Constant-time comparisons matter where secrets are compared: https://docs.djangoproject.com/en/stable/topics/security/#timing-attacks.)
- Fix: replace with "look up `ApiCredential` by exact `key_id` equality (a public identifier — timing leakage is not a concern); the constant-time compare (`hmac.compare_digest`) applies to the **signature** only. Reject if timestamp outside ±300 s → reject on signature mismatch → …"
- Affects: `django-backend` skill only.

### F-PLAN-4: Several backlog tasks are larger than "one PR, reviewable in one sitting"
- Severity: **minor**
- Location: `IMPLEMENTATION_PLAN.md` Epics 2.4, 2.7, 3.3, 9/10 single-line backlogs
- Problem: The chair brief requires tasks "small enough for one pull request"; the audit brief says flag anything over a few days. Candidates: "[Worker] `SignerInterface` + `SelfSigner` pkpass build/sign" (cert handling, zip building, manifest, signing — easily a week alone), "[Frontend] enrollment app (form, consent, wallet buttons, RTL)" (a whole app in one task), "[Frontend] search/scan/code entry + scope-safe lookup" plus three more items crammed into one Epic 3.3 line, and Phases 6–13 whose "backlog" is a single unnumbered line each with no epic split (unlike MVP phases, which are split).
- Fix: split the named tasks (e.g. 2.4 → "signer interface + pass.json projection", "pkpass build/zip/manifest", "cert loading + sign", "PassKit web service endpoints", "APNs push client"); give Phases 6–13 the same numbered-epic treatment at phase-start planning (the plan may defer exact split, but should say so: "each later phase opens with an epic-splitting task like the MVP phases' backlogs").
- Affects: `IMPLEMENTATION_PLAN.md` backlogs; no ADR/skill change.

### F-PLAN-5: `sharingProhibited` / `authenticationRequired` pass flags are in requirements but in no phase scope
- Severity: **minor**
- Location: `requirements.md` §1 ("`sharingProhibited`, `authenticationRequired` — pass-level flags we expose for gift-card-style programs"); `IMPLEMENTATION_PLAN.md` Phase 2 scope/backlog
- Problem: The requirement promises these flags; Phase 2's editor scope and `ProgramSettings` backlog never name them, and no later phase picks them up. Orphan requirement.
- Fix: add to Phase 2 Epic 2.1: "[DB] `sharing_prohibited`, `authentication_required` on `ProgramSettings`; [API] projector emits both keys; [Frontend] editor toggles in the details tab (en/ar help text)". One acceptance line: "a program with both flags set projects them into pass.json and the Google object."
- Affects: Phase 2 backlog; requirements unchanged.

---

## Phase-ordering and MVP-completeness verification (no finding)

Checked per brief item 1: Phase 0 carries auth, the tenant manager/contextvar, i18n/RTL baseline, and the cross-tenant fence before any feature phase — nothing in Phases 1–5 depends on later work (the one deliberate exception, "suspension blocks the API credential (from Phase 5)", is explicitly sequenced in Phase 1's acceptance text and closed by Epic 5.4 — acceptable). Tenant/location context precedes enrollment and stamping. The MVP chain ends with a business able to issue store card (stamps + points), coupon, and generic passes with relevant locations, enroll onto both wallets, update passes, and connect a POS via the tenant API + webhooks; event ticket (Phase 6) and boarding pass (Phase 7) are later phases on the same signer, not out of scope. Sizes, durations, risks (owners and mitigations present for R1–R14), and per-phase goal/scope/models/API/worker/screens/acceptance/tests/dependencies/exit are all present and specific for Phases 0–5; Phases 6–13 are thinner but each still carries the full field set. Mermaid diagrams and gantt parse (`check-mermaid.mjs`) and agree with the phase text except F-PLAN-3's chain-serialization nit.

## Backlog mapping result (brief item 2)

MVP user stories US-PA-1/2, US-LOC-2, US-STF-1/2, US-PRG-1..5, US-ENR-1..3, US-LGR-1..5, US-CUS-1/2, US-ANA-1..3, export, import, audit log, throttles, outbox, webhooks, credentials: all map to at least one backlog task. Orphans found: US-LOC-1 (F-PLAN-1), privacy PII deletion (F-PLAN-2), pass flags (F-PLAN-5). No backlog task was found that lacks a requirement/ADR basis (task sizes flagged separately in F-PLAN-4).

## Skills audit result (brief item 5)

`check-skills.mjs` passes; the two trees are identical. Descriptions are specific and trigger-shaped; rules are actionable; examples are consistent with `CONVENTIONS.md` and the models except where flagged (F-SKILL-1/2/3). Skills correctly defer all visual design to the Airbnb design skill. The one systemic gap is the missing pipeline discipline (F-PIPE-1/2). `feature-delivery`'s tenant-isolation, ledger-matrix, and en/ar-string requirements are present and correct.

## Missing deliverables (brief item 6)

None. Every file the chair brief (round 1) required exists, is non-truncated, and the skills validate. The required *change* (GlowDesk pipeline) is filed as F-PIPE-1/F-PIPE-2 rather than as a missing file.

## Summary

| Id | Severity | Title |
|---|---|---|
| F-PIPE-1 | blocker | GlowDesk evidence/progress/check-script/phase-gate pipeline absent everywhere |
| F-PIPE-2 | blocker | Playwright journeys ar-only; en+ar and light/dark evidence required |
| F-SKILL-1 | major | django-data teaches nonexistent `models.ForeignKeyConstraint` |
| F-REQ-1 | major | requirements.md uses ADR-44-banned names (`staff_member`, `ledger_event`) |
| F-PLAN-1 | major | No task for owner/manager location-management screens (US-LOC-1 orphan) |
| F-PLAN-2 | major | Privacy PII-deletion flow required, never scheduled |
| F-GOLIVE-1 | major | Go-live checklist omits backups, monitoring, legal/privacy items |
| F-PLAN-3 | minor | Dependency diagram's solid chain contradicts phase-text dependencies |
| F-SKILL-2 | minor | i18n-rtl money example reads currency from the location, not the tenant |
| F-SKILL-3 | minor | HMAC key_id lookup described as constant-time |
| F-PLAN-4 | minor | Several backlog tasks exceed one-PR size; Phases 6–13 unsplit |
| F-PLAN-5 | minor | `sharingProhibited`/`authenticationRequired` flags orphaned |

Counts: 2 blockers, 5 major, 5 minor. 12 findings.
