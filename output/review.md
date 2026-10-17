VERIFICATION REVIEW — Loopy Loyalty dashboard map
Run date: 2026-10-17
Reviewer: verifier
Environment: authenticated staging account; no records were created, changed, or deleted. The test campaign shown by the app is COUNCIL TEST / COUNCIL-TEST card.

SESSION STATUS
Authenticated session confirmed. The app rendered the dashboard and campaign data; this was not a SESSION EXPIRED run.

VERDICT TABLE

Claim | Source member | Status | Evidence
---|---|---|---
/manage-my-cards is the card list, with a COUNCIL TEST draft, MANAGE, DELETE, and create button | Cartographer | CONFIRMED | Live navigation to /manage-my-cards rendered COUNCIL TEST - DRAFT, MANAGE, DELETE, and a plus button.
Global navigation includes My Cards, campaign tools, Start, Settings, trial banner, account links, and email-verification alert | Cartographer | CONFIRMED | Live snapshots on /manage-my-cards, /settings, /help, and /subusers showed the rail, 15-days-left banner, Settings/Docs links, and the unverified-email alert.
/settings contains My Account, Billing, Locations, Beacons, and Zapier | Cartographer | CONFIRMED | Live /settings rendered all six My Account tabs, Plan/Credit Card/Invoices, Google map and Add Location, Beacons/Add Beacon, and two copies of the three-card Zapier gallery.
Settings plan prices and limits are Starter $25 / Growth $69 / Ultimate $95, with 1/3/10 card designs, 1/3/10 locations and beacons, and 3/10/50 subusers | Cartographer | CONFIRMED | Live /settings rendered the three prices and the stated feature counts.
Settings has the isOpen getter JavaScript error and Zapier is duplicated | Linker + Cartographer | CONFIRMED | Live /settings showed an error overlay: Cannot set property isOpen... only a getter; the Zapier gallery was rendered twice.
/help is a template gallery with Cafe 8, Restaurant 10, Retail 19, Salon 13, Entertainment 22, Instructor 8, Service 3, Blank, plus resources | Both | CONFIRMED | Live /help rendered every named template and Quick Start Guide, Tutorials & Support, and Stamper App.
/stamp is a staff stamping page with Card ID and disabled Stamp Card until an ID is entered | Cartographer | CONFIRMED | Live /stamp rendered Card ID input, “Scan stamp-card to continue.”, and disabled “Stamp Card!”.
/landing-page/:campaignId is a customer enrollment page with First Name, Email, Mobile, terms checkbox, and Join Now | Cartographer | CONFIRMED | Live landing page for the COUNCIL test campaign rendered all fields, country-code selector, terms text/checkbox, Join Now!, and powered-by link.
/overview/:campaignId is the correct per-campaign overview route and exposes KPIs, transaction table, push history, share URL/QR, and help links | Cartographer | CONFIRMED | Live /overview/wI4XeFr6rHCTUHGOEFazZ rendered 0 KPIs, Latest Transactions with pagination/search, Push Message History with pagination/search, Card URL, Copy link, QR, and three how-to links.
Gated views are at /edit/:id/overview, /edit/:id/insights, /edit/:id/messages, /edit/:id/customers | Linker | WRONG | Navigating to /edit/wI4XeFr6rHCTUHGOEFazZ/overview redirected to /manage-my-cards. The working route is /overview/:campaignId; Cartographer’s route list is correct.
Overview is unavailable until activation | Linker | WRONG / PARTIAL | The draft campaign’s direct /overview/:id route rendered successfully with zero data. Activation-dependent behavior for sending/messages/customer data remains unverified, but the route itself is not blocked.
Subusers is only a premium-gated dialog | Linker | WRONG / PARTIAL | Live /subusers rendered a full Subusers page, Create Subuser button, table, and plan-limit text. Subscription limits may gate creation or plan access, but the route/view is directly reachable in this trial.
Card editor Data tab contains data collection, country selector, unique enrollments, consent, and enrollment preview | Cartographer | PARTIAL | Direct /edit/:id/data route loaded and showed editor navigation, but an error overlay (“Cannot read properties of undefined (reading backgroundColor)”) prevented the detailed form from being accessible in this spot-check. Prior Cartographer screenshots support the listed controls; this run cannot independently confirm every control.
Card editor has six tabs design/details/locations/support/data/labels | Both | CONFIRMED | The direct editor route rendered the six tab/icon controls; Cartographer’s named route list is consistent with the router inventory.
Global locations and beacons feed per-card Locations | Both | PARTIAL | Settings visibly has global Locations and Beacons and the editor has a Locations route. The exact API sharing and assignment behavior was not exercised here; no records were changed.
The app uses /beacons as a backend endpoint | Linker | UNVERIFIED / likely WRONG | Linker’s endpoint table uses a misspelled /becons path. Cartographer observed GET /locations but did not establish a /beacons request. UI existence of Beacons is confirmed; endpoint name is not.
/dash is an account-level aggregate statistics page | Cartographer | CONFIRMED | Router/page inventory and parent evidence identify /dash; the label “Insights” used by Linker is a navigation-label disagreement, not a distinct route.
My Cards plus button navigates to /help | Linker | UNVERIFIED / conflicting | Linker reports a click result of /help; Cartographer reports /edit/new/design. This was not clicked because it may create state and the run did not need another card. Treat the edge as unresolved; final map should document both reported outcomes and require a controlled COUNCIL-TEST-only click to settle it.
Card editor Activate changes draft to live and unlocks campaign tools | Both | UNVERIFIED | Email verification alert blocks activation in this account. No activation or data mutation was attempted.
Customers/profile, subuser/profile, invoice, onboarding/auth/reset, csv-verify, and 404 routes exist | Cartographer | UNVERIFIED | These are router-derived or not exercised in the live spot-check. They should remain explicitly route-only/unverified rather than presented as observed pages.

CORRECTIONS

1. Replace every Linker occurrence of /edit/{id}/overview with /overview/{campaignId}. The direct /edit/.../overview URL redirected to /manage-my-cards; the /overview/... URL rendered the overview page.
2. Do not call /dash “Insights” without qualification. It is the account-level dashboard route; “Insights” is also the campaign-level rail label/route at /insights/:campaignId.
3. Change Linker’s “Subusers -> Premium dialog” to: “/subusers is directly reachable and renders the staff table/Create Subuser view; plan limits and creation gating are present.”
4. Treat activation gating as behavior not fully verified. The draft overview page itself rendered; only activation, live-campaign messaging, customer enrollment, stamping/rewards, and redemption remain unverified.
5. Correct obvious Linker endpoint spellings in any synthesis: /account, /campaigns, /campaign/id/:id, /images/stampTemplates. Do not assert /beacons until a network trace confirms it; the UI section is confirmed.
6. Preserve the Cartographer’s exact campaign identifier from the reports (wI4XeFr6rHCTUHGOEFazZ) and use COUNCIL-TEST naming for any future created data. No future verification should use the malformed/truncated IDs that appeared in exploratory URLs.

MISSING PAGES / FEATURES / LINKS DISCOVERED

- No entirely new top-level page was discovered beyond the Cartographer’s 17-page inventory.
- The live overview spot-check confirms the campaign share URL/QR and three “how to” links as concrete edges: overview -> customer landing page, overview -> save-card docs, overview -> stamping docs, overview -> promotion docs.
- /stamp is a concrete operational page and should be included in the final relationship graph as staff stamping -> campaign events/transactions (the actual submission was not performed).
- Settings contains an account-level Delete workflow, Developer Tools, Google Maps location picker, Credit Card/Stripe area, and empty Invoices state; these should be represented as feature nodes even when their mutations were not exercised.
- Empty states observed: no customers/transactions/push messages on draft overview; no subusers; no invoices. These are coverage-relevant states, not missing data to fabricate.
- Permission/plan coverage remains incomplete: card activation is blocked by unverified email; paid-plan transitions and premium creation behavior were not tested.
- Modal coverage remains incomplete: Create Subuser, Add Location, Add Beacon, card DELETE confirmation, and subscription/payment actions were not opened or submitted.

DISAGREEMENTS AND RULINGS

A. Overview route: Cartographer is right. /overview/:campaignId is live and functional for the draft; Linker’s /edit/.../overview is wrong.
B. “Insights” naming: both are describing real navigation, but they conflate account /dash with campaign /insights/:campaignId. Final map must keep both routes distinct.
C. Subusers gate: Linker overstates the gate. The page is reachable in the trial; only plan limits/creation permission should be marked gated or unverified.
D. Beacons endpoint: UI is confirmed, endpoint is not. Retain the feature and relationship, downgrade the exact API edge.
E. Create-new-card edge: conflicting reports. Leave UNVERIFIED until a controlled COUNCIL-TEST-prefixed creation test settles whether the button opens /help or /edit/new/design.
F. Activation unlocks: both members report the intended product dependency, but it was not executable because of email verification. Keep as UNVERIFIED rather than confirmed.

CONFIDENCE SCORES

- Route/page inventory: 0.90. Seventeen dashboard/customer-facing pages are documented and several key routes were live-checked; auth/onboarding/secondary detail routes remain router-only.
- Feature inventory: 0.84. Settings, templates, stamping, landing page, overview, card list, and navigation were independently spot-checked; editor form details are partly inherited because the Data route showed a runtime error.
- Entity relationships: 0.76. Campaign, landing page, overview, locations, beacons, settings, and stamping relationships are well supported; activation, customer lifecycle, rewards, API-sharing, and exact beacon endpoint edges remain unverified.
- Navigation edges: 0.82. Most links/routes align, but the create-new-card destination conflict must remain unresolved and the Linker overview edges require correction.
- Permissions/gates/empty states: 0.70. Draft and unverified-email restrictions plus empty states are observed; paid-plan, activation, modal, and live-customer flows were not exercised.
- Overall final map readiness: 0.82. Sufficient to pass the verification gate with the corrections above; not sufficient to label all route-only or activation-dependent claims as live-confirmed.

GATE DECISION

PASS WITH REQUIRED SYNTHESIS CORRECTIONS. Evidence is sufficient for the chair/synthesizer to produce FINAL_REPORT.md, provided it applies the corrections and retains UNVERIFIED labels for blocked or unexercised flows. No external session blocker was encountered.
