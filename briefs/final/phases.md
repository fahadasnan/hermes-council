# Phases and subphases

Output: `{{COUNCIL_DIR}}/output/plan/final/drafts/phases.md`

Restructure the revised `IMPLEMENTATION_PLAN.md` into phases and subphases, from empty repository to the first business live, then to a sellable multi-tenant product. Keep the canonical phase numbers; subphases are numbered `<phase>.<n>` (for example 5.3).

1. Every phase, including every post-MVP phase (these are currently thin and must be expanded to the same depth as the MVP phases), gets: goal; why it comes at this point; what the business can do at the end; Loopy Loyalty equivalent (evidence reference) and how ours differs; size; dependencies; risks; exit criteria.
2. Every subphase is a shippable slice of one to three weeks and gets: goal; features delivered; database work (models, migrations, constraints); Django services, API and Celery tasks; screens; i18n/RTL work; acceptance criteria (testable, including Arabic/RTL and tenant isolation where relevant); tests; backlog tasks (each small enough for one pull request, tagged DB / API / Worker / Frontend / Ops); dependencies on other subphases.
3. Slot in the extra features the parity worker is likely to propose (campaigns, tiers, referrals, points if deferred, gift cards, public API, WhatsApp enrollment, platform admin, audit log) as subphases of the most suitable phase. Platform admin provisioning belongs in the MVP. Public signup and subscription billing are the last phase and must not move earlier. Coordinate through the swarm root comments if you can see the parity draft.
4. A Mermaid dependency diagram at subphase level for the MVP and at phase level for post-MVP, and a Mermaid gantt chart with subphases as tasks, assuming the team size stated in the revised plan (state it).
5. Go-live checklist for the first business and the risk register (owner, likelihood, impact, mitigation), updated for round 2.
6. Residual issues found while doing the above.
