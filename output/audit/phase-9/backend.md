# Phase 9 — Edge Functions & backend audit (backend.md)

- Auditor: auditor profile (swarm task t_c9e893d8)
- Date: 2026-10-13
- Repo: /Users/fahad/GlowDesk @ feat/phase-9-evidence, HEAD 21574db (9.A-T7: Gate run 6 on the final commit)
- Gates reference: /Users/fahad/council/output/audit/phase-9/gates/GATES.md — 9/10 gates PASS; Deno 13 suites passed (fn-test.log EXIT: 0); pgTAP 2583 passed; Vitest 801/100% coverage; Playwright 311 passed.
- Scope: supabase/functions/ (phase-9 functions: online-booking, notifications, webhooks; _shared), packages/validation, packages/api, supabase/config.toml, judged against the plan Phase 9 Edge Functions sections, ADR-19, ADR-20 rules 3+7, ADR-27..33, ADR-35, ADR-43, ADR-47, CONVENTIONS §3.3/4/6, supabase-edge-functions skill.

## Phase plan (Edge Functions/backend items claimed by phase 9)

- 9.2 Edge Functions: `online-booking` function: `slots` (public, rate-limited), `public-create` (rate-limited, CAPTCHA/anti-bot), `confirm` (with notification trigger).
- 9.3 Edge Functions: `notifications` function: `send`, `schedule-reminder`, `status-check`, `export-request`; WhatsApp provider adapter; pgmq consumer for notification dispatch. DB: `notification_log`, pg_cron reminders.
- 9.4: backend claims: slot-engine cache layer, booking analytics (visits/codes/bookings/cancellations by branch/source/day) [9.A-T3/T5].
- 9.1: rate limiter per ADR-47 (per-tenant token bucket in `_shared`, Postgres-backed, quotas, fail mode); Storage design ADR-43 (infra, not EF).
- Exit criteria: booking confirmation/reminder emails/SMS within 2 min; WhatsApp end to end; threat model reviewed; Storage design documented and CI-tested.

## What I verified so far (append as I go)

(work in progress — this file is written incrementally)