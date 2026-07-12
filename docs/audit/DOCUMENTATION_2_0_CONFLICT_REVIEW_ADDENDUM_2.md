---
title: Documentation 2.0 Conflict Review — Addendum 2
owner: Project Archivist
status: Review
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Documentation 2.0 Conflict Review — Addendum 2

## Purpose

Resolve two remaining Phase 2 conflict groups:

1. `project-audit/` classification;
2. duplicate NotebookLM sync status files.

No files are moved, deleted, merged, or promoted by this addendum.

## Decision 1 — `project-audit/GO_IRL_PROJECT_AUDIT.md`

### Evidence

- Explicitly marked as generated on 2026-07-06.
- Reports inferred completion percentages and one-time scan statistics.
- Contains time-sensitive code and repository observations.
- References historical paths such as `old/README.md`, setup files, and `snapshot.txt`.

### Classification

- Type: generated historical audit snapshot.
- Proposed destination: `docs/archive/reports/GO_IRL_PROJECT_AUDIT.md`.
- Proposed status: `Archived`.
- Source of truth: `false`.
- Move only with `git mv` after checking script/output references.

## Decision 2 — `project-audit/GO_IRL_HEALTH_AUDIT.md`

### Evidence

- Explicitly marked as generated on 2026-07-07.
- Captures a one-time lint/build/test state.
- Contains obsolete failures and local Windows paths.
- Current project state has advanced beyond the recorded snapshot.

### Classification

- Type: generated historical health snapshot.
- Proposed destination: `docs/archive/reports/GO_IRL_HEALTH_AUDIT.md`.
- Proposed status: `Archived`.
- Source of truth: `false`.
- Do not rewrite the old results; preserve as evidence.
- Before moving, inspect `scripts/go-irl-health-audit.cjs` and intentionally update its output path if the audit is still used.

## Decision 3 — `project-audit/GO_IRL_1_0_REBUILD_FROM_AUDIT.md`

### Evidence

- Describes creation of a clean local rebuild from the predecessor repository `vitvolny26-art/GO-IRL`.
- References a historical rebuild branch and local PowerShell workflow.
- The current repository is already `GO-IRL-1.0`, so the document is no longer an active operating instruction.

### Classification

- Type: historical rebuild plan.
- Proposed destination: `docs/archive/setup/GO_IRL_1_0_REBUILD_FROM_AUDIT.md`.
- Proposed status: `Archived`.
- Source of truth: `false`.
- Preserve links to the related rebuild scripts as historical context.

## Decision 4 — Remaining `project-audit/` files

### `project-audit/TASK1_COACH_CHAT_WEATHER_AUDIT.md`

- Type: task-specific audit snapshot.
- Proposed destination: `docs/archive/reports/TASK1_COACH_CHAT_WEATHER_AUDIT.md`.
- Proposed status: `Archived` unless a full reread proves it is still an active QA authority.

### `project-audit/BETA_READINESS_AUDIT.md`

- Type: beta-readiness audit.
- Proposed destination: `docs/audit/BETA_READINESS_AUDIT.md` only if current findings remain valid.
- Otherwise destination: `docs/archive/reports/BETA_READINESS_AUDIT.md`.
- Status remains `Review` pending full content comparison with `BETA_CHECKLIST.md`, `BETA_TESTING.md`, and `docs/bible/07-beta-readiness-and-operations.md`.

### Directory decision

- Do not preserve `project-audit/` as a permanent Documentation 2.0 category.
- Do not bulk-move the directory.
- Classify and move each file independently through `git mv`.
- Generated scripts must have their output paths reviewed before related files move.

## Decision 5 — NotebookLM sync status duplication

### Files

- `GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt`
- `docs/exports/GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt`

### Evidence

The files contain the same substantive content and date. The only observed textual difference is title punctuation (`-` versus `—`). Both describe GitHub as source of truth and NotebookLM/Drive as a non-authoritative export mirror.

Repository search finds both locations referenced in project documentation, but no evidence yet proves which path is the generator output target.

### Classification

- Both are generated operational mirror state.
- Neither is Source of Truth.
- Preferred canonical generated location: `docs/exports/GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt`.
- Proposed root-file status: `Deprecated` after generator/reference audit.
- Proposed replacement pointer: `docs/exports/GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt`.

### Safety gate

Do not delete or move the root file until all of the following are verified:

1. export/generator scripts write to `docs/exports/`;
2. `README.md`, `DOCS_INDEX.md`, `AGENTS.md`, onboarding files, n8n workflows, and reports no longer require the root path;
3. Google Drive / NotebookLM export includes `docs/exports/`;
4. no external automation downloads the root path directly.

## Phase 2 result

Resolved for classification:

- three major generated `project-audit/` files;
- task audit provisional placement;
- beta readiness audit decision rule;
- preferred canonical NotebookLM sync status location.

Still blocked:

- physical moves require `git mv`;
- generator output-path audit;
- full inbound-link audit;
- recursive repository inventory.
