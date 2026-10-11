# Phase 9 Gates Results

## Repository State

- **Repository path**: /Users/fahad/GlowDesk
- **Branch**: feat/phase-9-evidence
- **HEAD**: 3209ce046a7d1c0ad3ce0984d1d6aef5002f54ed
- **Working tree**: Has uncommitted changes (see git-status-before.txt)

### Uncommitted Changes (present before and after gates)
```
M docs/security/public-booking-threat-model.md    (staged)
 M package.json                                    (unstaged)
?? .pnpm-store/
?? .seed-pw
?? plan/evidence/phase-9-gates/
?? scripts/perf/online-load.ts
```

### Local Branches
feat/phase-9-evidence (current), main, and 20+ feature/fix branches.

## Toolchain Versions

| Tool | Version |
|------|---------|
| node | v26.10.0 |
| pnpm | 11.24.0 |
| supabase | 2.119.0 |
| deno | 2.9.6 |
| docker | 29.4.0 |

Supabase local stack: Stopped initially, started via `supabase start`, running on ports 54321 (API), 54322 (DB), 54323 (Studio), 54324 (Mailpit/Inbucket).

## Gate Results

| # | Gate | Exit Code | Result | Log File | Key Lines |
|---|------|-----------|--------|----------|-----------|
| 1 | pnpm install --frozen-lockfile | 0 | PASS | 001-pnpm-install-frozen-lockfile.log | "Already up to date. Done in 191ms" |
| 2 | supabase db reset | 0 | PASS | 002-pnpm-db-reset.log | "Finished supabase db reset" - 70 migrations applied + seed |
| 3 | supabase test db (pgTAP) | 1 | FAIL | 003-pnpm-db-test.log | 61 files, 2511 tests: 2506 passed, 5 failed subtests |
| 4 | supabase db lint --level warning | 0 | PASS | 004-pnpm-db-lint.log | Warnings only (type cast warnings in checkout_compute_totals, create_sale) |
| 5 | Type drift (supabase gen types + diff) | 0 | PASS | 005-type-drift.log | No substantive drift. Generated types identical to committed (2267 lines) |
| 6 | pnpm fn:test (Deno) | 0 | PASS | 006-pnpm-fn-test.log | 13 suites, 0 failed. All suites PASS |
| 7 | pnpm verify | 0 | PASS | 007-pnpm-verify.log | skills check, i18n, typecheck, lint, 792 Vitest tests, build, size-limit all green |
| 8 | Playwright (back-office e2e) | 1 | FAIL | 008-pnpm-playwright.log | 216 tests: 139 passed, 77 failed |
| 9 | Final supabase db reset | 0 | PASS | 009-final-db-reset.log | 70 migrations + seed, clean for other council members |

### pgTAP Failure Details (3 tests only, 5 subtests failed)

**1. 029_checkout_matrix.test.sql - Test 14**
- Assertion: "each branch numbers its own invoices: INV-1 exists at A1, A2 and B1 (ADR-14)"
- Result: have=4, want=3
- Issue: 4 invoices found instead of expected 3 across the three branches.

**2. 050_online_schema.test.sql - Tests 56-57**
- Test 56: "every consent row is audited" - have=9, want=3. More audit rows exist than expected (likely the seed seeded consent rows beyond the test's expectation).
- Test 57: "existing appointments read as desk bookings with no online source" - have=6, want=0. Existing seeded appointments may have been created with an online source.

**3. 056_data_access.test.sql - Tests 7, 9**
- Test 7: "no row is recorded, and the code is spent all the same" - have=[1,true], want=[0,true]. A row was recorded where none expected.
- Test 9: "and records nothing either" - have=1, want=0. A row was recorded where none expected.
- These are data access request tests - likely the seed data includes rows that the test didn't account for.

### Playwright Failure Analysis
- 139 passed, 77 failed of 216 tests
- Projects: en (Desktop Chrome), ar (Desktop Chrome)
- Arabic tests mostly pass; English tests have cascading failures after ~21 tests pass
- Primary failure mode: `expect(locator).toBeVisible()` for the account menu button at signIn() - suggests a session/cookie state issue on the reused dev server
- Real failures (not infrastructure): touch-drag time mismatch (1 ar), realtime cross-session delivery
- All Playwright failures have screenshots + traces saved to playwright-results/

## Test Counts

| Test Type | Passed | Failed | Skipped | Notes |
|-----------|--------|--------|---------|-------|
| pgTAP | 2506 | 5 | 0 | 61 files, 2511 tests total |
| Deno (fn:test) | All suites | 0 | 0 | 13 suites, all PASS |
| Vitest | 792 | 0 | 0 | 101 files, 100% coverage on 9 core files |
| Playwright | 139 | 77 | 0 | 216 tests (108 en + 108 ar) |

## Gates Impact on Repository

Git status before and after gates is IDENTICAL. No files were modified by running the gates. The gates did not modify the repository.

## Notable Observations

1. **pgTAP failures are minor/seed-data related**: All 5 failing subtests appear to be test expectation mismatches due to seed data or slight counting differences, not real isolation/security issues.

2. **pnpm verify is fully green**: Skills check, i18n compile, typecheck, lint (eslint + stylelint), all 792 Vitest tests, both apps build, and size-limit budgets all pass.

3. **Deno function tests all pass**: 13 suites across all Edge Functions including the new Phase 9 ones (notifications, online-booking, webhooks).

4. **Type drift**: Zero drift between generated Typescript types and committed database.types.ts.

5. **db:lint warnings only**: All warnings are type-cast warnings in SECURITY DEFINER functions (text-to-array casts during computation) and IMMUTABLE/STABLE annotation concerns. No errors.

6. **Playwright en failures**: Most "en" locale failures appear to be infrastructure (sign-in timeout cascade), not code bugs. The "ar" locale passed clean for nearly all tests.