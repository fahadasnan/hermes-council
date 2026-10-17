# Brief: Decisions, implementation plan, conventions, and skills (chair)

Inputs: everything in {{COUNCIL_DIR}}/output/plan/ (requirements.md, data-model.md, django/, backend.md, frontend.md, skill-drafts/, review.md). Never modify FINAL_REPORT.md, TECHNICAL_REPORT.md, or the technical/ folder.

## 1. {{COUNCIL_DIR}}/output/plan/decisions.md

Rule on every proposed decision as an architecture decision record: ADR-<n> title, Status (Accepted / Rejected / Deferred), Context, Decision, Alternatives, Consequences, Source (which member proposed, verifier verdict). Where the verifier disagreed, either adopt the change or explain why not. Every later document must follow these decisions.

## 2. {{COUNCIL_DIR}}/output/plan/IMPLEMENTATION_PLAN.md

A phase-based plan from empty repository to the first business live on a real program, then to a sellable multi-tenant product:

- Phase 0 is the foundation (repository, Django project, Postgres, Redis, Celery, CI, auth, the tenant manager, i18n/RTL baseline, design-skill integration, observability). Then MVP phases in dependency order, including platform-admin provisioning of a tenant and the tenant API plus signed webhooks a store system can call when it has an API. Then post-MVP phases (event ticket and boarding pass, beacons, campaigns and pass push messages, automations, referrals and tiers, named connectors for specific store systems, the developer portal, white-label). The last phase is self-serve: public signup and subscription billing. Nothing in an earlier phase may depend on it.
- For each phase: goal; scope (features); database work (models, migrations, constraints); Django services and API; Celery tasks; frontend screens; acceptance criteria; test plan; dependencies; risks and mitigations; rough size (in engineer-weeks, with assumptions about team size); exit criteria and what the first business can do at the end of it.
- A backlog per phase broken into epics and tasks small enough for one pull request, each tagged DB / API / Worker / Frontend / Ops.
- A phase dependency diagram (Mermaid) and a timeline (Mermaid gantt with relative durations).
- Go-live checklist for the first business (program setup, wallet certificates, staff training, a rollback that does not strand issued passes) and the risks register.

## 3. {{COUNCIL_DIR}}/output/plan/CONVENTIONS.md

The design language and conventions in one place: architecture overview, repository layout, naming (DB, functions, TypeScript, files, i18n keys), API and error conventions, tenancy rules, data access rules (what the frontend may do directly), ledger and idempotency rules, testing standards, git workflow (branches, commit message format, PR checklist), definition of done. State that the visual design comes from the owner's Airbnb design skill.

## 4. Skills

Finalise these skills from the drafts, consistent with decisions.md and CONVENTIONS.md, following {{COUNCIL_DIR}}/output/plan/briefs/skill-format.md:

- loyalty-platform-architecture (stack, tenancy model, repository layout, data access rules, where each kind of code lives, links to the other skills)
- loyalty-domain-glossary
- django-data
- django-backend
- react-frontend
- i18n-rtl
- feature-delivery (how to implement a backlog task end to end: model -> migration -> service -> permission -> API -> UI -> tests -> PR, definition of done, commit format)

Write each to BOTH {{COUNCIL_DIR}}/output/plan/skills/.cursor/skills/<name>/SKILL.md and {{COUNCIL_DIR}}/output/plan/skills/.claude/skills/<name>/SKILL.md (identical content; supporting files copied to both). Validate with `node {{COUNCIL_DIR}}/check-skills.mjs {{COUNCIL_DIR}}/output/plan/skills` and `node {{COUNCIL_DIR}}/check-mermaid.mjs` on every markdown file you wrote; fix until both pass.
