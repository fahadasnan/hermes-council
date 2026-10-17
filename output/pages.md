# Loopy Loyalty Dashboard — Page & Feature Inventory

App: https://app.loopyloyalty.com (AngularJS SPA; API: https://api.loopyloyalty.com)
Account used: trial account `ibefehdi` (15 days left, email unverified). All pages walked live in a logged-in browser on 2026-10-17. A test campaign `COUNCIL TEST` (id `wI4XeFr6rHCTUHGOEFazZ`) was created to reach campaign-scoped pages.

Screenshots are in `/Users/fahad/council/screenshots/` (filenames noted per page).
"Route-derived" = exists in the app's ui-router config (extracted from `js/app-21db9b2f00.js`) but not visually verified — marked UNVERIFIED.

## Global navigation (present on all authenticated pages)

- Left icon sidebar (states via `cc.navigateToState(obj.state)`): My Cards, Subusers, Start, Settings.
- Top navbar: logo → /manage-my-cards; trial banner "N days left on trial" + "Upgrade Now" → /settings; Help → http://docs.loopyloyalty.com/; user dropdown (Your Cards list, Create New Card, Dashboard, Help, Settings, Logout).
- Email-verification alert bar with "Resend verification email" (`cc.resend()`) — persists until the account email is verified.
- Floating "+" button = Create New Card (`cc.createNewCampaign()`).

---

## 1. Login
- URL: `/auth/login` (public; `/` redirects here when unauthenticated)
- Nav path: root redirect / "Log in here" links
- Purpose: authenticate merchant accounts.
- Features: username-or-email + password form, show/hide password toggle, "Log in" button (disabled until valid), links to Create an account (`/signup/get-started`) and Forgot Password (`/auth/forgot-password`). Footer: © PassKit, Inc.
- API: POST /account/login (sets JWT + account fields into sessionStorage: jwt, uid, status, expiryDate, business, trialDuration, trialExp, ihash, limit, email, dateJoined, pkadmin, username, plan). NOTE: session lives in sessionStorage, so Playwright storageState cannot persist it across contexts.
- Outgoing links: signup, forgot-password.
- Screenshot: `page-2026-10-17T06-50-30-136Z.png`

## 2. Forgot Password
- URL: `/auth/forgot-password` (public)
- Nav path: login page → "Forgot Password?"
- Purpose: request a password-reset email.
- Features: username-or-email input, "Send Recovery Email" button, post-send state with "Try again" (resend) and "Go to login" buttons.
- API: UNVERIFIED (not submitted — would send real email).
- Screenshot: `09-forgot-password.png`

## 3. Reset Password — UNVERIFIED (route-derived)
- URL: `/auth/reset-password/:username/:code` (public)
- Purpose: set a new password from an emailed reset link. Template `app/authentication/reset-password.html`.

## 4. Email Verification — UNVERIFIED (route-derived)
- URL: `/auth/verify/:code` (public). Activating a card is blocked until this is done ("To activate your card, please first verify your email address").

## 5. Renew Subscription — UNVERIFIED (route-derived)
- URL: `/auth/renew-subscription`. Template `app/authentication/renew-subscription.html`.

## 6. Signup / Get Started
- URL: `/signup/get-started` (public)
- Nav path: login page → "Create an account for free"
- Purpose: create a new merchant account.
- Features: email + confirm email, username (immutable, 5–25 chars), password + confirm (8 chars min, 1 number), Terms of Service / Privacy Policy consent checkboxes, marketing opt-in checkbox, "Get Started!" button.
- API: POST /signup (derived from source; not exercised).
- Screenshot: `09-signup-get-started.png`

## 7. Dashboard
- URL: `/dash`
- Nav path: sidebar "Start" / user menu "Dashboard"
- Purpose: landing page after login — start a card, learn, use templates.
- Features: "Welcome to Loopy Loyalty, <username>" heading; "Create New Card" button (→ card editor `/edit/new/design`); Loopy Loyalty Video Academy (Vimeo embeds: "1. Create your Card" — Card Design, Card Details, Card Customisations); Samples gallery of 7 template cards — Cafe, Restaurant, Retail, Salon, Entertainment, Instructor, Service — each clickable (`vm.selectSampleCampaign`) to start a card from that template. Starter variant template `dash/starter.html` exists for new accounts.
- API: GET /account, GET /campaigns.
- Outgoing: Create New Card → /edit/new/design; template clicks → editor prefilled.
- Screenshot: `02-dash.png`

## 8. Help
- URL: `/help`
- Nav path: top navbar "Help" icon
- Purpose: templates + resources hub.
- Features: "Choose a Template" — same 7 templates + Blank, with live pass previews (stamps-required counts: Cafe 8, Restaurant 10, Retail 19, Salon 13, Entertainment 22, Instructor 8, Service 3); Create New Card button; "Resources": Quick Start Guide (PDF link), Tutorials & Support (docs.loopyloyalty.com), Stamper App (docs link). `/setup/account` redirects here for a set-up account.
- Screenshot: `08-help.png`

## 9. My Cards (Manage My Cards)
- URL: `/manage-my-cards` (also the 404/otherwise fallback)
- Nav path: sidebar "My Cards" / top logo
- Purpose: list all loyalty card campaigns; entry to manage/delete.
- Features: card grid — each card shows a live Apple Wallet-style pass preview (front: STAMPS REQUIRED UNTIL NEXT REWARD, "Tap ⋯ for details"), internal name, status badge (DRAFT / LIVE); MANAGE button (`cc.selectCampaign` → editor for drafts); DELETE button (`vm.deleteCampaign` → confirmation modal); Create New Card floating button; "In view: <card>" indicator with campaign switcher when a card is selected.
- Delete modal: warning that all customers lose earn/redeem ability, all customer cards invalidated, all card data deleted (customer list, insights, push history); "Yes, delete my card" / Cancel. (Opened, not confirmed.)
- API: GET /campaigns; DELETE via `vm.ok(true)` (not exercised).
- Outgoing: MANAGE → /edit/:id/design (draft) or overview; Create New Card → /edit/new/design.
- Screenshots: `01-manage-my-cards.png`, `05-manage-my-cards.png`, `10-delete-modal.png`

## 10. Card Editor — Design
- URL: `/edit/:campaignId/design` (`new` before first save)
- Nav path: My Cards → MANAGE; Dashboard → Create New Card; wizard tab "Design"
- Purpose: design the stamp card pass.
- Features (form, live "Your Customers' View" preview with iOS / Android / Lockscreen device toggles):
  - Type: Single Reward / Multi Reward radio (`vm.campaign.type`), with info modal (`openRewardTypeImagesModal('rewardType')`).
  - Images: Icon upload (87x87 square, required), Logo upload (480x150 recommended), image-library picker modals, remove-image actions.
  - Stamps: total-stamps select 1–25 (`vm.campaign.baseStripImage.totalStamps`); Pick Stamped Image (library ui-select, default "bagel") OR upload (min 200x200); same for Un-stamped Image; "Use Stamped Image" sameAsStamp checkbox.
  - Colors: Card (background + text color inputs), Background, Stamp Circle, Stamp color pickers (collapsible).
  - Tabs (all six validate+save before switching): Design, Details, Locations, Support, Data, Custom; Save button; Save & Preview; Activate button (only after save).
  - "Watch video tutorial: Designing your Card" link/modal.
- Validation observed: "Please upload an icon image.", "Please upload a logo image." block tab switching/saving.
- API: POST /campaign (on first save, 201), GET /campaign/exists/:name (name uniqueness), GET /campaigns.
- Screenshot: `03-edit-design.png`

## 11. Card Editor — Details
- URL: `/edit/:campaignId/details`
- Purpose: card copy and reward text.
- Features: Card description; "How your customers earn 1 stamp" (collectValue, required); Business Name; Reward Details: Reward Name, Description (rewardText, required), Stamp success message (must contain `{#}` placeholder), Reward success message; Expiry radios: None / Fixed date / Fixed period after signup; Useful Links table (Text, Link, Type=Url|Phone|Email|Address) with add/remove rows; live pass preview (front + back: LATEST UPDATES, HOW TO COLLECT STAMPS, REWARD DETAILS, STAMPS UNTIL NEXT REWARD, REWARDS EARNED, USEFUL LINKS, TERMS & CONDITIONS, contact block).
- Save flow: Save → "Save Card Design" modal asking internal card Name (immutable after save, alphanumerics + spaces) + QR preview ("Scan this QR code…", "Add to wallet") → POST /campaign.
- Screenshot: `04-edit-details.png`

## 12. Card Editor — Locations
- URL: `/edit/:campaignId/locations`
- Purpose: attach business locations and iBeacons to the card for lock-screen messages.
- Features: Locations table (Location, Address on Card, Display, Message) with Add Location; Beacons table (Beacon, Message) with Add Beacon.
  - Add New Location modal: Location Name; address search on Google Maps; Advanced: Address to display (textarea); Map/Satellite Google map; Create Location / Cancel.
  - Add New Beacon modal: Name, UUID, Major, Minor; Create Beacon / Cancel.
- Docs links: location-based messages.
- Screenshot: `04-edit-locations.png`

## 13. Card Editor — Support
- URL: `/edit/:campaignId/support`
- Purpose: terms and issuer contact info.
- Features: Terms & Conditions (Enabled toggle + textarea), Link to full terms and conditions (optional URL); Card Issuer Details: Business Name, Email, Phone.
- Screenshot: `04-edit-support.png`

## 14. Card Editor — Data
- URL: `/edit/:campaignId/data`
- Purpose: customer enrollment data collection + consent.
- Features: Data Collection — editable field rows (Description, Format = Text|Number|Date|Email|URL|Mobile/telephone number, Mandatory checkbox), add/remove fields (default First Name / Email / Mobile Number); default country select for phone fields (all countries); Unique Customer Enrollments toggle (prevent same customer enrolling twice via unique fields); Data Consent — landing-page consent text textarea, enable toggle, "checkbox checked by default" option; landing-page device preview (Join Now! flow).
- Screenshot: `04-edit-data.png`

## 15. Card Editor — Custom (Labels)
- URL: `/edit/:campaignId/labels`
- Purpose: custom fields + full label-text customization (subscription-gated).
- Features: Add Custom Fields table (Label, Field to Display = Stamps required until next reward | Number of total stamps collected | First Name | Email Address | Mobile Number), add/remove (`vm.checkSubscription()` gate); Card Labels table — remap ~20 default strings (STAMPS REQUIRED UNTIL NEXT REWARD, LATEST UPDATES, HOW TO COLLECT STAMPS, REWARD DETAILS, REWARDS EARNED, USEFUL LINKS, TERMS & CONDITIONS, contact heading, "Tap ⋯ for details", landing-page strings, "Join Now!", generation/thank-you strings, wallet strings); label-info modal; docs link.
- Screenshot: `04-edit-labels.png`

## 16. Card Overview
- URL: `/overview/:campaignId`
- Nav path: after activating a card / campaign switcher
- Purpose: operational home for a live card — stats, share link, stamping.
- Features: stat tiles — Customers Signed Up, Stamps Issued, Rewards Issued, Rewards Redeemed (with refresh); Latest Transactions table (Date and Time, Customer, Event, User; 10/25/50/100 page size, search, pagination); Export CSV button (upgrade-gated modal); Push Message History table (Date, Message, Segment, Reach); "Your Card URL:" short link (https://loyalty.is/…) with Copy link button; QR code for the card (add-to-Apple-Wallet/Android); tip links (save card, stamp customers' cards, promote card).
- API: GET /campaign/id/:id; POST /events/analytics/transactions/:id; GET /events/analytics/all/:id; GET /events/pushHistory/:id; GET /campaigns; GET /account.
- Screenshot: `07-overview.png`

## 17. Insights
- URL: `/insights/:campaignId`
- Purpose: revenue/ROI analytics for the program.
- Features: revenue summary ("Your program has driven $X revenue and cost $Y in rewards", claimed vs outstanding rewards, break-even statement); All-time stats tiles (Customers Signed Up, Stamps Issued, Rewards Issued, Rewards Redeemed, refresh); Currency select (large currency list), Stamp Value, per-reward Reward Cost inputs, Submit; Activity charts grouped by Day/Month with refresh; Stamp Count Histogram; Transactions table (same as overview).
- API: GET /campaign/id/:id; POST /events/analytics/transactions/:id; GET /events/analytics/all/:id; GET /events/analytics/stampTotals/:id; GET /events/analytics/rewardTotals/:id (derived).
- Screenshot: `07-insights.png`

## 18. Messages
- URL: `/messages/:campaignId`
- Purpose: push lock-screen / Latest Updates messages to card holders.
- Features: "Who?" — All of my customers / A segment of my customers radios; Message textarea (~90 char best practice, sample ideas listed); Send Message button (`vm.sendPush()`, opens push modal); Push Message History table (Date, Message, Segment, Reach). Sender identity ("ibefehdi", "Unlock for more") shown.
- API: POST /card/cid/:id (segment/card fetch); GET /events/pushHistory/:id; push send endpoint derived (/card/push).
- Screenshot: `07-messages.png`

## 19. Customers
- URL: `/customers/:campaignId`
- Purpose: card-holder list and management.
- Features: Customers table — First Name, Email Address, Mobile Number, Signup Date (y-m-d), Card Status, Stamps Earned, Rewards Earned, Rewards Redeemed; search, page size, pagination; Export CSV button (gated); row click → customer profile; remove-customer modal and per-customer push-message modal exist (templates `customers/remove/remove.modal.html`, `push-message-modal.html`).
- API: POST /card/cid/:id; GET /campaign/id/:id.
- Screenshot: `07-customers.png`

## 20. Customer Profile — UNVERIFIED (no customers on account)
- URL: `/customers/:campaignId/profile/:cardId`
- Purpose: single customer's card: stamp/reward history, issue stamp, redeem reward, remove, direct message. Template `customers/profile.html`.

## 21. Subusers
- URL: `/subusers`
- Nav path: sidebar "Subusers"
- Purpose: staff accounts that stamp/redeem and get attribution.
- Features: "Create Subuser" button + modal (Username prefixed `owner+`, Password ≥6 chars, Notes, Location select with link to Settings→Locations when none); Subusers table — Profile, Username, Created, Notes, Location, Status; search/pagination; delete-subuser modal; row → /subuser/:subuserId profile.
- API: GET /subusers; GET /account; GET /campaigns.
- Screenshot: `08-subusers.png`, `10-subuser-modal.png`

## 22. Subuser Profile — UNVERIFIED (no subusers on account)
- URL: `/subuser/:subuserId`. Template `subusers/subuser-profile.html`.

## 23. Settings
- URL: `/settings`
- Nav path: sidebar "Settings" / "Upgrade Now" banner
- Purpose: account, billing, locations, beacons, integrations.
- Sections (accordion with sub-tabs):
  - My Account → General (Username immutable, First Name, Last Name, Email + Update); Business (Business Name, Website, Address Line 1/2, City, Region, Zip, Country + Update); Privacy (Subscribed checkbox + consent text); Password (current/new/confirm, 8 chars + 1 number); Developer Tools (API Key + API Secret inputs, link to https://developer.loopyloyalty.com, Stamper App / POS / CRM integration blurb, support@loopyloyalty.com); Delete (exit-survey checkboxes, other-reason textarea, password confirmation, Delete button).
  - Billing → Plan (Starter US$25/mo: 1 card design, 1 location, 1 beacon, 3 subusers, label customisation, unique enrollments, data export; Growth US$69/mo: 3/3/3/10; Ultimate US$95/mo: 10/10/10/50; monthly/annual toggle; Subscribe buttons → subscribe-confirm modal; cancel/downgrade modals exist); Credit Card (Stripe card element iframe, billing address, mobile, Tax ID, Update Payment Details); Invoices (list, "You have no invoices." on trial).
  - Locations (account-level): Add Location modal (same as card-level), Google map.
  - Beacons (account-level): Add Beacon modal.
  - Zapier: integration section (invite/request flow).
- API: GET /account; GET /locations; GET /beacons; GET /campaigns. Updates via account/put endpoints (derived).
- Screenshots: `08-settings.png`

## 24. Invoice — UNVERIFIED (no invoices)
- URL: `/invoice/:invoiceId`. Template `settings/invoice/invoice.html`.

## 25. CSV Verify — UNVERIFIED (route-derived)
- URL: `/csv-verify/:file`. Post-csv-export verification step (template `overview/csv-verify.html`).

## 26. Customer Landing Page (public)
- URL: `/landing-page/:campaignId`
- Purpose: the public page customers visit to join the program.
- Features: card description, "Please enter your details" form (First Name*, Email Address*, Mobile Number* with intl-tel-input), Terms & Conditions text + agreement checkbox, "Join Now!" button; "powered by Loopy Loyalty" footer.
- API: POST /campaign/public/... (derived).
- Screenshot: `07-landing-page.png`

## 27. Stamp Page (public stamper web app)
- URL: `/stamp`
- Purpose: staff stamper — enter/scan a card ID to issue a stamp.
- Features: Card ID input, "Stamp Card!" button. (The dedicated iOS/Android Stamper App is the primary stamping tool; docs linked from Help.)
- Screenshot: `08-stamp.png`

## 28. 404
- URL: any unknown path → redirects to `/manage-my-cards` (otherwise rule); template `app/core/404.html` exists.

---

## Entity model (as connected through the UI)

- Account (merchant) → has plan (Starter/Growth/Ultimate, limits: card designs, locations, beacons, subusers), business info, billing, API key/secret, locations, beacons, subusers.
- Campaign (card) → design (type, images, stamps 1–25, colors), details (description, earn rule, rewards[] with name/text/lockscreen messages, expiry, links), locations[] + beacons[] (lock-screen messages), support (terms, issuer), data collection fields[] + consent + unique-enrollment, custom fields[] + labels{}. Status: DRAFT → (Activate, requires verified email) → LIVE; deletable.
- Customer enrolls via landing page (data fields) → gets a card (Card ID) in Apple Wallet / Google Wallet via pass (loyalty.is short link / QR). Stamps issued by owner/subuser via Stamper App or /stamp; rewards earned at threshold, then redeemed. Events feed Overview/Insights tables. Messages push to all or a segment of card holders.

## API endpoints (api.loopyloyalty.com)

Observed live:
- POST /account/login
- GET /account (called on nearly every page/state change)
- GET /campaigns
- GET /campaign/exists/:name
- POST /campaign
- GET /campaign/id/:id
- POST /events/analytics/transactions/:campaignId
- GET /events/analytics/all/:campaignId
- GET /events/analytics/stampTotals/:campaignId
- GET /events/pushHistory/:campaignId
- POST /card/cid/:campaignId
- GET /subusers
- GET /locations
- GET /beacons

Present in app source (endpoint strings; exact verbs UNVERIFIED): /campaign/public/, /card/push, /images/stampTemplates, /images/stampImage/, /account/cardIntent/, /location/, /beacon/, /subuser/, /push, /intercom/message/, /api/people, /events/analytics/rewardTotals/, signup/reset/verify endpoints.

Third-party integrations observed: Stripe (billing), Google Maps (location pickers), Intercom (support widget), Cloudflare Turnstile, Google Analytics/Tag Manager, Facebook Pixel, Microsoft Clarity, Tapfiliate, ProfitWell, Vimeo (tutorials), YouTube (video academy).
