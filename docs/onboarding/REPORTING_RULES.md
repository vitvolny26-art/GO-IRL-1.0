---
title: GO IRL Agent Reporting Rules
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# GO IRL Agent Reporting Rules

These rules apply to every GO IRL agent, including Technical Archivist, AI Fixer, QA Agent, Product Lead, UX Lead, Security Lead, Supabase Steward, Release Manager, GitHub Operator, Gemini Assistant Archivist, Replit Operator, and future agents.

The canonical detailed contract is `docs/reports/README.md`.

## Mandatory rule

Every completed task must leave a durable report in `docs/reports/` before the work session ends.

No report means the task is not archivally complete.

## Required report content

Every report must include:

- task;
- files inspected;
- findings or root cause;
- changes made;
- checks and exact status;
- risks and untouched areas;
- next step;
- related PR or commit when available.

## Check status language

For code changes, record actual results:

```text
pnpm run lint       PASS/FAIL
pnpm run build      PASS/FAIL
pnpm run test       PASS/FAIL
pnpm run typecheck  PASS/FAIL
```

For documentation-only work:

```text
Checks: NOT RUN — docs-only
```

For external failures such as quota or unavailable tooling:

```text
Checks: BLOCKED — <exact external reason>
```

Never write `PASS`, `green`, or `beta-ready` without evidence.

## Historical reports

Historical reports are immutable snapshots.

Do not silently rewrite an old report because later CI passed or later work removed a risk. Create a new consolidation or correction report that references the old file and records the updated truth.

## Role-specific expectations

- Technical Archivist: maintain consolidated reports and reporting governance.
- AI Fixer: record root cause, changed files, validation, risks, and untouched sensitive areas.
- QA Agent: record tested flows, blockers, evidence, and unresolved manual checks.
- Product or Market Agent: record sources inspected, decisions, scope impact, and rejected scope.
- Security or Supabase Agent: explicitly state whether auth, RLS, SQL, migrations, secrets, or schema were touched.
- Release Manager: distinguish code failures from Vercel quotas, provider outages, and preview limitations.
- GitHub Operator: record branch, commits, PR, merge state, and CI status.
- Gemini or other report-only agents: save findings as Draft; they cannot approve, merge, or close knowledge debt.

## File naming

Use:

```text
docs/reports/YYYY-MM-DD-agent-report-<topic>.md
```

Use a consolidated report only when several task reports or PRs must be reconciled:

```text
docs/reports/YYYY-MM-DD-consolidated-report-<scope>.md
```

## Session close gate

Before ending a disposable chat or agent session, confirm:

1. durable findings are in the repository;
2. report status is accurate;
3. checks are recorded honestly;
4. next step is explicit;
5. sensitive data is absent.
