---
title: GitHub PR ClickUp Drive Sync
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# GitHub PR -> ClickUp -> Drive Sync

## Purpose

Synchronize GitHub pull request metadata into ClickUp and Google Drive without any LLM or OpenAI API call.

```text
GitHub PR event
-> Read PR and diff
-> Create or update ClickUp task
-> Generate deterministic Agent Report
-> Replace report in Google Drive /AI Reports
-> Replace report in the NotebookLM Drive source folder
-> Telegram notification
```

GitHub remains the source of truth. ClickUp, Drive, and NotebookLM are mirrors only.

## Files

- `n8n/workflows/github-pr-clickup-drive-sync.json`
- `scripts/validate-n8n-github-pr-sync.cjs`

## Idempotency

- ClickUp key: `owner/repository#pr_number`.
- The key is stored in the task description as `go_irl_pr_key:<key>`.
- Existing tasks are updated instead of duplicated.
- Drive filename: `github-pr-owner-repository-pr_number-agent-report.md`.
- Existing Drive files with that name are deleted and recreated instead of duplicated.

## Events

The GitHub Trigger listens to `pull_request` events. The workflow processes:

- `opened`
- `reopened`
- `edited`
- `synchronize`
- `ready_for_review`

Other actions stop at `Ignore Unsupported Action`.

## Required n8n credentials

Bind these after import. No credential ID or secret is stored in Git:

- GitHub access token or GitHub App credential
- ClickUp credential
- Google Drive OAuth2 credential
- Telegram Bot credential

## Required placeholders

Replace these values in n8n:

- `GITHUB_OWNER`
- `GITHUB_REPOSITORY`
- `CLICKUP_TEAM_ID`
- `CLICKUP_SPACE_ID`
- `CLICKUP_LIST_ID`
- `AI_REPORTS_FOLDER_ID`
- `NOTEBOOKLM_REPORTS_FOLDER_ID`
- `TELEGRAM_CHAT_ID`

`NOTEBOOKLM_REPORTS_FOLDER_ID` must point to the report folder inside the Drive export consumed by NotebookLM. There is no NotebookLM API call.

## Activation procedure

1. Import the workflow.
2. Keep it inactive.
3. Replace placeholders and bind credentials.
4. Run `Manual Trigger - Dry Run`.
5. Confirm the preview contains all Agent Report sections.
6. Open a disposable test PR.
7. Execute the production lane once.
8. Verify one ClickUp task, one `/AI Reports` file, one NotebookLM export file, and one Telegram message.
9. Activate only after the manual test is green.

## Safety boundaries

- No LLM, OpenAI, Gemini, or agent node.
- No GitHub write operation.
- No automatic merge, push, commit, label, or PR state change.
- No automatic `DOCS_INDEX.md` update.
- No Knowledge Debt closure.
- No `.env`, secrets, auth, RLS, SQL, or migration access.
- Reports are always `Draft` and `source_of_truth: false`.

## Validation

```bash
node scripts/validate-n8n-github-pr-sync.cjs
```

The validator checks inactivity, required nodes, read-only GitHub operations, ClickUp upsert logic, Drive replacement logic, centralized error routing, the isolated dry-run lane, absence of credentials, and absence of LLM nodes.
