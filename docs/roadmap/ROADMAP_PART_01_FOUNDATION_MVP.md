---
title: Roadmap Part 01 — Foundation and MVP
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: Product thesis, guardrails, roadmap principles, Foundation, and MVP Core
last_review: 2026-07-29
next_review: 2026-08-09
---

# Roadmap Part 01 — Foundation and MVP

Canonical index: [ROADMAP.md](../../ROADMAP.md).

## Product thesis and guardrails

GO IRL remains centered on the validated Olomouc loop:

> Create a small local activity in 30–60 seconds, share it through Telegram, let people join with minimal friction, coordinate in event chat, and meet in real life.

Release and roadmap decisions must prioritize:

- fast event creation;
- Telegram sharing;
- one-tap Join or bounded request flow;
- participant count and capacity;
- event chat;
- organizer and host trust;
- real attendance.

Before adding a feature, ask:

> Does this make it easier for people to leave the chat and meet in real life?

If the answer is not supported by evidence, the feature remains future scope.

Explicit non-goals without a reviewed product decision:

- ticketing or payments;
- club CRM;
- subscriptions or premium plans;
- photo albums or post-event social feed;
- public ratings or reviews;
- direct messages;
- full recurring-event engine;
- broad multi-city catalog;
- complex social profiles;
- Friends, Travel, Dating, or broad lifestyle verticals;
- AI recommendations presented as validated product value.

## Roadmap principles

1. Evidence before expansion.
2. Draft scope is not implementation authorization.
3. Every future phase has an entry gate and an exit signal.
4. Product, safety, infrastructure, and operations must advance together.
5. Sport remains the reference vertical until expansion is justified.
6. Historical completion does not prove current release readiness.
7. Deferred features require an explicit reviewed product decision.

## Roadmap at a glance

| Phase | State | Product outcome | Primary gate |
|---|---|---|---|
| Phase 0 — Foundation | Complete / Historical | Safe development and release foundation | Historical record only |
| Phase 1 — MVP Core | Complete / Historical | Clear create-share-join-chat-meet loop | Preserve and verify the loop |
| Active bridge — Release Preparation and Stabilization | Active | Prove release, infrastructure, and operational readiness | Current `main` and runtime evidence |
| Phase 2 — Telegram and Notifications | Draft / Gated | Native Telegram coordination without Mini App background work | Release gate green |
| Phase 3 — Trust and Real Attendance | Draft / Gated | Trust signals based on real participation | Stable loop and explicit trust approval |
| Phase 4 — Modules and Discovery | Draft / Gated | Modular product and evidence-based expansion | Olomouc and Sport evidence |
| Phase 5 — Production Growth | Draft / Gated | Safe broader public usage | Public-safety and operational readiness |

## Phase 0 — Foundation

**State:** Complete / Historical
**Goal:** Make the project safe to develop and release.

Delivered foundation:

- GitHub repository and CI workflow established.
- Build, TypeScript, lint, and tests configured.
- Supabase schema and RLS documented.
- Deployment and verification checklists created.
- Secrets excluded from the repository.

Historical completion notes are not current runtime evidence. Netlify references are historical; Vercel is the current deployment target.

Source record: [`docs/roadmap/SPRINT_0.md`](docs/roadmap/SPRINT_0.md).

## Phase 1 — MVP Core

**State:** Complete / Historical
**Goal:** Make the main user journey clear, fast, and useful.

Core loop:

```text
create event -> share through Telegram -> participants join -> event chat -> people meet in real life
```

Delivered or preserved scope:

- Event cards communicate what, when, where, who, price, capacity, and join state.
- Home and discovery center on local activities and categories.
- Activity creation and join/request flows remain fast and bounded.
- Organizers can edit activities and review private requests.
- Empty, loading, success, and error states are treated as product requirements.

Guardrail: do not expand the MVP Core into social feed, direct messages, ticketing, payments, or dating.

Source record: [`docs/roadmap/SPRINT_1.md`](docs/roadmap/SPRINT_1.md).
