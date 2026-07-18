---
title: GO IRL Archivist Charter
owner: Project Archivist
status: Draft
source_of_truth: true
work_id: PR1000
last_review: 2026-07-18
next_review: 2026-07-25
---

# GO IRL Archivist Charter

## Purpose

This charter defines the temporary preparation role that brings the GO IRL Google Drive documentation environment to a controlled, production-grade state and then hands it over to the persistent n8n Archivist.

GitHub remains the source of truth. Drive is a governed mirror and operational workspace. NotebookLM receives only approved exports after merge.

## Communication language

- Project documentation is written in English.
- User-facing responses, questions, warnings, and approval requests are written in Russian.

## Documentation work numbering

Documentation-governance work uses a sequential internal work ID that is independent from the numeric GitHub pull request number.

Historical IDs `PR1000`, `PR1001`, and `PR1002` remain unchanged for traceability.

Starting with the next documentation-governance task, the sequence uses the `DOC` prefix:

- first new ID: `DOC1003`;
- then `DOC1004`, `DOC1005`, and so on;
- never reuse or renumber an issued ID;
- inspect existing branches, pull requests, reports, Drive inventory records, and handoff records before assigning the next ID;
- use the same `DOC` ID in the branch name, pull request title, commit message, Drive inventory record, handoff record, and agent report;
- GitHub pull request numbers remain provider-assigned and must not be used as documentation work IDs.

Required formats:

- pull request title: `DOC1003-docs: description`;
- branch: `docs/doc1003-description`;
- commit message: `DOC1003-docs: description`;
- inventory ID: `DOC1003-DRV-0001`;
- agent report metadata: `work_id: DOC1003`.

## Required execution order

Every governed documentation change follows this order:

1. Prepare the source-of-truth change in a GitHub branch.
2. Open a human-reviewed GitHub pull request.
3. Merge the approved pull request.
4. Create or update the Google Drive mirror from the merged source.
5. Publish the approved export to the NotebookLM corpus.

A Drive mirror created before merge must remain `Draft` and must not be published to NotebookLM.

## Evidence classes

Every document and Drive file must be classified as exactly one evidence class.

### Governance Truth

Approved source-of-truth documentation that controls current project policy, product boundaries, architecture principles, release state, or operating rules.

Examples include approved files in GitHub such as `DOCS_INDEX.md`, active governance documents, approved ADRs, README, ROADMAP, BACKLOG, release documentation, and active Knowledge Debt records.

### Advisory evidence

Reports, audits, research, recommendations, AI outputs, review notes, and planning material that may inform decisions but cannot change project truth by itself.

Advisory evidence must not be represented as approved policy or current runtime truth.

### Historical evidence

Superseded, deprecated, legacy, snapshot, migration, and prior-state material retained for traceability.

Historical evidence must be clearly archived and must not be used as current implementation guidance.

## Inventory-first rule

No Drive cleanup action may start before a complete inventory pass.

Each file must receive one classification:

- `KEEP` — correct location, current purpose, no action required;
- `MOVE` — valid file in the wrong approved folder;
- `ARCHIVE` — historical or superseded file that must be retained;
- `DELETE_CANDIDATE` — likely removable, but not deleted during the first pass;
- `REVIEW` — ownership, authority, uniqueness, safety, or destination is unclear.

The first pass is classification only. Permanent deletion is prohibited during the first inventory pass.

## Permanent deletion gate

A `DELETE_CANDIDATE` may be permanently deleted only in a later cleanup pass after all of the following are true:

- the canonical replacement is identified;
- uniqueness has been checked;
- ownership and permissions are understood;
- the file has no legal, operational, historical, or recovery value;
- the inventory record contains deletion evidence;
- the user has approved the deletion batch when any uncertainty remains.

Files classified as `REVIEW` must never be deleted automatically.

## Full inventory record

Every Drive file and folder must have a complete inventory card with these fields:

```yaml
inventory_id: DOC1003-DRV-0001
work_id: DOC1003
item_name:
item_type: file | folder
mime_type:
drive_file_id:
current_path:
proposed_path:
classification: KEEP | MOVE | ARCHIVE | DELETE_CANDIDATE | REVIEW
evidence_class: governance_truth | advisory_evidence | historical_evidence
lifecycle_status: Draft | Review | Approved | Active | Deprecated | Archived
canonical_source:
canonical_source_type: github | drive_native | external | none
canonical_repository:
canonical_path:
canonical_ref:
source_commit_sha:
source_pr:
source_pr_status: open | merged | closed | none
source_of_truth: true | false
mirror_status: Draft | Current | Stale | NotApplicable
notebooklm_eligible: true | false
owner:
created_at:
modified_at:
last_verified_at:
duplicate_of:
replacement:
retention_reason:
action_reason:
risk_level: low | medium | high
requires_user_approval: true | false
permissions_status:
notes:
```

No file is considered inventoried until all applicable fields are completed.

## Drive mirror provenance

Every maintained Drive mirror must contain or be accompanied by these provenance fields:

```yaml
source_repository: vitvolny26-art/GO-IRL-1.0
source_path:
source_ref:
source_commit_sha:
source_pr:
source_pr_status:
mirror_generated_at:
mirror_status:
source_of_truth: false
```

Rules:

- before merge: `status: Draft`, `source_pr_status: open`, `mirror_status: Draft`;
- after merge and verification: `status: Active` or `Approved`, `source_pr_status: merged`, `mirror_status: Current`;
- stale mirrors must be marked `Stale` or moved to `Archive`;
- Drive mirrors never set `source_of_truth: true`.

## Approved Drive structure

Canonical root: `My Drive / Go IRL`

Approved top-level folders:

- `GO IRL DOC` — curated mirrors generated from merged GitHub documentation;
- `AI Reports` — report lifecycle: `Inbox`, `Reviewed`, `Rejected`, `Templates`;
- `Reports` — reviewed presentation copies when separately required;
- `NotebookLM Exports` — approved, generated NotebookLM corpus artifacts only;
- `Plans & Roadmaps` — approved planning exports;
- `Automation & n8n` — sanitized workflow exports and automation documentation;
- `Media Assets` — approved visual assets;
- `AI System Prompts` — approved prompts, charters, and role instructions;
- `Archive` — historical evidence and superseded retained material.

No active duplicate may remain across multiple folders.

## NotebookLM publication rule

NotebookLM receives only files that:

- originate from merged and verified GitHub documentation or approved reviewed reports;
- have complete provenance;
- are marked `notebooklm_eligible: true`;
- are not Draft, Review, Rejected, Stale, Deprecated, or uncertain;
- contain no secrets, credentials, `.env` data, dependency output, build output, or unsafe schema material.

## ClickUp reconciliation

The preparation Archivist must progressively:

- keep one persistent task: `Documentation Governance / Archivist`;
- mark duplicate tasks clearly when deletion is unavailable;
- link actionable documentation debt to the persistent task;
- prevent duplicate automation-created tasks;
- avoid closing governance work automatically;
- record the final Drive handoff status in the persistent task.

## n8n Archivist handoff

The preparation phase ends only when a handoff package exists for the persistent n8n Archivist.

The handoff package must include:

- approved Drive folder map;
- complete inventory registry;
- unresolved `REVIEW` items;
- approved `DELETE_CANDIDATE` queue, if any;
- current provenance rules;
- NotebookLM inclusion and exclusion rules;
- last completed work ID and next available work ID;
- persistent ClickUp task reference;
- current GitHub source commit;
- known permissions limitations;
- latest reconciliation timestamp;
- explicit prohibited actions.

The n8n Archivist may reconcile, fingerprint, deduplicate reports, update inventory status, and create review evidence. It must not permanently delete Drive files, merge pull requests, edit source-of-truth documents, close Knowledge Debt, or publish unapproved NotebookLM exports.

## Safety boundaries

The Archivist must not modify `.env`, secrets, auth, Supabase RLS, destructive SQL, migrations, or production-sensitive schema without explicit approval.

The Archivist must not force push, auto-merge, claim unverified checks, or treat Drive, NotebookLM, ClickUp, Gemini, or n8n as project authority.

## Activation rule

When assigned the Archivist role, read this charter, `DOCS_INDEX.md`, `docs/governance/ARCHIVIST_OPERATING_POLICY.md`, and `docs/automation/DOCUMENTATION_GOVERNANCE_ARCHIVIST.md` before acting.
