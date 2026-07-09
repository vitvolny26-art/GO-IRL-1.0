---
title: Sprint 2 - Telegram And Notifications
owner: Sprint Planner
status: Draft
source_of_truth: false
last_review: 2026-07-09
next_review: 2026-08-09
---

# Sprint 2 - Telegram And Notifications

## Status

Draft / partly superseded by current stabilization docs.

Use current implementation and release truth from:

- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `RELEASE_NOTES.md`
- `docs/bible/08-runtime-boundaries.md`

## Goal

Make the app feel native inside Telegram.

## Planned scope

- BotFather menu button and Mini App URL verified.
- Telegram `startapp` share links verified.
- Backend-triggered Telegram notifications.
- Organizer notification for private join requests.
- Participant notification for approve/reject decisions.
- Activity reminders before start time.

## Current boundaries

- Telegram Mini App lifecycle must remain explicit.
- The app must not close unexpectedly.
- Closing the Mini App must be user-triggered.
- No Mini App background polling.
- Browser demo mode must not touch production Supabase.

## Deferred scope

Notification automation, evening digest, quiet hours, and n8n workflows are future work until beta loop stability and production verification are complete.
