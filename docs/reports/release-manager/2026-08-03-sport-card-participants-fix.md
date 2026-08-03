---
title: Sport Card Participants Fix Release
owner: GO IRL Release Engineer
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-10
---

# Sport Card Participants Fix Release

## Task

Restore the compact sport-card footer and align participant popovers inside and outside the event detail.

## Source

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Base branch: `main`
- Source main SHA: `93224c0a348f2c4afb121b4ac1966f2125cfc82b`
- Task branch: `fix/sport-card-bottom-info`
- Deploy targets: VPS and Vercel production

## Changes

- Removed the duplicate participant item from the compact card footer.
- Removed the ineffective positional CSS workaround.
- Reused the joined-participant selection inside the event-detail popup.
- Resolved current public profile names and stored avatar images in the external participant popup, with initials fallback.

## Checks

- `pnpm run repo:check`: PASS
- `pnpm run lint`: PASS (one pre-existing warning)
- `pnpm run typecheck`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: PASS, 636 tests
- `git diff --check`: PASS
- Local browser verification: PASS on the exact task worktree

## Release evidence

PR, CI, merge, VPS execution, Vercel deployment, and production verification are recorded in the final release result after completion.

## Rollback

Revert the release merge commit and redeploy the resulting verified `main` SHA to both production targets.
