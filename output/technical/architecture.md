# Loopy Loyalty — Technical Architecture

Generated: 2026-10-17 by linker (Hermes Agent)
Source: Live exploration of https://app.loopyloyalty.com via Playwright
Account: ibefehdi (trial, 15 days remaining, email unverified)
Test campaign: COUNCIL TEST (id wI4XeFr6rHCTUHGOEFazZ, draft status)

## 1. Platform and Stack

### Frontend

| Layer | Technology | Version | Evidence |
|-------|-----------|---------|----------|
| Framework | AngularJS | 1.5.11 ("princely-quest") | `angular.version.full` via browser_evaluate |
| DOM library | jQuery | 2.2.4 | `$.fn.jquery` via browser_evaluate |
| Routing | ui-router (AngularJS) | (bundled in app.js) | SPA states: container.*, edit.*, campaign.*, auth.*, public.* |
| App module | `app` | — | `document.querySelector('[ng-app]').getAttribute('ng-app')` |
| Bundling | Grunt/gulp + fingerprinting | — | Scripts: `lib-2353771e22.js`, `app-21db9b2f00.js` |
| Config | `/config/environment.js` | — | Loaded as script, contains API base URL and feature flags |

### Authentication

| Mechanism | Detail | Evidence |
|-----------|--------|----------|
| Token | JWT (HMAC-SHA256) | `sessionStorage.jwt` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| Storage | sessionStorage | Keys: jwt, username, email, uid, plan, status, business, expiryDate, trialDuration, limit, ihash |
| Transport | Bearer auth header (inferred) | Not in cookies; session-only |
| Session check | GET /account called on every page load (2-3x) | Observed on all 17 pages visited |
| Cookie auth | None observed for API | Cookies are only GA/Clarity/Facebook/Stripe |

### Routing

The app uses AngularJS ui-router with these state groups:

- `auth`: /login, /renew-subscription, /verify/:code, /forgot-password, /reset-password/:username/:code
- `signup_setup`: /signup, /get-started, /setup, /account
- `public`: /landing-page/:campaignId, /stamp (no auth via /account called on /stamp)
- `container`: /dash, /help, /manage-my-cards, /settings, /subusers, /subuser/:subuserId, /invoice/:invoiceId, /csv-verify/:file, /404
- `edit`: /edit/:campaignId/design, /edit/:campaignId/details, /edit/:campaignId/locations, /edit/:campaignId/data, /edit/:campaignId/labels, /edit/:campaignId/support
- `campaign`: /customers/:campaignId, /customers/:campaignId/profile/:cardId, /insights/:campaignId, /messages/:campaignId, /overview/:campaignId

Navigation is SPA (no full page reloads between states). State transitions trigger GET /account + GET /campaigns (warmup), then page-specific API calls.

### Local Storage

| Key | Value (truncated) | Purpose |
|-----|-------------------|---------|
| lastExternalReferrer | "empty" | Referrer tracking |
| zapier.visitor_id | "1470cbf8-..." | Zapier embed tracking |
| lastExternalReferrerTime | timestamp | Referrer timing |

### Session Storage

| Key | Value (truncated) | Purpose |
|-----|-------------------|---------|
| jwt | eyJhbGciOiJIUzI1NiIs... | Auth token |
| uid | 6jhXelWqeUcUHqzDWYIx6R | User ID |
| username | ibefehdi | Username |
| email | ibefehdi@gmail.com | User email |
| plan | trial | Current plan |
| status | setup | Account status |
| business | ibefehdi | Business name |
| expiryDate | 2026-11-01T06:04:26... | Trial/plan expiry |
| trialDuration | 15 | Trial days |
| limit | 1 | Card design limit |
| ihash | 7652cd35bbd3c... | Integrity hash |
| dateJoined | 2026-10-17T06:04:42... | Account creation |
| pkadmin | false | PassKit admin flag |
| templateOrganisation | "ibefehdi" | Template org name |

### Real-time / Push

No WebSocket or SSE connections observed. The app is purely request-response. Push messages to customer wallets go through Apple Wallet / Google Wallet via PassKit, not through the browser.

---

## 2. API Hosts and Catalogue

### API Base

- **Loopy Loyalty API**: `https://api.loopyloyalty.com` — REST/JSON, no version prefix observed
- **Response format**: JSON, some CouchDB-style (`_offset`, `total_rows`, `rows[].value`)
- **Auth**: JWT Bearer (inferred from sessionStorage pattern; actual header not captured)

### Complete API Endpoint Table

| # | Method | Path (normalized) | API Style | Purpose | Pages That Call It | Key Request Params | Key Response Fields | Status |
|---|--------|------------------|-----------|---------|-------------------|--------------------|--------------------|--------|
| 1 | GET | /account | REST | User account + auth check | ALL authenticated pages (2-3x per load) | (none) | id, username, email, firstName, lastName, plan, status, limit, expiry, secret, business{name,website,email,...}, businessBilling{...}, trialDuration, subscribed, stripeInformation, discounts | 200 |
| 2 | GET | /campaigns | REST (CouchDB) | List all campaigns | /manage-my-cards, all editor tabs, all campaign views, /dash, /help, /settings, /subusers | (none) | _offset, total_rows, rows[].value{id, name, design{iconImageId,logoImageId,backgroundColor,textColor}, status, createTime, updateTime, stampsRequiredForNextRewardReplacement, customFrontFields[]} | 200 |
| 3 | GET | /campaign/id/:campaignId | REST | Single campaign detail | /overview/:id, /insights/:id, /messages/:id, /customers/:id, /manage-my-cards (preview) | campaignId (path) | id, uid, name, shortCode, description, organisationName, type, object, rewards[], package{}, links[], collectValue, currency, expiry{}, fieldsToCollect[], pkCampaignName, pkTemplateName, status, createTime, updateTime, design{iconImageId,logoImageId,backgroundColor,textColor}, baseStripImage{width,height,padding,totalStamps,stampImage,unstampImage,...}, terms, disableTerms, stampsRequiredForNextRewardReplacement, customFrontFields[], business{name,website,email,aupCheckProcessed}, consentEnabled, consentText, consentCheckboxEnabled, isNFCEnabled | 200 |
| 4 | GET | /campaign/public/:campaignId | REST (public) | Landing page campaign data (no auth) | /landing-page/:id | campaignId (path) | id, business{name,website,email,...}, description, design{iconImageId,logoImageId,backgroundColor,textColor}, disableTerms, fieldsToCollect[], consentEnabled, consentCheckboxEnabled, consentText, labels, rewards[], terms, uniqueEmailFieldName, uniquePhoneFieldName, uniqueTextFieldName, defaultCountryCode | 200 |
| 5 | GET | /locations | REST | List global locations | /settings, /edit/:id/locations | (none) | (not captured in body; list of location objects) | 200 |
| 6 | GET | /beacons | REST | List global beacons | /settings, /edit/:id/locations | (none) | (not captured in body; list of beacon objects) | 200 |
| 7 | GET | /subusers | REST | List subusers | /subusers | (none) | Table columns: Profile, Username, Created, Notes, Location, Status | 200 |
| 8 | GET | /events/dashboard | REST | Account-level dashboard analytics | /dash | ?groupBy=day|month|year | enrol{"YYYY-MM-DD": count}, stamp{"YYYY-MM-DD": count} | 200 |
| 9 | GET | /events/analytics/all/:campaignId | REST | Campaign-level analytics | /overview/:id, /insights/:id | campaignId (path), ?groupBy=day|undefined | enrol{"YYYY-MM-DD": count}, stamp{"YYYY-MM-DD": count} | 200 |
| 10 | GET | /events/analytics/stampTotals/:campaignId | REST | Stamp totals per campaign | /insights/:id | campaignId (path) | (not captured) | 200 |
| 11 | POST | /events/analytics/transactions/:campaignId | REST | Recent transactions list | /overview/:id, /insights/:id | campaignId (path), request body (DataTables-style) | draw, recordsTotal, recordsFiltered, data[{id, uuid, card_id, username, type, quantity, location_name, reward_name, s_lat, s_lon, ip, ua, referrer, created}] | 200 |
| 12 | GET | /events/pushHistory/:campaignId | REST | Push message history | /overview/:id, /messages/:id | campaignId (path) | events[] (empty for draft campaign) | 200 |
| 13 | POST | /card/cid/:campaignId | REST | Customer list or count | /customers/:id (?count=false), /messages/:id (?count=true) | campaignId (path), ?count=true|false, request body (DataTables) | (customer list with count=false, count number with count=true) | 200 |
| 14 | GET | /card/:cardId | REST | Single customer card | /customers/:id/profile/:cardId | cardId (path), ?includeEvents=true|false | (card detail with events) | 200 |
| 15 | POST | /card/cid/:cardId/addStamps/:count | REST | Stamp a customer card | /stamp (broken), /customers/:id/profile/:cardId (Give Stamps tab) | cardId (path), count (path) | — | 200 (profile tab), 500 (/stamp with undefined) |
| 16 | POST | /location | REST | Create location | /settings | (location fields) | 201 Created | 201 |
| 17 | POST | /beacon | REST | Create beacon | /settings | (beacon fields) | 201 Created | 201 |
| 18 | PATCH | /campaign/:campaignId | REST | Update campaign fields | /insights/:id (revenue inputs) | campaignId (path), stampValue, rewards[].cost | — | 200 |
| 19 | GET | /images/stampTemplates | REST | Stamp template images | /help, /edit/:id/design | (none) | (image template list) | 200 |
| 20 | GET | /images | REST | Render dynamic stamp strip image | /dash, /manage-my-cards | ?json={baseStripImage params} | PNG/SVG image | 200 |

### API Style Notes

- REST/JSON throughout, no GraphQL
- CouchDB-style pagination on /campaigns: `_offset`, `total_rows`, `rows[].value`
- DataTables-style on /events/analytics/transactions and /card/cid/: `draw`, `recordsTotal`, `recordsFiltered`, `data[]`
- No API version prefix (e.g., /v1/) observed
- No rate limiting headers observed in responses

### Third-Party API Hosts

| Host | Service | Pages |
|------|---------|-------|
| js.stripe.com, api.stripe.com, m.stripe.com, r.stripe.com, merchant-ui-api.stripe.com | Stripe (payments) | /settings, all pages (m.stripe.com/6 beacon) |
| maps.googleapis.com | Google Maps | /settings (location picker), all pages (gen_204 probe) |
| api.zapier.com | Zapier integration gallery | /settings |
| api.hcaptcha.com | hCaptcha (Stripe anti-fraud) | /settings |
| player.vimeo.com | Vimeo tutorial videos | /dash |
| client-f.passkit.net | PassKit (wallet pass SDK) | /landing-page/:id, all pages (intl-tel-input) |
| widget.intercom.io | Intercom (support chat) | All pages |
| connect.facebook.net | Facebook Pixel | All pages |
| www.googletagmanager.com, www.google-analytics.com | Google Analytics + GTM | All pages |
| www.clarity.ms, *.clarity.ms | Microsoft Clarity (heatmaps) | All pages |
| public.profitwell.com | ProfitWell (subscription analytics) | All pages |
| script.tapfiliate.com | Tapfiliate (affiliate tracking) | All pages |
| www.youtube.com | YouTube (tutorial embeds) | All pages |
| s3.amazonaws.com (passkit-api-core-production) | PassKit image CDN | /dash, /manage-my-cards |

---

## 3. Data Model

### Entity Definitions

#### Account (User)
Observed from GET /account response body.
```
Account {
  id: string              // "6jhXelWqeUcUHqzDWYIx6R"
  username: string         // "ibefehdi"
  email: string            // "ibefehdi@gmail.com"
  firstName: string        // "Fahad"
  lastName: string         // "Asad"
  plan: string             // "trial" | "starter" | "growth" | "ultimate"
  status: string           // "setup" | "active"
  limit: number            // card design limit (1 for trial)
  expiry: string           // ISO 8601 date
  trialDuration: number    // 15
  subscribed: boolean      // false
  secret: string           // API secret key
  intercomId: string       // Intercom chat ID
  ref: string              // referral code
  business: BusinessInfo
  businessBilling: BusinessInfo
  stripeInformation: object
  discounts: array
  MailSubscriptions: null | object
}

BusinessInfo {
  name: string             // "ibefehdi"
  website: string          // "https://ibefehdi.com"
  email: string            // ""
  phone: string            // ""
  addressLine1: string     // ""
  country: string          // ""
  taxId: string            // ""
  AupCheckProcessed: boolean
  AupCheckFailed: boolean
}
```

#### Campaign (Card Design)
Observed from GET /campaign/id/:id and GET /campaigns.
```
Campaign {
  id: string               // "wI4XeFr6rHCTUHGOEFazZ" (Firestore-style ID)
  uid: string              // owner account ID
  name: string             // "COUNCIL TEST"
  shortCode: string        // ""
  description: string      // card description text
  organisationName: string // "COUNCIL-TEST Business"
  type: string             // "single" | "multi"
  object: string           // "campaign"
  status: number           // 1 = draft, 2 = active
  createTime: string       // ISO 8601
  updateTime: string       // ISO 8601
  pkCampaignName: string   // PassKit campaign name
  pkTemplateName: string   // PassKit template name
  collectValue: string     // "COUNCIL-TEST: get 1 stamp per visit"
  currency: string         // "$"
  isNFCEnabled: boolean    // false
  stampsRequiredForNextRewardReplacement: string // "stampsRequiredForNextReward"
  design: CardDesign
  baseStripImage: StampStrip
  rewards: Reward[]
  links: UsefulLink[]
  fieldsToCollect: DataField[]
  customFrontFields: CustomField[]
  expiry: ExpiryConfig
  package: object          // {} (empty for single-reward)
  terms: string            // T&C text
  disableTerms: boolean    // false
  business: CampaignBusinessInfo
  consentEnabled: boolean
  consentText: string
  consentCheckboxEnabled: boolean
}

CardDesign {
  iconImageId: string      // "ll-icons/8cd4931b..."
  logoImageId: string      // "ll-logos/4d94d927..."
  backgroundColor: string  // "#5c4da0"
  textColor: string        // "#ffffff"
}

StampStrip {
  width: number            // 1125
  height: number           // 432
  padding: number          // 40
  totalStamps: number      // 10
  stampImage: string       // "bagel" (template name)
  unstampImage: string     // "bagel"
  stampImageURL: string    // S3 URL
  unstampImageURL: string  // S3 URL
  backgroundColor: string  // "#401A6B"
  backgroundOpacity: number
  stampColor: string       // "#FFFFFF"
  stampOpacity: number
  unstampColor: string     // "#FFFFFF"
  unstampOpacity: number   // 0.25
  placeholders: boolean
  placeholderColor: string
  placeholderOpacity: number
  placeholderBorderColor: string
  placeholderBorderOpacity: number
  rewardsPlaceholders: boolean
  rewardBorderColor: string
  rewardBorderOpacity: number
  rewardBackgroundColor: string
  rewardBackgroundOpacity: number
  rewardPositions: number  // 0
  stampedStatus: number    // 3
  imageType: string        // "svg"
}

Reward {
  rewardName: string       // "COUNCIL-TEST reward"
  rewardText: string       // "COUNCIL-TEST: free item after 8 stamps"
  stampsRequired: number   // 10
  stampLockscreenMessage: string // "Only {#} more stamps until your reward!"
  rewardLockscreenMessage: string // "Come get your COUNCIL-TEST reward!"
}

UsefulLink {
  description: string      // "Visit our website"
  href: string             // "https://loopyloyalty.com"
  type: number             // 0=Url, 1=Phone, 2=Email, 3=Address
}

DataField {
  name: string             // "First Name" | "Email Address" | "Mobile Number"
  type: string             // "text" | "email" | "tel"
  required: boolean
}

CustomField {
  label: string            // "STAMPS REQUIRED UNTIL NEXT REWARD"
  fieldToDisplay: string   // "stampsRequiredForNextReward"
}

ExpiryConfig {
  noExpiry: boolean        // true (one of: noExpiry, fixedDate, fixedPeriod)
}

CampaignBusinessInfo {
  name: string             // "ibefehdi"
  website: string          // "https://ibefehdi.com"
  email: string            // "ibefehdi@gmail.com"
  aupCheckProcessed: boolean
}
```

#### Card (Customer Enrollment)
Observed from GET /card/:cardId?includeEvents=true.
```
Card {
  id: string               // "xZuG0J01d5TGR2" (PassKit-style ID)
  campaignId: string       // foreign key to Campaign
  firstName: string        // "COUNCIL TEST Alice"
  email: string            // "council-test+alice@example.com"
  mobile: string           // "+12025550123"
  signupDate: string       // ISO 8601
  status: string           // "issued"
  stampsEarned: number     // 1 (after cartographer's stamp)
  rewardsEarned: number    // 0
  rewardsRedeemed: number  // 0
  events: Event[]          // when includeEvents=true
}
```

#### Event (Transaction)
Observed from POST /events/analytics/transactions.
```
Event {
  id: number               // 77922858 (auto-increment)
  uuid: string             // "dafecd39-94f2-44a6-8fed-9cad02149e50"
  card_id: string          // "xZuG0J01d5TGR2" (FK to Card)
  username: string         // "ibefehdi" (who performed action)
  type: number             // 0 = enroll, 1 = stamp, 2 = reward issue, 3 = reward redeem
  quantity: number         // 1
  location_name: string    // ""
  reward_name: string      // ""
  s_lat: number | null     // latitude
  s_lon: number | null     // longitude
  ip: string               // "37.34.170.194"
  ua: string               // user agent
  referrer: string         // "https://app.loopyloyalty.com/"
  created: string          // ISO 8601
}
```

#### Location
Observed from GET /locations. Created via POST /location.
```
Location {
  id: string
  name: string             // "COUNCIL TEST Location"
  address: string          // "221B Baker St, London NW1 6XE"
  latitude: number         // 22.287614
  longitude: number        // 114.148313
  message: string          // lock-screen message (optional)
}
```

#### Beacon
Observed from GET /beacons. Created via POST /beacon.
```
Beacon {
  id: string
  name: string             // "COUNCIL TEST Beacon"
  uuid: string             // "F7826DA6-4FA2-4E98-8024-BC5B71E0893E"
  major: number            // 1
  minor: number            // 1
  message: string          // lock-screen message
}
```

#### Subuser
Observed from GET /subusers.
```
Subuser {
  id: string
  profile: string          // image/profile
  username: string
  created: string          // ISO 8601
  notes: string
  location: string         // assigned location
  status: string           // active/inactive
}
```

#### Push Message
Observed from GET /events/pushHistory.
```
PushMessage {
  date: string
  message: string
  segment: string          // "All customers" or segment name
  reach: number            // customers reached
}
```

### Entity Relationship Diagram

```mermaid
erDiagram
    Account ||--o{ Campaign : owns
    Account ||--o{ Subuser : manages
    Account ||--o{ Location : "owns (global)"
    Account ||--o{ Beacon : "owns (global)"
    Campaign ||--o{ Card : "has enrollments"
    Campaign ||--o{ Event : generates
    Campaign ||--o{ PushMessage : sends
    Campaign ||--o{ Reward : defines
    Campaign }o--o{ Location : "assigns (per-card)"
    Campaign }o--o{ Beacon : "assigns (per-card)"
    Campaign ||--o{ UsefulLink : has
    Campaign ||--o{ DataField : "collects via"
    Campaign ||--o{ CustomField : defines
    Campaign ||--|| StampStrip : "has design"
    Campaign ||--|| CardDesign : "has design"
    Card ||--o{ Event : "generates (enroll, stamp, reward)"
    Card ||--|| "PassKit Pass" : "backed by"

    Account {
        string id PK
        string username
        string email
        string plan
        string status
        number limit
    }
    Campaign {
        string id PK
        string uid FK
        string name
        string type
        number status
        string description
    }
    Card {
        string id PK
        string campaignId FK
        string firstName
        string email
        string mobile
        string status
        number stampsEarned
        number rewardsEarned
        number rewardsRedeemed
    }
    Event {
        number id PK
        string uuid
        string card_id FK
        number type
        number quantity
        string created
    }
    Reward {
        string rewardName
        string rewardText
        number stampsRequired
    }
    Location {
        string id PK
        string name
        string address
        number latitude
        number longitude
    }
    Beacon {
        string id PK
        string name
        string uuid
        number major
        number minor
    }
    Subuser {
        string id PK
        string username
        string location
        string status
    }
```

### Class Diagram

```mermaid
classDiagram
    class Account {
        +String id
        +String username
        +String email
        +String firstName
        +String lastName
        +String plan
        +String status
        +Number limit
        +String expiry
        +String secret
        +BusinessInfo business
        +BusinessInfo businessBilling
    }
    class Campaign {
        +String id
        +String name
        +String description
        +String type
        +Number status
        +CardDesign design
        +StampStrip baseStripImage
        +Reward[] rewards
        +UsefulLink[] links
        +DataField[] fieldsToCollect
        +CustomField[] customFrontFields
        +ExpiryConfig expiry
        +String terms
    }
    class CardDesign {
        +String iconImageId
        +String logoImageId
        +String backgroundColor
        +String textColor
    }
    class StampStrip {
        +Number width
        +Number height
        +Number totalStamps
        +String stampImage
        +String unstampImage
        +String backgroundColor
        +String stampColor
    }
    class Reward {
        +String rewardName
        +String rewardText
        +Number stampsRequired
        +String stampLockscreenMessage
        +String rewardLockscreenMessage
    }
    class UsefulLink {
        +String description
        +String href
        +Number type
    }
    class DataField {
        +String name
        +String type
        +Boolean required
    }
    class CustomField {
        +String label
        +String fieldToDisplay
    }
    class Card {
        +String id
        +String firstName
        +String email
        +String mobile
        +String status
        +Number stampsEarned
        +Number rewardsEarned
        +Number rewardsRedeemed
    }
    class Event {
        +Number id
        +String uuid
        +String card_id
        +Number type
        +Number quantity
        +String created
    }
    class Location {
        +String id
        +String name
        +String address
        +Number latitude
        +Number longitude
    }
    class Beacon {
        +String id
        +String name
        +String uuid
        +Number major
        +Number minor
    }
    class Subuser {
        +String id
        +String username
        +String created
        +String notes
        +String location
        +String status
    }

    Account "1" --> "*" Campaign : owns
    Account "1" --> "*" Subuser : manages
    Account "1" --> "*" Location : owns
    Account "1" --> "*" Beacon : owns
    Campaign "1" --> "*" Card : enrolls
    Campaign "1" --> "*" Reward : defines
    Campaign "1" --> "*" UsefulLink : has
    Campaign "1" --> "*" DataField : collects
    Campaign "1" --> "1" CardDesign : has
    Campaign "1" --> "1" StampStrip : has
    Campaign "*" --> "*" Location : assigns
    Campaign "*" --> "*" Beacon : assigns
    Card "1" --> "*" Event : generates
```

---

## 4. Page Connectivity

### Per-Page API Map

Every page was visited live and network requests captured. Evidence from browser_network_requests.

#### /manage-my-cards — My Cards
- **Reached from**: bottom nav My Cards icon, top-bar logo, Create New Card redirect
- **API calls**: GET /account, GET /campaigns, GET /campaign/id/:id (per card preview)
- **Entities**: Account, Campaign
- **Outgoing links**: MANAGE -> /edit/:id/design, DELETE -> (removes campaign), + button -> /help, top nav: /dash, /help, /settings (also /subusers but premium-gated)

#### /dash — Insights (Account-level)
- **Reached from**: bottom nav Dashboard icon, top-bar
- **API calls**: GET /account (x2), GET /campaigns, GET /events/dashboard?groupBy=day
- **Entities**: Account, Campaign (aggregated), Event (aggregated)
- **Outgoing links**: bottom nav: /manage-my-cards, /help, /settings (subusers premium-gated)
- **Note**: Uses /events/dashboard (NOT /events/analytics/all — different endpoint from campaign views)

#### /help — Start / Templates
- **Reached from**: bottom nav Start icon, + button on /manage-my-cards
- **API calls**: GET /account (x2), GET /campaigns
- **Entities**: Account, Campaign (template metadata)
- **Outgoing links**: template click -> /edit/new/design, resources: docs.loopyloyalty.com, Stamper App

#### /settings — Settings
- **Reached from**: bottom nav Settings icon, Upgrade Now link
- **API calls**: GET /account (x2), GET /campaigns, GET /locations, GET /beacons
- **Entities**: Account, Location, Beacon
- **Third-party**: Stripe (js.stripe.com, api.stripe.com, m.stripe.com), Zapier (api.zapier.com), Google Maps (maps.googleapis.com), hCaptcha
- **Sub-sections**: My Account (General, Business, Privacy, Password, Developer Tools, Delete), Billing (Plan, Credit Card, Invoices), Locations, Beacons, Zapier
- **Outgoing links**: Developer Tools -> API key/secret display, Billing -> Stripe Elements, Locations -> Google Maps picker

#### /edit/:campaignId/design — Card Editor: Design
- **Reached from**: MANAGE button on /manage-my-cards, Create New Card, editor tab
- **API calls**: GET /account, GET /campaigns
- **Entities**: Campaign, CardDesign, StampStrip, Reward
- **Outgoing links**: editor tabs: Details, Locations, Support, Data, Custom; Save/Save & Preview buttons; bottom campaign nav: Overview, Insights, Messages, Customers, Edit
- **Note**: JS error observed on load ("Cannot read properties of undefined (reading 'backgroundColor')") — suspect this is related to the draft campaign's baseStripImage

#### /edit/:campaignId/details — Card Editor: Details
- **Reached from**: editor tab "Details"
- **API calls**: GET /account, GET /campaigns
- **Entities**: Campaign (description, collectValue, business, links, expiry), Reward
- **Form fields**: Card description, How to earn stamps, Business Name, Reward Name, Description, Stamp success message ({#} placeholder), Reward success message, Expiry (None/Fixed date/Fixed period), Useful Links table (Text, Link, Type dropdown: Url/Phone/Email/Address)
- **Outgoing links**: Save/Save & Preview, customer preview (right pane), editor tabs

#### /edit/:campaignId/locations — Card Editor: Locations
- **Reached from**: editor tab "Locations"
- **API calls**: GET /account, GET /campaigns, GET /locations, GET /beacons
- **Entities**: Campaign, Location, Beacon
- **Tables**: Locations (Location, Address on Card, Display, Message), Beacons (Beacon, Message)
- **Outgoing links**: editor tabs, Save, campaign nav

#### /edit/:campaignId/support — Card Editor: Support
- **Reached from**: editor tab "Support"
- **API calls**: GET /account, GET /campaigns
- **Entities**: Campaign (terms, disableTerms), Account (business)
- **Form**: T&C enabled checkbox + textarea, external T&C link, Card Issuer: Business name/email/phone
- **Outgoing links**: editor tabs, Save

#### /edit/:campaignId/data — Card Editor: Data
- **Reached from**: editor tab "Data"
- **API calls**: GET /account, GET /campaigns
- **Entities**: Campaign (fieldsToCollect, consentEnabled, consentText, consentCheckboxEnabled)
- **Fields**: Data Collection table (Description/Format/Mandatory), Default country, Unique Enrollments (premium), Data Consent, Enrollment preview
- **Outgoing links**: editor tabs, Save

#### /edit/:campaignId/labels — Card Editor: Custom / Labels
- **Reached from**: editor tab "Custom" (marked with premium icon )
- **API calls**: GET /account, GET /campaigns
- **Entities**: Campaign (customFrontFields, labels)
- **Tables**: Add Custom Fields (Label -> Field to Display), Card Labels (~19 preset labels with text overrides)
- **Outgoing links**: editor tabs, Save

#### /overview/:campaignId — Campaign Overview
- **Reached from**: campaign bottom nav "Overview" (available even for drafts)
- **API calls**: GET /account, GET /campaigns, GET /campaign/id/:id, POST /events/analytics/transactions/:id, GET /events/analytics/all/:id?groupBy=undefined, GET /events/pushHistory/:id
- **Entities**: Campaign, Event, PushMessage
- **KPIs**: Customers Signed Up, Stamps Issued, Rewards Issued, Rewards Redeemed
- **Tables**: Latest Transactions (Date/Time, Customer, Event, User; paginated + search), Push Message History (Date, Message, Segment, Reach)
- **Outgoing links**: Card URL (loyalty.is link + QR), campaign nav: Insights, Messages, Customers, Edit

#### /insights/:campaignId — Campaign Insights
- **Reached from**: campaign bottom nav "Insights"
- **API calls**: GET /account, GET /campaigns, GET /campaign/id/:id, POST /events/analytics/transactions/:id, GET /events/analytics/all/:id?groupBy=day, GET /events/analytics/stampTotals/:id
- **Entities**: Campaign, Event, Reward
- **Features**: Revenue/cost summary, All-time stats, Currency selector, Revenue inputs (Stamp Value, Reward Cost -> PATCH /campaign/:id)
- **Outgoing links**: campaign nav

#### /messages/:campaignId — Messages
- **Reached from**: campaign bottom nav "Messages"
- **API calls**: GET /account, GET /campaigns, GET /campaign/id/:id, POST /card/cid/:id?count=true, GET /events/pushHistory/:id
- **Entities**: Campaign, Card (count), PushMessage
- **Features**: Audience selector (All customers / A segment), Message composer (~90 char best practice), Send Message button (no draft), Push history table
- **Outgoing links**: campaign nav

#### /customers/:campaignId — Customers
- **Reached from**: campaign bottom nav "Customers"
- **API calls**: GET /account, GET /campaigns, GET /campaign/id/:id, POST /card/cid/:id?count=false
- **Entities**: Campaign, Card
- **Table**: First Name, Email, Mobile, Signup Date, Card Status, Stamps/Rewards Earned/Redeemed; pagination + search
- **Outgoing links**: row click -> /customers/:campaignId/profile/:cardId, campaign nav

#### /customers/:campaignId/profile/:cardId — Customer Profile
- **Reached from**: customer row click on /customers/:id
- **API calls**: GET /account, GET /campaigns, GET /campaign/id/:id, GET /card/:cardId?includeEvents=true
- **Entities**: Card, Event
- **Features**: Customer detail, Give Stamps tab (POST /card/cid/:cardId/addStamps/:count), transaction history
- **Outgoing links**: back to /customers/:id, campaign nav

#### /subusers — Subusers
- **Reached from**: bottom nav Subusers icon (premium-gated on trial)
- **API calls**: GET /account, GET /campaigns, GET /subusers
- **Entities**: Subuser
- **Table**: Profile, Username, Created, Notes, Location, Status; pagination + search
- **Outgoing links**: Create Subuser modal, row -> /subuser/:subuserId (UNVERIFIED), bottom nav
- **Note**: Accessible on trial (page loads) but premium feature for creating/count beyond plan limits

#### /landing-page/:campaignId — Customer Enrollment (Public)
- **Reached from**: loyalty.is share URL, QR code
- **API calls**: GET /campaign/public/:id (NO auth — no /account call)
- **Entities**: Campaign (public subset), Card (created on submit)
- **Form**: Fields per Data tab config, T&C checkbox, Join Now! button
- **Outgoing links**: enrollment success -> PassKit wallet pass redirect

#### /stamp — Stamp Tool (Staff)
- **Reached from**: direct URL, staff tool
- **API calls**: NONE (no Loopy API calls observed on page load — only GA/Clarity beacons)
- **Entities**: Card (lookup on submit)
- **Form**: Card ID input, Stamp Card! button (POST /card/cid/:cardId/addStamps/undefined -> 500 for drafts)
- **Outgoing links**: none
- **Note**: Standalone page, no auth check, no navigation chrome

### Full Adjacency Table

| From Page | To Page | Trigger | Type |
|-----------|---------|---------|------|
| /manage-my-cards | /edit/:id/design | MANAGE button | navigate |
| /manage-my-cards | /help | + (Create New Card) button | navigate |
| /manage-my-cards | /settings | Upgrade Now link | navigate |
| /manage-my-cards | /dash | bottom nav Dashboard | navigate |
| /manage-my-cards | /help | bottom nav Start | navigate |
| /manage-my-cards | /settings | bottom nav Settings | navigate |
| /manage-my-cards | /subusers | bottom nav Subusers | navigate (premium gated) |
| /dash | /manage-my-cards | bottom nav My Cards | navigate |
| /dash | /help | bottom nav Start | navigate |
| /dash | /settings | bottom nav Settings | navigate |
| /help | /edit/new/design | template selection | navigate |
| /help | /manage-my-cards | bottom nav My Cards | navigate |
| /help | http://docs.loopyloyalty.com/ | Resources link | external |
| /settings | /manage-my-cards | bottom nav My Cards | navigate |
| /edit/:id/design | /edit/:id/details | editor tab | navigate |
| /edit/:id/design | /edit/:id/locations | editor tab | navigate |
| /edit/:id/design | /edit/:id/support | editor tab | navigate |
| /edit/:id/design | /edit/:id/data | editor tab | navigate |
| /edit/:id/design | /edit/:id/labels | editor tab | navigate |
| /edit/:id/design | /overview/:id | campaign bottom nav | navigate |
| /edit/:id/design | /insights/:id | campaign bottom nav | navigate |
| /edit/:id/design | /messages/:id | campaign bottom nav | navigate |
| /edit/:id/design | /customers/:id | campaign bottom nav | navigate |
| /edit/:id/design | /manage-my-cards | top-bar My Cards | navigate |
| /edit/:id/* | /edit/:id/* | any editor tab | navigate |
| /overview/:id | /insights/:id | campaign bottom nav | navigate |
| /overview/:id | /messages/:id | campaign bottom nav | navigate |
| /overview/:id | /customers/:id | campaign bottom nav | navigate |
| /overview/:id | /edit/:id/labels | campaign bottom nav Edit | navigate |
| /customers/:id | /customers/:id/profile/:cardId | customer row click | navigate |
| /customers/:id/profile/:cardId | /customers/:id | back navigation | navigate |
| /subusers | /subuser/:subuserId | subuser row click | navigate (UNVERIFIED) |
| /landing-page/:id | (PassKit wallet URL) | Join Now! submit | redirect |

### Navigation Flowchart

```mermaid
flowchart TD
    subgraph "Top-Level Navigation (bottom nav)"
        MC["/manage-my-cards<br/>My Cards"]
        DSH["/dash<br/>Insights"]
        SUB["/subusers<br/>Subusers<br/>(premium gated)"]
        HLP["/help<br/>Start (Templates)"]
        SET["/settings<br/>Settings"]
    end

    subgraph "Card Editor (top tabs)"
        DSGN["/edit/{id}/design<br/>Design"]
        DET["/edit/{id}/details<br/>Details"]
        LOC["/edit/{id}/locations<br/>Locations"]
        SUP["/edit/{id}/support<br/>Support"]
        DAT["/edit/{id}/data<br/>Data"]
        LBL["/edit/{id}/labels<br/>Custom (premium)"]
    end

    subgraph "Campaign Views (bottom nav in editor)"
        OV["/overview/{id}<br/>Overview"]
        CI["/insights/{id}<br/>Insights"]
        MSG["/messages/{id}<br/>Messages"]
        CST["/customers/{id}<br/>Customers"]
        EDT["Edit (returns to last tab)"]
        CPR["/customers/{id}/profile/{cardId}<br/>Customer Profile"]
    end

    subgraph "Public / Staff"
        LP["/landing-page/{id}<br/>Enrollment"]
        ST["/stamp<br/>Stamp Tool"]
    end

    MC -->|"MANAGE"| DSGN
    MC -->|"+ button"| HLP
    HLP -->|"select template"| MC
    DSGN <--> DET
    DSGN <--> LOC
    DSGN <--> SUP
    DSGN <--> DAT
    DSGN <--> LBL
    OV --> CI
    OV --> MSG
    OV --> CST
    OV --> EDT
    EDT --> DSGN
    CST -->|"row click"| CPR
    CPR -->|"back"| CST
    LP -->|"Join Now!"| LP
    MC <--> DSH
    MC <--> HLP
    MC <--> SET
    MC -.->|"premium"| SUB

    style SUB fill:#ff0,stroke:#333
    style LBL fill:#ff0,stroke:#333
    style ST fill:#e8e8e8,stroke:#999
    style LP fill:#e8e8e8,stroke:#999
```

### API Call Heatmap

Pages that make the most unique API calls:

| Page | Unique API Calls | Endpoints |
|------|-----------------|-----------|
| /overview/:id | 6 | /account, /campaigns, /campaign/id/:id, /events/analytics/transactions, /events/analytics/all, /events/pushHistory |
| /insights/:id | 6 | /account, /campaigns, /campaign/id/:id, /events/analytics/transactions, /events/analytics/all, /events/analytics/stampTotals |
| /messages/:id | 5 | /account, /campaigns, /campaign/id/:id, /card/cid/:id?count=true, /events/pushHistory |
| /customers/:id | 4 | /account, /campaigns, /campaign/id/:id, /card/cid/:id?count=false |
| /customers/:id/profile/:cardId | 4 | /account, /campaigns, /campaign/id/:id, /card/:cardId?includeEvents=true |
| /settings | 4 | /account, /campaigns, /locations, /beacons |
| /edit/:id/locations | 4 | /account, /campaigns, /locations, /beacons |
| /dash | 3 | /account, /campaigns, /events/dashboard?groupBy=day |
| /manage-my-cards | 3 | /account, /campaigns, /campaign/id/:id |
| /edit/:id/design | 2 | /account, /campaigns |
| /edit/:id/details | 2 | /account, /campaigns |
| /edit/:id/support | 2 | /account, /campaigns |
| /edit/:id/data | 2 | /account, /campaigns |
| /edit/:id/labels | 2 | /account, /campaigns |
| /help | 2 | /account, /campaigns |
| /subusers | 3 | /account, /campaigns, /subusers |
| /landing-page/:id | 1 | /campaign/public/:id |
| /stamp | 0 | (none on load) |

---

## 5. Component Diagram

```mermaid
flowchart TD
    subgraph "Browser (AngularJS 1.5.11 SPA)"
        APP["app.js<br/>ui-router SPA"]
        LIBS["lib.js<br/>jQuery 2.2.4 + deps"]
        CONFIG["config/environment.js<br/>API base URL + flags"]
    end

    subgraph "Loopy Loyalty API (api.loopyloyalty.com)"
        ACCT["/account<br/>auth + profile"]
        CAMP["/campaigns<br/>/campaign/id/:id<br/>/campaign/public/:id<br/>campaign CRUD"]
        EVT["/events/*<br/>dashboard, analytics,<br/>transactions, pushHistory"]
        CRD["/card/*<br/>customer list, detail,<br/>stamp, count"]
        LOCS["/locations<br/>location CRUD"]
        BCNS["/beacons<br/>beacon CRUD"]
        SUBS["/subusers<br/>subuser management"]
        IMGS["/images<br/>stamp rendering"]
    end

    subgraph "Third-Party Services"
        PK["PassKit<br/>wallet passes,<br/>NFC, beacons"]
        STRIPE["Stripe<br/>payments, billing"]
        GMP["Google Maps<br/>location picker"]
        ZAPIER["Zapier<br/>integrations"]
        GA["Google Analytics<br/>+ GTM"]
        CLARITY["MS Clarity<br/>heatmaps/sessions"]
        FB["Facebook Pixel"]
        INTCM["Intercom<br/>support chat"]
        PW["ProfitWell<br/>subscription metrics"]
        TAP["Tapfiliate<br/>affiliate tracking"]
        VIMEO["Vimeo<br/>tutorial videos"]
        HCAP["hCaptcha<br/>Stripe anti-fraud"]
    end

    APP --> ACCT
    APP --> CAMP
    APP --> EVT
    APP --> CRD
    APP --> LOCS
    APP --> BCNS
    APP --> SUBS
    APP --> IMGS
    APP --> STRIPE
    APP --> GMP
    APP --> ZAPIER
    APP --> GA
    APP --> CLARITY
    APP --> FB
    APP --> INTCM
    APP --> PW
    APP --> TAP
    APP --> VIMEO
    APP --> HCAP

    CRD --> PK
    BCNS --> PK
    CAMP --> PK

    STRIPE --> HCAP
```

### API Host Summary

| Host | Protocol | Auth | Pattern |
|------|----------|------|---------|
| api.loopyloyalty.com | HTTPS REST | JWT Bearer (sessionStorage) | All business data |
| js.stripe.com | HTTPS | Stripe publishable key | Payment UI |
| api.stripe.com | HTTPS | Stripe secret key (server-side) | Payment processing |
| maps.googleapis.com | HTTPS | API key (AIzaSy...) | Maps/Places |
| api.zapier.com | HTTPS | None (public gallery) | Integration templates |
| api.hcaptcha.com | HTTPS | Site key | Anti-fraud |
| player.vimeo.com | HTTPS | None (public) | Tutorial videos |
| client-f.passkit.net | HTTPS | PassKit SDK | Wallet pass SDK |
| s3.amazonaws.com | HTTPS | None (public URLs) | Stamp images (passkit-api-core-production bucket) |

---

## 6. Third Parties

| Service | Purpose | Loaded On | Evidence |
|---------|---------|-----------|----------|
| PassKit | Digital wallet pass management (Apple Wallet, Google Wallet) | All pages (SDK), /landing-page (enrollment redirect) | client-f.passkit.net intl-tel-input, s3.amazonaws.com passkit-api-core-production |
| Stripe | Payment processing for plans | /settings (billing), all pages (m.stripe.com/6 beacon) | js.stripe.com/v3, api.stripe.com, r.stripe.com |
| Google Maps | Location picker in Settings | /settings, all pages (maps.googleapis.com gen_204 probe) | maps/api/js?key=AIzaSyDYxbvsaLJWHoD41beX5o19038MQUHLaYM |
| Zapier | No-code integrations (Mailchimp, Google Sheets) | /settings (embedded gallery) | api.zapier.com/elements/zap-templates |
| Intercom | Customer support chat widget | All pages | widget.intercom.io/widget/p6uuiqym |
| Google Analytics | Page views + events (UA + GA4 dual tracking) | All pages | UA-56934929-1, G-TTHRRGSK6D |
| Google Tag Manager | Tag management | All pages | GTM-MLR2SL5 |
| Microsoft Clarity | Session recording / heatmaps | All pages | m8r3sxhiy8 |
| Facebook Pixel | Ad conversion tracking | All pages | 908685596241622 |
| ProfitWell | Subscription analytics | All pages | public.profitwell.com |
| Tapfiliate | Affiliate referral tracking | All pages | script.tapfiliate.com |
| Vimeo | Tutorial video embeds | /dash | 4 videos: 227213226, 227050025, 227060638, 227072189 |
| hCaptcha | Bot detection for Stripe | /settings | 463b917e-e264-403f-ad34-34af0ee10294 |
| YouTube | Video embed iframe API | All pages | www.youtube.com/iframe_api |

### Content Security Policy

Clarity and Facebook Pixel requests are blocked by CSP:
- `k.clarity.ms`, `j.clarity.ms`, `h.clarity.ms`, `y.clarity.ms`, `z.clarity.ms`, `n.clarity.ms`, `u.clarity.ms` — some fail, `z.clarity.ms` succeeds
- `connect.facebook.net//log/error` — blocked by CSP
- Vimeo player iframes — blocked initially (ERR_ABORTED), then loaded via Cloudflare challenge

### Feature Flags / Gating

| Feature | Gate | Evidence |
|---------|------|----------|
| Subusers | Plan (Growth/Ultimate) | Premium icon () on nav, dialog on click |
| Custom Labels tab | Premium plan | Premium icon () on editor tab |
| Unique Customer Enrollments | Premium plan | Premium icon () on Data tab |
| Campaign Views (Overview/Insights/Messages/Customers) | Campaign activation (status=2) | Bottom nav disabled for drafts, but pages still reachable via URL |
| Card design limit | Plan tier | 1 for trial (sessionStorage.limit) |
| Campaign activation | Email verification | Alert banner: "You haven't verified your email address" |

---

## 7. Open Questions

1. **Design page JS error**: /edit/:id/design throws `Cannot read properties of undefined (reading 'backgroundColor')` on load. This may be specific to the COUNCIL TEST campaign (draft with partial design data). Needs verification with a fully-configured campaign.

2. **/stamp page undefined stamp count**: POST /card/cid/:cardId/addStamps/undefined returns 500. The /stamp page doesn't pass a count parameter, unlike the customer profile Give Stamps tab which uses `/addStamps/1`. Two different code paths for the same operation.

3. **Account-level vs campaign-level analytics**: /dash uses GET /events/dashboard while /overview and /insights use GET /events/analytics/all/:id. These return identical response shapes but are different endpoints. Is /events/dashboard an aggregate across all campaigns?

4. **Campaign activation requirement**: All stamping, reward, and messaging features require campaign activation (status=2), which requires email verification. The test account has unverified email, preventing end-to-end testing of these flows.

5. **Zapier duplicate render**: Observed in baseline survey — Zapier templates fetched 4x and rendered twice on /settings. Confirmed in this pass: api.zapier.com called 4x for templates, 4x for apps.

6. **/account endpoint chattiness**: Called 2-3x per page load across all authenticated pages. Serves as both auth check and session heartbeat, but appears excessive.

7. **CouchDB-style responses**: /campaigns returns `_offset`, `total_rows`, `rows[].value` — this suggests the backend may use CouchDB or a CouchDB-compatible layer, while other endpoints use standard JSON or DataTables format.

8. **No versioned API**: No /v1/ or similar version prefix. Breaking changes would affect all clients simultaneously.

9. **No real-time updates**: No WebSocket or SSE connections. Dashboard and overview data is stale until page refresh.

10. **PassKit dependency**: Cards are PassKit passes underneath (card IDs are PassKit bundle IDs, images served from passkit-api-core-production S3 bucket). Enrollment redirects to PassKit wallet URLs. This is a deep architectural dependency.

11. **Image rendering endpoint**: GET /images with JSON query parameter renders stamp strip images server-side. This is an unusual pattern (base64-encoded JSON in query string).

12. **Config injection**: /config/environment.js is a server-generated config file loaded as a script. May contain feature flags, API base URL, and third-party keys. Not inspected in detail per safety rules.