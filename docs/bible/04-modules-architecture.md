---
title: Bible Module Architecture
owner: Tech Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book IV — Module Architecture

## Current model

```text
Core Activity System
+ proven Olomouc category baseline
+ Sport specialization
+ Generic fallback
+ chat, weather, share, maps, calendar, profile, reminders
```

## Current modules

- Activity cards, details, create/edit, capacity, visibility, and join state.
- Telegram share and browser join fallback.
- Temporary Activity Chat.
- Sport Coach support where implemented.
- Weather context for attendance decisions.
- Profile basics and provider preferences.
- Map provider selection and event-point routing.
- Google, Apple, and Outlook calendar actions.
- Server-authoritative reminders and provider-neutral lifecycle delivery where enabled.
- Category artwork for current runtime categories.

## Proven category baseline

- Volleyball
- Running
- Walking
- Coffee meetup
- Board games
- Language exchange

Expansion still requires an explicit reviewed product decision.

## Gated and future modules

Provider adapters may exist while a channel remains disabled. Full Event Roles, paid coach marketplace, ticketing, AI discovery/recommendations, reputation, clubs, dating, friends, travel, and broad multi-city discovery remain future.

## Rule

A module belongs in current scope only when it improves create, share, join, coordination, trust, attendance, or release reliability without weakening runtime boundaries.

## Navigation

- Previous: [`03-database-and-supabase-boundaries.md`](03-database-and-supabase-boundaries.md)
- Next: [`04-modules-mvp-audit.md`](04-modules-mvp-audit.md)
