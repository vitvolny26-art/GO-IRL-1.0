---
title: SHARE004 Production Handoff
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# SHARE004 Production Handoff

## Handoff target

AI Fixer / Senior Fullstack Reviewer for one bounded organizer/admin status UI task.

## Mission

Expose the already released Beauty share-card lifecycle status to authorized organizer and admin users without changing the persistence, RLS, migration, Storage, or authentication contracts.

## Current production truth

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Base branch: `main`
- SHARE004 PR: `#666`
- Merge SHA: `b8cfed3b4f5a642be3b582165e2ecfc04ea46b7c`
- GitHub CI: `31033979722` — PASS
- Migration smoke: `31033980013` — PASS
- Production Supabase project: `tygfsvjkznypilfyyvdc`
- Production migrations: `20260805193000`, `20260805194000`, `20260805195000`
- n8n production execution: `8734`
- VPS deploy SSH: `code 0`
- VPS production health: HTTP `200`
- Vercel deployment: `dpl_N4eAoDzLFfFVLBXFjfkHgT8t7apv`
- Vercel state: `READY`
- Vercel Git SHA: `b8cfed3b4f5a642be3b582165e2ecfc04ea46b7c`

## Existing backend contract

Use `go_irl_get_beauty_share_card_status(...)`.

The released contract already provides:

- authenticated-only execution;
- `SECURITY INVOKER` behavior;
- professional owner visibility;
- authorized organizer/admin visibility;
- lifecycle status, timestamps and error state;
- no anonymous execute grant.

Do not add another table, RPC, policy, role model, or migration for this UI task.

## Required visible states

Render the same persistent lifecycle language in the professional workspace and authorized staff surfaces:

- `● Визитка готова · HH:MM`
- `◌ Визитка обновляется…`
- `⚠ Не удалось обновить · Повторить`
- `— Визитка удалена`

Use existing locale infrastructure for RU/UK/CS/EN where the target surface already supports localization. Do not hardcode a new standalone translation system.

## Bounded implementation order

1. Inspect all call sites of `beautyShareCardRepository` and current admin/organizer navigation.
2. Identify one existing staff surface; do not create a new admin architecture.
3. Add a read-only adapter for the status RPC if no reusable adapter exists.
4. Add deterministic loading, ready, updating, failed and deleted presentation states.
5. Keep retry limited to the professional owner surface unless existing authorization already supports a safe owner action.
6. Add focused repository tests for status mapping and role visibility.
7. Run `pnpm run repo:check`, lint, typecheck, build, test and `git diff --check`.
8. Open a Draft PR. Do not merge or deploy without separate approval.

## Acceptance criteria

- Professional sees persistent status after refresh and device change.
- Authorized organizer/admin sees read-only status for the selected professional.
- Unauthorized users receive no private share-card state.
- Failed and deleted states are explicit and not represented as ready.
- Existing Beauty workspace save, artwork upload and generated-card behavior do not regress.
- Browser Mock Mode remains local-only.
- No secrets, auth, RLS, SQL, migration, Storage policy, DNS or production-data change.

## Primary files to inspect

- `src/beauty/beautyShareCardRepository.ts`
- `src/beauty/beautyWorkspaceStorage.ts`
- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/admin/`
- `src/services/`
- related role/navigation tests

## Durable references

- GitHub release report: `docs/reports/release-manager/2026-08-05-share004-beauty-share-card-persistence.md`
- Draft evidence PR: `#672`
- Drive SHARE004 folder: `1L3sTLTlvb_o3Wn6vV9AHCrrg8hHcv0Av`
- Drive production handoff: `1htAWqM_0RlN_DseD_XoXli6YsC4EhK0UwTrTMiEUf10`

## Rollback boundary

This handoff authorizes no production change. Any future UI patch must remain independently revertible. The released database contract must not be rolled back merely to revert UI presentation.

## Next step

Create one bounded Draft PR implementing organizer/admin read-only status presentation against the existing RPC. No merge and no deployment until exact-head checks are green and the owner approves delivery.
