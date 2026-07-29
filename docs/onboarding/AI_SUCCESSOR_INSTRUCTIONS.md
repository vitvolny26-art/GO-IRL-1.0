---
title: AI Successor Instructions
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-26
next_review: 2026-08-26
---

# AI Successor Instructions

## Purpose

This document is a thin bootstrap for a successor AI working on GO IRL 1.0. It does not duplicate the complete AI Instructions OS.

The successor must load current evidence and indexed instructions before acting. Chat history, remembered workflow IDs, raw Drive links, and historical reports are not sufficient context.

## Current project state

GO IRL is a Telegram Mini App for creating and joining real-life activities.

Mission:

> Less scrolling. More living.

Current lifecycle phase:

- Closed Beta was completed on 2026-07-20.
- The current phase is Release Preparation and focused post-beta stabilization.
- Broad public launch is not yet claimed.
- The proven Olomouc event loop remains the release baseline.
- The former six-category beta taxonomy is historical acceptance evidence, not an active phase restriction.
- New categories, verticals, or scope still require an explicit reviewed product decision.

Read `docs/release/CURRENT_PHASE.md` for the current phase decision and `README.md` for implemented scope.

## Authority order

Use this precedence:

1. Verified runtime evidence and current GitHub `main`.
2. Active GitHub governance and source-of-truth documents.
3. Active Google Drive AI Instructions selected through `00 — AI Instructions Index`, provided they do not conflict with GitHub.
4. Verified ClickUp operational state.
5. Draft, advisory, stale, legacy, archived, and historical material.

GitHub `main` controls code, runtime reality, schemas, migrations, tests, and durable technical documentation.

Google Drive contains the indexed AI operating system and working knowledge artifacts. A Drive file title, folder listing, URL, or chat summary is not document content; fetch the current content before relying on it.

Mutable n8n workflow IDs, schedules, and destinations belong in `docs/automation/DOCUMENTATION_GOVERNANCE_ARCHIVIST.md` and verified runtime evidence. Do not copy remembered identifiers into a new task.

## Required startup sequence

Begin every new work chat in strict read-only mode.

1. Inspect current GitHub `main`, relevant runtime evidence, and current open pull requests.
2. Read the relevant source-of-truth files from `DOCS_INDEX.md`.
3. Load the Google Drive spreadsheet `00 — AI Instructions Index`:
   - Spreadsheet ID: `1KiJurvyNV0Ixu6aXp2tlPtOMqCO7Q1dvwQ3ebs40pVg`.
4. Resolve only Active rows in this order:
   - `Always`;
   - `Bootstrap`;
   - exactly one matching `Role match`;
   - matching `Task match`;
   - `On demand` only when required.
5. Fetch the actual current content for every selected document.
6. Refresh the relevant Drive roadmap, latest agent report, and ClickUp state.
7. Select one primary role and ask only:

```text
Based on the current state, I should continue as <role>. Confirm?
```

Before role confirmation, do not modify GitHub, Google Drive, ClickUp, n8n, Vercel, Supabase, production configuration, or production data.

If the Index or mandatory role contract cannot be read, return `Blocked`. Do not fall back to legacy prompts or memory.

## Required repository reading

Select only documents relevant to the active task. Common starting points are:

1. `DOCS_INDEX.md`
2. `docs/release/CURRENT_PHASE.md`
3. `README.md`
4. `ROADMAP.md`
5. `BACKLOG.md`
6. `docs/audit/KNOWLEDGE_DEBT.md`
7. relevant governance, release, architecture, or role documents

Do not load the entire repository when bounded retrieval is sufficient.

## Work rules

- Respond to the owner in Russian unless explicitly asked otherwise.
- Use one primary role and one active task at a time.
- Do not ask again for information already present in current sources.
- Do not rewrite architecture or expand product scope without approval.
- Inspect all usages before editing.
- Use `pnpm` only.
- Do not force push or enable automatic merge.
- Never commit `node_modules`, `dist`, `package-lock.json`, backups, secrets, or local exports.
- Never claim success from tool acceptance alone; reread changed external objects or inspect equivalent evidence.
- A pending CI run is not a result. Check the same commit SHA until the run reaches a terminal state.

After role confirmation, use:

```text
Fix:
Analysis:
Where:
Run:
Check:
If green:
If red:
```

Use at most one short command block and report commands or automation actually executed.

## Approval gates

Explicit owner approval is required before:

- merge;
- production deployment or production configuration changes;
- auth or secret changes;
- Supabase RLS changes;
- SQL execution or migrations;
- production-data changes;
- destructive deletion.

Branch creation, bounded edits, commits, and a reviewable pull request are allowed after role confirmation when they stay inside the approved task scope.

## Verification

For code or configuration changes, run the required checks on the same commit:

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test
```

For documentation-only changes, validate the complete diff, metadata, links, source-of-truth alignment, and CI. State clearly when application checks are not applicable. A non-draft pull request must not be presented as ready while required checks are red or unknown.

## Completion and evidence

Use `Completed` only when:

- mandatory sources were inspected;
- requested changes are present;
- required checks are green or explicitly not applicable under current policy;
- blockers are empty;
- strong claims have `Claim | Evidence | Scope` support;
- changed external objects were reread or otherwise verified;
- a durable report, task, branch, commit, or pull request reference exists.

Otherwise use `Draft`, `Partial`, or `Blocked`.

## Handoff

A durable handoff must record:

- confirmed role;
- exact active task;
- current `main` and task commit SHAs;
- sources inspected;
- files and systems changed;
- checks and CI state;
- branch and pull request references;
- report ID or URL when applicable;
- blockers;
- next action;
- prohibited actions and approval gates.

Chat summary alone is not a durable handoff.
