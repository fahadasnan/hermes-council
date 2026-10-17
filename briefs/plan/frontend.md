# Brief: Frontend architecture and conventions (cartographer)

Output: {{COUNCIL_DIR}}/output/plan/frontend.md

The visual design language (colours, typography, spacing, component look) comes from the owner's separate "Airbnb" design skill. Do not define visual style. Define everything else.

1. App shape: a React + TypeScript merchant dashboard (Vite) for owner, manager and stamper, a platform-admin area where we create a tenant and its owner (no public signup page), plus a small public enrollment page that is fast on a phone. All of them call the Django API. Propose the repository layout (`frontend/`, `backend/`) and package manager. A separate customer mobile app is out of MVP; the wallet pass is the customer surface. Public signup and billing screens belong to the last phase only.
2. Routing (including tenant/location context in the URL or session, location switcher), auth against Django (the mechanism the backend brief chooses), route guards by role. The stamper's home screen is the earn/redeem counter, not a settings page. The client never sends a tenant id the server is expected to trust.
3. Data access: a typed API client, TanStack Query (or justify an alternative) for server state, query key conventions, cache invalidation, optimistic updates only where a failed stamp can be rolled back visibly, error handling surfaced to users. Poll or refetch for "pass update pending"; do not add a second realtime system unless the evidence shows the counter needs it.
4. State, forms, and validation: form library; share field rules with the DRF serializers where practical (document how). Client state rules. The stamp action must be safe against a double tap (disable plus the idempotency key the API requires).
5. i18n and RTL: library, message key conventions, Arabic pluralisation, RTL with logical CSS properties, mirrored icons, number/currency/date formatting with Intl (KWD 3 decimals where money appears; stamp counts as integers), location time zones in the UI. The enrollment page is bilingual from day one.
6. The counter: the hardest merchant screen. How a staff member finds a customer (scan the pass, search, code), adds a stamp or points, and redeems a reward, including flaky network behaviour at a shop counter and what the UI does when the pass update is still pending.
7. Card design: which parts of the pass design are configurable in the MVP (colours may be the one place a tenant sets brand colours; that is content, not our design system), image upload through the API to object storage, preview, and publish. Do not invent a visual system for the dashboard itself.
8. Component architecture: how features consume the design skill's primitives, folder structure per feature, naming, accessibility rules (keyboard, ARIA, focus), loading/empty/error states, responsive behaviour (the counter on a phone or tablet).
9. Testing and quality: unit (Vitest + Testing Library), end-to-end (Playwright), lint/format, type strictness, performance budgets.
10. Diagrams: frontend module structure; data flow from the stamp button to the Django API, the ledger commit, the Celery task, and the pass.

Draft the skills `react-frontend` (structure, data access, forms, state, testing, how to add a new feature screen step by step; reference the Airbnb design skill for all visual decisions) and `i18n-rtl` (keys, Arabic, RTL rules, formatting money/dates/times per location).

Add your "Proposed decisions" section.
