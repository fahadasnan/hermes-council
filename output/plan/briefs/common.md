# Planning pass: rules for every council member

The council has already reverse-engineered the Loopy Loyalty merchant dashboard. Now it designs a new product built on that understanding, and writes the phase-based implementation plan plus the coding conventions (as Cursor and Claude skills) the build team will follow.

## Inputs (read-only)

- /Users/fahad/council/output/FINAL_REPORT.md: product-level map (modules, pages, features, journeys)
- /Users/fahad/council/output/TECHNICAL_REPORT.md: technical reference (data model, flows, lifecycles, settings, reports, API catalogue)
- /Users/fahad/council/output/technical/*.md: detailed worker files behind the technical report

Never edit these. Use them for functional understanding only. This is a clean-room design: do not copy Loopy Loyalty's UI, copy text, branding, or API shapes, and do not copy PassKit's API. Design our own domain model and API from the requirements.

## The product

- Multi-tenant SaaS for wallet passes, sellable to many businesses. Tenant = business. A tenant has one or more locations. Staff belong to the tenant and can be limited to specific locations. Customers belong to the tenant, enroll by link or QR, and hold a wallet pass. Data must never leak between tenants, and location-scoped roles see only their locations.
- The product is not a stamp-card clone. Loopy Loyalty is evidence for how a stamp campaign, locations, and beacons behave. The product must issue every pass style Apple Wallet supports. Confirm the current list against Apple's PassKit documentation and cite the URL. As of this brief those styles are: store card (loyalty, membership, points, stamps, gift card), coupon, event ticket, boarding pass, and generic. Do not mark any of them out of scope. Geolocation is not a sixth style: any pass can carry relevant locations (and, where Apple allows, beacons) so the phone shows it on the lock screen nearby. That location behaviour is required, not optional.
- Map each Apple style to the closest Google Wallet class (loyalty, offer, event ticket, flight or transit, generic, gift card) and cite Google's docs. Where Google has no equivalent, say so and still issue the Apple pass.
- One program model with a pass style, plus style-specific fields. Stamp count and points balance are two rule sets on a store card, not the shape of the whole schema. A coupon, ticket, or boarding pass must not be forced through a stamp ledger. Shared pass features: barcode, design, relevant locations, relevant date, update push, void. Beacons and NFC are required later phases in the same plan, designed so they attach to a pass without a new product.
- Roles at least: platform admin (us), tenant owner, location manager, staff (stamp, redeem, or check in, depending on the pass style). Customers are not dashboard users. End customers of a business enroll by link or QR. They never get a dashboard login.
- How a business gets an account: a business in Kuwait or the wider GCC contacts us and we create the tenant. Platform admin provisioning (create the tenant, its owner, and its first location) is part of the MVP. There is no public signup, no self-serve trial, and no in-app subscription checkout until the last phase. Until that phase, commercial terms stay outside the product: we invoice the business ourselves.
- Market: Kuwait first, then the rest of the GCC. English and Arabic with full RTL from day one, including enrollment and the pass where the wallet allows it. Currency KWD (3 decimal places) wherever a value is money; a tenant may use another GCC currency. Time zone per location (default Asia/Kuwait). Stamp and point balances are integers. Do not design a global self-serve default, a US-dollar price list, or a signup funnel aimed at anonymous visitors.
- Every current Google Wallet class is in the product as well (loyalty, offer, gift card, event ticket, flight, transit, generic). Confirm the current list against Google's Wallet documentation and cite the URL. Map each class to the closest Apple style. Where one side has a class the other does not, still issue the pass on the side that supports it.
- MVP (first release a business can run, after we have created their account): locations, staff, program setup for store card (stamps and points), coupon, and generic, each with design, enrollment link/QR, save to Apple Wallet and Google Wallet, relevant locations, and a ledger that matches the style (earn/redeem for loyalty; issue and void for a coupon or generic pass). Customer list, pass status, and basic analytics. The signer and the program schema must already accept event ticket and boarding pass so those phases add fields and screens, not a new pass pipeline. Next required phases: event ticket, boarding pass, beacons, then push campaigns, automations, referrals, tiers, a public API, white-label. The last phase, and only the last phase, is self-serve: public signup, the business creates its own tenant, and subscription billing. Do not pull signup or billing forward.
- Wallet passes are part of the MVP. Decide whether we sign Apple and Google passes ourselves or use a pass provider, and justify it. The ledger is the source of truth; the pass is a projection of it.

## The stack (fixed)

- Backend: Django (current LTS) and Django REST framework. One web service owns tenants, programs, customers, the earn/redeem ledger, and the API. Staff auth is Django. The server derives tenant and location scope from the authenticated user. Never trust a client-sent tenant id.
- Database: PostgreSQL, one shared schema. Every tenant-owned row has `tenant_id`. Tenant isolation is enforced in Django (a tenant-scoped manager on every tenant-owned model, plus permissions). Add database constraints for the rules the ORM must not be able to bypass (idempotency uniqueness, non-negative balance). Do not design Supabase, Row Level Security, `auth.uid()`, or Edge Functions.
- Worker: Celery and Redis. A ledger write commits, enqueues a pass update, and returns. The worker signs and pushes Apple Wallet and Google Wallet updates, including location and style-specific fields, and retries when a push fails. Wallet certificates live in secret storage, never in the repo.
- Files: S3-compatible object storage for card images and pass assets.
- Frontend: React with TypeScript (Vite). The visual design language comes from the owner's separate "Airbnb" design skill, so do NOT define colours, typography, or visual style. Do define frontend architecture, structure, data access, state, forms, i18n/RTL, accessibility, testing, and how components consume the design skill. There are two surfaces, both clients of the Django API: the merchant dashboard, and the customer enrollment page that starts pass issuance. The React app never talks to Postgres.

Check current Django LTS, Django REST framework, and Celery capabilities with web search and official docs instead of relying on memory, and cite the source URL for anything that drives a decision. Do the same for Apple Wallet and Google Wallet pass issuance (certificates, update pushes, what a pass can display).

## Decisions

Record every significant choice in your own output file under a "Proposed decisions" section, one entry per decision:

```
### PD-<area>-<n>: <title>
- Context: why this needs deciding
- Options considered: at least two, with trade-offs
- Proposal: the choice
- Consequences: what it implies for the other areas (DB, backend, frontend, ops)
```

The verifier challenges these and the chair rules on each one in decisions.md.

## Skill drafts

Each worker drafts one or more convention skills into /Users/fahad/council/output/plan/skill-drafts/<skill-name>.md, following the format in /Users/fahad/council/output/plan/briefs/skill-format.md. The chair finalises them.

## Output discipline

Write to the file your brief names in /Users/fahad/council/output/plan/. Write incrementally (section by section) so work survives a crash; on restart, read your file and continue. Use Mermaid for diagrams and validate with `node /Users/fahad/council/check-mermaid.mjs <file>`.
