---
title: GO IRL Bible Completion Roadmap
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-10
next_review: 2026-07-17
---

# GO IRL Bible Completion Roadmap

## Purpose

This file defines how to finish the GO IRL Bible without rewriting it from scratch.

Current rule: preserve existing material, classify it, compare it with the actual MVP and market positioning, then complete only the missing parts.

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
docs/bible/05-product-requirements-mvp-split.md
docs/bible/06-ux-interaction-guidelines.md
docs/bible/07-beta-readiness-and-operations.md
docs/bible/08-runtime-boundaries.md
```

Missing or not confirmed:

```text
docs/bible/05-product-requirements.md
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

### Step 3 — Complete Bible 1.0 critical gaps

Current writing order:

1. `docs/bible/05-product-requirements.md`
2. `docs/bible/09-governance-and-ai-organization.md`
3. `docs/bible/10-operations-and-release.md`

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
- multi-city catalog;
- friends vertical;
- travel vertical;
- dating vertical.

## Required checks before marking Bible final

1. Check against current code and Supabase schema.
2. Check against `README.md` and `RELEASE_NOTES.md`.
3. Check against `DOCS_INDEX.md` source-of-truth rules.
4. Check against `ROADMAP.md` and `BACKLOG.md`.
5. Check against `docs/MARKET_POSITIONING.md` and `docs/COMPETITOR_WATCH.md`.
6. Check against `docs/audit/KNOWLEDGE_DEBT.md`.

## Do not do from Bible cleanup

- Do not touch `.env`.
- Do not change secrets.
- Do not run or edit destructive SQL.
- Do not change Supabase RLS.
- Do not change auth.
- Do not refactor code.
- Do not mark beta-ready without quality gates.

## Status

Current status: **Bible 1.0 in progress**.

Next file:

```text
docs/bible/05-product-requirements.md
```
