---
name: loyalty-domain-glossary
description: Use when writing or reviewing code, APIs, or docs for the wallet-pass SaaS (Django/React, tenants, programs, passes, ledger). Defines the exact meaning and naming of loyalty domain terms (tenant, location, program, pass style, customer, ledger events, balances), with invariants and EN/AR labels.
---

# Loyalty domain glossary

The single vocabulary for the wallet-pass product. Use these names in code, migrations, API payloads, and UI copy — no synonyms.

## Quick start / rules

- Tables are snake_case plurals (`tenants`, `locations`, `programs`, `customers`, `passes`, `ledger_events`); TypeScript types are PascalCase singular (`Tenant`, `Program`, `LedgerEvent`).
- Every tenant-owned model has `tenant_id` and a tenant-scoped manager; never trust a client-sent tenant id.
- Never invent a new domain term; extend this file first.

## Terms

| Term | Meaning | Code naming | Arabic label |
|---|---|---|---|
| Tenant | One business customer of the platform; owns everything else. | `Tenant`, `tenants` | جهة |
| Location | A tenant's physical venue; scope unit for staff and events. | `Location`, `locations` | الفرع |
| Staff member | A tenant user who earns/redeems at the counter; scoped to locations. | `StaffUser` / Django `User` with scope | موظف |
| Program | A loyalty configuration owned by a tenant: pass style, design, rules, reward. | `Program`, `programs` | برنامج |
| Pass style | One of `store_card`, `coupon`, `event_ticket`, `boarding_pass`, `generic`. Exactly one per program. | `Program.pass_style` enum | نوع البطاقة |
| Store card | The Apple `storeCard` style: loyalty, membership, points, stamps, gift card. | `store_card` | بطاقة متجر |
| Coupon | Apple `coupon` style: an offer with terms, issued and voided. | `coupon` | قسيمة |
| Event ticket | Apple `eventTicket` style: entry to one event, checked in. | `event_ticket` | تذكرة فعالية |
| Boarding pass | Apple `boardingPass` style: trip legs with `transit_type`. | `boarding_pass` | بطاقة صعود |
| Generic pass | Apple `generic` style: anything else (membership, claim ticket). | `generic` | بطاقة عامة |
| Relevant location | A location attached to a program so the wallet shows the pass nearby (`relevantText`, `maxDistance`). | `program_locations` m2m | موقع ذو صلة |
| Beacon | iBeacon-style proximity trigger (UUID/major/minor) attached to a program. | `Beacon`, `beacons` | منارة |
| Reward | What a store-card customer earns at the target (stamps or points); has cost (money, 3-dp KWD). | `Reward`, `rewards` | مكافأة |
| Customer | An end consumer who enrolled by link/QR; belongs to the tenant, never has a login. | `Customer`, `customers` | عميل |
| Enrollment | Customer joining a program via the hosted page; creates the pass. | `enroll` ledger event type | تسجيل |
| Pass | The customer's wallet card in one program; projection of the ledger onto Apple/Google. | `Pass`, `passes` | بطاقة (في المحفظة) |
| Earn event | Ledger row adding stamps/points (store card) or issuing (coupon/generic). | `ledger_events.kind='earn'` | حركة كسب |
| Redeem event | Ledger row marking a reward redeemed. | `kind='redeem'` | حركة استبدال |
| Issue / void event | Coupon/generic lifecycle rows. | `kind='issue' | 'void'` | إصدار / إبطال |
| Check-in event | Event ticket / boarding pass validation scan. | `kind='checkin'` | تسجيل حضور |
| Balance | Stamps or points for a store-card pass: SUM of its ledger rows. Never an independently edited column. | computed; cache must reconcile | الرصيد |

## Invariants

- A pass has exactly one Apple style (and at most its mapped Google class); `Program.pass_style` is immutable after activation.
- An earn/redeem/check-in event belongs to exactly one customer pass, one location, and one staff user; rows are append-only.
- A stamp or points balance is the sum of ledger events, never a hand-edited number; corrections are new compensating rows.
- A coupon or generic pass has no stamp/points balance — the schema rejects those fields for those styles.
- Balances and stamp counts are integers; money values (reward cost) use KWD 3-decimal precision (or the tenant's GCC currency).
- A customer belongs to one tenant and may hold passes in several programs and locations; never to a location.
- No term above may store data across tenants without `tenant_id` present and scoped.

## Examples

```python
# Balance is aggregated, never edited:
def store_card_balance(pass_id: UUID) -> int:
    return LedgerEvent.objects.for_pass(pass_id).balance_delta()
```

## Additional resources
- Requirements detail: /Users/fahad/council/output/plan/requirements.md (owner-agnostic path: docs at plan/requirements.md)