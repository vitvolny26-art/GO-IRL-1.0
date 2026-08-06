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

Restore the canonical Beauty business-card persistence and sharing chain so the JPEG generated in the professional workspace is saved remotely and then reused by Telegram and WhatsApp.

## Scope completed before the current database blocker

### Application sharing path

- PR #687 changed Telegram and WhatsApp sharing to use the saved Beauty JPEG rather than rebuilding a different card from public profile rows.
- PR #688 removed a Vercel-incompatible test-only `?raw` import.
- PR #689 moved a test out of `api/` so Vercel remained within the 12-function Hobby limit.
- PR #690 added trusted-auth persistence gating, kept the editor pending until Storage plus RPC confirmation, switched Telegram photo delivery to `format=image`, and added the external Android JPEG share bridge.
- PR #690 merge SHA: `dea54c6a0a9edf09f1d7b706aad60d75b29b53c3`.
- PR #690 final CI #1814: PASS.
- VPS deployment execution `8909`: success, SSH code 0, exact SHA `dea54c6a0a9edf09f1d7b706aad60d75b29b53c3`, host-side HTTP 200.
- Vercel deployment `dpl_5ZPQzKpojj3tg96cJ28NeHi4NSqL`: READY on exact SHA `dea54c6a0a9edf09f1d7b706aad60d75b29b53c3`.

## Production failures discovered during physical smoke

### Failure 1: pgcrypto lookup

- `public.save_my_beauty_profile_v3` returned HTTP 404 through PostgREST.
- PostgreSQL reported `function digest(text, unknown) does not exist`.
- `pgcrypto.digest(text, text)` is installed in schema `extensions`, while the function runtime search path was `pg_catalog, public`.
- PR #691 added migration `20260806022500_fix_beauty_profile_v3_digest.sql`.
- PR #691 merge SHA: `c36cd1e3a6643709a0af5fbe521c99677f68b5fb`.
- Production migration `fix_beauty_profile_v3_digest`: applied successfully.
- Verified production configuration: `search_path=pg_catalog, public, extensions`.

### Failure 2: Beauty profile `profile_id` ambiguity

- After the digest fix, `public.save_my_beauty_profile_v3` reached its SQL body but failed with `column reference "profile_id" is ambiguous`.
- The function returns an OUT column named `profile_id` and also uses `profile_id` in the service `ON CONFLICT` target.
- PR #692 attempted a function-level `plpgsql.variable_conflict` setting. Production rejected that approach with `permission denied to set parameter "plpgsql.variable_conflict"`; no production data changed and the failed migration was not recorded.
- PR #693 embedded `#variable_conflict use_column` into the stored function definition.
- PR #694 added a clean idempotent migration for the same compiler directive.
- PR #694 merge SHA: `d6e791724053e029a90f08f661b3ef2bdcf52bdf`.
- Current production verification: `save_my_beauty_profile_v3` has `search_path=pg_catalog, public, extensions` and contains `#variable_conflict use_column`.
- Subsequent physical retry confirmed the profile save and Storage uploads progressed past this function.

### Failure 3: Beauty share-card `profile_id` ambiguity

- The generated JPEG and logo upload to Storage successfully.
- `public.save_my_beauty_share_card` then returns HTTP 400.
- PostgreSQL reports `column reference "profile_id" is ambiguous`.
- The function returns an OUT column named `profile_id` and uses `ON CONFLICT (profile_id)` in the same PL/pgSQL scope.
- `public.beauty_share_cards` has primary-key constraint `beauty_share_cards_pkey` on `profile_id`.

## Current change

PR #695 adds idempotent migration:

`supabase/migrations/20260806033500_fix_beauty_share_card_profile_id_conflict.sql`

The migration reads the exact stored function definition and replaces only:

`ON CONFLICT (profile_id) DO UPDATE`

with:

`ON CONFLICT ON CONSTRAINT beauty_share_cards_pkey DO UPDATE`

It verifies the expected primary-key constraint and old conflict target before recreating the same function. Signature, remaining body, grants, search path, RLS policies, auth protocol and production data are preserved.

## Current GitHub state

- PR: #695
- Branch: `fix/beauty-share-card-profile-id-20260806`
- Base main SHA: `d6e791724053e029a90f08f661b3ef2bdcf52bdf`
- Previous exact head: `09767deaf9b1b44dffdeb95c09d0b1ad03e7ff96`
- CI #1824 / run `31068946032`: PASS on the previous exact head.
- PR state before this report update: open, Ready, mergeable.
- This report update creates a new exact head and requires a fresh CI gate before merge.

## Vercel clarification

The latest verified Vercel production deployment is:

- deployment: `dpl_3XGzuVfiMeW2KxSCzSc6dZPWVriM`
- state: READY
- Git SHA: `c36cd1e3a6643709a0af5fbe521c99677f68b5fb`
- source commit: PR #691

PRs #692-#695 are SQL-only repository changes. They do not modify the Vercel application runtime and do not require Vercel delivery for the database fix to take effect. Their effective production target is Supabase. Absence of a newer Vercel deployment for these migrations is expected and is not evidence that the SQL migration failed.

## Checks

- Application CI through PR #690: PASS.
- VPS exact-SHA deployment for PR #690: PASS.
- Vercel production for PR #690: READY.
- PR #691 CI and production digest migration: PASS.
- Production profile function search path: verified.
- Production profile function compiler directive: verified.
- PR #695 CI #1824: PASS before this documentation-only head update.
- Production `save_my_beauty_share_card` still uses the ambiguous conflict target; the PR #695 migration is not yet applied.

## Next step

1. Wait for fresh exact-head CI after this report update.
2. Reconfirm PR #695 head unchanged and mergeable.
3. Squash merge PR #695 into `main`.
4. Apply `fix_beauty_share_card_profile_id_conflict` to production Supabase.
5. Verify the stored function uses `ON CONFLICT ON CONSTRAINT beauty_share_cards_pkey DO UPDATE`.
6. Request one controlled retry in the Beauty workspace.
7. Verify:
   - `beauty_share_cards` row exists;
   - `generated_object_path` is populated;
   - generated JPEG exists in Storage;
   - workspace status becomes `ready`;
   - Telegram shows the exact saved card;
   - Android chooser passes the JPEG to WhatsApp.

## Rollback

- Application rollback: revert PR #690 merge `dea54c6a0a9edf09f1d7b706aad60d75b29b53c3` and redeploy only if the runtime sharing changes must be removed.
- Digest search-path rollback: restore `search_path = pg_catalog, public` for `save_my_beauty_profile_v3`.
- Profile compiler-directive rollback: recreate `save_my_beauty_profile_v3` without `#variable_conflict use_column`.
- Share-card migration rollback: recreate the prior stored `save_my_beauty_share_card` definition with `ON CONFLICT (profile_id) DO UPDATE`.
