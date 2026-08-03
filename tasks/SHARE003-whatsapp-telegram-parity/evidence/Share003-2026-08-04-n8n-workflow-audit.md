---
title: Share003 n8n Workflow Audit Evidence
owner: n8n Automation Engineer / AI Fixer
status: Verified
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Share003- n8n workflow audit

## Scope

Read-only audit of the organic WhatsApp flow:

`GO IRL share action -> wa.me intent -> public event-preview URL -> WhatsApp-generated link preview`

No workflow was changed or executed. No webhook was called. No credential values or production payloads were read.

## Sources inspected

- Live n8n inventory: 34 current workflows, five active.
- Required keyword searches in workflow metadata.
- Full node/configuration details for all five active workflows.
- Full details for the only deployment/Vercel candidate: `6khfY6PmKkIVB9Qv`.
- Latest 200 execution metadata records from 3,136 records; no payload data.
- Repository branch `fix/share003-whatsapp-telegram-parity-20260803` and PR #608.
- `src/cardShare.ts` at the branch head.

## Former blocker

`B6RqcoG2DEDRYlAT` / `GovKit Agent Deployment` is absent from the current 34-workflow inventory. Exact ID and name searches return zero results. This removes the prior stale-inventory blocker; no claim is made about whether it was deleted or archived.

## Keyword results

Metadata searches returned no workflows for `Share003`, `SHARE003`, `WhatsApp`, `wa.me`, `event-preview`, `event sharing`, `Meta`, `Open Graph`, `Telegram share`, or `social sharing`.

This was not used alone as proof. All active workflows and the deployment/Vercel candidate were inspected at node level.

## Relevant workflow inspection

| ID | Name | Status | Trigger | Relevant behavior | Credential references | Share003 conclusion |
|---|---|---|---|---|---|---|
| `ulCZrP3Ci0YJy1TY` | GO IRL — Unified Production Orchestrator — Index Resolver Pilot | active | governance/orchestrator triggers | Repository/document governance; no WhatsApp, Meta, preview or share path | none relevant | unrelated |
| `GgNDCkn0ppU7VJJq` | GO IRL — Chief Archivist Read-Only | active | chat trigger | Sealed read-only AI review; no source-write or sharing nodes | none relevant | unrelated |
| `925CFxQK2lRRIWwa` | GO IRL ChatGPT Bridge | active | private webhook/chat bridge | Archivist request/response bridge; no event-sharing API | none relevant | unrelated |
| `qrUBzEfnj1K9myQJ` | DZ 6 — Call Analytics Agent | active | hosted chat trigger | Call-statistics agent calling `iL1g1ZZFPhRpVRPx` | OpenRouter reference only; no values read | unrelated |
| `iL1g1ZZFPhRpVRPx` | DZ 6 — Get call stats | active | Execute Workflow Trigger | Reads call-analysis table and returns aggregate statistics | none relevant | unrelated |
| `6khfY6PmKkIVB9Qv` | GO IRL VPS + Vercel Deploy | inactive | manual trigger in current version | Deploys repository main and invokes a Vercel deploy hook. It does not receive, transform, shorten or generate event-share URLs. | SSH credential reference exists; name/value not copied | related to deployment, not required at runtime |

No current workflow sends WhatsApp Business/Cloud API messages, calls `wa.me`, generates Open Graph event cards, replaces `/api/meta/event-preview`, changes share localization/image/cache behavior, or intercepts an ordinary share action.

## Execution metadata

Latest 200 records contain executions only for:

- `ulCZrP3Ci0YJy1TY` — governance/orchestrator activity;
- `6khfY6PmKkIVB9Qv` — historical deployment runs.

Representative redacted metadata:

| Execution ID | Timestamp UTC | Status | Workflow ID | Summary |
|---|---|---|---|---|
| `7920` | 2026-08-03T23:25:18.233Z | success | `ulCZrP3Ci0YJy1TY` | governance trigger; no payload inspected |
| `7897` | 2026-08-03T22:59:49.751Z | success | `6khfY6PmKkIVB9Qv` | deployment run; no payload inspected |
| `7876` | 2026-08-03T21:57:30.822Z | success | `6khfY6PmKkIVB9Qv` | historical webhook-mode deployment run; current workflow is inactive/manual |

No execution maps to Share003, WhatsApp delivery, preview generation, URL transformation, localization, card-image generation or cache control.

## Repository runtime evidence

`src/cardShare.ts` constructs the WhatsApp target directly as `https://wa.me/?text=...`. The text contains the public URL built by `buildMetaEventPreviewUrl()`, which resolves to `/api/meta/event-preview?event=<uuid>&language=<language>`. No n8n URL or webhook appears in this path.

## Required checks

| Check | Result |
|---|---|
| n8n substitutes or shortens event-preview URL | No |
| n8n sends through WhatsApp Business/Cloud API | No |
| n8n generates the card instead of `/api/meta/event-preview` | No |
| ordinary `wa.me` sharing calls a production n8n webhook | No |
| active workflow can change Share003 behavior after merge | No |
| duplicate/stale social-sharing automation exists | No current workflow found |

## Conclusion

**Result A — n8n is not a runtime dependency of Share003.**

The verified path is frontend share construction -> direct `wa.me` intent -> public `/api/meta/event-preview` URL -> WhatsApp-generated preview. The inactive deployment workflow can publish repository code but is not part of an individual share request.

## Remaining gate

Physical WhatsApp verification on Android, iOS and Web/Desktop remains separate from this n8n dependency result.