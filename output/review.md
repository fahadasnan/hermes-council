# Verification Review — Loopy Loyalty Dashboard

Review date: 2026-10-17
Sources: Cartographer `pages.md`/`pages.json`; Linker `links.md`; live Playwright check.

## Live verification status

Playwright navigation to `https://app.loopyloyalty.com` redirected to `/auth/login`. The browser had no authenticated session, so the required authenticated spot checks could not be performed. Per protocol: SESSION EXPIRED. No records were created or modified by this review.

## Verdict table

| Claim | Source member | Status | Evidence |
|---|---|---|---|
| The app has 28 numbered page sections covering public, authenticated, campaign, settings, landing, stamp, and fallback routes | Cartographer | CONFIRMED | `pages.md` sections 1–28 and the matching `pages.json` page inventory are internally consistent. Live route coverage could not be repeated because SESSION EXPIRED. |
| Login is `/auth/login` and root redirects there when unauthenticated | Cartographer | CONFIRMED | Playwright reached `https://app.loopyloyalty.com/auth/login`; report's login form and links agree with the observed route. |
| Dashboard is `/dash`, Help is `/help`, My Cards is `/manage-my-cards`, Settings is `/settings` | Both | CONFIRMED | Routes agree across both reports; no authenticated live confirmation was possible. |
| Card editor has Design, Details, Locations, Support, Data, and Custom/Labels tabs | Both | CONFIRMED | Same six tabs are listed in both reports and supported by the screenshots named by Cartographer. |
| Stamp count selector is 1–25 | Cartographer | CONFIRMED | `pages.md` and `pages.json` both state 1–25. |
| Stamp count selector is 1–30 | Linker | WRONG | Conflicts with the Cartographer's more specific live form observation and machine-readable inventory, both of which state 1–25. Final map should use 1–25 and mark any source/code claim of 30 as unresolved. |
| There is an aggregate Insights navigation item linking to `/dash` | Linker | PARTIAL | Linker lists this as an edge, but Cartographer's global sidebar lists only My Cards, Subusers, Start, Settings and describes `/dash` as serving both onboarding and aggregate content. The reports do not provide a direct click/DOM evidence for a distinct aggregate Insights item. Treat as a dashboard capability, not a confirmed separate navigation edge. |
| `/insights/:campaignId` is per-card analytics | Both | CONFIRMED | Both inventories describe revenue/ROI, activity, histogram, and transaction analytics at this route. |
| Trial account shows Premium Feature gating for Subusers, Start/templates, and some settings | Linker (also narrative in pages) | PARTIAL | The reports agree that gating exists, but the exact set of gated sections is not reconciled: Cartographer lists accessible page features while Linker asserts modal blocking. Mark exact gating scope and modal state unverified until an authenticated replay. |
| Settings includes account, billing, locations, beacons, and Zapier sections | Both | CONFIRMED | Detailed section lists match across reports, including Plan, Credit Card, Invoices, global Locations/Beacons, and Zapier. |
| Customer row navigates to `/customers/:campaignId/profile/:cardId` | Both | PARTIAL | The route template is consistent in the page inventory and JSON, but no customer existed to click through. Linker's edge abbreviates the first parameter as `:id`, which is ambiguous. Exact parameter ordering remains unverified. |
| Subuser row navigates to `/subuser/:subuserId` | Both | PARTIAL | Both reports agree on the route template, but no subuser existed and the destination was not live-clicked. |
| Invoice and CSV Verify are pages in the route map | Cartographer | UNVERIFIED | They are route/source-derived only; the reports explicitly say no invoice existed and no CSV export verification was exercised. |
| Reset Password, Email Verification, and Renew Subscription are public routes | Cartographer | UNVERIFIED | Route/template-derived, not opened with valid tokens or an expired subscription. |
| Customer Landing Page and Stamp Page are public routes | Cartographer | PARTIAL | Both are reported and screenshots are named, but no authenticated replay or independent live check was possible. Their public accessibility and exact submission behavior need a fresh session. |
| Card activation requires verified email | Both | CONFIRMED | Cartographer reports the observed activation gate and both reports record the test card as DRAFT because the account email was unverified. |
| Global and per-card Locations/Beacons are shared entities with different scopes | Both | PARTIAL | The UI locations are consistently reported, but exact scoping/API mutation behavior was not demonstrated. Preserve as a UI relationship, not a confirmed data-model invariant. |
| The test campaign `COUNCIL TEST` exists and is DRAFT | Cartographer/Linker | UNVERIFIED | Both reports identify the same campaign ID, but this verifier did not query it because SESSION EXPIRED. Do not create another record or alter it. |
| 14 observed API endpoints and additional source-derived endpoints | Both | PARTIAL | The endpoint lists substantially agree, but `links.md` includes `/images`, `/events/dashboard`, and `/card/push` evidence that is not fully reflected in `pages.md`; verbs and some endpoints are explicitly derived. Keep observed and source-derived lists separate. |

## Corrections

1. Correct the Cartographer's coverage note: it says “except 5” but names seven unverified routes: reset-password, verify, renew-subscription, customer profile, subuser profile, invoice, and csv-verify.
2. Resolve the stamp-count disagreement in favor of 1–25 for the live editor inventory. Linker's 1–30 statement should be removed or labeled source-derived/unverified.
3. Do not represent “Insights (aggregate)” as a separate confirmed navigation destination. The evidence supports `/dash` containing aggregate insight content; whether a distinct nav item is dynamically shown is not settled by the supplied reports.
4. Replace Linker's customer-profile edge shorthand `/customers/:id/profile/:cardId` with the explicit route template `/customers/:campaignId/profile/:cardId` and label the click-through unverified.
5. The reports use “Card,” “Campaign,” and sometimes “Program” interchangeably. Keep the mapping `campaign/card` as the observed app terminology, but label “no separate Program entity” as an inference rather than a verified schema fact.
6. Keep API claims in three buckets: observed network calls, source-derived endpoint strings, and inferred/unknown verbs. In particular, `/campaign/public/`, `/card/push`, `/images/*`, `/location/`, `/beacon/`, and `/subuser/` are not all live-confirmed with exact verbs.

## Missing pages, features, and links

Because the authenticated session was expired, this review did not discover new live pages. Coverage gaps remaining in the combined map are:

- Valid-token views for reset password and email verification.
- Expired-subscription/renew-subscription state.
- A real customer profile, including stamp issuance, reward redemption, remove, and direct-message actions.
- A real subuser profile and its permissions/location controls.
- An invoice detail page reached from a real invoice.
- CSV export followed through to `/csv-verify/:file`.
- Authenticated confirmation of all modal states and permission/plan gates, especially Subusers, Custom Labels, CSV export, and billing actions.
- Empty-state behavior versus populated-state behavior for cards, customers, transactions, push history, locations, beacons, subusers, and invoices.
- User dropdown opened state and logout confirmation/redirect.
- Exact Save & Preview, Activate, Delete, Export, push-send, and billing confirmation flows; reports often opened modals but intentionally did not submit destructive or external actions.
- Exact campaign-level versus account-level location/beacon scoping on create/update, not just shared read endpoints.
- An independently verified aggregate Insights navigation edge, if present.

## Disagreements and ruling

- Stamp range: Cartographer wins (1–25), Linker is wrong (1–30).
- Aggregate Insights navigation: Linker's edge is downgraded to PARTIAL; `/dash` aggregate analytics is retained as confirmed content.
- Number of unverified routes: the reports' “five” count is wrong; the enumerated list contains seven.
- Customer-profile parameter naming: use Cartographer's explicit `campaignId` template; retain PARTIAL/UNVERIFIED for actual navigation because the account had no customers.
- Trial gating scope: retain only the common fact that trial/plan gating exists. Exact pages and whether a modal blocks each page remain PARTIAL.
- API inventory: retain the shared observed endpoints, but do not upgrade source-derived strings or inferred verbs to observed facts.

## Confidence by section

- Public authentication and signup routes: 0.80 (login independently reached; tokenized routes unverified).
- Global navigation and dashboard/help: 0.65 (reported screenshots and route inventory, but no current authenticated replay).
- Card editor tabs and configuration features: 0.82 (two reports agree and screenshots are named; submit flows not replayed).
- Card operations—overview, insights, messages, customers: 0.70 (reports agree, but customer-dependent actions are empty-state or unverified).
- Settings, billing, integrations: 0.68 (detailed dual-report coverage; billing mutations and invoices unverified).
- Public landing and stamp flows: 0.60 (reported screenshots; exact public behavior not rechecked).
- Entity model and feature links: 0.62 (broadly coherent, but several edges are inferred/shared-entity claims).
- API map: 0.58 (observed calls are useful; source-derived endpoints and exact verbs require separation).

## Gate decision

PASS WITH CORRECTIONS. The reports provide substantial, internally cross-checked coverage and a usable map, but the final synthesis must apply the corrections above and preserve the explicit SESSION EXPIRED limitation. This verifier did not modify staging data.
