# Implementation plan and skills audit

Output: `{{COUNCIL_DIR}}/output/plan/review2/plan-skills-audit.md`

Audit `IMPLEMENTATION_PLAN.md` and all seven skills in `skills/`.

1. Phases. For every phase check goal, scope, models, API, worker, screens, acceptance criteria, tests, dependencies, risks, size and exit criteria are present and specific. Check ordering: nothing may depend on work from a later phase (for example auth and the tenant manager before any feature, i18n/RTL from Phase 0, tenant and location context before enrollment and stamping). Check the MVP really ends with a business that can issue a store card, a coupon, and a generic pass with relevant locations, and that event ticket and boarding pass are later phases rather than out of scope.
2. Backlog. Every MVP requirement in `requirements.md` and every ADR that implies work must map to at least one backlog task. List orphans in both directions. Tasks must be small enough to finish and review (flag anything that looks larger than a few days).
3. Diagrams. Check the dependency diagram and gantt chart agree with the phase text, and validate them with `check-mermaid.mjs`.
4. Go-live and risks. Check the go-live checklist covers program setup for the first business, wallet certificates, backups, monitoring, support, legal/privacy, Arabic content review, and a rollback that does not strand issued passes. Check the risk register has owners and mitigations.
5. Skills. Run `check-skills.mjs`. Then read each skill as the AI that will follow it in the new repo: is the description specific enough to trigger at the right time, are the rules actionable, are examples correct and consistent with `CONVENTIONS.md` and the models, is anything important missing (for example a feature-delivery checklist that forgets tenant-isolation tests or Arabic strings), and do skills stay out of visual design? Quote the exact lines to change.
6. Missing deliverables. Anything the chair brief (`output/plan/briefs/chair.md`) required that is absent or thin.
