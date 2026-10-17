---
name: react-frontend
description: Use when adding or changing code in frontend/ — React + TypeScript (Vite) screens, hooks, API calls, forms, tests for the wallet-pass SaaS dashboard, admin area, or enrollment page. Covers folder structure, TanStack Query data access, forms, state, testing, and how to consume the Airbnb design skill for all visual decisions.
---

# React frontend conventions

## Quick start / rules

- All code lives in `frontend/src/`. Never fetch data outside TanStack Query; never touch the database or Django internals from the client — the only backend contact is the typed API client in `src/api/`.
- Monorepo layout: `backend/` (Django) and `frontend/` (this app). Package manager is pnpm.
- TypeScript `strict` + `noUncheckedIndexedAccess`; no `any` without a justification comment.

### Folder structure per feature

```
src/features/<feature>/
  routes/        # route elements (React Router v7)
  components/    # feature composition only — no colours, fonts, spacing values
  hooks/         # useX: data + interaction logic
  schemas/       # Zod schemas mirroring DRF serializers
  api.ts         # client functions for this resource
src/shared/ui/   # design-skill wrappers (Button, Input, Card, Modal, Table, Toast)
src/shared/lib/  # money.ts, datetime.ts, errors.ts, id.ts
src/i18n/        # locales/en.json, locales/ar.json, formatters
```

Shared code goes in `src/shared/` only when two features need it; otherwise keep it in the feature.

### Visual style

All visual decisions (colours, typography, spacing, component look) come from the owner's **Airbnb design skill**. Features import primitives from `src/shared/ui/` wrappers only. Never hard-code hex colours or px spacing in a feature; lint bans them outside `shared/ui/` and `styles/`.

### Data access

- TanStack Query v5, object signature only: `useQuery({ queryKey, queryFn })`.
- Hierarchical keys, most generic first: `['programs', { scope: locationId }]`, `['customers', customerId]`, `['counter', customerId]`, `['ledger', customerId, { page }]`.
- Mutations invalidate the exact keys they touch — never invalidate everything.
- Pass-update pending: poll with `refetchInterval` while `passSync === 'pending'` (see `usePassSyncStatus`). No websockets/SSE.
- Errors: API client throws typed `ApiError` with a stable `code`; map codes to i18n messages, show a toast, and render the error state via `<QueryBoundary>`.
- Loading/empty/error for every data screen via the shared `<QueryBoundary query={...}>`; no hand-rolled three-state logic.

### Auth and routing

- Session-cookie auth handled entirely by `src/api/auth.ts` (CSRF header helper). Guards (`RequireRole`) are UX only; the API enforces permissions.
- The client never sends a tenant id. Tenant and location scope come from `GET /api/v1/session`.
- Stamper role lands on `/counter`; the counter is a scanner-first, phone-first screen.

### Forms

- React Hook Form + `@hookform/resolvers/zod`. The Zod schema in `features/<f>/schemas/` mirrors the DRF serializer for that endpoint (serializer is the authority).
- Earn/redeem (stamp button): disable while `isPending`; generate one `crypto.randomUUID()` idempotency key per intent and send it as the `Idempotency-Key` header; retry reuses the same key; never auto-retry.
- Redeem is never optimistic and always has a confirmation step.
- On flaky network: after ~4s show "Not confirmed — Retry (same key) / Cancel". Never assume a stamp succeeded on error.

### State

- Server state: TanStack Query only. Local UI: `useState`/`useReducer`. Cross-cutting client state (language): one small Zustand store. No Redux.

## Examples

Stamp mutation (the pattern for all counter writes):

```ts
const keyRef = useRef<string>(crypto.randomUUID());
const stamp = useMutation({
  mutationFn: () =>
    api.counter.earn({ customerId, key: keyRef.current }),
  onSettled: () =>
    queryClient.invalidateQueries({ queryKey: ['counter', customerId] }),
});
// UI: disabled={stamp.isPending}; on error keep keyRef, offer Retry.
```

Adding a new feature screen, step by step:

1. Add the route element under `src/features/<feature>/routes/` and wire it in `src/app/router.tsx` with its `RequireRole`.
2. Add typed client functions in `src/api/<resource>.ts` and types in `types.ts`.
3. Write the Zod schema mirroring the DRF serializer.
4. Build hooks (`hooks/useX.ts`) with query keys following the convention.
5. Compose the screen from `shared/ui` primitives; wrap data areas in `<QueryBoundary>`.
6. Add i18n keys to both `en.json` and `ar.json` under the feature namespace (all six Arabic plural forms when `count` is used).
7. Tests: Vitest + Testing Library for the hook/form; a Playwright journey in `e2e/` for the core flow.

## Additional resources

- [i18n-rtl skill](../i18n-rtl/SKILL.md) for keys, RTL, and formatting.
- Full architecture rationale: `/Users/fahad/council/output/plan/frontend.md`.
