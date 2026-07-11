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

Define the smallest safe implementation path for orchestrating AI developers around GO IRL 1.0 with n8n, GitHub, Codex, deterministic gates, specialist review, and human approval.

This is a proposal for Codex implementation. Canonical priority remains in `ROADMAP.md`, `BACKLOG.md`, and `DOCS_INDEX.md`.

## Target flow

```text
Approved Mission
-> Validate
-> Build Context Pack
-> Plan
-> Implement
-> Review
-> Run Checks
-> Human Approval
-> Commit / Draft PR
-> Archive Report
```

## Non-negotiable rules

1. One mission at a time.
2. GitHub is source of truth.
3. Codex changes only approved files on an approved branch.
4. Inspect usage before editing files.
5. Use `pnpm` only.
6. Run `pnpm run lint`, `pnpm run build`, and `pnpm run test` after code changes.
7. No commit when checks are red.
8. No autonomous merge or deploy.
9. No `.env`, secrets, auth, Supabase RLS, destructive SQL, or migrations without explicit approval.
10. Large changes use a bounded `.cjs` patch script.
11. Durable output is saved under `docs/reports/`.
12. Every mission ends with exactly one next task.

# Roles

## Technical Archivist

Owns source-of-truth checks, context selection, documentation continuity, conflict detection, and the final archival report.

Does not coordinate daily execution, approve security-sensitive work, or merge code.

## Mission Planner

Produces:

- exact goal;
- allowed file scope;
- forbidden scope;
- acceptance criteria;
- dependency map;
- check plan;
- rollback plan.

## Codex Implementer

Owns the minimal patch only.

Must:

- inspect before editing;
- stay inside allowed scope;
- avoid architecture rewrites;
- stop on missing evidence;
- return changed files and rationale.

## Independent Reviewer

Checks:

- correctness;
- scope drift;
- unnecessary complexity;
- security boundary violations;
- regression risk;
- missing tests.

The reviewer must not be the same execution as the implementer.

## QA Gatekeeper

Runs or verifies:

```text
pnpm run lint
pnpm run build
pnpm run test
```

Returns only `GREEN` or the exact first red error block.

## Human Owner

Approves mission, sensitive scope, commit, PR readiness, merge, and deployment.

# Core artifacts

## Mission

```yaml
mission_id: DEV-YYYYMMDD-NNN
title: string
goal: string
source_issue: optional GitHub issue
priority: P0|P1|P2|P3
allowed_paths: []
forbidden_paths: []
acceptance: []
checks:
  - pnpm run lint
  - pnpm run build
  - pnpm run test
requires_human_approval: true
```

## Context Pack

Contains only:

- mission;
- source-of-truth excerpts;
- relevant files and grep output;
- current red error block;
- constraints;
- acceptance criteria;
- previous attempt summary when relevant.

It must not contain full-repository dumps, secrets, unrelated history, or speculative future architecture.

## Agent result

```yaml
mission_id: string
role: planner|implementer|reviewer|qa|archivist
status: pass|fail|blocked
summary: string
evidence: []
changed_files: []
risks: []
next_action: string
```

# n8n workflow map

## DEV-00 Mission Intake

Trigger: manual webhook, Telegram owner command, or approved GitHub label.

Steps:

1. validate schema;
2. reject duplicate `mission_id` with changed payload;
3. enforce one active mission;
4. store mission state;
5. request human approval if missing.

Acceptance:

- new valid mission accepted;
- exact duplicate skipped;
- same ID with changed payload rejected;
- forbidden scope rejected.

## DEV-01 Context Builder

Steps:

1. read canonical docs in source-of-truth order;
2. fetch issue or PR context;
3. collect only relevant files or grep output;
4. redact secrets and private data;
5. produce bounded Context Pack.

Acceptance:

- pack remains under configured size;
- all claims point to repository evidence;
- no secret or `.env` content appears.

## DEV-02 Planner

Steps:

1. classify task as docs, code, QA, CI, or blocked;
2. define exact file scope;
3. generate acceptance criteria;
4. identify sensitive boundaries;
5. output one implementation task.

Acceptance:

- one task only;
- no vague "improve" instructions;
- no unauthorized architecture change.

## DEV-03 Codex Implementer

Recommended first implementation: Codex receives a GitHub issue plus Context Pack and works on an existing `agent/*` branch.

Steps:

1. inspect repo status and target usage;
2. create minimal patch;
3. report changed files;
4. do not commit yet;
5. hand off to reviewer.

Acceptance:

- patch remains inside allowed paths;
- no forbidden file touched;
- no unrequested dependency added;
- diff is minimal and reversible.

## DEV-04 Independent Review

Steps:

1. inspect diff against mission;
2. flag blockers by severity;
3. reject scope drift;
4. request one bounded correction pass maximum.

Acceptance:

- reviewer returns `PASS`, `CHANGES_REQUIRED`, or `BLOCKED`;
- each objection cites a file and concrete reason;
- no new feature scope is introduced.

## DEV-05 QA Gate

Steps:

1. run lint;
2. run build;
3. run tests;
4. stop on first red command;
5. store exact error block.

Acceptance:

- all three commands pass;
- otherwise no commit or PR readiness claim.

## DEV-06 Human Approval

Owner receives:

- mission;
- changed files;
- reviewer result;
- check results;
- known risks;
- proposed commit message.

Actions:

- approve commit;
- request correction;
- reject mission.

## DEV-07 Publish

After approval:

1. commit only mission files;
2. push `agent/*` branch;
3. create Draft PR;
4. attach evidence and checks;
5. never merge automatically.

## DEV-08 Archive

Create:

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

# Mission state machine

```text
received
-> validated
-> approved
-> context_ready
-> planned
-> implementing
-> reviewing
-> checking
-> awaiting_human
-> committed
-> draft_pr
-> archived
```

Failure states:

```text
blocked
rejected
checks_failed
scope_violation
budget_exceeded
cancelled
```

# Implementation roadmap for Codex

## Phase 0 — Repository contract

Codex tasks:

1. add schemas for Mission, Context Pack, and Agent Result;
2. add example fixtures;
3. add validation script;
4. add tests for valid, duplicate, conflict, and forbidden missions.

Deliverables:

```text
scripts/ai-orchestrator/validate-mission.cjs
scripts/ai-orchestrator/schemas/mission.schema.json
scripts/ai-orchestrator/schemas/context-pack.schema.json
scripts/ai-orchestrator/schemas/agent-result.schema.json
scripts/ai-orchestrator/fixtures/
```

Exit gate: validation tests pass locally.

## Phase 1 — DEV-00 Mission Intake

Codex tasks:

1. create inactive n8n workflow JSON;
2. validate incoming mission;
3. implement idempotency state;
4. reject mission ID conflicts;
5. enforce one active mission;
6. add manual acceptance guide.

Exit gate: deterministic acceptance matrix passes in a real n8n test instance.

## Phase 2 — Context Builder

Codex tasks:

1. create allowlisted repository fetch step;
2. implement source-of-truth document order;
3. enforce pack size limit;
4. add redaction checks;
5. output one validated Context Pack.

Exit gate: sample mission produces a bounded evidence-backed pack.

## Phase 3 — Planner and Codex handoff

Codex tasks:

1. define planner prompt and strict output schema;
2. create role-selection rules;
3. implement Codex job handoff adapter;
4. save implementer result;
5. block work outside approved paths.

Exit gate: one docs-only mission completes without repository write.

## Phase 4 — Review and QA

Codex tasks:

1. add independent review workflow;
2. add severity model;
3. allow one correction pass;
4. execute lint/build/test gate;
5. store exact red error output.

Exit gate: intentionally broken fixture is rejected; clean fixture passes.

## Phase 5 — Approval and Draft PR

Codex tasks:

1. add owner approval state;
2. prepare commit summary;
3. commit explicit mission files only;
4. push `agent/*` branch;
5. create Draft PR;
6. attach checks and report.

Exit gate: one low-risk docs mission creates a Draft PR after approval.

## Phase 6 — Small code mission pilot

Use one real, low-risk bug with no auth, RLS, SQL, migration, secret, or architecture changes.

Exit gate:

- minimal patch;
- reviewer pass;
- lint/build/test green;
- human-approved Draft PR;
- archival report saved.

## Phase 7 — Controlled specialization

Add roles only when a real mission proves the need:

1. QA specialist;
2. UI/UX specialist;
3. Supabase reviewer in read-only mode;
4. security reviewer in read-only mode;
5. documentation archivist.

Maximum active roles per mission: planner, implementer, reviewer, QA, archivist.

# What not to build yet

- autonomous multi-agent swarm;
- agent-to-agent free chat;
- automatic merge;
- production deployment;
- self-modifying prompts;
- long-term vector memory as authority;
- automatic auth/RLS/SQL/migration changes;
- more than one implementation agent per mission;
- generic platform detached from GO IRL needs.

# Metrics

Track:

- mission completion rate;
- first-pass review rate;
- check failure rate;
- correction passes;
- scope violations;
- average Context Pack size;
- time from approval to Draft PR;
- human rejection rate;
- token and model cost;
- autonomous merges: always zero.

# Stop conditions

Stop the rollout when:

- orchestration costs more effort than direct Codex work;
- Context Packs routinely miss required evidence;
- agents touch forbidden scope;
- review becomes ceremonial;
- failures cannot be reproduced;
- beta product work is delayed;
- the system requires broader architecture changes.

# First Codex task

**Task:** Implement Phase 0 repository contracts only.

**Allowed scope:** `scripts/ai-orchestrator/**`, tests for those scripts, and one non-authoritative implementation report.

**Forbidden scope:** application code, `.env`, secrets, auth, Supabase RLS, SQL, migrations, deployment, `DOCS_INDEX.md`, `ROADMAP.md`, `BACKLOG.md`.

**Acceptance:** Mission, Context Pack, and Agent Result schemas validate valid fixtures and reject invalid fixtures; `pnpm run lint`, `pnpm run build`, and `pnpm run test` remain green.

**Stop condition:** stop on the first failing project check and return only the exact red error block.