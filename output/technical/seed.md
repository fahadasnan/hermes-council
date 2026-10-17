# Seed Data Report

Generated: 2026-10-17 by linker (Hermes Agent)
Account: ibefehdi (trial, 15 days remaining, email unverified)

## Summary of Created Data

| Record Type | Count | Status |
|---|---|---|
| Campaign | 1 (reused existing) | COUNCIL TEST, draft, 8 stamps, id wI4XeFr6rHCTUHGOEFazZ |
| Location | 1 | COUNCIL TEST Location, 201 Created |
| Customers | 8 | All enrolled, 0 stamps, 0 rewards |
| Stamps | 0 | FAILED: API 500 (draft campaign) |
| Redemption | 0 | Not possible without stamps |
| Message draft| 0 | No draft/save UI; only "Send" |

## What Was Done

### 1. Campaign

Existing "COUNCIL TEST" campaign (id wI4XeFr6rHCTUHGOEFazZ, created by Cartographer in prior run) reused. Attempted to create a new campaign from the Service Template but the save dialog failed silently (no API POST to /campaigns). The name "COUNCIL-TEST Stamp Card" was rejected due to dashes; "COUNCIL TEST Stamp Card" appeared to be accepted but no campaign appeared in the list.

**Limitation**: The blank editor requires an icon upload before saving. The Service Template-based editor requires successful API save. Neither flow completed.

### 2. Location

Created via Settings > Locations > Add Location:
- Name: COUNCIL TEST Location
- Search: "221B Baker Street, London"
- Address to display: "221B Baker St, London NW1 6XE"
- API: POST /location => 201 Created
- Coordinates (from Google Maps geocoder): 22.287614, 114.14833 (Hong Kong - the address search didn't resolve to actual Baker Street, London)
- Location table now shows 1 entry with edit/delete buttons

### 3. Customers (8)

Enrolled via /landing-page/wI4XeFr6rHCTUHGOEFazZ:
- Form requires First Name, Email, Mobile (US format), and T&C checkbox
- Phone validation required native Playwright fill() with `pressSequentially()` approach
- All 8 enrolled; redirected to PassKit wallet pass (blocked by network content filter, but cards created on server)
- Card IDs captured from redirect URLs (base64-decoded from PassKit bundle handler URLs)
- Customers page (/customers/wI4XeFr6rHCTUHGOEFazZ) shows all 8 with "issued" status, 0 stamps/rewards
- Customer profiles accessible at /customers/{campaignId}/profile/{cardId}

### 4. Stamps - FAILED

Attempted via /stamp page:
- Card ID input accepts passkit bundle IDs
- Stamp Card! button enables after entering ID
- API call: POST /card/cid/{cardId}/addStamps/undefined => 500 Internal Server Error
- The `undefined` parameter indicates /stamp page doesn't know the stamp count
- Root cause: draft campaign (status 1) lacks context for stamp operations
- 43 stamp attempts made; all returned 500

**Product limitation**: Stamping requires campaign activation (status 2), which requires email verification.

### 5. Redemption - NOT POSSIBLE

Redemption flow not accessible: requires stamps on a customer,which requires campaign activation.

### 6. Message Draft - NOT AVAILABLE

The /messages/wI4XeFr6rHCTUHGOEFazZ page shows:
- "Who?" radio: All customers / A segment
- Message composer with ~90-character best practice hint
- "Send Message" button only; no "Save as Draft" option
Per safety rules, message was NOT sent.

## Where Data Shows Up

### Customer List
- URL: /customers/wI4XeFr6rHCTUHGOEFazZ
- API: POST /card/cid/wI4XeFr6rHCTUHGOEFazZ?count=false => 20 OK
- Table: 8 rows, all with names, emails, phones, signup date 2026-10-17, "issued" status, 0 stamps/rewards

### Dashboard (/dash)
- Customers Enrolled: 8
- Stamps Issued: 0
- Rewards Issued: 0
- Rewards Redeemed: 0
- Acquisition chart: present (groupable by Day/Month/Year)
- Rewards Overview: empty

### Overview (/overview/wI4XeFr6rHCTUHGOEFazZ)
- Accessible despite draft status
- KPIs all 0 (customers,stamps, rewards)
- Latest Transactions: empty (no stamps)
- Push Message History: empty
- Card URL (loyalty.is) and QR code: present

### Manage My Cards (/manage-my-cards)
- COUNCIL TEST card: DRAFT badge, 8 stamps, MANAGE and DELETE buttons

### Messages (/messages/wI4XeFr6rHCTUHGOEFazZ)
- Available; shows composer + empty history table
- Audience count likely shows 8 customers (not verified via network)

### Insights (/insights/wI4XeFr6rHCTUHGOEFazZ)
- Accessible; would show revenue vs reward cost (empty for unactivated campaign)

### Location
- Settings > Locations table: "COUNCIL TEST Location", "221B Baker St, London NW1 6XE"
- Edit and delete buttons present
- Available for assignment in campaign editor's Locations tab (not verified)

## API Endpoints Exercised

| Method | Endpoint | Status | Purpose |
|---|---|---|---|
| GET | /campaigns | 200 | List campaigns |
| GET | /campaign/id/wI4XeFr6rHCTUHGOEFazZ | 200 | Get campaign details |
| GET | /campaign/public/wI4XeFr6rHCTUHGOEFazZ | 200 | Landing page data |
| POST | /card/cid/wI4XeFr6rHCTUHGOEFazZ?count=false | 200 | Customer list |
| POST | /card/cid/{cardId}/addStamps/undefined | 500 | Stamp customer (FAILED) |
| POST | /location | 201 | Create location |
| GET | /locations | 200 | List locations |
| GET | /events/analytics/all/... | 200 | Dashboard analytics |
## Blockers

1. **Email verification**: Account email ibefehdi@gmail.com is unverified, blocking campaign activation (status 1 -> 2)
2. **Campaign activation block**: Without activation:
  - /stamp returns 500 (stamp count undefined)
   - Rewards cannot be issued or redeemed
  - Messages cannot be sent (only "Send", no draft)
3. **New campaign creation**: Template-based editor save flow didn't commit to API. Blank editor requires icon upload before saving.
4. **Settings JS error**: "Cannot set property isOpen of [object Object] which has only a getter" overlay on /settings

## Evidence

- All customers confirmed visible on /customers/wI4XeFr6rHCTUHGOEFazZ (snapshot captured)
- Dashboard /dash shows "8" Customers Enrolled (snapshot captured)
- Location created with POST /location 201, visible in Settings locations table (network trace + snapshot)
- Stamp API calls visible in network requests: 43 calls to POST /card/cid/{id}/addStamps/undefined with 500 response
- Message page shows Send button only; no draft option (snapshot captured)