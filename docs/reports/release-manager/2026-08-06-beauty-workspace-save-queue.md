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

- base `main`: `7a5d9131c7f43ed2376de66755bb3839a45c0a29`;
- Draft PR: #681;
- implementation/report head: `dcf443a144b1a62b7b46b6839268c42006d9320a`;
- GitHub Actions CI #1788, run `31056164524`, job `92474017028`: PASS;
- dependency install: PASS;
- repository check: PASS, 1284 tracked files;
- diff check: PASS;
- tests: PASS, 155 files and 723 tests including Staff OS;
- focused save-queue tests: PASS, 2 tests;
- typecheck: PASS;
- lint: PASS with one pre-existing warning in `api/_shared/admin-authorization.ts` outside this scope;
- build: PASS;
- bundle budget: PASS.

## Rollback

Close PR #681 without merging. No production state was changed.

## Next step

Require exact-head CI after this report-only update. Then mark PR #681 ready for review. Merge and deployment require separate explicit approval.
