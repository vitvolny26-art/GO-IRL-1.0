---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-28
next_review: 2026-08-04
---

# Agent Report

## Task

Audit excessive Vercel deployments and prepare permanent deployment guardrails.

## Files inspected

- `vercel.json`
- `.github/workflows/*.yml`
- Vercel deployment history for `go-irl-1-0`
- GitHub repository and workflow metadata

## Findings

- Vercel Git integration deployed every pushed branch.
- Docs-only branches still created deployment attempts.
- Feature deployments were manually promoted and sometimes redeployed, producing
  multiple production records for the same commit.
- GitHub Actions contains no Vercel deploy, promote, or redeploy command.
- GitHub default branch is `main`; recent automatic production deployments from
  Git also use `main`.
- Vercel dashboard Production Branch must still be manually confirmed as `main`.

## Changes made

- Allow automatic Vercel deployments only for `main` and explicit `preview/**`
  branches.
- Add a fail-open Ignored Build Step that skips docs-only and non-target branches.
- Compare against `VERCEL_GIT_PREVIOUS_SHA` to cover multi-commit pushes safely.

## Checks

- Vercel configuration JSON: PASS.
- Ignored Build Step syntax and branch/docs/runtime scenarios: PASS.
- Lint: PASS with one pre-existing warning.
- Build: PASS.
- Test: PASS (551 tests plus Staff OS checks).
- Typecheck: PASS.

## Next step

In Vercel Project Settings, confirm Production Branch is `main`. Stop manual
promote/redeploy of feature deployments. Merge to `main` once for production;
use `preview/**` only when a deliberate Preview is required.
