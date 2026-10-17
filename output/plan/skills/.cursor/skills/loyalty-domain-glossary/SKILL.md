---
name: loyalty-domain-glossary
description: Defines the exact meaning, canonical code names, English and Arabic labels, and invariants of every domain term in the wallet-pass SaaS (tenant, location, membership, program, pass style, store card, coupon, event ticket, boarding pass, generic pass, relevant location, beacon, reward, customer, enrollment, pass, balance, ledger entry, earn, redeem, issue, void, check-in). Use when writing models, migrations, APIs, UI copy, or tests that touch loyalty or wallet-pass domain concepts, or when naming anything new in this product.
---

# Loyalty domain glossary

One meaning, one name, one table. If a concept appears here, use exactly these terms in code, docs, UI, and tests. Never introduce synonyms ("campaign", "card", "account" for domain entities are banned). These names are the canonical set from `decisions.md` (ADR-44); rejected variants (`LedgerEvent`, `CustomerProgramBalance`, `StaffProfile`, `StaffMember` as a table, `TenantManager`, split `ApplePass`/`GooglePass`) must not appear in new code.

## Terms

- **tenant**: A business that sells to its own customers. Top-level isolation boundary. Table `tenants`, type `Tenant`. En: "Business". Ar: "النشاط التجاري". Every tenant-owned row has `tenant_id`; the server derives it from the authenticated session, HMAC credential, or enrollment path — never from a request body.
- **location**: A physical place of a tenant (store, branch). Table `locations`, type `Location`. En: "Location". Ar: "الموقع". Has an IANA-validated timezone (default Asia/Kuwait) and coordinates.
- **membership**: A dashboard user's link to a tenant with a role and a location scope. Table `memberships`, type `Membership`, plus join table `membership_locations` (`MembershipLocation`). The domain phrase "staff member" means a membership with role staff — there is no separate staff table. En: "Staff member". Ar: "موظف". Roles: owner, manager, staff. Empty location set = all locations for owner/manager; staff require at least one location.
- **platform admin**: Our operator who provisions tenants. A role flag on the internal operator user, not a membership. Enters tenant data only through an explicit, audited, time-bounded support session.
- **program**: A tenant's wallet-pass offering: rules + design + one pass style. Table `programs`, type `Program`. En: "Program". Ar: "برنامج". Not "campaign", not "card". Rule fields live in the style's config table (`StoreCardConfig`, `CouponConfig`, `GenericConfig`, later `EventTicketConfig`, `BoardingPassConfig`), never duplicated on `Program`.
- **pass style**: The Apple Wallet style of a program: `store_card`, `coupon`, `event_ticket`, `boarding_pass`, `generic`. Field `programs.pass_style`, TS type `PassStyle`. A program has exactly one Apple style; the Google class is derived from it (`loyalty`, `gift_card`, `offer`, `event_ticket`, `flight`, `transit`, `generic`), never chosen independently.
- **store card**: Pass style for loyalty: stamps, points, membership, gift card. En: "Store card". Ar: "بطاقة متجر". Stamp count and points balance are two rule sets on a store card, not separate styles.
- **coupon**: Pass style for discounts/offers. Ledger is issue and void (single-use consumption is an atomic redeem+void) — a coupon has no stamp or point balance. En: "Coupon". Ar: "قسيمة".
- **event ticket**: Pass style for event entry (later phase). Issue/void + check-in; carries a relevant date. En: "Event ticket". Ar: "تذكرة فعالية".
- **boarding pass**: Pass style for flights and ground transit (later phase). Google class derives to flight or transit by transport type. En: "Boarding pass". Ar: "بطاقة صعود".
- **generic pass**: Catch-all style (memberships, IDs). Issue/void only. En: "Pass". Ar: "بطاقة".
- **relevant location**: A tenant location attached to a program (`ProgramLocation`, table `program_locations`) so the phone shows the pass nearby. En: "Relevant location". Ar: "موقع ذو صلة". Maximum 10 per pass (Apple limit), enforced at program validation and in the projector.
- **beacon**: A Bluetooth proximity trigger attachable to a program (later phase). Table `beacons`, type `Beacon`. Ar: "منارة إشارة".
- **reward**: What a customer gets at a stamp threshold or for points. Table `rewards`, type `Reward`. En: "Reward". Ar: "مكافأة". Cost is money in integer minor units (`cost_minor`) with the tenant currency (KWD default, 3 decimals).
- **customer**: An end customer of the tenant. Belongs to the tenant, never to a location or program. Table `customers`, type `Customer`. En: "Customer". Ar: "عميل". Deduplicated on tenant-configured unique fields. Never has a dashboard login. Soft-deleted; a privacy deletion nulls PII and keeps anonymized ledger aggregates.
- **enrollment**: A customer joining a program and getting a pass. Table `enrollments`, type `Enrollment`, unique per (customer, program). En: "Enrollment". Ar: "تسجيل". Via public link or QR; the QR may carry a signed location-attribution tag.
- **pass**: The issued wallet pass (Apple .pkpass / Google object) held by a customer for one program. Table `passes`, type `Pass`. En: "Pass". Ar: "بطاقة". A projection of the ledger — it holds identifiers, status, style-specific display data (`pass_data`), and push state, and carries no balance columns. Statuses: issued → voided | expired (terminal; re-enrollment issues a new pass).
- **balance**: The cached integer aggregate for a customer in a store-card program. Table `balances`, type `Balance`, unique per (customer, program): `stamps_current`, `stamps_lifetime`, `points_balance`, `rewards_earned`, `cycle`. Ledger-owned, non-negative, always reconcilable as the sum of signed ledger deltas. En: "Balance". Ar: "الرصيد".
- **ledger entry**: One append-only event. Table `ledger_entries`, type `LedgerEntry`. Event types (immutable enum): `enroll`, `earn`, `redeem`, `reward_issued`, `issue`, `void`, `check_in`, `correction`, `import`. Its FK to a pass is the field `pass_record` (column `pass_id`); its FK to the aggregate is `balance`. Balance events store `previous_balance`/`new_balance` (non-null); all other types store NULL for all three.
- **earn event**: Increases a stamp or point balance. Delta `+quantity`. En: "Earn". Ar: "كسب".
- **redeem event**: Decreases a balance or consumes a reward/coupon. Delta `−quantity`. Cannot exceed balance. En: "Redeem". Ar: "استبدال".
- **reward_issued event**: Auto-issued when stamps reach a reward's target; consumes `stamps_required` from `stamps_current` (delta `−stamps_required`), increments `cycle` and `rewards_earned`, leaves `stamps_lifetime` untouched.
- **issue event**: Creates a coupon/generic/ticket pass. Non-balance. En: "Issue". Ar: "إصدار".
- **void event**: Invalidates a pass. Non-balance. En: "Void". Ar: "إلغاء".
- **check-in event**: Records ticket/boarding gate use. Non-balance. En: "Check in". Ar: "تسجيل دخول".
- **ledger**: The append-only event log as a whole. The source of truth. Rows are never updated or deleted (a DB trigger enforces it); corrections are `correction` entries referencing the entry they reverse.
- **outbox**: `PassUpdate` and `WebhookDelivery` rows written in the same transaction as the event that justifies them; Celery tasks consume them idempotently and a sweeper re-enqueues anything stuck. No async effect exists without an outbox row.
- **API credential**: A tenant's key pair for the tenant API. Table `api_credentials`, type `ApiCredential`: visible `key_id`, hashed secret shown once, scopes, rotation with a grace window.
- **audit event**: Append-only record of a sensitive action. Table `audit_events`, type `AuditEvent`: provisioning, suspension, support sessions, credential/webhook rotation, program publication, voids, exports, staff changes, PII deletion.

## Invariants

- A pass has exactly one Apple style; the Google class is derived from it. Where one platform lacks an equivalent, the pass still issues on the platform that supports it.
- A ledger entry belongs to exactly one tenant, one customer, and (where applicable) one balance/pass, one location, and one actor (staff membership or API credential).
- A stamp or point balance is the sum of the ledger, never an independently edited number. `quantity` is always positive; the sign comes from the event type.
- A coupon does not have a stamp or point balance; its ledger is issue and void only.
- A customer belongs to a tenant; location-scoped roles see customers only through events at their locations.
- Every ledger write carries an idempotency key (header `Idempotency-Key`), unique per tenant; a replay with the same payload fingerprint returns the original result and never double-credits; a different payload under the same key is a 409 conflict.
- Balances are integers; money is integer minor units with the currency's exponent (KWD = 3).
- Timestamps are stored UTC; display, day buckets, and relevant-date math use the location's timezone.
- API credentials and sessions scope to a tenant; the tenant id never comes from the request body or an untrusted claim.

## Examples

Naming a new feature: "reward expiry" touches `rewards` (tenant-owned), `programs`, and the pass projection — not `campaigns` or `cards`, which do not exist.

Migration check: a new table `referrals` must have `tenant_id`, use `TenantScopedManager`, and prove same-tenant relations with composite foreign keys, like every table above.

UI copy: an Arabic screen about stamps uses `counter.stampsRemaining_*` keys with all six plural forms; the word for the entity is "ختم" (stamp), never a transliteration.

## Additional resources

- Canonical-name ruling and rationale: `decisions.md` ADR-44, ADR-4, ADR-5, ADR-6
- Full requirements: `requirements.md` in the planning docs
