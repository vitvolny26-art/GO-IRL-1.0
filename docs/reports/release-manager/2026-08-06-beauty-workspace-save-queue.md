---
title: Beauty workspace save queue
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-06
next_review: 2026-08-13
---

# Agent Report

## Task

Prevent overlapping Beauty professional workspace autosaves from using the same optimistic-concurrency revision.

## Files inspected

- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/beautyWorkspaceStorage.ts`
- `src/beauty/beautyWorkspaceRepository.ts`
- stale PR #656
- current `main` commit `7a5d9131c7f43ed2376de66755bb3839a45c0a29`

## Findings

- `BeautySetupPage` starts a save after every workspace state change.
- trusted server saves use the module-level `expectedServerUpdatedAt` concurrency token.
- overlapping saves can therefore send the same expected revision and produce an avoidable conflict.
- stale PR #656 identified the same race but also included an unrelated fixed save dock; that UI expansion was not carried forward.

## Changes made

- added a minimal sequential Beauty workspace save queue;
- routed the existing combined workspace and share-card persistence operation through the queue;
- preserved each caller's own resolved or rejected promise;
- allowed later queued saves to continue after an earlier failure;
- added focused ordering and recovery tests;
- made no UI, auth, RLS, SQL, migration, Storage policy, secret, environment, production-data, merge, or deployment change.

## Checks

- exact-head GitHub Actions: pending.

## Rollback

Close the pull request without merging. No production state was changed.

## Next step

Require exact-head CI. Merge and deployment require separate explicit approval.
