---
title: AI Orchestration Idea Archive
owner: Technical Archivist
status: Reference
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-08-11
---

# AI Orchestration Idea Archive

## Purpose

Preserve the strongest reusable ideas developed during GO IRL AI orchestration design without promoting them to source-of-truth status.

## Best ideas retained

### One mission at a time

The orchestration system must process one bounded mission, not maintain an open-ended swarm.

### Activate only required roles

Roles are selected per mission. Unused roles are explicitly skipped to reduce cost, duplication, and conflicting output.

### Context Packs instead of full repository dumps

Each role receives only the mission, relevant source-of-truth excerpts, file evidence, constraints, and acceptance criteria.

### Deterministic gates before AI

Schema validation, idempotency, scope checks, budget limits, and state transitions must be deterministic. AI is used only where judgment is needed.

### Separate implementer and reviewer

The agent that writes the patch must not be the only agent that evaluates it.

### Human approval before writes with consequence

Commit, PR readiness, merge, deployment, and sensitive changes remain human-controlled.

### GitHub as durable memory

Chats and model memory are disposable. Decisions, reports, prompts, schemas, and results that matter are committed to the repository.

### n8n as orchestration glue, not authority

n8n routes, schedules, validates, retries, records state, and requests approval. It does not decide product truth or security policy.

### Evidence-backed outputs

Every claim must point to repository evidence, test output, issue context, or a clearly marked inference.

### One correction pass by default

A bounded reviewer correction prevents endless agent loops.

### Readiness levels

Workflows progress through concept, documented, structurally validated, manually accepted, active test, and production active. No level is skipped.

### Value per cost

Potential tasks can be compared using a practical heuristic:

```text
value = uncertainty_reduction * evidence_confidence * purpose_alignment / cost
```

This is a prioritization aid, not a scientific law.

### Decision trace

Every mission should preserve:

```text
question -> evidence -> decision -> execution -> result -> learning
```

### Reports are not authority

AI reports remain drafts until accepted into canonical documents by a human owner.

### Stop conditions are first-class

Every mission and workflow should define what causes immediate stop: forbidden scope, missing evidence, red checks, budget breach, or security risk.

## Ideas deliberately deferred

- universal AI operating system;
- decentralized intelligence network;
- open decision protocol;
- knowledge graph as primary authority;
- autonomous AI company;
- multi-agent swarm;
- self-modifying orchestration;
- foundation or public standard.

These may be revisited only after GO IRL proves the smaller orchestration model in real development work.

## Current practical conclusion

The highest-value system for GO IRL is not a universal platform. It is a narrow development pipeline:

```text
Mission
-> Context Pack
-> Plan
-> Codex Patch
-> Independent Review
-> lint/build/test
-> Human Approval
-> Draft PR
-> Agent Report
```
