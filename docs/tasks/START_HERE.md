---
title: Task Resume Entry Point
owner: Chief Archivist / Technical Lead
status: Review
source_of_truth: true
last_review: 2026-08-01
next_review: 2026-08-15
---

# Task Resume Entry Point

For any new or resumed GO IRL work:

1. Read `docs/tasks/CURRENT.md`.
2. Open the referenced capsule.
3. Verify its Issue, branch or PR, and exact SHA.
4. Read only the latest linked report and files listed under `Authority and read next`.
5. Continue only the capsule's `Next single action`.

Do not reconstruct current state from chat history or from a collection of old reports.

When starting a new task:

1. assign one stable Task ID;
2. create one GitHub Issue;
3. create one capsule from `docs/tasks/templates/TASK_CAPSULE_TEMPLATE.md`;
4. add it to `TASK_INDEX.md`;
5. point `CURRENT.md` to it;
6. state merge and deploy targets before writes.

When ending a work session:

1. create an immutable report;
2. reread it;
3. update the capsule with evidence, blockers, and next action;
4. update the task index only when lifecycle state changes.
