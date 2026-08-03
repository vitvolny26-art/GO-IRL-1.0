---
title: Archivist Operating Policy
owner: Technical Archivist
status: Active
source_of_truth: true
last_review: 2026-08-03
next_review: 2026-08-10
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

1. Automation creates a non-authoritative report in `Go IRL/AI Reports/Chief Archivist - Technical Lead/YYYY-MM-DD`.
2. A human reviews the evidence and any proposed action before an approval-gated write.
3. Historical reports remain preserved. A later report may classify them as current, stale, advisory, superseded, or blocked without rewriting their original claims.
4. A report may be classified as internally inconsistent only from direct subject-level evidence. A quotation or evidence row about another report is not proof that the quoting report has the same defect.
5. Source-of-truth changes require a reviewed GitHub pull request.

## Automation boundaries

Automation must not:

- merge or push application code automatically;
- edit `DOCS_INDEX.md` automatically;
- close Knowledge Debt automatically;
- complete ClickUp governance tasks automatically;
- modify auth, RLS, secrets, `.env`, destructive SQL, or migrations;
- treat Drive, NotebookLM, ClickUp, Gemini, or n8n as a source of truth.

## Review cadence

The Archivist reconciliation runs every 12 hours. Unresolved conflicts older than seven days must be escalated to the persistent ClickUp governance task for human review.
