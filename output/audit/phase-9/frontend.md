# Phase 9 frontend, i18n and RTL audit

Auditor: @auditor (kanban t_1b255725)
Repo: /Users/fahad/GlowDesk @ feat/phase-9-evidence HEAD 3209ce046a7d1c0ad3ce0984d1d6aef5002f54ed
Gates: /Users/fahad/council/output/audit/phase-9/gates/GATES.md (gates task t_7f4f0b2b)
Briefs: common.md, frontend.md

Status: IN PROGRESS (written incrementally)

## Scope

Frontend/i18n/RTL for plan phase 9 (online booking & notifications), plan/parts/11-delivery-plan.md:1596-1763:
- 9.1 Storage & threat model (Screens: none)
- 9.2 Public booking page (apps/booking SPA, EN+AR, RTL booking flow, Arabic service/staff names)
- 9.3 Notifications (screens: notification history, WhatsApp connection/setup, client data-export request)
- 9.4 Booking-site polish & avatars (screens: avatar upload, branding editor; cache/perf; analytics)

Judged against ADR-16, ADR-36..42, CONVENTIONS §2/§3.4/§3.5/§7, and the react-frontend, i18n-rtl, airbnb-design skills.

## Gate summary relevant to frontend (GATES.md)

- pnpm verify PASS: i18n:compile --strict (206ms), typecheck 8 packages, eslint PASS, stylelint PASS, Vitest 792 PASS (100% on 9 core files), builds PASS, size limits PASS (back-office 241.72/250 kB, booking 100.32/120 kB).
- Playwright FAIL 139/216: en-only cascade; root cause per error-context.md files is infrastructure — GoTrue/PGRST 500s ("Database error checking email", "PGRST002 schema cache"), stale test-results FK tenants; not frontend code. ar project mostly green.
- 9.4 evidence: 90 booking screens + a11y zero violations (plan/evidence/9.4).
- 9.5 evidence: 56 back-office screens (plan/evidence/9.5).