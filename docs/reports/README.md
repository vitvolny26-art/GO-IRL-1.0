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

## Mandatory rule

Every completed task must leave a report in the repository before the disposable chat is closed.

Applies to all roles, including Technical Archivist, AI Fixer, QA Lead, Product Lead, Market Analyst, UX Lead, Security Lead, Supabase Steward, Release Manager, GitHub Operator, Replit Operator, and successor agents.

## File naming

Use:

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

## Next step
```

## Check status rules

- Never write `PASS` unless the check actually completed successfully.
- Use `NOT RUN — docs-only` when code checks are not required.
- Use `BLOCKED — <external reason>` for quota, permissions, or unavailable tooling.
- Do not leave `pending CI` after a PR is merged. A later consolidation report must record the final state.
- Historical reports are immutable snapshots. Correct stale status in a newer consolidation report rather than rewriting history silently.

## Quality gates

For code changes, record:

```text
pnpm run lint       PASS/FAIL
pnpm run build      PASS/FAIL
pnpm run test       PASS/FAIL
pnpm run typecheck  PASS/FAIL, when configured
```

Commit or merge only when required checks are green. External quota failures must be identified separately from code failures.

## Security and scope

Reports must never contain secrets, `.env` values, tokens, private user data, or production credentials.

Do not claim changes to auth, RLS, SQL, migrations, or secrets unless explicitly approved and actually performed.

## Consolidation reports

A consolidation report is required when:

- multiple PRs complete one workstream;
- task reports have stale `pending` states;
- a disposable work session ends after several changes;
- project handoff would otherwise require reading many small reports.

The current consolidation report is:

`docs/reports/2026-07-11-consolidated-report-pr-1-30.md`

Knowledge debt belongs in `docs/audit/KNOWLEDGE_DEBT.md`, not in task reports.