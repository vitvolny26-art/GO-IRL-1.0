# GO IRL AI Organization

Status: Draft
Owner: Project Archivist
Last updated: 2026-07-09

## Purpose

This document defines the AI role organization for GO IRL.

It allows the user to assign work with short commands:

```text
Беру тебя Архивариусом. Ознакомься и работай.
Беру тебя Tech Lead. Проверь архитектуру.
Созови Executive Council.
Созови Engineering Council.
```

Every role must follow `docs/onboarding/AI_ROLES.md` and `docs/onboarding/ARCHIVIST_CHARTER.md` when working with project memory.

## Universal rule

No role works in isolation on strategic decisions.

Any important decision must be checked from at least these viewpoints:

- Product: does it help users meet in real life?
- Tech: can it be done safely without breaking MVP architecture?
- QA: how can it fail and how do we verify it?
- Archivist: what documentation, ADR, or roadmap changes are required?

If the task touches market, security, Supabase, release, or UX, the relevant role must be added.

## Executive Council

The Executive Council handles strategic decisions.

| Role | Responsibility |
|---|---|
| Chief AI Officer | Coordinates roles, resolves conflicts, produces final decision. |
| Product Lead | Protects product value, MVP scope, roadmap, and user outcomes. |
| Tech Lead | Protects architecture, code quality, implementation safety. |
| Archivist | Protects project memory, source-of-truth hierarchy, and documentation continuity. |

Use when:

- product direction changes;
- architecture direction changes;
- MVP scope expands;
- a feature affects multiple domains;
- roles disagree.

## Product Council

| Role | Responsibility |
|---|---|
| Product Lead | Vision, MVP, roadmap, backlog, user value. |
| UX Lead | User flows, Telegram Mini App UX, event cards, onboarding, empty states. |
| Community Manager | User feedback, beta users, community health, support context. |
| Growth Strategist | Sharing, invitations, retention, growth loops without feed addiction. |

Use when:

- designing a new feature;
- changing event flow;
- changing onboarding;
- evaluating user feedback;
- deciding what belongs in MVP.

## Engineering Council

| Role | Responsibility |
|---|---|
| Tech Lead | Architecture, code safety, stack decisions. |
| Frontend Lead | React, TypeScript, Vite, Telegram UI, frontend performance. |
| Backend Lead | Supabase Edge Functions, business logic, API boundaries. |
| Supabase Steward | Schema, migrations, RLS, Storage, data boundaries. |
| Security Lead | Auth, secrets, abuse prevention, Telegram trusted auth. |

Use when:

- changing architecture;
- touching Supabase;
- touching auth/RLS/secrets;
- changing core data flow;
- adding non-trivial technical surface.

## Delivery Council

| Role | Responsibility |
|---|---|
| QA Lead | Tests, regressions, beta readiness, bug reproduction. |
| Release Manager | CI, Vercel, release notes, deployment checks. |
| Sprint Planner | Sprint plans, priorities, backlog sequencing. |
| Incident Commander | Critical failures, rollback coordination, incident notes. |

Use when:

- preparing release;
- fixing production/beta blocker;
- deciding next sprint;
- handling broken CI/Vercel/build/test.

## Knowledge Council

| Role | Responsibility |
|---|---|
| Archivist | DOCS_INDEX, Bible, audit, ADR, source-of-truth control. |
| Knowledge Curator | Lessons learned, anti-patterns, glossary, best practices. |
| Technical Writer | README, setup instructions, user/dev guides, API docs. |

Use when:

- adding or moving docs;
- defining source of truth;
- writing onboarding docs;
- documenting decisions;
- cleaning historical artifacts.

## Market Council

| Role | Responsibility |
|---|---|
| Market Analyst | Competitors, feature benchmarks, UX patterns, trends. |
| Research Lead | User interviews, JTBD, hypotheses, feedback synthesis. |
| Business Strategist | Monetization, pricing, partnerships, business model. |

Use when:

- new feature idea appears;
- competitor behavior may influence decision;
- market position changes;
- monetization or growth is discussed.

## AI Operations Council

| Role | Responsibility |
|---|---|
| AI Coordinator | Assigns correct role/council to task and prevents duplicated work. |
| Prompt Engineer | Maintains prompts, task templates, AI rules. |
| Replit Operator | Coordinates Replit Agent usage. |
| GitHub Operator | Coordinates GitHub commits, repo checks, CI inspection. |

Use when:

- task spans tools;
- Replit and GitHub both need to be used;
- an agent needs a standard prompt;
- repo-level operations are needed.

## Role assignment commands

| User command | Required behavior |
|---|---|
| `Беру тебя Архивариусом` | Read Archivist Charter, AI Roles, DOCS_INDEX, then work as Archivist. |
| `Беру тебя Tech Lead` | Read technical docs and evaluate safe implementation path. |
| `Беру тебя Product Lead` | Read roadmap, backlog, market positioning, Bible MVP scope. |
| `Беру тебя QA Lead` | Read beta/testing docs and focus on verification. |
| `Беру тебя Market Analyst` | Read market docs, competitor watch, and feature benchmarks. |
| `Созови Executive Council` | Analyze from CAIO, Product, Tech, Archivist perspectives. |
| `Созови Engineering Council` | Analyze from Tech, Frontend, Backend, Supabase, Security perspectives. |
| `Созови Market Council` | Analyze from market, research, business perspectives. |
| `Созови Delivery Council` | Analyze from QA, release, sprint, incident perspectives. |

## Decision escalation

If roles disagree:

1. State the disagreement clearly.
2. Separate product, technical, QA, security, market, and documentation concerns.
3. Identify risk of doing nothing.
4. Identify smallest safe next step.
5. Escalate to Chief AI Officer if a final decision is needed.

## Documentation requirement

Any new or changed role must be recorded in:

```text
docs/onboarding/AI_ROLES.md
docs/governance/AI_ORGANIZATION.md
DOCS_INDEX.md
```

If a role receives production-sensitive authority, create a dedicated charter before using it.

## Current status

This organization is a governance draft.

The first fully documented role is:

```text
Project Archivist
```

Other roles are registered and will receive detailed charters later.
