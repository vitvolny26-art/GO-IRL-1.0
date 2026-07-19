---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-26
---

# Agent Report

## Task

Stabilize Sport Coach terminal states and repeat requests without changing Coach architecture or production RLS.

## Files inspected

- `src/coachFeature.ts`
- `src/coachRequestState.ts`
- `src/components/CoachRequestPanel.tsx`
- `src/components/CoachRequestPanel.test.ts`
- `supabase/migrations/20260704_coach_requests_and_ratings.sql`

## Findings

- `cancelled`, `completed`, and `rejected` are correctly treated as terminal UI states.
- The panel correctly enables a new request when no active request remains.
- Production repeat requests use the existing unique row through `upsert`.
- The old implementation reset `status` to `pending` but retained stale `coach_profile_id` and `admin_note` values from the previous assignment lifecycle.
- This could expose a previous Coach assignment while the repeated request was still pending.

## Changes made

- Added a pure retry-patch helper.
- Production repeat requests now clear `coach_profile_id` and `admin_note` while resetting the row to `pending`.
- `updated_at` is explicitly refreshed.
- Added regression coverage for the retry reset payload.
- No SQL, migration, RLS, auth, secret, or production-data changes.

## Checks

- Static file verification completed after patching.
- `pnpm run lint`: pending GitHub Actions.
- `pnpm run build`: pending GitHub Actions.
- `pnpm run test`: pending GitHub Actions.

## Next step

Merge only after CI is green. Then continue with localized Coach panel copy and explicit loading/error state tests as a separate task.
