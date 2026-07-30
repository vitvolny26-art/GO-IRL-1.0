---
title: AI Delivery and Vercel Preview Policy
owner: Project Archivist
status: Active
source_of_truth: false
last_review: 2026-07-30
next_review: 2026-08-30
---

# AI Delivery and Vercel Preview Policy

## Purpose

Reduce unnecessary GitHub Actions and Vercel deployments without weakening QA, review, or production safety.

This policy applies to every GO IRL role that can prepare, commit, push, review, merge, or release changes, especially:

- AI Fixer;
- GitHub Operator;
- Release Manager;
- Tech Lead;
- QA Lead;
- Project Coordinator when preparing execution instructions.

GitHub remains source of truth for repository configuration and durable technical documentation.

## Core rule

Do not use `[skip ci]` as the normal workflow.

GitHub CI and Vercel deployment are separate systems and separate gates:

- GitHub Actions verifies code and configuration changes automatically according to workflow filters.
- Automatic Vercel Git deployments are disabled in `vercel.json`.
- A branch push or merge to `main` must not implicitly create a Preview or production deployment.
- Merge approval does not authorize production deployment.
- Production deployment requires a separate explicit owner approval for the exact verified commit SHA.

Small logical commits are allowed locally, but related code fixes should normally be pushed as one validated batch.

Recommended loop:

1. Inspect and patch one focused problem at a time.
2. Keep local commits small and understandable when useful.
3. Group related code fixes into one push checkpoint.
4. Run `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, and `pnpm run test` before the push when code or executable configuration changed.
5. Push only when the current code batch is green or when a Draft PR records the exact blocker.
6. Let GitHub Actions verify the pushed code without creating a Vercel deployment.
7. Request Preview or production deployment only when the required evidence cannot be obtained locally or through CI.

## Documentation-only changes

A documentation-only change means every changed file is either:

- under `docs/**`; or
- a Markdown file matching `**/*.md`.

For documentation-only changes:

- GitHub Actions CI should not run under the current `paths-ignore` rules;
- Vercel must not deploy because automatic Git deployments are disabled;
- agents must not add `[skip ci]` merely to suppress automation;
- local application build checks are not required unless the documentation change also modifies executable configuration, generated code, package metadata, or runtime behavior.

The repository implements CI filtering through `paths-ignore` in `.github/workflows/ci.yml`. Vercel deployment suppression is enforced independently through `git.deploymentEnabled: false` in `vercel.json`.

## Code and configuration changes

Changes outside `docs/**` and `**/*.md` are not documentation-only.

They must continue to trigger the normal GitHub Actions quality path. They do not automatically trigger Vercel deployment.

Examples that must not be treated as docs-only:

- `src/**`;
- `tests/**`;
- `scripts/**`;
- `supabase/**` SQL or functions;
- `.github/workflows/**`;
- `vercel.json`;
- `package.json` or `pnpm-lock.yaml`;
- root JSON, YAML, TypeScript, JavaScript, or configuration files.

## Push budget

CI filtering does not replace disciplined delivery.

For code work:

- do not push after every micro-fix;
- collect one coherent batch;
- run required checks;
- push the validated batch once;
- declare an expected push budget in missions that are likely to require iterative fixes;
- do not force-push or rewrite shared history merely to reduce build count.

A PR may contain several logical commits, but repeated remote pushes must be intentional and bounded.

## Preview deployment gate

Preview deployment is exceptional, not automatic.

Before starting a Preview deployment, record:

- the exact commit SHA;
- the QA question that cannot be answered by local checks or GitHub Actions;
- the target branch and environment;
- the expected deployment count, normally one;
- the approval authorizing the deployment;
- the stop condition if the deployment is blocked or fails.

Do not create retry branches, empty commits, duplicate PRs, redeployments, or promotions merely to obtain another Vercel attempt. A quota or build-rate-limit failure must remain the recorded blocker until capacity is available.

## Production deployment gate

Production remains based on an approved commit from `main`, but deployment is manual.

Required sequence:

1. Verify all required checks on the exact candidate SHA.
2. Obtain explicit owner approval to merge.
3. Merge without triggering Vercel deployment.
4. Read back the resulting `main` SHA and release scope.
5. Obtain separate explicit owner approval to deploy that exact SHA to production.
6. Start exactly one production deployment.
7. Record deployment ID, commit SHA, environment, result, smoke evidence, and rollback condition.

Do not promote an old Preview as a substitute for the approved `main` artifact unless an incident-specific release plan explicitly authorizes it.

## Role responsibilities

### AI Fixer

- Fix one bounded problem at a time.
- Do not use `[skip ci]` as routine practice.
- Group related code fixes into one validated push batch.
- Do not request Preview deployment unless interactive evidence is required.

### GitHub Operator

- Preserve small logical commits when useful.
- Prefer one push per validated code batch.
- Verify that docs-only CI filters remain narrow and do not hide code changes.
- Verify that `vercel.json` keeps automatic Git deployments disabled.
- Do not force-push, create empty commits, or create retry PRs to manipulate deployments.

### QA Lead

- Require local and CI checks for code/configuration changes.
- Do not require app builds for pure docs-only edits.
- Record the exact commit SHA used for Preview, Telegram, integration, or production smoke testing.
- Request no more than one Preview deployment per approved evidence question unless a new code SHA or explicit exception exists.

### Release Manager

- Keep the production artifact based on an approved `main` SHA.
- Keep merge and production deployment as separate approval gates.
- Monitor Vercel quota and distinguish quota failures from application failures.
- Start no more than one production deployment per approved SHA unless an incident-specific retry is explicitly approved.
- Treat historical Preview deployments as validation history, not production state.

### Project Coordinator

- Include a push and deployment budget in coding missions.
- Avoid assigning several agents to push separate fixes into the same PR.
- Classify each mission as docs-only or code/configuration before selecting checks.
- Never classify workflow, Vercel, package, Supabase, or runtime configuration changes as docs-only.
- Route deployment requests through the Release Manager gate.

## Existing Preview deployments

Old Preview deployments created by previous PR commits:

- do not change production;
- are not visible to normal production users;
- may remain in deployment history;
- do not need manual deletion during normal development;
- mainly cost quota and add list noise.

Do not spend engineering time deleting historical previews unless quota, security, retention, or compliance requires it.

## Branch protection caution

If GitHub branch protection requires the CI check by name, verify that a skipped docs-only workflow does not leave the pull request blocked in a permanently pending state.

If it does, adjust the branch protection rule or use a lightweight always-present docs check rather than removing quality gates from code changes.

Vercel status must not be configured as a mandatory merge check while automatic Git deployments are disabled.

## Forbidden shortcuts

Do not:

- use `[skip ci]` routinely;
- skip lint/typecheck/build/test for code changes merely to save quota;
- broaden docs-only filters so they hide executable configuration;
- re-enable automatic Vercel Git deployments without explicit approval and a reviewed quota plan;
- treat merge approval as production deployment approval;
- force-push or squash shared history without explicit approval;
- create empty commits, retry branches, or duplicate PRs merely to trigger Vercel;
- hide a failing build by repeatedly creating deployments;
- treat Vercel success as a replacement for local and CI quality gates;
- treat local green checks as proof of Telegram or production smoke behavior.

## Verification after policy changes

When CI or Vercel configuration changes, verify both paths:

1. A code/configuration commit still triggers required GitHub Actions checks.
2. A branch push or merge does not create a Vercel deployment automatically.
3. An explicitly approved manual deployment can target the intended exact SHA.

Do not mark the policy complete from configuration review alone. Runtime verification is required after the configuration reaches `main`.
