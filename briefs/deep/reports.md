# Brief: Reports and analytics (cartographer)

Output: {{COUNCIL_DIR}}/output/technical/reports.md

Map every report or analytics view the dashboard actually has. If the product has a statistics home instead of a report library, document that and do not invent a report catalogue.

1. Open the reports or statistics area and enumerate every category, chart, and saved view (including favourites and anything plan-gated).
2. For each view: name, purpose, route, filters (date range, location, program, staff member, etc.), grouping options, columns/metrics with what each means, charts, drill-downs (where clicking a row leads), export formats, scheduling/email options, the API call(s) that load the data (method, path/operation, key params, response field names).
3. For each view, name the source entities and the features that feed it (e.g. "stamps this week" <- earn events). Note gated views and what the gate says.
4. Diagrams: a flowchart "entities/features -> analytics", and a classDiagram of the reporting model if the API reveals one.

Sections of reports.md: Catalogue table (name, category, gated, export), one section per view, Data lineage, Diagrams.
