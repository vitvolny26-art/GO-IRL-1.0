---
title: AI Delivery and Vercel Preview Policy
owner: Project Archivist
status: Active
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-08-12
---

# AI Delivery and Vercel Preview Policy

## Purpose

Reduce unnecessary GitHub Actions and Vercel builds without weakening QA, review, or production safety.

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

Small logical commits are allowed locally, but related code fixes should normally be pushed as one validated batch.

Recommended loop:

1. Inspect and patch one focused problem at a time.
2. Keep local commits small and understandable when useful.
3. Group related code fixes into one push checkpoint.
4. Run `pnpm run lint`, `pnpm run build`, and `pnpm run test` before the push.
5. Push only when the current code batch is green.
6. Let GitHub Actions and Vercel filters skip documentation-only changes automatically.

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

## Push batching rule

CI filtering does not replace disciplined delivery.

For code work:

- do not push after every micro-fix;
- collect one coherent batch;
- run required checks;
- push the validated batch once;
- do not force-push or rewrite shared history merely to reduce build count.

A PR may contain several logical commits, but repeated remote pushes should be intentional.

## Role responsibilities

### AI Fixer

- Fix one bug at a time during implementation.
- Do not use `[skip ci]` as routine practice.
- Group related code fixes into one validated push batch.
- Documentation-only reports may be pushed without application checks when they do not change executable files.

### GitHub Operator

- Preserve small logical commits when useful.
- Prefer one push per validated code batch.
- Verify that docs-only automation filters remain narrow and do not hide code changes.
- Do not force-push or create empty commits merely to manipulate deployments.

### QA Lead

- Require local checks for code/configuration changes.
- Do not require app builds for pure docs-only edits.
- Record the commit SHA used for Preview, Telegram, integration, or production smoke testing.

### Release Manager

- Keep production deployment tied to `main`.
- Monitor Vercel quota and distinguish quota failures from application failures.
- Confirm that docs-only changes are skipped while code/configuration changes still build.
- Treat historical Preview deployments as validation history, not production state.

### Project Coordinator

- Include a push budget in coding missions.
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
- skip lint/build/test for code changes merely to save quota;
- broaden docs-only filters so they hide executable configuration;
- disable production deployments from `main`;
- force-push or squash shared history without explicit approval;
- hide a failing build by repeatedly creating deployments;
- treat Vercel success as a replacement for local quality gates;
- treat local green checks as proof of Telegram or production smoke behavior.

## Verification after policy changes

When CI or Vercel filtering changes, verify both paths:

1. A docs-only commit skips GitHub Actions and Vercel.
2. A code or configuration commit still triggers the required checks and deployment.

Do not mark the policy complete from configuration review alone.
