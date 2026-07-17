---
title: Documentation Governance Archivist
owner: Technical Archivist
status: Active
source_of_truth: true
last_review: 2026-07-17
next_review: 2026-07-24
---

# Documentation Governance Archivist

## Production workflows

- Main workflow: `eEQiF6O2PUFyo49P`
- Error workflow: `fQRdemYreOGDzWAw`
- Schedule: every 12 hours
- Timezone: `Europe/Prague`

## Self-hosted n8n migration

- Instance: `https://n8n.realitka.pp.ua`
- Workflow: `GO IRL AI Archivist`
- Workflow ID: `ot1NwNlcqD0vOHrn`
- Timezone: `Europe/Prague`
- Revision schedule: `01:00`
- Approved synchronization schedule: `13:00`
- GitHub remains source of truth.
- The self-hosted workflow is not production-active until required credentials are reconnected and a successful revision execution is verified.
- OpenRouter is connected. Telegram, GitHub, Google Drive, Google Docs, ClickUp, and SSH credentials still require server-side authorization.

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

`Manual/Schedule -> read ClickUp + DOCS_INDEX + BACKLOG -> normalize evidence -> SHA-256 fingerprint -> deduplicate -> create Draft report -> save to Drive Inbox -> comment on persistent ClickUp task`

## Destinations

- Drive Inbox: `Go IRL/AI Reports/Inbox`
- Drive Reviewed: `Go IRL/AI Reports/Reviewed`
- Drive Rejected: `Go IRL/AI Reports/Rejected`
- Persistent ClickUp task: `Documentation Governance / Archivist`
- NotebookLM corpus: `Go IRL/GO IRL DOC`

## Error handling

Production failures invoke the separate Error Trigger workflow. The handler writes failure evidence to the persistent ClickUp governance task. It does not close tasks, change GitHub, or modify Drive lifecycle state.

## Deduplication

The main workflow stores the latest SHA-256 fingerprint in workflow static data. When the normalized evidence has not changed, the workflow emits no report and no duplicate ClickUp comment.

## Human gates

Automation may prepare reports and review evidence, but only a human-reviewed GitHub pull request may change source-of-truth documentation. A human must also decide whether a Drive report moves from Inbox to Reviewed or Rejected.

## Prohibited actions

The workflow must not:

- merge or push code;
- edit `DOCS_INDEX.md` or close Knowledge Debt automatically;
- complete governance tasks automatically;
- modify auth, RLS, secrets, `.env`, destructive SQL, or migrations;
- present NotebookLM, Drive, ClickUp, or n8n as project authority.

## Verification evidence

Production execution `695` created the initial reconciled report. Production execution `696` completed successfully without creating a duplicate. The error workflow is attached through the main workflow `errorWorkflow` setting.