---
title: GO IRL Bible Completion and Maintenance Roadmap
owner: Project Archivist
status: Active
source_of_truth: true
authority_scope: bible_structure_and_maintenance
canonical_product_roadmap_document_id: 12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw
last_review: 2026-07-26
next_review: 2026-08-09
---

# GO IRL Bible Completion and Maintenance Roadmap

## Purpose

This file defines how to maintain the GO IRL Bible without allowing preserved product vision to override the canonical Product Roadmap, current lifecycle phase, or verified implementation evidence.

The Bible preserves product philosophy, boundaries, requirements, architecture principles, UX rules, governance, and release doctrine.

It does not independently authorize roadmap sequencing or implementation work.

## Authority hierarchy

1. Verified runtime evidence and GitHub `main` control code, implementation state, tests, schemas, auth, RLS, migrations, deployment, and production configuration.
2. The canonical Product Roadmap controls product sequencing, phase definitions, product gates, and authorization of future scope.
3. `docs/release/CURRENT_PHASE.md` controls the current lifecycle-phase statement.
4. Bible chapters define durable product principles and domain boundaries within those higher-authority constraints.
5. Sprint 0–5 files preserve historical execution records and gated planning inputs; they do not authorize implementation by themselves.

Canonical Product Roadmap:

https://docs.google.com/document/d/12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw/edit

Stable Document ID: `12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw`.

Root GitHub `ROADMAP.md` is a delegating locator only.

## Current project state

Closed Beta completed on 2026-07-20.

The current phase is:

**Release Preparation and focused post-beta stabilization**.

Broad public launch is not yet claimed.

Bible references to closed beta remain valid as historical acceptance criteria and preserved MVP boundaries. They must not be read as the current lifecycle phase.

## Current Bible state

The Bible is structurally complete for MVP 1.0 / MVP 1.1 boundaries and remains under active reconciliation.

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

No current Bible 1.0 boundary chapter is missing.

## Roadmap-to-Bible mapping

| Canonical roadmap area | Primary Bible support | Bible responsibility |
|---|---|---|
| Product thesis and guardrails | `01-foundation/*`, `03-mvp-scope-and-market-positioning.md` | Preserve the real-life meetup thesis, Olomouc evidence baseline, non-goals, and market filter. |
| Foundation and MVP Core | `02-platform-architecture.md`, `05-product-requirements-mvp-split.md`, `06-ux-interaction-guidelines.md` | Define durable product and UX boundaries without claiming current implementation proof. |
| Release Preparation and Stabilization | `07-beta-readiness-and-operations.md`, `08-runtime-boundaries.md`, `10-operations-and-release.md` | Define release discipline, runtime safety, smoke checks, and post-beta stabilization rules. |
| Telegram and Notifications | `08-runtime-boundaries.md`, notification-related PRD classifications | Preserve Mini App constraints and keep advanced automation gated. |
| Trust and Real Attendance | `05-product-requirements-mvp-split.md`, trust/reputation boundary material | Keep RLI, attendance, reviews, ratings, and public trust systems future until explicitly approved. |
| Modules and Discovery | `04-modules-architecture.md`, `04-modules-mvp-audit.md` | Preserve modular architecture while preventing automatic scope expansion. |
| Production Growth | `10-operations-and-release.md`, governance chapters | Define safety, moderation, analytics, support, and operational prerequisites. |

## Sprint-to-Bible mapping

- Sprint 0 and Sprint 1 are historical records. Bible chapters preserve their durable lessons, not their old deployment evidence.
- The active Release Preparation bridge is supported by Bible operations/runtime chapters and is not a replacement numbered sprint.
- Sprint 2 maps to Telegram/runtime boundaries.
- Sprint 3 maps to trust and attendance boundaries.
- Sprint 4 maps to module architecture and market-positioning guardrails.
- Sprint 5 maps to release operations, moderation, analytics, and public-safety doctrine.

The canonical detailed mapping is maintained in `docs/roadmap/SPRINTS.md`.

## Maintenance strategy

### 1. Preserve

Do not delete useful historical Bible content merely because the lifecycle phase changed.

### 2. Classify

Every statement must be understood as one of:

- durable product principle;
- current boundary;
- historical beta criterion;
- future vision;
- verified implementation fact owned elsewhere.

### 3. Reconcile

Periodically compare Bible chapters against:

- the canonical Drive Product Roadmap;
- `docs/release/CURRENT_PHASE.md`;
- `README.md`;
- `RELEASE_NOTES.md`;
- `DOCS_INDEX.md`;
- current Supabase and runtime evidence;
- `docs/roadmap/SPRINTS.md`;
- Knowledge Debt.

### 4. Do not overclaim

Bible chapters must not claim that a feature, migration, deployment, check, or production configuration is current merely because it exists in a preserved requirement or architecture section.

## Durable Product Bible boundaries

The Bible must continue to cover:

- GO IRL as a Telegram-first local meetup layer;
- the create-share-join-chat-meet loop;
- the proven Olomouc baseline;
- historical six-category beta evidence;
- Browser Demo Mode safety;
- Telegram Mini App constraints;
- trusted Telegram auth principles;
- Supabase and RLS boundaries;
- Sport Coach as a bounded validation track;
- Activity Chat boundaries;
- share and join behavior;
- weather as a non-blocking helper;
- QA and release gates;
- AI roles and governance boundaries;
- explicit MVP and platform non-goals.

## Future-only material

The following remain future unless the canonical Product Roadmap explicitly authorizes them and required gates are proven:

- universal Event Roles;
- paid coach marketplace;
- ticketing or payments;
- subscriptions;
- public ratings or leaderboards;
- direct messages;
- public RLI or Trust Score;
- AI recommendations or AI event discovery;
- broad multi-city catalog;
- Friends, Travel, or Dating verticals;
- large-scale growth mechanics.

## Synchronization rule

When the canonical Product Roadmap changes:

1. Update Bible chapters only if a durable principle, boundary, or doctrine changed.
2. Do not duplicate the full roadmap inside the Bible.
3. Update `docs/roadmap/SPRINTS.md` if phase-to-sprint interpretation changed.
4. Preserve historical beta evidence and mark it as historical rather than rewriting it.
5. Open Knowledge Debt when a contradiction cannot be safely resolved in the same change.