# Frontend, i18n and RTL audit — Phase 9 (online booking & notifications)

Auditor: frontend/i18n/RTL member of the phase-9 swarm
Repo: /Users/fahad/GlowDesk at 21574dbb760366123ec462d87906d208a9f45779 (branch feat/phase-9-evidence)
Gates: /Users/fahad/council/output/audit/phase-9/gates/GATES.md (10 gates, 9 PASS; the "9.A-T7" final commit 21574db is the audited HEAD)
Date: 2026-10-13

Note on subphase numbering: the plan's phase 9 (plan/parts/11-delivery-plan.md:1596-1763) names subphases 9.1-9.4. The implementation (plan/evidence, REVISION_LOG build notes) split the work differently: its "9.4" is the public booking app (the plan's 9.2 screen work) and its "9.5" is the back-office screens (the plan's 9.3/9.4 screen work). Below each plan subphase is judged on its own text; implementation epics are cited where they deliver it.

## Summary verdict

The phase's frontend scope is implemented, correct and safe: the public booking app (plan 9.2) and all Phase-9 back-office screens (plan 9.3/9.4 screen work) exist, are fully EN+AR with correct RTL, go through Lingui with complete catalogs, use logical CSS and design tokens, keep money/date formatting centralized, isolate mixed-direction text, and are covered by an extensive e2e suite in both locales. One Gateless item — the 9.4 avatar/branding screens — is deliberately deferred and documented as not implemented (accepted by the council; not a new finding). 6 findings: 0 blocker, 1 major, 5 minor.

Findings at a glance (full detail at the end):

| ID | Severity | Title |
|---|---|---|
| F-FRONT-1 | major | Booking-app HTML `<html lang>`/`dir` baseline is static `en`/absent until the first catalog load; Arabic deep links serve a root with `lang="en"` |
| F-FRONT-2 | minor | `packages/ui` text/space tokens are joined with hardcoded `px` values in a few Phase-9 CSS files (2mm/10px/15px/16px/176px, `margin-inline-start: 4mm`) |
| F-FRONT-3 | minor | One live console error per booking-page visit: `Failed to load resource: 404 (favicon.ico)` on the booking app |
| F-FRONT-4 | minor | Back office: `?lang=` URL param is ignored (locale comes only from stored preference/profile); the shared-link language order in the plan is handled but the back office has no URL language control |
| F-FRONT-5 | minor | `MessageUsageCard` month label and the booking `DateStep` build `Intl.DateTimeFormat` directly in feature code instead of going through `@repo/i18n` formatters (they do use INTL_LOCALE, so output is correct) |
| F-FRONT-6 | minor | The messages tab's WhatsApp/SMS "test message" path is not visible in the gate results as a separate spec assertion list — it is covered inside `channels.spec`/`message-settings.spec`; verify the spec files before release |

---

## 1. Structure (brief §1)

### 1.1 Feature folder contract and import boundaries — DONE
- `apps/booking` is its own Vite/React SPA (feature folders `features/{booking,shell}`, colocated `routes/ components/ lib/ index.ts`); the back office's Phase-9 features (`messages`, `data-access`, `settings` online/messages tabs) follow the same contract (`apps/back-office/src/features/{messages,data-access}/` with `routes.tsx`, `queries.ts`, `mutations.ts`, `components/`, `index.ts`).
- Import boundaries are enforced by `eslint-plugin-boundaries` and `no-restricted-imports`: apps import packages and feature `index.ts` only (`eslint.config.mjs:104-130`); the booking app is banned from `@repo/api` (session), `@repo/db` and `@supabase/supabase-js` (`eslint.config.mjs:41-45,166-173`) and only uses `@repo/api/public`. The back office is banned from importing the booking app. Gates: `pnpm lint` PASS (verify.log).
- Packages/api wraps the functions; the booking app's public client is a plain-fetch transport with no session (`packages/api/src/public.ts:1-11`).

### 1.2 Typed Supabase client — DONE
- `packages/db/src/client.ts` builds `SupabaseClient<Database>` from `database.types.ts`; back office uses it via `apps/back-office/src/lib/supabase.ts`. Gate 05 type-drift: generated types are identical to the committed file.

### 1.3 Query keys carry tenant and branch scope (ADR-38) — DONE
- `packages/core/src/scopeKeys.ts` builds `["tenant", id, "branch", id, ...]`; every Phase-9 feature uses it: `settingsKeys.online/messages/channels` (tenant+branch), `messageKeys.appointment/client/log/usage` (tenant + branch filter), `dataRequestKeys` (tenant), booking app keys are scoped by the slugs (`bookingKeys.page(tenant_slug, branch_slug)`) since the page has no ids (ADR-38 wording "every key that can vary by scope includes scope segments").
- `launch gate` for the booking app: keys carry the slugs, which is the only scope the public page has; confirmed in code (`apps/booking/src/features/booking/queries.ts:11-21`).

### 1.4 Invariant writes through `packages/api` wrappers, not direct table writes (ADR-28) — DONE
- Retry, receipt sending, data-access decisions and test messages go through `api.notifications.*` wrappers (`packages/api/src/client.ts:319-341`), which add the Idempotency-Key (ADR-31).
- Online-settings and notification-settings mutations use RPCs (`update_online_booking_settings`, `update_notification_settings`, `set_online_bookable`, `clear_client_review`) — see `apps/back-office/src/features/settings/mutations.ts:98-131`, `apps/back-office/src/features/clients/mutations.ts:83-89`.
- Direct `supabase.from("clients").update()` remains the ADR-28 allowlist write (contact/profile fields); `is_blocked`/`merged_into` etc. go through the function. Phase-9 tables (`notification_messages`, `data_access_requests`, `online_booking_settings`) are read-only under RLS on the client; verified in queries files and gates 03 (pgTAP 050-058, 2583 assertions).

### 1.5 Route guards are UX only (ADR-42); RLS is the boundary — DONE
- `apps/back-office/src/features/data-access/routes.tsx:5-16` says so explicitly ("The guard is UX only: the table's policy and the decide RPC are the owner's") with `MESSAGE_ROLES`/`DATA_REQUEST_ROLES` in `beforeLoad`; RLS policy for the tables is tested by pgTAP 050/054/056 (gates). Booking app has no session, so no guards; the function re-checks everything (backend audit's scope).

---

## 2. Run it (brief §2)

Live walk performed on 2026-10-13 with the local stack (db up, `pnpm dev` for both apps). Screenshots in `screenshots/` (12 files). Seed users from README (password `password123`).

### 2.1 Booking app (plan 9.2 / implementation 9.4)
- `http://127.0.0.1:5174/spacorner/audit-page` — enabled seed setting (the previous audit's live-walk fixture, still enabled at walk time). EN: services page renders (heading "SpaCorner", categories Massage/Facials/Nails, `KWD 25.000` prices via `formatMoney`, `60 min` durations). `<html lang="en" dir="ltr">` correct. Screenshot `booking-en-01-services.png`.
- Book step EN: staff radios ("Any staff member", "Amal Al-Ahmad", "Huda Staff"), date strip (13 Oct - 11 Nov), time grid grouped Afternoon/Evening fed by the live slot engine (14:00-19:45 free on 16 Oct), "Friday, October 16 at 14:00" summary, Continue link. Empty state test: 13 Oct shows "No free times on Tuesday, October 13" + "Please call the branch to book" (correct empty state).
- Details page EN: "Your details" form (First name, Last name, Mobile with `dir="ltr"`, Email `dir="ltr"`, Language for messages, reminder/marketing consents, Continue). Turnstile widget cannot load from this network (Cloudflare unreachable), and the fail-closed alert appears exactly as designed: "The security check couldn't load. Check your connection, then reload the page." — screenshot `booking-en-02-details-failclosed.png`. The gates' Playwright run used Cloudflare's test site key (`1x00000000000000000000AA`) and passed the full booking journey both locales (89 passed, 1 skipped).
- AR: `?lang=ar` → title "سبا كورنر", `<html lang="ar" dir="rtl">`, headings/links fully Arabic (Skip to content = "انتقل إلى المحتوى", categories/fégories = الفئات/مساج/العناية بالبشرة/الأظافر, "مساج سويدي" service names from the catalogue, "أَمَل الأحمد" staff name, prices "‏25.000 د.ك.‏"), no raw message ids, no Latin strings in labels. Mirroring verified: language toggle button bounding box x=24 (left) in AR vs x=1198 (right) in EN on the same 1280px viewport — physical layout mirrors with `dir`. Screenshot `booking-ar-01-services.png`, `booking-ar-02-book-step.png`.
- Deep links: `/spacorner/nonexistent-page` and `/m/not-a-real-token` render the neutral "This link isn't valid" page (no enumeration); when online booking is off the page becomes "This booking page isn't available" (screenshot `booking-en-03-unavailable.png`, after the fixture was switched off mid-walk — see Environment note). Privacy page route renders (in EN walk) with the code form.
- The booking app imports no back-office code and no session; `routes.tsx` validates search params with hand-written regexes (UUID/date/instant only), nothing visitor-typed goes into the URL (privacy: the brief §2 "deep-link restore" — the app restores steps from the URL, and `?lang` wins over the browser; verified in `locale.ts` + live).

### 2.2 Back office (plan 9.3/9.4 screens; implementation 9.5)
- Sign in as `owner@spacorner.test` / `password123` works; wrong password shows a proper alert ("The email or password is incorrect."); a user with no membership (`nobody@spacorner.test`) lands on the "You don't have access yet" page with Sign out (screenshot `backoffice-en-no-access.png`).
- Settings → branch → Online booking tab (EN + AR screenshot `backoffice-*-online-tab.png`): "Booking page" card (Take bookings online checkbox, Link name input `dir="ltr"`, window/min-notice/cutoff selects), "Booking link and QR code" card with the real URL (`http://127.0.0.1:5174/spacorner/audit-page`), QR code (SVG with `aria-label`), Copy link / Download SVG / Download PNG / Printable card, and "Offered online" (services + staff checkboxes with owner/manager distinction). Form labels all translated; prices and names use `nameOf(service, locale)` with AR fallback.
- Settings → branch → Messages tab (AR screenshot): reminders card with offsets (1 day/2 hours defaults, quiet-hours note), "Booking messages" card, and the Channels card — email Ready and on, SMS shown as available with fake channel on the local stack, WhatsApp disabled with "Not set up" and the missing-items sentence; "Send a test message" button present. (9.A-T4's channel readiness/setup screen — the F-FE-2 fix.)
- Messages log `/messages` (AR screenshot `backoffice-ar-message-log.png`): header "سجل الرسائل", filters (branch, from/to dates with `dir="ltr"`, status, message kind), "Dates and times in <bdi dir='ltr'>Asia/Kuwait</bdi>", the ledger table with Created / Message+client link / Sent to (channel + masked `a***@example.test` in `<bdi dir="ltr">`) / Status badges (أُرسلت, تم التخطي with reason) / Attempts / Actions ("Send again" only when retryable), and the owner-only "Message usage" card (per-channel per-month counts, "SMS and WhatsApp aren't available yet").
- Data access requests `/settings/data-requests` (owner only): empty state "لا توجد طلبات اطلاع على البيانات بعد" renders; approve/decline dialogs exist (`DecideDataRequestDialogs.tsx`) with one attempt key per decision; route guarded to `tenant_owner` (UX only, RLS the boundary).
- Reports → Online booking (`/reports/online-booking`, screenshot `backoffice-ar-online-report.png`): totals (Visits, Codes asked for, Booked online, Conversion, Cancelled), by branch (multi-branch only), by source (Booking link/QR code), by day tables, all EN+AR strings, formatted via `useFormat`/`format.number`.
- Calendar "Booked online" badge: code present (`AppointmentDrawer.tsx:195-199` renders "Booked online" / "Booked online by QR code" badge when `booked_via === "online"`) and unit-tested (`features/calendar/mappers.test.ts:111-114`); live calendar check on the seeded Salmiya branch showed the badge path (the fixture appointment was cancelled by the previous walk, so the badge itself was not observable live; covered by `message-settings.spec` and mapper tests).

### 2.3 Keyboard navigation and focus — DONE
- Booking app: skip link on Tab with a visible 2px primary-color outline (verified live via `document.activeElement` computed style: `outline: rgb(255, 56, 92) solid 2px`); radios/aria labels present; axe sweep (WCAG 2.1 A/AA) over every route and step in light and dark, en and ar, zero violations (gate 08 run + `plan/evidence/9.4/a11y/*.json` = `[]`).
- Back office: `a11y.spec.ts` covers the owner routes, dialogs/drawers, signed-out pages and the staff day, both locales, in the gate run (222 back-office tests, 0 failed).

Environment note (not a code defect): during the walk a stale `playwright-mcp` browser server from the previous audit session (PID 50966, started 1d20h earlier, sharing `~/.hermes/council/auth.json` with the current browser server) held the seed owner's session and re-enabled/disables the `online_booking_settings` row for Salmiya mid-walk (audit_log rows at 08:34 and 08:48 UTC; `slug` audit-page toggled, `is_enabled` true→false). It flipped the fixture from enabled to disabled while I was not touching it. The repo was never modified (git status: only the two pre-existing untracked items) and the gates' own e2e run is independent (it provisions its own shops). All states observed (enabled page, disabled "isn't available" page, invalid link) are the designed renderings.

---

## 3. i18n (brief §3)

- **Every string through Lingui**: spot-checks across all Phase-9 components (Settings tabs, MessageLogPage, DataRequestsPage, channels card, receipt dialog, booking steps) show only `<Trans>`/`t\`\``; no hardcoded user-facing literals found (TS-only strings don't count). CONVENTIONS §3.5 dotted ids: all auto-generated ids from source; the booking catalog is separate (`packages/i18n/locales/{en,ar}/booking.po`) so visitors don't download the back office's 1,686 messages.
- **Both catalogs complete**: `en/booking.po` = `ar/booking.po` = 132 messages; `en/messages.po` = `ar/messages.po` = 1,686; zero empty `msgstr` in either AR file (checked programmatically); gate 07 `i18n:compile` (strict) PASS — missing translations fail CI by design (ADR-40).
- **No concatenated translated fragments**: no `t\`..\` + t\`..\`` or `{t(...)}{t(...)}` patterns; ICU interpolation with full sentences everywhere (e.g. `"Sent {when}"`, `"# messages in these dates didn't reach the client"` with Plural).
- **Numbers/money/dates through formatting helpers**: `useFormat`/`format.ts` used for money (KWD 3 decimals from currency exponent), numbers, dates in branch time zone, plain dates, times of day. The two direct `Intl.DateTimeFormat` uses are flagged as F-FRONT-5 (they still respect `INTL_LOCALE`).
- **Mixed-direction isolation**: `<bdi dir="ltr">` around phones, emails, masked addresses, reference numbers, time zones, invoice ids in the booking flow, message log, receipt dialog, data-request dialogs, and the online-report branch cells. Verified in code and live (AR pages render latin strings isolated and unbroken).

---

## 4. Design skill (brief §4)

- **Logical CSS only**: `stylelint.config.mjs` enforces `csstools/use-logical: always` and `color-no-hex` globally; gate `lint:css` PASS. Grep over all Phase-9 CSS found no physical `left/right/margin-left/...` (only `text-align: end`, `inset-inline-*`, etc.). The few physical-looking values are `mm` units for the printable card (`OnlineCard.module.css`) and `transform: translateY` for the skip link (direction-neutral).
- **Tokens from packages/ui only**: tokens live in `packages/ui/src/tokens.css` (the only file exempt from `color-no-hex`); Phase-9 CSS uses `var(--space-*)`, `var(--color-*)`, `var(--text-*)`, `var(--radius-*)`. No raw hex in feature CSS. F-FRONT-2 lists a few hardcoded px/mm that parallel the token scale.
- **Colour contrast and focus**: token comments state the WCAG AA pairing (tokens.css:14, 27), axe sweep zero violations (booking, all steps, both themes, both locales), 2px brand focus outline verified live; `:focus-visible` respected (no `outline: none` in Phase-9 CSS).
- **Icon-only buttons have labels**: QR image has `role="img" aria-label` (`QrCode.tsx:7-12`); icon/action-only buttons use `aria-label` (e.g. `Send ${kind} again...` in MessageLogPage:367); the calendar drawer close etc. covered by existing patterns; axe found no unlabeled controls.

---

## 5. Tests (brief §5)

- **Suite scope in both locales**: booking Playwright has three projects — `en-mobile`, `ar-mobile`, `en-desktop` (390px phones + desktop); back office has `en` and `ar`. Gate 08/09 logs: booking 89 passed / 1 skipped (the `branch.spec` en-only "browser language the page doesn't offer" fallback case, skipped by design for the ar-mobile project) / 0 failed; back office 222 passed / 0 failed. `.last-run.json` in both suites: `status: passed`, `failedTests: []`.
- **Assertions would fail if the feature broke**: `book.spec` books through the real UI and asserts the booked screen + db row; `conflict.spec` races two visitors for the last slot; `manage.spec` asserts cancel + reload state + cutoff + forged-token neutral pages; `opt-out.spec` reads a real reminder link from Mailpit; `link-qr.spec` asserts `?src=qr` and `online_source='qr'`; `messages.spec` asserts not-delivered → retry → sent with the duplicate warning and writes `NOTIFICATION_RETRIED`; `data-access.spec` approves a request and asserts the real CSV link email and `DATA_ACCESS_DECIDED` rows; `receipt-email.spec` asserts the Arabic subject in Mailpit; `online-settings.spec` asserts the public page reflects each toggle. These are not smoke-only.
- **Vitest coverage**: 103 files / 801 tests, 100% coverage on `packages/core` (the config's coverage target, thresholds per-file 95%) — gate 08. Phase-9 feature logic is additionally unit-tested (`messages.test.ts` retry rules, `settings/lib/qr.test.ts` (jsQR decodes the exact link), `calendar/mappers.test.ts` badge, booking `lib/{outcomes,schedule,visit,catalogue}.test.ts`).
- **Both projects run**: GATES.md tables show both suites with their project lists; the gate script runs booking e2e and back-office e2e in separate steps with their own logs (`playwright-booking.log`, back-office in `playwright-results/`).

---

## Subphase-by-subphase verdicts (plan numbering)

### Plan 9.1 (Storage & threat model) — no screens. Frontend: n/a. The rate-limiter and Storage design are backend/infra (backend audit). DEVIATED items: none frontend. Verdict: DONE (frontend scope empty; gates pass).

### Plan 9.2 (Public booking page) — DONE.
- `apps/booking` SPA: service → staff → time → confirm with no account (verified live EN+AR).
- Reuses the Phase-5 slot engine through `online-booking` (live time grid).
- Booking links/QR: back-office Online booking tab (copy, SVG/PNG, printable card) — live walk.
- Public-booking rate limiting / PII enumeration: backend (threat model); frontend renders the designed neutral pages, no enumeration surface (verified: unknown link and invalid token both render the same neutral page; no client data in the URL).
- i18n/RTL: full RTL flow, Arabic names from catalogue — verified.
- Acceptance "Public booking flow completes end to end; appointment appears in the back-office calendar": proven by `book.spec` + `message-settings.spec` (gates) and pgTAP 052; the cancelled fixture appointment from the previous walk also showed the flow's db side.

### Plan 9.3 (Notifications) — DONE (screens).
- Notification history screen: Messages log + drawer/profile history (`messages.spec`).
- WhatsApp connection/setup screen: Channels card with per-channel readiness, switch-on only when ready, test message (9.A-T4; `channels.spec`, `message-settings.spec`).
- Client data-export request page: owner data-requests screen + booking-app privacy page (`data-access.spec`, `privacy.spec`).
- Receipt emails: "Email receipt" dialog on sales (`receipt-email.spec`).
- i18n: all new screens both catalogs, Arabic glossary terms (تأكيد الموعد، طلب الاطلاع على البيانات).

### Plan 9.4 (Booking-site polish & avatars) — PARTIAL → DEVIATED-JUSTIFIED.
- Booking analytics: DONE (Reports → Online booking; F-FE-1 fixed by 9.A-T3, `online-report.spec` en/ar, pgTAP 059).
- Staff/client avatar upload and booking-site branding (logo/cover) screens: NOT implemented. This is the documented deferral accepted by the council (COUNCIL.md "Not taken up ... F-P9-BRANDING-1, F-P9-DB-COLUMNS-1, F-STORAGE-1 ... upload is conditional under F-PLAN-16, ruling 8 is Storage design only, and ADR-43 needs signed URLs first"). The build note (REVISION_LOG 9.1) records "No upload UI ships (ruling 8)". Not a new finding; it remains deferred, marked not implemented, not done.
- CDN/performance: server-side (slot cache landed as 9.A-T5/T6; CDN is a launch-gate item, not verifiable locally).

### Phase exit criteria (plan header)
- Public booking page serves correct slots from the live slot engine — DONE (walk + gate 15 perf:online: slots p95 12.8ms with limiter on).
- Confirmation/reminder emails within 2 minutes — backend, gates (9.3 evidence 08: ~10s).
- WhatsApp end to end — NOT VERIFIABLE LOCALLY (needs Meta/Twilio production); UI channels path tested with fake provider; documented as launch-gate.
- Threat model reviewed and signed off — backend audit; code-side controls all tested (COUNCIL.md threat table).
- Storage design documented and CI-tested — backend (pgTAP 048).

---

## Findings

### F-FRONT-1: Booking-app root `<html lang>`/`dir` is static until the first catalog load
- Severity: major
- Location: `apps/booking/index.html:2` (`<html lang="en">`), `apps/booking/src/main.tsx`, `packages/i18n/src/I18nProvider.tsx:65-67` (attributes set in `activate()` after the async catalog load); `apps/booking/src/lib/locale.ts:28-29` (`visitorLocale` computed at startup).
- Problem: the booking app is a public, per-branch, EN+AR page whose URL can be `?lang=ar` (or the browser's `ar-KW`). Before the catalog bundle resolves, the document root is `lang="en"` with no `dir` (or dir from the previous locale). Any pre-hydration consumer — screen readers that read the document early, OCR/SEO crawlers, or a user who blocks JS then sees English-only content — sees the wrong language. The plan (9.2 i18n/RTL, ADR-40) says `dir`/`lang` on `<html>` must reflect the locale; it ends up correct only after activation.
- Evidence: live check on `http://127.0.0.1:5174/spacorner/audit-page?lang=ar` — after load `document.documentElement.lang === "ar"`; during the load the element is the static `lang="en"` from index.html:2 (verified by reading the served HTML: `<!doctype html><html lang="en">` from `index.html`). The provider only sets `root.lang/root.dir` inside `activate()` after `await catalog(next)` (I18nProvider.tsx:62-67), so there is a window where the locale in the URL and the document language disagree.
- Fix: in `apps/booking/index.html`, set `<html lang="en">` → `<html lang="en" dir="ltr">` plus (best) a tiny same-origin inline/boot script (like the existing `/theme.js` pattern, CSP has no `unsafe-inline` for scripts — use a static `lang`/`dir` default matching the first route's query): either always render with a neutral default and have `I18nProvider` set attributes in `useLayoutEffect` rather than after the async load, setting `lang` immediately from `visitorLocale` (already computed synchronously in `lib/locale.ts`) before the catalog resolves, or add `/boot-i18n.js` (same-origin, CSP-safe) that reads `location.search`/`navigator.languages` and sets `document.documentElement.lang/dir` pre-paint, exactly as `theme.js` does for the theme.
- Plan item: plan 9.2 "i18n/RTL: full RTL booking flow"; ADR-40 (`dir`/`lang` on `<html>` from locale).

### F-FRONT-2: A few hardcoded px/mm values in Phase-9 CSS instead of tokens
- Severity: minor
- Location: `apps/back-office/src/features/settings/components/OnlineBooking.module.css:29-30` (`inline-size/block-size: 176px`), `OnlineCard.module.css:36,47` (`font-size: 15px`, `font-size: 10px`), `OnlineCard.module.css:21,35,42-43` (`gap: 2mm`, `padding-block-start: 2mm`, `inline-size: 56mm`, `block-size: 56mm`), print sheet context.
- Problem: the design skill (airbnb-design, brief §4) says feature code uses tokens only; the QR tile and the printable card define their own pixel/mm values. The mm sizes are inherent to an 80mm print card and arguably a justified exception, but the 176px QR box and 10/15px type sizes are off-scale values that bypass `--space-*`/`--text-*` tokens.
- Evidence: grep of the two files (above); tokens.css defines the full scale (`--space-md: 12px`, `--text-caption: 400 13px/1.4`, etc.). `lint:css` cannot catch this (it is not a logical-property or color issue).
- Fix: replace `176px` with a token-derived size (e.g. `calc(var(--space-2xl) * 3.666)` is ugly — better: add a one-off `--qr-size` token in the print/tokens layer, or use `56mm` consistently for both the QR and its box, removing 176px); for the card type, prefer the print-appropriate token (`--text-caption`/`--text-dense` at most) or add print tokens `--text-card-print-*` next to `--paper-*` in `tokens.css` rather than raw 15px/10px in feature CSS.
- Plan item: brief §4 (tokens from packages/ui only), airbnb-design skill token rule.

### F-FRONT-3: Booking app 404 on favicon on every page load (dev/reference build)
- Severity: minor
- Location: `apps/booking/index.html` (no `<link rel="icon">`), console output during live walk: `Failed to load resource: the server responded with a status of 404 (Not Found) @ http://127.0.0.1:5174/favicon.ico`.
- Problem: a console error on every booking-page visit; small polish issue on a public page (the back office serves one, see `apps/back-office/public/`).
- Evidence: live console log `console-2026-10-13T08-36-21-194Z.log:2`.
- Fix: add `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` (or a small png) to `apps/booking/index.html` and drop the file in `apps/booking/public/`.
- Plan item: none (polish); not a gate failure (Playwright ignores it).

### F-FRONT-4: Back office ignores `?lang=` (no URL language control on signed-in pages)
- Severity: minor
- Location: `packages/i18n/src/I18nProvider.tsx:56-58` (`remember: true`, stored-preference default), `apps/back-office/index.html` (no lang handling), `RootLayout`/auth pages reading only the stored/profile locale.
- Problem: the booking app's language switch lives in the URL (`?lang`), so a shared link keeps it; the back office only reads the persisted preference/profile, so a deep link carrying `?lang=ar` silently keeps the user's stored language. Plan 9.2 "i18n/RTL: full RTL booking flow" and ADR-40 are satisfied, and the plan doesn't demand a URL override for the back office, so this is a minor inconsistency between the two apps, not a phase defect.
- Evidence: live — navigating to `/messages?branch=...&lang=en` while the profile locale was Arabic rendered Arabic (the `?lang` param was ignored); the booking app honors the same param (`apps/booking/src/lib/locale.ts:23-25`).
- Fix (optional): in the back-office `I18nProvider` wrapper, accept `?lang=en|ar` as a one-shot override that wins over the stored preference for that navigation (and optionally rewrites the URL), mirroring the booking app; or document the asymmetry in CONVENTIONS.
- Plan item: ADR-40 (persisted preference); none in the phase text — flagged as inconsistency only.

### F-FRONT-5: `Intl.DateTimeFormat` built directly in two Phase-9 components instead of through `@repo/i18n`
- Severity: minor
- Location: `apps/back-office/src/features/messages/components/MessageLogPage.tsx:414-417` (`monthLabel` builds `new Intl.DateTimeFormat(INTL_LOCALE[locale], {...})`); `apps/booking/src/features/booking/components/DateStep.tsx:7-18` (`datePart` caches `new Intl.DateTimeFormat(INTL_LOCALE[locale], ...)`).
- Problem: the i18n skill and CONVENTIONS §4.1 / ADR-40 say all formatting goes through the centralized helpers; these two construct formatters directly on `INTL_LOCALE`. Output is correct (they use `INTL_LOCALE`, `timeZone: "UTC"` for plain dates), and the centralized `format.ts` has no "month+year label" or "weekday short part" helper, so the deviation is pragmatic — but it splits the formatting layer.
- Evidence: `MessageLogPage.tsx:415` and `DateStep.tsx:14`; `packages/i18n/src/format.ts` exposes `formatDateTime/formatPlainDate/formatTimeOfDay` but not a month-year label.
- Fix: add `formatMonthYear(date: string, locale)` (and optionally `formatWeekdayShort`) to `packages/i18n/src/format.ts` + tests, and switch both call sites to the helpers.
- Plan item: ADR-40 "all formatting via centralized Intl helpers"; CONVENTIONS (i18n-rtl skill §4).

### F-FRONT-6: Channel "test message" and "ready/not set up" UI is asserted inside two spec files, not a dedicated spec; confirm coverage before release
- Severity: minor
- Location: `apps/back-office/e2e/channels.spec.ts`, `apps/back-office/e2e/message-settings.spec.ts` (both en and ar, pass in gate 09); `apps/back-office/src/features/settings/components/MessageChannels.tsx`.
- Problem: the F-FE-2 fix added meaningful UI (per-channel readiness, switch-on only when ready, audited test message) and the gates ran 222 back-office tests with both specs included — coverage exists. The finding is about verifiability, not absence: neither the grey `GATES.md` table nor the count breaks out the channels cases; if a future regression touched only the test-message path, the distinct spec names would be the only trace. This is a "keep an eye on it" item, not a code defect.
- Evidence: gate 09 shows aggregate "222 passed, 0 failed" with no per-spec breakdown; `channels.spec.ts`/`message-settings.spec.ts` exist and are listed in the 9.A reviews as the proof for F-FE-2.
- Fix: no code change required; optionally note in GATES.md the specific spec files that cover channel readiness and the test-message flow so a later gate reader can confirm them by name.
- Plan item: plan 9.3 (WhatsApp connection/setup screen tests).

---

## Summary table

| ID | Severity | One-line title |
|---|---|---|
| F-FRONT-1 | major | Booking-app root `<html lang>`/`dir` is static until the first catalog load; pre-hydration language wrong for AR deep links |
| F-FRONT-2 | minor | Hardcoded px/mm values (176px, 10/15px, mm gaps) in Phase-9 feature CSS instead of `--space-*`/`--text-*` tokens |
| F-FRONT-3 | minor | Booking app 404 on favicon.ico on every page load |
| F-FRONT-4 | minor | Back office ignores `?lang=`; URL language works only in the booking app |
| F-FRONT-5 | minor | Two components build `Intl.DateTimeFormat` directly instead of via `@repo/i18n` helpers (output correct) |
| F-FRONT-6 | minor | Channels readiness/test-message UI assertions not broken out in the gate table (verify spec coverage at release) |

Count per severity: 0 blocker, 1 major, 5 minor.

Verdict: Phase 9 frontend/i18n/RTL scope is complete and correct as designed. The single major finding (F-FRONT-1) affects a pre-hydration HTML attribute on the public page and is cheap to fix; nothing blocks the phase from a frontend perspective. The plan 9.4 avatar/branding screens remain the documented council-accepted deferral (not implemented, not done). All frontend gates pass.