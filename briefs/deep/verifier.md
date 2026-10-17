# Brief: Verify the deep technical pass (verifier)

Output: {{COUNCIL_DIR}}/output/technical/review.md

Inputs: settings.md, reports.md, gaps.md, flows.md, architecture.md, test-records.md in {{COUNCIL_DIR}}/output/technical/.

1. Cross-check the five files against each other and against the first survey: conflicting route names, endpoints, entity fields, or links; pages present in one file and missing in another.
2. Propagation check in the live dashboard (lists load asynchronously: wait for the table to render and use the page's search for "COUNCIL-TEST" before concluding a record is missing): for the COUNCIL-TEST customer, earn event, and redemption in test-records.md, confirm they appear on the customer profile, the program or card, the activity list, and the relevant analytics. Record yes/no with evidence. If a record type was not created, say why.
3. Spot-check at least 25% of claims in each file in the live dashboard (prioritise endpoints, form validation rules, settings effects, analytic metrics). Verdict table: claim | file | CONFIRMED / WRONG / PARTIAL / UNVERIFIED | evidence.
4. Run `node {{COUNCIL_DIR}}/check-mermaid.mjs` on every file and list diagrams that fail; check diagrams match the evidence (no invented entities or edges).
5. Confirm test-records.md is complete (every COUNCIL-TEST record you see in the dashboard is logged).

Sections of review.md: Summary with confidence per file, Verdict table, Propagation results, Conflicts and rulings, Diagram check, Test-record audit.
