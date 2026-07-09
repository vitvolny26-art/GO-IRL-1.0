# GO IRL Knowledge Platform 1.0

Status: Current planning epic
Owner: Project Archivist
Last updated: 2026-07-09

## Purpose

This epic turns GO IRL documentation into a managed knowledge system.

The goal is not to create more documents for their own sake.

The goal is to make sure future humans and AI agents can understand:

- what GO IRL is;
- what is current MVP;
- what is future vision;
- why decisions were made;
- how to work safely in the project;
- what competitors do and how GO IRL should respond;
- what must be preserved.

## Rule

Do the work in order.

Do not start broad restructuring until the base documentation is synchronized.

## Phase 1 — Finish documentation sync

Goal:

```text
GO-IRL-1.0 contains the essential documentation from GO-IRL.
```

Required work:

- sync `README.md`;
- sync `ROADMAP.md`;
- sync `BACKLOG.md`;
- sync `RELEASE_NOTES.md`;
- sync key docs under `docs/`;
- sync key `project-audit/` docs if still relevant;
- keep `DOCS_INDEX.md` updated.

Done when:

- essential docs exist in `GO-IRL-1.0`;
- no known source-of-truth file is missing;
- `DOCS_INDEX.md` lists current status;
- deprecated files are marked and have replacements.

## Phase 2 — Normalize documentation structure

Goal:

```text
Documentation has stable directories and clear ownership.
```

Target structure:

```text
docs/
├── onboarding/
├── governance/
├── bible/
├── roadmap/
├── market/
├── product/
├── architecture/
├── audit/
├── qa/
├── operations/
├── adr/
├── history/
├── brain/
└── playbooks/
```

Required work:

- move sprint docs into `docs/roadmap/`;
- move market docs into `docs/market/`;
- move audit docs into `docs/audit/` where safe;
- keep root files only for core entry points;
- update internal links;
- update `DOCS_INDEX.md` after each move.

Do not blindly move files.

Each move must preserve history and update references.

## Phase 3 — Complete Bible and ADR foundation

Goal:

```text
Product philosophy, MVP boundaries, and key decisions are persistent.
```

Required work:

- finish Bible gaps listed in `docs/bible/00-completion-audit.md`;
- keep future vision labeled;
- create ADR index;
- create ADRs for key decisions:
  - Telegram Mini App first;
  - Olomouc first;
  - Browser Demo Mode;
  - Trusted Telegram Auth;
  - Temporary Activity Chat;
  - Sport Coach MVP;
  - Six beta categories;
  - Weather Widget;
  - Share Flow;
  - Documentation Architecture.

Done when:

- strategic decisions are no longer only in chats;
- Bible no longer implies unsafe current implementation changes;
- future vision and MVP scope are separated.

## Phase 4 — Market Intelligence

Goal:

```text
New features are checked against competitors before design starts.
```

Required docs:

```text
docs/market/COMPETITOR_ANALYSIS.md
docs/market/COMPETITOR_WATCH.md
docs/market/FEATURE_BENCHMARK.md
docs/market/UX_PATTERNS.md
docs/market/MARKET_RULES.md
docs/market/WATCHLIST.md
docs/market/MONTHLY_REPORTS/
```

Required rule:

Before recommending a new product feature, check:

1. Is this solved by competitors?
2. How do at least three relevant products organize it?
3. What works?
4. What should not be copied?
5. Does it support the GO IRL core loop?
6. Does it match `Меньше скроллинга. Больше жизни`?

Competitors are inputs, not requirements.

## Phase 5 — Governance and playbooks

Goal:

```text
Any agent can work by role and process without long re-explanation.
```

Required docs:

```text
docs/onboarding/ARCHIVIST_CHARTER.md
docs/onboarding/AI_ROLES.md
docs/governance/AI_ORGANIZATION.md
docs/governance/AI_CONSTITUTION.md
docs/governance/AI_ROLE_ASSIGNMENT.md
docs/governance/AI_DECISION_PROTOCOL.md
docs/governance/DOCUMENTATION_GOVERNANCE.md
docs/playbooks/START_NEW_FEATURE.md
docs/playbooks/FIX_CRITICAL_BUG.md
docs/playbooks/PREPARE_RELEASE.md
docs/playbooks/MARKET_REVIEW.md
```

Done when:

- user can assign a role with one sentence;
- agent knows what to read first;
- role boundaries are clear;
- council-style decision making is documented.

## Phase 6 — Regular reviews and knowledge health

Goal:

```text
Knowledge stays current after this cleanup.
```

Required docs:

```text
docs/audit/KNOWLEDGE_DEBT.md
docs/audit/KNOWLEDGE_HEALTH.md
docs/playbooks/DOCUMENTATION_REVIEW.md
docs/playbooks/MONTHLY_REVIEW.md
```

Review cadence:

| Cadence | Review |
|---|---|
| Weekly | DOCS_INDEX, new docs, Knowledge Debt |
| Monthly | competitors, watchlist, technologies, playbooks |
| Quarterly | Bible, ADR, AI Organization, Roadmap |
| Yearly | Mission, Constitution, long-term strategy |

Knowledge health metrics:

- documents with status;
- documents with owner;
- documents with last review date;
- documents with source-of-truth status;
- unresolved documentation conflicts;
- stale competitor reports;
- missing ADRs;
- incomplete Bible sections;
- broken internal links.

## Current progress

Completed or started:

- `docs/onboarding/ARCHIVIST_CHARTER.md`;
- `docs/onboarding/AI_ROLES.md`;
- `docs/governance/AI_ORGANIZATION.md`;
- Bible MVP boundary docs synced;
- `docs/MVP_DOC_AUDIT.md` synced;
- `docs/MISSING_SECTIONS.md` synced;
- `docs/DATABASE_SCHEMA_AUDIT.md` synced;
- `DOCS_INDEX.md` synced and updated with sprint decision.

Still open:

- complete documentation sync;
- normalize docs structure;
- write ADR foundation;
- create market intelligence pack;
- create governance/playbook pack;
- create knowledge health system.

## Hard boundaries

This epic is documentation-first.

Do not change:

- application code;
- `.env`;
- secrets;
- Supabase RLS;
- auth;
- destructive SQL;
- production data.

Any code or Supabase change must be a separate approved task.
