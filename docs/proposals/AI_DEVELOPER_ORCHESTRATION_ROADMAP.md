---
title: GO IRL AI Developer Orchestration Roadmap
owner: Technical Archivist
status: Proposal
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# GO IRL AI Developer Orchestration Roadmap

## Purpose

Define the smallest safe path for orchestrating AI developers around GO IRL 1.0 using n8n, GitHub, Codex, specialist review roles, deterministic gates, and human approval.

This document is written for implementation by Codex. It does not override `ROADMAP.md`, `BACKLOG.md`, `DOCS_INDEX.md`, `AI_ROLES.md`, `PROJECT_COORDINATOR_CHARTER.md`, or current security constraints.

## Design target

The system must turn one approved development mission into one bounded result:

```text
Mission Intake
-> Deterministic Validation
-> Context Pack
-> Planner
-> Implementer
-> Reviewer
-> QA Gate
-> Human Approval
-> Commit / Draft PR
-> Durable Report
```

The orchestrator must not create parallel uncontrolled work, autonomous merges, or architecture drift.

## Core operating rules

1. One mission at a time.
2. GitHub is the source of truth.
3. Codex writes code only inside an approved branch and file scope.
4. Every implementation must have an independent review pass.
5. Every code change must run `pnpm run lint`, `pnpm run build`, and `pnpm run test`.
6. No commit if checks fail.
7. No autonomous merge or production deploy.
8. No `.env`, secrets, auth, Supabase RLS, destructive SQL, or migrations without explicit owner approval.
9. Large patches must be implemented by a bounded `.cjs` patch script.
10. Final durable knowledge goes to `docs/reports/`.

# Target roles

## Technical Archivist

Owns:

- source-of-truth checks;
- documentation continuity;
- mission evidence pack;
- conflict detection;
- final archival report.

Does not:

- route daily work as Coordinator;
- approve security-sensitive changes;
- merge code.

## Mission Planner

Owns:

- task decomposition;
- file scope;
- dependency map;
- acceptance criteria;
- check plan.

Recommended implementation: deterministic rules first, LLM only for ambiguous decomposition.

## Codex Implementer

Owns:

- repository inspection;
- minimal patch;
- tests tied to changed behavior;
- local checks;
- commit preparation.

Must not expand scope.

## Code Reviewer

Owns:

- diff review;
- correctness;
- regressions;
- architecture drift;
- missing tests;
- unsafe side effects.

Should use a separate model call or separate execution from the Implementer.

## QA Gatekeeper

Owns:

- acceptance matrix;
- lint/build/test verification;
- manual smoke requirements;
- green/red classification.

Cannot approve a merge without evidence.

## Security Reviewer

Activated only for:

- auth;
- RLS;
- Telegram initData;
- permissions;
- secrets;
- SQL;
- migrations;
- external write paths.

## GitHub Publisher

Owns:

- branch creation;
- intentional commit;
- push;
- Draft PR creation;
- PR metadata.

Cannot merge.

# Mission contract

Every mission must include:

```yaml
mission_id:
title:
objective:
business_reason:
expected_deliverable:
related_issue:
allowed_files:
forbidden_files:
allowed_actions:
forbidden_actions:
acceptance_criteria:
required_checks:
maximum_budget_usd:
maximum_model_calls:
owner_approval_required:
```

## Required default constraints

```yaml
forbidden_actions:
  - architecture_rewrite
  - force_push
  - merge
  - deploy
  - edit_env
  - access_or_change_secrets
  - change_auth
  - change_rls
  - execute_destructive_sql
  - create_or_apply_migration
```

# Context Pack contract

Codex must receive only the minimum context required:

```yaml
mission:
source_of_truth_order:
relevant_files:
usage_locations:
known_errors:
acceptance_criteria:
allowed_write_scope:
forbidden_scope:
required_checks:
previous_attempts:
```

The pack must not contain:

- the entire repository without need;
- private chats;
- credentials;
- production user data;
- stale reports without status labels.

# Orchestration state machine

```text
RECEIVED
-> VALIDATED
-> CONTEXT_READY
-> PLANNED
-> IMPLEMENTING
-> REVIEWING
-> FIX_REQUIRED | QA_READY
-> CHECKING
-> HUMAN_REVIEW
-> COMMIT_READY
-> DRAFT_PR_OPEN
-> ARCHIVED
```

Failure states:

```text
INVALID_MISSION
SCOPE_CONFLICT
MISSING_EVIDENCE
IMPLEMENTATION_FAILED
REVIEW_FAILED
CHECKS_RED
BUDGET_EXHAUSTED
HUMAN_REJECTED
```

Every state transition must be logged with:

- mission ID;
- actor;
- timestamp;
- input artifact;
- output artifact;
- result;
- error code;
- retry count.

# Phase 0 — Repository reconciliation

## Goal

Ensure Codex starts from the real current repository state.

## Build

- read `DOCS_INDEX.md`;
- read `README.md`;
- read current `ROADMAP.md` and `BACKLOG.md`;
- read role charters;
- detect open PRs touching the same files;
- detect dirty branch or stale base;
- reject ambiguous repository state.

## Acceptance

- source branch and target branch are explicit;
- file scope is explicit;
- conflicting open PRs are reported;
- no patch begins before usage inspection.

# Phase 1 — Deterministic mission intake

## Goal

Create a reliable `DEV-00 Mission Intake` workflow in n8n.

## Build

- authenticated webhook/manual trigger;
- JSON Schema validation;
- mission ID and hash;
- duplicate handling;
- same ID + changed payload conflict;
- budget defaults;
- forbidden-action injection;
- durable state in n8n Data Table;
- inactive export committed to Git.

## Acceptance matrix

| Case | Expected |
|---|---|
| Valid new mission | accepted |
| Exact duplicate | skipped |
| Same ID, changed payload | conflict |
| Missing objective | rejected |
| Missing allowed file scope | rejected |
| Forbidden security change | owner approval required |

# Phase 2 — Context Builder

## Goal

Generate a bounded evidence pack before Codex sees the task.

## Build

- fetch named GitHub files;
- search usage references;
- fetch related issue/PR;
- include exact red error block when present;
- include source-of-truth rules;
- cap file count and context size;
- classify missing evidence.

## Acceptance

- Codex receives only relevant files;
- usage inspection is included;
- stale/deprecated docs are labeled;
- missing evidence stops execution.

# Phase 3 — Planner

## Goal

Produce one minimal implementation plan.

## Output

```yaml
files_to_read:
files_to_change:
files_to_add:
implementation_steps:
tests_to_add_or_update:
commands_to_run:
rollback:
risks:
```

## Rules

- maximum one active patch plan;
- no architecture rewrite;
- no opportunistic refactor;
- no dependency addition unless required;
- any sensitive file activates Security Reviewer.

## Acceptance

The plan is rejected if it touches files outside the mission scope or lacks acceptance criteria.

# Phase 4 — Codex Implementer

## Goal

Apply the smallest correct patch.

## Build

- isolated branch;
- explicit file allowlist;
- inspect-before-edit guard;
- patch-size threshold;
- `.cjs` patch script path for large edits;
- test update requirement;
- no automatic commit.

## Acceptance

- diff matches the plan;
- unrelated changes are zero;
- no forbidden files touched;
- tests cover the behavior change;
- patch is reversible.

# Phase 5 — Independent review loop

## Goal

Prevent self-approval by the implementing model.

## Review order

1. static diff review;
2. architecture and scope review;
3. targeted bug-risk review;
4. security review when triggered;
5. one bounded fix pass.

## Limits

- maximum one reviewer correction cycle by default;
- second cycle requires human approval;
- reviewer cannot silently widen scope;
- unresolved critical finding stops the mission.

## Acceptance

All critical and high findings are resolved or explicitly accepted by the human owner.

# Phase 6 — QA and checks

## Goal

Make green status evidence-based.

## Required commands

```text
pnpm run lint
pnpm run build
pnpm run test
```

Add `pnpm run typecheck` when available or relevant.

## Rules

- capture exact command, exit status, and first red block;
- do not retry blindly;
- one targeted repair pass per failing command;
- manual smoke tests remain human-executed when Telegram or production clients are required.

## Acceptance

- all required checks pass;
- no skipped check is presented as green;
- manual blocker is documented precisely.

# Phase 7 — Human approval gate

## Goal

Keep the owner in control of repository writes and risk.

## Human review packet

- mission summary;
- files changed;
- diff summary;
- reviewer findings;
- check results;
- risks;
- rollback;
- proposed commit message;
- proposed PR title/body.

## Approval outcomes

```text
APPROVE_COMMIT
REQUEST_FIX
REJECT
DEFER
```

No timeout may be interpreted as approval.

# Phase 8 — Publish

## Goal

Create a traceable Draft PR.

## Build

- commit only intended files;
- push non-protected branch;
- open Draft PR;
- include mission ID and related issue;
- include checks and manual gaps;
- never enable auto-merge.

## Acceptance

- branch name is intentional;
- commit is scoped;
- Draft PR contains evidence;
- no merge or deploy occurs.

# Phase 9 — Durable archival

## Goal

Preserve useful knowledge and discard temporary reasoning.

## Create

```text
docs/reports/YYYY-MM-DD-ai-development-mission-<id>.md
```

## Report sections

- Task;
- Files inspected;
- Findings;
- Changes made;
- Review findings;
- Checks;
- Risks;
- Next step.

## Acceptance

- report is `source_of_truth: false`;
- canonical docs are updated only when explicitly approved;
- chat history is not required to continue the work.

# Phase 10 — Controlled parallelism

## Goal

Allow multiple AI developers only after the serial pipeline is reliable.

## Allowed parallel work

- read-only repository research;
- independent review;
- test planning;
- documentation conflict scan.

## Forbidden parallel work

- two implementers editing overlapping files;
- multiple branches for the same mission;
- parallel migrations;
- simultaneous auth/RLS changes;
- parallel auto-fix loops.

## Lock key

```text
repository + base_branch + file_scope
```

A conflicting lock must queue or reject the mission.

# Phase 11 — Metrics and optimization

## Track

- mission completion rate;
- red-check rate;
- review rejection rate;
- rollback rate;
- average model calls;
- average cost;
- context size;
- unrelated-diff rate;
- human correction rate;
- time from mission to Draft PR.

## Success criteria

The orchestrator is useful only if it reduces human coordination effort without increasing regression, security, or review risk.

# Recommended first implementation sequence for Codex

## Sprint A — Contracts

1. Add schemas for Mission, Context Pack, Plan, Review Result, QA Result, and Final Result.
2. Add fixtures for valid, duplicate, conflict, invalid, and sensitive missions.
3. Add a deterministic validator script.

## Sprint B — n8n skeleton

1. Build `DEV-00 Mission Intake`.
2. Build `DEV-01 Context Builder`.
3. Build `DEV-02 Human Approval Stub`.
4. Keep all workflows inactive and credential-free in Git.

## Sprint C — Codex adapter

1. Generate a Codex task package from the Context Pack.
2. Restrict allowed files and commands.
3. Capture patch and check outputs.
4. Return a structured result to n8n.

## Sprint D — Review and QA

1. Add independent review call.
2. Add one fix loop.
3. Add lint/build/test executor.
4. Stop on red.

## Sprint E — GitHub publishing

1. Add branch and commit preparation.
2. Require human approval.
3. Push and create Draft PR.
4. Write the mission report.

# First Codex task

Implement only **Sprint A — Contracts**.

Do not build OpenRouter, multi-agent routing, autonomous commits, or production workflows yet.

## Required files

```text
n8n/schemas/developer-mission.schema.json
n8n/schemas/context-pack.schema.json
n8n/schemas/implementation-plan.schema.json
n8n/schemas/review-result.schema.json
n8n/schemas/qa-result.schema.json
n8n/schemas/developer-result.schema.json
scripts/validate-ai-dev-contracts.cjs
scripts/fixtures/ai-dev-contracts/*
docs/automation/AI_DEVELOPER_ORCHESTRATION.md
```

## Required checks

```text
node scripts/validate-ai-dev-contracts.cjs
pnpm run lint
pnpm run build
pnpm run test
```

## Acceptance

- all schemas parse;
- valid fixtures pass;
- invalid fixtures fail for the expected reason;
- sensitive missions require human approval;
- no application code changes;
- no credentials;
- no workflow activation;
- no commit unless all checks pass.
