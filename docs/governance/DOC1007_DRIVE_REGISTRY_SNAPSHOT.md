---
title: Drive Registry Snapshot
owner: Project Archivist
status: Draft
source_of_truth: false
work_id: DOC1007
last_review: 2026-07-18
next_review: 2026-07-25
---

# Drive Registry Snapshot

## Summary

Pass 1 inventory contains 149 records.

| Classification | Count |
|---|---:|
| KEEP | 62 |
| MOVE | 10 |
| ARCHIVE | 4 |
| DELETE_CANDIDATE | 5 |
| REVIEW | 68 |

No cleanup mutation is authorized by this snapshot.

## Critical current records

| Item | Drive ID | Classification | Mirror status | Required action |
|---|---|---|---|---|
| Event Card | `1NzuG5Zm5SRRrVudToz4Cnp3bD5cISkre` | KEEP | NotApplicable | Retain in current location. |
| Event Avatars | `1ekzNVzncVxInq7RaD7ZaU3iT7fIopYfg` | KEEP | NotApplicable | Retain in current location. |
| ARCHIVIST_CHARTER | `1xrxgQM4CFIYY0UE4LmWkiKkeaoK0i1vyF7zfDTGb0ZM` | KEEP | Current | Preserve current ID and location. |
| ARCHIVIST_OPERATING_POLICY | `1XFCEEczYolye1Mhip647ljF21XjV9-ejHfF4Rk1ohy8` | KEEP | Current | Preserve current ID and location. |
| Deep audit canonical copy | `10--eBdkCzxHce9PpfibOzcLjEEkaNS6wx_cJp8ZFdsQ` | KEEP | NotApplicable | Retain canonical copy. |
| Deep audit duplicate | `1DrsDbTyYYEnG8YJoX2oNeVNPTvUhj4KWf1zK6Shi9g4` | DELETE_CANDIDATE | NotApplicable | Do not delete without explicit approval. |
| n8n dry-run canonical report | `16n_FYhbxzwZXClD8PbEsveaFEJdWCopz` | KEEP | NotApplicable | Retain canonical copy. |
| n8n dry-run duplicate report | `1Y161oQIUfNYhcziB0Ad1EMCfiBiUY8aV` | DELETE_CANDIDATE | NotApplicable | Do not delete without explicit approval. |

## Unresolved categories

`REVIEW` distribution:

- Media Assets: 46
- Reports: 7
- NotebookLM Exports: 5
- Automation & n8n: 4
- GO IRL DOC: 3
- Plans & Roadmaps: 2
- AI System Prompts: 1

Other queued classifications:

- `MOVE`: 10 items under `AI Reports`
- `ARCHIVE`: 3 items under `GO IRL DOC`, 1 item under `Archive`
- `DELETE_CANDIDATE`: 3 items under `AI Reports`, 2 items under `Media Assets`

## Safety gates

- `REVIEW` items cannot be mutated automatically.
- `DELETE_CANDIDATE` items cannot be permanently deleted automatically.
- `Event Card` and `Event Avatars` cannot be moved, renamed, archived, or deleted without a new explicit user decision.
- Drive mirrors cannot become project authority.
- NotebookLM publication requires merged provenance and current mirror status.
