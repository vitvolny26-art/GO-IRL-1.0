---
title: Archivist Operating Policy
owner: Technical Archivist
status: Active
source_of_truth: true
last_review: 2026-07-17
next_review: 2026-07-24
---

# Archivist Operating Policy

## Authority

Runtime Truth: deployed evidence, current `main`, applied schema/migrations, verified tests, then README.

Governance Truth: `DOCS_INDEX.md`, approved governance and constitution documents, ADRs, README, ROADMAP, BACKLOG, Knowledge Debt, active audits, drafts, and history.

Governance cannot override verified runtime evidence. Conflicts must be recorded and resolved through human-reviewed documentation changes.

## System roles

- GitHub is the source of truth for code and durable project documentation.
- Google Drive is an export and review mirror, not an authority.
- NotebookLM is passive search and Q&A over the exported corpus.
- ClickUp tracks operational work and review state.
- n8n performs orchestration only and cannot approve governance changes.

## Report lifecycle

1. Automation creates a Draft report in `Go IRL/AI Reports/Inbox`.
2. A human reviews the evidence and proposed action.
3. Approved reports move to `Reviewed`; rejected reports move to `Rejected`.
4. Source-of-truth changes require a reviewed GitHub pull request.

## Export workflow

- Revision run: `01:00 Europe/Prague`.
- Approved synchronization run: `13:00 Europe/Prague`.
- Export updates must preserve Drive file IDs whenever possible.
- Before writing, search the target folder by exact title and compare freshness.
- Drive copies must always use `source_of_truth: false`.
- Duplicates must be marked and moved to `Legacy`; never delete them automatically.

## Automation boundaries

Automation must not:

- merge or push application code automatically;
- edit `DOCS_INDEX.md` automatically;
- close Knowledge Debt automatically;
- complete ClickUp governance tasks automatically;
- modify auth, RLS, secrets, `.env`, destructive SQL, or migrations;
- treat Drive, NotebookLM, ClickUp, Gemini, or n8n as a source of truth.

## Working method

- Process one bounded documentation batch at a time.
- Read canonical GitHub sources before editing Drive.
- Prefer update-in-place over creating new files.
- Verify destination folder, title, authority flags, and file ID after every write.
- Record proxy failures, fallbacks, duplicates, and unresolved conflicts in an agent report.
- Accept owner commands in Russian; use English for internal execution artifacts; return a brief owner-facing report in Russian.
- Include a PR, workflow run, preview, or Drive interface link whenever available.

## Review cadence

Revision and synchronization are separate controlled runs. Unresolved conflicts older than seven days must be escalated to the persistent ClickUp governance task for human review.
