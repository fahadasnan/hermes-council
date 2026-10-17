---
name: loyalty-domain-glossary
description: Defines the exact meaning, code naming, English and Arabic labels, and invariants of every domain term in the wallet-pass SaaS (tenant, location, staff_member, program, pass_style, store_card, coupon, event_ticket, boarding_pass, generic_pass, relevant_location, beacon, reward, customer, enrollment, pass, earn event, redeem event, balance). Use when writing models, migrations, APIs, UI copy, or tests that touch loyalty or wallet-pass domain concepts.
---

# Loyalty domain glossary

One meaning, one name, one table. If a concept appears here, use exactly these terms in code, docs, UI, and tests. Never introduce synonyms (e.g. "campaign", "card", "account" for domain entities).

## Terms

- **tenant**: A business that sells to its own customers. Top-level isolation boundary. Table `tenants`, type `Tenant`. En: "Business". Ar: "النشاط التجاري". Every tenant-owned row has `tenant_id`; the server derives it from the authenticated user, never from a request body.
- **location**: A physical place of a tenant (store, branch). Table `locations`, type `Location`. En: "Location". Ar: "الموقع". Has timezone (default Asia/Kuwait) and coordinates.
- **staff member**: A dashboard user belonging to a tenant, assigned to one or more locations. Table `staff_members`, type `StaffMember`. En: "Staff member". Ar: "موظف". Roles: tenant owner, location manager, staff. Customers are never staff.
- **platform admin**: Our operator who provisions tenants. No table naming conflict: role flag on the internal operator user.
- **program**: A tenant's wallet-pass offering: rules + design + a pass style. One table `programs`, type `Program`. En: "Program". Ar: "برنامج". Not "campaign", not "card".
- **pass style**: The Apple Wallet style of a program: `store_card`, `coupon`, `event_ticket`, `boarding_pass`, `generic`. Enum field `programs.apple_style`, TS type `PassStyle`. A program has exactly ONE Apple style; the Google class is derived from it, never chosen independently.
- **store card**: Pass style for loyalty: stamps, points, membership, gift card. En: "Store card". Ar: "بطاقة متجر". Stamp count and points balance are rule sets ON a store card, not separate styles.
- **coupon**: Pass style for discounts/offers. Ledger is issue and void only — a coupon has no stamp or point balance. En: "Coupon". Ar: "قسيمة".
- **event ticket**: Pass style for event entry; later phase. Issue/void + check-in. En: "Event ticket". Ar: "تذكرة فعالية".
- **boarding pass**: Pass style for transit/flights; later phase. En: "Boarding pass". Ar: "بطاقة صعود".
- **generic pass**: Catch-all style (memberships, IDs). Issue/void only. En: "Pass". Ar: "بطاقة".
- **relevant location**: A tenant location attached to a program so the phone shows the pass nearby. Join table `program_locations`. En: "Relevant location". Ar: "موقع ذو صلة". Max 10 per pass (Apple limit).
- **beacon**: A Bluetooth proximity trigger attachable to a program (later phase). Table `beacons`, type `Beacon`. Ar: "منارة إشارة".
- **reward**: What a customer gets at a threshold or redemption. Table `rewards`, type `Reward`. En: "Reward". Ar: "مكافأة". May carry a cost in tenant currency (KWD 3dp default).
- **customer**: An end customer of the tenant. Belongs to the tenant, never to a location or program. Table `customers`, type `Customer`. En: "Customer". Ar: "عميل". Deduplicated on tenant-configured unique fields. Never has a dashboard login.
- **enrollment**: A customer joining a program and getting a pass. Table `enrollments`, type `Enrollment`. En: "Enrollment". Ar: "تسجيل". Via public link or QR (QR may carry a location tag).
- **pass**: The issued wallet pass (Apple .pkpass / Google object) held by a customer for one program. Table `passes`, type `Pass`. En: "Pass". Ar: "بطاقة". A projection of the ledger — never the source of truth.
- **earn event**: Ledger event that increases a stamp or point balance. En: "Earn". Ar: "كسب".
- **redeem event**: Ledger event that decreases a balance or consumes a reward/coupon. Cannot exceed balance. En: "Redeem". Ar: "استبدال".
- **issue event**: Ledger event creating a coupon/generic/ticket pass. En: "Issue". Ar: "إصدار".
- **void event**: Ledger event invalidating a pass. En: "Void". Ar: "إلغاء".
- **balance**: Integer stamp or point total for a customer in a program. Table `balances`, type `Balance` — cached, ledger-owned, non-negative-constrained, always reconcilable as SUM of ledger events. En: "Balance". Ar: "الرصيد".
- **ledger**: The append-only event log (`ledger_events`, type `LedgerEvent`). The source of truth. Rows are never updated or deleted; corrections are reversing events.

## Invariants

- A pass has exactly one Apple style; the Google class is derived from it (loyaltyClass, offerClass, giftCardClass, eventTicketClass, flightClass, transitClass, genericClass).
- An earn or redeem event belongs to exactly one customer, one program, one location, and one staff member (or API credential).
- A stamp or point balance is the sum of the ledger, never an independently edited number.
- A coupon does not have a stamp or point balance; its ledger is issue and void only.
- A customer belongs to a tenant; location-scoped roles see customers only through events at their locations.
- Every ledger write carries an idempotency key unique per tenant; a replay returns the original result and never double-credits.
- Balances are integers; money (reward cost, KWD default) is stored as minor-unit integers with the currency's exponent.
- Timestamps are stored UTC; display and relevant-date math use the location's timezone.
- API credentials scope to a tenant; the tenant id never comes from the request body.

## Examples

Naming a new feature: "reward expiry" touches `rewards` (tenant-owned), `programs`, and the pass projection — not `campaigns` or `cards`, which do not exist.

Migration check: a new table `referrals` must have `tenant_id` and route through the tenant-scoped manager, like every table above.

## Additional resources
- Full requirements: `/council/output/plan/requirements.md` (repo path may vary; the planning document in the docs repo).
