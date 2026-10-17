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

### Notes
- Account email unverified (ibefehdi@gmaill.com); blocks campaign activation
- Campaign must be activated (status 2) for stamping, rewards, and messaging to work
- Settings page JS error: "Cannot set property iisOpen of [object Object] which has only a getter"
- Zapier gallery rendered twice (known bug)