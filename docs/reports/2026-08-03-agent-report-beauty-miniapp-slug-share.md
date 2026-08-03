---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-17
---

# Agent Report

## Task

Align Beauty Telegram sharing with Sport links, show the firm name above a localized service name, and let the professional choose an available English public-link ending.

## Files inspected

- `api/_shared/telegram-share-beauty.ts`
- `api/_shared/telegram-share-card-svg.ts`
- `api/_shared/telegram-event-card.ts`
- `src/invitationLink.ts`
- `src/launchSurface.ts`
- `src/telegramPreparedBeautyShare.ts`
- `src/beauty/BeautyRouteGuard.tsx`
- `src/beauty/beautyWorkspaceRepository.ts`
- `supabase/migrations/20260801104500_beauty005_olomouc_pilot.sql`

## Findings

- Beauty prepared cards used the web `/beauty/<slug>` URL, so Telegram opened an external browser.
- The shared card renderer places `activity` above `title`; Beauty supplied service and firm in the opposite order.
- The database slug was unique but restricted to the generated `beauty-<hash>` format.
- Non-namespaced custom start parameters would collide with event and role-invitation handling.

## Changes made

- Beauty prepared cards now use `https://t.me/GOirl_bot?startapp=beauty-<english-name>`.
- Beauty `startapp` values route to the Services surface inside the Telegram Mini App.
- The card headline is the firm name; the subtitle is the service name localized for `ru`, `uk`, `cs`, or `en`.
- Added a professional-workspace editor for the unique English slug.
- Added a server RPC that validates ownership and role, preserves the unique constraint, and reports unavailable names.
- Kept Sport invitation behavior unchanged.

## Changes requiring deployment

- The additive migration `20260803185000_beauty_public_slug.sql` must be applied before the production slug editor can save server-side changes.
- No migration or production deployment was executed in this task.

## Checks

- Exact-head GitHub Actions required before merge.
- Auth logic and RLS policies were not changed.
- No secrets, destructive SQL, production data, DNS, or domain settings were changed.

## Next step

Open the PR, inspect the first CI result, and stop at the first red gate. Merge only after exact-head CI is green and the user approves it.
