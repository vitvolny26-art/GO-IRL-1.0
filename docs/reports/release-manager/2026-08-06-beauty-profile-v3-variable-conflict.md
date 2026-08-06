---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-06
next_review: 2026-08-13
---

# Agent Report

## Task

Repair the second production failure in `public.save_my_beauty_profile_v3` after the pgcrypto search-path fix.

## Files inspected

- `supabase/migrations/20260804013010_beauty013_workspace_content_02.sql`
- `supabase/migrations/20260806022500_fix_beauty_profile_v3_digest.sql`
- production Supabase API and PostgreSQL logs
- production function definition from `pg_get_functiondef`

## Findings

- The pgcrypto lookup defect is fixed.
- Fresh production calls now reach the service upsert and fail with `column reference "profile_id" is ambiguous`.
- The conflict is between the function OUT parameter `profile_id` and the unqualified table column in `ON CONFLICT (profile_id, client_key)`.
- Attempting to set `plpgsql.variable_conflict` through `ALTER FUNCTION ... SET` is not permitted.

## Changes made

Added an idempotent migration that reads the exact current function definition, verifies the expected conflict target, injects `#variable_conflict use_column` at compile time, recreates only the same function, and reloads the PostgREST schema cache.

No application code, table schema, RLS policy, auth protocol or production data is changed.

## Checks

Pending GitHub CI, merge and production migration application.

## Next step

Run exact-head CI, merge if green, apply the same migration to production Supabase, verify the function directive, then repeat one authenticated Beauty card save.
