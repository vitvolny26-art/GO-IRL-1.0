---
title: AI Delivery and Vercel Preview Policy
owner: Project Archivist
status: Active
source_of_truth: false
last_review: 2026-07-24
next_review: 2026-08-24
---

# AI Delivery and Vercel Preview Policy

## Purpose

Reduce unnecessary GitHub history, GitHub Actions runs, and Vercel builds without weakening QA, review, or production safety.

This policy applies to every GO IRL role that can prepare, commit, push, review, or release changes, especially:

- AI Fixer;
- GitHub Operator;
- Release Manager;
- Tech Lead;
- QA Lead;
- Project Coordinator when preparing execution instructions.

GitHub remains source of truth.

## Core rule

Do not use `[skip ci]` as the normal workflow.

Repository configuration must decide whether a change needs CI or a Vercel build.

Prefer one complete logical commit per task where practical. Do not create checkpoint, context-preservation, empty, or meaningless commits merely to preserve chat state, trigger automation, or create artificial progress history.

Related code fixes should normally be completed as one coherent task batch, committed once, and pushed once after the batch is ready for verification.

Recommended loop:

1. Inspect and patch one focused problem at a time without creating remote history for every micro-step.
2. Accumulate the complete logical task locally or in the working branch.
3. Run local checks when a working checkout is available.
4. Create one complete logical commit where practical.
5. Push one coherent verification checkpoint.
6. Use the attached GitHub autorunner as the authoritative fallback verification path when local checkout or local checks are unavailable.
7. Verify the exact pushed commit SHA. Do not claim green until required checks reach a terminal green result.
8. Let GitHub Actions and Vercel filters skip documentation-only changes automatically.

## Documentation-only changes

A documentation-only change means every changed file is either:

- under `docs/**`; or
- a Markdown file matching `**/*.md`.

For documentation-only changes:

- GitHub Actions CI should not run;
- Vercel should skip the build;
- agents must not add `[skip ci]` merely to suppress automation;
- local application build checks are not required unless the documentation change also modifies executable configuration, generated code, package metadata, or runtime behavior.

The repository implements this through:

- `paths-ignore` in `.github/workflows/ci.yml`;
- `ignoreCommand` in `vercel.json`.

## Code and configuration changes

Changes outside `docs/**` and `**/*.md` are not documentation-only.

They must continue to trigger the normal quality path, including relevant GitHub Actions and Vercel deployment behavior.

Examples that must not be treated as docs-only:

- `src/**`;
- `tests/**`;
- `scripts/**`;
- `supabase/**` SQL or functions;
- `.github/workflows/**`;
- `vercel.json`;
- `package.json` or `pnpm-lock.yaml`;
- root JSON, YAML, TypeScript, JavaScript, or configuration files.

## Commit and push batching rule

CI filtering does not replace disciplined delivery.

For code work:

- prefer one complete logical commit per task where practical;
- do not commit after every micro-fix;
- do not push after every micro-fix;
- do not create commits whose only purpose is preserving AI/chat context;
- do not create empty or meaningless commits merely to retrigger CI when the workflow can be rerun without changing code;
- collect one coherent batch;
- run required local checks when available;
- push the validated or ready-for-autorunner batch once;
- do not force-push or rewrite shared history merely to reduce build count.

A PR may contain several logical commits only when the task genuinely contains separable reviewed changes. Commit count must not be used as a progress log.

## GitHub autorunner verification rule

The repository has an attached GitHub autorunner for code/configuration verification.

For every pushed code or configuration commit:

- verification is tied to the exact commit SHA;
- required quality gates are `test`, `typecheck`, `lint`, and `build`;
- if local checkout and local checks are available, run them before push and still verify the pushed SHA in GitHub;
- if local checkout or local checks are unavailable, the GitHub autorunner is the authoritative fallback verification path;
- wait for the same SHA to reach a terminal workflow state before classifying it green or red;
- an initial absence of a workflow run is not evidence that the runner is broken; re-check the same SHA before taking action;
- do not create another commit or push only because a workflow has not appeared yet;
- when red, use the exact failing error block and make the smallest relevant correction;
- never claim success from a pending, skipped-required, cancelled, or unverified run.

A Vercel Preview success does not replace the required GitHub quality gates.

## Role responsibilities

### AI Fixer

- Fix one bounded task at a time during implementation.
- Do not use `[skip ci]` as routine practice.
- Prefer one complete logical commit and one validated push per coherent task batch.
- Use the GitHub autorunner on the exact pushed SHA as the fallback verification path when local checks are unavailable.
- Documentation-only reports may be pushed without application checks when they do not change executable files.

### GitHub Operator

- Keep history concise and meaningful.
- Prefer one complete logical commit per task where practical and one push per validated code batch.
- Verify required autorunner checks on the exact pushed SHA.
- Verify that docs-only automation filters remain narrow and do not hide code changes.
- Do not force-push or create empty commits merely to manipulate deployments or CI.

### QA Lead

- Require the quality gates for code/configuration changes.
- Accept the GitHub autorunner as the authoritative fallback when local execution is unavailable, provided the exact pushed SHA is verified.
- Do not require app builds for pure docs-only edits.
- Record the commit SHA used for Preview, Telegram, integration, or production smoke testing.

### Release Manager

- Keep production deployment tied to `main`.
- Monitor Vercel quota and distinguish quota failures from application failures.
- Confirm that docs-only changes are skipped while code/configuration changes still build.
- Require terminal green autorunner evidence on the exact release candidate SHA before release claims.
- Treat historical Preview deployments as validation history, not production state.

### Project Coordinator

- Include a commit/push budget in coding missions.
- Default to one complete logical commit and one verification push per coherent task where practical.
- Avoid assigning several agents to push separate fixes into the same PR.
- Classify each mission as docs-only or code/configuration before selecting checks.
- Never classify workflow, Vercel, package, Supabase, or runtime configuration changes as docs-only.

## Existing Preview deployments

Old Preview deployments created by previous PR commits:

- do not change production;
- are not visible to normal production users;
- may remain in deployment history;
- do not need manual deletion during normal development;
- mainly cost build quota and add list noise.

Do not spend engineering time deleting historical previews unless quota, security, retention, or compliance requires it.

## Branch protection caution

If GitHub branch protection requires the CI check by name, verify that a skipped docs-only workflow does not leave the pull request blocked in a permanently pending state.

If it does, adjust the branch protection rule or use a lightweight always-present docs check rather than removing quality gates from code changes.

## Forbidden shortcuts

Do not:

- use `[skip ci]` routinely;
- create micro/checkpoint commits merely to preserve AI context or show progress;
- create empty or meaningless commits merely to retrigger CI when rerun is available;
- skip required quality gates for code changes merely to save quota;
- broaden docs-only filters so they hide executable configuration;
- disable production deployments from `main`;
- force-push or rewrite shared history without explicit approval;
- hide a failing build by repeatedly creating deployments or commits;
- treat Vercel success as a replacement for required quality gates;
- treat local green checks as proof of Telegram or production smoke behavior;
- treat a pending or missing-first-check autorunner state as a reason to create another commit.

## Verification after policy changes

When CI or Vercel filtering changes, verify both paths:

1. A docs-only commit skips GitHub Actions and Vercel.
2. A code or configuration commit still triggers the required checks and deployment.

When only this policy wording changes, no application checks are required because the change is documentation-only.

Do not mark CI/runtime behavior complete from policy text alone; runtime behavior must still be verified against actual workflow evidence.