---
title: Vercel Manual Release Gate
owner: Release Manager
status: Partial
source_of_truth: false
last_review: 2026-07-30
next_review: 2026-08-06
---

# Vercel Manual Release Gate

## Task

Stop ordinary GitHub branch pushes and merges from consuming Vercel deployment capacity, and reconcile the active release instructions.

## Role

Release Manager.

## Findings

- Recent Vercel history contained repeated Preview deployments from ordinary implementation pushes.
- The previous repository policy skipped some builds but still created deployment attempts and kept production deployment coupled to `main` merges.
- Official Vercel configuration supports `git.deploymentEnabled: false`, which disables automatic Git deployments for every branch.
- Draft PR #453 reduced deployment volume but still allowed automatic deployments from `main` and `preview/**`; it does not fully separate merge approval from deployment approval.

## Changes

- Set `git.deploymentEnabled` to `false` in `vercel.json`.
- Removed the repository Ignored Build Step because automatic Git deployments are disabled before build scheduling.
- Rewrote `DEPLOYMENT.md` so merge and production deployment are independent approval gates.
- Rewrote `docs/onboarding/AI_DELIVERY_AND_PREVIEW_POLICY.md` so Preview is an explicit exception with an exact ref and one-deployment budget.
- Synchronized the active Drive Common Operating Standard, GitHub Operating Standard, Release Manager contract and Release task module.

## Target

- Repository: `vitvolny26-art/GO-IRL-1.0`
- Branch: `fix/vercel-manual-release-gate-20260730`
- Base at branch creation: `main@b254a13ef55c69e5ec05481cb41eecc183770603`
- Environment: configuration proposal only; no production deployment or Vercel Project Settings mutation performed.

## Checks

- `vercel.json` reread on the branch: automatic Git deployment is disabled.
- Four modified Drive instructions reread after guarded updates.
- Local repository checkout and pnpm gates were not available because the execution container could not resolve `github.com`; exact error: `Could not resolve host: github.com`.
- Final-head GitHub Actions CI is required before merge readiness.
- Vercel deployment history must show no deployment for the final branch head.

## Evidence ledger

| Claim | Evidence | Scope |
|---|---|---|
| Automatic Git deployments are disabled in the proposal | `GH:vercel.json@fix/vercel-manual-release-gate-20260730` | Branch only; not active on `main` |
| Merge and deployment are separate gates | `GH:DEPLOYMENT.md`; Active Drive Common, GitHub, Release Manager and Release task instructions | Governance proposal and active Drive instructions |
| No production action was performed | No merge, deploy, promotion, redeploy or Vercel Project Settings write was called | Current task |
| Local checks are unavailable | Container DNS error resolving `github.com` | Current execution environment |

## Risks and blockers

- Until the branch is reviewed and merged, current `main` continues to control Vercel Git behavior.
- Merge requires explicit owner approval.
- The first production release after merge requires a separate explicit approval and one controlled Vercel deployment action.
- The final PR head must have terminal GitHub CI evidence and no corresponding automatic Vercel deployment.

## Rollback

Before merge, close the Draft PR or leave it unmerged. After merge, revert the configuration commit through a normal reviewed PR; do not force-push or create a deployment solely for rollback bookkeeping.

## Status

**Partial.** The bounded GitHub proposal and active Drive instruction reconciliation are prepared. Merge, production activation and runtime verification remain gated.
