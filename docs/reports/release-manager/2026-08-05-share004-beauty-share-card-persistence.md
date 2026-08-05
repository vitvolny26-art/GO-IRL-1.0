---
title: SHARE004 Beauty Share Card Persistence
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# Agent Report

## Task

Add the repository-side Supabase contract required to persist Beauty sharing-card configuration, lifecycle status, uploaded artwork, and generated JPEG state across devices.

## Files inspected

- `DOCS_INDEX.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `src/beauty/beautySetupModel.ts`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/beauty/beautyPortfolioUpload.ts`
- `src/profileAvatar.ts`
- `supabase/migrations/20260801104500_beauty005_olomouc_pilot.sql`
- `supabase/migrations/20260804013020_beauty013_workspace_content_03.sql`
- `supabase/migrations/20260804013030_beauty013_workspace_content_04.sql`
- `supabase/migrations/20260719070000_user_profile_avatar_storage.sql`
- `docs/reports/2026-08-05-agent-report-beauty-share-card-workspace.md`

## Findings

- The current client model contains Beauty share-card configuration and lifecycle fields.
- `saveBeautyWorkspace()` does not send `workspace.shareCard` to Supabase.
- The existing report explicitly states that generated JPEG and artwork settings are local to the current device.
- PR #664 only refines the Telegram Beauty SVG template and does not provide per-professional persistence.

## Changes made

Added repository-only migration `supabase/migrations/20260805193000_share004_beauty_share_card_persistence.sql` with:

- `public.beauty_share_cards`, one persistent record per Beauty professional profile;
- template version, lifecycle status, background/logo/generated object paths, background position, selected service IDs, fingerprint, error, and generation timestamps;
- owner CRUD RLS and admin read access;
- dedicated private artwork bucket and public generated-card bucket;
- owner-scoped Storage policies;
- `get_my_beauty_share_card()`;
- `save_my_beauty_share_card(...)` with optimistic concurrency, role checks, path ownership validation, service ownership validation, and ready-state invariants;
- `delete_my_beauty_share_card(...)`;
- `go_irl_get_beauty_share_card_status(...)` for professional owner, admin, and organizer status visibility.

## Checks

- GitHub write: PASS
- Migration committed on task branch: PASS
- Production Supabase application: NOT RUN
- Local `pnpm` and database tests: BLOCKED because the execution environment could not resolve `github.com` for repository checkout
- GitHub Actions exact-head CI: pending after Draft PR creation

## Not touched

- production Supabase schema or data
- existing `.env`, secrets, auth implementation, DNS, VPS, or Vercel
- client upload/save wiring
- server-side card rendering job
- PR #664 merge state

## Risk and rollback

This migration changes schema, RLS, RPC and Storage policies when applied. It must remain Draft until reviewed against a disposable Supabase environment. Rollback is to drop the new RPC functions, policies, buckets if empty, and `public.beauty_share_cards`; no existing table is altered.

## Next step

Validate the migration in CI and a disposable Supabase instance. Then implement the client repository and upload adapter against these RPC and Storage contracts as a separate bounded patch.
