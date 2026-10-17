---
name: i18n-rtl
description: Use when adding or changing user-visible text, translations, Arabic support, RTL layout, or money/date/time formatting in frontend/ screens including the enrollment page. Covers i18next keys, Arabic plural forms, logical CSS properties, mirrored icons, and Intl formatting for KWD and location time zones.
---

# i18n and RTL conventions

## Quick start / rules

- Library: i18next + react-i18next. Locales live in `src/i18n/locales/en.json` and `ar.json`. English and Arabic ship together from day one — every new key goes into BOTH files in the same PR.
- No hard-coded user-visible strings. Interpolate with i18next placeholders (`{name}`), never string concatenation.

### Message keys

- Convention: `feature[.subComponent].key`, camelCase, flat namespaces per feature (`"counter.addStamp"`, `"programs.form.nameLabel"`).
- Plurals: always pass an integer `{ count }`. Arabic requires all six CLDR forms; write them with i18next suffixes:

```json
"counter.stampsLeft": "{{count}} stamps left",
"counter.stampsLeft_zero": "لا توجد طوابع",
"counter.stampsLeft_one": "طابع واحد متبقي",
"counter.stampsLeft_two": "طابعان متبقيان",
"counter.stampsLeft_few": "{{count}} طوابع متبقية",
"counter.stampsLeft_many": "{{count}} طابعاً متبقياً",
"counter.stampsLeft_other": "{{count}} طابع متبقي"
```

- A unit test fails if any key in `ar.json` with a `count` plural is missing any of the six suffixes.

### RTL

- Direction is set once on `<html dir="rtl" lang="ar">` when the active language is Arabic. Never flip per-component.
- Use logical CSS properties only: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline`, `text-align: start`. Physical properties (`margin-left`, `left:`) are lint-banned.
- Directional icons (arrows, chevrons, back) mirror via `[dir="rtl"] .icon-flip { transform: scaleX(-1); }`; symmetric icons never flip.
- The enrollment page (`/e/:token`) is public and bilingual: language toggle at the top, default from browser locale, falling back to the tenant default.

### Formatting (src/shared/lib)

- Money: `formatMoney(amountMinor, currency)` using `Intl.NumberFormat` with `style: 'currency'`. KWD and other GCC currencies use 3 decimals via the ISO 4217 exponent — never `toFixed` and never assume 2 decimals. Amounts arrive from the API as minor-unit integers/strings.
- Stamps and points are integers: `Intl.NumberFormat` with `maximumFractionDigits: 0`.
- Digits in the Arabic UI are Latin: locale string `ar-KW-u-nu-latn` in the shared formatters.
- Dates/times: `formatDateTime(iso, timeZone)` with `Intl.DateTimeFormat`, using the active location's time zone (default `Asia/Kuwait`), and show the zone name near analytics/ledger timestamps. Relative times: `Intl.RelativeTimeFormat`.
- Never call `toLocaleString`/`toLocaleDateString` directly in a feature — always go through `shared/lib/money.ts` / `datetime.ts` so locale, digits, and time zone rules stay in one place.

## Examples

```tsx
const { t, i18n } = useTranslation();
<p>{t('counter.stampsLeft', { count })}</p>
<span>{formatMoney(totalMinor, tenant.currency)}</span> // 1.000 د.ك
<time>{formatDateTime(entry.at, location.timeZone)}</time>
```

Language switch writes the user preference, re-renders, and updates `<html lang dir>` in one place (`setLanguage` in `src/i18n/`).

## Additional resources

- Arabic plural rules reference: https://www.i18next.com/translation-function/plurals
- Full rationale and decision PD-FE-4/PD-FE-5: `/Users/fahad/council/output/plan/frontend.md`
