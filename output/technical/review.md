# Deep Technical Pass Verification Review

Run date: 2026-10-17
Reviewer: verifier
Environment: authenticated staging dashboard at https://app.loopyloyalty.com. No new records or settings were created or changed during this review. Session remained authenticated; this was not SESSION EXPIRED.

## Summary and confidence

The five deep-pass reports are broadly consistent and sufficient for synthesis, but they contain material stale/contradictory claims that must be corrected before publication. Live checks confirmed the authenticated dashboard, settings, analytics, customer list/profile, messages, subusers, and the reproducible editor Data-tab crash. The most important data-audit issue is that the live campaign currently shows two successful stamp events (Alice and Helen), while test-records.md logs only Alice; the report values that say one or zero stamps are stale, and the second stamp is not fully logged.

Confidence by file:

| File | Confidence | Ruling |
|---|---:|---|
| architecture.md | 0.87 | Routes, endpoint catalogue, entities, and diagrams are strong; auth transport is explicitly inferred and must remain labelled inferred. |
| reports.md | 0.88 | Analytics UI and API claims mostly confirmed; point-in-time KPI examples are stale because live data now has two stamps. |
| settings.md | 0.93 | Strongest file; settings sections, limits, errors, and API calls match live checks. |
| gaps.md | 0.90 | Corrections and live findings mostly confirmed; stamp/test-record totals need reconciliation. |
| flows.md | 0.78 | Useful flow inventory, but several claims are speculative or contradicted by settings/gaps, and it contains malformed endpoint spellings and diagrams/notes that should be normalized in synthesis. |
| Final technical map readiness | 0.86 | PASS with required synthesis corrections and explicit UNVERIFIED labels. |

## Verdict table

| Claim | Source member/file | Status | Evidence |
|---|---|---|---|
| /dash is account-level dashboard with acquisition grouping Day/Month/Year | reports.md, architecture.md | CONFIRMED | Live /dash rendered Total statistics 8 enrolled, 2 stamps, 0 rewards; Group by Day/Month/Year. Network showed GET /events/dashboard?groupBy=day 200. |
| /dash uses /events/dashboard, not campaign analytics endpoint | reports.md | CONFIRMED | Live network on /dash showed GET /events/dashboard?groupBy=day 200. |
| /settings contains account tabs, billing, locations, beacons, and Zapier | settings.md | CONFIRMED | Live /settings rendered General/Business/Privacy/Password/Developer Tools/Delete, Plan/Credit Card/Invoices, Locations, Beacons, Zapier. Network showed GET /locations and GET /beacons 200. |
| Settings plan prices/limits are Starter $25, Growth $69, Ultimate $95 and 1/3/10 card/location/beacon limits, 3/10/50 subusers | settings.md | CONFIRMED | Live body text showed all three prices and all stated limits. |
| Settings has isOpen getter error and duplicated Zapier gallery | settings.md, gaps.md | CONFIRMED | Live body text included `[ll2 Error] Cannot set property isOpen of [object Object] which has only a getter`; prior live evidence and report document duplicated gallery. |
| /overview/:campaignId is a live route for the draft | reports.md, gaps.md | CONFIRMED | Live /overview/wI4XeFr6rHCTUHGOEFazZ rendered KPIs, 10 transaction rows, empty push history, share URL/QR controls. |
| Overview sends literal groupBy=undefined | reports.md, architecture.md | CONFIRMED | Live network showed GET /events/analytics/all/wI4XeFr6rHCTUHGOEFazZ?groupBy=undefined 200. |
| Overview transaction and push-history endpoints | reports.md, architecture.md | CONFIRMED | Live network showed POST /events/analytics/transactions/:id 200 and GET /events/pushHistory/:id 200. |
| Campaign currently has 8 customers and 2 stamps | reports.md, gaps.md, flows.md | CONFIRMED | Live /dash, /overview, /insights each showed 8 customers and 2 stamps; overview transaction table contained two stamp-earned rows. |
| Reports' point-in-time statements of 0 or 1 stamp are current | reports.md, gaps.md, test-records.md | WRONG / PARTIAL | Current live state is 2 stamps. Earlier values were valid snapshots, but synthesis must mark them historical and use current values only with a timestamp. |
| Customer list shows 8 COUNCIL-TEST customers and stamp counts | reports.md, gaps.md, test-records.md | CONFIRMED | Live /customers/:campaignId showed 8 rows; Alice and Helen each showed 1 stamp, six others 0. |
| Customer profile route and event history are live | reports.md, gaps.md, architecture.md | CONFIRMED | Live Helen profile rendered Profile/Send Messages/Give Stamps/Delete Customer, 1 stamp, pass URL, and two events. Network showed GET /card/RTgLMCuFyOvpMH?includeEvents=true 200. |
| Customer profile mobile is masked in UI while API contains full value | reports.md | PARTIAL | Live profile body showed an unmasked-looking phone value in accessibility text; the report's UI-masking assertion was not independently confirmed from this snapshot. Keep API/UI masking distinction UNVERIFIED unless supported by screenshot/response evidence. |
| /insights has ROI fields, currency selector, activity grouping, histogram, and transactions | reports.md, gaps.md | CONFIRMED | Live /insights rendered all listed controls and sections. Network showed analytics/all, stampTotals, and transactions calls returning 200. |
| Insights Day/Month grouping only | reports.md, gaps.md | CONFIRMED | Live body rendered Day and Month options; no Year option visible. |
| /messages has segment selector, composer, immediate Send Message, and no draft control | gaps.md, flows.md | CONFIRMED | Live /messages rendered All customers/A segment, message field, best-practice hint, Send Message, empty history; no Save Draft control. |
| /subusers page is premium-gated and inaccessible | older links.md/review.md, flows.md | WRONG | Live /subusers rendered the full page, Create Subuser, table, and empty state. Creation permission remains gated/UNVERIFIED; the page itself is reachable. |
| Subuser creation is trial-blocked with POST /subuser 403 | settings.md, test-records.md | PARTIAL | The report records a live 403 attempt, but this verifier did not repeat a credential-creating action. Preserve as prior-member evidence; do not call the page itself blocked. |
| Data tab exposes the documented form | pages.json, architecture.md | PARTIAL | Live /edit/:id/data rendered only the error overlay `[ll2 Error] Cannot read properties of undefined (reading 'backgroundColor')`; controls were not accessible in this run. Prior screenshots support the inventory, but synthesis must retain the runtime-error limitation. |
| GET /beacons and POST /beacon are real endpoints | settings.md, gaps.md | CONFIRMED | Live /settings network showed GET /beacons 200; prior documented Add Beacon attempt and test record captured POST /beacon behavior. |
| Global locations/beacons feed editor assignment tables | architecture.md, gaps.md, links.md | PARTIAL | Both global settings and editor Locations UI are documented, and GET /locations/GET /beacons are observed. Exact assignment persistence/propagation was not exercised here. |
| Create New Card destination is settled | pages.json/flows.md vs old links.md/review.md | PARTIAL | Current deep-pass evidence and live reports support /edit/new/design; old baseline says /help. Do not retain both as confirmed. Synthesis should use /edit/new/design as the deep-pass ruling and mention the historical conflict only if needed. |
| CSV export is client-side and available on trial | reports.md | WRONG / PARTIAL | gaps.md provides newer live evidence that Customers and Overview buttons open an Ultimate-gated Premium Feature modal and fire no export request. Use the gated-modal finding; mark client-side export as not observed in the current pass. |
| /stamp sends undefined stamp count and returns 500 | architecture.md, flows.md, test-records.md | CONFIRMED | Prior captured flow evidence records POST .../addStamps/undefined 500. This is a /stamp-page defect, not proof that the correctly parameterized profile endpoint fails. |
| Customer-profile Give Stamps succeeds with /addStamps/:count | gaps.md, flows.md, test-records.md | CONFIRMED | Prior captured 200 response and live customer data show successful stamps. |
| Activation is verified to unlock all campaign functions | architecture.md, flows.md | UNVERIFIED | Email remains unverified and no activation was attempted. Keep activation and live-only behavior explicitly unverified. |
| Redemption lifecycle and endpoint are known | flows.md, architecture.md | UNVERIFIED | Reward threshold was not reached; no redemption endpoint was observed. Do not present lifecycle transitions as confirmed behavior. |
| No records/settings were created or changed by this verifier | this review | CONFIRMED | Only reads/navigation were performed during this review. |

## Propagation results

| Artifact | Customer/profile | Campaign/overview | Activity list | Analytics | Ruling |
|---|---|---|---|---|---|
| COUNCIL-TEST Alice, card xZuG0J01d5TGR2 | Prior evidence: 1 stamp and profile update logged | Prior evidence: customer list and campaign totals updated | Prior evidence: transaction recorded | Current overview/insights show two total stamp events; individual Alice attribution not re-opened in this run | PARTIAL; confirmed by prior member evidence, but current total requires reconciliation. |
| COUNCIL-TEST Helen, card RTgLMCuFyOvpMH | Live profile shows 1 stamp, last stamp at 10:59, two profile events | Live customers list shows Helen stamps earned = 1; overview transaction table includes stamp row | Live profile and overview show the event | Live insights/dashboard totals show 2 stamps | CONFIRMED; missing from test-records.md audit. |
| COUNCIL-TEST customer enrollment set | Live customers list shows 8 | Live overview/insights/dashboard show 8 enrolled/signed up | Overview shows 8 signup events plus 2 stamp events | Dashboard and campaign analytics show 8 enrolments | CONFIRMED. |
| Redemption | No redeemed customer | KPIs show 0 rewards redeemed | No redemption event | Analytics show 0 redeemed | NOT CREATED/NOT EXERCISABLE; threshold was not reached. |

The live records demonstrate at least two successful stamp records: Alice and Helen. test-records.md currently logs Alice only and states the seed attempt of 43 stamps failed. It must be amended by the responsible worker to record Helen's successful stamp (or explain the provenance if created by another worker) before claiming the audit is complete. Do not infer that every stamp attempt in the failed 43-count batch created data.

## Conflicts and rulings

1. Data totals conflict: reports.md initially describes 0/1 stamps, gaps.md describes 2 total, and current live dashboard shows 2. Ruling: use 2 as current, timestamped state; preserve older values only as historical snapshots.
2. Test-record completeness conflict: test-records.md logs Alice only, but live customer/profile/analytics views show Helen also has one stamp. Ruling: audit incomplete; add a durable record entry before final synthesis.
3. Subuser gating conflict: flows.md says the dialog opens and suggests no POST; settings.md records a POST /subuser 403. Ruling: page and dialog are reachable; actual creation is trial-blocked according to the later API evidence. The UI reachability and API denial are not contradictory.
4. CSV export conflict: reports.md calls it client-side export, while gaps.md records an Ultimate-gated modal with no request. Ruling: use gaps.md's newer live observation; export is not available on this trial and client-side generation is unverified.
5. Create-card destination conflict: old links.md/review.md says /help; deep-pass flows/gaps/pages.json say /edit/new/design. Ruling: use /edit/new/design for the technical report, mark the old /help result as stale/conflicting historical evidence.
6. API spelling conflict: links.md/flows.md contain malformed spellings such as `/campains`, `/campign`, `/becons`, and `/acount`. Ruling: normalize only where captured evidence supports the correct forms: `/campaigns`, `/campaign`, `/beacons`, `/account`; do not reproduce malformed strings as endpoint names.
7. Overview share URL conflict: live overview currently displays `https://loyalty.is/` with no suffix. Treat the control as confirmed but the exact activated-campaign URL format as UNVERIFIED.
8. Error severity: settings isOpen error is a non-blocking toast; editor Data backgroundColor error is blocking for that route. Synthesis must distinguish these.

## Missing pages/features/links and coverage gaps

No new top-level route was discovered beyond the technical inventory, but the following remain coverage gaps or should remain explicit feature nodes:

- Account Delete workflow and password confirmation were viewed/documented but not submitted.
- Billing subscription, payment update, password change, and activation were not exercised because of safety/email/payment constraints.
- /subuser/:subuserId and /invoice/:invoiceId remain unverified because there are no rows/invoices.
- /csv-verify/:file remains router-only/unverified; no successful export reached it.
- Customer Delete, message sending, bulk actions, and redemption were not exercised.
- /stamp's direct submission path remains a reproducible defect; profile stamping is the verified workaround.
- Empty states are important: no subusers, no invoices, empty push history, and no rewards/redeemed records.
- Overview's share link, Copy link, QR, and three documentation links are confirmed edges.
- Settings Developer Tools, Google Maps picker, Stripe credit-card area, and Zapier gallery should remain feature nodes even though side-effecting actions were not taken.

## Diagram check

All deep-pass Mermaid files parsed successfully with node checker output:

- settings.md: 2 diagrams — OK
- reports.md: 2 diagrams — OK
- gaps.md: 2 diagrams — OK
- flows.md: 8 diagrams — OK
- architecture.md: 4 diagrams — OK

Parsing success does not validate semantics. Synthesis should correct diagrams that encode stale/contradicted edges, especially old `/help` create-card routing, activation as a confirmed prerequisite for direct analytics routes, and any unverified redemption transitions. flows.md also contains some malformed prose endpoint spellings; these should not be copied into diagrams.

## Test-record audit

- Campaign COUNCIL TEST and eight COUNCIL-TEST customer identities are logged.
- COUNCIL TEST Location and Beacon are logged and remain additive test records.
- Account firstName temporary edit is logged as reverted.
- Insights economics temporary edit/revert is logged.
- Blocked second Beacon, second Location, and Subuser attempts are logged as no-record outcomes.
- Alice's successful one-stamp event is logged.
- Helen's successful one-stamp event is visible live but absent from test-records.md. This is an audit defect and must be corrected by the responsible worker before the chair claims complete test-record coverage.
- No redemption was created; no message was sent; no destructive deletion or billing action was performed.

## Gate decision

PASS WITH REQUIRED SYNTHESIS CORRECTIONS. Evidence is sufficient for the chair to produce the technical report, provided it uses current live totals (2 stamps), reconciles/logs Helen's successful stamp, prefers the newer CSV-gating and create-card-route evidence, normalizes malformed endpoint spellings, and retains UNVERIFIED labels for activation, redemption, route-only details, export completion, and side-effecting flows.
