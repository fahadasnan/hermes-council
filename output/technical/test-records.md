# Test Records

Records created during council deep technical passes. Append only.

## Seed data (created by linker, 2026-10-17)

### Campaign
- Type: Campaign (existing, not created by this run)
- Name: COUNCIL TEST
- ID: wI4XeFr6rHCTUHGOEFazZ
- Status: Draft (status 1)
- Stamps required: 8
- Created: by Cartographer in prior run

### Location
- Type: Location
- Name: COUNCIL TEST Location
- Address: 221B Baker St, London NW1 6XE
- Coordinates: 22.287614, 114.148313 (Google Maps; geocoding to Hong Kong - not actual Baker Street)
- API: POST /location => 201 Created
- Date: 2026-10-17
- Status: Active

### Customers (enrolled via /landing-page/wI4XeFr6rHCTUHGOEFazZ)

| # | Name | Email | Card ID | Phone | Signup Date | Stamps |
|---|------|-------|---------|-------|-------------|--------|
| 1 | COUNCIL TEST Alice | council-test+alice@example.com | xZuG0J01d5TGR2 | +12015550123 | 2026-10-17 | 0 |
| 2 | COUNCIL TEST Bob | council-test+bob@example.com | LtUUN2mxP5cDdg | +12015550101 | 2026-10-17 | 0 |
| 3 | COUNCIL TEST Charlie | council-test+charlie@example.com | eiVH1t0LE058Li | +12015550102 | 2026-10-17 | 0 |
| 4 | COUNCIL TEST Diana | council-test+diana@example.com | OkossS0uRwTfPF | +12015550103 | 2026-10-17 | 0 |
| 5 | COUNCIL TEST Edward | council-test+edward@example.com | ioPyLW887pmNQT | +12015550104 | 2026-10-17 | 0 |
| 6 | COUNCIL TEST Fiona | council-test+fiona@example.com | lYWxtjodR51CUv | +12015550105 | 2026-10-17 | 0 |
| 7 | COUNCIL TEST George | council-test+george@example.com | Kr54wYnVCU7mNM | +12015550106 | 2026-10-17 | 0 |
| 8 | COUNCIL TEST Helen | council-test+helen@example.com | RTgLMCuFyOvpMH | +12015550107 | 2026-10-17 | 0 |

All customers show 0 stamps earned, 0 rewards earned, 0 rewards redeemed. Card status: "issued".

### Stamps
- Attempted: 43 stamps across 8 customers via /stamp page
- Result: FAILED - API returned 500: POST /card/cid/{cardId}/addStamps/undefined
- Root cause: /stamp page passes `undefined` as stamp count; draft campaign lacks context
- Stamps Issued on /dash: 0

### Redemption
- Not attempted: stamping required first, and stamping blocked by draft campaign

### Message
- Not possible: Messages page (/messages/wI4XeFr6rHCTUHGOEFazZ) has only "Send Message" button, no draft/save option.
- Did NOT send any message per safety rules.
- Push Message History: empty

### Beacon (created by cartographer, 2026-10-17 11:07)
- Created "COUNCIL TEST Beacon" via Settings > Add Beacon modal (fields: Name of Beacon, UUID, Major, Minor — all required; validation msgs "Please enter a valid uuid." / "Please enter a minor."; all-zero UUID rejected).
- API: GET /beacons (list), GET /beacons/uuid/:value (duplicate check), POST /beacon (singular) => 201 Created, then GET /beacons refresh. UUID F7826DA6-4FA2-4E98-8024-BC5B71E0893E, major 1, minor 1.
- Not reverted (own COUNCIL-TEST record; also proves the beacon API surface).

### Stamp (created by cartographer, 2026-10-17 11:06)
- Gave 1 stamp to COUNCIL TEST Alice (card xZuG0J01d5TGR2) via customer profile "Give Stamps" tab.
- API: POST /card/cid/xZuG0J01d5TGR2/addStamps/1 => 200 OK. UI toast "Card Successfully Stamped"; Stamps Earned 1; transaction "1 stamp earned" recorded; pass counter 10 -> 9.
- Note: the profile Give Stamps tab works even though the /stamp page passes an undefined count (API 500); the endpoint pattern is POST /card/cid/:cardId/addStamps/:count.
- Not reverted (additive test data on own COUNCIL-TEST record).

### Notes
- Account email unverified (ibefehdi@gmaill.com); blocks campaign activation
- Campaign must be activated (status 2) for stamping, rewards, and messaging to work
- Settings page JS error: "Cannot set property iisOpen of [object Object] which has only a getter"
- Zapier gallery rendered twice (known bug)

## Settings changed (by cartographer, 2026-10-17, reports deep pass)

### Insights economics — campaign wI4XeFr6rHCTUHGOEFazZ
- Page: /insights/wI4XeFr6rHCTUHGOEFazZ (Revenue inputs form)
- Change: set Stamp Value = 1.23 and Reward Cost (#1) = 2.34, clicked Submit (writes `PATCH /campaign/wI4XeFr6rHCTUHGOEFazZ`: `stampValue`, `rewards[].cost`) to verify the write path.
- Reverted: yes — set both back to 0 and Submitted again.
- Verification (cartographer, 2026-10-17 11:05, run 2 of this task): `GET /campaign/id/wI4XeFr6rHCTUHGOEFazZ` returns NO `stampValue` and NO `rewards[].cost` field (zero values are dropped server-side); Insights UI shows Stamp Value "0", Reward Cost empty, Currency "US Dollar: USD". Screenshot: /Users/fahad/council/screenshots/reports-verify-insights.png (also reports-verify-insights.yml snapshot).
- Note: original values were absent/0 (draft campaign never configured), so revert restored the original state exactly.