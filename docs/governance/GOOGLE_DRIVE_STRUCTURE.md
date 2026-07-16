---
title: Google Drive Structure
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-16
next_review: 2026-07-23
---

# Google Drive Structure

GitHub is the source of truth. Google Drive is an export and reporting workspace.

## Canonical paths

- Project root: `Go IRL/`
- Export mirror: `Go IRL/GO IRL DOC/`
- AI reports: `Go IRL/AI Reports/`
- Report inbox: `Go IRL/AI Reports/Inbox/`

## Rules

- GO IRL operational folders must not remain at Drive root.
- `GO IRL DOC` contains export-mirror content only.
- `AI Reports` is a sibling of `GO IRL DOC` under `Go IRL`.
- n8n must use these canonical paths.
- AI reports are drafts until reviewed.
- Drive content never overrides GitHub.
- No automatic merge, source-of-truth edit, or Knowledge Debt closure.
