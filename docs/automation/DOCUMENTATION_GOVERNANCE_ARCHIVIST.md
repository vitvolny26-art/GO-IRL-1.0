---
title: Documentation Governance Archivist
owner: Technical Archivist
status: Active
source_of_truth: true
last_review: 2026-07-24
next_review: 2026-08-24
---

# Documentation Governance Archivist

## Production workflow

- Instance: `https://n8n.realitka.pp.ua`
- Workflow: `GO IRL - Unified Production Orchestrator`
- Workflow ID: `ulCZrP3Ci0YJy1TY`
- Published version: `0683daaa-8551-4d4f-acf6-495123e65e4d`
- Queue pump: every 2 minutes
- Chief Archivist heartbeat: every 10 minutes
- Timezone: `Europe/Prague`

## Historical workflow evidence

- Legacy production claim: `eEQiF6O2PUFyo49P`, every 12 hours.
- Legacy self-hosted migration workflow: `ot1NwNlcqD0vOHrn`.
- These identifiers are historical evidence only and must not be presented as current production truth.
- GitHub remains source of truth; n8n is orchestration and runtime evidence, not governance authority.

## Self-hosted GitHub Actions runner

The GO IRL self-hosted runner is fully configured and verified.

Verification evidence:

- GitHub Actions workflow run: `29549050132`
- Install dependencies: `PASS`
- Test: `PASS`
- Typecheck: `PASS`
- Lint: `PASS`
- Build: `PASS`

Routine GO IRL quality gates can now run directly through GitHub Actions. Termius is not required for normal lint, build, test, or typecheck execution.

## Main flow

`Manual/Schedule -> collect GitHub + Drive + ClickUp evidence -> normalize evidence -> semantic gate -> evidence ledger -> persist Drive report -> persist tracking -> human review`

## Destinations

- Drive reports: `Go IRL/AI Reports/<agent-role>/YYYY-MM-DD`
- Persistent ClickUp governance task: `Documentation Governance / Archivist`
- NotebookLM corpus: `Go IRL/GO IRL DOC`

## Error handling

Failures must produce structured evidence and remain non-authoritative. The workflow must not close tasks, change GitHub, or modify Drive lifecycle state automatically.

## Deduplication and tracking

The workflow persists normalized tracking state and must suppress duplicate unchanged findings according to verified workflow logic. Deduplication behavior requires execution evidence and is not project authority.

## Human gates

Automation may prepare reports and review evidence, but only a human-reviewed GitHub pull request may change source-of-truth documentation. A human must also decide whether a report is accepted as durable project knowledge.

## Prohibited actions

The workflow must not:

- merge or push code;
- edit `DOCS_INDEX.md` or close Knowledge Debt automatically;
- complete governance tasks automatically;
- modify auth, RLS, secrets, `.env`, destructive SQL, or migrations;
- present NotebookLM, Drive, ClickUp, or n8n as project authority.

## Verification evidence

Controlled execution `3313` completed technically with final Chief Archivist status `BLOCKED`.

- `reportValid=true`
- evidence ledger rows: `30`
- exact evidence rows: `30`
- missing finding evidence: `0`
- missing mandatory tokens: `0`
- Drive report: `1si-lmsZnMOOfjAq-awYqELrVE1k8Eojj`
- tracking state: `direct_archivist_blocked`

This execution verifies truthful terminal-state handling. It does not resolve the source conflicts recorded by the report.