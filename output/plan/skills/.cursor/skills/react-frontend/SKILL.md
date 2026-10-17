---
name: react-frontend
description: Frontend conventions for the wallet-pass SaaS React/TypeScript apps. Use when adding or changing screens, components, hooks, forms, API calls, query keys, or tests in frontend/dashboard, frontend/enrollment, or frontend/packages — React Router routes and role guards, TanStack Query keys and mutations, React Hook Form + Zod forms, feature-folder structure, the Idempotency-Key counter protocol, and the design-skill primitive rules.
---

# React frontend conventions

Stack: React + TypeScript (strict) + Vite, pnpm workspace. Apps: `frontend/dashboard` (merchant + platform-admin routes), `frontend/enrollment` (public, phone-first). Shared: `frontend/packages/api-types`, `frontend/packages/messages`.

All visual decisions (colors, typography, spacing, component look) come from the owner's Airbnb design skill. Never style a component here — compose its primitives through the `shared/ui` re-export layer (ADR-41).

## Quick start / rules

1. Server state lives only in TanStack Query. No Redux, no server data copied into local state.
2. Query keys come from the factory in `src/shared/api/keys.ts` (`qk`). Never inline an array.
3. Every mutation invalidates the narrowest affected `qk` key in `onSuccess`/`onSettled`. Optimistic updates are allowed ONLY on the counter screen and must roll back visibly on error.
4. All HTTP goes through `apiFetch` in `shared/api/client.ts` (base `/api/v1`, session credentials, CSRF header, `Idempotency-Key` support, typed `ApiError` with the backend's stable codes). Never call `fetch` directly in a feature.
5. Every ledger write (earn, redeem, void, issue) sends `Idempotency-Key: <crypto.randomUUID()>` — generated at press time, reused verbatim on retry, never regenerated (ADR-13/38).
6. Forms use React Hook Form + Zod. The Zod schema lives in `packages/api-types/validators/<entity>.ts`, mirrors the DRF serializer, and carries a comment naming it. Server validation is authoritative.
7. Feature folder shape:
   ```
   src/features/<feature>/
     routes/      components/   api/      forms/
   ```
8. Every query-backed view renders loading/empty/error through the shared `<QueryState>` — skeleton, empty-with-next-action, error-with-retry. No ad-hoc spinners.
9. `frontend/enrollment` never imports dashboard code (ESLint `no-restricted-imports`). Bundle budgets: enrollment ≤150 KB gzip first load; dashboard initial route ≤300 KB gzip, route-level code splitting.
10. Location scope: the active location is the `?loc=` search param (`useActiveLocation()` + `LocationSwitcher`). It is a filter the server enforces — never an authorization decision (ADR-40).
11. Route guards (`<RequireRole roles={[...]}>` + `usePermissions()` from `GET /api/v1/auth/me/`) are UX only; show a "not authorized" page, never redirect silently. Role landings: platform_admin → `/admin/tenants`, owner/manager → `/analytics`, staff → `/counter`.
12. Wire field names are snake_case (DRF); DTOs keep snake_case; component-internal state may be camelCase.

## Examples

Adding a screen, step by step:

1. Route in `src/app/router.tsx` wrapped in `<RequireRole roles={[...]}>`.
2. `src/features/<feature>/routes/XPage.tsx`.
3. DTO types in `packages/api-types` (mirror the serializer) + a Zod validator if the page has a form.
4. Keys in `qk`, then `api/useXQuery.ts` / `useXMutation.ts` in the feature's `api/`.
5. Build from design-skill primitives + `<QueryState>`; messages added to en.json **and** ar.json (CI fails on parity — see i18n-rtl skill).
6. Tests: colocated `*.test.tsx` (Vitest + Testing Library); Playwright journeys in `dashboard/e2e/` for golden flows, run in `en` **and** `ar` (ADR-57).

Counter mutation skeleton (canonical endpoints):

```ts
const idemKey = crypto.randomUUID();          // once per user intent, reused on retry
const earn = useMutation({
  mutationFn: () =>
    apiFetch('/ledger/earn/', {
      method: 'POST',
      headers: { 'Idempotency-Key': idemKey },
      body: { balance_id: balanceId, quantity: 1, location_id: activeLocationId },
      timeoutMs: 10_000,                      // 10 s request timeout (ADR-38)
    }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.ledger.list(customerId) }),
});
// button: disabled={earn.isPending}
// on error: balance rolls back; the retry button re-calls earn.mutate() — SAME idemKey
```

Timeout protocol (round 2 F-FE-1 — safety-critical, so it is code, not a comment): on timeout the write may or may not have committed. Mark the entry "sent, unconfirmed", re-query the ledger, treat it as success if the entry is found, and offer an explicit retry only if it is absent. Never silently resend.

```ts
const [unconfirmed, setUnconfirmed] = useState(false);   // set on mutation timeout
const recheck = useQuery({
  queryKey: qk.ledger.list(customerId),
  enabled: unconfirmed,
  refetchInterval: (q) =>
    q.state.data?.some((e) => e.idempotency_key === idemKey) ? false : 2000,
});
const landed = recheck.data?.some((e) => e.idempotency_key === idemKey);
// landed → success: clear "sent, unconfirmed", show the new balance
// not landed after the re-query window → show an explicit "Retry (same key)" action;
//   the retry reuses idemKey verbatim, so a late commit replays (200 + Idempotent-Replay)
//   instead of double-crediting. The UI never resends on its own.
```

Pass-update polling after a confirmed write. No WebSocket or SSE in MVP — pass status uses TanStack Query `refetchInterval` polling only (ADR-36, round 2 F-FE-2):

```ts
const status = useQuery({
  queryKey: qk.passStatus.detail(passId),
  refetchInterval: (q) => (q.state.data?.push_status === 'pending' ? 3000 : false),
});
// 'pending' → "pass updating…" chip; 'failed' → "pass update failed" + repush action
```

State placement (one home per kind):

| State | Home |
|---|---|
| Server data | TanStack Query cache only |
| Form state | React Hook Form (uncontrolled) |
| URL state (filters, `?loc=`, tab) | React Router search params |
| Ephemeral UI (modal open) | local `useState` |
| Language | i18next instance; nothing else global |

`staleTime`: 60 s for analytics/dashboards, 0 for counter lookups. `refetchOnWindowFocus: true`.

## Counter behavior contract (frontend §6, binding)

Three entry modes (camera scan with manual fallback, debounced 300 ms search, typed code) — a lookup outside the staff scope returns "not found", and the UI never reveals it exists. Actions: earn / redeem / coupon consume; each mutation follows the idempotency protocol above. Flaky network: optimistic increment with visible rollback + same-key retry; timeout → "sent, unconfirmed" → ledger re-query, never a silent resend; offline → banner + disabled state (IndexedDB queueing with keys intact is the stretch). The ledger committed write is safe regardless of what the wallet chip says.

## Accessibility and responsiveness

Every flow keyboard-operable; visible focus never suppressed; labels on all inputs via `Field`; `aria-live="polite"` for toasts and counter balance changes; dialogs are real modals (focus trap, escape, return focus); tables use `<table>` semantics; scan status announced. Dashboard works ≥320 px (counter is mobile-first, thumb-zone actions, no hover-only affordances); enrollment is phone-first.

## Testing

Vitest + Testing Library (user-centric queries): forms/validators, the counter mutation protocol (same-key retry, timeout re-query path, rollback), shared formatters (see i18n-rtl). Playwright golden journeys — every journey runs in `en` **and** `ar` (ADR-57, round 2 F-PIPE-2): login per role → landing; stamp → reward → redeem incl. throttled/offline; program create → design → publish; the enrollment journey additionally on a phone viewport with RTL snapshot comparison (both apps); tenant provisioning in `/admin`. Evidence packs for user-facing epics include light and dark screenshots in both languages via `playwright.evidence.config.ts` (ADR-57). Type rules: `strict`, `noUncheckedIndexedAccess`, no `any` in app code; DTO boundaries parsed with Zod where input is untrusted.

## Additional resources

- Full architecture: `frontend.md` in the planning docs (PD-FE decisions, ruled in `decisions.md` ADR-35..41)
- i18n/RTL: the i18n-rtl skill. End-to-end recipe: feature-delivery skill.
- TanStack Query https://tanstack.com/query/latest · i18next https://www.i18next.com
