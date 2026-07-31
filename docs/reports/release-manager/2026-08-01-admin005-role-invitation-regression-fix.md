---
title: Admin005 Role Invitation Regression Fix
owner: Release Manager
status: Ready for Review
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-02
---

# Agent Report

## Task

Fix repeated redemption of a single-use Telegram role invitation in PR #493 without applying SQL, RLS, migrations, Edge Functions, secrets, production data, or deployment changes.

## Repository and targets

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Base branch: `main`
- Task branch: `Admin005/role-invitations-24h`
- Pull request: #493
- Merge target: GitHub `main`
- Deploy target: `none`

## Findings

The trusted auth session did not retain a safe marker for an already processed role-invitation `start_param`. Repeated `initializeTrustedAuth()` calls could therefore submit the same one-time invitation again and replace an initial `accepted` result with `invalid`.

## Changes made

- Added a SHA-256 fingerprint helper for valid role-invitation start parameters.
- Stored only the fingerprint in the trusted session; the raw bearer token is not persisted.
- Reused the active trusted session when the live fingerprint matches the processed fingerprint.
- Added regression tests for first processing, repeated processing, malformed input, and fingerprint shape.
- Removed the stale unused import found by lint.

## Files changed by the regression fix

- `src/admin/roleInvitationSession.ts`
- `src/admin/roleInvitationSession.test.ts`
- `src/authSession.ts`

## Evidence

- Exact reviewed head before this report: `bf2c3f8735bfbfef6cbfb8eebba9c6fd31063e99`
- GitHub Actions workflow: `CI`
- Run: `1373`
- Workflow run ID: `30672181201`
- Job ID: `91292030442`
- Diff check: PASS
- Tests: PASS — 129 files, 608 tests
- Staff OS checks: PASS
- Typecheck: PASS
- Lint: PASS with one pre-existing `no-console` warning
- Build: PASS
- PR state after verification: open, mergeable, ready for review

## Production state

- Merge: NOT performed
- VPS/Vercel deployment: NOT performed
- Production migration: NOT applied
- Edge Function deployment: NOT performed
- Secrets/configuration/RLS/production data: NOT changed
- Public runtime verification: NOT applicable before deployment

## Rollback

Before merge, remove the three regression-fix commits from the PR branch. After a future squash merge, revert the squash commit on `main`. Do not roll back by restoring raw invitation-token persistence.

## Blockers

Production release still requires separate explicit approval for:

1. merge of PR #493;
2. application and verification of the reviewed Supabase migration;
3. deployment of `verifyTelegramInitData` from merged `main`;
4. Telegram smoke tests for accepted, repeated, expired, malformed, replayed, and role-conflict invitations.

## Next step

Keep PR #493 ready for review. Merge and production operations remain unauthorized until an explicit release command is given.
