# Product requirements and scope

Author: cartographer (requirements brief). Date: 2026-10-17.
Inputs (read-only): FINAL_REPORT.md, TECHNICAL_REPORT.md, technical/*.md — evidence on how a stamp-card loyalty SaaS behaves. Clean-room design: no Loopy Loyalty UI, text, branding, or API shapes are copied; the domain model below is our own.

External citations used for wallet capabilities:
- Apple pass styles (storeCard, coupon, eventTicket, boardingPass, generic), images per style, semantic tags, pass updates: https://developer.apple.com/documentation/walletpasses and https://developer.apple.com/wallet/
- Apple relevance (relevant locations, relevant date, per-style relevance rules, barcodes, beacons): https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html
- Google Wallet classes (eventTicketClass, flightClass, genericClass, giftCardClass, loyaltyClass, offerClass, transitClass) and the class/object model: https://developers.google.com/wallet/reference/rest and https://developers.google.com/wallet/retail/loyalty-cards/overview/how-classes-objects-work

## 1. Module catalogue and release placement

Every module/feature observed in the evidence, mapped to our release plan. Releases: MVP, P1 = event ticket, P2 = boarding pass, P3 = beacons, P4 = push campaigns, P5 = automations/referrals/tiers, P6 = public API portal + named connectors, P7 = white-label, P8 = self-serve signup + subscription billing. ("Later required phase" = P1–P7 as ordered in the brief.)

| Feature (evidence) | Description | Release | Justification if non-obvious |
|---|---|---|---|
| Tenant/account management | Platform admin creates tenant, owner, first location; profile and business details | MVP | Account exists only via provisioning until P8 |
| Locations (global list + per-program attachment) | Named places with coordinates, address, lock-screen relevance | MVP | Required by brief: relevant locations on any pass |
| Location relevance on passes | Pass carries relevant locations so the phone shows it near the store | MVP | Required, not optional; all Apple styles support relevant locations (cite above) |
| Beacons | iBeacon proximity triggers on passes | P3 (beacons phase) | Brief places beacons in a required later phase; schema attaches to a pass without a new product |
| Programs (campaigns) with pass style | One program model with a `pass_style` + style-specific fields | MVP | Stamp count and points are rule sets on a store card, not the schema shape |
| Pass design editor | Colors, logo, icon, strip/thumbnail/footer images per style, live preview | MVP | Design is shared pass functionality |
| Stamp rules (store card) | Target count 1–30, earn rule text, stamp imagery | MVP | MVP store card includes stamps and points |
| Points rules (store card) | Points balance, earn-per-visit or per-spend, redemption rules | MVP | Two rule sets on the same store-card style |
| Coupon program | Issue-and-void ledger, offer copy, expiry | MVP | |
| Generic pass program | Membership/ID-type pass, no loyalty ledger beyond issue/void | MVP | |
| Event ticket program | Event name, venue, date, seat; relevant date | P1 | Required later phase; schema and signer accept it from MVP |
| Boarding pass program | Transit/flight fields, origin/destination | P2 | Required later phase |
| Enrollment link + QR (per program) | Public enrollment page, save to Apple Wallet and Google Wallet | MVP | |
| Enrollment data fields config | Which fields to collect, mandatory, consent text | MVP | Consent is a privacy requirement, in from day one |
| Barcode on pass | QR/PDF417/Aztec per platform support | MVP | |
| Relevant date on pass | Time-based relevance (event, expiry) | MVP (schema), P1 (first used by tickets) | Apple: relevantDate optional for generic/eventTicket/boardingPass |
| Pass update push | After every ledger event, pass reflects the ledger | MVP | Ledger is source of truth; pass is a projection |
| Void / pass invalidation | Mark a pass voided (used coupon, refunded, revoked) | MVP | Shared pass feature per brief |
| Staff accounts (subusers) | Staff belong to tenant, scoped to locations, attribution on ledger events | MVP | Needed to stamp/redeem at the counter |
| Counter tool: earn/redeem/check-in | Scan or type a pass code, apply the action that fits the style | MVP | Generalized version of Loopy's stamp page; fits every style |
| Customer list & profile | Per-tenant customer list, per-customer history, contact fields | MVP | |
| Customer status (pass state) | issued / void / expired states surfaced in list | MVP | |
| Ledger (append-only events) | Earn, redeem, issue, void, enroll events; idempotent | MVP | Source of truth |
| Basic analytics | Enrollments, earns, redemptions, active passes; acquisition trend | MVP | |
| Revenue vs reward cost (ROI) | Operator-entered stamp value/reward cost against event counts | MVP (basic) or P4 | Placed in MVP as tenant-wide KWD values, one screen |
| Data export (CSV) | Customer and ledger export | MVP (basic CSV) | Loopy gated it to top plan; we make it standard because GCC businesses will demand data portability |
| Tenant API (HTTP) + signed webhooks | Enroll, earn, redeem, void, read balance; per-tenant credential; idempotency keys | MVP | The integration seam is MVP per brief |
| API credentials management | Issue/rotate per-tenant key pair | MVP | |
| Developer portal, API docs site | Polished self-serve docs | P6 | Explicitly later per brief |
| Named POS connectors | Connector for a specific POS a real business uses | P6 | Explicitly later |
| Push messages (broadcast/segment) | Wallet push message to pass holders | P4 | |
| Automations | Event-triggered workflows | P5 | |
| Referrals | Customer referral programs | P5 | |
| Tiers | Loyalty tiers above points | P5 | |
| White-label | Custom branding for tenant-facing surfaces | P7 | |
| Plan limits / billing | Plans, subscription checkout, invoices | P8 | Last phase only; until then we invoice outside the product |
| Public signup / self-serve trial | Anonymous visitor creates a tenant | P8 | Explicitly last |
| Templates gallery | Pre-made program templates by vertical | P5 (nice-to-have) | Loopy evidence shows value, but not MVP-blocking |
| NFC on passes | Contactless redemption | P3+ (after beacons) | Apple requires explicit approval for NFC; keep as a designed seam |
| Multi-program support | A tenant runs several programs concurrently | MVP | Trivial once programs are a table; Loopy's plan-gated card counts are not our model |
| Arabic/RTL everywhere | Dashboard, enrollment page, pass strings where the wallet allows | MVP | Market requirement |

Placement decisions that need saying out loud:
- Loopy's plan-limit gating (1/3/10 cards, 3/10/50 staff) is out of scope for our MVP because there are no plans until P8. We impose no per-tenant feature counts before then; commercial limits arrive with billing.
- Loopy's Zapier gallery and marketing/consent toggles: Zapier-style third-party automation is P5/P6 (our tenant API + webhooks is the MVP seam); marketing consent capture at enrollment is MVP (privacy).
- Loopy's Insights economics (operator types a stamp value and reward cost) is kept, simplified: currency is KWD with 3 decimals by default, and reward cost lives on the reward definition.

### Apple Wallet pass styles and pass capabilities (all five in scope)

Confirmed against https://developer.apple.com/documentation/walletpasses (overview lists boarding passes, event tickets, store cards, coupons, generic passes) and the PassKit Programming Guide relevance table (archive URL above). None of the five is out of scope.

| Apple style | JSON key | Suited for | Supported images | Relevant date | Relevant locations |
|---|---|---|---|---|---|
| Store card | `storeCard` | loyalty, membership, points, stamps, gift card | logo, icon, strip | not supported | required if relevance given, small radius |
| Coupon | `coupon` | discounts, special offers | logo, icon, strip | not supported | required if relevance given, small radius |
| Event ticket | `eventTicket` | entry to events; season tickets; poster layout | logo, icon, strip OR background+thumbnail | recommended | optional, large radius |
| Boarding pass | `boardingPass` | flights, trains, ferries; semantic tags, live flight updates | logo, icon, footer | recommended | optional, large radius |
| Generic | `generic` | membership cards, IDs, anything else; poster layout | logo, icon, thumbnail | optional | required if relevance given, small radius |

Cross-style pass features from Apple's docs that our design must carry (Loopy has some, not all):
- `barcodes` array (QR, PDF417, Aztec, Code128) with fallback formats; barcode optional.
- `locations` (up to 10 relevant locations) with `relevantText` — lock-screen display near a place.
- `relevantDate` and `expirationDate` — time-based relevance and expiry.
- `beacons` — proximity triggers (our P3).
- `nfc` — requires Apple approval (later seam).
- Semantic tags (venue, flight, event, seats) for richer Wallet UI on tickets and boarding passes (P1/P2 fields).
- Pass updates via the web service: every ledger event pushes a regenerated pass; APNs registration and push tokens managed by the worker.
- `sharingProhibited`, `authenticationRequired` — pass-level flags we expose for gift-card-style programs.
- Localization: `localized` strings — our Arabic pass strings ride this where the wallet supports it.

### Google Wallet classes (all seven in scope)

Confirmed against https://developers.google.com/wallet/reference/rest (class list: eventTicketClass, flightClass, genericClass, giftCardClass, loyaltyClass, offerClass, transitClass) and the classes/objects overview (second Google cite). Class+Object model: our program maps to a Google class (template) and each customer pass to an object.

| Google class | Closest Apple style | Notes |
|---|---|---|
| loyaltyClass | storeCard (loyalty/points/stamps) | loyalty points/labels map well |
| offerClass | coupon | offers map to coupon |
| giftCardClass | storeCard (gift card variant) | Google has a dedicated class; Apple folds gift cards into storeCard |
| eventTicketClass | eventTicket | direct equivalent |
| flightClass | boardingPass (flight) | flight-specific; use transitClass for non-air |
| transitClass | boardingPass (non-air transit) | closest Apple mapping is boardingPass; no separate Apple transit style |
| genericClass | generic | direct equivalent |

Asymmetries: Apple has no transit style (boardingPass covers it); Google has no coupon-vs-generic split for IDs (genericClass covers). Rule: where one side lacks an equivalent, we still issue on the side that supports it — the program defines one canonical Apple style, and the Google class is derived; issuance is independent per platform.

## 2. Multi-tenant and multi-location requirements

Tenant = business. Model: `tenant`, `location`, `staff_member`, `program`, `customer`, `pass`, `ledger_event`. Every tenant-owned row carries `tenant_id`; a tenant-scoped manager on every model.

Per tenant vs per location:

| Concern | Scope | Notes |
|---|---|---|
| Programs (definitions, rules, rewards) | Tenant | A program is defined by the tenant; programs optionally reference specific locations (valid-at list) |
| Pass design | Program-level (tenant-owned) | Design lives on the program, not the location |
| Rewards | Program-level | |
| Staff accounts | Tenant, assigned to ≥1 location | A staff member with two locations works at both; the counter tool and analytics honor a location filter per staff scope |
| Opening hours | Location, P4+ | Evidence for hours is thin (Loopy has none); defer |
| Enrollment links/QR | Program-level | Each program gets a stable public enrollment URL + QR; QR may carry a location tag for attribution (location-specific QR is a per-link parameter) |
| Relevant locations on a pass | Program-level attachment of tenant locations | Any pass style; max 10 per Apple |
| Settings (currency, timezone defaults, language) | Tenant | Currency KWD default, may be another GCC currency; timezone default Asia/Kuwait, per-location override |
| Contact/issuer details | Tenant | Required by Apple (organizationName, issuer contact on the pass) |
| API credentials | Tenant | One credential per tenant; requests scope to the tenant and may pin a location |

Staff working at two locations: the staff member's scope is the union of their assigned locations. The counter tool asks nothing extra — the earn/redeem event records the location the staff member selects (defaulting to their single location if they have exactly one) and that choice is constrained to their scope. Ledger events always carry `location_id` and `staff_member_id`.

Customers are shared tenant-wide: a customer belongs to the tenant, not a location or program. One customer can hold passes in several programs. Enrollment at any location yields the same customer record (dedupe on the tenant's configured unique fields, e.g. phone or email). Location-scoped roles (location manager, staff) see only customers with events at their locations — via a location-filtered query over ledger events, never by re-owning the customer row.

Tenant owner vs location manager:
- Tenant owner sees everything: all programs, all locations, all staff, all customers, settings, API credentials, analytics tenant-wide and per-location.
- Location manager sees their locations' programs' performance, customers with events at their locations, staff at their locations, and can run the counter tool. Cannot edit program definitions, rewards, or tenant settings.
- Customer enrollment data (contact fields) is visible to location-scoped roles only where an earn/redeem flow needs it (pass code, name, balance). Full contact details are owner/manager-visible; staff see only what the counter flow needs.

## 3. Roles and permissions matrix

Roles: platform admin (us), tenant owner, location manager, staff (earn/redeem/check-in depending on style). Customers are never dashboard users.

| Capability | Platform admin | Tenant owner | Location manager | Staff |
|---|---|---|---|---|
| Create tenant / owner / first location | Yes (only role) | No | No | No |
| Suspend or delete a tenant | Yes | No (may request) | No | No |
| Manage tenant settings (currency, language, issuer details) | Yes | Yes | No | No |
| Create/edit/deactivate locations | Yes | Yes | Yes (own locations only) | No |
| Manage staff accounts | Yes | Yes (all) | Yes (own locations only) | No |
| Create/edit programs (style, design, rules, rewards) | Yes | Yes | No | No |
| Publish/activate a program | Yes | Yes | No | No |
| Attach relevant locations to a program | Yes | Yes | No | No |
| Manage enrollment fields and consent text | Yes | Yes | No | No |
| Issue/rotate API credentials | Yes | Yes | No | No |
| Run counter tool (earn/redeem/check-in) | Yes | Yes | Yes (own locations) | Yes (own locations, style-appropriate action only) |
| Void a pass | Yes | Yes | Yes (own locations) | No (staff void requests owner/manager confirmation; exception: coupon one-time-use void at redemption) |
| View customer list | Yes | Yes (all) | Yes (own locations only) | Search-by-code only (no browsing) |
| View full customer contact data | Yes | Yes | Yes (own locations) | No — only name and code needed by the flow |
| View analytics | Yes (all tenants) | Yes (tenant-wide + per-location) | Yes (own locations) | No |
| Export data (CSV) | Yes | Yes | Yes (own locations) | No |
| Send push messages (P4+) | Yes | Yes | No | No |
| Manage billing (P8) | Yes | Yes | No | No |

Location scoping rules: every capability above resolves against the authenticated user's location set; the server derives tenant and location scope from the session, never from a client-sent tenant or location id. Staff at the counter never browse other locations' customers: the counter flow is keyed by pass code (scan/type), and a lookup of a code outside the staff scope returns "not found."

## 4. MVP user stories with acceptance criteria

Format: US-<area>-<n>. "Location" always means a location within the acting user's scope.

### Provisioning (platform admin)
- US-PA-1: Create a tenant. Given I am a platform admin, when I fill business name, owner name, owner email, and first location details, then the system creates the tenant, an owner account with a one-time credential setup link, and the first location, and the owner appears in the tenant's staff list as owner. AC: no public path to this screen; all three records created atomically; audit entry written.
- US-PA-2: Suspend a tenant. When I suspend a tenant, all their passes show as void to wallet holders within the push window and no API calls with their credential succeed. AC: suspension reversible.

### Locations
- US-LOC-1: Add a location. Owner or location manager adds name, address, coordinates (map picker), display address, lock-screen relevance text. AC: location appears in pickers; relevant text ≤ Apple's display budget.
- US-LOC-2: Attach locations to a program. When the owner attaches locations to a program, issued passes carry them as relevant locations. AC: max 10 per pass enforced; removing a location detaches on next pass update.

### Staff
- US-STF-1: Create a staff member. Owner/manager creates staff with name, login, PIN/password, assigned locations, role staff. AC: staff cannot log in until credentials set; scope enforced server-side.
- US-STF-2: Staff attribution. Every counter action records staff_member_id and location_id on the ledger event. AC: transaction views show the actor.

### Programs (store card stamps, store card points, coupon, generic)
- US-PRG-1: Create a store-card program with stamp rules. Owner picks store card style, design (colors, logo/icon/strip), stamp target (1–30), earn rule text, reward name/description, per-reward lock-screen messages. AC: live pass preview renders both Apple and Google variants.
- US-PRG-2: Create a store-card program with points rules. Owner defines points-per-earn and points cost of rewards. AC: points and stamps are two rule sets on one program — choosing points shows a balance field on the pass, choosing stamps shows a stamp counter; both may coexist.
- US-PRG-3: Create a coupon program. Owner defines offer copy, expiry (fixed date or period after issue), barcode, single-use flag. AC: coupon programs have no stamp/points ledger; issue and void only.
- US-PRG-4: Create a generic program. Owner defines free-text fields and design. AC: issue and void only.
- US-PRG-5: Publish a program. Owner activates; the enrollment URL/QR goes live. AC: draft programs are not enrollable; activation is logged.

### Pass issuance and enrollment
- US-ENR-1: Enrollment by link. Customer opens the public enrollment page, fills configured fields, consents, and saves to Apple Wallet or Google Wallet. AC: works in Arabic and English, RTL correct; page is tenant-branded; pass lands in the chosen wallet with correct style, design, barcode, relevant locations.
- US-ENR-2: Enrollment by QR. Same flow reached from a printed/displayed QR. AC: QR may carry a location tag; the enrollment event records it.
- US-ENR-3: Duplicate handling. A returning customer enrolling in the same program re-adds the existing pass rather than duplicating. AC: dedupe on tenant-configured unique field(s).

### Ledger and counter actions
- US-LGR-1: Earn (stamp/points). Staff scans/types the pass code at the counter and earns. AC: ledger event appended with idempotency key (client-generated UUID per intent); a double tap does not double-credit; pass updates within seconds; balance = SUM(ledger), never an edited number.
- US-LGR-2: Redeem. Staff redeems a reward/balance/coupon at the counter. AC: redeem cannot exceed balance (DB constraint); event recorded with staff, location, amount; pass updates.
- US-LGR-3: Issue (coupon/generic/ticket). Owner/staff issues a pass to a customer identified by code or contact. AC: pass issued event recorded.
- US-LGR-4: Void. Manager voids a pass with a reason. AC: pass shows void; ledger event recorded; no prior events altered.
- US-LGR-5: Reward auto-issue on threshold (stamps). When the stamp counter reaches the target, a reward is issued automatically. AC: at exactly the target; next earn starts a new cycle; messages configured on the reward show on the pass.

### Customers and history
- US-CUS-1: Customer list. Owner/manager sees customers with signup date, status, balances per program. AC: search by name/code/phone; location-scoped users see only customers with events at their locations.
- US-CUS-2: Customer history. Opening a customer shows their ledger across programs. AC: complete, append-only, newest first, exportable.

### Analytics
- US-ANA-1: Tenant dashboard. KPIs: enrolled, active passes, earns, redemptions, voids, acquisition trend (day/month/year). AC: tenant-wide with per-location and per-program filters — the gap Loopy never closed (no location/staff filters anywhere).
- US-ANA-2: Program overview. Per-program KPIs and a transaction table (time, customer, event, staff, location). AC: server-side search/pagination; filter by location and staff.
- US-ANA-3: Reward cost view. Reward cost and earn value in KWD (3dp) against event counts. AC: tenant currency; zero values persist (unlike Loopy, which drops them server-side).

### Non-MVP phases (stories to place, not build now)
- P1 event ticket: owner creates an event-ticket program (event name, venue, date, seat optional; relevant date auto-set); staff check in by scanning; void on entry refusal; semantic tags sent where supported. AC: no new pass pipeline — same program/pass/ledger tables, style-specific fields only.
- P2 boarding pass: owner creates a boarding-pass program (origin/destination, carrier, departure; semantic tags; Apple's transit grouping); check in/void as with tickets. AC: signer path identical to MVP styles.
- P8 self-serve: public signup creates a tenant and owner; subscription billing with plan limits activated. AC: the provisioning API used by platform admin is the same one signup calls.

## 5. Non-functional requirements

- Tenant isolation: `tenant_id` on every tenant-owned row; tenant-scoped Django manager + object permissions; server derives tenant from the authenticated user, never from the request body. DB constraints for: idempotency uniqueness (unique `idempotency_key` per tenant+endpoint scope), non-negative balances (check constraints / generated columns), FK integrity.
- Append-only ledger: `ledger_event` rows are never updated or deleted; corrections are new reversing events. Balances are derived (SUM) or maintained as constrained generated/cached values that the ORM cannot bypass.
- Idempotency: every ledger write (API or UI) carries a client idempotency key; replays return the original result. A double tap at the counter cannot double-credit.
- Pass updates: a committed ledger event enqueues a Celery task that signs and pushes the Apple pass and updates the Google object; retries with backoff; a failed push never blocks the ledger write; the pass is a projection of the ledger.
- Audit trail: who/what/when for every mutation (provisioning, program edits, credential issuance, staff changes, voids), append-only.
- Performance: an earn at a busy counter must round-trip scan→confirmation in <1.5s p95 (ledger commit is the gate; pass push is async). Analytics endpoints <2s p95 for a 100k-event tenant.
- Availability: function isolation — ledger writes, pass signing/push, analytics, and enrollment are separable failure domains; a wallet-provider outage degrades pass updates, never counter operations.
- Arabic/RTL: dashboard and enrollment fully bilingual (en/ar) with RTL layout from day one; pass strings localized where the wallet supports it (Apple `localized` strings; Google `localized*` fields).
- Time zones: all timestamps stored UTC; display and relevant-date math in the location's timezone (default Asia/Kuwait).
- Money: KWD 3 decimal places as tenant default; other GCC currencies allowed (BHD also 3dp, most others 2 — store as minor-unit integers per currency exponent). Stamp and point balances are integers.
- Data export: CSV export of customers and ledger for the owner (and location managers, scoped), no plan gate.
- Privacy: customer contact data (email, phone) stored per tenant, access-logged; staff role sees only flow-needed fields; deletion request removes the customer's PII while keeping anonymized ledger aggregates; consent captured at enrollment.
- Integration seam: per-tenant HTTP API + signed webhooks (below), idempotent, credential per tenant, so a store with an API can drive the ledger and hear the results without waiting for P6.
- Wallet secrets (Apple signer key/certs, Google service account) live in secret storage, never in the repo.

## 6. Account opening (business contacts us)

Data we need from a business, collected by sales/support and entered by a platform admin on the provisioning screen (or via a fill-in form sent to the business):

| Item | Fields | Format |
|---|---|---|
| Business identity | Business name (trade name), legal name optional, website, contact person | Text; names are their data, we invent nothing |
| Owner | Full name, email, phone (for credential setup and issuer contact) | Email must be deliverable; phone E.164 with +965 default |
| Locations | One or more: name, address, coordinates (optional at intake), display address | List; first location mandatory, more added later by the owner |
| Staff (optional at intake) | Name, phone/email, home location | List; can also be added by the owner later |
| Program intent | Which pass styles they want first (store card stamps/points, coupon, generic), reward examples, stamp/point rules | Free text + structured fields at program setup |
| Existing customers (optional) | Name, phone, email, current balance if migrating | CSV template (columns: name, phone, email, program, balance) — importer is an MVP screen for the owner, not the admin |
| Currency and language | Default KWD / en+ar; timezone default Asia/Kuwait | Defaults with overrides |
| Commercial terms | Plan/price agreed offline | Not in the product until P8 |

MVP platform-admin screen: create tenant → owner (sends credential-setup link) → first location → (optional) seed program skeleton. No public signup exists; nothing in the product lets an anonymous visitor create an account until P8.

## 7. Integrations (MVP seam)

MVP tenant API (tenant-scoped, credential per tenant, idempotency required on writes):
- Enroll a customer (fields + program + optional location tag) → returns customer/pass ids and the enrollment URL.
- Earn (stamps/points) on a pass: pass code or customer id, amount, idempotency key, optional location id (must belong to the credential's tenant).
- Redeem: same shape; server rejects over-redemption.
- Issue (coupon/generic): recipient + program + style-specific fields.
- Void: pass id + reason.
- Read balance / pass status: by pass code or customer.

Signed webhooks (outbound, per-tenant endpoint + secret, HMAC signature, versioned payload): `enrollment.created`, `ledger.earn`, `ledger.redeem`, `pass.issued`, `pass.voided`, `pass.update.failed`. At-least-once delivery with retry/backoff; consumer dedupes on event id.

Credential issuance: owner generates a key pair (client id + secret) in settings; rotation with grace period so a POS keeps working during changeover. Requests authenticate with the credential; the server resolves tenant from the credential, never from the body. Rate limits per tenant.

Explicitly later (P6): a polished developer portal, public API docs site, and named connectors for specific POS/store/booking systems a real business actually uses. A business with no API is fully served by the dashboard for every MVP capability — the API is additive, never required.

## Proposed decisions

### PD-scope-1: One program model with a pass style, not per-style products
- Context: five Apple styles must not become five subsystems; the brief forbids forcing coupons through a stamp ledger.
- Options: (a) one `program` model with `apple_style` + JSONB/style-tables for style-specific fields; (b) separate models per style.
- Proposal: (a). Stamp/points are rule sets on store-card programs only; coupon/generic/ticket/boarding use issue/void or check-in ledgers.
- Consequences: DB: one programs table + style-field tables; backend: one signer parameterized by style; frontend: one program editor with per-style sections; later phases add fields and screens, not a new pipeline.

### PD-scope-2: Balances are derived from the ledger, never independently editable
- Context: Loopy's evidence (stamp counters on cards) tempts a mutable counter; double-credit and drift are the risks.
- Options: (a) SUM on read with constraints; (b) cached balance columns maintained only by ledger code with check constraints.
- Proposal: (b) — cached columns owned by the ledger service, non-negative check constraints, plus a reconciliation job that recomputes from events.
- Consequences: fast counter reads; audit-friendly; ORM cannot bypass (constraint + service-layer ownership).

### PD-scope-3: Relevant locations are MVP and program-level
- Context: brief requires locations on any pass; Apple allows ≤10 per pass.
- Options: per-pass locations vs program-level attachment of tenant locations.
- Proposal: program-level attachment (pass snapshot at issue/update time). AC cap enforced.
- Consequences: pass update pushes refresh location lists; editor needs one location-picker section regardless of style.

### PD-scope-4: No plan limits or billing in the product before P8
- Context: Loopy gates features by plan; we have no plans until self-serve.
- Options: (a) ship internal limit config now; (b) defer all gating to P8.
- Proposal: (b). Feature gating keys may exist in config but default unlimited; commercial terms stay outside the product.
- Consequences: no pricing tables to build until P8; export and multi-program are standard for every tenant.

### PD-scope-5: Data export is standard, not premium
- Context: Loopy gates CSV export to its top plan (confirmed live) — friction we should not copy.
- Options: gate vs standard.
- Proposal: standard for owner (and scoped location managers), from MVP.
- Consequences: export service + scoped queries in MVP; also satisfies the privacy/data-portability requirement.

### PD-scope-6: Sign passes ourselves rather than a pass provider
- Context: MVP must decide. Loopy depends deeply on PassKit (redirects, ids, S3 bucket in evidence) — a clean-room design should not.
- Options: (a) self-sign: hold our own Apple Pass Type ID certificate and Google Wallet issuer account; (b) a pass provider (PassKit-style) as an intermediary.
- Proposal: (a) self-sign. Both platforms have well-documented issuance (cites above); self-signing removes a per-pass third-party dependency and cost, keeps customer data in our stack, and gives direct control of update pushes. Certificates live in secret storage; the signer is a Celery-adjacent module behind an interface so a provider could be swapped in later if certificate ops become a burden.
- Consequences: backend owns cert renewal/ops (Apple cert expiry, Google issuer approval), pass signing pipeline, and push retry logic; no revenue share to an intermediary; the interface seam preserves optionality.

### PD-scope-7: Analytics gets location and staff filters from day one
- Context: Loopy carries `location_name` and `username` on events but exposes no filters anywhere — a confirmed gap.
- Options: parity (no filters) vs filters from MVP.
- Proposal: filters from MVP; events already carry both dimensions.
- Consequences: analytics queries aggregate by location/staff; UI filter components shared across views.

### PD-scope-8: Coupon one-time-use void is a staff action, all other voids need manager+
- Context: counter reality — a redeemed coupon must be voidable at the counter without a manager.
- Options: all voids manager-only vs coupon-redeem void allowed for staff.
- Proposal: staff may void during their own redemption flow (it is the redemption itself); standalone voids require manager or owner.
- Consequences: permissions matrix as in §3; ledger records the void reason and actor.
