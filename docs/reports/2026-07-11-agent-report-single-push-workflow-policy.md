---
title: Agent Report — Single Push Workflow Policy
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report

## Task

Codify the new mandatory agent workflow: one task per branch, no intermediate pushes, checks before the final push, one PR, squash merge, and automatic Vercel skipping for pure docs-only changes.

## Files inspected

- `AGENTS.md`
- `docs/onboarding/REPORTING_RULES.md`
- `docs/reports/README.md`
- `.github/pull_request_template.md`
- `DEPLOYMENT.md`
- `vercel.json`
- `package.json`

## Findings

- Reporting rules existed, but they did not require one final push or squash-only merge.
- The PR template did not explicitly prohibit intermediate pushes.
- Vercel attempted deployments for documentation-only changes and could consume the free deployment quota.
- The repository already exposes `typecheck`, `lint`, `build`, and `test` scripts.

## Changes made

- Added the single-task/single-branch workflow to root agent rules.
- Added the same delivery contract to onboarding and reporting documentation.
- Updated the PR template with one-push and squash-merge gates.
- Added a Vercel `ignoreCommand` that skips commits containing only Markdown or files under `docs/`.

## Checks

Targeted Vercel ignore-command validation:

```text
docs-only change exit code: 0 — skip deployment
runtime change exit code: 1 — continue deployment
```

Full repository checks must be green before merge because `vercel.json` is deployment configuration:

```text
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test
```

## Risks

- A future documentation file outside `docs/` that is not Markdown will correctly trigger deployment.
- Mixed docs/runtime PRs will correctly trigger deployment.

## Not touched

- runtime source code
- dependencies or lockfile
- environment files
- auth
- Supabase RLS
- SQL
- migrations
- secrets

## Delivery

- One task branch.
- One final commit and branch update.
- One PR.
- Squash merge only after required checks are green.

## Next step

Verify the PR diff and required checks, then squash merge.