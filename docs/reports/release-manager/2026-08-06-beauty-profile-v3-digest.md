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

Repair the production `public.save_my_beauty_profile_v3` runtime failures that block Beauty workspace persistence and prevent the generated sharing card from reaching Storage and `beauty_share_cards`.

## Files inspected

- `supabase/migrations/20260804013030_beauty013_workspace_content_04.sql`
- `src/beauty/beautyWorkspaceRepository.ts`
- production Supabase API, PostgreSQL and Storage logs
- production function definition, configuration and extension schema privileges
- indexes on `public.beauty_professional_services`

## Findings

### Failure 1

- Production requests to `save_my_beauty_profile_v3` returned HTTP 404 through PostgREST.
- PostgreSQL logs showed: `function digest(text, unknown) does not exist`.
- `pgcrypto.digest(text, text)` exists in schema `extensions`.
- The function used unqualified `digest(...)` with runtime `search_path = pg_catalog, public`.

### Failure 2

- After the digest fix, requests reached the function but returned HTTP 400.
- PostgreSQL logs showed: `column reference "profile_id" is ambiguous`.
- The function has an OUT column named `profile_id` and also uses the table column `profile_id` in the `beauty_professional_services` `ON CONFLICT` target.
- The intended unique index is `beauty_professional_services_profile_client_key_idx` on `(profile_id, client_key)`.

### Failed remediation

- A function-level `ALTER FUNCTION ... SET plpgsql.variable_conflict = use_column` migration passed repository CI but production Supabase rejected it with `permission denied to set parameter "plpgsql.variable_conflict"`.
- The failed migration was not recorded in production migration history and changed no production data.

## Changes made

1. Added `supabase/migrations/20260806022500_fix_beauty_profile_v3_digest.sql` to set:

   `search_path = pg_catalog, public, extensions`

2. Corrected `supabase/migrations/20260806025900_fix_beauty_profile_v3_profile_id_conflict.sql` to add the PL/pgSQL compiler directive directly inside the existing function body:

   `#variable_conflict use_column`

   The migration obtains the current stored function definition with `pg_get_functiondef`, inserts the directive before `declare`, and executes `CREATE OR REPLACE FUNCTION`. Existing signature, search path and grants are preserved. RLS policies, auth protocol and production data are unchanged.

## Checks

- PR #691 exact-head CI #1816: PASS.
- PR #691 squash merge: `c36cd1e3a6643709a0af5fbe521c99677f68b5fb`.
- Production migration `fix_beauty_profile_v3_digest`: applied successfully.
- Production verification: function search path includes `extensions`; direct `extensions.digest(...)` succeeds.
- PR #692 exact-head CI #1818: PASS.
- PR #692 squash merge: `c8192201f5ead794da5dc88eca1bc0d28930fb21`.
- Initial production application of the second migration: rejected before DDL execution because the platform role cannot set `plpgsql.variable_conflict` as a function GUC.
- Corrected compiler-directive migration exact-head CI and production application: pending.

## Next step

Run exact-head CI for the corrected migration, merge it to `main`, apply it to production Supabase, verify the stored function includes `#variable_conflict use_column`, then request one controlled card-save retry.

## Rollback

Digest lookup rollback:

`alter function public.save_my_beauty_profile_v3(text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, timestamptz) set search_path = pg_catalog, public;`

Compiler directive rollback requires recreating the stored function definition without the `#variable_conflict use_column` line.
