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

Define the smallest safe path for orchestrating AI developers around GO IRL 1.0 with n8n, GitHub, Codex, deterministic gates, independent review, explicit human approval, and durable repository reports.

Canonical priority remains in `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, and `BACKLOG.md`.

## Final workflow

```text
Mission Proposal
-> Mission Validation
-> Mission Approval
-> Context Pack
-> Planner
-> Codex Implementer
-> Independent Reviewer
-> One Correction Pass
-> QA Gate
-> Change Approval
-> Agent Report
-> Commit Selected Files
-> Push agent/*
-> Draft PR
```

## Approval model

### Mission Approval

Permission to begin work on one bounded mission.

It approves:

- objective;
- risk level;
- allowed paths;
- forbidden paths;
- acceptance criteria;
- budget;
- required checks.

It does not authorize commit, push, PR creation, merge, deployment, or sensitive changes.

### Change Approval

Permission to preserve the reviewed implementation after the diff, reviewer result, Agent Report, and all required quality gates are available.

It may authorize only:

- committing selected files;
- pushing an `agent/*` branch;
- opening a Draft PR.

It never authorizes merge or deployment.

## Non-negotiable rules

1. One active mission at a time.
2. GitHub remains source of truth.
3. Codex works only in an isolated branch or worktree.
4. Exact allowed and forbidden file scopes are required.
5. Inspect usage before editing.
6. Use `pnpm` only.
7. No dependency addition without approval.
8. No architecture rewrite.
9. Reviewer must be independent from implementer.
10. Maximum one correction pass.
11. No self-approval.
12. No partial-green status.
13. Agent Report is generated before commit and included in the same checked commit.
14. No commit or push before Change Approval.
15. No autonomous merge or deployment.
16. No `.env`, secrets, Auth, Supabase RLS, SQL, migrations, deployment, or production-data changes without explicit separate approval.
17. Issue #38 remains above optional AI infrastructure work.

## Required quality gate

Run in this order and stop on the first failure:

```text
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test
git diff --check
```

The system must return the exact complete first red error block. No commit, push, or Draft PR is allowed while any gate is red.

## Core contracts

### Mission

Required fields:

```text
schema_version
mission_id
objective
risk_level
allowed_paths
forbidden_paths
acceptance_criteria
maximum_budget_usd
requires_human_approval
source_of_truth_refs
expires_at
```

Required controls:

- explicit schema versioning;
- idempotency key;
- expiration;
- path traversal rejection;
- sensitive-scope rejection;
- additional properties rejected where safe;
- approved command allowlist;
- no overlap between allowed and forbidden paths.

### Context Pack

Required fields:

```text
schema_version
mission_id
source_of_truth_refs
context_manifest
constraints
acceptance_criteria
red_error_block
previous_attempt
maximum_serialized_bytes
```

Each context-manifest entry contains:

```text
path
hash
reason
excerpt_or_summary
```

Required controls:

- allowlisted files only;
- grep-based evidence preferred;
- bounded serialized size;
- secret redaction;
- no `.env` content;
- no full-repository dump;
- every claim linked to evidence.

### Agent Result

Required fields:

```text
schema_version
mission_id
role
status
summary
evidence
changed_files
risks
next_action
```

Rules:

- role is `planner`, `implementer`, `reviewer`, `qa`, or `archivist`;
- status is `pass`, `fail`, or `blocked`;
- `pass` requires evidence;
- `fail` or `blocked` requires a concrete reason;
- `changed_files` must remain inside Mission scope;
- `next_action` contains exactly one action.

# n8n workflow map

## DEV-00 Mission Intake

Responsibilities:

- schema validation;
- idempotency;
- duplicate detection;
- same ID with changed payload conflict;
- one active mission;
- expired mission rejection;
- forbidden-scope rejection;
- durable mission state;
- Mission Approval state.

States:

```text
proposed
validated
awaiting_mission_approval
approved
rejected
expired
conflict
```

## DEV-01 Context Builder

Responsibilities:

- canonical source-of-truth order;
- repository allowlist;
- issue and PR evidence;
- relevant grep output;
- path and hash manifest;
- size enforcement;
- redaction;
- validated Context Pack output.

## DEV-02 Planner

Produces one implementation plan with:

- exact objective;
- exact allowed paths;
- exact forbidden paths;
- acceptance criteria;
- dependency decision;
- implementation sequence;
- check plan;
- rollback plan.

## DEV-03 Codex Handoff

Requirements:

- isolated `agent/*` branch or worktree;
- read-only specification access;
- no writes outside approved paths;
- no dependency additions without approval;
- no commit or push;
- structured implementer result.

## DEV-04 Independent Review

Reviewer receives:

- Mission;
- Context Pack;
- implementation plan;
- complete diff;
- acceptance criteria;
- implementer result.

Reviewer returns:

```text
PASS
CHANGES_REQUIRED
BLOCKED
```

Only one bounded correction pass is allowed.

## DEV-05 QA Gate

Runs:

```text
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test
git diff --check
```

Returns only:

- `GREEN` with all command results; or
- exact first red error block.

## DEV-06 Change Approval

Owner receives:

- objective;
- changed files;
- diff summary;
- reviewer result;
- correction-pass count;
- quality-gate results;
- risks;
- proposed commit message;
- generated Agent Report.

Owner may approve, reject, or request a manual change. Automated work stops until explicit approval.

## DEV-07 Agent Report

Before commit, create:

```text
docs/reports/YYYY-MM-DD-agent-report.md
```

Required sections:

- Task;
- Files inspected;
- Findings;
- Changes made;
- Checks;
- Next step.

The report is non-authoritative and included in the same final quality gate and commit.

## DEV-08 Publish

Only after Change Approval:

1. commit selected files only;
2. push only `agent/*`;
3. create Draft PR;
4. attach acceptance evidence and check results;
5. do not merge or deploy.

# Implementation roadmap

## Phase 0 — Contracts

Deliver:

- Mission schema;
- Context Pack schema;
- Agent Result schema;
- explicit schema versioning;
- validators;
- valid and invalid fixtures;
- contract tests;
- non-authoritative Agent Report.

Read-only specification:

```text
docs/proposals/AI_DEVELOPER_ORCHESTRATION_ROADMAP.md
```

Codex must stop with `BLOCKED: specification file not found` when this file is unavailable.

Exit gate:

- all valid fixtures pass;
- all invalid fixtures fail for the expected reason;
- all quality gates are green;
- no commit or push occurs;
- Codex returns diff summary and proposed commit message for Change Approval.

## Phase 1 — DEV-00 Mission Intake

Deliver:

- idempotency;
- duplicate detection;
- mission conflict;
- one active mission;
- forbidden-scope rejection;
- expired mission rejection;
- durable mission state;
- Mission Approval state.

Exit gate: deterministic acceptance matrix passes in a real inactive n8n test workflow.

## Phase 2 — Context Builder

Deliver:

- source-of-truth ordering;
- allowlisted repository reads;
- grep-based evidence;
- secret redaction;
- size limit;
- context manifest with paths and hashes.

Exit gate: a sample mission produces a bounded, evidence-backed Context Pack.

## Phase 3 — Planner and Codex Handoff

Deliver:

- strict planner schema;
- exact file scope;
- acceptance criteria;
- isolated branch/worktree contract;
- no-write-outside-scope enforcement;
- dependency approval gate;
- Codex adapter.

Exit gate: one docs-only mission completes without commit or push.

## Phase 4 — Review and QA

Deliver:

- independent reviewer workflow;
- severity model;
- maximum one correction pass;
- no self-approval;
- exact first red error capture;
- full quality gate.

Exit gate: broken fixture is rejected; clean fixture reaches Change Approval.

## Phase 5 — Approval and Draft PR

Deliver:

- Change Approval state;
- Agent Report before commit;
- explicit selected-file commit;
- `agent/*` push restriction;
- Draft PR creation;
- attached checks and acceptance evidence.

Exit gate: one low-risk docs mission creates a Draft PR only after explicit approval.

## Phase 6 — Real Pilot

Use one low-risk bug only.

Forbidden:

- Auth;
- RLS;
- SQL;
- migrations;
- secrets;
- deployment;
- production data;
- architecture changes.

Exit gate:

- minimal diff;
- reviewer pass;
- maximum one correction pass;
- all gates green;
- explicit Change Approval;
- Agent Report included;
- human-approved Draft PR.

## Phase 7 — Specialists

Add roles sequentially and only when evidence shows need:

1. QA Lead;
2. UI/UX Reviewer;
3. Technical Archivist;
4. read-only Security Reviewer;
5. read-only Supabase Reviewer.

Do not activate all roles by default.

# Full state machine

```text
proposed
-> validated
-> awaiting_mission_approval
-> approved
-> context_ready
-> planned
-> implementing
-> reviewing
-> correcting
-> qa_gate
-> awaiting_change_approval
-> report_ready
-> committed
-> pushed
-> draft_pr
-> archived
```

Failure states:

```text
rejected
expired
conflict
blocked
scope_violation
checks_failed
budget_exceeded
cancelled
```

# Stop conditions

Stop rollout when:

- orchestration delays Issue #38 or beta stabilization;
- Context Packs omit required evidence;
- an agent touches forbidden scope;
- a reviewer is not independent;
- more than one correction pass is required;
- quality gates cannot run reproducibly;
- approval boundaries are bypassed;
- orchestration costs more effort than direct Codex work.

# First Codex task

Implement Phase 0 only, using this file as a read-only specification.

Allowed write scope:

```text
scripts/ai-orchestrator/**
tests covering scripts/ai-orchestrator/**
docs/reports/2026-07-11-ai-developer-orchestrator-phase-0.md
```

Do not modify the proposal specification, application code, dependencies, canonical roadmap files, security-sensitive areas, or deployment configuration.

Do not commit, push, create a branch, or open a PR.

Return the diff summary, full green quality-gate result, and proposed commit message. Wait for explicit Change Approval.
