# GO IRL n8n Workflows

## Scope

This directory stores importable n8n workflow JSON for GO IRL automation.

Product automation and AI Staff OS automation must remain separate:

```text
GO IRL / Product / ...
GO IRL / Staff OS / ...
```

No workflow JSON may contain credentials, secrets, Telegram `initData`, Supabase service-role keys, private chat content, or production data exports.

## STAFF-00 Daily Mission Intake

File:

```text
n8n/workflows/staff-00-daily-mission-intake.json
```

Purpose:

- accept one Daily Mission by authenticated POST webhook;
- validate required fields;
- normalize defaults;
- generate `mission_id` and `mission_hash`;
- reject malformed budgets, dates, IDs, and issue numbers;
- enforce report-only forbidden actions;
- reserve 25% of mission budget;
- stop duplicate missions from being dispatched;
- return a normalized payload for future `STAFF-01 Project Coordinator`.

### Import

1. Import the JSON into a test n8n instance.
2. Create an n8n Header Auth credential outside Git.
3. Select that credential in `Daily Mission Webhook`.
4. Keep the workflow inactive until manual tests pass.
5. Activate only in the test instance first.

The workflow imports inactive and contains no credential ID.

### Endpoint

```text
POST /webhook/go-irl/staff-os/daily-mission
```

The exact base URL depends on the n8n instance.

### Required body

```json
{
  "title": "Check beta document alignment",
  "objective": "Verify that current source-of-truth documents preserve the Olomouc six-category beta scope.",
  "expected_deliverable": "One evidence-backed report and one next task."
}
```

### Optional fields

```text
mission_id
business_reason
priority
maximum_budget_usd
related_github_issue
allowed_write_scope
forbidden_actions
deadline
requested_by
source
metadata
```

Defaults:

```text
priority: normal
maximum_budget_usd: 0.75
requested_by: owner
source: owner
mode: report-only
```

Budget range is limited to USD 0.01–5.00.

### Responses

- `201 received` — validated new mission; ready for `STAFF-01`.
- `200 duplicate` — identical normalized mission seen within the cache window; not dispatched.
- `400 invalid` — required or typed input failed validation.

### Duplicate guard

Phase 1 uses n8n workflow static data:

```text
retention: 7 days
maximum records: 100
```

This is acceptable only for low-volume single-instance testing. Before multi-instance or production use, replace it with a durable n8n Data Table or approved external store.

### Manual acceptance test

Run in the test webhook mode:

1. Send a valid mission and expect HTTP `201`.
2. Send the same mission again and expect HTTP `200` with `duplicate: true`.
3. Omit `objective` and expect HTTP `400`.
4. Set `maximum_budget_usd` above `5` and expect HTTP `400`.
5. Confirm the accepted response contains:
   - generated `mission_id`;
   - `mission_hash`;
   - 25% reserve;
   - report-only guardrails;
   - `next_workflow: STAFF-01 Project Coordinator`.
6. Confirm no repository, Supabase, Telegram, OpenRouter, or production write occurs.

## Safety boundary

`STAFF-00` does not:

- call an AI model;
- read GitHub;
- access Supabase;
- write reports;
- create branches or pull requests;
- send Telegram messages;
- run SQL;
- deploy anything;
- activate `STAFF-01` automatically.
