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

Define the smallest safe path for orchestrating AI developers around GO IRL 1.0 using n8n, GitHub, Codex, deterministic contracts, independent review, explicit human approvals, and durable reports.

This proposal does not override `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, `BACKLOG.md`, or current security constraints. Issue #38 remains above optional AI infrastructure.

## Required flow

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

Human permission to begin work on a validated mission.

Required before context collection, planning, implementation, or execution budget consumption.

### Change Approval

Human permission to preserve and publish the reviewed result.

Required before commit, push, or Draft PR creation.

Mission Approval never implies Change Approval.

## Non-negotiable rules

1. One mission at a time.
2. GitHub remains source of truth.
3. Codex works only in an isolated `agent/*` branch or worktree.
4. Exact allowed and forbidden paths are required.
5. The proposal specification is read-only during implementation.
6. Reviewer and implementer must be independent executions.
7. Maximum one correction pass.
8. No self-approval.
9. No partial-green status.
10. Agent Report is generated before commit and included in the checked diff.
11. No automatic commit, push, PR, merge, or deploy.
12. No `.env`, secrets, Auth, Supabase RLS, SQL, migrations, deployment, or production-data changes without explicit owner approval.
13. No dependency addition without explicit approval.
14. No architecture rewrite.
15. Issue #38 remains the current higher product priority.

## Quality gate

Run in this order and stop on the first red command:

```text
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test
git diff --check
```

A green result requires all five commands to pass.

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
```

### Context Pack

Must include schema version, mission reference, source-of-truth references, relevant file manifest, file paths and hashes, grep-based evidence, constraints, acceptance criteria, bounded size metadata, and secret-redaction result.

Must not include full-repository dumps, `.env` content, secrets, unrelated chat history, or speculative future architecture.

### Agent Result

Must include schema version, mission ID, role, status, evidence, changed files, risks, validation errors when applicable, and exactly one next action.

## Roles

### Technical Archivist

Owns source-of-truth continuity, context boundaries, conflict detection, durable reports, and archival quality. Does not coordinate execution, implement code, approve sensitive changes, or merge.

### Planner

Produces one bounded implementation plan with exact file scope, acceptance criteria, risks, rollback, and checks.

### Codex Implementer

Inspects usage, applies the smallest patch inside approved scope, and returns the diff without committing.

### Independent Reviewer

Receives mission contracts, acceptance criteria, and diff. Returns `PASS`, `CHANGES_REQUIRED`, or `BLOCKED` with concrete file evidence.

### QA Gatekeeper

Runs the required quality gate and returns `GREEN` or the exact first complete red error block.

### Human Owner

Approves the mission and separately approves the final change before commit and push.

# Implementation phases

## Phase 0 — Contracts

Create Mission, Context Pack, and Agent Result schemas; schema versioning; valid and invalid fixtures; deterministic validators; contract tests; and structured validation errors.

Exit gate: contracts validate all required fixtures, quality gate is green, and no commit or push occurs without Change Approval.

## Phase 1 — DEV-00 Mission Intake

Implement idempotency, exact duplicate detection, changed-payload mission conflict, one active mission, forbidden-scope rejection, expired mission rejection, durable mission state, and Mission Approval state.

Exit gate: deterministic acceptance matrix passes in an inactive n8n workflow.

## Phase 2 — Context Builder

Implement canonical source-of-truth order, allowlisted files, grep-based evidence, context size limit, secret redaction, no full-repository dumps, and a context manifest with paths and hashes.

Exit gate: one approved mission produces a bounded evidence-backed Context Pack.

## Phase 3 — Planner and Codex Handoff

Implement exact write scope, acceptance criteria, implementation plan, isolated branch or worktree, no writes outside allowed paths, no dependency addition without approval, no architecture rewrite, and read-only proposal specification.

Exit gate: one docs-only dry run completes without commit, push, or PR.

## Phase 4 — Review and QA

Implement reviewer access to diff, contracts, and acceptance criteria; reviewer independence; maximum one correction pass; exact first red error; no self-approval; no partial-green status; and the full quality gate.

Exit gate: broken fixtures fail and valid fixtures pass.

## Phase 5 — Approval and Draft PR

1. Owner reviews diff and quality-gate evidence.
2. Owner grants Change Approval.
3. Generate durable Agent Report.
4. Rerun the quality gate including the report.
5. Commit selected files only.
6. Push only `agent/*`.
7. Create Draft PR.
8. Attach checks and acceptance evidence.
9. Never merge or deploy automatically.

Exit gate: one approved low-risk docs mission creates a Draft PR with the report in the same checked commit.

## Phase 6 — Real Pilot

Use one low-risk bug only.

Forbidden: Auth, RLS, SQL, migrations, secrets, deployment, production data, and architecture changes.

Exit gate: minimal patch, independent review pass, full green quality gate, explicit Change Approval, Draft PR, and durable report.

## Phase 7 — Specialists

Add sequentially only when evidence shows need:

1. QA Lead;
2. UI/UX Reviewer;
3. Technical Archivist;
4. read-only Security Reviewer;
5. read-only Supabase Reviewer.

Do not activate all roles by default.

## Mission states

```text
proposed
-> validated
-> awaiting_mission_approval
-> approved
-> context_ready
-> planned
-> implementing
-> reviewing
-> correction_requested
-> checking
-> awaiting_change_approval
-> report_ready
-> committed
-> pushed
-> draft_pr
-> archived
```

Failure states:

```text
blocked
rejected
expired
scope_violation
checks_failed
budget_exceeded
cancelled
```

## First Codex task

Implement Phase 0 only.

Read this file as a read-only specification. If it does not exist, stop with:

```text
BLOCKED: specification file not found.
```

Allowed write scope:

- `scripts/ai-orchestrator/**`;
- tests covering `scripts/ai-orchestrator/**`;
- `docs/reports/2026-07-11-ai-developer-orchestrator-phase-0.md`.

Do not modify the proposal, application code, package metadata, dependencies, secrets, Auth, RLS, SQL, migrations, deployment, canonical docs, or product architecture.

Do not commit, push, create a branch, or open a PR. Return the diff summary, contract matrix, green checks, and proposed commit message. Wait for explicit Change Approval.

## Stop conditions

Stop the rollout when orchestration costs more effort than direct Codex work, Context Packs miss required evidence, any agent touches forbidden scope, reviewer independence is lost, failures cannot be reproduced, automation delays beta work, or Issue #38 is displaced by optional AI infrastructure.
