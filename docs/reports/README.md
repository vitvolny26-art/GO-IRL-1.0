---
title: AI and Agent Reporting Contract
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# AI and Agent Reporting Contract

This folder stores durable task reports from every GO IRL AI role.

## Mandatory delivery workflow

Every task follows this sequence:

1. one task in one branch;
2. no intermediate pushes;
3. complete and inspect the full patch locally;
4. for code or runtime/config changes run `typecheck`, `lint`, `build`, then `test`;
5. one final commit and one final push;
6. one focused PR;
7. squash merge only.

Do not push failed attempts or red states. Continue fixing them locally in the same branch.

## Mandatory report

Every completed task must leave one report in the repository before the disposable chat is closed.

Applies to all agents and successor roles.

## File naming

```text
YYYY-MM-DD-agent-report-<short-task>.md
```

Legacy `ai-fix-report` names remain valid historical snapshots.

## Required report sections

```markdown
---
title: Agent Report
owner: <Agent Role>
status: Draft
source_of_truth: false
last_review: YYYY-MM-DD
next_review: YYYY-MM-DD
---

# Agent Report

## Task
## Files inspected
## Findings
## Changes made
## Checks
## Risks
## Not touched
## Delivery
## Next step
```

## Check status rules

For code or runtime/config changes, record actual results in this order:

```text
pnpm run typecheck  PASS/FAIL
pnpm run lint       PASS/FAIL
pnpm run build      PASS/FAIL
pnpm run test       PASS/FAIL
```

For pure documentation-only work:

```text
Checks: NOT RUN — docs-only
```

A PR is docs-only only when every changed file is Markdown or is under `docs/`. Pure docs-only commits are skipped by Vercel through the repository ignore policy.

For quota, permissions, provider outages, or unavailable tooling:

```text
Checks: BLOCKED — <exact external reason>
```

Never claim `PASS`, `green`, or `beta-ready` without evidence. Never classify an external quota as a code failure.

## Historical reports

Historical reports are immutable snapshots. Correct stale status in a newer correction or consolidation report rather than rewriting history silently.

## Delivery evidence

Record:

- branch name;
- final commit;
- PR number;
- merge method;
- merge commit;
- whether Vercel was skipped, passed, or externally blocked.

## Security and scope

Reports must never contain secrets, `.env` values, tokens, private user data, or production credentials.

Do not claim changes to auth, RLS, SQL, migrations, or secrets unless explicitly approved and actually performed.

Knowledge debt belongs in `docs/audit/KNOWLEDGE_DEBT.md`, not in task reports.