---
name: i18n-rtl
description: Bilingual English/Arabic and right-to-left conventions for the wallet-pass SaaS frontend. Use when adding or editing user-visible strings, message catalogs, pluralised counts, currency or date formatting, or any layout that must work in RTL in frontend/dashboard, frontend/enrollment, or frontend/packages/messages.
---

# i18n and RTL conventions

Languages: `en` and `ar`, both fully translated, both apps. Library: i18next + react-i18next. Catalogs: `frontend/packages/messages/{en,ar}.json`.

## Quick start / rules

1. Never hard-code user-visible text. Use `useTranslation('<feature>')` and add the key to BOTH en.json and ar.json — CI fails on key parity or a missing Arabic translation.
2. Key format: `feature.context.message` (`counter.search.placeholder`, `program.design.stampCount.label`). Placeholders as `{{name}}`. No HTML in messages, no concatenating translated fragments.
3. Counted strings must use plural suffixes — Arabic has six forms (`_zero _one _two _few _many _other`), e.g. `counter.stampsRemaining_other`. Pass `{ count }` and let i18next pick the form (see https://www.i18next.com/translation-function/plurals).
4. RTL: `dir` is set on `<html>` from the language. Layout uses CSS logical properties only — `margin-inline-start`, `padding-inline`, `inset-inline-start`, `text-align: start`. Physical `left`/`right`/`text-align: left` fail stylelint. (Logical properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values)
5. Exception: pass previews keep Apple/Google's fixed pass rendering; they do not mirror.
6. Directional icons (arrows, chevrons, "next/prev") flip under RTL via `[dir='rtl']` or an icon-level `dir` prop. Symmetric icons never flip.
7. All numbers, money, and dates go through `Intl`:
   - Money: `Intl.NumberFormat(locale, { style: 'currency', currency })` — KWD (and BHD) use 3 fraction digits; take the currency from the API, never assume USD.
   - Stamp/point counts are integers: `Intl.NumberFormat(locale)` — no decimals.
   - Dates/times: `Intl.DateTimeFormat(locale, { timeZone })` with the location's time zone from the API (default `Asia/Kuwait`). Never format merchant data in the browser's local zone.
8. Use the shared formatters in `shared/format.ts` (`formatMoney`, `formatCount`, `formatDateTime`) rather than constructing `Intl` calls inline.

## Examples

```json
// en.json
{ "counter": { "stampsRemaining_other": "{{count}} stamps to your reward",
               "stampsRemaining_one": "{{count}} stamp to your reward" } }
// ar.json (six forms required for ar)
{ "counter": { "stampsRemaining_zero": "لا أختام متبقية",
               "stampsRemaining_one": "ختم واحد متبقٍ",
               "stampsRemaining_two": "ختمان متبقيان",
               "stampsRemaining_few": "{{count}} أختام متبقية",
               "stampsRemaining_many": "{{count}} ختمًا متبقيًا",
               "stampsRemaining_other": "{{count}} ختم متبقٍ" } }
```

```tsx
const { t, i18n } = useTranslation('counter');
const { data: loc } = useActiveLocation();
<div style={{ marginInlineStart: 8 }}>{t('stampsRemaining', { count })}</div>
<span>{formatMoney(totalKwd, i18n.language, loc.currency)}</span>
```

## Additional resources

- Full i18n/RTL spec: /Users/fahad/council/output/plan/frontend.md §5 (decision PD-FE-5)
