---
title: GO IRL Bible Completion Roadmap
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# GO IRL Bible Completion Roadmap

## Purpose

This file defines how to finish and maintain the GO IRL Bible without rewriting it from scratch.

Current rule: preserve existing material, classify it, compare it with the actual MVP and market positioning, then complete only missing parts.

Market scope is controlled by:

- `docs/MARKET_POSITIONING.md`
- `docs/COMPETITOR_WATCH.md`
- `docs/market/README.md`
- `docs/market/CONTINUOUS_COMPETITOR_INTELLIGENCE.md`

These files prevent competitor-inspired or future-platform ideas from entering MVP scope without passing the beta guardrail.

## Current Bible state

Confirmed active Bible files:

```text
docs/bible/00-completion-audit.md
docs/bible/00-bible-roadmap.md
docs/bible/01-foundation/00-foundation-overview.md
docs/bible/01-foundation/01-product-philosophy.md
docs/bible/01-foundation/01-why-we-exist.md
docs/bible/01-foundation/02-core-principles.md
docs/bible/01-foundation/03-mvp-scope-and-market-positioning.md
docs/bible/02-platform-architecture.md
docs/bible/03-database-and-supabase-boundaries.md
docs/bible/04-modules-architecture.md
docs/bible/04-modules-mvp-audit.md
docs/bible/05-product-requirements.md
docs/bible/05-product-requirements-mvp-split.md
docs/bible/06-ux-interaction-guidelines.md
docs/bible/07-beta-readiness-and-operations.md
docs/bible/08-runtime-boundaries.md
docs/bible/09-governance-and-ai-organization.md
docs/bible/10-operations-and-release.md
```

No current Bible 1.0 MVP boundary chapter is missing.

## Completed target chapters

The former remaining target chapters are now created and registered:

```text
docs/bible/09-governance-and-ai-organization.md
docs/bible/10-operations-and-release.md
```

`03-database-design.md` is treated as replaced for current Bible 1.0 by:

```text
docs/bible/03-database-and-supabase-boundaries.md
```

## Completion strategy

### Step 1 — Preserve

Status: done.

Existing useful Bible content must not be deleted blindly.

### Step 2 — Correct actual file state

Status: done for current pass.

The completion audit separates confirmed files from missing/not-confirmed files.

### Step 3 — Complete Bible 1.0 target chapters

Status: done for current pass.

Completed chapters:

1. `docs/bible/09-governance-and-ai-organization.md`
2. `docs/bible/10-operations-and-release.md`

### Step 4 — Maintain and reconcile

Status: active.

The Bible is now structurally complete for MVP 1.0 / MVP 1.1 beta boundaries, but it still needs periodic reconciliation against:

- current code;
- Supabase schema and migrations;
- `README.md`;
- `ROADMAP.md`;
- `BACKLOG.md`;
- `RELEASE_NOTES.md`;
- `DOCS_INDEX.md`;
- Knowledge Debt.

## Bible 1.0 target structure

```text
docs/bible/
├── 00-completion-audit.md
├── 00-bible-roadmap.md
├── 01-foundation/
│   ├── 00-foundation-overview.md
│   ├── 01-product-philosophy.md
│   ├── 01-why-we-exist.md
│   ├── 02-core-principles.md
│   └── 03-mvp-scope-and-market-positioning.md
├── 02-platform-architecture.md
├── 03-database-and-supabase-boundaries.md
├── 04-modules-architecture.md
├── 04-modules-mvp-audit.md
├── 05-product-requirements.md
├── 05-product-requirements-mvp-split.md
├── 06-ux-interaction-guidelines.md
├── 07-beta-readiness-and-operations.md
├── 08-runtime-boundaries.md
├── 09-governance-and-ai-organization.md
└── 10-operations-and-release.md
```

## Naming decision

Use current-scope names for newly written Bible files.

Current replacement name:

```text
docs/bible/03-database-and-supabase-boundaries.md
```

instead of restoring future-only:

```text
docs/bible/03-database-design.md
```

Reason: current Bible 1.0 must describe actual Supabase boundaries, trusted auth, demo safety, and RLS constraints, not only future database vision.

## Bible 1.0 must explicitly cover

- GO IRL as Telegram-first local meetup layer.
- Olomouc closed beta.
- Six beta categories: Volleyball, Running, Walking, Coffee meetup, Board games, Language exchange.
- Core event loop: create, share, join, chat, attend.
- Browser Demo Mode.
- Telegram Mini App constraints.
- Trusted Telegram auth reality.
- Supabase current schema boundary.
- Sport Coach MVP 1.1.
- Activity Chat boundaries.
- Share / join boundaries.
- Weather widget boundaries.
- QA and release gates.
- AI roles, councils, Archivist, and external AI tool boundaries.
- What is not included in MVP.

## Bible 1.1+ scope

Future material must be clearly marked as future vision.

Future-only topics include:

- universal Event Roles;
- paid coach marketplace;
- ticketing;
- subscriptions;
- public ratings;
- direct messages;
- AI recommendations;
- AI event discovery;
- multi-city catalog.
