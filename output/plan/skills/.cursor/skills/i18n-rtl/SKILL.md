---
name: i18n-rtl
description: Bilingual English/Arabic and right-to-left conventions for the wallet-pass SaaS frontend. Use when adding or editing user-visible strings, message catalogs, pluralised counts, currency or date formatting, or any layout that must work in RTL in frontend/dashboard, frontend/enrollment, or frontend/packages/messages — includes the required RTL, Arabic-plural, KWD-formatting, and timezone tests.
---

# i18n and RTL conventions

Languages: `en` and `ar`, both fully translated, both apps, from day one. Library: i18next + react-i18next. Catalogs: `frontend/packages/messages/{en,ar}.json`. No machine-English fallback ships; a missing Arabic key fails CI.

## Quick start / rules

1. Never hard-code user-visible text. Use `useTranslation('<feature>')` and add the key to BOTH en.json and ar.json — the CI key-parity check fails the build otherwise.
2. Key format: `feature.context.message` (`counter.search.placeholder`, `program.design.stampCount.label`). Placeholders as `{{name}}`. No HTML in messages, no concatenating translated fragments, no split prose across keys.
3. Counted strings must use plural suffixes — Arabic has six forms (`_zero _one _two _few _many _other`), e.g. `counter.stampsRemaining_other`. Pass `{ count }` and let i18next pick the form (https://www.i18next.com/translation-function/plurals).
4. RTL: `dir` is set on `<html>` from the active language. Layout uses CSS logical properties only — `margin-inline-start`, `padding-inline`, `inset-inline-start`, `text-align: start`, border-inline. Physical `left`/`right`/`text-align: left` fail stylelint (https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values).
5. Exception: pass previews keep Apple/Google's fixed pass rendering; they do not mirror.
6. Directional icons (arrows, chevrons, next/prev) flip under RTL via `[dir='rtl']` or an icon-level `dir` prop. Symmetric icons never flip.
7. All numbers, money, and dates go through `Intl` via the shared formatters in `shared/format.ts` (`formatMoney`, `formatCount`, `formatDateTime`) — never inline `Intl` calls, never string templates:
   - Money: `formatMoney(minor, currency, locale)` converts integer minor units to a decimal string with the currency's exponent (KWD and BHD: 3 digits; SAR/AED/QAR: 2) — the exponent comes from the currency, and the currency comes from the **tenant's** settings (`GET /api/v1/tenant/settings/`), never assumed and never read from the location (currency is tenant-level; locations carry a timezone override, not a currency — round 2 F-SKILL-2).
   - Stamp/point counts are integers: `formatCount` — no decimals, no currency symbols, ever.
   - Dates/times: `formatDateTime(iso, { timeZone, locale })` with the **location's** timezone from API data (default `Asia/Kuwait`). Never format merchant data in the browser's local zone; analytics ranges use the location zone.
8. Wallet-facing strings (pass labels, lock-screen `relevantText`, reward messages, push messages) are stored per program in both languages and projected into Apple `localized` strings / Google `localized*` fields — the backend owns those catalogs; the frontend editors collect both languages side by side.
9. Both apps lazy-load the non-active catalog; the enrollment app ships only its own message namespace (bundle budget, react-frontend skill).

## Examples

```json
// en.json
{ "counter": { "stampsRemaining_one": "{{count}} stamp to your reward",
               "stampsRemaining_other": "{{count}} stamps to your reward" } }
// ar.json — all six forms required
{ "counter": { "stampsRemaining_zero": "لا أختام متبقية",
               "stampsRemaining_one": "ختم واحد متبقٍ",
               "stampsRemaining_two": "ختمان متبقيان",
               "stampsRemaining_few": "{{count}} أختام متبقية",
               "stampsRemaining_many": "{{count}} ختمًا متبقيًا",
               "stampsRemaining_other": "{{count}} ختم متبقٍ" } }
```

```tsx
const { t, i18n } = useTranslation('counter');
const { data: loc } = useActiveLocation();          // timezone source
const { data: tenant } = useTenantSettings();       // currency source (round 2 F-SKILL-2)
<div style={{ marginInlineStart: 8 }}>{t('stampsRemaining', { count })}</div>
<span>{formatMoney(reward.cost_minor, tenant.currency, i18n.language)}</span>
<time>{formatDateTime(entry.created_at, { timeZone: loc.timezone, locale: i18n.language })}</time>
```

## Required tests (ADR-39 acceptance criteria)

- **Key parity**: CI compares en/ar key sets; any missing or extra key fails the build (both apps).
- **Arabic plurals**: a unit test renders every counted string in all six forms (0, 1, 2, 3–10, 11–99, 100+) and asserts a non-empty, non-English result for `ar`.
- **Money formatting**: KWD renders 3 decimals (`12.500`), a 2-decimal currency (e.g. SAR) renders 2 — proving exponent-from-currency; zero values render (`0.000`), never dropped.
- **Timezone formatting**: the same UTC instant renders different local times for two location zones; no merchant timestamp renders in the browser zone.
- **RTL journeys**: Playwright runs the enrollment journey AND the dashboard golden journeys in `en` **and** `ar` (never `ar` only — round 2 F-PIPE-2) with `dir=rtl` snapshot comparison in Arabic; focus order follows visual/reading order.
- **Mixed-direction text** (round 2 F-COV-4): an en/ar Playwright or component case rendering Arabic names beside Latin phone numbers/digits (e.g. a customer called "نور" with "+965 9999 9999"), asserting `dir` handling, bidi isolation of the runs, and formatter output; layout stays on CSS logical properties.
- **Evidence screenshots** (ADR-57): every user-facing epic's evidence pack includes light and dark screenshots in both `en` and `ar`, taken via `playwright.evidence.config.ts`.
- **Logical properties**: stylelint rule bans physical directions outside the pass-preview exception.

## Additional resources

- Full spec: `frontend.md` §5 in the planning docs (PD-FE-5, ruled as ADR-39)
- Domain labels (En/Ar per term): loyalty-domain-glossary skill
