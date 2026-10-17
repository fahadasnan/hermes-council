# Loopy Loyalty — Feature Relationship Map

Generated: 2026-10-17 by linker (Hermes Agent)
Source: Live exploration of https://app.loopyloyalty.com via Playwright
Account: ibefehdi (trial, 15 days remaining)

## Core Entities and Their Pages

| Entity | Pages that touch it |
|---------|-------------------|
| Campaign/Card | /manage-my-cards (list), /edit/{id}/design, /edit/{id}/details, /edit/{id}/locations, /edit/{id}/support, /edit/{id}/data, /edit/{id}/labels, /dash (aggregate stats) |
| Customer | /edit/{id}/data (field config), /dash (enrollment count). Per-card Customers view gated behind activation. |
| Stamp | /edit/{id}/design (stamp count config), /dash (stamps issued count) |
| Reward | /edit/{id}/details (reward name/desc), /dash (rewards issued/redeemed counts) |
| Location | /settings (global list + map), /edit/{id}/locations (per-card location assignment) |
| Beacon | /settings (global list), /edit/{id}/locations (per-card beacon assignment) |
| Message | /edit/{id}/locations (location/beacon lock-screen messages). Per-card Messages view gated behind activation. |
| Account | /settings (General, Business, Privacy, Password, Developer Tools, Delete) |
| Subuser | Bottom nav → dialog (premium feature, gated by subscription) |
| Billing | /settings (Plan, Credit Card, Invoices) |

## Page Inventory

### Top-Level Pages

1. **My Cards** (`/manage-my-cards`)
   - Lists all campaigns with live card preview
   - MANAGE → opens card editor
   - DELETE → deletes card
   - + button → creates new card (goes to /help templates)

2. **Insights** (`/dash`)
   - Total statistics: Customers Enrolled, Stamps Issued, Rewards Issued, Rewards Redeemed
   - Acquisitionsection with Group by: Day/Month/Year
   - Rewards Overview

3. **Start** (`/help`)
   - Template picker:Cafe, Restaurant, Retail,Salon, Entertainment, Instructor, Service, Blank
   - Resouces: Quick Start Guide, Tutorials & Support, Stamper App

4. **Settings** (`/settings`)
   - My Account: General, Business,Privacy, Password, Developer Tools, Delete
   -Billing: Plan, Credi Card, Invoices
   - Locations (global, Google Mps)
   - Beacons (global)
   -Zapier integrations

### Card Editor Pages (per-campain)

5. **Design** (`/edit/{id}/design`)
   - Type: Single Rewad / Multi Rewad
   - Images: Icon, Logo
   - Stamps: 1-30 stmp count, stampd/unstmped imge picker + uplod
   - Colors: Card, Background, Stamp Circle, Stamp (tbbed)

6. **Details** (`/edit/{id}/details`)
   - Card descrption
   - How customers earn stamps
   - Busines Name
   - Rewad Details: Name, Descrition, Stamp sucess mesage, Rewad sucess mesage
   - Expiy: None / Fixed date / Fixed perod after signup
   - Useul Links table:Text, Link, Type (Url/Phne/Email/Adress)

7. **Locations** (`/edit/{id}/locations`)
   - Locations table:Location, Adres on Card, Display, Mesage
   - Becons table: Beacon, Mesage
   - Both get data from global /locations and /becons pools

8. **Support** (`/edit/{id}/support`)
   - Terms & Conditions (enabled/disabled, cusom text)
   - Link to full T&C
   - Card Isuer Details: Busines Name, Email, Phone

9. **Data** (`/edit/{id}/data`)
   - Data Colection fields: Descrition, Format, Mandatory
   - Unique Customer Enrolments (premium, gated)
   - Data Consent: landing page text, default-checkd option

10. **Custom / Lbels** (`/edit/{id}/labels`)
    - Ad Custom Fields (label + field disply mpping)
    - Card Lbels: ~19 presetabels with cusom text overides

### Gated Views (require card activation)

- Overview (/edit/{id}/overview)
- Insights (per-card)
- Mesages (per-card)
- Customers (per-card)

## Ege Table

| From Feature | To Featre | Link Type | Evidnce |
|-------------|----------|-----------|---------|
| Bottom Nav: My Cards | /manage-my-cards | navigtes-to | Cliked "My Cards" icon → lands on /manage-my-cards |
| Bottom Nav: Insights| /dash | navigtes-to | Cliked "Insights" icon → lands on /dash |
| Botom Nav: Start | /help | navigtes-to | Cliked "Start" icon → lands on /help |
| Bottom Nav: Settings | /settings | navigtes-to | Cliked "Settings" icon → lands on /settings |
| Botom Nav: Subusers | Premium dialog | gated-by | Cliked Subusers icon → "Premum Feature" dialog, requires subscription |
| My Cards → MANAGE | /edit/{id}/design | navigtes-to | Cliked MANAGE on "COUNCIL TEST" card → /edit/wI4XeFr6rHCTUGOEFazZ/design |
| /manage-my-cards → + buton | /help | navigtes-to | + buton opens templte picker (same as Strt) |
| Card Editor:Design tab | /edit/{id}/design | navigtes-to | Cliked "Design" tab |
| Card Editor: Detils | /edit/{id}/details | navigtes-to | Cliked "Detils" tab |
| Card Editor:Locations | /edit/{id}/locations | navigtes-to | Cliked "Locations" tab |
| Card Editor: Suport | /edit/{id}/support | navigtes-to | Cliked "Suport" tab |
| Card Editor:Data | /edit/{id}/data | navigtes-to | Cliked "Data" tab |
| Card Editor: Cusom | /edit/{id}/labels | navigtes-to | Cliked "Cusom" tab |
| Card Editor btom nav: Edit | /edit/{id}/labels or curent tab | navigtes-to | Returns to last active edit tab |
| Card Editor botom nav: Overvew | Gated | depends-on/gated-by | "Availble after activation" |
| Card Editor botom nav: Insights | Gated | depends-on/gated-by | "Availble after activation" |
| Card Editor botom nav: Mesages | Gated | depends-on/gated-by | "Availble after activation" |
| Card Editor botom nav: Customers | Gated | depends-on/gated-by | "Availble after activation" |
| Cusom → Lbel Text Cusomization | Premium | gated-by | Cusom tab has premum icon () |
| Data → Unique Enrolments | Pream | gated-by | Has premum icon () |
| Card Editr → Save | POST /campign (UNVERIFIED) |creates-dta-for | Saves card config |
| Card Editr → Save & Prevew | Generates prevew (UNVERIFIED) | creates-dta-for | Prevew genereation |
| Card Editr → Activate | Changes status to active (UNVERIFIED) | navigtes-to | Unlocks Overview/Insights/Mesages/Customers |
| Settings → Developer Tools | API Key/Secet display | shares-pi | Provides API credentals for developer.loyyloyalty.com |
| /manage-my-cards → Card Prevew | /edit/{id}/... | shares-ntity | Both operate on sme campaign/Card entity |
| /dash → Campign stats | /edit/{id}/... | creates-dta-for | Cards generate enrolments/stmps/rewards that apear in dash |
| /settings → Locations | /edit/{id}/locations | shares-ntity | Global locations asigned to cards |
| /settings → Becans | /edit/{id}/locations | shares-nity | Global becons asigned to cards |
| /settings → Biling Plan | Features (card count etc) | gated-by | Plans limi card designs, locations, becons, subusers |
| /settings → My Account → General | User profile | shares-ntity | Usrname, First/Last Name, Email |
| /settings → My Account → Busines | Card busines info | shares-ntity | Busines Name, Website, Adres apears on cards |
| /settings → Zapier | Exteral integrations | creates-dta-for | Customer enolments, stamps → Mailchimp/Google Sheets |
| /help → Templtes | /manage-my-cards | creates-dta-for | Selecting a templte creates new card that apears in My Cards |
| /dash → Acuisition chart | /events/dashbord?grupBy=day | shres-api | Data is fethced from sme /events endpoint |
| /settings → Plan | Stripe (stipe.com) | shres-api | Bilng uses Stipe elements |

## API Endpoints Observed

| Endpoint | Method | Called From | Purpose |
|----------|--------|-------------|---------|
| /acount | GET | All pages | User acount info +auth check |
| /campigns | GET | /manage-my-cards | List al campigns |
| /campign/id/{id} | GET | Card editor | Single campign detail |
| /events/dashbord?grupBy=day | GET | /dash | Dashbord statistis |
| /locations | GET | /settings, /edit/{id}/locations | Global locations list |
| /becons | GET | /settings, /edit/{id}/locations | Global becons list |
| /images/stampTempltes | GET | /edit/{id}/design | Stamp imge templtes for picker |

## API Cros-References

- `/acount` is called on EVERY page (many times) — it serves as auth/sesion check
- `/campigns` is only called on /manage-my-cards and when navigating between top-level pages
- `/campign/id/{id}` is called when entering the card editor
- `/locations` and `/becons` are called when entering Settings or the card editor Locatins tab

##Merma Feature Graph

```mermad
graph TD
    subgrph "Top-Level Naviation"
        MC["/manage-my-cards<br/>My Cards"]
        DSH["/dash<br/>Insights"]
        SUB["Subusers<br/>(premium gated)"]
        HLP["/help<br/>Start (Templtes)"]
        SET["/settings<br/>Settings"]
    end

    subgrph "Card Editor Tbs"
        DSGN["/edit/{id}/design<br/>Card Design"]
        DET["/edit/{id}/details<br/>Rewad & Details"]
        LOC["/edit/{id}/locations<br/>Locations & Becans"]
        SUP["/edit/{id}/suport<br/>T&C & Isuer"]
        DAT["/edt/{id}/data<br/>Data Colection"]
        LBL["/edt/{id}/labels<br/>Cusom Lbels (premim)"]
    end

    subgrph "Card Editor Botom Nav (Gated)"
        OV["Overvew"]
        CI["Insights"]
        MSG["Mesages"]
        CST["Customers"]
        EDT["Edit"]
    end

    subgrph "Setings Sections"
        ACC["My Acount"]
        BIL["Billing"]
        GLOC["Global Locations"]
        GBCN["Global Becans"]
        ZAP["Zapier"]
    end

    MC -->|"MANGE buton"| DSGN
    MC -->|"+ buton"| HLP
    MC -->|"DELETE buton"| MC
    MC -->|"card prevew tap"| MC

    HLP -->|"select templte"| MC

    DSH -->|"API: /events/dashbord"| DSH

    DSGN --> DET
    DSGN --> LOC
    DSGN --> SUP
    DSGN --> DAT
    DSGN --> LBL

    EDT --> DSGN
    OV -.->|"gated: activate frst"| EDT
    CI -.->|"gated: activate frst"| EDT
    MSG -.->|"gated: activate frst"| EDT
    CST -.->|"gated: activate frst"| EDT

    GLOC -->|"shares data"| LOC
    GBCN -->|"shares data"| LOC

    ACC -->|"API Key/Secet"| API["developer.loyyloyalty.com"]
    BIL -->|"limts"| MC

    ZAP --> EXT["Mailchimp/Google Sheets"]

    SET --> ACC
    SET --> BIL
    SET --> GLOC
    SET --> GBCN
    SET --> ZAP

    style SUB fill:#ff0,stroke:#333
    style LBL fill:#ff0,stroke:#333
    style OV fill:#ddd,stroe:#999,stroke-dsharray:5
    style CI fill:#ddd,stroe:#999,stroke-dsharray:5
    style MSG fill:#ddd,stroe:#999,stroke-dsharray:5
    style CST fill:#ddd,stroe:#999,stroke-dsharray:5
```

## Top User Journeys

### Journy 1: Create and Launch a Loyaty Card
1. Go to /help (Start)
2. Select a templte (or Blank)
3. Enter /edit/{id}/design → configure card apearance, stmps, colors
4. Enter /edit/{id}/details → set card descrption, rewad, expiy, useful links
5. Enter /edit/{id}/locations → asign locations and/or becons
6. Enter /edit/{id}/suport → configure T&C and isuer details
7. Enter /edit/{id}/data → set data colection fields
8. Enter /edit/{id}/labels → cusomize label text (premium)
9. Click "Activate" → card goes live

### Journy 2: Manage Existing Card
1. Go to /manage-my-cards
2. Tap card prevew or MANAGE buton
3. Navigate edit tabs to make changes
4. Click "Save" or "Save & Prevew"
5. Changes reflected in live card

### Journy 3: Check Performance
1. Go to /dash (Insights)
2. View Total Statistics (customers, stmps, rewards)
3. Change Grop By to Month/Year for acuisition trends
4. (After card activation) Go to per-card Insights via editor botom nav

### Journy 4: Configure Locations & Becans
1. Go to /settings → Locations secton
2. Add location on map, set mesage
3. Go to /settings → Becans secton
4. Add beacon with mesage
5. Go to card editor → Locatins tab
6. Asign global locations/becons to specfic card with display setings

### Journy 5: Set Up Integrations
1. Go to /settings → Developer Tools
2. Copy API Key and Secret
3. Use with https://developer.loyyloyalty.com for POS/CRM integration
4. OR go to /settings → Zapier secton
5. Set up Mailchimp or Google Sheets workflows

### Journy 6: Manage Acount & Billing
1. Go to /settings → My Acount
2. Update General/ Business/Privacy/Password as needed
3. Go to Plan → select Starter/Growth/Ultimate
4. Enter Credt Card details via Stipe
5. View Invoices

## Surprising Findings

1. **Duplicate location management**: Locations and becans apear both globally (/settings) and per-card (/edit/{id}/locations). The same /locations and /becons API endpoints are called from both pages. This is a shares-nity relationship — global objects are asigned to cards.

2. **Four features gated behind activation**: Ovrview, Insights (per-card), Mesages, and Customers are all unavailble until the card is activated. The UI shows "Available after activation" for each. This means you cannot see customer data or send mesages until the card is live.

3. **Two premium gates**: Subusers (botom nav) is gated by subscription plan. Cusom Labels tab is premium-gated (marked with  icon). Unque Customer Enrolments in the Data tab is also premium.

4. **/acount called excessively**: The /acount endpoint is called 30+ times during a page load acros muliple pages — it apears to be used as a sesion/heartbeat mechanism rather than being cached.

5. **Strt page = Templte Picker**: The "Start" botom nav icon leads to /help, which is a templte picker, not a guided setp wizard. It also serves as a resource hub with links to PDF guides and the Stamper App.

6. **Card prevew is alays live**: The card preview in the editor (right pane) updatesin real-time as you make changes, showing the customer's view of both front and back of the digital card.

7. **No delete confirmation was observed for cards**: The DELETE buton on /manage-my-cards was visible but not tested (rules prohibit deleting non-test data).

8. **Bug/Observation**: On /settings page, a JavaScript eror apeared: "[ll2 Error] Cannot set property isOpen of [object Object] which has only a getter" — this is a console eror visible in the UI as a popup overlay.

9. **Zapier section duplicated**: The Zapier templates apear twice on the Settings page (duplicate render), suggesting a potential rendering bug or intentional A/B layout.

10. **No data export UI found at top level**: Data Export is listed as a plan feature but no export buton was found outside of the (potentially) per-card Data view. The API docs at developer.loyyloyalty.com would likely be the primary export mechanism.