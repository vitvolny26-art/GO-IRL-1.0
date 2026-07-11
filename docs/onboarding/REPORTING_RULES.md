---
title: GO IRL Agent Reporting and Delivery Rules
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# GO IRL Agent Reporting and Delivery Rules

These rules apply to every GO IRL agent.

## Mandatory delivery workflow

1. Work on one task in one branch.
2. Do not push intermediate attempts, experiments, or red states.
3. Finish the patch and review the complete diff locally first.
4. For code or runtime/config changes, run checks in this order:

```text
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test
```

5. Push only after all required checks pass.
6. Make one final push.
7. Open one focused PR.
8. Merge with squash only.

If required checks fail, do not push. Report only the exact red block and continue in the same local branch.

## Documentation-only changes

A PR is docs-only only when every changed file is Markdown or is under `docs/`.

For a pure docs-only PR:

```text
Checks: NOT RUN — docs-only
```

Pure docs-only commits are skipped by Vercel through the repository `ignoreCommand` policy. A PR that changes runtime code, dependencies, workflow configuration, deployment configuration, environment files, or non-document assets is not docs-only.

## Reporting rule

Every completed task must leave one durable report in `docs/reports/` before the session ends.

Every report must include:

- task;
- files inspected;
- findings or root cause;
- changes made;
- checks and exact results;
- risks and untouched areas;
- branch, PR, and merge state;
- next step.

## Status language

For successful code checks, record actual results only:

```text
pnpm run typecheck  PASS
pnpm run lint       PASS
pnpm run build      PASS
pnpm run test       PASS
```

For external failures:

```text
Checks: BLOCKED — <exact external reason>
```

Never classify an external provider quota as a code failure.

## Historical reports

Historical reports are immutable snapshots. Do not silently rewrite them. Create a new correction or consolidation report.

## Safety

Do not change `.env`, secrets, auth, Supabase RLS, destructive SQL, or migrations without explicit approval. Never force push.