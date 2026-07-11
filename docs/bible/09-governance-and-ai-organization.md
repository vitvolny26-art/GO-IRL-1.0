---
title: Governance and AI Organization
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# Governance and AI Organization

## Purpose

This Bible chapter defines how GO IRL uses AI roles, councils, documentation governance, and external analysis tools during MVP stabilization.

It does not replace the operational governance files. It summarizes their rules for the project Bible.

Primary sources:

- `DOCS_INDEX.md`
- `docs/governance/AI_ORGANIZATION.md`
- `docs/governance/KNOWLEDGE_PLATFORM.md`
- `docs/onboarding/ARCHIVIST_CHARTER.md`
- `docs/onboarding/AI_ROLES.md`
- `docs/reports/README.md`
- `docs/audit/KNOWLEDGE_DEBT.md`

## Governance principle

GO IRL is stabilized by small, reviewed changes.

The project must not be rewritten during MVP beta preparation.

Every important decision must answer four questions:

1. Product: does it help users meet in real life?
2. Tech: can it be done safely without breaking the current architecture?
3. QA: how can it fail and how will it be verified?
4. Archivist: which documents, status records, ADRs, or Knowledge Debt items must change?

## Source-of-truth hierarchy

The source-of-truth hierarchy is:

1. Current code and migrations for implemented reality.
2. `README.md` for current code scope and setup.
3. `supabase/schema.sql` and `supabase/migration_v*.sql` for current data model.
4. `supabase/README.md` for Supabase operations.
5. `docs/GO_IRL_CONSTITUTION.md` for philosophy and architecture principles.
6. `docs/MARKET_POSITIONING.md` for market and MVP feature filtering.
7. `DOCS_INDEX.md` for documentation status and registry decisions.
8. Audit docs for known conflicts and gaps.
9. Bible boundary chapters for product scope and long-term product memory.
10. Future architecture docs.
11. Historical snapshots.

Bible files preserve product knowledge, but they must not override current code, Supabase schema, auth, RLS, or release-state documents.

## AI role model

GO IRL uses role-based AI collaboration.

Core roles:

| Role | Responsibility |
|---|---|
| Chief AI Officer | Coordinates roles, resolves conflicts, and produces final decision. |
| Product Lead | Protects MVP scope, user value, roadmap, and product thesis. |
| Tech Lead | Protects architecture, code quality, and implementation safety. |
| QA Lead | Protects beta readiness, tests, regressions, and verification discipline. |
| Project Archivist | Protects memory, source-of-truth hierarchy, documentation continuity, and Knowledge Debt. |
| Security Lead | Protects auth, secrets, RLS boundaries, abuse prevention, and release safety. |
| Supabase Steward | Protects database schema, migrations, Storage, and RLS-sensitive data boundaries. |
| Release Manager | Protects Vercel, CI, release notes, deployment gates, and smoke checks. |
| UX Lead | Protects Telegram Mini App flows, cards, onboarding, empty states, and mobile ergonomics. |
| Market Analyst | Protects competitor intelligence without allowing competitors to expand MVP scope automatically. |

Every role must follow the universal safety rules:

- Do not rewrite architecture without explicit approval.
- Do not change `.env`, secrets, Supabase RLS, auth, or destructive SQL without explicit approval.
- Use `pnpm`, not `npm`.
- Do not commit `package-lock.json`, `node_modules`, `dist`, build output, or backup files.
- Work one focused task at a time.
- Understand where a file is used before changing it.
- Do not claim green status unless checks actually passed.
- Future vision does not override current MVP.
- Competitor ideas are inputs, not requirements.
- Documentation structure/status changes must update `DOCS_INDEX.md`.

## Council model

AI councils are used when one role is not enough.

### Executive Council

Used for strategic decisions:

- product direction changes;
- architecture direction changes;
- MVP scope expansion;
- cross-domain features;
- role disagreement.

Minimum viewpoints:

- Chief AI Officer;
- Product Lead;
- Tech Lead;
- Project Archivist.

### Product Council

Used for feature design, onboarding, event flow, user feedback, UX, and MVP scope decisions.

Minimum viewpoints:

- Product Lead;
- UX Lead;
- Community Manager or beta feedback role;
- Growth Strategist when sharing/retention is affected.

### Engineering Council

Used for architecture, Supabase, auth, RLS, security, core data flow, or non-trivial technical surface.

Minimum viewpoints:

- Tech Lead;
- Frontend Lead;
- Backend Lead;
- Supabase Steward;
- Security Lead.

### Delivery Council

Used for release, CI, Vercel, regression, build/test failures, sprint readiness, or incidents.

Minimum viewpoints:

- QA Lead;
- Release Manager;
- Sprint Planner;
- Incident Commander when production/beta is affected.

### Knowledge Council

Used for source of truth, Bible, DOCS_INDEX, AI onboarding, ADR, audits, reports, and Knowledge Debt.

Minimum viewpoints:

- Project Archivist;
- Knowledge Curator;
- Technical Writer.

## Archivist role

The Archivist protects project memory.

The Archivist ensures that future humans and AI agents can understand:

- why GO IRL exists;
- what the current MVP scope is;
- what is future vision;
- why important decisions were made;
- which documents are source of truth;
- what must not be broken during stabilization.

The Archivist must:

- maintain `DOCS_INDEX.md` as the documentation registry;
- preserve historical files without letting them override current implementation truth;
- keep Bible files protected from accidental rewrite or misuse;
- track documentation conflicts and Knowledge Debt;
- move important decisions from chat into persistent documents;
- maintain AI onboarding documents;
- keep market intelligence and competitor watch documents current;
- make sure documentation changes do not imply code, SQL, RLS, auth, secret, or destructive migration changes.

## Knowledge platform rules

The project knowledge rule is:

```text
Chat is temporary memory. Documentation is permanent memory.
```

Important knowledge should move through this pipeline:

```text
Chat / idea / discovery
    -> Draft note
    -> Review by relevant role
    -> Permanent document
    -> DOCS_INDEX update
    -> Source-of-truth classification
```

A document can be source of truth only when:

- it has a clear owner;
- it has status `Active` or `Approved`;
- it has no unresolved conflict with current code/schema/product reality;
- it is registered in `DOCS_INDEX.md`;
- related deprecated documents point to it or are clearly marked.

## Document status model

Allowed statuses:

```text
Draft
Review
Approved
Active
Deprecated
Archived
```

Preferred metadata header:

```yaml
title:
owner:
status:
source_of_truth:
last_review:
next_review:
```

Strategic and operational documents should have metadata before they are promoted as source of truth.

## External AI tools

External AI tools are analysis assistants only.

### NotebookLM

NotebookLM is used for reading large exported project context and producing reports.

NotebookLM must not be treated as source of truth.

NotebookLM findings must be verified against GitHub before changing:

- `DOCS_INDEX.md`;
- `docs/audit/KNOWLEDGE_DEBT.md`;
- Bible files;
- README/ROADMAP/BACKLOG/RELEASE_NOTES;
- code;
- Supabase;
- release gates.

### Gemini

Gemini may act as Assistant Archivist.

Gemini may:

- find inconsistencies;
- detect broken links;
- detect missing metadata;
- compare docs and code;
- propose Knowledge Debt;
- write reports.

Gemini must not:

- approve source-of-truth changes;
- close Knowledge Debt without review;
- modify Supabase/auth/RLS/secrets;
- expand MVP scope;
- rewrite architecture;
- force push;
- treat Google Drive as newer than GitHub.

### Google Drive

Google Drive may store exports and AI reports.

Google Drive is not source of truth.

GitHub remains the source of truth.

### n8n

n8n may later automate copying reports and notifying the Archivist.

n8n must not:

- auto-merge;
- auto-push code changes;
- close Knowledge Debt;
- modify `DOCS_INDEX.md` without review;
- edit Supabase/auth/RLS/secrets;
- change beta scope.

## Report discipline

AI or helper reports should be saved under:

```text
docs/reports/YYYY-MM-DD-[agent-or-task]-report.md
```

Every report must state:

- status;
- owner;
- source-of-truth status;
- findings;
- accepted items;
- rejected or unverified items;
- next actions;
- unsafe areas that must not be touched.

Reports are inputs. Accepted findings must be promoted into source-of-truth docs through normal review.

## Knowledge Debt discipline

Knowledge Debt tracks missing, stale, conflicting, duplicated, or misleading project knowledge.

Knowledge Debt must be recorded in:

```text
docs/audit/KNOWLEDGE_DEBT.md
```

Debt items must have:

- ID;
- title;
- type;
- severity;
- owner;
- status;
- due date;
- notes.

Knowledge Debt can be closed only when the fix is documented and verified.

## MVP governance guardrails

For the closed beta:

- Olomouc remains the only active market focus.
- The canonical beta categories remain: Volleyball, Running, Walking, Coffee meetup, Board games, Language exchange.
- Extra activity options are experimental/test taxonomy unless explicitly promoted through Product Lead and Archivist review.
- Competitor signals must not automatically become MVP scope.
- The beta loop is: create event -> share -> join -> chat -> real-life attendance.
- Features that increase scrolling without increasing real-life attendance are future scope.

Do not build before beta:

- payments;
- club CRM;
- subscriptions/premium;
- AI recommendations;
- post-event feed;
- public ratings/reviews;
- direct messages;
- complex profiles;
- broad multi-city catalog;
- dating/friends/travel/lifestyle verticals.

## Decision escalation

Escalate to the relevant council when:

- MVP scope changes;
- source-of-truth status changes;
- Supabase/auth/RLS/secrets are involved;
- a report contradicts GitHub reality;
- roadmap and code disagree;
- Bible and current implementation disagree;
- release readiness is claimed;
- a feature crosses product, tech, QA, and release boundaries.

## Definition of done for governance changes

A governance/documentation change is done only when:

1. The new or changed document has metadata.
2. `DOCS_INDEX.md` is updated when registry/status changes.
3. Knowledge Debt is updated when a debt item is opened, changed, or closed.
4. Unsafe areas are explicitly not touched.
5. The final report says whether code checks were run.

For docs-only GitHub edits, `lint/build/test` may be skipped, but the final report must say that they were not run.
