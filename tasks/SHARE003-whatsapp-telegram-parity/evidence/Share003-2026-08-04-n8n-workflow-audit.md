---
title: Share003 n8n Workflow Audit Evidence
date: 2026-08-04
owner: n8n Automation Engineer / AI Fixer
status: Blocked
source_of_truth: false
---

# Share003 — n8n workflow audit evidence

## Scope

Read-only verification of whether n8n is a runtime dependency of organic WhatsApp sharing:

`GO IRL share action -> wa.me intent -> public event-preview URL -> WhatsApp-generated link preview`

No workflow was edited, activated, deactivated, executed, or tested. No production webhook was called. No credential value, token, phone number, WABA ID, raw personal data, or raw production payload was read or stored.

## Repository reference

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Branch: `fix/share003-whatsapp-telegram-parity-20260803`
- Verified starting head: `4ced0fbfe5a667174ae829f4073e3c58dd96a240`
- Branch comparison result before evidence commit: identical to the stated head
- Draft PR reference: `#608`
- ClickUp reference: `869e3k1v5`

## n8n inventory and metadata search

The read-only n8n inventory returned 34 workflows. Exact workflow metadata searches returned zero matches for:

- `Share003`
- `SHARE003`
- `WhatsApp`
- `wa.me`
- `event-preview`
- `event sharing`
- `Meta`
- `Open Graph`
- `Telegram share`
- `social sharing`

These zero-result searches are not treated as proof of absence because the search endpoint covers workflow metadata and does not prove that node parameters are free of those terms.

## Workflows inspected before blocker

| Workflow ID | Name | Status | Trigger / webhook | Relevant nodes and external calls | Credential references | Share003 relationship | Conclusion |
|---|---|---|---|---|---|---|---|
| `925CFxQK2lRRIWwa` | GO IRL ChatGPT Bridge | active | Webhook; path `go-irl-archivist` | Receives an archivist mission, invokes the Chief Archivist workflow, returns an archivist response; Google Drive/Docs-related handling | Credential object names were not recorded; no values were read | No verified WhatsApp, Meta, `wa.me`, event-preview, Open Graph, share-card, localization, or cache path | `unrelated` |
| `GgNDCkn0ppU7VJJq` | GO IRL Chief Archivist | active | Execute Workflow Trigger; no public Share003 webhook identified | Google Drive, Google Docs, GitHub API, ClickUp API, Telegram report delivery | Credential object names were not recorded; no values were read | Documentation/report orchestration only; no verified organic share runtime path | `unrelated` |
| `ulCZrP3Ci0YJy1TY` | GO IRL Orchestrator Telegram | active | Telegram Trigger | Authorizes a Telegram command, builds an archivist payload, invokes Chief Archivist, sends a Telegram response | Credential object names were not recorded; no values were read | Telegram control/report workflow, not Telegram or WhatsApp event sharing | `unrelated` |
| `B6RqcoG2DEDRYlAT` | GovKit Agent Deployment | active in inventory | Not verifiable | Workflow details request returned `Workflow not found or you don't have permission to access it.` | Not inspected | Cannot determine whether node parameters or runtime calls affect Share003 | `not verified` |
| `iL1g1ZZFPhRpVRPx` | Generate n8n Workflow Stats Report | active in inventory | Not fully inspected because audit stopped at the access blocker | Not fully inspected | Not inspected | Not determined | `not verified` |

The remaining inventory entries were not fully inspected after the required stop condition was reached.

## Executions inspected

None. Execution metadata inspection was not started after the active-workflow access failure. No raw execution payload was requested.

## Required verification status

| Required check | Status |
|---|---|
| Workflow substitutes or shortens the event-preview URL | Not fully verified |
| Workflow sends WhatsApp messages through Business/Cloud API | Not fully verified |
| Workflow generates the card instead of `api/meta/event-preview` | Not fully verified |
| Workflow invokes a production webhook during ordinary `wa.me` sharing | Not fully verified |
| Active workflow can change Share003 behavior after merge | Not fully verified |
| Duplicate or stale social-sharing automation exists | Not fully verified |
| Share003 execution records exist | Not verified |

## Runtime dependency conclusion

No Result A or Result B is asserted.

The three fully inspected active GO IRL workflows above are unrelated to organic WhatsApp sharing. However, the full n8n estate could not be verified because an active workflow returned by the inventory could not be opened. Therefore absence of an n8n runtime dependency is not established.

## Blocker

`B6RqcoG2DEDRYlAT` was returned as active by the n8n workflow inventory, but `get_workflow_details` returned:

`Workflow not found or you don't have permission to access it.`

This is an access or inventory-consistency blocker. Per the audit stop rule, verification stopped without inspecting executions or declaring Result A/B.

## Next verified step

Restore read access to `B6RqcoG2DEDRYlAT`, or confirm through n8n administration that the inventory entry is stale and no longer reachable. Then rerun the complete read-only workflow-node and execution-metadata audit from the beginning before drawing a Share003 runtime conclusion.
