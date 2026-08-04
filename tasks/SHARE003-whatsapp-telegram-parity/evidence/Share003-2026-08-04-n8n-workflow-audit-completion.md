---
title: Share003 n8n Workflow Audit Completion Evidence
owner: n8n Administrator / Automation Engineer
status: Verified
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Share003- n8n workflow audit completion

## Scope and safety

Read-only verification of the organic Share003 runtime:

`GO IRL share action -> wa.me -> public event-preview URL -> WhatsApp-generated preview`

No workflow was edited, activated, deactivated, restored, published, executed, or tested. No production webhook was called. No credential value, token, phone number, WABA ID, personal data, raw execution payload, or deploy-hook value is stored here.

## Sources inspected

- Current n8n workflow inventory: 34 workflows.
- Full node, connection, expression, URL and code summaries for all 34 current workflows.
- Current accessible-project inventory.
- Exact workflow lookup and version-history lookup for the former blocker `B6RqcoG2DEDRYlAT`.
- Current and historical metadata for deployment workflow `6khfY6PmKkIVB9Qv`.
- Latest 200 execution metadata records from 3,127 total records.
- Targeted execution metadata searches for all active workflows and workflows adjacent to deployment, images, Telegram, social media, webhooks or URL handling.
- Repository branch and Draft PR #608 metadata at starting head `3a7c287f6548f2f793e91bd9e36528d01e886742`.

## Permissions and former blocker

Current project inventory returned one accessible personal project and reported that team projects are disabled. The current full workflow inventory returned exactly 34 workflows and did not contain `B6RqcoG2DEDRYlAT` or `GovKit Agent Deployment`.

Exact responses:

- exact name search `GovKit Agent Deployment`: zero results;
- `get_workflow_details(B6RqcoG2DEDRYlAT)`: `Workflow not found or you don't have permission to access it.`;
- `get_workflow_history(B6RqcoG2DEDRYlAT)`: `Workflow not found or you don't have permission to access it.`.

Conclusion: the previous inventory record is verified as a **stale entry relative to the current authoritative inventory**. The evidence does not claim that the workflow was deleted, archived, or moved to another tenant.

## Keyword and runtime-path findings

Across all current workflow nodes, parameters, expressions, code and URLs, no runtime path was found for:

- `Share003` or `SHARE003`;
- WhatsApp or WhatsApp Cloud API;
- `wa.me`;
- `event-preview` or `api/meta/event-preview`;
- Open Graph generation;
- Meta/WABA message delivery;
- event-share URL shortening or replacement;
- event-preview localization;
- Share003 card-image generation;
- Share003 cache invalidation or refresh.

Telegram references belong to governance/report delivery, PR notifications, temporary tooling, or forensic webhook testing. They do not implement event sharing. Image workflows archive generic files or upload video and do not generate the event-preview card.

## Workflow inventory

| Workflow ID | Name | Status | Trigger | Relevant nodes | Share003 relation | Conclusion |
|---|---|---|---|---|---|---|
| `eBASy7Gazb19FJxP` | 1. ChatGPT Instruction Test Workflow | inactive | manual | Drive instruction/read-log nodes | Instruction test only | unrelated |
| `BSjN26d6xSnqvdhb` | 2. ChatGPT Tool-Call Test Workflow | inactive | manual | Drive, GitHub and ClickUp test nodes | Tool-call test only | unrelated |
| `NYFa18bA4zvpJlxN` | DZ6 · Post-Call Processing | inactive | subworkflow | transcript, metrics, sentiment and follow-up nodes | Third-party call analytics | unrelated |
| `qrUBzEfnj1K9myQJ` | DZ6 · Twilio Inbound Voice | active | webhook | inbound voice and recording-status handling | Third-party voice IVR; no GO IRL sharing | unrelated |
| `iL1g1ZZFPhRpVRPx` | Generate n8n Workflow Stats Report | active | manual | n8n inventory, Markdown and Drive report nodes | n8n reporting only | unrelated |
| `Jfby1HzWsJe1tUMC` | GO IRL :: PR Ready Automation | inactive | manual | GitHub compare/checks, ClickUp, Telegram notification | Release coordination, not runtime | unrelated |
| `gtn0P4CPkcihz6Lh` | GO IRL :: PR Review Importer v1.1 | inactive | manual | GitHub reviews, Drive and ClickUp import | Review archive only | unrelated |
| `ot1NwNlcqD0vOHrn` | GO IRL ChatGPT Bridge | inactive | webhook | chat input and text response | AI bridge only | unrelated |
| `925CFxQK2lRRIWwa` | GO IRL ChatGPT Bridge (Private) | active | chat trigger | mission parser, AI Review Dispatcher call, text response | AI review bridge; no frontend/API/Meta call | unrelated |
| `w0OKeqgx4uvkcn0S` | GO IRL Image Archive | inactive | form | image download/decode and Drive upload | Generic archive; no event card generation | unrelated |
| `3mXqggCBVrxBEq4c` | GO IRL v2.0 :: AI Review Dispatcher | inactive | subworkflow | AI provider dispatch, Drive and ClickUp report nodes | Review generation only | unrelated |
| `pUZlajxtd0r1uES4` | Import GO IRL Agent Report to GitHub | inactive | manual | Drive download and GitHub file creation | Documentation import | unrelated |
| `OXLNo7ggsjMHFHkw` | Instruction Test v1.2:: GO IRL | Fixer AI | inactive | manual | instruction and repository-context nodes | Instruction test | unrelated |
| `qalhSsRKISTWMfGe` | Instruction Test v1.2:: GO IRL | QA | inactive | manual | instruction and repository-context nodes | Instruction test | unrelated |
| `oiB2RTVweDslsv21` | Instruction Test v1.2:: GO IRL | Successor ChatGPT | inactive | manual | instruction and repository-context nodes | Instruction test | unrelated |
| `AI2y3dk52KMCkoTx` | Instruction Test:: GO IRL | Claude | inactive | manual | instruction and repository-context nodes | Instruction test | unrelated |
| `VwRfdkT6YfSFOpeY` | PR Ready Test (cloned) | inactive | manual | GitHub checks, Drive, ClickUp and Telegram | Release test only | unrelated |
| `5UYbNu6BNXWI91Wu` | PR Ready Test (cloned) | inactive | manual | GitHub checks, Drive, ClickUp and Telegram | Release test only | unrelated |
| `qfIw38TVWoEjRcjn` | PR Ready Test (cloned) | inactive | manual | GitHub checks, Drive, ClickUp and Telegram | Release test only | unrelated |
| `5TqONQKs7W4cto2d` | PR Ready Test (cloned) | inactive | manual | GitHub checks, Drive, ClickUp and Telegram | Release test only | unrelated |
| `PYrCW7BWzB8YhGLh` | PR Ready Test (cloned) | inactive | manual | GitHub checks, Drive, ClickUp and Telegram | Release test only | unrelated |
| `7Q6R9bOGeRZObsW7` | Temporary Execute Workflow with Inputs to google drive, github, clickup | inactive | subworkflow | Drive, GitHub and ClickUp forwarding | Temporary coordination | unrelated |
| `SY3QyZ10ynrS1mJm` | Temporary Execute Workflow with Inputs to google drive, github, clickup | inactive | subworkflow | Drive, GitHub and ClickUp forwarding | Temporary coordination | unrelated |
| `KWtip0sqAemBJCfk` | Temporary Execute Workflow with Inputs to google drive, github, clickup | inactive | subworkflow | Drive, GitHub and ClickUp forwarding | Temporary coordination | unrelated |
| `mAPCggOpdwrJcGPw` | Temporary Execute Workflow with Inputs to google drive, github, clickup | inactive | subworkflow | Drive, GitHub and ClickUp forwarding | Temporary coordination | unrelated |
| `eja9p4FLuCaoaOFd` | Temporary Execute Workflow with Inputs to google drive, github, clickup | inactive | subworkflow | Drive, GitHub and ClickUp forwarding | Temporary coordination | unrelated |
| `ECVvFGqnblCFQ8E7` | Temporary Scratch Workflow | inactive | manual | empty/scratch path | No runtime function | unrelated |
| `9rq39mFfmQf7OyKu` | Temporary Workflow | inactive | manual | Docs, GitHub, ClickUp and Telegram | Temporary coordination | unrelated |
| `6khfY6PmKkIVB9Qv` | GO IRL VPS + Vercel Deploy | inactive | manual; historical temporary webhook removed | SSH production deployment and Vercel deploy-hook call | Can deploy repository main, but does not build or intercept share URLs; current workflow is inactive and has no running execution | related but not required |
| `E6DzQJzxh8ovUTqQ` | Temporary Workflow | inactive | webhook | video download, YouTube upload and response | Social-video upload, not event sharing | unrelated |
| `nrLABrUWs7CrQ1QK` | Workflow, Webhook (forensic) | inactive | webhook | request-method/query/body echo | Forensic Telegram endpoint test only | unrelated |
| `8pMz3FbjLddb2kvd` | WrikeAI Archive | inactive | schedule | Supabase archive batch and Drive CSV nodes | External archive workflow | unrelated |
| `GgNDCkn0ppU7VJJq` | Вызов основного рабочего процесса | active | webhook and subworkflow | invokes Chief Archivist and returns public message | Governance/archivist bridge | unrelated |
| `ulCZrP3Ci0YJy1TY` | GO IRL - Chief Archivist | active | subworkflow | validation, Drive, Docs, GitHub, ClickUp, AI gate and Telegram report nodes | Governance/archive workflow; no share runtime | unrelated |

All five currently active workflows are inspectable and unrelated to Share003.

## Credential references

No Share003-related workflow or credential object was found. Credential values and exports were not requested. Credential references belonging to unrelated workflows were not copied into this evidence.

## Execution metadata inspected

No execution data payload was retrieved. The audit inspected the latest 200 metadata records plus targeted metadata searches. Targeted counts included:

- `6khfY6PmKkIVB9Qv`: 145 records;
- `E6DzQJzxh8ovUTqQ`: 2 records;
- `nrLABrUWs7CrQ1QK`: 6 records;
- `w0OKeqgx4uvkcn0S`: 13 records;
- `qrUBzEfnj1K9myQJ`: 2 records;
- `925CFxQK2lRRIWwa`: 0 records;
- `iL1g1ZZFPhRpVRPx`: 2 records;
- `GgNDCkn0ppU7VJJq`: 0 records;
- `ulCZrP3Ci0YJy1TY`: latest 20 records sampled from 2,872 metadata records.

Representative redacted records:

| Execution ID | Workflow ID | Timestamp UTC | Status | Trigger type | Redacted summary |
|---|---|---|---|---|---|
| `7896` | `6khfY6PmKkIVB9Qv` | 2026-08-03T22:56:35.846Z | success | trigger | Historical deployment automation; completed at 22:59:49.684Z; no payload inspected |
| `7876` | `6khfY6PmKkIVB9Qv` | 2026-08-03T21:57:30.822Z | success | webhook | Historical temporary deployment webhook; endpoint redacted and removed from current version |
| `7874` | `6khfY6PmKkIVB9Qv` | 2026-08-03T21:53:53.710Z | success | webhook | Historical temporary deployment webhook; not event sharing |
| `7222` | `E6DzQJzxh8ovUTqQ` | 2026-08-02T09:13:35.634Z | success | manual | Video-upload test; no raw input/output inspected |
| `6054` | `nrLABrUWs7CrQ1QK` | 2026-07-30T18:27:22.522Z | success | manual | Forensic webhook test; no raw request inspected |
| `7233` | `w0OKeqgx4uvkcn0S` | 2026-08-02T09:34:23.469Z | success | manual | Generic image archive test |
| `5100` | `qrUBzEfnj1K9myQJ` | 2026-07-28T14:58:37.560Z | success | manual | Twilio IVR test |
| `5101` | `iL1g1ZZFPhRpVRPx` | 2026-07-28T14:58:39.181Z | success | integrated | n8n statistics report |
| `7890` | `ulCZrP3Ci0YJy1TY` | 2026-08-03T22:33:28.945Z | success | trigger | Archivist/governance execution |

No execution metadata mapped to an event-sharing, WhatsApp, preview-generation, URL-transformation, Meta, share-card image, localization or cache-refresh workflow.

## Required verification results

| Check | Result |
|---|---|
| Event-preview URL substituted or shortened by n8n | No |
| WhatsApp Business/Cloud API message send | No |
| Card generated instead of `api/meta/event-preview` | No |
| Production webhook invoked by ordinary `wa.me` sharing | No |
| Active workflow can alter Share003 behavior after merge | No |
| Duplicate or stale social-sharing automation | No |
| Current unfinished execution can affect Share003 | No |

## Conclusion

**Result A — n8n is not a Share003 runtime dependency.**

The verified runtime remains frontend/API construction of one public event-preview URL, direct `wa.me` intent, and WhatsApp-generated preview. n8n does not sit between the Share action and WhatsApp and does not mutate Share003 URL, language, card image, cache behavior or message delivery.

## Remaining non-n8n gate

Physical WhatsApp verification on Android, iOS and Web/Desktop remains pending and is independent of this dependency result. PR #608 must remain Draft until the remaining task gates are satisfied.