---
title: Engineering Governance Framework v1
owner: Technical Archivist
status: Proposal
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Engineering Governance Framework v1

## Purpose

Consolidate the approved architecture direction for deterministic AI-assisted engineering in GO IRL without replacing canonical product documentation.

This document does not override `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, `BACKLOG.md`, or current security constraints.

## Governance hierarchy

```text
PURPOSE
-> VISION
-> PRINCIPLES
-> ENGINEERING GOVERNANCE
-> ENGINEERING OS
-> PROTOCOLS / POLICIES / EVENTS
-> GITHUB / N8N / CODEX / AI
-> GO IRL
```

Engineering Governance defines authority, evidence, policy, approval, and quality. Engineering OS only executes those rules.

## Core principles

1. Human authority remains final.
2. GitHub is source of truth.
3. One mission at a time.
4. Contracts before implementation.
5. Bounded evidence-backed context.
6. Independent implementer and reviewer.
7. Separate Mission Approval and Change Approval.
8. No autonomous commit, merge, deploy, or production write.
9. Full quality gate for every code change.
10. Durable knowledge belongs in the repository.
11. Providers are replaceable; governance is stable.
12. New architecture requires implementation evidence.

## Mission flow

```text
Mission Proposal
-> Mission Validation
-> Mission Approval
-> Context Pack
-> Planner
-> Implementer
-> Independent Reviewer
-> Maximum One Correction Pass
-> QA Gate
-> Change Approval
-> Agent Report
-> Commit Selected Files
-> Push agent/*
-> Draft PR
-> Human Merge Decision
```

Mission Approval allows work to begin. Change Approval allows commit, push, and Draft PR. Neither implies merge or deploy.

## Minimal EOS responsibilities

| Service | Responsibility |
|---|---|
| Mission Service | Lifecycle, idempotency, expiration, active mission state |
| Context Service | Evidence collection, manifests, hashes, size limits, redaction |
| Policy Service | Deterministic scope, risk, budget, and action checks |
| Approval Service | Mission Approval and Change Approval |
| Event Service | Typed lifecycle events and append-only history |
| Knowledge Service | Reports, ADR candidates, lessons learned |
| Metrics Service | Duration, retries, cost, gates, failures |
| Registry Service | Capabilities and providers |

These are logical responsibilities, not permission for an architecture rewrite.

## Capability model

Initial capabilities:

- `plan_change`
- `implement_code`
- `review_code`
- `run_quality_gate`
- `archive_report`
- `request_human_approval`

Initial provider classes:

- `RepositoryProvider`
- `ImplementationProvider`
- `ReviewProvider`
- `QualityGateProvider`
- `NotificationProvider`
- `HumanApprovalProvider`

Phase 1 uses a static allowlisted registry only. No marketplace, bidding, or autonomous provider selection.

## Contract baseline

Phase 0 defines:

- Mission;
- Context Pack;
- Agent Result.

Required guarantees:

- explicit `schema_version`;
- no unknown fields where safe;
- no path traversal;
- sensitive paths denied;
- bounded context metadata;
- structured validation errors;
- one scalar next action;
- evidence for successful results.

Implementation currently lives in Draft PR #53.

## Policy baseline

Initial deterministic checks:

- allowed and forbidden paths;
- sensitive-scope denial;
- mission expiration;
- exact duplicate and mission conflict;
- one active mission;
- budget ceiling;
- approval state;
- one correction pass;
- complete-green gate.

Sensitive scope includes:

- `.env`;
- secrets and credentials;
- Auth;
- Supabase RLS;
- SQL and migrations;
- deployment and Vercel;
- production data.

## Event baseline

```text
MissionProposed
MissionValidated
MissionApproved
ContextReady
PlanReady
ImplementationFinished
ReviewPassed
ChangesRequested
QAPassed
QAFailed
ChangeApproved
ReportReady
CommitCreated
DraftPRCreated
MissionBlocked
MissionArchived
```

Events carry references and identifiers, not unrestricted context dumps.

## n8n role

n8n may validate, route, persist mission state, enforce idempotency, trigger bounded providers, wait for approvals, record metrics, and notify the owner.

n8n may not approve its own work, modify protected product areas, commit, merge, deploy, edit canonical roadmap documents, or close Knowledge Debt automatically.

## Quality gate

Run in this order and stop on the first red result:

```text
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test
git diff --check
```

Partial-green status is forbidden.

## Implementation roadmap

### Phase 0 — Contracts

Status: Draft PR #53, pending one correction pass and final review.

### Phase 1 — Mission Intake

- inactive n8n workflow;
- schema validation;
- mission expiration;
- exact duplicate handling;
- changed-payload conflict;
- one active mission;
- durable state;
- Mission Approval state;
- deterministic acceptance matrix.

No LLM or repository write.

### Phase 2 — Context Builder

- canonical source order;
- allowlisted paths;
- grep evidence;
- file hashes;
- context limits;
- secret redaction;
- validated Context Pack.

### Phase 3 — Planner and implementation handoff

- one bounded plan;
- exact write scope;
- isolated `agent/*` branch or worktree;
- one ImplementationProvider;
- no commit or push.

### Phase 4 — Review and QA

- independent reviewer;
- maximum one correction pass;
- full quality gate;
- exact first red error block.

### Phase 5 — Change Approval and Draft PR

- reviewed diff;
- explicit Change Approval;
- Agent Report before commit;
- selected-file commit;
- push to `agent/*`;
- Draft PR with evidence;
- no merge or deploy.

### Phase 6 — GO IRL pilot

One low-risk bug only. No Auth, RLS, SQL, migrations, secrets, deployment, production data, or architecture changes.

### Phase 7 — Controlled specialization

Add only when evidence shows need:

1. QA specialist;
2. UI/UX reviewer;
3. Technical Archivist;
4. read-only Security reviewer;
5. read-only Supabase reviewer.

## Success metrics

- mission completion rate;
- first-pass review rate;
- quality-gate failure rate;
- scope violations;
- correction passes;
- average context size;
- time from Mission Approval to Change Approval;
- cost per mission;
- human rejection rate;
- autonomous merges: always zero.

## Stop conditions

Stop or simplify when:

- orchestration costs more effort than direct Codex work;
- Context Packs omit required evidence;
- a provider touches forbidden scope;
- reviewer independence becomes ceremonial;
- failures cannot be reproduced;
- beta work is delayed;
- implementation requires a broad architecture rewrite;
- generated knowledge competes with canonical documentation.

## Stabilization rule

No new foundational architecture document may be added until one of these occurs:

1. the current specification is implemented and tested;
2. a GO IRL pilot exposes a concrete gap;
3. a security or reliability defect requires an ADR;
4. a contract must be versioned for compatibility.

## Current next task

Complete the single correction pass for Draft PR #53:

- deny all sensitive mission paths;
- add CLI validators for Mission, Context Pack, and Agent Result;
- add focused tests;
- update the Agent Report;
- rerun the five-command quality gate;
- keep the PR in Draft;
- do not merge.
