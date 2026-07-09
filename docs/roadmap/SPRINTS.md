---
title: Sprint Plan
owner: Sprint Planner
status: Draft
source_of_truth: false
last_review: 2026-07-09
next_review: 2026-08-09
---

# Sprint Plan

GO IRL is developed as a platform, not as a one-off Telegram Mini App. Every sprint should move the product closer to real offline meetings while keeping future Web, Android, and iOS clients in mind.

## Sync note

This file is the roadmap-folder copy of the historical root `SPRINTS.md` plan.

Use `ROADMAP.md`, `BACKLOG.md`, `DOCS_INDEX.md`, and `docs/governance/KNOWLEDGE_PLATFORM.md` before treating any sprint item as current MVP scope.

## Sprint 0 - Foundation

Status: **Complete / Historical**

Goal: make the project safe to develop and release.

- GitHub repository connected.
- Build and TypeScript checks pass.
- Lint and tests are configured.
- CI runs test, lint, and build.
- Supabase schema and RLS are documented.
- Deployment checklist exists.
- No secrets are committed.

Completed:

- Latest `supabase/schema.sql` is applied in production Supabase.
- Production RLS hides unrelated private activities.
- Invite/startapp access to a specific private activity is verified.
- GitHub Actions CI passes on `main`.
- Netlify production URL responds successfully.

Manual release smoke-test:

- Run the final Telegram two-account flow before public announcement.

## Sprint 1 - MVP Core

Goal: make the main user journey feel clear, fast, and useful.

- Premium event cards that answer what, when, where, who, price, and join status.
- Redesigned home screen around discovery and categories.
- Activity creation in under 30 seconds.
- Join/request flow in under 15 seconds.
- Organizer edit and private request review.
- Strong empty, loading, success, and error states.

## Sprint 2 - Telegram And Notifications

Goal: make the app feel native inside Telegram.

- BotFather menu button and Mini App URL verified.
- Telegram `startapp` share links verified.
- n8n or backend-triggered Telegram notifications.
- Organizer notification for private join requests.
- Participant notification for approve/reject decisions.
- Activity reminders before start time.

## Sprint 3 - Trust, Verification, RLI

Goal: start building the platform's unique trust layer.

- Attendance confirmation.
- Organizer participant verification.
- Participant-to-participant verification.
- RLI history and basic profile reputation.
- Achievements tied to real participation.

## Sprint 4 - Modules And Discovery

Goal: evolve from a generic event list into a modular platform.

- Sport as the first strong module.
- Module-specific cards, filters, and creation fields.
- Activities, Nature, Parties, Creative, and Learning prepared as independent modules.
- City expansion through configuration.

## Sprint 5 - Production Growth

Goal: prepare for broader public usage.

- Analytics for activation, joins, shares, and completed activities.
- Reporting and moderation.
- Abuse protection.
- Referral loop.
- Web parity with Telegram Mini App behavior.
