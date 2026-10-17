# Brief: Seed realistic test data (linker)

Read /Users/fahad/council/output/technical/briefs/common.md first. All its safety rules apply. Read the survey (FINAL_REPORT.md and pages.json) before creating anything, and only create records the UI actually offers.

The test account may be nearly empty, so lists and analytics show little and the council cannot observe how data propagates. Create a realistic, varied data set so every module that exists has content. Reuse any COUNCIL-TEST records listed in /Users/fahad/council/output/technical/test-records.md instead of duplicating them.

Create (every name starts with COUNCIL-TEST; fake contact details only: council-test+<n>@example.com, no phone numbers):

1. A program or card, if one is not already present: one COUNCIL-TEST stamp card (or the primary card type) with a small reward threshold so later members can redeem without dozens of stamps.
2. A COUNCIL-TEST location, if the form exists and does not require a paid upgrade.
3. Customers: 8, varied names, a note on 2 of them if notes exist.
4. Earn events: stamp or add points across several of those customers so at least 2 cross the reward threshold and at least 2 stay below it. Spread them if the UI has a date, otherwise record that timestamps are "now".
5. Redeem once for one customer who has reached the reward, if redemption does not charge a card or send a message.
6. A campaign or message DRAFT only, if the UI can save without sending. Never send.

Skip staff users if the UI warns about billing or subscription changes. Skip beacons, paid add-ons, and anything that emails or pushes a real customer.

Log every record in test-records.md (type, name, ID if visible, date, status) as you go, grouped under "Seed data". Then write /Users/fahad/council/output/technical/seed.md: what was created, counts per type, and a short check of where the data now shows up (customer list count, the program, activity, analytics), with evidence.
