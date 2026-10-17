# Final plan round: common brief

The council has produced a plan (round 1) and revised it after an adversarial review (round 2). This round goes over the revised plan one last time and produces a single, self-contained `{{COUNCIL_DIR}}/output/plan/PLAN.md`: the document a team (or an AI agent in the new repo) builds the product from. Someone who reads only PLAN.md must understand what is being built, why each decision was made, how it compares to Loopy Loyalty, and in what order to build it.

## Product (unchanged)

Multi-tenant wallet-pass SaaS. Tenant = business, with multiple locations and staff. Customers belong to the tenant and hold a wallet pass. Every Apple Wallet pass style is in the product (store card, coupon, event ticket, boarding pass, generic); relevant locations are a feature of any pass, not a separate style. Django and Django REST framework, PostgreSQL, Celery and Redis for pass updates, and a React + TypeScript frontend. English + Arabic with full RTL from day one. KWD with 3 decimals wherever money appears; stamp and point balances are integers; per-location time zone. Kuwait first, then the GCC. A business asks us for an account and platform admin creates the tenant; public signup and subscription billing are the last phase only. MVP = that provisioned business can run a store card (stamps and points), a coupon, and a generic pass, each with relevant locations, enrollment, and pass update. Every current Google Wallet class is in the product as well. When a store already has an API, the MVP exposes a tenant API and signed webhooks so that system can enroll, earn, redeem, and void; a named connector for one POS is a later phase. Visual design comes from the owner's external design skill, so do not define visuals.

## Inputs

- Revised plan in `{{COUNCIL_DIR}}/output/plan/`: `decisions.md`, `IMPLEMENTATION_PLAN.md`, `CONVENTIONS.md`, `sql/`, `skills/`, `REVISION_LOG.md`.
- Earlier round material: `requirements.md`, `data-model.md`, `backend.md`, `frontend.md`, `review.md`, `review2/*.md` (including `adjudication.md`), `round1/`.
- Loopy Loyalty evidence: `{{COUNCIL_DIR}}/output/TECHNICAL_REPORT.md`, `FINAL_REPORT.md`, `pages.json`, `links.md`, `output/technical/*.md`.
- Product definition: `{{COUNCIL_DIR}}/output/plan/briefs/common.md`.

Where documents disagree, the precedence is: `decisions.md` (revised) > `REVISION_LOG.md` / `review2/adjudication.md` > `IMPLEMENTATION_PLAN.md` / `CONVENTIONS.md` > round 1 member files. If you find a remaining contradiction or mistake, do not paper over it: record it in a "Residual issues" section of your draft using the round 2 finding format (`### F-final-<area>-<n>` with Severity, Location, Problem, Evidence, Fix, Affects).

## Rules

- Write only your own draft under `{{COUNCIL_DIR}}/output/plan/final/drafts/`, incrementally (append section by section), in Markdown that can be pasted into PLAN.md as is.
- Clean room: compare with Loopy Loyalty's behaviour, never copy its UI, text, branding or API shapes, and never copy PassKit's API.
- Loopy Loyalty claims must cite the evidence file and section (for example `technical/flows.md § Earn`). Django, Celery, Postgres, Apple Wallet or Google Wallet claims that a decision depends on must be verified with web search and cite the URL.
- Diagrams are Mermaid only. Validate every file you write with `node {{COUNCIL_DIR}}/check-mermaid.mjs <file>` and fix until it passes. Keep each diagram readable (split large ones by area rather than drawing one giant chart).
- Use the canonical names from `loyalty-domain-glossary` and the canonical phase numbering from the revised `IMPLEMENTATION_PLAN.md`.
- Write for a reader who was not in the council: plain language first, then the technical detail.
