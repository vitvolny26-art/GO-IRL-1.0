---
title: Task Report Linkage Contract
owner: Chief Archivist / Technical Lead
status: Review
source_of_truth: true
last_review: 2026-08-01
next_review: 2026-08-15
---

# Task Report Linkage Contract

This document supplements `docs/reports/README.md` for tasks governed by `docs/tasks/TASK_WORKFLOW.md`.

## Required linkage

Every new governed report must include:

- stable Task ID;
- task capsule path;
- GitHub Issue;
- pull request when one exists;
- base, head, merge, and deployed SHA when applicable;
- verified checks;
- one next action or completion statement.

## Required report additions

Add these fields to report frontmatter and body:

```markdown
task_id: <TASK-ID>

## Links

- Capsule:
- Issue:
- PR:
- Base SHA:
- Head SHA:
- Merge SHA:
- Deploy target:
- Deployment:

## Resume

- Read next:
- Next single action:
- Do not touch:
```

## State rule

Reports are immutable evidence snapshots. The task capsule is the mutable current state.

After writing a report:

1. reread the report;
2. add its path to the capsule;
3. update capsule status, verified facts, blockers, and next action;
4. do not modify earlier reports to represent later outcomes.

Use a consolidation report when several reports or pull requests complete one workstream.
