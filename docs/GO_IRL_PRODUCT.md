---
title: GO IRL Product
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# GO IRL Product

## Mission

**Less scrolling. More life.**

GO IRL is a platform for real participation and local offline meetings. It is not a social network.

## Product thesis

GO IRL shortens the path from weak intent to real attendance:

```text
create event -> share -> join/request -> event chat -> attend in real life
```

The main user problem is not the absence of event calendars. It is the trust and coordination gap between seeing an idea and actually showing up.

## Current lifecycle

- Closed Beta: completed on 2026-07-20.
- Current phase: Release Preparation and focused post-beta stabilization.
- Broad public launch: not claimed.
- Market focus: Olomouc-first.

Lifecycle authority: [`release/CURRENT_PHASE.md`](release/CURRENT_PHASE.md).

## Four-layer product model

### 1. Current production truth

Current GitHub `main` and verified runtime evidence define implementation truth. Current capabilities include the Activity-based product loop, trusted Telegram auth path, Browser Demo Mode, Sport and Generic experiences, share/join, temporary Activity Chat, weather, profile basics and provider preferences, map/calendar routing, and server-authoritative reminder/lifecycle foundations where verified.

Provider-specific enablement remains an operational fact, not a generic feature claim.

### 2. Proven Closed-Beta baseline

Olomouc and six canonical categories:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

They remain the default release baseline and historical acceptance evidence.

### 3. Approved next phase

Release Preparation:

- preserve the proven loop;
- keep current checks and runtime evidence green;
- verify Telegram, Vercel, Supabase, support, monitoring, analytics, moderation, and provider operations;
- improve clarity and reliability without uncontrolled expansion.

### 4. Long-term vision

Reusable platform surfaces, additional cities and verticals, Event Roles, AI discovery, recommendations, reputation, advanced moderation, and commercial capabilities may exist later. They are not current production claims.

## Product principles

- real attendance over screen time;
- local density over empty scale;
- trust before growth;
- Telegram-first;
- privacy and safety by default;
- one clear next action;
- no feature promotion from schema, adapter, competitor, report, or open PR alone.

## Product success

Primary outcome: joined users who attend in real life.

Supporting signals: creation completion, share opens, join conversion, chat activation, repeat organizers/participants, beginner comfort, cancellation/no-show rate, and provider delivery health where relevant.

## Product Bible

| Book | Link |
|---|---|
| Completion audit | [`bible/00-completion-audit.md`](bible/00-completion-audit.md) |
| Maintenance roadmap | [`bible/00-bible-roadmap.md`](bible/00-bible-roadmap.md) |
| I — Foundation | [`bible/01-foundation/00-foundation-overview.md`](bible/01-foundation/00-foundation-overview.md) |
| II — Platform Architecture | [`bible/02-platform-architecture.md`](bible/02-platform-architecture.md) |
| III — Database and Supabase Boundaries | [`bible/03-database-and-supabase-boundaries.md`](bible/03-database-and-supabase-boundaries.md) |
| IV — Module Architecture | [`bible/04-modules-architecture.md`](bible/04-modules-architecture.md) |
| V — Product Requirements / PRD | [`bible/05-product-requirements.md`](bible/05-product-requirements.md) |
| VI — UX and Interaction Principles | [`bible/06-ux-interaction-guidelines.md`](bible/06-ux-interaction-guidelines.md) |
| VII — Beta Evidence and Operations | [`bible/07-beta-readiness-and-operations.md`](bible/07-beta-readiness-and-operations.md) |
| VIII — Runtime Boundaries | [`bible/08-runtime-boundaries.md`](bible/08-runtime-boundaries.md) |
| IX — Governance | [`bible/09-governance-and-ai-organization.md`](bible/09-governance-and-ai-organization.md) |
| X — Operations and Releases | [`bible/10-operations-and-release.md`](bible/10-operations-and-release.md) |

## Source-of-truth links

- [`../README.md`](../README.md)
- [`../DOCS_INDEX.md`](../DOCS_INDEX.md)
- [`../ROADMAP.md`](../ROADMAP.md)
- [`PRODUCT_PHILOSOPHY.md`](PRODUCT_PHILOSOPHY.md)
- [`GO_IRL_CONSTITUTION.md`](GO_IRL_CONSTITUTION.md)
- [`MARKET_POSITIONING.md`](MARKET_POSITIONING.md)
- [`release/CURRENT_PHASE.md`](release/CURRENT_PHASE.md)
- [`audit/KNOWLEDGE_DEBT.md`](audit/KNOWLEDGE_DEBT.md)
