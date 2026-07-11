---
title: GO IRL Operating System
owner: Project Coordinator
status: Proposal
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# GO IRL Operating System

## Purpose

GO IRL Operating System defines how the owner, human contributors, AI roles, automation, documentation, and external systems cooperate without replacing the existing product roadmap or governance hierarchy.

This document is a proposal. It does not override `GO_IRL_CONSTITUTION.md`, `DOCS_INDEX.md`, `ROADMAP.md`, `BACKLOG.md`, or active role charters.

## Core principles

1. Product first: every system must support real-life meetings.
2. GitHub first: the repository is the only source of truth.
3. Human approval: sensitive or repository-changing actions require explicit approval.
4. Deterministic before AI: routing, state, validation, limits, retries, and approvals should be deterministic.
5. Small safe steps: changes should be bounded, testable, reversible, and documented.
6. One task at a time: parallel systems must not compete with the active beta blocker.

## Operating layers

### Identity

Defines mission, product philosophy, and non-negotiable constraints.

Primary documents:

- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`

### Product

Defines what users receive and in what order.

Primary documents:

- `ROADMAP.md`
- `BACKLOG.md`
- `docs/SPORT_COACH_MVP.md`

### Engineering

Defines implementation reality and technical constraints.

Primary evidence:

- current repository code;
- migrations;
- architecture and security documents;
- automated checks.

### AI

Defines bounded AI roles, Context Packs, validation, and human approval.

Primary documents:

- `docs/onboarding/AI_ROLES.md`
- `docs/onboarding/PROJECT_COORDINATOR_CHARTER.md`
- `docs/governance/AI_ORGANIZATION.md`

### Automation

Defines n8n and deterministic integrations.

Automation is divided into three independent lanes:

1. Product Automation;
2. AI Report Bus;
3. AI Staff OS.

These lanes must not share authority or silently write to each other.

### Operations

Defines QA, release, monitoring, incident handling, backups, and manual production verification.

### Research

Contains evidence and recommendations. Research reports are not source of truth until accepted into active documents.

### Knowledge

Preserves decisions, indexes, Knowledge Debt, ADRs, and durable reports.

Chat history, Google Drive, and NotebookLM are not authoritative project memory.

## Decision flow

```text
Observation
-> Evidence
-> Research
-> Proposal
-> Owner decision
-> Backlog or approved task
-> Implementation
-> Verification
-> Documentation
-> Review
```

No proposal becomes active merely because an AI generated it.

## Role boundaries

### Owner

Final authority for scope, sensitive changes, merges, deployment, and readiness claims.

### Project Coordinator

Classifies one Daily Mission, selects relevant roles, applies limits, validates outputs, and produces one synthesis. It does not independently approve product, architecture, security, repository writes, or deployment.

### Specialist roles

Specialists work only within their documented scope and receive bounded Context Packs.

### Archivist

Checks source-of-truth conflicts, documentation continuity, stale claims, and required durable reports.

## n8n boundaries

n8n may handle:

- triggers;
- scheduling;
- routing;
- idempotency;
- schema validation;
- budget and retry counters;
- notification delivery;
- approval state;
- operational logging.

n8n must not independently:

- change product architecture;
- bypass Supabase RLS;
- use production `service_role` for routine workflows;
- edit auth, SQL, migrations, or secrets;
- commit code;
- merge pull requests;
- deploy production;
- edit `DOCS_INDEX.md`;
- close Knowledge Debt;
- claim beta readiness.

## Roadmap synchronization

The existing product roadmap remains canonical.

Current order remains:

1. Closed Beta Loop Stability;
2. Infrastructure Hardening;
3. Sport Coach MVP 1.1;
4. Performance;
5. n8n Notifications;
6. AI Event Discovery.

Internal AI and automation work may proceed only when it does not block this order.

## Current safe implementation sequence

1. Complete the real Telegram two-account smoke test.
2. Reconcile and manually validate `STAFF-00 Daily Mission Intake`.
3. Keep Staff OS structural workflows inactive until acceptance evidence exists.
4. Validate AI Report Bus as a deterministic internal workflow.
5. Implement the first product notification workflow during the approved n8n Notifications phase.
6. Add OpenRouter only for bounded structured reasoning after deterministic controls are proven.

## Documentation policy

Every new operating document should include:

```yaml
title:
owner:
status:
source_of_truth:
last_review:
next_review:
```

Allowed lifecycle:

```text
Proposal -> Draft -> Active -> Deprecated -> Archived
```

Promotion to `Active` requires explicit owner approval and conflict review against current source-of-truth documents.

## Success criteria

GO IRL OS is useful only if it:

- reduces conflicting instructions;
- reduces unnecessary AI context;
- prevents unsafe automation;
- keeps the product roadmap dominant;
- improves auditability;
- shortens the path from evidence to one safe next task;
- helps more users complete real-life meetings.

## Non-goals

This proposal does not:

- replace the existing Constitution;
- create a new authority layer;
- reorganize all repository folders;
- add new AI roles;
- authorize autonomous changes;
- modify the current product roadmap;
- create a universal framework for unrelated projects.

## Adoption rule

Use this proposal for three real project tasks. After those tasks, review:

- which rules were useful;
- which rules duplicated existing documents;
- which sections should be promoted;
- which sections should be removed.

Until that review, this file remains non-authoritative.
