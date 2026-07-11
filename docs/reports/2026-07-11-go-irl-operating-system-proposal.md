---
title: Agent Report — GO IRL Operating System Proposal
owner: Project Coordinator
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report — GO IRL Operating System Proposal

## Task

Create a bounded proposal that explains how GO IRL product, engineering, AI, automation, operations, research, and knowledge documents relate without replacing the current roadmap or governance hierarchy.

## Files inspected

- `ROADMAP.md`
- `BACKLOG.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/onboarding/PROJECT_COORDINATOR_CHARTER.md`
- `docs/governance/AI_ORGANIZATION.md`
- `GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt`

## Findings

- The current product roadmap already defines the correct priority order and must remain canonical.
- AI Staff OS, AI Report Bus, and Product Automation require separate boundaries.
- A compact operating-system proposal can reduce cross-document confusion only if it remains non-authoritative until tested on real tasks.
- Creating additional doctrine, framework, or company-level layers now would increase documentation overhead without helping the current beta gate.

## Changes made

Created:

- `docs/proposals/GO_IRL_OPERATING_SYSTEM.md`

The proposal:

- preserves the existing Constitution, roadmap, backlog, and role charters;
- defines product, engineering, AI, automation, operations, research, and knowledge layers;
- keeps n8n limited to orchestration and deterministic automation;
- requires human approval for sensitive actions;
- proposes a three-task practical trial before any promotion to active status.

## Checks

- Documentation-only change reviewed against current roadmap and Coordinator governance.
- Proposal metadata states `status: Proposal` and `source_of_truth: false`.
- No application code, dependencies, auth, RLS, SQL, migrations, secrets, deployment settings, roadmap, backlog, or `DOCS_INDEX.md` were changed.
- Application `pnpm` checks were not required because no code changed.

## Risks

- The proposal may duplicate existing governance documents.
- Promoting it prematurely could create another source-of-truth layer.
- Continuing to expand the concept before practical testing would distract from the Telegram beta gate.

## Next step

Review Draft PR #50 and decide whether to test the proposal on three real project tasks, simplify it, or close it without merge.
