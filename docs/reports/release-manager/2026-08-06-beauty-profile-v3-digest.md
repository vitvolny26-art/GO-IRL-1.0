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

Repair the production `public.save_my_beauty_profile_v3` runtime failure that blocks Beauty workspace persistence and therefore prevents the generated sharing card from reaching Storage and `beauty_share_cards`.

## Files inspected

- `supabase/migrations/20260804013030_beauty013_workspace_content_04.sql`
- `src/beauty/beautyWorkspaceRepository.ts`
- production Supabase API, PostgreSQL and Storage logs
- production function definition and extension schema privileges

## Findings

- Production requests to `save_my_beauty_profile_v3` returned HTTP 404 through PostgREST.
- PostgreSQL logs showed the actual error: `function digest(text, unknown) does not exist`.
- `pgcrypto.digest(text, text)` exists in schema `extensions`.
- `save_my_beauty_profile_v3` used unqualified `digest(...)` with runtime `search_path = pg_catalog, public`.
- Schema `extensions` is owned by `postgres`; application roles have `USAGE` but not `CREATE`, so adding it to the function search path does not introduce a writable-schema lookup.

## Changes made

Added migration `supabase/migrations/20260806022500_fix_beauty_profile_v3_digest.sql` to change only the function runtime search path to:

`pg_catalog, public, extensions`

The function body, signature, grants, RLS, auth protocol and production data remain unchanged.

## Checks

Pending exact-head GitHub Actions and production migration verification.

## Next step

Run CI, merge the migration to `main`, apply the same migration to production Supabase, then verify the function configuration and ask for one controlled card-save retry.

## Rollback

Restore the prior function setting:

`alter function public.save_my_beauty_profile_v3(text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, timestamptz) set search_path = pg_catalog, public;`
