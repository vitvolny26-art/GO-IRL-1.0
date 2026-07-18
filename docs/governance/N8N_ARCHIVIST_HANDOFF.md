---
title: n8n Archivist Handoff
owner: Project Archivist
status: Draft
source_of_truth: false
work_id: DOC1007
last_review: 2026-07-18
next_review: 2026-07-25
---

# n8n Archivist Handoff

## Purpose

Transfer the controlled Drive documentation state to the persistent n8n Archivist. GitHub `main` remains the only source of truth. This file is an operational handoff, not project authority.

## Current authority model

- GitHub: source of truth for code and durable documentation.
- Google Drive: governed mirror, report intake, review workspace, and export storage.
- ClickUp: operational tracking and human review state.
- NotebookLM: passive search and Q&A over approved exports.
- n8n: orchestration only. It cannot approve governance changes.

## Current source state

- Last completed documentation work ID: `DOC1006`.
- Current handoff work ID: `DOC1007`.
- Next available work ID after merge: `DOC1008`.
- Current GitHub source commit before this handoff: `3b89ef84a784a49997e2e6121be7e503fb9c79ee`.
- Persistent ClickUp task: `Documentation Governance / Archivist`.
- ClickUp task ID: `869e39yxm`.
- ClickUp URL: `https://app.clickup.com/t/869e39yxm`.

## Approved Drive structure

Canonical root: `My Drive / Go IRL`.

Approved top-level folders:

- `GO IRL DOC`
- `AI Reports`
- `Reports`
- `NotebookLM Exports`
- `Plans & Roadmaps`
- `Automation & n8n`
- `Media Assets`
- `AI System Prompts`
- `Archive`

## Inventory registry

Pass 1 contains 149 records. Current classification summary:

- `KEEP`: 62
- `MOVE`: 10
- `ARCHIVE`: 4
- `DELETE_CANDIDATE`: 5
- `REVIEW`: 68

The full CSV remains a generated working artifact. The durable critical-state snapshot is stored in `docs/governance/DOC1007_DRIVE_REGISTRY_SNAPSHOT.md`.

## Confirmed retained items

The following Drive folders are explicitly retained in their current locations:

- `Event Card` — Drive ID `1NzuG5Zm5SRRrVudToz4Cnp3bD5cISkre`
- `Event Avatars` — Drive ID `1ekzNVzncVxInq7RaD7ZaU3iT7fIopYfg`

Both are `KEEP`. Do not move, rename, archive, or delete them without a new explicit human decision.

## Current governance mirrors

The following Google Docs were refreshed in place under `DOC1006` and are current mirrors of merged GitHub files:

- `ARCHIVIST_CHARTER`
  - Drive ID: `1xrxgQM4CFIYY0UE4LmWkiKkeaoK0i1vyF7zfDTGb0ZM`
  - source path: `docs/onboarding/ARCHIVIST_CHARTER.md`
  - mirror status: `Current`
- `ARCHIVIST_OPERATING_POLICY`
  - Drive ID: `1XFCEEczYolye1Mhip647ljF21XjV9-ejHfF4Rk1ohy8`
  - source path: `docs/governance/ARCHIVIST_OPERATING_POLICY.md`
  - mirror status: `Current`

Drive file IDs, names, and locations were preserved.

## Confirmed duplicate queue

Confirmed duplicate pair 1:

- keep: `10--eBdkCzxHce9PpfibOzcLjEEkaNS6wx_cJp8ZFdsQ`
- duplicate candidate: `1DrsDbTyYYEnG8YJoX2oNeVNPTvUhj4KWf1zK6Shi9g4`

Confirmed duplicate pair 2:

- keep: `16n_FYhbxzwZXClD8PbEsveaFEJdWCopz`
- duplicate candidate: `1Y161oQIUfNYhcziB0Ad1EMCfiBiUY8aV`

The duplicate copies remain `DELETE_CANDIDATE` only. Permanent deletion is not authorized.

## Unresolved work queue

- 68 items remain `REVIEW`.
- 10 advisory reports remain classified `MOVE`; no move has been executed.
- 4 historical items remain classified `ARCHIVE`; no archive action has been executed.
- 5 items remain `DELETE_CANDIDATE`; none may be deleted automatically.
- NotebookLM exports require freshness verification before publication or reuse.
- Remaining media assets may overlap by category but are not proven byte-identical duplicates.

## Allowed n8n actions

The persistent n8n Archivist may:

- read GitHub and Drive metadata;
- compare filenames, sizes, hashes, content fingerprints, and provenance;
- detect duplicate reports;
- update inventory evidence and review status;
- create Draft reports or GitHub Draft issues;
- move reviewed reports through approved report lifecycle folders only when the workflow has an explicit human-approved rule;
- notify the user through approved channels;
- log every action and source identifier.

## Prohibited n8n actions

The persistent n8n Archivist must not:

- merge pull requests;
- push application code;
- edit source-of-truth documentation directly;
- edit `DOCS_INDEX.md` automatically;
- close Knowledge Debt automatically;
- permanently delete Drive files;
- move, rename, archive, or delete `Event Card` or `Event Avatars`;
- publish Draft, Review, Stale, Rejected, Deprecated, or uncertain files to NotebookLM;
- modify `.env`, secrets, auth, Supabase RLS, destructive SQL, migrations, or production settings;
- treat Drive, ClickUp, NotebookLM, Gemini, or n8n as project authority;
- claim checks passed without evidence.

## Required processing gates

Before any Drive mutation:

1. Match the item to one registry record.
2. Confirm current Drive ID and parent folder.
3. Confirm the classification is not `REVIEW` or `DELETE_CANDIDATE`.
4. Confirm the canonical replacement and provenance.
5. Confirm the action is explicitly allowed by merged GitHub policy.
6. Confirm human approval when the action changes location, retention, or publication state.
7. Log the before and after state.

Before NotebookLM publication:

1. Source must be merged GitHub documentation or an approved reviewed report.
2. Provenance must be complete.
3. `mirror_status` must be `Current` or not applicable.
4. The file must not be Draft, Review, Rejected, Stale, Deprecated, or uncertain.
5. The export must contain no secrets, credentials, `.env` data, build output, dependency output, or unsafe schema material.

## Next single step

Review and merge `DOC1007`, then use this handoff and registry snapshot as the baseline for a non-destructive reconciliation run. The first reconciliation should report differences only; it must not perform cleanup mutations.
