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

Persist Beauty sharing-card configuration, lifecycle status, uploaded artwork, and generated JPEG state across devices, then release the reviewed SHARE004 contract to production Supabase, GitHub `main`, VPS, and Vercel.

## Files inspected

- `DOCS_INDEX.md`
- `ROADMAP.md`
- `docs/release/CURRENT_PHASE.md`
- `docs/roadmap/ROADMAP_PART_02_RELEASE_PREPARATION.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `src/beauty/beautySetupModel.ts`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/beauty/beautyPortfolioUpload.ts`
- `src/beauty/beautyShareCardRepository.ts`
- `src/beauty/beautyWorkspaceStorage.ts`
- `supabase/migrations/20260805193000_share004_beauty_share_card_persistence.sql`
- `supabase/migrations/20260805194000_share004_beauty_share_card_service_keys_hotfix.sql`
- `supabase/migrations/20260805195000_share004_beauty_share_card_advisor_hardening.sql`
- `scripts/test-share004-migrations.cjs`
- `.github/workflows/share004-migration-smoke.yml`

## Findings

- The Beauty share-card model requires persistent configuration and lifecycle state beyond one device.
- The initial migration needed a corrective `service_ids` change from `uuid[]` to `text[]` because Beauty service client keys are text identifiers.
- The final contract provides owner-scoped persistence, private artwork storage, public generated-card storage, optimistic concurrency, ready-state validation, and staff status visibility.
- Browser mock behavior remains local-only. Trusted Telegram professional sessions use the remote repository path.

## Changes made

Released the following repository and production contract:

- `public.beauty_share_cards`, one persistent record per Beauty professional profile;
- template version, lifecycle status, background/logo/generated object paths, background position, selected service IDs, fingerprint, error, and generation timestamps;
- owner CRUD RLS and staff read boundaries;
- dedicated private artwork bucket and public generated-card bucket;
- owner-scoped Storage policies;
- `get_my_beauty_share_card()`;
- `save_my_beauty_share_card(...)` with optimistic concurrency, role checks, path ownership validation, active owned-service validation, and ready-state invariants;
- `delete_my_beauty_share_card(...)`;
- `go_irl_get_beauty_share_card_status(...)` with `SECURITY INVOKER` and authenticated-only execution;
- client repository and workspace storage integration;
- PostgreSQL 17 migration smoke workflow and assertions.

## Release evidence

- Pull request: `#666`
- Reviewed head SHA: `d54a6abad93f0b849562a83102326c5b5eca72ed`
- Merge SHA: `b8cfed3b4f5a642be3b582165e2ecfc04ea46b7c`
- GitHub exact-head CI run: `31033979722` — PASS
- SHARE004 migration smoke run: `31033980013` — PASS
- Production Supabase project: `tygfsvjkznypilfyyvdc`
- Production migration order:
  1. `20260805193000_share004_beauty_share_card_persistence.sql`
  2. `20260805194000_share004_beauty_share_card_service_keys_hotfix.sql`
  3. `20260805195000_share004_beauty_share_card_advisor_hardening.sql`
- Production schema verification: PASS
- Final `service_ids` type: `text[]`
- Status RPC security: `SECURITY INVOKER`
- Authenticated execute grant: present
- Anonymous execute grant: absent
- SHARE004-specific Security Advisor warnings: none
- n8n workflow: `GO IRL VPS + Vercel Deploy`
- n8n workflow ID: `6khfY6PmKkIVB9Qv`
- n8n production execution: `8734`
- VPS cleanup SSH code: `0`
- VPS deploy SSH code: `0`
- Deployed branch: `main`
- Deployed SHA: `b8cfed3b4f5a642be3b582165e2ecfc04ea46b7c`
- VPS production health: HTTP `200`
- External production response: HTTP `200`, server `Caddy`
- Vercel deployment: `dpl_N4eAoDzLFfFVLBXFjfkHgT8t7apv`
- Vercel target: `production`
- Vercel state: `READY`
- Vercel Git SHA: `b8cfed3b4f5a642be3b582165e2ecfc04ea46b7c`

## Checks

- GitHub exact-head CI: PASS
- PostgreSQL 17 migration smoke: PASS
- Disposable Supabase verification: PASS
- Production Supabase migration and catalog verification: PASS
- Production Security Advisor SHARE004 review: PASS
- VPS locked install and Vite production build: PASS
- VPS atomic publish and health check: PASS
- External production HTTP check: PASS
- Vercel production deployment and exact-SHA check: PASS

## Not changed

- `.env` or secret values
- DNS or domain configuration
- unrelated authentication implementation
- unrelated production data
- PR #664 merge state

## Risk and rollback

- VPS deploy workflow preserves the previous `dist` artifact and restores it automatically when the production health check fails.
- The unrelated untracked VPS directory was moved without deletion to `/tmp/goirl-activity-icons-backup.vksmq1/activity-icons` before deployment.
- Vercel keeps the previous production deployment as a rollback candidate according to platform deployment history.
- Database rollback remains a separately approved production-sensitive action because the released migrations add table, RPC, RLS, grants, and Storage policies.

## Remaining scope

- User-visible organizer/admin status presentation remains a separate bounded UI task; the backend status contract is present.
- Signed private artwork URLs expire and may require refresh in long-lived sessions.
- Generated card path caching should be monitored if `current.jpg` is repeatedly overwritten.

## Next step

Implement and verify the organizer/admin status presentation against `go_irl_get_beauty_share_card_status(...)` without changing the released persistence contract.
