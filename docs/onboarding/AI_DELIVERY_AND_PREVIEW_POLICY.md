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

Reduce unnecessary Vercel Preview deployments without weakening QA, review, or production safety.

This policy applies to every GO IRL role that can prepare, commit, push, review, or release code, especially:

- AI Fixer;
- GitHub Operator;
- Release Manager;
- Tech Lead;
- QA Lead;
- Project Coordinator when preparing execution instructions.

GitHub remains source of truth. Vercel Preview is a validation checkpoint, not a build for every micro-commit.

## Core rule

Small logical commits are allowed locally.

Do not push after every tiny fix.

Collect one coherent batch, run the required checks, then push the batch once.

Recommended loop:

1. Inspect and patch one focused problem at a time.
2. Keep local commits small and understandable when useful.
3. Group related fixes into one push checkpoint.
4. Run `pnpm run lint`, `pnpm run build`, and `pnpm run test` before the push.
5. Push only when the current batch is green.
6. Request a Vercel Preview only when visual, runtime, integration, or stakeholder validation is needed.

## Preview deployment rule

The intended GO IRL policy is:

- every merge to `main` may create the production deployment;
- ordinary commits in a PR branch should not automatically consume a Preview build after opt-in preview filtering is implemented;
- a commit with `[preview]` in its message is the explicit checkpoint that requests a Preview deployment;
- one PR may have several local commits but normally only one or a few deliberate Preview checkpoints.

Examples:

```text
fix: align card actions
fix: keep avatar crop inside viewport
fix: complete mobile UI batch [preview]
```

Until the repository implements the Vercel `ignoreCommand` policy, roles must still reduce pushes manually by batching related fixes locally.

## Role responsibilities

### AI Fixer

- Fix one bug at a time, but do not push every micro-fix separately.
- Build a coherent local batch.
- Run all quality gates before pushing.
- Add `[preview]` only when the batch needs a real Preview deployment.

### GitHub Operator

- Preserve small logical commits when useful.
- Prefer one push per validated batch.
- Do not force-push or rewrite history only to reduce Preview count.
- Do not create empty commits merely to trigger deployments unless explicitly approved.

### QA Lead

- Use local checks for intermediate iterations.
- Request Preview only for browser, mobile, Telegram, integration, or stakeholder validation.
- Record which commit SHA was actually tested.

### Release Manager

- Keep production deployment tied to `main`.
- Monitor Vercel build quota and distinguish quota failures from application failures.
- Treat Preview deployment history as disposable validation history, not production state.
- Do not delete old Preview deployments unless retention cleanup is explicitly requested and rollback/reference impact is understood.

### Project Coordinator

- Include a push/preview budget in coding missions.
- Avoid assigning several agents to push separate fixes into the same PR.
- Prefer one validated integration checkpoint over many independent Preview builds.

## Existing Preview deployments

Old Preview deployments created by previous PR commits:

- do not change production;
- are not visible to normal production users;
- may remain in deployment history;
- do not need manual deletion during normal development;
- mainly cost build quota and add list noise.

Do not spend engineering time deleting historical previews unless quota, security, retention, or compliance requires it.

## Forbidden shortcuts

Do not:

- skip lint/build/test merely to save Vercel quota;
- disable production deployments from `main`;
- force-push or squash shared history without explicit approval;
- hide a failing Preview by creating repeated deployments;
- treat Vercel success as a replacement for local quality gates;
- treat local green checks as proof of Telegram or production smoke behavior.

## Planned repository implementation

A separate small infrastructure patch may add:

- `scripts/vercel-ignore-build.cjs`;
- `ignoreCommand` in `vercel.json`;
- production builds always enabled for `main`;
- Preview builds enabled only for explicit `[preview]` checkpoints.

That implementation must be reviewed separately and must not modify auth, RLS, migrations, secrets, or application architecture.
