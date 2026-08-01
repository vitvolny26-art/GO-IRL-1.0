---
title: Repository Optimization Audit
owner: Release Manager
status: Draft
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-15
---

# Repository Optimization Audit

## Task

Add a bounded, non-destructive repository hygiene gate before any code or asset optimization.

## Repository state

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Base branch: `main`
- Base SHA: `57fb00094b0ddc7c2126b01ad51b0a6db6243854`
- Task branch: `chore/repo-optimization-audit-20260801-v2`
- Merge target: `main`
- Deploy target: `none`

## Findings

- GitHub reports a repository size of approximately 98 MB.
- Existing Vite configuration already separates React, data, icons, and Sport Vertical chunks.
- The last documented production bundle measurement is dated 2026-07-04 and predates current Services, Beauty, and Admin work.
- `sharp` and `dejavu-fonts-ttf` are used by server-side generated-card code and must not be removed without a dedicated dependency/runtime audit.
- Repository policy already prohibits generated output, local exports, secrets, backups, `node_modules`, `dist`, and `package-lock.json`, but there was no executable repository hygiene gate.

## Changes made

- Added `scripts/repo-check.cjs`.
- Added `pnpm run repo:check`.
- The check fails on tracked forbidden output, secrets, temporary files, backups, and `package-lock.json`.
- Files larger than 5 MiB are reported for manual review but do not fail automatically, avoiding accidental rejection of intentional media assets.
- No files were deleted or moved.
- No product behavior, dependencies, auth, RLS, SQL, migrations, secrets, or production configuration were changed.

## Checks

Local checkout and pnpm gates could not run in the execution container because DNS could not resolve `github.com`.

Required exact-head GitHub CI gates:

1. `pnpm install --frozen-lockfile`
2. `pnpm run repo:check`
3. `pnpm run lint`
4. `pnpm run typecheck`
5. `pnpm run build`
6. `pnpm run test`
7. `git diff --check`

Status: pending GitHub Actions on the pull request head.

## Next step

After this gate is green, collect current build output and tracked-file size evidence. Implement only confirmed optimizations as separate bounded pull requests.

## Rollback

Revert the audit pull request. No runtime or deployment rollback is required.
