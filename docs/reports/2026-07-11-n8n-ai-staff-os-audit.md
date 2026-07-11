---
title: Agent Report
owner: Project Coordinator
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report

## Task

Audit the proposed GO IRL AI Staff OS and the external n8n recommendations against the current repository source-of-truth documents. Define the safest first n8n implementation without expanding beta product scope or granting autonomous write authority.

## Files inspected

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/n8n-workflows.md`
- `docs/onboarding/AI_ROLES.md`
- `docs/governance/AI_ORGANIZATION.md`
- GitHub issue `#38` — real Telegram two-account beta smoke test
- External analysis supplied by the owner: `Анализ и улучшение проекта GO IRL.docx`

## Findings

### 1. Current repository n8n scope is product automation, not AI staff orchestration

`docs/n8n-workflows.md` currently defines future product-side workflows:

- event discovery;
- evening digest;
- event lifecycle;
- source health;
- activity chat cleanup.

It explicitly states that runnable workflow JSON does not exist yet and must not be committed until the required tables, external secrets, test n8n instance, manual dry-run, and retention rules are ready.

The AI Staff OS should therefore use a separate workflow family and separate documentation. It must not replace or silently rewrite `docs/n8n-workflows.md`.

Recommended naming boundary:

```text
Product automation:
GO IRL / Product / ...

AI staff orchestration:
GO IRL / Staff OS / ...
```

### 2. The deterministic-first recommendation is accepted

The external analysis correctly recommends deterministic n8n nodes for routine orchestration and limiting model calls to cognitive work.

Accepted principle:

```text
n8n controls state, routing, limits, validation, retries, and approvals.
Models classify, analyze, criticize, and summarize.
```

The following must remain deterministic:

- mission ID generation;
- duplicate detection;
- role activation rules;
- budget arithmetic;
- schema validation;
- retry counters;
- secret/PII deny rules;
- human approval state;
- final write permissions.

AI Agent nodes are not required for Phase 1. Standard HTTP model calls with strict JSON output are easier to audit.

### 3. AI Staff OS fits the governance direction but the Coordinator authority is still a draft

`docs/governance/AI_ORGANIZATION.md` already defines `Chief AI Officer` and `AI Coordinator` responsibilities. `docs/onboarding/AI_ROLES.md` does not yet register a fully chartered Project Coordinator with production-sensitive authority.

Safe interpretation:

- Project Coordinator may classify missions, activate roles, allocate budgets, detect conflicts, and synthesize reports.
- Project Coordinator may not approve architecture, auth, RLS, SQL, migrations, secrets, production deployment, merge, force push, `DOCS_INDEX.md` changes, or Knowledge Debt closure.
- Phase 1 remains report-only.

A dedicated Coordinator charter is required before supervised patch mode.

### 4. AI Staff OS must not displace the current beta gate

The current project priority remains GitHub issue `#38`: run the real Telegram two-account smoke test for the create → share → join/request → participant state → event chat path.

AI Staff OS design is governance/infrastructure work. It must not be used to claim beta readiness or replace manual Telegram evidence.

### 5. Product workflow and staff workflow data must remain isolated

The first AI Staff OS phase must not read production Supabase rows, Telegram private chats, raw `initData`, service-role keys, or user identifiers.

Phase 1 context sources:

1. GitHub repository files on `main`;
2. GitHub issues and reports;
3. approved public research when a mission explicitly requires it.

Google Drive remains an export mirror or inbound report channel only. Chat history is not source of truth.

### 6. Safe Phase 1 architecture

```text
Daily Mission Intake
→ deterministic mission validation
→ Project Coordinator classification
→ deterministic role selector
→ role-specific Context Pack builder
→ selected role workers in parallel
→ JSON schema validation
→ evidence and policy validation
→ optional single critic pass
→ Coordinator synthesis
→ human review
→ report preview
```

No repository write is performed by the workflow in the first acceptance test.

### 7. Required workflows

#### `STAFF-00 Daily Mission Intake`

Responsibilities:

- accept one mission;
- generate `mission_id` and `mission_hash`;
- reject empty or duplicate missions;
- set global budget and forbidden actions;
- persist mission state.

#### `STAFF-01 Project Coordinator`

Responsibilities:

- classify mission type;
- define one exact goal;
- activate only relevant roles;
- explicitly list skipped roles;
- allocate role budgets;
- create bounded role packets.

#### `STAFF-02 Context Pack Builder`

Responsibilities:

- load only role-required repository files;
- load relevant issues and previous reports;
- exclude secrets and private data;
- build a validated Context Pack.

#### `STAFF-03 Generic Role Worker`

Responsibilities:

- combine common system rules with a role overlay;
- call the selected OpenRouter model;
- require strict `AgentResult` JSON;
- retry malformed output once at most;
- record tokens, calls, cost, model, and provider.

#### `STAFF-04 Validation Gate`

Responsibilities:

- validate schema;
- confirm evidence paths;
- reject unsupported green claims;
- detect forbidden actions;
- detect budget violations;
- separate verified facts from inference.

#### `STAFF-05 Critic and Conflict Resolver`

Activation only when:

- roles disagree;
- evidence is incomplete;
- a sensitive recommendation appears;
- a code patch would be justified.

Maximum one critic cycle per mission.

#### `STAFF-06 Coordinator Synthesis`

Produces:

- mission status;
- activated and skipped roles;
- verified facts;
- findings;
- conflicts;
- recommended decision;
- checks;
- blockers;
- usage and estimated cost;
- one next task.

#### `STAFF-07 Human Gate`

Required before:

- any code or documentation write outside draft reports;
- branch or Draft PR creation;
- auth/RLS/SQL/migration/secret work;
- architecture changes;
- production deployment;
- merge;
- `DOCS_INDEX.md` edits;
- Knowledge Debt closure.

#### `STAFF-99 Error Workflow`

Responsibilities:

- classify technical and policy failures;
- allow one bounded retry where permitted;
- stop on secret detection or forbidden scope;
- preserve a summarized incident record.

### 8. Initial role activation matrix

| Mission type | Default roles | Optional roles |
|---|---|---|
| Documentation alignment | Coordinator, Archivist, Product Lead | Tech Lead |
| Beta QA evidence | Coordinator, QA Lead, Product Lead | Release Manager, Tech Lead |
| Confirmed bug investigation | Coordinator, QA Lead, Tech Lead | Archivist |
| Approved small patch | Coordinator, QA Lead, Tech Lead, AI Fixer | Release Manager |
| Auth/RLS/data | Coordinator, Security Lead, Supabase Steward, Tech Lead, QA Lead | Archivist |
| UX review | Coordinator, UX Lead, Product Lead, QA Lead | Tech Lead |
| Market research | Coordinator, Market Analyst, Product Lead | Archivist |
| Release review | Coordinator, Release Manager, QA Lead | GitHub Operator, Tech Lead |

AI Fixer activation requires a reproducible bug, identified affected files, small patch scope, no sensitive boundary, and explicit human approval.

### 9. Initial budget policy

Global rules:

- reserve 25% of mission budget;
- stop optional roles after 75% consumption;
- one malformed-output repair maximum;
- one provider/model fallback maximum;
- one critic cycle maximum;
- duplicate mission returns cached validated output unless source content changed.

Initial limits:

| Role | Max calls | Max input tokens | Max output tokens |
|---|---:|---:|---:|
| Coordinator | 3 | 30,000 | 6,000 |
| Archivist | 3 | 60,000 | 8,000 |
| Product Lead | 2 | 25,000 | 4,000 |
| Tech Lead | 3 | 45,000 | 7,000 |
| QA Lead | 3 | 30,000 | 6,000 |
| AI Fixer | 2 | 40,000 | 8,000 |
| Security Lead | 2 | 30,000 | 5,000 |
| Market Analyst | 4 | 50,000 | 8,000 |
| Critic | 1 | 25,000 | 4,000 |

### 10. Minimum data contracts

#### `DailyMission`

Required fields:

```text
mission_id
title
objective
expected_deliverable
priority
maximum_budget_usd
allowed_write_scope
forbidden_actions
related_github_issue
```

#### `ContextPack`

Required fields:

```text
mission_id
role
task
goal
allowed_actions
forbidden_actions
files
issues
reports
budget
evidence_requirements
data_classification
```

#### `AgentResult`

Required fields:

```text
mission_id
role
status
verified_facts
inferences
recommendations
evidence
risks
blocked_by
budget_used
```

### 11. First acceptance test

Mission:

```text
Check whether README.md, ROADMAP.md, BACKLOG.md,
docs/onboarding/AI_ROLES.md, and
docs/governance/AI_ORGANIZATION.md are aligned with the
current Olomouc closed-beta scope.

No repository writes.
Maximum cost: USD 0.75.
Return one evidence-backed report and one next task.
```

Expected activation:

- Project Coordinator;
- Archivist;
- Product Lead.

Expected skipped roles:

- Tech Lead;
- QA Lead;
- AI Fixer;
- UX Lead;
- Security Lead;
- Supabase Steward;
- Release Manager;
- Market Analyst;
- GitHub Operator;
- Replit Operator;
- Sprint Planner.

Acceptance:

- one unique mission record;
- three valid `AgentResult` objects;
- zero repository writes;
- zero private or secret data;
- budget below USD 0.75;
- explicit activated/skipped role list;
- one final synthesis;
- exactly one next task.

### 12. Scope decisions for the external analysis

#### ACCEPT

- deterministic n8n workflows for routine operations;
- typed sub-workflow inputs;
- server-side notifications instead of Mini App background polling;
- AI only for bounded unstructured-text tasks;
- code splitting and performance measurement as later technical work.

#### VERIFY BEFORE USE

- Telegram `initData` cryptographic details;
- RLS examples and type compatibility;
- bundle-size and TTI targets;
- competitor, revenue, valuation, and university statistics;
- exact OpenRouter model pricing and capabilities at implementation time.

#### DEFER

- payments and ticketing;
- premium event cards;
- coach commissions;
- broad sponsored categories;
- automated AI event discovery;
- reputation ledger expansion.

#### REJECT FOR CURRENT BETA

- blockchain-based reputation implementation;
- autonomous production changes;
- AI-driven routine notifications where deterministic logic is sufficient;
- any workflow that weakens the current six-category beta boundary.

## Changes made

Created this repository audit report only.

No application code, n8n workflow JSON, auth, RLS, SQL, migrations, secrets, Supabase settings, deployment configuration, roadmap status, or `DOCS_INDEX.md` entry was changed.

## Checks

Documentation-only review completed against current `main` repository files and issue `#38`.

No code checks were required because no code changed.

The report does not claim that an n8n instance, workflow, OpenRouter account, or model route has been tested.

## Next step

Create and approve `docs/onboarding/PROJECT_COORDINATOR_CHARTER.md` as a report-only governance charter before building `STAFF-00 Daily Mission Intake` in n8n.
