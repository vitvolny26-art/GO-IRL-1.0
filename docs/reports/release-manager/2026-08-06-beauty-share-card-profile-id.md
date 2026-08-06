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

Repair the production `public.save_my_beauty_share_card` failure that prevents a generated Beauty sharing card from being marked ready.

## Files inspected

- `supabase/migrations/20260805194000_share004_beauty_share_card_service_keys_hotfix.sql`
- production `public.save_my_beauty_share_card` definition
- production `public.beauty_share_cards` constraints
- production Supabase API, PostgreSQL and Storage logs

## Findings

- `save_my_beauty_profile_v3` succeeds with HTTP 200.
- The generated JPEG and logo upload to Storage with HTTP 200.
- `save_my_beauty_share_card` fails with HTTP 400.
- PostgreSQL reports `column reference "profile_id" is ambiguous`.
- The function returns an OUT column named `profile_id` and uses `ON CONFLICT (profile_id)` in the same PL/pgSQL scope.
- `public.beauty_share_cards` has the primary-key constraint `beauty_share_cards_pkey` on `profile_id`.

## Changes made

Added an idempotent migration that reads the exact stored function definition and replaces only:

`ON CONFLICT (profile_id) DO UPDATE`

with:

`ON CONFLICT ON CONSTRAINT beauty_share_cards_pkey DO UPDATE`

The migration verifies the primary-key constraint and expected old target before recreating the same function. Signature, remaining body, grants, search path, RLS policies, authentication protocol and production data are preserved.

## Checks

Pending exact-head GitHub Actions CI, merge and production migration application.

## Next step

Open a PR, merge only after green exact-head CI, apply the migration to production Supabase, verify the stored function uses the named constraint, then request one controlled card-save retry.
