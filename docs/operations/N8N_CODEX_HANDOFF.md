---
title: GO IRL n8n Codex Handoff
owner: Technical Archivist
status: Draft
source_of_truth: true
last_review: 2026-07-17
next_review: 2026-07-24
---

# GO IRL n8n Codex Handoff

## Mission

Inspect, complete, and safely validate the existing GO IRL AI Archivist workflow in n8n. Do not rebuild it from scratch unless the current structure is unusable.

## Access

- n8n: https://n8n.realitka.pp.ua
- Workflow: https://n8n.realitka.pp.ua/workflow/ot1NwNlcqD0vOHrn
- Workflow name: `GO IRL AI Archivist`
- Workflow ID: `ot1NwNlcqD0vOHrn`
- Timezone: `Europe/Prague`
- Repository: https://github.com/vitvolny26-art/GO-IRL-1.0
- Active PR: https://github.com/vitvolny26-art/GO-IRL-1.0/pull/153
- Branch: `chore/codex-runner-smoke`

## Authority model

- GitHub is the only durable source of truth.
- Google Drive is an export and review mirror only.
- NotebookLM is passive search and Q&A over exports.
- Gemini produces draft reports only.
- ClickUp tracks operations and review state only.
- n8n performs orchestration only and cannot approve governance changes.

Every Drive export must contain:

```yaml
source_of_truth: false
```

## Operating principle

The workflow has two separate controlled runs.

### 01:00 revision run

Purpose:

- read canonical GitHub documentation;
- inspect Drive exports;
- compare titles, file IDs, timestamps, content state, and authority flags;
- detect stale files, duplicates, contradictions, and missing exports;
- generate a Draft report;
- save it to `AI Reports/Inbox`;
- create or update ClickUp review evidence;
- notify the owner.

This run must not publish changes automatically.

### 13:00 approved synchronization run

Purpose:

- process only explicitly approved review items;
- fetch canonical GitHub content;
- update matching Drive files in place;
- preserve existing Drive file IDs whenever possible;
- verify folder, title, content, and `source_of_truth: false`;
- update ClickUp evidence;
- notify the owner.

## Drive rules

Before every write:

1. Search the target folder by exact title.
2. Compare all matches.
3. Identify the current active export.
4. Prefer update-in-place.
5. Preserve the Drive file ID.
6. Verify destination folder after writing.
7. Verify `source_of_truth: false`.
8. Record the result in the report.

When duplicates exist:

- never delete automatically;
- rename with a `LEGACY_` prefix;
- move to the `Legacy` folder;
- preserve the Drive file ID;
- record the action.

## Idempotency

The same input must not create duplicate reports, ClickUp tasks, or Drive exports.

Use a stable fingerprint derived from relevant inputs, for example:

- repository commit SHA;
- canonical file SHAs;
- Drive file IDs;
- Drive modified timestamps;
- normalized titles;
- approval state.

Store processed state in n8n static data, a small Google Sheet, or ClickUp metadata.

Do not rely only on modified timestamps.

## Report lifecycle

```text
AI Reports/Inbox
  -> human review
  -> Reviewed
```

or:

```text
AI Reports/Inbox
  -> human rejection
  -> Rejected
```

No automatic approval.

## Credentials

OpenRouter is connected.

Telegram, GitHub, Google Drive, Google Docs, ClickUp, and SSH credentials may still require server-side verification.

Use n8n credential objects only. Never store keys or tokens in workflow JSON, code nodes, prompts, logs, or reports.

## Safety boundaries

The workflow must never:

- auto-merge pull requests;
- force push;
- push application code automatically;
- modify `.env` or secrets;
- modify auth or Supabase RLS;
- execute destructive SQL;
- create or modify migrations;
- edit production data;
- edit `DOCS_INDEX.md` automatically;
- close Knowledge Debt automatically;
- complete governance tasks automatically;
- treat Drive, NotebookLM, ClickUp, Gemini, or n8n as authoritative.

## Repository boundaries

This is an orchestration task.

Do not modify application runtime or business logic.

Allowed areas:

- `n8n/`
- `docs/operations/`
- `docs/reports/`
- `scripts/`

Inspect existing usage before changing files.

## Required work

1. Inspect all workflow nodes, triggers, expressions, credentials, error paths, static data, Drive folder IDs, ClickUp references, Telegram nodes, and GitHub references.
2. Produce a node map with purpose, input, output, credential dependency, and failure behavior.
3. Confirm revision and approved-sync paths are separated.
4. Fix brittle expressions. Prefer normalized `$json` passed through shared nodes instead of hard dependencies on a specific earlier node name.
5. Implement idempotency.
6. Validate exact-title Drive search, update-in-place behavior, ID preservation, legacy handling, destination folders, and authority flags.
7. Validate statuses: `accepted`, `running`, `blocked`, `failed`, `completed`, and `no_material_change`.
8. Keep the workflow inactive during development.

## Manual test sequence

### Test 1: Dry revision

Expected:

- GitHub context fetched;
- Drive files listed;
- no Drive file changed;
- Draft result generated;
- no approval inferred.

### Test 2: No-change revision

Run the same input again.

Expected:

- no duplicate report;
- no duplicate ClickUp task;
- result is `no_material_change`.

### Test 3: Controlled stale export

Use one safe test document.

Expected:

- stale export detected;
- Draft report created;
- no automatic publication.

### Test 4: Approved synchronization

Use an explicitly approved test item.

Expected:

- existing Drive file updated in place;
- file ID preserved;
- `source_of_truth: false`;
- verification passes;
- owner notified.

### Test 5: Missing credential

Expected:

- workflow becomes `blocked`;
- no downstream write;
- no false success notification.

## Deliverables

Create or update:

- `n8n/workflows/go-irl-ai-archivist.json`
- `docs/operations/N8N_ARCHIVIST_WORKFLOW.md`
- `docs/reports/2026-07-17-agent-report-n8n-archivist.md`

The workflow export must be importable, inactive, free of credentials and API keys, and preserve existing node names and structure where reasonable.

## Final response format

```text
Fix:
Analysis:
Where:
Run:
Check:
If green:
If red:
```

Do not activate the workflow automatically. Do not merge or push without explicit approval.
