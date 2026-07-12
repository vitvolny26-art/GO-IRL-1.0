---
title: Documentation 2.0 Conflict Review
owner: Project Archivist
status: Review
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Documentation 2.0 Conflict Review

## Purpose

Record Phase 2 decisions about duplicate, overlapping, stale, or misleading documentation before any relocation.

No file is deleted or merged by this review.

## Decision 1 — Knowledge Platform authority

### Files

- `docs/governance/KNOWLEDGE_PLATFORM.md`
- `docs/governance/KNOWLEDGE_PLATFORM_2_0.md`

### Evidence

`KNOWLEDGE_PLATFORM.md` has complete lifecycle metadata:

```yaml
status: Active
source_of_truth: true
owner: Project Archivist
```

It explicitly defines itself as the source of truth for project knowledge classification, preservation, review, promotion, metadata, status rules, Knowledge Debt, KPIs, and review cadence.

`KNOWLEDGE_PLATFORM_2_0.md` describes an executable six-step roadmap and calls itself a planning document and operating plan.

### Decision

- `docs/governance/KNOWLEDGE_PLATFORM.md` remains the **Active source of truth**.
- `docs/governance/KNOWLEDGE_PLATFORM_2_0.md` is a **planning/implementation roadmap**, subordinate to the Active authority.
- The two files must not be merged silently.
- `KNOWLEDGE_PLATFORM_2_0.md` should receive standard YAML metadata with `status: Review` and `source_of_truth: false` in a later metadata patch.
- Any structural conflict between its proposed folders and the approved Documentation 2.0 mission is resolved in favor of the approved mission and current Active governance document.

### Conflict details

The planning document proposes `docs/history/` and `docs/brain/`, while the approved Documentation 2.0 mission uses `docs/archive/`, `docs/research/`, `docs/proposals/`, `docs/adr/`, and `docs/playbooks/`.

Decision: do not create `history` or `brain` as additional categories during this reorganization.

## Decision 2 — Documentation 2.0 structure authority

### Files

- `docs/onboarding/LIBRARIAN_DOCUMENTATION_2_0_MISSION.md`
- `docs/governance/KNOWLEDGE_PLATFORM_2_0.md`
- `docs/audit/DOCUMENTATION_2_0_MOVE_MANIFEST.md`

### Decision

For the current reorganization branch:

1. The Librarian mission defines the approved destination structure and safety rules.
2. The move manifest records proposed path-level decisions.
3. The Knowledge Platform 2.0 document remains a planning input, not the relocation authority.

## Decision 3 — Product Philosophy duplication

### Files

- `docs/PRODUCT_PHILOSOPHY.md`
- `docs/bible/01-foundation/01-product-philosophy.md`

### Decision

- Preserve both files.
- Do not merge during structural cleanup.
- `docs/PRODUCT_PHILOSOPHY.md` remains the direct product-philosophy entry point referenced by the Constitution.
- The Bible chapter remains the preserved Bible representation.
- A later content reconciliation may add cross-links and clarify whether the Bible chapter is a derivative or expanded version.

Status: `Review` until full content comparison is completed.

## Decision 4 — NotebookLM sync status duplication

### Files

- `GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt`
- `docs/exports/GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt`

### Decision

- Treat both as generated/export state until provenance is verified.
- Do not delete or move either file yet.
- Inspect the export script and all references before selecting the canonical generated location.
- Generated status files must not become Source of Truth.

Status: blocked on generator/reference audit.

## Decision 5 — Audit directory duplication

### Files

- `project-audit/*`
- `docs/audit/*`

### Decision

- `docs/audit/` is the approved Documentation 2.0 destination for maintained audits.
- Files under `project-audit/` require individual classification.
- Generated audits may remain beside their generator until output paths are intentionally changed.
- Historical task audits should move to `docs/archive/reports/` only through `git mv` after inbound-link review.
- No directory-wide bulk move is approved.

Status: `Review`.

## Decision 6 — Automation documentation

### Files

- `docs/n8n-workflows.md`
- `docs/automation/GITHUB_PR_CLICKUP_DRIVE_SYNC.md`
- `docs/automation/go-irl-ai-report-bus-v1.template.json`

### Decision

Classify by function, not by current folder:

- architecture and design boundaries → `docs/architecture/`;
- repeatable operating instructions → `docs/playbooks/`;
- non-authoritative proposed workflows → `docs/proposals/`;
- importable templates referenced by runtime/scripts remain protected until reference audit.

No move is approved until each file is read completely.

## Decision 7 — Historical reports

### Files

- `docs/reports/*.md`

### Decision

- Retain in place.
- Historical reports are immutable evidence.
- Do not rewrite old pending or stale findings.
- Corrections belong in a later consolidation report.
- Reports remain `source_of_truth: false` unless a specific governance exception is approved.

## Decision 8 — Root tooling files

### Files

- `AGENTS.md`
- `.github/pull_request_template.md`
- `supabase/README.md`
- `scripts/ai-orchestrator/README.md`

### Decision

Retain current paths. These files are location-sensitive or code-adjacent and are outside general documentation relocation.

## Unresolved conflicts

1. Final destination of `docs/GO_IRL_CONSTITUTION.md`: governance versus product.
2. Final destination and ownership of `docs/MVP_STABILIZATION_PLAN.md`: product versus operations/QA.
3. Exact authority and lifecycle status of `docs/GO_IRL_PRODUCT.md`.
4. Classification of each `project-audit/` file.
5. Generator ownership of NotebookLM status files.
6. Full metadata audit for documents with `Draft + source_of_truth: true`.
7. Recursive file inventory remains incomplete because a full repository tree is unavailable through the current connector.

## Phase 2 boundary

Conflict review may continue on confirmed files.

Relocation remains blocked until:

- a recursive inventory is available;
- each proposed move has inbound-link evidence;
- local Git access supports `git mv` so history is preserved.
