---
title: Bible Platform Architecture
owner: Tech Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book II — Platform Architecture

## Purpose

Describe current architecture without redefining code, schema, auth, or deployment reality.

## Scope classification

- **Implemented/current:** supported by current `main` or verified production evidence.
- **Release Preparation:** approved stabilization and operational work.
- **Gated:** implementation exists, but production use depends on a release gate.
- **Future:** not a current product promise.

## Current runtime

```text
Telegram Mini App / Browser Demo
-> React + TypeScript + Vite
-> Zustand and feature modules
-> Supabase client and server APIs
-> PostgreSQL, RLS, Edge Functions, realtime, protected workers
```

Vercel serves the frontend and server routes. Supabase owns persistent product data and security boundaries. Telegram verified `initData` is the production identity source.

## Current product architecture

- `Activity` remains the core domain entity.
- Sport has the strongest specialized experience; Generic is the fallback.
- Share, join, Activity Chat, weather, profile, maps, calendar, and reminders support the real-life loop.
- Profile preferences include maps, calendars, sharing, and reminders.
- Calendar actions support Google, Apple, and Outlook.
- Provider-neutral reminders and lifecycle messaging exist, but outbound channels remain independently gated.

## Boundaries

- Browser Demo Mode uses local/demo-only writes.
- Frontend flags are not authorization.
- n8n and external automation do not own core business logic.
- No architecture rewrite is implied by this Bible.
- New clients or verticals remain future until explicitly approved.

## Final rule

Use the smallest architecture that reliably moves a user from a shared activity to real attendance.

## Navigation

- Previous: [`01-foundation/03-mvp-scope-and-market-positioning.md`](01-foundation/03-mvp-scope-and-market-positioning.md)
- Next: [`03-database-and-supabase-boundaries.md`](03-database-and-supabase-boundaries.md)
