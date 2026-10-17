# Loopy Loyalty Dashboard — Page & Feature Inventory

App: https://app.loopyloyalty.com (AngularJS SPA, ui-router). API host: https://api.loopyloyalty.com.
Account observed: trial, unverified email (blocks card activation). Test card: "COUNCIL TEST" (id wI4XeFr6rHCTUHGOEFazZ, status 1 = draft).
Full route list extracted from the client router (verified source of truth):

- /404, /auth (auth.login /login, auth.renew-subscription /renew-subscription, auth.verify /verify/:code, auth.forgot-password /forgot-password, auth.reset-password /reset-password/:username/:code)
- /signup, /get-started, /setup, /account (setup.account)
- /landing-page/:campaignId, /stamp
- /dash, /help, /manage-my-cards, /settings, /subusers, /subuser/:subuserId, /invoice/:invoiceId
- /edit/:campaignId/{design,details,locations,data,labels,support}
- /customers/:campaignId, /customers/:campaignId/profile/:cardId
- /insights/:campaignId, /messages/:campaignId, /overview/:campaignId
- /csv-verify/:file

Global navigation (present on all container pages):
- Left icon rail (campaign-scoped, disabled while selected card is a draft / status != 2): My Cards (home icon, -> /manage-my-cards), Insights, Subusers, Start (rocket), Settings. When a live card is selected the rail's campaign nav shows: Overview, Insights, Messages, Customers, Edit.
- Top bar: trial-days banner ("15 days left on trial" + Upgrade Now -> /settings), "In view: <campaign>" campaign selector, "Your Cards:" dropdown with card list + Create New Card, Dashboard link (/dash), Help (docs.loopyloyalty.com), Settings (/settings), Logout.
- Persistent alert: "You haven't verified your email address. Resend verification email."

Common API endpoints (auth via token in session; no tokens recorded): GET /account (called on every state change), GET /campaigns, GET /campaign/id/:id, GET /campaign/public/:id, GET /subusers, GET /locations, GET /images/stampTemplates, GET /card/cid/:id?count=, GET /events/analytics/all/:id?groupBy=, GET /events/analytics/stampTotals/:id, GET /events/pushHistory/:id, POST /events/analytics/transactions/:id. Third-party: Stripe (billing iframe/JS), Google Analytics, MS Clarity (CSP-blocked), PassKit (utils.passkit.net barcode), Google Maps (settings locations).

---

## 1. Manage My Cards
- URL: /manage-my-cards (nav: default landing after login; top-bar cards icon; rail "My Cards")
- Purpose: list all loyalty card campaigns; entry point to the editor.
- Features:
  - Card tiles (list/table): each shows pass preview (PDF417 barcode, "STAMPS REQUIRED UNTIL NEXT REWARD: 8", "Tap ⋯ for details"), campaign name, draft badge. Reads campaigns.
  - MANAGE (action button): opens /edit/:id/design for that campaign.
  - DELETE (action button): deletes the campaign (confirm flow not exercised).
  - "+" Create New Card (action button, also in "Your Cards" dropdown): opens /edit/new/design.
- API: GET /campaigns (returns rows incl. id, name, design, status, createTime, customFrontFields).
- Links to: card editor (all tabs), settings (via Upgrade).
- Screenshot: screenshots/manage-my-cards.png
- Note: card tile list intermittently rendered empty on reload (UI bug); the "Your Cards" sidebar dropdown still lists the campaign.

## 2. Card Editor — Design
- URL: /edit/:campaignId/design and /edit/new/design (nav: MANAGE on a card tile, or Create New Card)
- Purpose: design the digital stamp card (Apple Wallet / Google Pay pass).
- Features:
  - Type (radio): Single Reward / Multi Reward.
  - Images (file upload): Icon (87x87, square), Logo (480x150).
  - Stamps: count combobox 1–30; Pick Stamped/Un-stamped Image (preset stamp gallery, e.g. "bagel"), Upload Stamped/Un-stamped Image (>=200x200), "Use Stamped Image" checkbox.
  - Colors: tabs Card / Background / Stamp Circle / Stamp; color pickers + rgb text inputs (e.g. rgb(92,77,160)).
  - Right panel: live "Your Customers' View" pass preview with carousel buttons.
  - Save / Save & Preview / Activate (Activate only on saved campaigns).
- API: campaign read/save endpoints (GET /campaign/id/:id observed).
- Links to: Details, Locations, Support, Data, Custom tabs; Activate -> campaign goes live (status 2).
- Screenshot: screenshots/edit-design.png, screenshots/create-new-card-design.png

## 3. Card Editor — Details
- URL: /edit/:campaignId/details
- Purpose: card copy: descriptions, reward definition, expiry, useful links.
- Features:
  - Card description (text), How your customers earn 1 stamp (text), Business Name (text).
  - Reward Details: Reward Name, Description, Stamp success message (must contain {#} placeholder), Reward success message.
  - Expiry (radio): None / Fixed date / Fixed period after signup.
  - Useful Links table: Text, Link, Type (Url/Phone/Email/Address) + add-row.
  - Live customer pass preview (Latest Updates, Reward Details, Terms & Conditions, Useful Links, contact).
- Screenshot: screenshots/edit-details.png

## 4. Card Editor — Locations
- URL: /edit/:campaignId/locations
- Purpose: attach business locations/beacons to the card for lock-screen messages.
- Features:
  - Locations table (Location, Address on Card, Display, Message) + add-row; empty state "No locations added".
  - Beacons table (Beacon, Message) + add-row; empty state "No beacons added".
  - Doc links to location-based messages.
- API: GET /locations (account-level list feeds the pickers).
- Screenshot: screenshots/edit-locations.png

## 5. Card Editor — Support
- URL: /edit/:campaignId/support
- Purpose: terms & conditions and card issuer contact info (Apple-required).
- Features: Terms & Conditions enabled checkbox + textarea (default template), Link to full T&C (optional), Card Issuer Details (Business Name, Email, Phone).
- Screenshot: screenshots/edit-support.png

## 6. Card Editor — Data
- URL: /edit/:campaignId/data
- Purpose: customer enrollment data collection config.
- Features:
  - Data Collection table: Description, Format (Text/Number/Date/Email/URL/Mobile), Mandatory checkbox, delete; default rows First Name, Email Address, Mobile Number; add-row.
  - Default country for phone fields (full country list).
  - Unique Customer Enrollments: checkbox, max 3 unique fields, prevents duplicate signups.
  - Data Consent: enable checkbox, landing page consent text, checked-by-default checkbox.
  - Right panel: enrollment page preview ("Please enter your details", Join Now! button).
- Screenshot: screenshots/edit-data.png

## 7. Card Editor — Custom (Labels)
- URL: /edit/:campaignId/labels
- Purpose: personalize card fields and default label text.
- Features:
  - Add Custom Fields table: Label, Field to Display (Stamps required until next reward / total stamps collected / First Name / Email Address / Mobile Number).
  - Card Labels table: Original Label Text -> New Label Text overrides for ~20 default strings (STAMPS REQUIRED UNTIL NEXT REWARD, LATEST UPDATES, HOW TO COLLECT STAMPS, REWARD DETAILS, REWARDS EARNED, USEFUL LINKS, TERMS & CONDITIONS, Join Now!, etc.).
- Screenshot: screenshots/edit-custom.png

## 8. Dashboard
- URL: /dash (nav: top-bar Dashboard)
- Purpose: account-level totals and acquisition trend.
- Features: Total statistics KPIs (Customers Enrolled, Stamps Issued, Rewards Issued, Rewards Redeemed); Acquisition chart with Group by Day/Month/Year; Rewards Overview section.
- API: GET /events/analytics/all/:id?groupBy=.
- Screenshot: screenshots/dash.png

## 9. Overview (per campaign)
- URL: /overview/:campaignId (nav: campaign rail "Overview"; reachable via $state even for draft)
- Purpose: live campaign health: KPIs, transactions, push history, share URL.
- Features:
  - KPIs: Customers Signed Up, Stamps Issued, Rewards Issued, Rewards Redeemed.
  - Latest Transactions table (Date and Time, Customer, Event, User) with pagination + entries-per-page + search.
  - Push Message History table (Date, Message, Segment, Reach).
  - Your Card URL (https://loyalty.is/<id>, Copy link) + QR code + how-to links (save card, stamp, promote).
- API: GET /events/analytics/all/:id, GET /events/pushHistory/:id, POST /events/analytics/transactions/:id.
- Screenshot: screenshots/overview.png

## 10. Insights (per campaign)
- URL: /insights/:campaignId (nav: rail "Insights")
- Purpose: ROI/finance view of the loyalty program.
- Features: revenue vs rewards-cost summary ("driven $X in revenue and cost $Y in rewards... broken even"), claimed/outstanding reward value note; All time stats (Customers Signed Up, Stamps Issued, Rewards Issued, Rewards Redeemed); Currency selector (full ISO currency list).
- API: GET /events/analytics/all/:id?groupBy=day, GET /events/analytics/stampTotals/:id, POST /events/analytics/transactions/:id.
- Screenshot: screenshots/insights.png

## 11. Messages (per campaign)
- URL: /messages/:campaignId (nav: campaign rail "Messages")
- Purpose: push lock-screen / Latest Updates messages to card holders.
- Features: Who? selector (All of my customers / A segment of my customers); Message textarea with best-practice hint (~90 chars) and idea examples; Send Message button; Push Message History table (Date, Message, Segment, Reach) with pagination/search.
- API: GET /card/cid/:id?count=true (audience count), POST message send (not exercised).
- Screenshot: screenshots/messages.png

## 12. Customers (per campaign)
- URL: /customers/:campaignId (nav: campaign rail "Customers")
- Purpose: enrolled customer list.
- Features: table (First Name, Email Address, Mobile Number, Signup Date, Card Status, Stamps Earned, Rewards Earned, Rewards Redeemed), pagination, entries-per-page, search. Rows link to /customers/:campaignId/profile/:cardId (UNVERIFIED — no enrolled customers in test data).
- API: POST /card/cid/:id?count=false (list).
- Screenshot: screenshots/customers.png

## 13. Subusers
- URL: /subusers (nav: rail "Subusers")
- Purpose: staff accounts that can stamp/redeem; attribution of stamps & rewards per staff member.
- Features: Create Subuser button -> modal (Username* with account prefix, Password*, Notes, Location selector, Cancel/Create); table (Profile, Username, Created, Notes, Location, Status) with pagination/search. Plan limits: 3 (Starter) / 10 (Growth) / 50 (Ultimate). Subuser profile at /subuser/:subuserId (UNVERIFIED — no subusers).
- API: GET /subusers, GET /locations (for modal selector).
- Screenshot: screenshots/subusers.png, screenshots/subusers-create-modal.png

## 14. Settings
- URL: /settings (nav: top-bar Settings, rail Settings, Upgrade Now)
- Purpose: account, billing, locations, beacons, integrations.
- Features:
  - My Account tabs: General (Username disabled, First/Last Name, Email, Update); Business (Business Name*, Website*, Address 1/2, City, Region, Zip, Country*); Privacy (marketing consent checkbox, Update); Password (Current/New/Confirm, 8+ chars + 1 number, show toggle); Developer Tools (API Key + API Secret, disabled inputs, link to developer.loopyloyalty.com, Stamper App mention); Delete (reason checkboxes + Other text, password confirm, Delete button).
  - Billing tabs: Plan (Starter US$25, Growth US$69, Ultimate US$95 per month; monthly/annual toggle; Subscribe buttons; feature lists incl. card designs, locations, beacons, subusers, label customisation, unique enrollments, data export); Credit Card (Stripe Elements card form); Invoices (empty state "You have no invoices.").
  - Locations: Add Location button + Google Maps picker (map/satellite, Pegman) for lock-screen messages.
  - Beacons: Add Beacon button.
  - Zapier: embedded Zapier workflow gallery (Mailchimp list add, Google Sheets enrollments, Google Sheets stamps; create-from-scratch link).
- API: GET /account, GET /locations; Stripe (card/subscribe); Google Maps.
- Screenshot: screenshots/settings.png, settings-general in same; settings-business.png, settings-privacy.png, settings-developer-tools.png, settings-delete.png, settings-credit-card.png, settings-invoices.png

## 15. Landing Page (customer-facing)
- URL: /landing-page/:campaignId (also the public loyalty.is URL target)
- Purpose: customer enrollment form before adding the pass to Wallet.
- Features: card description header; "Please enter your details" form (fields per Data tab: First Name*, Email Address*, Mobile Number*); Terms & Conditions text + agreement checkbox; Join Now! button; "powered by Loopy Loyalty".
- API: GET /campaign/public/:id.
- Screenshot: screenshots/landing-page.png

## 16. Stamp
- URL: /stamp (subuser/staff stamping tool)
- Purpose: scan or type a card ID and stamp it.
- Features: Card ID input ("Scan stamp-card to continue."), Stamp Card! button.
- Screenshot: screenshots/stamp.png

## 17. Help / Templates
- URL: /help (nav: rail "Start" rocket icon; template gallery)
- Purpose: start a new card from a template.
- Features: Choose a Template gallery (Cafe 8, Restaurant 10, Retail 19, Salon 13, Entertainment 22, Instructor 8, Service 3, Blank); Resources links (Quick Start Guide, Tutorials & Support, Stamper App).
- API: GET /images/stampTemplates.
- Screenshot: screenshots/help-templates.png

## Unverified / route-only pages (from router; not exercised)
- /login, /signup, /get-started, /setup, /account (onboarding wizard)
- /verify/:code (email verification), /forgot-password, /reset-password/:username/:code, /renew-subscription
- /customers/:campaignId/profile/:cardId (customer profile detail)
- /subuser/:subuserId (subuser profile)
- /invoice/:invoiceId (invoice PDF/page)
- /csv-verify/:file (CSV upload verification, data export flow)
- /404
- Multi Reward card type flow (only Single Reward draft present).
- Activate flow blocked by email verification; live-campaign-only behavior (rail enablement, stamping, segments, reward redemption) is UNVERIFIED.

## Cross-page connections (feature graph)
- manage-my-cards -> MANAGE -> edit/design|details|locations|support|data|labels -> Save/Save & Preview/Activate -> campaign status draft->live.
- Once live: rail Overview/Insights/Messages/Customers + Edit become enabled; loyalty.is share URL + QR on Overview -> customer /landing-page/:id -> enrollment (fields from Data tab) -> customer appears in /customers/:id with stamps/rewards -> staff stamps via /stamp or Stamper App / API -> events show in Overview transactions + Insights ROI + Dashboard totals.
- Messages -> push to enrolled customers (segments) -> history in Overview/Messages.
- Settings locations/beacons feed edit/locations pickers and lock-screen messages; Settings plan limits gate card designs, subusers, features.
