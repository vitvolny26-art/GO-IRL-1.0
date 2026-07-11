---
title: Agent Report — n8n AI Report Bus Export Sanitization
owner: Project Coordinator
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report

## Task

Review the exported `GO IRL — AI Report Bus` workflow and prepare a repository-safe portable backup.

## Files inspected

- User-provided `go-irl-ai-report-bus-v1.json`
- GitHub issue #32
- `docs/n8n-workflows.md`

## Findings

The raw n8n export does not contain OAuth tokens, passwords, API keys, private keys, or bearer secrets.

It does contain environment-specific and personal values that should not be committed to the public repository unchanged:

- notification email;
- n8n credential binding IDs and names;
- Google Drive folder IDs;
- GitHub owner and repository values;
- webhook IDs;
- workflow, version, and instance IDs;
- `active: true`.

## Changes made

Prepared a sanitized portable template:

- set `active` to `false`;
- removed credential bindings;
- removed webhook, workflow, version, and instance identifiers;
- replaced notification email with `YOUR_NOTIFICATION_EMAIL`;
- replaced Drive folder IDs with placeholders;
- replaced GitHub owner and repository with placeholders;
- preserved workflow nodes, connections, validation logic, duplicate handling, and rejection handling.

## Checks

```text
Checks: NOT RUN — docs/config-only
```

Static checks performed:

- JSON parses successfully;
- no real email remains;
- no credential binding IDs remain;
- no webhook or instance IDs remain;
- no real Drive folder IDs remain;
- no GitHub owner/repository binding remains;
- template is inactive.

## Risks

The sanitized template must be configured manually after import:

- Google Drive OAuth credential;
- GitHub credential;
- Gmail OAuth credential;
- notification email;
- Inbox, Reviewed, and Rejected folder IDs;
- GitHub owner and repository.

The live n8n Cloud workflow remains published and unchanged.

## Not touched

- runtime application code;
- dependencies;
- `.env`;
- auth;
- Supabase RLS;
- SQL;
- migrations;
- deployment settings;
- live n8n workflow configuration.

## Next step

Merge the sanitized template and this report, then use the template as the portable backup for self-hosted n8n after the Cloud trial.
