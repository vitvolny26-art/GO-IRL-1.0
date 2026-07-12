---
title: Engineering Governance Framework v1
owner: Technical Archivist
status: Proposal
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Engineering Governance Framework v1

## Status and scope

This document consolidates the strongest reusable ideas from the Engineering OS architecture design into one bounded proposal for GO IRL.

It is not canonical product documentation and does not override `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, `BACKLOG.md`, security rules, or the closed-beta priority.

The framework is intentionally split into:

- **implemented now** — repository contracts in Phase 0;
- **next implementation** — deterministic mission intake and context assembly;
- **future hypotheses** — policy-as-code, provider negotiation, active archive, and risk accumulation.

No future hypothesis may be described as implemented until code, tests, and a real GO IRL pilot prove it.

# 1. Governance hierarchy

```text
PURPOSE
-> VISION
-> PRINCIPLES
-> ENGINEERING GOVERNANCE
-> ENGINEERING OPERATING SYSTEM
-> PROTOCOLS / POLICIES / EVENTS
-> GITHUB / N8N / CODEX / AI
-> GO IRL
```

Engineering Governance defines authority, boundaries, approval, evidence, and quality rules.

Engineering OS is only a deterministic execution mechanism for those rules. It is not the source of product authority.

# 2. Core principles

1. Human authority remains final.
2. GitHub remains source of truth.
3. One mission is active at a time.
4. Contracts precede implementation.
5. Context is bounded and evidence-backed.
6. Implementer and reviewer are independent executions.
7. Mission Approval and Change Approval are separate.
8. No autonomous commit, merge, deploy, or production write.
9. Every code change passes the full quality gate.
10. Durable knowledge is stored in the repository, not in chat memory.
11. Providers are replaceable; governance is stable.
12. New architecture requires evidence from implementation.

# 3. Required mission flow

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

## Approval boundaries

### Mission Approval

Allows the validated mission to consume time, context, and model budget.

### Change Approval

Allows the reviewed and fully green diff to be committed, pushed, and placed in a Draft PR.

Mission Approval never implies Change Approval. Change Approval never implies merge or deploy approval.

# 4. Minimal EOS services

The proposed microkernel contains eight bounded services.

| Service | Responsibility |
|---|---|
| Mission Service | Mission state, identity, expiration, idempotency, and lifecycle |
| Context Service | Bounded evidence collection, file manifest, hashes, redaction, and context limits |
| Policy Service | Deterministic scope, risk, budget, and action checks |
| Approval Service | Mission Approval and Change Approval state |
| Event Service | Typed lifecycle events and append-only execution history |
| Knowledge Service | Durable reports, ADR candidates, lessons learned, and retrieval metadata |
| Metrics Service | Duration, retries, cost, gate results, and failure rates |
| Registry Service | Capability and provider inventory |

These are logical responsibilities, not permission to introduce eight production services or perform an architecture rewrite.

# 5. Capability and provider model

The system routes work by required capability, not by a permanent agent identity.

## Capability

A bounded function with typed input, typed output, policy requirements, and acceptance criteria.

Initial capabilities:

- `plan_change`
- `implement_code`
- `review_code`
- `run_quality_gate`
- `archive_report`
- `request_human_approval`

## Provider

A replaceable implementation of a capability.

Initial provider classes:

- `RepositoryProvider`
- `ImplementationProvider`
- `ReviewProvider`
- `QualityGateProvider`
- `NotificationProvider`
- `HumanApprovalProvider`

GO IRL v1 must not implement a marketplace, scoring engine, or dynamic provider bidding. Phase 1 may use a static allowlisted registry only.

# 6. Mission package

A reproducible mission is represented by a bounded artifact set.

```text
mission/
  mission.json
  context-pack.json
  plan.json
  results/
  qa/
  report/
  metrics/
  events/
```

For the current repository, these artifacts may remain logical JSON/report outputs. A new runtime directory structure must not be added until a concrete Phase 1 implementation requires it.

# 7. Contract baseline

Phase 0 defines three versioned contracts:

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
- evidence required for successful results.

Phase 0 implementation lives in PR #53 and remains separate from this architecture proposal.

# 8. Policy model

Policy checks must remain deterministic.

Initial checks:

- allowed paths;
- forbidden paths;
- sensitive-scope denial;
- mission expiration;
- one active mission;
- budget ceiling;
- approval state;
- correction-pass limit;
- complete-green gate requirement.

Example policy intent:

```yaml
when:
  risk_level: high
require:
  - mission_approval
  - independent_review
  - qa_gate
  - change_approval
```

```yaml
when:
  touches:
    - auth
    - rls
    - sql
    - migrations
    - secrets
    - deployment
effect: block_without_explicit_owner_scope
```

OPA/Rego is a future option, not a Phase 1 requirement.

# 9. Event model

Initial typed events:

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

Events carry identifiers and references, not full private context dumps.

No free-form agent-to-agent chat is part of the protocol.

# 10. n8n role

n8n is the dispatcher, not the authority.

n8n may:

- validate and route missions;
- persist mission state;
- enforce idempotency;
- trigger bounded providers;
- wait for approvals;
- record events and metrics;
- notify the owner;
- stop on deterministic policy failure.

n8n may not independently:

- change application architecture;
- modify auth, RLS, SQL, migrations, secrets, or production data;
- approve its own work;
- commit, merge, or deploy without explicit human authorization;
- edit canonical roadmap or close Knowledge Debt automatically.

# 11. Active archive

The archive must first be a reliable repository history.

Phase 1 archive behavior:

- save Agent Report;
- link mission, issue, branch, commit, and PR;
- save gate results;
- record one next task;
- retain known risks.

Future behavior, only after evidence:

- ADR candidate extraction;
- reusable pattern extraction;
- semantic retrieval of similar missions;
- lessons-learned injection into Context Packs.

The archive must never auto-edit canonical documentation or treat generated summaries as source of truth.

# 12. Observability

Every mission should eventually record:

```text
mission_id
schema_version
status
current_phase
started_at
completed_at
duration_ms
provider_ids
retry_count
correction_passes
quality_gate_results
estimated_cost_usd
approval_events
changed_files
error_code
next_action
```

Never record secrets, raw `.env` content, private chats, raw Telegram `initData`, or unnecessary production payloads.

# 13. Recovery rules

- Validation failure: stop.
- Policy denial: stop.
- Context overflow: reduce context and require review.
- Provider timeout: one bounded retry or human escalation.
- Reviewer failure: stop; no self-review fallback.
- QA failure: return the first complete red block.
- Approval timeout: mission remains pending or expires.
- Commit/push failure: no automatic force push.
- Partial-green state: forbidden.

# 14. Implementation roadmap

## Phase 0 — Contracts

Status: implemented in Draft PR #53, pending correction and final review.

Deliverables:

- versioned schemas;
- fixtures;
- deterministic validators;
- contract tests;
- Agent Report.

## Phase 1 — Mission Intake

Deliver:

- inactive n8n workflow;
- mission schema validation;
- mission expiration;
- exact duplicate detection;
- changed-payload conflict;
- one active mission;
- durable mission state;
- Mission Approval state;
- deterministic acceptance matrix.

No LLM, repository write, or product integration.

## Phase 2 — Context Builder

Deliver:

- canonical source order;
- allowlisted paths;
- grep evidence;
- file hashes;
- size limits;
- secret redaction;
- validated Context Pack.

## Phase 3 — Planner and implementation handoff

Deliver:

- one bounded plan;
- exact write scope;
- isolated `agent/*` branch or worktree;
- one ImplementationProvider adapter;
- no commit or push.

## Phase 4 — Independent Review and QA

Deliver:

- separate reviewer execution;
- maximum one correction pass;
- full gate:
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run build`
  - `pnpm run test`
  - `git diff --check`

## Phase 5 — Change Approval and Draft PR

Deliver:

- reviewed diff summary;
- explicit Change Approval;
- Agent Report before commit;
- selected-file commit;
- push to `agent/*`;
- Draft PR with evidence;
- no merge or deploy.

## Phase 6 — Real GO IRL pilot

Use one low-risk code task only.

Forbidden scope:

- auth;
- RLS;
- SQL;
- migrations;
- secrets;
- deployment;
- production data;
- architecture rewrite.

## Phase 7 — Controlled providers

Add only after measured need:

- QA specialist;
- UI/UX reviewer;
- Technical Archivist;
- read-only Security reviewer;
- read-only Supabase reviewer.

Do not activate all providers by default.

# 15. Success metrics

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

# 16. Stop conditions

Stop or simplify when:

- orchestration costs more effort than direct Codex work;
- Context Packs repeatedly omit required evidence;
- a provider touches forbidden scope;
- reviewer independence becomes ceremonial;
- failures cannot be reproduced;
- the framework delays closed-beta product work;
- implementation requires a broad GO IRL architecture rewrite;
- generated knowledge begins to compete with canonical documentation.

# 17. Stabilization rule

No new foundational architecture document should be added until one of these occurs:

1. the current specification is implemented and tested;
2. a GO IRL pilot exposes a concrete gap;
3. a security or reliability defect requires an ADR;
4. an existing contract must be versioned for compatibility.

Implementation evidence must lead documentation evolution, not the reverse.

# 18. Current next task

Complete the single correction pass for PR #53:

- deny all sensitive mission paths;
- provide CLI validators for Mission, Context Pack, and Agent Result;
- add focused tests;
- update the Agent Report;
- rerun the five-command gate;
- keep the PR in Draft;
- do not merge.
