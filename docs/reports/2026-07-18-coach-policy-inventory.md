---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-18
next_review: 2026-07-25
---

# Agent Report

## Task

Inventory the repository-defined Sport Coach tables and RLS policies without executing SQL or changing Supabase.

## Files inspected

- `supabase/migration_v7_coach_requests_and_ratings.sql`
- `supabase/migrations/20260704_coach_requests_and_ratings.sql`
- `supabase/README.md`
- `docs/DATABASE_SCHEMA_AUDIT.md`
- `docs/SPORT_COACH_MVP.md`

## Findings

### Production state is not proven

The repository contains no reliable record showing which Coach SQL file was applied to production, in what order, or whether both were applied. `supabase/README.md` documents production application for migration v1, but does not document production application of Coach migration v7.

Therefore the deployed Coach policies cannot be treated as known from repository history alone.

### Two conflicting Coach migration definitions exist

`supabase/migration_v7_coach_requests_and_ratings.sql` creates policies with names such as:

- `coach_profiles_read_active`
- `coach_profiles_insert_own`
- `coach_profiles_update_own`
- `coach_requests_read_own`
- `coach_requests_insert_own`
- `coach_requests_update_own_cancel`
- `coach_requests_update_organizer`
- `coach_requests_update_admin`
- `coach_reviews_read_public`
- `coach_reviews_insert_own`
- `coach_reviews_update_own`

`supabase/migrations/20260704_coach_requests_and_ratings.sql` drops and recreates a different policy set with names such as:

- `coach profiles read`
- `coach profiles create own`
- `coach profiles update own or admin`
- `coach requests read`
- `coach requests create own`
- `coach requests update allowed`
- `coach reviews read`
- `coach reviews create own joined`
- `coach reviews update own or admin`

Because PostgreSQL RLS policies are permissive by default, differently named policies can coexist and broaden access if both files were applied.

### Important behavior differences

1. Profile insert:
   - v7: only the profile owner may insert.
   - dated migration: owner or admin may insert.

2. Request update:
   - v7: requester update is limited to pending/cancel flow; organizer and admin have separate policies.
   - dated migration: requester or activity manager can update any allowed row without a server-side transition restriction.

3. Review insert:
   - v7: reviewer identity only.
   - dated migration: reviewer must be a joined participant and the event must have a confirmed/completed assignment for that Coach.

4. Request read:
   - neither version grants access to the assigned Coach through `coach_profile_id`.
   - neither version provides a public-safe confirmed assignment projection.

5. Profile update:
   - both versions allow profile owners to update their full row, including verification and rating aggregate columns unless column privileges or another mechanism restrict them.

6. Confirmed integrity:
   - neither migration requires `coach_profile_id` when status is `confirmed`.

7. Sport-only integrity:
   - neither migration validates that the referenced activity is a sport event.

## Changes made

- Added this read-only inventory report.
- No SQL, auth, RLS, secrets, `.env`, migrations, or production data were changed.

## Checks

Documentation-only change. Code checks are not required for the findings themselves; repository CI should still validate the PR.

## Next step

Before any corrective migration is designed, obtain a read-only production inventory from Supabase showing:

- applied migration history;
- current `pg_policies` rows for `coach_profiles`, `coach_requests`, and `coach_reviews`;
- current table constraints;
- current grants and column privileges;
- current function definitions used by Coach RLS.

Do not apply or delete any policy until that inventory is reviewed and an explicit Supabase/RLS change is approved.
