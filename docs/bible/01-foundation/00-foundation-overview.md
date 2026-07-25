---
title: Bible Foundation Overview
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Bible Foundation Overview

## Product identity

GO IRL is a Telegram-first platform for real participation and local offline meetings. It is not a social network, endless feed, ticketing product, or generic event calendar.

Mission: **Less scrolling. More life.**

Core loop:

```text
create event -> share -> join/request -> event chat -> attend in real life
```

## Lifecycle layers

- **Current production truth:** current GitHub `main` and verified production evidence.
- **Proven Closed-Beta baseline:** Olomouc, Czechia, with six canonical categories.
- **Approved next phase:** Release Preparation and focused post-beta stabilization.
- **Long-term vision:** reusable platform and vertical capabilities that are not claimed as shipped.

## Proven Closed-Beta categories

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

The six categories remain the default Olomouc release baseline. Expansion requires an explicit reviewed product decision.

## Decision filter

A current-scope feature must make create, share, join, coordinate, or attendance easier; preserve Telegram-first behavior; reduce confusion or social fear; preserve trusted auth, RLS, and production/demo separation; and avoid uncontrolled scope expansion.

## Authority

The Bible preserves product intent. It does not override current code, deployed evidence, Supabase schema, migrations, auth, RLS, `README.md`, or the lifecycle decision in `docs/release/CURRENT_PHASE.md`.

## Navigation

- Previous: [`../00-bible-roadmap.md`](../00-bible-roadmap.md)
- Next: [`01-product-philosophy.md`](01-product-philosophy.md)
- Book I scope: [`03-mvp-scope-and-market-positioning.md`](03-mvp-scope-and-market-positioning.md)
