# Brief: Setup and Settings (cartographer)

Output: /Users/fahad/council/output/technical/settings.md

The first survey mapped settings at whatever depth it reached. Map every settings sub-page the live dashboard actually has. Do not assume a salon settings tree. Start from the survey's settings pages and from the gear/settings navigation you can see.

1. Open the settings area and enumerate every section and link (business details, locations, programs and rewards, card design defaults, staff and permissions, notifications, integrations, billing, account, and anything else present). Follow nested pages, tabs, and modals.
2. For each settings page: route, purpose, every field (label, type, options, current value class not personal values, required, validation), save behaviour, API calls on load and on save.
3. For each settings page, document what it affects elsewhere in the product (e.g. a reward threshold changes when a customer can redeem; a location appears in the stamp flow). Verify at least the important ones by looking at the affected page.
4. Make one safe, additive COUNCIL-TEST edit wherever the page supports it (e.g. add a COUNCIL-TEST location, reward, or staff label) to capture the create/update API payload, then confirm where it appears. Revert toggles you change. Log everything in test-records.md. Do not delete the account, change the password, change billing, or send a message to customers.
5. Diagrams: a flowchart of the settings tree, and a flowchart "settings -> affected features".

Sections of settings.md: Settings tree, one section per settings page (fields table, API calls, affects), Safe edits performed, Diagrams, Gated/unavailable settings.
