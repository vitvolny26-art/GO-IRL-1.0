---
title: GO IRL Tool Operating Model
owner: Product Lead
status: Review
source_of_truth: true
last_review: 2026-07-23
next_review: 2026-08-23
---

# GO IRL Tool Operating Model

## Purpose

Define one governed responsibility for each operational tool used by GO IRL 1.0. This model prevents duplicate task systems, conflicting sources of truth, uncontrolled automation, and ambiguous AI authority.

## Authority

1. Verified runtime evidence and GitHub `main`.
2. Active GitHub governance documents.
3. Active Drive instructions that do not conflict with GitHub.
4. ClickUp operational state.
5. Advisory and historical material.

This document is proposed in `Review` status. It becomes controlling only after review and merge to `main`.

## Executive and Staff OS boundary

The human Product Owner sets product direction, approves scope, and controls human approval gates.

`CEO / Product Owner` is not an autonomous Staff OS runtime role. Product missions are translated into the active `Product Lead` runtime role. Implementation, QA, release, security, data, and documentation work must be routed to the smallest required set of active roles.

## System responsibilities

| System | Governed responsibility | Must not become |
|---|---|---|
| GitHub | Code, runtime truth, durable documentation, branches, pull requests, releases, technical evidence | Chat archive or unreviewed scratchpad |
| Supabase | Application data, schema reality, auth and RLS runtime | Task manager or documentation store |
| ClickUp | Single operational queue for tasks, missions, blockers, ownership, status, and review state | Source of truth for code or architecture |
| Google Drive | Governed AI instructions, working documents, research, evidence, and agent reports | Independent authority that diverges from GitHub |
| n8n | Orchestration between systems and bounded Staff OS workflows | Source of truth, autonomous merger, or production deployer |
| ChatGPT / Staff OS | Role-based analysis and approved execution through explicit tools and contracts | Unbounded superuser or implicit approval authority |
| Telegram | Product-owner command and notification interface | Durable task or documentation database |
| Slack | Human communication and operational notifications | Canonical decision archive or second task system |
| Vercel | Build, preview, and approved deployment runtime | Source of product scope or release truth |
| Gmail / Calendar / Contacts | External communication, scheduling, and contact lookup | Project-management system |
| Replit | Bounded experiments and runtime inspection when explicitly assigned | Alternate production source of truth |
| Linear | Optional external engineering interface only when a concrete integration need is approved | Parallel internal backlog competing with ClickUp |

## Task-system decision

ClickUp is the single internal operational task system for GO IRL 1.0.

Linear remains non-authoritative and optional. No task should be copied into Linear unless one of these conditions is documented:

- an external engineering collaborator requires Linear;
- a specific integration provides measurable value unavailable in ClickUp;
- the Product Owner approves a bounded pilot with an owner, end date, and synchronization rule.

During any pilot, ClickUp remains the authoritative status and coordination layer.

## Standard operating flow

1. Product Owner states a goal through ChatGPT or Telegram.
2. Project Coordinator creates a bounded mission contract.
3. Product Lead converts the goal into scope, acceptance criteria, and priority.
4. ClickUp records the active task, owner, status, blockers, and links.
5. Staff OS activates only the roles required for the mission.
6. GitHub branches and pull requests contain proposed durable changes.
7. Required checks and role evidence are attached to the same commit or pull request.
8. Human approval controls merge, production deployment, architecture changes, auth, RLS, SQL, migrations, secrets, and production data.
9. n8n propagates notifications and references; it does not grant approval.
10. Drive stores agent reports under `AI Reports / <Role> / YYYY-MM-DD /` and mirrors approved guidance without overriding GitHub.

## Source and output routing

| Information type | Authoritative destination |
|---|---|
| Product scope and durable decisions | GitHub |
| Code and runtime documentation | GitHub |
| Active work, blockers, ownership, review status | ClickUp |
| AI instructions and role charters | GitHub authority with governed Drive mirror |
| Agent reports and research evidence | Drive report tree; GitHub report when required by task |
| Build and deployment evidence | GitHub PR/checks plus Vercel evidence |
| Application data | Supabase |
| Notifications | Telegram or Slack |

## Automation rules

- Prefer deterministic workflow logic over unnecessary AI calls.
- Use selective context packs, not full repository dumps or bare links.
- One active code mission at a time.
- One retry maximum unless an active runbook explicitly allows otherwise.
- No automatic merge or production deployment.
- No automatic source-of-truth edits.
- No auth, RLS, SQL, migration, secret, or production-data change without explicit approval.
- Never mark work complete without evidence.

## Minimum evidence contract

A completed operational change must reference:

- ClickUp task or mission;
- GitHub branch, commit, and pull request when durable files changed;
- checks or review evidence appropriate to the change;
- Drive report when the role charter requires one;
- explicit blockers and next action when incomplete.

## Adoption actions

1. Use ClickUp as the single active internal queue.
2. Treat Linear as inactive for internal operations until an approved pilot exists.
3. Route product-owner requests through Product Lead, not a synthetic CEO runtime agent.
4. Configure n8n notifications to reference ClickUp and GitHub IDs rather than duplicate full state.
5. Keep Slack and Telegram as interfaces, not storage systems.
6. Review the Services & Infrastructure Registry against this responsibility model.
7. Add this document to `DOCS_INDEX.md` only after explicit review approval.
