---
title: GO IRL AI Developer Orchestra Operations Layer
owner: Project Coordinator
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# GO IRL AI Developer Orchestra — Operations Layer

## Purpose

This document configures the inactive n8n Operations Layer around the existing AI Developer Runtime.

```text
Telegram Mission
-> integration Mission Queue
-> ClickUp Mission mirror
-> mission-intake.cjs
-> bridge.cjs Runtime commands
-> Agent Report
-> Google Drive mirror
-> ClickUp update
-> export_refresh_required
-> Telegram result
```

GitHub `main` is the only source of truth. n8n stores integration state only. ClickUp and Google Drive are mirrors.

The workflow does not read Runtime state files, recreate the Runtime state machine, call a NotebookLM API, commit, push, create or merge a pull request, deploy, or activate itself.

## Files

- `n8n/workflows/go-irl-ai-developer-orchestra.json`
- `scripts/validate-n8n-ai-developer-orchestra.cjs`
- `scripts/validate-n8n-ai-developer-orchestra.test.mjs`
- `docs/reports/2026-07-12-agent-report-go-irl-ai-developer-orchestra-operations-layer.md`

## Mission Queue Data Table

Before a live execution, create an n8n Data Table named `go_irl_mission_queue` with these columns. `mission_id` is the external Telegram idempotency key and must be unique by operating convention.

| Column | Type | Purpose |
| --- | --- | --- |
| `mission_id` | String | External Mission ID and idempotency key. |
| `mission_json` | String | Validated Mission JSON waiting for Runtime admission. |
| `mission_title` | String | Short owner-facing title. |
| `telegram_chat_id` | String | Validated destination chat. |
| `telegram_user_id` | String | Validated owner user ID. |
| `clickup_task_id` | String | One ClickUp task per Mission. |
| `clickup_status_map_json` | String | Status names discovered from the configured list. |
| `drive_report_file_id` | String | Upserted Agent Report file ID. |
| `integration_status` | String | `received`, `queued`, `running`, `awaiting_human_approval`, `blocked`, `failed`, `completed`, or `synced`. |
| `runtime_status` | String | Public Runtime status returned by the CLI boundary. |
| `sync_status` | String | Mirror synchronization state. |
| `last_processed_at` | Date & time | Last integration-layer update. |
| `retry_count` | Number | Integration retry audit counter, capped at one. |
| `received_at` | Date & time | Queue ordering timestamp. |
| `activated_roles_json` | String | Selected role names only. |
| `skipped_roles_json` | String | Explicitly skipped role names. |
| `budget_usd` | Number | Mission maximum budget. |
| `github_url` | String | Authoritative GitHub `main` link. |
| `next_action` | String | One next integration action. |
| `selected_files_json` | String | Human-approved exact file selection. |
| `export_refresh_required` | Boolean | Signals that the existing export mirror must be refreshed. |

Replace `MISSION_QUEUE_DATA_TABLE_ID` in every Data Table node with the created table ID.

The Telegram lane checks `mission_id` before insertion. A duplicate returns the cached integration status and never reaches Mission Intake. The queue pump selects only the oldest queued row when no row is `running` or `awaiting_human_approval`. Runtime Mission Intake remains the final one-active-Mission guard.

## Node → purpose

| Node or group | Purpose |
| --- | --- |
| `Manual Trigger — Dry Run` → `Dry Run Complete` | Generates Mission, role, queue, ClickUp, Drive, Telegram, and export previews without reaching an external node. |
| `Telegram Trigger (DISABLED)` | Live entrypoint; imports disabled. |
| `Normalize Telegram Input` → `Telegram User Validation` | Extracts Telegram fields and enforces the owner allowlist before queue or Runtime access. |
| `Approval Command?` | Separates ordinary Mission text from explicit `/approve`. |
| `Build Mission JSON` | Creates the existing Mission contract and deterministic external Telegram Mission ID. |
| `Queue — Find Mission by ID` → `Queue — Duplicate Mission?` | Prevents duplicate Mission processing by `mission_id`. |
| `Queue — Upsert Received` → `Queue — Decide Admission` | Stores integration state and admits no more than one active code Mission. |
| `Schedule Trigger — Queue Pump` → `Queue Pump — Promote Candidate` | Promotes the oldest queued Mission when the active slot is free. |
| `ClickUp — Inspect Existing List Statuses` | Reads the configured ClickUp list before selecting status names. |
| `ClickUp — Get/Find/Create/Update Mission Task` | Upserts one ClickUp task using `go_irl_mission_id:<mission_id>`. |
| `Telegram Mission Accepted` | Sends `ПРИНЯТО` with `Queued` or `Running`. |
| `Build Runtime Mission Intake Command` → `SSH — mission-intake.cjs` | Invokes Mission Intake only after queue promotion. |
| `Build/SSH/Parse Bridge Status` | Reads public Runtime status only through `bridge.cjs mission status`. |
| `Project Coordinator — OpenRouter` | Classifies the Mission and proposes the minimum role set. |
| `Role Selection Registry Gate` | Enforces registered roles, mandatory code roles, and bounded activation. |
| `Queue — Record Selected Roles` | Stores activated/skipped roles as integration metadata. |
| `Build/SSH/Parse Context Build` | Runs Context Builder through the JSON Bridge. |
| `Execute Selected Roles — OpenRouter` | Runs only selected report-only specialists. |
| `Build/SSH/Parse Planner` | Runs the authoritative Runtime planner. |
| `Build/SSH/Parse Implementer` | Runs Codex Implementer through the Runtime. |
| `Build/SSH/Parse Reviewer` | Runs the independent Runtime reviewer. |
| `Detect Critic Requirement` → `Conditional Critic — OpenRouter` | Runs at most one Critic for conflict, invalid result, or unsupported high risk; never loops to Implementer. |
| `Drive — Search/Create/Update Blocked Agent Report` | Upserts a blocked Mission report without deleting old reports. |
| `ClickUp — Mark Mission Blocked` | Mirrors the blocked state using an existing ClickUp status. |
| `Build/SSH/Parse QA and Budget Gate` | Runs the five Runtime checks and budget gate. |
| `Queue — Mark Awaiting Human Approval` | Records the gate and prepares an evidence-bearing ClickUp update. |
| `Telegram Human Approval Request` | Sends exact files, factual checks, and `/approve MISSION-ID file1,file2`. |
| `Human Approval Gate — Telegram Owner` | Rejects globs, traversal, sensitive paths, or a mismatched owner. |
| `Queue — Load Approval Mission` | Restores integration context by Mission ID without reading Runtime state. |
| `Build/SSH/Parse Change Approval` | Records explicit Change Approval through the Bridge. |
| `Build/SSH/Parse Agent Report` | Creates the repository Agent Report through Runtime. |
| `Build/SSH/Parse Final QA` | Re-runs all five gates including the report. |
| `Build/SSH/Parse Publish Preview` | Produces a preview only; no repository write. |
| `Coordinator Final Synthesis — OpenRouter` | Produces bounded Russian owner-facing output. |
| `Drive — Search/Create/Update Agent Report` | Upserts the final Markdown mirror by Mission filename. |
| `ClickUp — Update Mission Awaiting Review` | Adds roles, Runtime status, Drive link, and honest publish status. |
| `Queue — Mark External Sync Awaiting Review` | Marks mirrors synced while retaining the Runtime slot after preview. |
| `Finalize Telegram Completion` → `Telegram Completion Notification` | Sends `ГОТОВО`, roles, checks, publish-preview status, Drive link, and ClickUp link. |
| `Sanitize Operations Failure` → `Telegram Failed or Blocked` | Redacts token-like text and local paths, truncates the reason, and never sends stack traces. |
| `Operations setup and safety` | On-canvas configuration and safety boundary. |

## Credentials

No credential values or credential IDs are embedded in JSON.

| Credential | Bind to | Requirement |
| --- | --- | --- |
| Telegram Bot API | disabled Telegram Trigger and all Telegram send nodes | Bot token configured only in n8n. |
| SSH | all SSH nodes | Dedicated non-root runner account and current repository checkout. |
| OpenRouter API | four OpenRouter Chat Model nodes | One reusable OpenRouter credential. |
| ClickUp API | HTTP list inspection and ClickUp task nodes | Access to Workspace `90121889124`, Space `90128278475`, List `901219478483`. |
| Google Drive OAuth2 | all Google Drive nodes | Write access only to folder `1skcboyr_rPQOFN34iwMAqRvf97BYVllJ`. |

## Import

1. In n8n, create or select a non-production project.
2. Create the Data Table using the exact schema above.
3. Choose **Import from File** and import `n8n/workflows/go-irl-ai-developer-orchestra.json`.
4. Confirm the workflow is inactive and the Telegram Trigger node is disabled.
5. Replace every `MISSION_QUEUE_DATA_TABLE_ID` with the created table ID.
6. Configure Telegram, SSH, OpenRouter, ClickUp, and Google Drive as below.
7. Execute only `Manual Trigger — Dry Run`.
8. Confirm `DRY_RUN_COMPLETE`, `external_writes=false`, an empty `external_nodes_reached`, and all five preview payloads.
9. Save without activating or publishing.
10. Run the disposable live plan only after reviewing all node parameters.

## Telegram setup

1. Create or select the bot in BotFather and store the token in an n8n Telegram Bot credential.
2. Obtain the owner's numeric Telegram user ID.
3. In `Telegram User Validation`, replace `TELEGRAM_USER_ID` with that exact ID as a string. Add additional IDs only after owner review.
4. Bind the same Telegram credential to the disabled trigger and every Telegram send node.
5. Leave the trigger disabled during dry-run.
6. For a disposable live execution, enable only the trigger node while the workflow itself remains manually executed/unpublished.
7. Use ordinary text for a Mission. Use `/approve MISSION-ID exact/file1,exact/file2` only after checking the requested files.

## SSH runner setup

1. Provision a dedicated Linux account without root access.
2. Clone `https://github.com/vitvolny26-art/GO-IRL-1.0.git` into a fixed path such as `/opt/go-irl/GO-IRL-1.0`.
3. Check out current `main` and require a clean worktree before every disposable Mission.
4. Install the repository-supported Node.js version, `pnpm`, Git, GitHub CLI, and Codex CLI.
5. Authenticate GitHub CLI and Codex only in the runner account credential stores; never in workflow JSON.
6. Give the SSH account write access only to the checkout and Runtime state directory it needs.
7. Replace `/opt/go-irl/GO-IRL-1.0` in `Normalize Telegram Input` and `Queue Pump — Promote Candidate` if the checkout differs.
8. Bind one SSH credential to every SSH node.
9. Confirm each command is base64-fed JSON and calls only `mission-intake.cjs` or `bridge.cjs`.

## OpenRouter setup

1. Create an OpenRouter API credential in n8n.
2. Bind it to all four `OpenRouter — … Model` nodes.
3. Coordinator, selected roles, and final synthesis use `openai/gpt-5.6-luna`.
4. Conditional Critic uses `openai/gpt-5.6-terra`.
5. Set account spending limits before live testing. Runtime implementation and review remain Codex-backed; OpenRouter does not replace them.

## ClickUp setup

1. Create a ClickUp API credential with access to the configured Workspace, Space, and List.
2. Bind it to `ClickUp — Inspect Existing List Statuses` and every ClickUp node.
3. Execute `ClickUp — Inspect Existing List Statuses` alone during setup and inspect `statuses` from List `901219478483`.
4. Confirm semantic equivalents exist for `To Do`, `In Progress`, `Review`, `Blocked`, and `Complete`.
5. If the real names differ, update only the candidate arrays in `ClickUp — Build Mission Payload`; do not invent new statuses automatically.
6. Confirm a disposable Mission creates one task named `[GO IRL Mission] <short title>`.
7. Repeat the same Telegram update and confirm the existing marker is reused rather than creating a second task.

## Google Drive setup

1. Create a Google Drive OAuth2 credential with access to the AI Reports folder only.
2. Bind it to every `Drive — …` node.
3. Confirm folder ID `1skcboyr_rPQOFN34iwMAqRvf97BYVllJ` is the intended AI Reports folder.
4. A report is named `YYYY-MM-DD-agent-report-<mission_id>.md`.
5. The workflow searches before writing. Existing files are updated in place; no Drive delete node exists.
6. Drive reports remain `Draft` and `source_of_truth: false`.

## Dry-run expected result

```text
status: DRY_RUN_COMPLETE
mission_id: MISSION-DRY-RUN-001
queue status: queued
minimum roles: 7
ClickUp payload: preview only
Drive report: preview only
Telegram lifecycle: 4 previews
export_refresh_required: true
existing export script: scripts/build-notebooklm-txt.cjs
credentials_embedded: false
secrets_embedded: false
external_writes: false
external_nodes_reached: []
```

## Disposable live Mission plan

1. Use a clean disposable runner checkout and an empty Mission Queue table.
2. Keep application code, Auth, RLS, SQL, migrations, secrets, deployment, and production data forbidden.
3. Send one Mission limited to `scripts/ai-orchestrator/**`, tests, and one report.
4. Verify `ПРИНЯТО`, one Data Table row, and one ClickUp task.
5. Send the same Telegram update payload again and verify no duplicate Runtime or ClickUp work.
6. While the first Mission is running, send a second Mission and verify it remains `queued`.
7. Verify only selected roles run and the Critic remains skipped unless its explicit condition is true.
8. Verify QA produces factual results and the Mission stops at `ТРЕБУЕТСЯ ПОДТВЕРЖДЕНИЕ`.
9. Review exact files, then send `/approve MISSION-ID file1,file2`.
10. Verify final QA and `publish preview`; confirm no commit, push, PR, merge, or deploy occurred.
11. Verify one Drive report is created or updated and the ClickUp task stays in Review.
12. Verify `ГОТОВО` says `Publish preview ready` and `Awaiting human review`.
13. Confirm the second Mission is still queued because preview does not release the Runtime slot.
14. Do not activate the workflow. Record the evidence for a separate bridge/publisher completion decision.

## Known limitations

- `bridge.cjs` exposes `publish preview`, not publisher execution. The workflow therefore cannot create a real Draft PR and never claims that it did.
- Runtime remains in `report_ready` after preview. That state is not terminal, so the Operations Layer keeps the Mission `awaiting_human_approval` and does not release the queue slot. A future bridge-supported publish/archive command is required for automatic next-Mission promotion after real completion.
- Data Table uniqueness is an operating convention rather than a database unique constraint. Runtime Mission Intake remains the final one-active-Mission guard during concurrent queue-pump executions.
- Integration failures are sanitized and the retry counter is capped at one. The workflow does not automatically restart Runtime implementation; one mirror retry must be replayed deliberately from reviewed execution data.
- ClickUp status names must be inspected on the real list. Missing `Review` or `Blocked` mapping stops safely.
- The existing `scripts/build-notebooklm-txt.cjs` is recorded in the export manifest but is not executed automatically because it writes generated files into the runner checkout after final QA.
- No production activation, live credential binding, disposable external execution, merge, or deploy was performed by this repository change.

## Governance comparison

| Source | Result |
| --- | --- |
| `ROADMAP.md` | Unchanged. This internal engineering track does not satisfy product roadmap or beta-readiness items. |
| `docs/onboarding/AI_ROLES.md` | Uses all registered names and enforces the seven mandatory code roles plus conditional specialists. |
| `docs/governance/AI_ORGANIZATION.md` | Coordinator remains report-only; n8n remains glue; GitHub remains authoritative; conflicts escalate. |
| `docs/onboarding/PROJECT_COORDINATOR_CHARTER.md` | Preserves bounded Context Packs, budget reserve, one Critic, evidence validation, Human Approval, and one next action. |
