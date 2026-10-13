# Phase 9 Database & Security Audit — Auditor Report

Auditor: database-auditor profile  
Repository: /Users/fahad/GlowDesk (branch feat/phase-9-evidence, HEAD 21574db)  
Date: 2026-10-13  
Precedent: decisions.md (ADRs) > PLAN.md > CONVENTIONS.md > .cursor/skills

---

## Scope note

Phase 9 is a **post-MVP phase** (PLAN.md line 1594). Per ADR-17/decisions.md line 12:
> "Post-MVP phases (9–17) are specified to decision level only; their per-task backlogs are produced at scheduling time, per the IMPLEMENTATION_PLAN note."
> "the subphase detail and backlogs in Phases 9-17 below are illustrative, scheduling-ready material — not binding task commitments."

The team nevertheless implemented Phase 9 fully. This audit judges the database work against the plan's illustrative specification, the binding ADRs, and CONVENTIONS.md.

---

## 1. Migrations reviewed

19 new Phase 9 migrations (20261017100000–20261017100920), all verified as never-before-edited (git log --follow shows each is a single commit).

| Migration | Purpose | Status |
|-----------|---------|--------|
| 20261017100000_storage_design.sql | Storage bucket, path scheme, RLS-mirroring policies | PASS |
| 20261017100100_rate_limits.sql | Per-tenant token-bucket rate limiter (ADR-47) | PASS |
| 20261017100200_online_booking_schema.sql | Settings tables, booked_via, client_consents, RLS | PASS |
| 20261017100300_booking_engine_internal.sql | Internal booking engine + desk wrappers | PASS |
| 20261017100400_online_booking_rpcs.sql | Public booking page RPCs | PASS |
| 20261017100410_online_manage_scope.sql | Manage-link token resolution | PASS |
| 20261017100500_notifications.sql | Notification ledger, outbox, queue, cron | PASS |
| 20261017100600_reminder_scheduler.sql | Reminder scheduling via pg_cron | PASS |
| 20261017100650_notification_consumer.sql | pgmq consumer for sends | PASS |
| 20261017100660_notification_claim_client.sql | Client claim for notifications | PASS |
| 20261017100670_receipt_optout.sql | Email receipt + opt-out support | PASS |
| 20261017100700_data_access_requests.sql | Client data export flow | PASS |
| 20261017100710_delivery_reports.sql | Delivery report tracking | PASS |
| 20261017100800_notification_retry_usage.sql | Retry + usage tracking | PASS |
| 20261017100900_online_booking_analytics.sql | Booking analytics counters | PASS |
| 20261017100905_notification_test_audit.sql | Test audit support | PASS |
| 20261017100910_slot_cache.sql | Never-stale slot cache | PASS |
| 20261017100920_slot_cache_commit_bump.sql | Cache commit-time version bump | PASS |

### 1.1 Naming and structural compliance (CONVENTIONS §3.2)

All migrations audited for:
- **uuid PKs** with `gen_random_uuid()`: PRESENT on every new table.
- **`tenant_id` on every tenant-owned table**: PRESENT.
- **Composite FKs `(entity_id, tenant_id)` per ADR-20 rule 5**: VERIFIED on all new tables. Verified via psql on the live database: `notification_messages` has composite FKs to `branches(id, tenant_id)`, `clients(id, tenant_id)`, `appointments(id, tenant_id)`.
- **Money as `bigint _minor`**: The new Phase 9 tables do not add any money columns (money is Phase 6). No violations.
- **`timestamptz`**: All timestamps use `timestamptz`. PRESENT.
- **`updated_at` triggers**: PRESENT on all mutable tables.
- **Bilingual names where operators see names**: `online_booking_settings` store locale-independent data; service/staff names come from Phase 3+ tables.
- **All-branches representation** (`branch_id NULL` + `all_branches`, no sentinel UUID): RELEVANT tables follow this pattern (e.g. `notification_messages` has nullable `branch_id`).

### 1.2 Composite FKs (ADR-20 rule 5)

Verified on live database that all non-trivial new tables carry composite FKs:

```
notification_messages:
  - (branch_id, tenant_id) -> branches(id, tenant_id)
  - (appointment_id, tenant_id) -> appointments(id, tenant_id)
  - (client_id, tenant_id) -> clients(id, tenant_id)

online_booking_settings:
  - foreign key (branch_id, tenant_id) references public.branches(id, tenant_id)

notification_settings:
  - foreign key (branch_id, tenant_id) references public.branches(id, tenant_id)

client_consents:
  - foreign key (client_id, tenant_id) references public.clients(id, tenant_id)

online_verifications:
  - foreign key (branch_id, tenant_id) references public.branches(id, tenant_id)

appointment_manage_tokens:
  - foreign key (branch_id, tenant_id) references public.branches(id, tenant_id)

online_booking_daily:
  - foreign key (branch_id, tenant_id) references public.branches(id, tenant_id)
```

All correct. PASS.

---

## 2. RLS and grants

### 2.1 New tables and their RLS status

| Table | RLS? | Policies | Direct writes? | Anon access? | Status |
|-------|------|----------|----------------|--------------|--------|
| online_booking_settings | YES | 1 select | NO (via RPCs `update_online_booking_settings`) | NO | PASS |
| notification_settings | YES | 1 select | NO (via RPC `update_notification_settings`) | NO | PASS |
| client_consents | YES | 1 select | NO (append-only via triggers) | NO | PASS |
| notification_messages | YES | 1 select | NO (only via `appointments_outbox` trigger and `notification_enqueue` definer function) | NO | PASS |
| notification_attempts | YES | 1 select | NO (append-only via definer functions) | NO | PASS |
| online_verifications | YES | 0 policies | NO (via definer RPCs only) | NO | PASS |
| appointment_manage_tokens | YES | 0 policies | NO (via definer RPCs only) | NO | PASS |
| rate_limit_buckets | YES | 0 policies | NO (via `rate_limit_take` definer function only) | NO | PASS |
| rate_limit_trips | YES | 0 policies | NO (via `rate_limit_take` definer function only) | NO | PASS |
| online_booking_daily | YES | 1 select | NO (via `online_bump_daily` definer RPCs, owners+managers read) | NO | PASS |
| branch_availability_versions | YES | 0 policies | NO (via definer `bump_branch_availability`) | NO | PASS |
| online_slot_cache | YES | 0 policies | NO (via definer functions only) | NO | PASS |
| client_consent_current (view) | security_invoker | N/A | NO | NO | PASS |

### 2.2 RLS policy correctness

All policies checked:
- No `USING (true)` on tenant data — PASS
- All policies are `TO authenticated` — PASS
- `WITH CHECK` on all insert/update policies — PASS (where applicable)
- Branch-scoped tables use the branch-scoped RLS template (`has_tenant_role` or `current_branch_scope`) — PASS
- Function-written tables have `revoke all ... from anon, authenticated` then `grant select` — PASS

### 2.3 Grants on functions

Verified via `has_function_privilege()`:

- **Internal functions** (`booking_create_internal`, `booking_slots_internal`, `booking_cancel_internal`, `notification_enqueue`, `appointments_outbox`, `online_match_client`, `online_bump_daily`, `online_page`, `online_staff_ids`, `online_check_choice`, `online_consume_verification`): Not executable by ANY API role (only callable from other SECURITY DEFINER functions) — PASS

- **Desk booking RPCs** (`book_appointment`, `booking_available_slots`, `cancel_appointment`): service_role only — PASS

- **Online booking RPCs** (`online_resolve_branch`, `online_catalogue`, `online_available_slots`, `online_verification_start`, `online_verification_check`, `online_book`, `online_cancel`, `online_manage_view`, `online_manage_scope`): service_role only — PASS

- **Settings write RPCs** (`update_online_booking_settings`, `update_notification_settings`, `set_online_bookable`, `clear_client_review`): authenticated only (correct — these are called by the back-office UI) — PASS

- **Analytics record functions** (`online_record_visit`, `online_record_code_request`): service_role only — PASS

- **report_online_booking**: authenticated + service_role (correct — `security invoker` means RLS applies) — PASS

- **Rate limiter** (`rate_limit_take`): service_role only — PASS

### 2.4 Finding: online_settings_bool/online_settings_int grants

- Severity: Minor
- Location: supabase/migrations/20261017100200.sql:293-294
- Problem: The migration explicitly revokes `execute on function public.online_settings_int(jsonb, text, integer, integer, text)` and `execute on function public.online_settings_bool(jsonb, text)` from `public, anon, authenticated`. However, in the live database, `authenticated` CAN execute these functions.
- Evidence: `has_function_privilege('authenticated', 'public.online_settings_bool(jsonb, text)', 'EXECUTE') = true` verified via psql.
- Impact: These are IMMUTABLE validation functions (JSON type/range checkers) with no data access, so this is harmless. The REVOKE in the migration is correct but a later implicit grant (from a prior migration's broader grants or a chain) may have overridden it.
- Fix: Execute explicit `REVOKE ... FROM authenticated` again in a new migration, or accept as-is since the functions are pure computation with no side effects.
- Plan item: PARTIAL — the migration's stated intent is not met, though the security surface is unaffected.

---

## 3. SECURITY DEFINER functions

Every SECURITY DEFINER function in Phase 9 audited for:
- `SET search_path = public` — PRESENT on all checked (booking_create_internal, booking_slots_internal, booking_cancel_internal, notification_enqueue, appointments_outbox, online_match_client, tenant_asset_can_read, tenant_asset_can_write, rate_limit_take, bump_branch_availability, all online_* RPCs)
- No references to other schemas without qualification — PASS
- `EXECUTE` revoked from `public` and `anon` on all sensitive functions — PASS

`has_tenant_role` signature used in RLS policies:
```sql
has_tenant_role(p_tenant_id uuid, p_roles text[], p_branch_id uuid)  -- 3 parameters, no default
```
Confirmed: no default on the branch parameter (CONVENTIONS §3.2 / ADR-19). PASS.

---

## 4. Security probing (attack surface)

### 4.1 PII enumeration protection

The online booking RPCs are specifically hardened against PII enumeration:

1. `online_resolve_branch` returns the same P0002 `booking_page_not_found` for: unknown tenant slug, unknown branch slug, switched-off page, archived branch, or suspended tenant. A caller cannot distinguish between "tenant exists" and "tenant doesn't exist" — PASS.

2. `online_verification_start` hashes verification codes with ONLINE_HASH_PEPPER before storing; the database never sees raw codes — PASS.

3. `online_match_client` creates a new client with `review_pending=true` when email or phone partially matches, preventing attacker from determining whether a phone/email is registered — PASS.

4. Appointment manage tokens are stored as HMAC hashes only; raw tokens never reach the database — PASS.

5. `online_booking_daily` counters store no PII: only tenant_id, branch_id, day, source, and counter integers — PASS (verified by pgTAP 059).

### 4.2 Rate limiting

The `rate_limit_take` RPC implements per-tenant token-bucket rate limiting:
- Fail-closed on store error or timeout (`lock_timeout = '400ms'`)
- All-or-nothing across keys (prevents partial consumption on rate-limited request)
- Keys locked in sorted order (prevents deadlock)
- Only service_role can call it (Edge Functions)
- pgTAP 049 verifies refill math, retry-after, token consumption — PASS

### 4.3 Storage bucket isolation

Storage bucket `tenant-assets` is private (`public = false`). Policies enforce:
- SELECT: `tenant_asset_can_read(name)` — tenant member only
- INSERT/UPDATE/DELETE: `tenant_asset_can_write(name)` — owner/manager only
- No anon access
- MIME type restricted to png/jpeg/webp/pdf
- File size limited to 5 MB

PASS.

### 4.4 Cross-tenant verification

The database has 3 tenants seeded (spacorner, glow-lab, setup-studio). Verified that:
- notification_messages uses composite FKs to prevent cross-tenant FK scams
- The branch-scoped RLS template prevents cross-branch reads
- `online_booking_settings` has a unique slug constraint per tenant (`online_booking_settings_slug_unique`)

---

## 5. Types and seed

- Type drift check: PASS (no drift). Verified by gates: generated types are identical to `packages/db/src/database.types.ts`.
- Seed data: the migration backfills `online_booking_settings` and `notification_settings` for existing branches. Verified via `supabase db reset` (gates: PASS). Seed logins documented in README work correctly — PASS.

---

## 6. Alignment with plan specification

### Subphase 9.1: Storage & threat model
- Plan: "Database work: none (Storage buckets are infrastructure)"
- Actual: Migration 20261017100000 creates Storage bucket + path parser + RLS helpers. This is the database-facing part of Storage and is correctly scoped.
- Migration 20261017100100 creates the rate limiter tables.
- Verdict: **DONE** (the additional database work is consistent with the plan's intent).

### Subphase 9.2: Public booking page
- Plan: "Database work: none (consumes Phase 5 engine)"
- Actual: Three migrations add infrastructure needed to share the booking engine (engine internals split in 20261017100300), settings tables (20261017100200), and online RPCs (20261017100400).
- Verdict: **DEVIATED-JUSTIFIED** — the plan simplified "Database work" as none, but the engine split and online-specific tables are architecturally necessary to share the Phase 5 engine securely with public traffic.

### Subphase 9.3: Notifications
- Plan: "notification_log table + pg_cron reminder jobs"
- Actual: Full notification ledger with: notification_messages, notification_attempts, pgmq queue, outbox trigger, reminder scheduler, consumer, retry logic, delivery reports, data access requests, and retention purge.
- Verdict: **DONE** (the implementation is comprehensive and correct — exceeds plan scope but all additions are necessary).

### Subphase 9.4: Booking-site polish & avatars
- Plan: "Avatar/logo URL columns on relevant tables (lightweight)"
- Actual: No avatar URL columns found in Phase 9 migrations. The Storage infrastructure from 9.1 supports this. Analytics table added in 20261017100900.
- Verdict: **PARTIAL** — the Storage infrastructure exists (9.1), but the actual avatar/logo URL columns on staff/clients/branches tables are not added in these migrations. They may be added in a later phase or ticket.

---

## 7. pgTAP coverage

Phase 9 adds pgTAP test files 048–061:

| Test file | Test count | What it covers |
|-----------|-----------|----------------|
| 048_storage_policies | 47 | Storage bucket, path parsing, RLS mirroring, cross-tenant |
| 049_rate_limits | 42 | Token bucket math, refill, retry, grants, trips |
| 050_online_schema | ~50 | Settings tables, RLS, write path grants, seed_branch trigger |
| 051_engine_internal | 23 | Internal functions deny, desk wrappers, parity with 027 |
| 052_online_rpcs | ~60 | Online RPC: resolve branch, catalogue, verification, book |
| 053_online_identity | ~20 | Online identity: match client, review flag, manage tokens |
| 054_notifications_schema | 46 | Notification ledger RLS, outbox trigger, queue, cron |
| 055_reminders | ~20 | Reminder scheduling, dedupe, quiet hours |
| 056_data_access | ~15 | Data access request flow |
| 057_delivery_reports | ~15 | Delivery report tracking |
| 058_notification_retry | ~20 | Retry logic, dead letter, sweep |
| 059_online_booking_analytics | 20 | Counter-only table, record RPCs, role scoping |
| 060_notification_test_audit | ~10 | Notification test audit support |
| 061_slot_cache | ~20 | Slot cache, version bump triggers, grants |

Total pgTAP: 2583 passed, 0 failed (from gates report).

The pgTAP tests cover the CONVENTIONS §7 matrix requirements: per-table, per-operation (select/insert/update/delete), per-role (owner, manager, receptionist, staff, outsider, anon), plus cross-tenant and cross-branch cases.

Verdict: PASS.

---

## 8. Skill consistency

The `supabase-database` skill at `.cursor/skills/supabase-database/SKILL.md` was reviewed against the real migrations:

- All naming rules match the glossary and real migrations — PASS
- RLS templates match the real policies — PASS
- Composite FK rules (ADR-20 rule 5) match — PASS
- The all-branches representation matches — PASS
- Money conventions match — PASS (no new money columns in Phase 9)

No contradictions found. The skill is up to date with the real implementation.

---

## Findings summary

### F-DATABASE-1: online_settings_bool/online_settings_int grants mismatch
- Severity: Minor
- Location: supabase/migrations/20261017100200.sql:293-294; verified via psql
- Problem: Migration explicitly revokes EXECUTE on these IMMUTABLE validation functions from authenticated, but authenticated can still execute them. The functions only parse and validate JSON input types/ranges; they read no data and have no side effects.
- Evidence: `has_function_privilege('authenticated', 'public.online_settings_bool(jsonb, text)', 'EXECUTE') = true`
- Fix: Add a follow-up migration with explicit REVOKE, or accept as-is since the functions are harmless pure-computation validators.
- Plan item: CONVENTIONS §3.2 / migration safety

### F-DATABASE-2: Avatar/logo URL columns from plan subphase 9.4 not observed
- Severity: Minor
- Location: supabase/migrations/20261017100000–20261017100920
- Problem: The plan's subphase 9.4 specifies "Avatar/logo URL columns on relevant tables (lightweight)" as database work. The Storage infrastructure exists (9.1) but no avatar/logo URL columns are added to staff_members, clients, or branches tables in these Phase 9 migrations.
- Evidence: grep of all Phase 9 migrations shows no ALTER TABLE ... ADD COLUMN for avatar_url, logo_url, or similar.
- Fix: Either accept that avatar columns land as a separate task (the plan is illustrative per F-PLAN-17), or add a migration adding the columns.
- Plan item: Phase 9.4 — booking-site polish & avatars

---

## Summary table

| ID | Severity | Title |
|----|----------|-------|
| F-DATABASE-1 | Minor | online_settings_bool/online_settings_int grants mismatch |
| F-DATABASE-2 | Minor | Avatar/logo URL columns from plan 9.4 not added |

### Counts per severity
- Blocker: 0
- Major: 0
- Minor: 2

---

## Overall verdict: PASS

The Phase 9 database implementation is correct, secure, and follows all ADRs and conventions. The two minor findings do not affect database isolation, security, or data integrity. The implementation exceeds the illustrative plan scope in necessary ways (engine internals split, notification ledger, rate limiter) and follows the established patterns for RLS, composite FKs, and SECURITY DEFINER functions.

The gates passed: 2583 pgTAP tests, 801 Vitest (100% coverage), 13 Deno suites, no type drift, clean db:reset.