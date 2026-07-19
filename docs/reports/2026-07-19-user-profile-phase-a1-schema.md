---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-08-02
---

# Agent Report

## Task

Prepare Mission A1 for the minimal production GO IRL profile:

- `user_profiles`;
- `user_profile_interests`;
- validation constraints and indexes;
- trusted-JWT RLS;
- atomic `save_my_profile` RPC;
- no SQL application.

## Files inspected

- `README.md`
- `supabase/README.md`
- `supabase/schema.sql`
- `supabase/migration_v4_trusted_telegram_auth.sql`
- `supabase/migrations/20260713000000_meta_provider_join.sql`
- `docs/reports/2026-07-19-user-profile-phase-a-contract.md`

## Findings

- Production identity is already anchored in `public.app_users.user_key`.
- Trusted authorization is exposed through `public.go_irl_auth_user_key()`.
- Browser/demo identity headers must not be accepted by the profile policies.
- The existing `public.go_irl_touch_updated_at()` trigger helper can be reused.
- Storage bucket creation and avatar policies belong to Mission A2 and are intentionally excluded.

## Changes made

Added:

- `supabase/migrations/20260719060000_user_profile_phase_a.sql`

The migration is additive and contains:

- `public.user_profiles` keyed to `public.app_users(user_key)`;
- `public.user_profile_interests` with cascade cleanup;
- display-name, bio, city, avatar-path, avatar-code and interest-slug constraints;
- profile and interest indexes;
- updated-at trigger;
- RLS for owner access and authenticated public-profile reads;
- no anonymous access;
- no client delete policy for profile rows;
- invoker-rights `public.save_my_profile(...)` deriving the target key from the verified JWT;
- atomic profile upsert and interest replacement;
- maximum 12 interests and duplicate rejection;
- minimal authenticated grants.

No changes were made to:

- `app_users`;
- Activity/member RLS;
- auth or Edge Functions;
- avatar Storage;
- frontend code;
- production data.

## Checks

Completed:

- reread the committed migration from GitHub;
- confirmed the file is complete after replacing an initially truncated draft;
- checked that no client-supplied user key is accepted;
- checked that anonymous table and RPC access is revoked;
- checked that profile deletion is not granted to authenticated clients;
- checked that the migration references the existing trusted-auth and timestamp helpers.

Not run:

- SQL parser/database execution;
- Supabase DB lint;
- two-account RLS test;
- `pnpm run lint`;
- `pnpm run build`;
- `pnpm run test`.

Reason: the migration was prepared through GitHub only and was not applied to any database. Runtime code was not changed.

## Next step

Review the Draft PR. After approval, apply only to a non-production Supabase environment and run a two-account RLS matrix before any production decision. Mission A2 must remain separate unless explicitly approved.
