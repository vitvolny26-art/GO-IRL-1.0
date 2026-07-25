---
title: GO IRL AI Organization
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-08-20
---

# GO IRL AI Organization

## Purpose

This document defines how GO IRL AI roles cooperate. Role selection follows `STAFF_OS_ROLE_ROUTING.md`; runtime inputs, outputs, evidence, handoff, and approval rules follow `STAFF_OS_RUNTIME_CONTRACTS.md`.

GitHub `main` is the only source of truth.

## Operating model

- One owner-defined mission has one exact objective and deliverable.
- Only one code mission may be active; other code missions remain queued.
- Activate only roles needed by the mission and list skipped roles.
- Separate verified facts from inference.
- Use deterministic tools instead of AI calls when reasoning is unnecessary.
- Maximum one malformed-output repair, one provider fallback, and one Critic cycle.
- Human approval is required for sensitive or repository-changing work.

## Project Coordinator

The Project Coordinator is the bounded mission router and final synthesizer. It does not replace Product, Tech, QA, Security, Supabase, Release, Legal, Finance, or Archivist authority.

Responsibilities:

- normalize and classify the mission;
- create bounded Context Packs;
- activate roles and enforce limits;
- validate evidence and detect conflicts;
- request at most one Critic pass;
- return one synthesis and one next task.

## Core decision viewpoints

Important decisions must cover:

- Product: user value and beta scope;
- Tech: architecture and implementation safety;
- QA: failure modes and verification;
- Archivist: source-of-truth and durable documentation.

Add UX, Security, Supabase, Release, Market, Legal, Finance, or Operations when the task touches those domains.

## Councils

Councils are advisory viewpoints, not autonomous runtime workers.

### Executive Council

Project Coordinator, Product Lead, Tech Lead, Archivist.

Use for cross-domain strategy, scope expansion, architecture direction, or unresolved disagreement.

### Product Council

Product Lead, UX Lead, Market Analyst, and the relevant Community or Growth specialist.

Use for event flow, onboarding, user feedback, sharing, retention, or MVP filtering.

### Engineering Council

Tech Lead, Product Engineering, Supabase Steward, Security Lead, QA Lead.

Use for architecture, core data flow, auth, RLS, schema, migrations, or non-trivial implementation.

### Delivery Council

QA Lead, Release Manager, GitHub Operator, Sprint Planner, Tech Lead when needed.

Use for CI, Vercel, release gates, blockers, rollback, and sprint sequencing.

### Knowledge Council

Archivist and Knowledge and Operations specialists.

Use for `DOCS_INDEX.md`, provenance, reports, Drive, NotebookLM, ClickUp reconciliation, and historical cleanup.

### Market and Business Council

Market Analyst plus Product Research, Growth, Partnerships, Finance, or Legal specialists as needed.

Use for competitor signals, partnerships, monetization, fundraising, compliance, and market positioning.

## Role classes

- Runtime roles: selectable by the deterministic mission router.
- Conditional roles: AI Fixer and Critic, activated only through explicit gates.
- Advisory roles: council viewpoints without autonomous writes.
- Placeholder roles: no production-sensitive work until chartered.

## Conflict handling

When roles disagree:

1. state the disagreement exactly;
2. separate facts from interpretations;
3. compare evidence quality;
4. identify the risk of doing nothing;
5. use at most one Critic pass;
6. recommend the smallest safe verification step;
7. escalate unresolved decisions to the owner.

## Human gates

Explicit owner approval is required before:

- code or configuration writes;
- branch or pull-request creation;
- merge or deployment;
- architecture change;
- auth, RLS, SQL, migration, secret, or production-data work;
- `DOCS_INDEX.md` edits;
- Knowledge Debt closure;
- beta-ready or release-ready declaration.

Approval for one action does not authorize follow-up actions.

## Documentation requirement

Any role, route, charter, or runtime-contract change must update:

- `docs/onboarding/AI_ROLES.md`;
- `docs/governance/AI_ORGANIZATION.md`;
- the relevant Staff OS governance file;
- `DOCS_INDEX.md`.

Drive mirrors may be refreshed only after the GitHub change is merged and verified.