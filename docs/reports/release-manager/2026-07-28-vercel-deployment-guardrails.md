---
title: Agent Report
owner: Release Manager
status: Partial
source_of_truth: false
last_review: 2026-07-28
next_review: 2026-08-04
---

# Agent Report

## Task

Audit excessive Vercel deployments and prepare permanent deployment guardrails.

## Role

Release Manager.

Activated roles:

- Release Manager — deployment evidence, quota classification and release gate.
- GitHub Operator — repository/workflow inspection and bounded branch commit.
- Archivist — durable report placement and documentation alignment.

Skipped roles:

- Security Lead and Supabase Steward — no auth, secrets, RLS, SQL, migrations or
  production data were touched.
- QA Lead — existing application suite was sufficient for this configuration
  change; no product-flow behavior changed.

## Sources inspected

- Active Google Drive Common Operating Standard.
- Active Google Drive Release Manager Operating Contract.
- Google Drive Operating Standard and reporting rules.
- GitHub `main` and current Vercel deployment evidence.
- Official Vercel configuration and deployment-limit documentation.

## Files inspected

- `vercel.json`
- `DEPLOYMENT.md`
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
- Hobby capacity was exhausted at 100 deployments in a rolling 24-hour window.
- Production remained `READY`; no rollback or repair deployment was required.

## Changes made

- Allow automatic Vercel deployments only for `main` and explicit `preview/**`
  branches.
- Add a fail-open Ignored Build Step that skips docs-only and non-target branches.
- Compare against `VERCEL_GIT_PREVIOUS_SHA` to cover multi-commit pushes safely.
- Document the one-merge/one-production-deployment rule in `DEPLOYMENT.md`.
- Create the personal `vercel-limit-guard` Codex plugin for read-only rolling
  24-hour monitoring and early warnings.

## Checks

- Vercel configuration JSON: PASS.
- Ignored Build Step syntax and branch/docs/runtime scenarios: PASS.
- Lint: PASS with one pre-existing warning.
- Build: PASS.
- Test: PASS (551 tests plus Staff OS checks).
- Typecheck: PASS.

## GitHub

- Repository: `vitvolny26-art/GO-IRL-1.0`
- Base: `main`
- Working branch: `fix/vercel-deploy-guardrails`
- Candidate commit before final documentation amendment:
  `9dd8f9d431cdc3855447ad6717505b91d8dea143`
- Merge: NOT PERFORMED — requires explicit owner approval.

## Target environment

- Target: Vercel production after an approved merge to `main`.
- Current production commit observed:
  `f39936ba6840432aed4de892364714762d528d90`
- Current production state observed: `READY`.
- No production deployment was initiated.

## Risks

- Until this branch reaches `main`, existing Vercel Git behavior may still create
  deployments for ordinary branches.
- Vercel dashboard Production Branch could not be directly verified because the
  browser session was not authenticated. GitHub default branch and automatic
  production deployment evidence both identify `main`.
- The plugin needs a Vercel access token supplied through the environment; it
  stores no token and cannot monitor without credentials.

## Not touched

- Production deployment, promote, redeploy, rollback or aliases.
- Vercel Project Settings.
- `.env`, credentials, secrets, auth, RLS, SQL, migrations and production data.
- GitHub merge or force push.

## Rollback

Before merge, delete the branch or close its PR. After merge, revert the guardrail
commit through a normal reviewed commit. Do not use force push or an unnecessary
Vercel redeploy.

## Evidence ledger

| Claim | Evidence | Scope |
|---|---|---|
| Excess volume came from automatic branch builds plus manual promote/redeploy | Vercel deployment metadata contains ordinary feature/docs branches and `action: promote` / `action: redeploy` records | Inspected recent `go-irl-1-0` deployment window |
| GitHub Actions did not create Vercel deployments | All active workflow files were searched; no Vercel deploy, promote or redeploy command was found | Current GitHub `main` workflows |
| The guardrail behaves safely | JSON/syntax checks and non-target, docs-only and runtime-change scenario tests passed; unsafe diff detection continues the build | Candidate branch configuration and helper |
| Application quality gates are green | Lint, typecheck, build, 551 tests and Staff OS checks completed | Candidate working tree before final docs amendment |
| Production did not require repair | Latest observed production was `READY` on commit `f39936ba...` | Vercel project `go-irl-1-0` |

## Blockers

- Merge approval is not granted.
- Vercel Project Settings -> Git -> Production Branch still needs an authenticated
  visual confirmation of `main`.

## Next step

Review the bounded branch. After explicit merge approval, merge once to `main`
and allow exactly one automatic production deployment. Then confirm Production
Branch is `main` and verify the resulting deployment without redeploy/promote.
