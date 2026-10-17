---
name: react-frontend
description: Frontend conventions for the wallet-pass SaaS React/TypeScript apps. Use when adding or changing screens, components, hooks, forms, API calls, or tests in frontend/dashboard, frontend/enrollment, or frontend/packages — React Router routes, TanStack Query keys and mutations, React Hook Form + Zod forms, feature-folder structure, and the design-skill primitive rules.
---

# React frontend conventions

Stack: React + TypeScript (strict) + Vite, pnpm workspace. Apps: `frontend/dashboard` (merchant + platform-admin), `frontend/enrollment` (public, phone-first). Shared: `frontend/packages/api-types`, `frontend/packages/messages`.

All visual decisions (colors, typography, spacing, component look) come from the Airbnb design skill. Never style a component here — compose its primitives.

## Quick start / rules

1. Server state lives only in TanStack Query. No Redux, no copied server data in local state.
2. Query keys come from the factory in `src/shared/api/keys.ts` (`qk`). Never inline an array.
3. Every mutation invalidates the narrowest affected `qk` key in `onSuccess`. Optimistic updates are allowed ONLY on the counter screen and must roll back visibly on error.
4. All HTTP goes through `apiFetch` in `shared/api/client.ts` (auth, CSRF, typed errors). Never call fetch directly in a feature.
5. Every ledger write (stamp, points, redeem, void) sends an `Idempotency-Key: <uuid>` header; a retry after failure reuses the SAME key.
6. Forms use React Hook Form + Zod. The Zod schema lives in `packages/api-types/validators/<entity>.ts` and mirrors the DRF serializer (comment pointing at it).
7. Feature folder shape:
   ```
   src/features/<feature>/
     routes/      components/   api/      forms/
   ```
8. Every query-backed view renders loading/empty/error via the shared `<QueryState>` — skeleton, empty-with-next-action, error-with-retry. No ad-hoc spinners.
9. Never import dashboard code from `frontend/enrollment` (lint-banned). Enrollment bundle budget: 150 KB gzip first load.
10. Location scope: the active location is the `?loc=` search param (`useActiveLocation()`). It is a filter the server enforces — never an authorization decision.

## Examples

Adding a screen, step by step:

1. Add the route in `src/app/router.tsx` wrapped in `<RequireRole roles={[...]}>`.
2. Create `src/features/<feature>/` with `routes/XPage.tsx`.
3. Add DTO types to `packages/api-types` (mirror the serializer) and a validator if the page has a form.
4. Add keys to `qk`, then `api/useXQuery.ts` / `useXMutation.ts` in `features/<feature>/api/`.
5. Build the view from design-skill primitives + `<QueryState>`; add messages to `en.json` and `ar.json` (both, or CI fails).
6. Tests: colocated `*.test.tsx` (Vitest + Testing Library); add a Playwright journey in `dashboard/e2e/` if it's a golden flow.

Counter mutation skeleton:

```ts
const idemKey = crypto.randomUUID();
const stamp = useMutation({
  mutationFn: () =>
    apiFetch(`/api/ledger/entries`, {
      method: 'POST',
      headers: { 'Idempotency-Key': idemKey },
      body: { customerId, kind: 'stamp', locationId: activeLocationId },
    }),
  onSettled: () => queryClient.invalidateQueries({ queryKey: qk.ledger.list(customerId) }),
});
// button: disabled={stamp.isPending}; on error the balance rolls back and the
// retry button calls stamp.mutate() again with the same idemKey.
```

## Additional resources

- Full architecture: /Users/fahad/council/output/plan/frontend.md (sections 1-10 and the PD-FE decisions)
- i18n/RTL: use the i18n-rtl skill
