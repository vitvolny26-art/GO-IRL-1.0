---
title: Bible Governance and AI Organization
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book IX — Governance

## Authority

1. Verified runtime evidence and current GitHub `main`.
2. Applied schema/migrations and current operational evidence.
3. Active GitHub governance and product documents.
4. ClickUp operational state.
5. Drive, NotebookLM, AI reports, exports, and historical material as advisory inputs.

## System roles

- GitHub: code and durable documentation source of truth.
- ClickUp: current work queue and coordination.
- Google Drive: instructions, working documents, mirrors, and reports.
- NotebookLM: passive retrieval over supplied material.
- n8n: orchestration and evidence transport.
- AI agents: bounded roles producing reviewable work.
- Human owner/reviewer: approval gates for source-of-truth changes, merges, production, and sensitive systems.

## AI role discipline

Use one active role and one active task. Role charters define authority. No agent may claim runtime success without evidence.

## Automation boundary

Automation may collect evidence, deduplicate, prepare Draft reports, and update allowed operational records. It must not automatically:

- merge or force-push;
- approve source-of-truth changes;
- close Knowledge Debt;
- modify auth, RLS, migrations, secrets, or production data;
- present Drive, NotebookLM, ClickUp, or n8n as project authority.

Current workflow identifiers and schedules belong in active governance documents on GitHub. Unmerged PRs remain proposals.

## Documentation discipline

Every authoritative document needs owner, status, source-of-truth classification, review dates, explicit scope, and conflict handling. Reports remain non-authoritative until accepted through reviewed changes.

## Navigation

- Previous: [`08-runtime-boundaries.md`](08-runtime-boundaries.md)
- Next: [`10-operations-and-release.md`](10-operations-and-release.md)
- Governance policy: [`../governance/ARCHIVIST_OPERATING_POLICY.md`](../governance/ARCHIVIST_OPERATING_POLICY.md)
