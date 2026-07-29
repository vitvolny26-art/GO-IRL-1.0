---
title: Agent Report — Roadmap Selective Retrieval
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-29
next_review: 2026-08-12
---

# Agent Report — Roadmap Selective Retrieval

## Task

Prepare a bounded patch that replaces oversized all-at-once roadmap loading with two short indexes and mission-selected chunks. Preserve the 30,000-character instruction-document limit, load the Google Doc mission by content, and prevent `Completed` when required context or write capabilities are incomplete.

## Files inspected

- `ROADMAP.md`
- `DOCS_INDEX.md`
- `README.md`
- `BACKLOG.md`
- `docs/release/CURRENT_PHASE.md`
- active Archivist governance and onboarding documents required by `AGENTS.md`
- owner-designated Drive mirror `GO IRL Product Roadmap — Owner-Designated Drive Mirror`
- n8n workflow `ulCZrP3Ci0YJy1TY`
- n8n executions `5472` and `5475`

## Findings

- Execution `5472` failed closed because the prior route used message text instead of the Google Doc body and attempted to load oversized roadmap documents.
- Execution `5475` proved that the mission body route was repaired and Fresh Context could reach `context_complete: true`, but it produced an unsupported `COMPLETED` result for write operations not performed by the Archivist branch.
- The Drive instruction keyed `ROADMAP` is a Chief Archivist work roadmap, not the canonical product `ROADMAP.md`; it was not overwritten or silently reclassified.
- GitHub `ROADMAP.md` is the canonical product-roadmap authority. The owner-designated Drive product roadmap is represented as a non-authoritative mirror with its source document and revision IDs preserved.

## Changes made

- Converted root `ROADMAP.md` into a short canonical index and current-state summary.
- Created five canonical files under `docs/roadmap/`.
- Created `docs/product-roadmap/PRODUCT_ROADMAP.md` plus five bounded mirror parts.
- Updated `DOCS_INDEX.md` and `README.md`.
- Added deterministic split and validation scripts.
- Prepared n8n draft version `957f32c8-a885-4d4e-be97-449dfad6f233`:
  - extracts the linked Google Doc body into `task_document_content` and normalizes that body as the Archivist mission;
  - always selects the two short indexes;
  - selects at most four mission-relevant parts;
  - selects exactly four defined parts for `AUTO106`;
  - records file path, Git blob SHA, last commit date, and content mode;
  - removes oversized Drive roadmap mirrors from instruction selection;
  - fails closed for missing, unexpected, or non-full selected parts;
  - forces `BLOCKED` when required write capabilities are not verified.

## Checks

- `node scripts/validate-roadmap-chunks.cjs` — passed.
- All ten parts are below 20,000 characters.
- Both indexes are below 8,000 characters and link all five parts.
- `git diff --check` — passed.
- All seven edited n8n node configurations passed isolated schema validation.
- `AUTO106` selective-retrieval fixture — passed with two indexes, four parts, no unexpected parts, and `context_complete: true`.
- Completion guards — passed: incomplete fresh context and unverified `AUTO106` write capabilities both normalize to `BLOCKED`.
- Deterministic report enrichment — passed with exact roadmap paths, Git blob SHAs, last-commit dates, and content modes.
- Generated SSH retrieval command passed `bash -n`.
- Targeted ESLint was not run because dependencies are not installed in the clean worktree and pnpm could not initialize its default data directory in the restricted runtime.

## Risks

- The GitHub files do not exist on `main` until a reviewed commit and merge.
- The n8n draft must not be published before the GitHub chunk files are available on `main`.
- A read-only `AUTO106` execution must remain `BLOCKED` for ClickUp and Drive artifact writes that the current branch cannot verify.
- Existing unrelated workflow validation warnings remain outside this bounded patch.

## Not touched

- No commit, push, pull request, merge, or deployment was created.
- The active n8n version `fbaf90d0-9d49-4f5f-a96e-d09bc2e7e424` was not replaced.
- No ClickUp task, Google Drive source document, production credential, schedule, or repository `main` content was changed.

## Next step

Review the local patch. After explicit authorization, create a commit and reviewed pull request. Publish n8n draft `957f32c8-a885-4d4e-be97-449dfad6f233` only after the chunk files are merged to `main`, then run one read-only Archivist acceptance execution.
