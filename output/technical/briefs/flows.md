# Brief: Create and edit flows (linker)

Output: /Users/fahad/council/output/technical/flows.md

Exercise the main create/edit flows end to end with COUNCIL-TEST data, capture the exact API sequence, and prove where each record propagates. Read the survey first and follow the flows it actually found. The list below is the expected loyalty shape; if a flow does not exist, say so and document the closest one. Skip anything that changes billing, sends a real push or email to customers, or deletes the account.

Flows (in this order, since later ones reuse earlier records):

1. Program or card: create a COUNCIL-TEST stamp card (or the primary card type the UI offers), set a reward threshold, edit it.
2. Location: create a COUNCIL-TEST location if the UI allows it without a paid upgrade.
3. Customer: enroll or create a COUNCIL-TEST customer with a fake email (council-test+<n>@example.com). Do not use a real phone number. Inspect the profile and its tabs.
4. Earn: add stamps or points to that customer. Do it twice with the same action if the UI allows, and record whether the second one was rejected or applied.
5. Redeem: redeem the reward if the balance is high enough; if reaching the threshold would take too many clicks, document the redeem dialog with one real redemption only when it is cheap to reach, otherwise open the dialog and record the validation.
6. Staff user: create a COUNCIL-TEST stamper if the UI allows it. If the UI says this changes billing or subscription cost, stop and document instead.
7. Campaign or message: open the composer and save a DRAFT only if that is possible. Never send or schedule.

For each flow:

- Steps and every form field (label, type, required, validation). Submit once with required fields empty to capture validation messages.
- The API calls in order (method, path/operation, request field names, response field names, status).
- Resulting state and where the record now appears (customer profile, program stats, activity list, analytics). Check each place and record yes/no with evidence.
- A sequenceDiagram (actor -> UI -> API endpoints) per flow.

Also produce stateDiagram-v2 lifecycles for the entities whose states the UI exposes (program published/paused, pass active/void, reward locked/available/redeemed). Only include states you observed or the UI exposes.

Log every record in test-records.md as you create it.

Sections of flows.md: one section per flow, Propagation matrix (record x page), Lifecycles, Validation rules summary.
