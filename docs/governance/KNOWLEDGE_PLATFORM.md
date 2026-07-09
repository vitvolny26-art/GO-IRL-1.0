---
title: GO IRL Knowledge Platform
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-09
next_review: 2026-10-01
---

# GO IRL Knowledge Platform

## Purpose

This document defines the strategic architecture of GO IRL knowledge management.

It is the source of truth for how project knowledge is classified, reviewed, preserved, and promoted from temporary chat context into permanent documentation.

## Core principle

```text
Chat is temporary memory. Documentation is permanent memory.
```

If important knowledge exists only in chat, it is considered at risk of being lost.

## Knowledge levels

GO IRL documents are grouped into four levels.

### Level 1 — Immutable

Rarely changed. Changes require Executive Council review.

Examples:

- Mission
- Constitution
- Manifesto
- Project DNA
- Codex

### Level 2 — Strategic

Changed several times per year. Changes require role review and documentation update.

Examples:

- Bible
- Roadmap
- ADR
- Market Positioning
- AI Organization
- Governance

### Level 3 — Operational

Changed regularly during active work.

Examples:

- Backlog
- Sprint docs
- QA docs
- Release docs
- Competitor reports
- Playbooks
- Audit docs

### Level 4 — Dynamic

Updated continuously or whenever new input appears.

Examples:

- Research notes
- Founder notes
- Lessons learned
- Feedback
- Analytics
- Watchlist
- Monthly reports

## Knowledge Status Model

Every important document must have a status.

Allowed statuses:

```text
Draft
Review
Approved
Active
Deprecated
Archived
```

### Status meanings

| Status | Meaning |
|---|---|
| Draft | Work in progress. Not source of truth. |
| Review | Ready for review by relevant role/council. |
| Approved | Accepted, but not necessarily live operational source. |
| Active | Current working source. Can be source of truth. |
| Deprecated | Preserved but should not be used for new work. Must point to replacement if possible. |
| Archived | Historical only. Not used for current work. |

## Required document metadata

Every strategic or operational document should start with metadata.

Preferred format:

```yaml
title: AI Organization
owner: Executive Council
status: Active
source_of_truth: true
last_review: 2026-07-01
next_review: 2026-10-01
```

Minimum required metadata:

```yaml
title:
owner:
status:
source_of_truth:
last_review:
next_review:
```

This enables future automated documentation audit and KPI tracking.

## Source of truth rule

A document can be source of truth only when:

- it has clear owner;
- it has status `Active` or `Approved`;
- it has no unresolved conflict with current code/schema/product reality;
- it is registered in `DOCS_INDEX.md`;
- related deprecated documents point to it or are clearly marked.

## Knowledge pipeline

New knowledge must move through this pipeline:

```text
Chat / idea / discovery
    ↓
Draft note
    ↓
Review by relevant role
    ↓
Permanent document
    ↓
DOCS_INDEX update
    ↓
Source-of-truth classification
```

## Knowledge Debt

Knowledge debt is project risk caused by missing, stale, conflicting, or undocumented knowledge.

Examples:

- missing ADR for strategic decision;
- Bible chapter not reconciled with MVP;
- outdated roadmap;
- stale competitor analysis;
- docs without owner;
- docs without status;
- current code contradicts documentation;
- historical snapshot looks like current truth;
- chat contains important decision that was never documented.

Knowledge debt should be tracked in:

```text
docs/audit/KNOWLEDGE_DEBT.md
```

## Knowledge KPIs

The Archivist should track these metrics.

| Metric | Target |
|---|---:|
| Documents with status | 100% |
| Documents with owner | 100% |
| Documents with last review date | 100% |
| Documents with next review date | 100% |
| Active docs registered in DOCS_INDEX | 100% |
| Strategic decisions with ADR | 100% |
| Open documentation conflicts | Minimal |
| Last competitor review | <= 30 days |
| Last roadmap review | <= 30 days |
| Last Bible review | <= 90 days |
| Last ADR review | <= 90 days |

## Knowledge Review Calendar

### Weekly

Review:

- `DOCS_INDEX.md`;
- newly created docs;
- Knowledge Debt;
- open documentation conflicts.

### Monthly

Review:

- competitors;
- watchlist;
- market trends;
- technology changes;
- playbooks;
- roadmap/backlog alignment.

### Quarterly

Review:

- Bible;
- Constitution;
- Codex;
- AI Organization;
- ADR;
- governance docs.

### Yearly

Review:

- Mission;
- Manifesto;
- Project DNA;
- long-term strategy;
- knowledge platform architecture.

## Archivist activation rule

The Archivist must be involved when:

- source of truth changes;
- new strategic document is created;
- document status changes;
- a document is deprecated or archived;
- a strategic decision is made;
- Bible, Roadmap, ADR, or Governance changes;
- competitor analysis affects product scope;
- a major epic is completed;
- sprint documents are moved or reorganized.

## Project Memory Bus

For every important change, ask:

```text
Should this be preserved in permanent project memory?
```

If yes, the Archivist must decide where it belongs:

- ADR;
- Bible;
- Roadmap;
- Backlog;
- Audit;
- History;
- Market;
- Research;
- Playbook;
- Governance;
- DOCS_INDEX.

## Do not expand document types blindly

The current knowledge architecture is enough for GO IRL Knowledge Platform 1.0.

Future work should prioritize:

1. Completing documentation sync into `GO-IRL-1.0`.
2. Filling existing approved structure with real content.
3. Adding missing ADR for key decisions.
4. Moving competitor analysis into `docs/market/`.
5. Creating playbooks and governance docs.
6. Running regular knowledge reviews.

Do not create new categories unless an existing category cannot hold the knowledge cleanly.

## Final rule

```text
Knowledge is a project asset equal to code.
```

GO IRL is a Knowledge-Driven Product with AI-assisted governance.
