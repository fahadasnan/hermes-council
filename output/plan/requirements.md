# Product requirements, scope and roles

Worker: cartographer (requirements brief). Date: 2026-10-17.
Inputs (read-only): FINAL_REPORT.md, TECHNICAL_REPORT.md (§2–§7 settings/analytics), pages.md, links.md, review.md; Apple and Google wallet documentation cited inline.
Scope statement: multi-tenant wallet-pass SaaS for Kuwait first, then the GCC. No public signup, no self-serve trial, no in-app subscription checkout until the last phase. Clean-room design: nothing below copies Loopy Loyalty UI, copy, branding, or API shapes.

## 0. Release phases used throughout

- **P1 MVP** — what a business can run on day one, after we provision their account.
- **P2** — event ticket. **P3** — boarding pass. **P4** — beacons and NFC.
- **P5** — push campaigns, automations, referrals, tiers. **P6** — public API. **P7** — white-label.
- **P8 (last)** — public signup, self-serve tenant creation, subscription billing.
The program schema, signer, and ledger must accept every pass style from P1, so P2/P3 add fields and screens, not a new pass pipeline.

## 1. Module catalogue

Every module and feature Loopy Loyalty offers (from FINAL_REPORT §1–§4 and TECHNICAL_REPORT §4–§7), with the release each lands in for our product. "Later phase" placements are justified where non-obvious.

### 1.1 Feature catalogue and release placement

| Feature (Loopy evidence) | One-line description | Release | Justification / notes |
|---|---|---|---|
| Account/campaign list ("Manage My Cards") | List all programs with live pass previews and status | P1 | Home of the merchant dashboard |
| Program (campaign) editor, six-tab config | Design, reward/copy, locations, terms, enrollment fields, labels | P1, labels→P5 | Design/reward/locations/terms/enrollment are needed to issue any pass; label override is polish (Loopy marks it premium) |
| Pass design: icon, logo, stamp imagery, colors, 1–30 stamps | Visual pass configuration with live preview | P1 | Live preview is the product's strongest owner affordance; keep it |
| Reward definition + success messages with `{#}` counter | What the customer earns, and per-event messaging | P1 | Reward copy shown on pass and at redeem time |
| Expiry (none / fixed date / fixed period after signup) | Card validity window | P1 | Maps to pass relevant date |
| Useful links table on pass | URL/phone/email/address quick links on the pass back | P1 | Cheap, high value on any pass style |
| Terms and issuer contact ("Support" tab) | T&C text and issuer details required by Apple | P1 | Apple requires issuer info on every pass |
| Enrollment data fields + mandatory flags + consent | What the enrollment form collects per program | P1 | Needed for any customer capture |
| Unique-customer dedupe (up to 3 fields, premium) | Block duplicate enrollments | P5 | Nice-to-have; MVP can dedupe on phone/email per program without the config UI |
| Location attach per program + per-location lock-screen message | Relevant locations on the pass trigger lock-screen display | P1 (locations), P4 (beacons) | Location relevance is required, not optional (common.md); beacon lock-screen triggers move to P4 with beacons |
| Program activation (draft → live) | Publish a program so customers can enroll | P1 | Loopy gates it behind email verification; we gate it behind explicit owner confirm |
| Share URL + QR code per program | Short link and QR that open the enrollment page | P1 | The default acquisition path |
| Hosted enrollment page (link/QR → form → save to wallet) | Customer-facing signup + Add to Apple Wallet / Google Wallet | P1 | Both wallets from day one |
| Wallet pass issuance (Apple + Google) | Signed pass pushed to the customer's wallet | P1 | Core of the product |
| Stamp issuing (`/stamp`, Stamper app, API) | Staff scan/type a card ID and add stamps | P1 (dashboard + scanner tool) | MVP needs a counter flow: scan/type → confirm → done |
| Points balance rule set | Points as an alternative store-card balance | P1 | Two rule sets on a store card, per common.md |
| Reward issue + redemption | Reward granted at target, redeemed by staff | P1 | Ledger events issue/redeem |
| Pass void / card status | Mark a customer's pass void or expired | P1 | Loopy shows card status in the customer list |
| Pass update push after each ledger event | Pass fields refresh after earn/redeem | P1 | NFR: pass is a projection of the ledger |
| Customer list per program | Table of enrolled customers with balances | P1 | |
| Customer profile / history drill-down | Per-customer ledger history | P1 | Loopy route-only/UNVERIFIED; we make it real |
| Account-level dashboard totals | Rollup KPIs + acquisition trend | P1 (basic) | MVP analytics = the four KPIs + enrollment trend |
| Campaign insights / ROI (revenue vs reward cost) | Operator-entered stamp value × counts vs reward cost | P5 | Requires operator financial inputs; not needed to run a program |
| Analytics time grouping (day/month/year) | Group trend charts | P1 (day/month), P5 (year) | |
| CSV export (customers, transactions) | Data portability | P5 | Loopy gates to Ultimate; also see NFR data export |
| Push messages to all customers or a segment | Compose and send a push to pass holders | P5 (push campaigns) | P1 pass updates are automatic, not marketing pushes |
| Push message history | Sent-message log with reach | P5 | |
| Subusers/staff with location scope | Staff accounts, attribution, plan-limited | P1 | Core to multi-location requirement |
| Stamper mobile app | Dedicated staff scanning app | P6 (public API first), P7 | MVP staff flow runs in the dashboard on a phone browser |
| Account locations + maps picker | Global location records reused per program | P1 | |
| Beacons (UUID/major/minor) | Bluetooth proximity lock-screen triggers | P4 | Designed in from P1 (location model), built in P4 |
| NFC / Smart Tap (Apple) + Google Smart Tap | Tap-to-interact at the counter | P4 | |
| Zapier integrations (Mailchimp, Sheets) | No-code integrations | P6 | Blocked on the public API |
| Developer API + key/secret | POS/CRM integration | P6 | |
| Subscription plans + Stripe checkout + invoices | Plan tiers, prices, billing | P8 (last) | We invoice manually until then |
| Plan-driven limits (designs/locations/staff) | Feature gating by tier | P8 | Before P8 we set limits per tenant ourselves |
| Email verification, password reset, delete account | Account lifecycle | P1 (reset/delete), no email verification gate | Loopy's verification gate blocked activation — don't copy it |
| Templates gallery on first-run | Start from a vertical template | P5 | Nice onboarding accelerator, not needed day one |
| Multi Reward card type | Multiple rewards per program | P5 | MVP: one program, one active reward; tiers come P5 |
| Custom card-field labels | Rename default pass strings | P5 | i18n/Arabic default labels ship in P1 instead |

### 1.2 Apple Wallet pass styles (all five in scope — none out of scope)

Confirmed against Apple's documentation:
- Wallet overview — pass styles: https://developer.apple.com/wallet/ (boarding passes, coupons, event tickets, store cards, generic)
- Pass Design and Creation (style keys `boardingPass`, `coupon`, `eventTicket`, `storeCard`, `generic`; per-style images, field counts, relevance rules): https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html

| Apple style (`pass.json` key) | For | Google Wallet class (closest) | Google evidence |
|---|---|---|---|
| `storeCard` | loyalty/membership, points, stamps, gift card | `loyaltyClass` (loyalty), `giftcardClass` (gift card) | https://developers.google.com/wallet/reference/rest |
| `coupon` | offers, discounts | `offerClass` | same |
| `eventTicket` | concerts, cinema, sports, season tickets | `eventticketclass` | same |
| `boardingPass` | airline, train, bus, transit (has `transitType`) | `flightClass` (air), `transitclass` (ground transit) | same |
| `generic` | membership, claim tickets, anything else | `genericclass` | same |

Google's current class families per the REST reference (https://developers.google.com/wallet/reference/rest): loyalty, offer, gift card, event ticket, flight, transit, generic. Google has **no separate transit-vs-flight gap**: Apple's single `boardingPass` style maps to Google's `flightClass` or `transitclass` by mode. Google has a gift-card class Apple models inside `storeCard`. Neither gap takes a style out of scope: where one platform lacks a class we still issue the pass on the platform that supports it.

### 1.3 Pass capabilities required (Apple docs), including ones Loopy does not have

From https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html and https://developer.apple.com/documentation/walletpasses:

- **Relevant locations** (`locations` with lat/lon, `relevantText`, `maxDistance`): required behavior on every pass style where relevance is used (store card/coupon/generic: small radius; boarding/event: large radius). Loopy has this; we keep it P1.
- **Relevant date** (`relevantDate`): event tickets and boarding passes should carry it so the pass appears on the right day. P2/P3.
- **Beacons** (`beacons` major/minor/UUID proximity triggers): P4, designed in from P1.
- **Barcodes**: QR, PDF417, Aztec, Code 128 (Apple: https://developer.apple.com/documentation/walletpasses; Google supports QR/PDF417/Aztec/Code 128 via `barcode` on every class). P1, style-configurable.
- **Update push** (APNs pass update + Google Wallet object patch): P1 after every ledger event.
- **Per-style field layouts**: up to 3 header + 1 primary + 4 secondary + 4 auxiliary fields (boarding: 2 primary + 5 auxiliary) — our pass renderer must respect style-specific layouts so P2/P3 add fields, not a pipeline.
- **Web service / pass web service URLs** (pass registration, device-specific): needed for update pushes. P1 (design), P5 (full web-service API for campaigns).
- **Strip, background, thumbnail, footer images per style**: P1 store-card strip + icon + logo; P2 adds event-ticket background/thumbnail.
- **Balance display on store card** ("when an account carries a balance, show the current balance on the pass") — stamps and points render as the pass balance. P1.
- **NFC (Smart Tap)**: Apple passes can carry NFC payloads for terminal handoff; Google Smart Tap similar. P4.

## 2. Multi-tenant and multi-location requirements

Evidence base: Loopy is single-tenant per account (locations/beacons/subusers are account-level). Our product is multi-tenant; everything below is our design unless marked Loopy-evidence.

**Per tenant:** identity and business record (business name, legal name, contacts, default currency KWD or another GCC currency, default time zone Asia/Kuwait), owner and staff users, programs (pass style, design, rules, reward), global customer list, global location registry, enrollment link/QR set, settings, audit log, analytics rollups. `tenant_id` on every tenant-owned row (common.md stack rules).

**Per location:** name, address (display + map coordinates), time zone (defaults to tenant default), phone, opening hours (Loopy has no hours feature — we add P1, evidence: not present), attached programs, scoped staff, ledger events carry `location_id` for attribution and per-location analytics.

**Per program (campaign):** pass style, design assets, rules (stamps/points/offer terms), reward, expiry, enrollment fields, consent text, terms, relevant locations (subset of tenant registry + per-program lock-screen message), share URL/QR, status (draft/live/paused), style-specific fields.

- Programs are tenant-owned and may span multiple locations; enrollment links are per program, not per location.
- Locations are tenant-global records; a program selects which apply. (Loopy evidence: settings locations feed the editor picker — FINAL_REPORT §4.)
- Card design and rules are per program; the same business can run a stamp program at one location and a coupon at another.

**Staff across locations:** a staff member can be assigned one, several, or all of the tenant's locations. A staff user working two locations selects (or scans to determine) the acting location per ledger event; every earn/redeem event records both `staff_user_id` and `location_id`. A staff member limited to one location never sees another location's customers, programs, or events.

**Customers across locations:** customers belong to the tenant (not the location) and can enroll in any of the tenant's programs at any location; one customer can hold passes in multiple programs. Balances are per pass (per customer×program), so a stamp earned at branch A counts in the same program at branch B. Staff at a restricted location see a customer only through the actions that concern that location's programs (scan → stamp/redeem), never the full tenant customer list.

**Owner vs location manager visibility:** the tenant owner sees everything (all locations, all programs, all customers, settings, billing terms, analytics). A location manager sees their locations' programs, their events, and their locations' per-event analytics; they can manage staff within their scope but cannot delete programs or change tenant settings. A location-scoped role never receives a client-side filter only — scope is derived server-side from the authenticated user (common.md: never trust a client-sent tenant/location id).

## 3. Roles and permissions matrix

Roles: **Platform admin** (us), **Tenant owner**, **Location manager**, **Staff** — staff actions depend on pass style: *stamper* (store-card earn), *redeemer* (redeem/void), *check-in staff* (event ticket / boarding pass scan). Customers are not dashboard users (no login ever).

| Capability | Platform admin | Tenant owner | Location manager | Staff (scoped) |
|---|---|---|---|---|
| Create tenant + owner + first location | ✔ | – | – | – |
| Suspend/delete a tenant | ✔ | – | – | – |
| Set tenant plan/limits (pre-P8, manual) | ✔ | – | – | – |
| Manage own tenant profile/settings | – | ✔ | – | – |
| Create/edit/deactivate locations | – | ✔ | ✔ (own scope) | – |
| Create/edit programs (any style) | – | ✔ | ✔ (own scope) | – |
| Activate/pause a program | – | ✔ | ✔ (own scope) | – |
| Pass design + publish | – | ✔ | ✔ (own scope) | – |
| Create staff accounts, set scope | – | ✔ | ✔ (within own scope) | – |
| Earn (stamp/points/issue) | – | ✔ | ✔ | ✔ per acting location |
| Redeem reward / void pass | – | ✔ | ✔ | ✔ per acting location |
| Check in / validate ticket (P2/P3) | – | ✔ | ✔ | ✔ |
| View customer list | – | all | own-scope customers via flow; list if granted | minimal: scan result only |
| View customer history | – | ✔ | own-scope | – (only what the flow shows) |
| View analytics | – | all | own locations | own performance via receipt (P5) |
| Push messages (P5) | – | ✔ | ✔ (own scope) | – |
| Billing/plan (P8) | – | ✔ | – | – |
| Export data | – | ✔ | own scope | – |

Counter requirement: a stamper's flow is scan/type card id → see pass state + program context → confirm earn/redeem → receipt. That is the entire screen. They must not browse other locations' customers, other programs' lists, or tenant settings.

## 4. MVP user stories with acceptance criteria

Grouped by module. Format: **US-x** story → acceptance criteria.

### 4.1 Platform admin (P1)

- **US-PA1** Provision a tenant: As a platform admin, I create a tenant, its owner, and its first location in one screen so a new business can start.
  - Given business details (§6), tenant + owner + location exist after one submit; owner can log in; audit log records creator and time; nothing is exposed cross-tenant (isolation test passes).
- **US-PA2** Suspend/reactivate a tenant: suspending blocks all staff logins and pass updates; existing passes show last state; reactivation restores both.

### 4.2 Locations and setup (P1)

- **US-L1** Add a location: name, address, coordinates (map picker or manual), time zone (default Asia/Kuwait), phone, opening hours. Acceptance: location appears in tenant registry; usable in programs; hours render on enrollment page and (where the platform allows) pass details.
- **US-L2** Edit/deactivate a location; deactivation removes it from new program assignment without breaking historical events (events keep their location snapshot).

### 4.3 Staff (P1)

- **US-S1** Create a staff user with role + location scope. Acceptance: staff logs in and lands on the counter flow; cannot navigate outside scope (server-enforced); attribution records `staff_user_id` on every event.
- **US-S2** Counter earn: scan or type a card id → the pass state and program context show → confirm → balance updates and pass pushes. ≤3 taps, idempotent under double-tap (same event not counted twice).
- **US-S3** Redeem: scan → confirm redeem → reward marked redeemed, ledger row, pass updated.
- **US-S4** Void a pass with reason; pass shows void state; ledger row; undo is a new event, not an edit.

### 4.4 Programs (P1: store card stamps, store card points, coupon, generic)

- **US-P1** Create a program with pass style storeCard (stamps): set stamps-to-target (integer ≥1), design assets, colors, logo/icon, strip image, reward copy with `{#}`-style counter, expiry, useful links, terms + issuer details. Acceptance: live pass preview renders for both Apple and Google; validation blocks missing Apple-required fields.
- **US-P2** Same for store-card points balance (integer), coupon (issue + void, terms, validity), and generic (issue + void). Acceptance: each renders its style-correct layout on both wallets; coupon has no stamp balance (invariant: enforced by schema).
- **US-P3** Assign relevant locations + per-program lock-screen message. Acceptance: pass carries locations; iPhone shows the pass on the lock screen near the location (verified on sandbox pass); relevantText localizable EN/AR.
- **US-P4** Activate a program (draft→live): acceptance criteria: owner confirmation, enrollment link+QR live, campaign editable after, changes push to existing passes.
- **US-P5** Enrollment fields + consent: choose fields (text/number/date/email/URL/mobile), mandatory flags, default phone country (Kuwait +965 default), consent text. Acceptance: form renders LTR+RTL, mobile field has country selector.

### 4.5 Customer enrollment (P1)

- **US-C1** Enroll via link/QR: form → save to Apple Wallet **and** Google Wallet buttons → pass issued. Acceptance: enrollment event in ledger; customer appears in list; pass on device shows correct style, balance, locations, EN/AR labels.
- **US-C2** Arabic enrollment: full RTL layout, Arabic labels where the wallet allows localized strings; submission identical to LTR (same fields).
- **US-C3** Pass update after each ledger event: worker signs and pushes within seconds; retry on failure; ledger row and pass agree on balance (source of truth check in tests).

### 4.6 Customer list and history (P1)

- **US-CL1** Search the tenant/program customer list (server-side, scoped); open a profile with full ledger history and pass status. Acceptance: location-scoped staff see only what their scope permits.

### 4.7 Basic analytics (P1)

- **US-A1** Dashboard: four KPIs (customers enrolled, earn events, rewards issued, rewards redeemed) + enrollment trend grouped day/month, filterable by program and location. Acceptance: numbers derive from ledger aggregation, not denormalized counters (denormalized caches must reconcile).

### 4.8 Later required phases

- **P2 US-E1** Event ticket: event name/date/venue/seat fields; relevantDate; check-in scan; `eventTicketClass` on Google. **P3 US-B1** Boarding pass: origin/destination/transitType/flight fields; 2 primary + 5 auxiliary layout; `flightClass`/`transitclass`. Both: no new pass pipeline (schema/signer accept them from P1 — acceptance: signing a draft eventTicket pass works in P1 tests).
- **P4 US-BN1** Beacons: register UUID/major/minor; attach to program; lock-screen trigger. **US-BN2** NFC/Smart Tap handoff.
- **P5 US-M1** Push campaigns (audience selector, history); **US-AU1** automations; **US-R1** referrals; **US-T1** tiers/multi-reward.
- **P6 US-API1** Public REST API with key/secret; **US-Z1** Zapier. **P7 US-WL1** white-label.
- **P8 US-SU1** (last) Public signup: business creates its own tenant through a marketing site + verification; **US-BI1** subscription checkout and invoicing in-app. Acceptance: everything before P8 works unchanged for admin-provisioned tenants.

## 5. Non-functional requirements

- **Tenant isolation**: server-derived tenant/location scope on every request; test suite proves cross-tenant reads/writes fail (404, not 403-with-data). DB constraints back idempotency and balance rules (common.md).
- **Append-only ledger**: earn/redeem/issue/void/enroll are immutable rows; balances are aggregates of ledger rows; no direct balance edits; corrections are new compensating rows. Balance CHECK ≥ 0 (integers).
- **Idempotency**: every staff ledger action carries a client-generated idempotency key; double-tap produces one row (unique constraint).
- **Pass updates**: commit → enqueue (Celery) → sign & push to both wallets; failure retries with backoff; pass and ledger reconcile eventually (monitor).
- **Audit trail**: who/what/when for provisioning, permission changes, program activation, voids, exports.
- **Performance**: counter earn ≤ 2s end-to-end API latency p95 under load at a busy counter; pass update within 30s p95; dashboard queries ≤ 2s p95.
- **Availability**: function isolation — pass-signing/worker failure never blocks ledger writes (ledger is synchronous; pushes are async).
- **i18n/RTL**: EN + AR with RTL from day one, including enrollment and pass-localizable strings.
- **Time zones**: per-location tz (default Asia/Kuwait); ledger rows store UTC + render in location tz.
- **Money**: KWD 3-decimal precision (or the tenant's GCC currency) wherever a value is money (reward cost, ROI in P5); integers for stamps/points.
- **Data export**: CSV/JSON export of customers and ledger per tenant/program (P5 UI, admin-assisted in P1).
- **Privacy**: customer contact data (email/mobile) is tenant-scoped, minimal collection per program config, consent recorded at enrollment, deletion/anonymization supported at tenant request; wallet certs and secrets in secret storage, never in repo.
- **Accessibility**: WCAG 2.2 AA on both dashboard surfaces.

## 6. Account opening (we create the account; no public signup)

A business contacts us; platform admin provisions (US-PA1). Data we need from the business, collected in one intake form (uploaded or via our call):

1. Business legal + trade name, country (Kuwait/GCC), preferred language(s) (EN/AR).
2. Owner contact: name, email, mobile (login); optional secondary contact.
3. Locations: name, address, coordinates if known, phone, opening hours, time zone if not Asia/Kuwait, currency if not KWD.
4. Staff: names, emails/mobiles, role and location scope per person.
5. Program intent: pass style(s), stamp/points rules or coupon terms, reward copy, expiry policy.
6. Brand assets: logo/icon images per style guidelines.
7. Existing customers: optional CSV (name, phone/email, balance) — imported as enrollment events marked `imported`.
8. Terms and issuer contact details for the pass.

Format: structured YAML/JSON intake file or a guided admin form; validation marks missing Apple-required fields before activation. No invented business names or data in the MVP flow beyond the intake.

## Proposed decisions

### PD-req-1: Sign passes ourselves, no pass vendor
- Context: MVP must issue both Apple and Google passes with update pushes; vendors (PassKit etc.) add per-pass cost and lock-in.
- Options: (a) self-signing (Apple WWDR + pass type certificate; Google service account), (b) third-party pass provider.
- Proposal: (a) self-signing; certificates and service-account keys in secret storage; Celery worker owns signing/push.
- Consequences: backend owns cert rotation ops; no vendor dependency in ledger→pass path; common.md stack constraints satisfied.

### PD-req-2: One program model with style-specific field sets
- Context: five Apple styles + seven Google classes must not fork the schema.
- Options: (a) single Program with `pass_style` enum + style-specific JSON/typed blocks, (b) five program types.
- Proposal: (a) one Program table; `pass_style` in {store_card, coupon, event_ticket, boarding_pass, generic}; style blocks validated per style. Ledger action types per style: store card earn/redeem; coupon/generic issue/void; event/boarding check-in.
- Consequences: P2/P3 add columns/screens only; schema constraint: a coupon program cannot have a stamp balance (validation, not convention).

### PD-req-3: Customers are tenant-global, passes are customer×program
- Context: multi-location sharing (§2).
- Options: (a) customer per tenant with per-program passes, (b) customer per location/per program.
- Proposal: (a). Ledger rows reference (pass, location, staff) so balances aggregate per pass.
- Consequences: cross-location programs work naturally; export and privacy flows operate per tenant.

### PD-req-4: Release placement
- Context: brief's mandated phases.
- Options covered in §0/§1.1; notable calls: beacons and NFC in P4 together (same proximity model); Zapier after the public API (P6); templates, multi-reward, tiers, label overrides, ROI analytics and CSV export in P5; signup+billing last (P8) per common.md. Insights/ROI needs operator financial inputs — kept out of MVP (Loopy evidence shows it is operator-entered values × counts, not POS integration).
- Consequences: MVP analytics are ledger aggregations only; no payment integration until P8.

### PD-req-5: No email-verification gate on activation
- Context: Loopy's unverified email blocked activation entirely (FINAL_REPORT §6).
- Options: (a) owner confirmation modal only, (b) verification gate.
- Proposal: (a) activation needs an explicit owner confirm, not an email-verification state.
- Consequences: simpler lifecycle; password reset still uses email.

### PD-req-6: NFC, beacons, and web-service push share one "pass channel" design
- Context: brief requires beacons/NFC designed-in so later phases attach without a new product.
- Options: (a) pass channel abstraction per program now, (b) retrofit.
- Proposal: (a) program config reserves location/beacon/NFC fields from P1 (nullable); P4 fills them.
- Consequences: no schema migration for P4; renderer ignores empty channels.