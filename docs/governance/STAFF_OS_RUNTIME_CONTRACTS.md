---
title: GO IRL Staff OS Runtime Contracts
owner: Project Coordinator
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-08-20
---

# Staff OS Runtime Contracts

## Authority

GitHub `main` is the only project authority. Drive, ClickUp, NotebookLM, Gemini, Replit, and n8n cannot override repository truth.

## Mission contract

Every mission resolves to:

- `mission_id`
- `title`
- `objective`
- `expected_deliverable`
- `priority`
- `allowed_write_scope`
- `forbidden_actions`
- `budget`
- `deadline`

Missing write approval always defaults to read-only.

## Context Pack

Each activated role receives only:

- mission ID and role;
- bounded task and goal;
- allowed and forbidden actions;
- exact files or evidence to inspect;
- expected output schema;
- call, token, cost, retry, and time limits;
- data classification.

Never send secrets, raw Telegram `initData`, private chats, service-role keys, production row dumps, or unnecessary personal data.

## Agent Result

Every role returns:

- status: `complete | blocked | failed`;
- verified facts;
- findings and risks;
- evidence references;
- proposed changes;
- checks performed;
- blockers;
- next smallest safe action.

Inference must be labeled. A check without logs is not evidence.

## QA evidence

A green claim requires:

- exact commit SHA or working-tree state;
- exact command or smoke path;
- result and timestamp;
- relevant output or artifact reference;
- environment used.

For code or configuration changes, the default local gate is:

- `pnpm run lint`;
- `pnpm run build`;
- `pnpm run test`.

Documentation-only changes do not require application checks unless they modify executable configuration or generated runtime behavior.

## Validation pipeline

`Agent Result -> schema validation -> evidence validation -> policy validation -> conflict detection -> optional Critic -> Coordinator synthesis -> human review`

Maximum one malformed-output repair, one provider fallback, and one Critic cycle.

## Handoff

A handoff must state:

- completed scope;
- files or systems touched;
- evidence and checks;
- unresolved risks;
- prohibited follow-up actions;
- next single task.

## Runner boundaries

- `/home/goirl/GO-IRL-1.0`: application and production checkout.
- `/opt/go-irl-runner/repo`: n8n validation and automation runner checkout.
- `/opt/go-irl-stage/dist`: stage or publication output.

These are separate operational contexts. None replaces GitHub `main` as authority.

## Human gates

Explicit owner approval is required before code or configuration writes, branch or PR creation, merge, deployment, architecture changes, auth, RLS, SQL, migrations, secrets, production-data access, `DOCS_INDEX.md` edits, Knowledge Debt closure, or beta/release-ready declaration.

## Prohibited automation

No auto-merge, auto-deploy, force push, destructive Drive deletion, secret handling, production SQL, auth/RLS edits, or unverified green claims.