---
title: Task Continuity Workflow
owner: Chief Archivist / Technical Lead
status: Review
source_of_truth: true
last_review: 2026-08-01
next_review: 2026-08-15
---

# Task Continuity Workflow

## Purpose

Let any successor locate one concrete task, verify its current state, report completed work, and continue without depending on chat history.

GitHub is authoritative. Drive and ClickUp are mirrors. Chats are disposable.

## Stable Task ID

Every governed task receives one immutable ID such as `ADMIN010`, `BEAUTY005`, `COM-REV031`, or `OPS001`.

The same Task ID must appear in:

- GitHub Issue title and body;
- branch name;
- pull request title/body;
- task capsule;
- agent report;
- Drive mirror title;
- n8n mission metadata when used.

Never create a second ID for the same scope. Split materially different scope into a new task.

## Canonical objects

1. `docs/tasks/CURRENT.md` — points to exactly one active task.
2. `docs/tasks/TASK_INDEX.md` — compact registry for active, blocked, review, and completed tasks.
3. `docs/tasks/capsules/<TASK-ID>.md` — mutable current-state capsule.
4. GitHub Issue — discussion, approval, and operational record.
5. Pull Request — proposed repository change and exact checks.
6. `docs/reports/...` — immutable evidence snapshots.

## Task capsule contract

A capsule contains only the minimum state required to resume:

- objective;
- scope and non-goals;
- authority and source paths;
- Issue, branch, PR, and exact SHA;
- current status;
- verified facts;
- changes completed;
- checks and runtime evidence;
- blockers;
- next single action;
- resume instructions.

Do not paste full logs. Link evidence and preserve exact IDs.

## Lifecycle

`Proposed -> Ready -> Active -> Review -> Blocked | Completed | Superseded`

Rules:

- only one task is `Active` in `CURRENT.md`;
- a task may move to `Review` while another becomes Active only after its capsule is updated;
- `Completed` requires required checks and evidence;
- `Blocked` must name the external dependency or red block;
- `Superseded` must link the replacement Task ID.

## Start procedure

1. Read `CURRENT.md` and the referenced capsule.
2. Verify GitHub Issue, branch/PR, and current `main`.
3. Confirm one bounded objective and one primary role.
4. Update capsule status to `Active` before changing code or docs.
5. State merge and deploy targets before writes.

## Work procedure

1. Inspect usage before editing.
2. Make the smallest safe patch.
3. Record exact changed files and evidence in the capsule.
4. Run required gates.
5. Open or update one PR linked to the Task ID.
6. Do not merge or deploy without the required approval.

## Report procedure

Create an immutable report when a meaningful step ends. The report must include:

- `task_id`;
- capsule path;
- Issue and PR;
- exact base/head/merge/deploy SHA when applicable;
- verified checks;
- what was not done;
- one next action.

After creating the report, update the capsule with the report path and current state. Do not rewrite historical reports to reflect later outcomes; add a consolidation report.

## Resume procedure

A successor resumes by reading only:

1. `docs/tasks/CURRENT.md`;
2. referenced task capsule;
3. linked Issue/PR;
4. latest linked report;
5. exact files listed under `Read next`.

The capsule `Resume` section must answer:

- What is the single current objective?
- What is already verified?
- What is blocked?
- What exact action should happen next?
- What must not be touched?

## Completion procedure

1. Verify all acceptance criteria.
2. Record exact check and runtime evidence.
3. Create final report.
4. Mark capsule `Completed`.
5. Move task from Active to Completed in `TASK_INDEX.md`.
6. Point `CURRENT.md` to the next approved task or `none`.
7. Close the Issue only when repository state and evidence agree.

## Safety

No task workflow document authorizes merge, deployment, auth, secrets, RLS, SQL, migrations, production data changes, or destructive operations. Those still require their normal explicit approvals.
