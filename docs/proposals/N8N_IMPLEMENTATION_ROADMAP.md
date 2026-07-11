---
title: GO IRL n8n Implementation Roadmap
owner: Automation Lead
status: Proposal
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# GO IRL n8n Implementation Roadmap

## Purpose

Define the smallest safe path for introducing n8n into GO IRL 1.0 without blocking the current closed-beta priorities or giving automation authority over product, security, repository, or deployment decisions.

This document is a proposal. `ROADMAP.md` and `BACKLOG.md` remain canonical.

## Operating boundaries

n8n may handle:

- triggers;
- routing;
- scheduling;
- idempotency;
- validation;
- retries;
- budget counters;
- notifications;
- approval state;
- operational logging.

n8n must not independently:

- change application code;
- write to production business data without an approved backend contract;
- bypass Supabase RLS;
- use production `service_role` for routine workflows;
- edit auth, SQL, migrations, or secrets;
- create or merge code changes;
- deploy production;
- edit `DOCS_INDEX.md`;
- close Knowledge Debt;
- claim beta readiness.

## Three independent lanes

### Lane A — Product Automation

User-facing operational support:

- join/request notifications;
- organizer notifications;
- event updates;
- reminders;
- cancellation notices;
- optional digest;
- support intake.

### Lane B — AI Report Bus

Internal report transport:

- Google Drive intake;
- sanitization;
- duplicate protection;
- GitHub Draft Issue or draft report;
- owner notification;
- processed-item tracking.

### Lane C — AI Staff OS

Bounded mission orchestration:

- Daily Mission intake;
- deterministic validation;
- role selection;
- Context Packs;
- model budget control;
- output validation;
- optional critic;
- human review.

The three lanes must not be merged into one workflow or share authority.

# Current state

| Component | Current status | Evidence gap |
|---|---|---|
| Telegram two-account beta path | Open manual gate | Full PASS evidence from two real accounts |
| Staff OS structural workflow | Structurally validated, inactive | No live model integration required yet |
| STAFF-00 Daily Mission Intake | Draft, blocked | Reconcile with `main`, mission ID conflict rule, real n8n acceptance |
| AI Report Bus | Requires reconciliation | Confirm workflow, dedupe store, sanitization, manual acceptance |
| OpenRouter gateway | Not implemented | Credential, budget, JSON output, usage logging |
| Human approval | Concept only | Select first auditable channel |
| Product notifications | Roadmap scope | Approved backend event contract |

# Synchronization with the product roadmap

The n8n roadmap follows the existing product order:

1. Closed Beta Loop Stability;
2. Infrastructure Hardening;
3. Sport Coach MVP 1.1;
4. Performance;
5. n8n Notifications;
6. AI Event Discovery.

Internal automation may progress only when it does not block this order.

# Phase 0 — Beta gate

## Goal

Prove the current Telegram product loop before adding production automation.

## Scope

- create one Olomouc event;
- share through Telegram;
- open from a second account;
- join/request;
- verify participant state and count;
- verify event chat;
- record sanitized PASS/FAIL evidence.

## Deliverable

Completed Issue #38 acceptance matrix.

## Acceptance

```text
create event             PASS
Telegram share           PASS
second-account deep link PASS
join/request             PASS
participant count        PASS
event chat               PASS
organizer visibility     PASS
no critical runtime bug  PASS
```

## Forbidden

- n8n production activation;
- OpenRouter integration;
- architecture changes during the test;
- auth/RLS/SQL/migration changes.

## Exit gate

All acceptance lines pass, or one exact blocker is documented.

# Phase 1 — n8n foundation

## Goal

Prepare a safe test environment without connecting production business logic.

## Scope

- n8n test instance;
- Credentials Manager;
- execution retention;
- Data Tables or approved durable test storage;
- error workflow;
- owner notification channel;
- backup/export procedure;
- naming convention:
  - `GO IRL / Product / ...`
  - `GO IRL / Report Bus / ...`
  - `GO IRL / Staff OS / ...`

## Deliverables

- environment checklist;
- credential inventory without secret values;
- execution retention rule;
- inactive sample workflow;
- rollback/export procedure.

## Acceptance

- no credentials committed to Git;
- no production database access;
- one test workflow can run and fail visibly;
- one error notification reaches the owner;
- exported JSON contains no secrets.

## Forbidden

- Supabase `service_role`;
- production webhook activation;
- user private data;
- AI model calls.

# Phase 2 — STAFF-00 acceptance

## Goal

Finish the first deterministic Staff OS workflow before adding any LLM.

## Scope

Reconcile PR #42 with current `main` and implement:

- persistent `mission_id -> mission_hash` state;
- exact duplicate handling;
- same ID plus changed payload conflict;
- malformed mission rejection;
- budget limit enforcement;
- report-only guardrails;
- no external writes.

## Required behavior

| Case | Expected result |
|---|---|
| New valid mission | `201 received` |
| Same ID + same payload | `200 duplicate` |
| Same ID + changed payload | `409 mission_id_conflict` |
| Missing required field | `400 invalid` |
| Budget above limit | `400 invalid` |
| Forbidden write request | reject or force report-only |

## Deliverables

- reconciled inactive workflow;
- updated schema and README;
- deterministic fixture matrix;
- manual test evidence from a real n8n test instance.

## Acceptance

All cases pass and no GitHub, Supabase, Telegram, OpenRouter, or production write occurs.

## Exit gate

PR #42 may leave Draft only after acceptance evidence is attached.

# Phase 3 — AI Report Bus

## Goal

Deliver one useful deterministic internal automation without an LLM.

## Flow

```text
Schedule Trigger
-> list Google Drive /AI Reports
-> modified-since filter
-> download
-> file/type/size validation
-> secret and PII deny scan
-> content hash
-> duplicate/version check
-> create GitHub Draft Issue or draft report
-> notify owner
-> persist processed state
```

## State model

| Input state | Action |
|---|---|
| New file ID | create draft artifact |
| Same file ID + same hash | skip |
| Same file ID + new hash | comment/update draft artifact |
| Secret/PII detected | stop and alert |
| Unsupported file | stop and alert |

## Storage

Use n8n Data Tables for:

- Drive file ID;
- modified timestamp;
- content hash;
- GitHub artifact ID;
- status;
- last error.

Google Sheets is fallback only if Data Tables are unavailable.

## Acceptance

- one test report creates one Draft artifact;
- a repeat produces no duplicate;
- an updated version is linked to the original;
- a secret fixture is blocked;
- no AI call is made;
- final owner review remains manual.

# Phase 4 — First product workflow

## Goal

Implement the first n8n workflow that directly supports the beta flow.

## Selected workflow

**Join/request notification.**

## Dependency

An approved trusted backend event emitted by Supabase or an Edge Function.

n8n must not infer authorization or membership state.

## Flow

```text
Trusted backend event
-> signed webhook
-> schema validation
-> idempotency check
-> notification formatting
-> Telegram Bot API
-> delivery result
-> operational log
```

## Idempotency key

```text
membership_event_id + notification_type + recipient_id
```

## Acceptance

- one join/request sends one notification;
- replayed webhook sends no duplicate;
- n8n does not change membership state;
- no raw Telegram `initData` is logged;
- failures are visible and retry at most once;
- notification contains no unnecessary private data.

## Rollback

Disable the workflow. Core join/request behavior must continue without it.

# Phase 5 — Event updates and reminders

## Goal

Add low-risk lifecycle notifications after the first product workflow is stable.

## Order

1. event cancellation;
2. time/location update;
3. organizer confirmation;
4. 24-hour reminder;
5. 2-hour reminder.

## Required controls

- opt-in where applicable;
- quiet hours;
- idempotency;
- cancelled-event suppression;
- timezone handling;
- owner-visible failure log.

## Acceptance

Each workflow passes duplicate, cancellation, timezone, and retry tests independently.

# Phase 6 — OpenRouter gateway test

## Goal

Prove one bounded structured LLM call without external writes.

## Scope

- one credential in n8n Credentials Manager;
- model allowlist;
- per-mission budget;
- strict JSON output;
- schema validation;
- one retry for malformed output;
- one provider/model fallback maximum;
- token and estimated-cost logging;
- prompt logging disabled or redacted.

## First use case

Classify one sanitized Daily Mission and recommend the minimum required roles.

## Acceptance

- total cost at or below the configured cap;
- valid structured output;
- invalid output stops safely after one retry;
- no GitHub or production write;
- no secrets or private user data in the prompt or logs.

# Phase 7 — Staff OS Lite

## Goal

Run one real report-only Daily Mission through a minimal Staff OS.

## Pipeline

```text
STAFF-00 Intake
-> deterministic mission classification
-> Coordinator
-> bounded Context Packs
-> maximum two specialist workers
-> schema validation
-> optional one critic pass
-> final synthesis
-> human review
```

## Initial roles

- Project Coordinator;
- Archivist;
- one domain specialist;
- optional QA/Critic.

## Limits

- maximum two worker roles;
- maximum one critic;
- default mission budget USD 0.75;
- 25% reserve;
- no repository write;
- no production action.

## Acceptance

- one mission completes within budget;
- all outputs validate;
- role selection is explainable;
- skipped roles are recorded;
- owner receives one final report and one next task;
- no autonomous action occurs.

# Phase 8 — Human approval

## Goal

Add an auditable approval mechanism only after Staff OS proves useful.

## Recommended order

1. GitHub label/comment approval;
2. n8n manual approval;
3. Telegram inline-button approval.

## Telegram requirements

- owner ID allowlist;
- one-time nonce;
- mission binding;
- expiry;
- replay protection;
- audit log;
- no raw Mini App `initData` in prompts.

## Acceptance

A replayed or expired approval cannot execute an action.

# Phase 9 — AI Event Discovery

## Goal

Support the existing product roadmap after notifications are stable.

## Scope

- approved public sources;
- scheduled collection;
- normalization;
- deduplication;
- confidence score;
- moderation queue;
- human approval before publication.

## Forbidden

- automatic publication of unverified events;
- private-source scraping;
- bypassing platform terms;
- direct production inserts without an approved backend contract.

# Observability baseline

Every workflow records:

```text
workflow_name
workflow_version
execution_id
mission_id or domain_event_id
started_at
completed_at
duration_ms
status
retry_count
idempotency_key
external_write_attempted
external_write_completed
model
provider
input_tokens
output_tokens
estimated_cost
approval_status
error_code
```

Never store:

- secrets;
- service-role keys;
- raw Telegram `initData`;
- full private chats;
- unnecessary production payloads;
- unredacted sensitive prompts.

# Priority matrix

| Item | Priority | Reason |
|---|---|---|
| Telegram two-account smoke test | P0 | Current product gate |
| n8n test foundation | P1 | Required for safe acceptance |
| STAFF-00 acceptance | P1 | Existing blocked work |
| AI Report Bus | P1 internal | Useful, deterministic, non-product-blocking |
| Join/request notification | P1 product | Direct beta-flow value |
| Event updates/reminders | P2 | Useful after first notification |
| OpenRouter gateway | P2 internal | Only after deterministic controls |
| Staff OS Lite | P2 internal | Report-only experiment |
| Human approval interface | P3 | Only after proven need |
| Evening digest | P3 | Requires event density and preferences |
| AI Event Discovery | Later roadmap | Depends on notifications and moderation |
| Full multi-agent organization | Defer | No proven need |
| Personal AI OS | Reject for beta scope | Product distraction |

# 30/60/90-day operating view

Dates are not commitments. Advancement is gate-based.

## First 30 days

- finish Issue #38;
- prepare n8n test foundation;
- reconcile and test STAFF-00;
- reconcile AI Report Bus and run one acceptance test.

## Days 31–60

- define trusted backend event contract;
- build join/request notification;
- run controlled active test;
- add cancellation and update notifications if stable.

## Days 61–90

- test OpenRouter gateway with no external writes;
- run one Staff OS Lite mission;
- evaluate whether human approval automation is justified.

# Readiness levels

| Level | Meaning |
|---|---|
| 0 | Concept |
| 1 | Documented |
| 2 | Structurally validated |
| 3 | Manual acceptance passed |
| 4 | Active test |
| 5 | Production active |

No workflow advances a level without evidence from the previous gate.

# Success metrics

## Product automation

- notification delivery success;
- duplicate-send rate;
- time from domain event to notification;
- join/request completion rate;
- organizer response time;
- cancellation communication success.

## Internal automation

- manual minutes saved;
- duplicate artifacts prevented;
- failed executions detected;
- cost per mission;
- valid structured-output rate;
- human rejection rate;
- number of autonomous writes: always zero until explicitly approved.

# Stop conditions

Stop or defer the n8n roadmap if:

- it blocks the beta gate;
- production security requires unapproved auth/RLS/SQL/migration changes;
- routine workflows require `service_role` access;
- automation creates duplicate or unauditable actions;
- Staff OS produces no measurable advantage over direct human/AI work;
- maintenance cost exceeds saved operational effort.

# Next single task

**Task:** Complete the real Telegram two-account beta smoke test in Issue #38.

**Owner:** Human Owner / QA tester.

**Scope:** Deployed Mini App, two real Telegram accounts, existing checklist only.

**Evidence required:** Sanitized PASS/FAIL matrix and exact first blocker if any.

**Acceptance:** All Issue #38 acceptance lines pass or one reproducible blocker is documented.

**Forbidden actions:** Code changes, auth/RLS/SQL/migrations, secrets, deployment changes, n8n activation.

**Stop condition:** Stop on the first critical blocker and document only the exact visible failure.
