---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-07
next_review: 2026-08-14
---

# Agent Report

## Task

Surface Beauty booking requests in Services UI, keep the master public-link editor on the `Страница` tab only, and restore canonical Telegram delivery blocked by terminal failed notification retries.

## Files inspected

- `src/beauty/BeautyPublicSlugEditor.tsx`
- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/beauty/ServicesBottomNavigationPortal.tsx`
- `src/components/AppHeader.tsx`
- `src/services/servicesBookingProfessionalRepository.ts`
- `src/notifications/repository.ts`
- `src/notifications/worker.ts`
- `supabase/migrations/20260807062000_beauty007_canonical_notifications.sql`

## Findings

- Beauty booking request notifications were queued correctly in `event_notifications`.
- The canonical worker failed with `notification_claim_failed:23514` because a terminal `failed` row with `attempt_count = 20` and `next_attempt_at IS NULL` was reclaimed and incremented beyond the table constraint.
- Services UI did not expose server-backed Beauty pending requests in the global header bell or next to the professional workspace entry.
- The public-link editor was mounted across the whole master workspace instead of only the `Страница` tab.

## Changes made

- Added server-backed pending Beauty request attention hook.
- Added pending request count to Services header notifications and professional workspace bottom-nav entry.
- Restricted the public-link editor to the `Страница` tab.
- Added `20260807130000_notification_claim_terminal_failed_guard.sql` so terminal failed rows are not reclaimed unless `next_attempt_at` is explicitly set.
- Added rollback-only verification SQL for the claim guard.
- Applied the claim guard migration to production Supabase `tygfsvjkznypilfyyvdc` with explicit user approval.
- Ran the canonical worker once through the existing authorized production endpoint.

## Checks

- Final exact-head CI `31181090142`: PASS.
- Production migration verification: PASS.
- Canonical worker HTTP response: 200.
- Worker summary: 4 notifications claimed, 4 sent, 0 retried, 0 failed.
- Beauty `services.booking_requested`: sent, attempt 1, Telegram provider message ID `95`.
- Beauty `services.booking_confirmed`: sent, attempt 1, Telegram provider message ID `96`.
- Exhausted legacy row remained terminal: `failed`, attempt 20.

## Next step

Review PR #713, then merge/deploy only with separate explicit approval.
