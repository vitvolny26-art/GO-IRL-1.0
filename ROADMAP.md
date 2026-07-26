---
title: Roadmap
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-26
next_review: 2026-08-09
---

# GO IRL Product Roadmap

GO IRL is a Telegram-first local meetup layer that helps people leave the chat and meet in real life. The product is being built as a platform, not as a one-off Mini App, so new work must remain compatible with future web, Android, and iOS clients.

This file is the canonical product roadmap. Historical sprint records remain in `docs/roadmap/SPRINT_0.md` through `docs/roadmap/SPRINT_5.md`, but they do not override this document.

Major product and architecture decisions must follow:

- [GO IRL Constitution](docs/GO_IRL_CONSTITUTION.md)
- [Market Positioning](docs/MARKET_POSITIONING.md)
- [Competitor Watch](docs/COMPETITOR_WATCH.md)
- [Sport Coach MVP](docs/SPORT_COACH_MVP.md)

## Current state

Closed Beta was completed on 2026-07-20. The active phase is **Release Preparation and Stabilization**. Broad public launch is not yet claimed.

Current proven baseline:

- Browser Mock Mode works for non-Telegram usage.
- Browser demo writes are local-only and must not touch production Supabase.
- Sport details include Coach and Event Chat.
- Event cards, time rendering, support flow, weather, and Telegram `startapp` sharing have working implementations.
- The core product loop is present: create event, share, join, chat, and meet in real life.

Current release gate:

- `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test`, and `git diff --check` must pass on reviewed changes.
- Real Telegram smoke verification is required before broad public launch.
- Supabase production tables, authentication, migrations, and RLS require manual production-sensitive verification.
- Vercel deployment, support, monitoring, analytics, and moderation readiness must be verified.
- Production must not depend on demo-only identity.
- Operational provider limits must be distinguished from code failures.

Do not claim public-launch-ready until the latest `main` and required operational checks provide direct evidence that this gate is green.

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

## Active bridge — Release Preparation and Stabilization

**State:** Active  
**Goal:** Verify the post-beta product, infrastructure, operations, and real Telegram flow before broader launch.

### Workstreams

1. **Core-loop stability**
   - Keep event cards readable and reliable.
   - Stabilize join state, participant count, chat, share, and organizer controls.
   - Ensure profile basics create enough trust to join.
   - Preserve the proven Olomouc baseline unless a reviewed product decision changes it.

2. **Infrastructure hardening**
   - Verify Supabase production readiness.
   - Keep migrations safe, repeatable, and explicitly approved.
   - Harden and document RLS for user, activity, and chat data.
   - Enforce roles and permissions.
   - Maintain database verification SQL and release checklists.
   - Remove legacy local fallbacks only after production replacement is verified.

3. **Sport Coach MVP 1.1**
   - Keep Coach sport-only.
   - Stabilize coach request and confirmation flows.
   - Keep browser demo behavior local-only.
   - Show coach details and confirmed badges only from valid state.
   - Measure show-up rate and beginner comfort.

4. **Product quality and performance**
   - Improve event cards, creation, details, profile, and organizer UX only where needed for the current loop.
   - Improve empty, loading, and error states.
   - Add lazy loading, code splitting, bundle optimization, and Telegram startup improvements where evidence shows value.

5. **Release operations**
   - Verify Vercel deployment and environment configuration.
   - Verify support, monitoring, analytics, moderation, and incident readiness.
   - Run real Telegram smoke checks, including a second-account share/join flow.

### Exit criteria

This bridge is complete only when:

- the latest reviewed `main` passes all required quality checks;
- real Telegram smoke verification passes;
- production Supabase behavior and RLS are verified through approved procedures;
- production does not depend on demo-only identity;
- support, monitoring, analytics, moderation, and deployment readiness are evidenced;
- critical create-share-join-chat-meet flows have no unresolved release blocker.

## Phase 2 — Telegram and Notifications

**State:** Draft / Gated  
**Goal:** Make GO IRL feel native inside Telegram without violating Mini App runtime boundaries.

Planned scope:

- Verify BotFather menu button and Mini App URL.
- Verify Telegram `startapp` share links.
- Add backend-triggered Telegram notifications.
- Notify organizers about private join requests.
- Notify participants about approve/reject decisions.
- Add reminders before activity start.

Runtime boundaries:

- Mini App lifecycle remains explicit.
- Closing is user-triggered.
- No Mini App background polling.
- Browser demo mode must not touch production Supabase.

Entry gate:

- Release Preparation exit criteria are green.
- Notification architecture and provider behavior are reviewed.
- Required production configuration has explicit approval.

Deferred within this phase:

- evening digest;
- quiet hours and working hours;
- broad n8n notification automation;
- autonomous engagement campaigns.

Source record: [`docs/roadmap/SPRINT_2.md`](docs/roadmap/SPRINT_2.md).

## Phase 3 — Trust, Verification, and Real Attendance

**State:** Draft / Gated  
**Goal:** Build trust around real attendance without introducing unsafe or unproven reputation mechanics.

Planned scope:

- Attendance confirmation.
- Organizer-to-participant verification.
- Participant-to-participant verification only after privacy and abuse review.
- RLI history and basic profile reputation.
- Achievements tied to real participation.

Current trust baseline:

- clear event cards;
- organizer and host information;
- participant count and capacity;
- event chat;
- Sport Coach support for beginner comfort;
- Telegram share and join loop.

Entry gate:

- Current product loop is stable.
- Attendance evidence can be collected safely.
- Product, privacy, moderation, and abuse decisions are explicitly approved.

Not authorized by this roadmap:

- public Trust Score;
- public ratings or leaderboard;
- token or reward mechanics;
- geolocation attendance confirmation;
- complex reputation UI.

Source record: [`docs/roadmap/SPRINT_3.md`](docs/roadmap/SPRINT_3.md).

## Phase 4 — Modules and Discovery

**State:** Draft / Gated  
**Goal:** Evolve the stable core into a modular platform and expand only where product evidence supports it.

Planned scope:

- Keep Sport as the first reference module.
- Add module-specific cards, filters, and creation fields.
- Prepare Activities, Nature, Parties, Creative, and Learning as independently governed modules.
- Add discovery through search, quick filters, and simple matching by city, interest, date, and free spots.
- Expand cities through configuration rather than hard-coded forks.

Current boundary:

- Sport is the reference vertical.
- Generic fallback remains for non-sport activities.
- The proven Olomouc category baseline remains stable unless changed by reviewed evidence.
- No broad multi-city catalog before release and product validation.

Entry gate:

- Release readiness is proven.
- Olomouc usage and attendance evidence justify expansion.
- Sport Coach evidence supports or rejects the event-role hypothesis.
- New module ownership, safety, and success metrics are defined.

Deferred:

- Friends, Travel, and Dating verticals;
- full city catalog;
- broad lifestyle expansion;
- AI recommendations without validated product evidence.

Source record: [`docs/roadmap/SPRINT_4.md`](docs/roadmap/SPRINT_4.md).

## Phase 5 — Production Growth

**State:** Draft / Gated  
**Goal:** Prepare for broader public usage after the core loop, release operations, and safety controls are stable.

Planned scope:

- Activation, join, share, and completed-activity analytics.
- Reporting and moderation.
- Abuse protection.
- Referral loop.
- Web parity with Telegram Mini App behavior.

Entry gate:

- Latest quality checks pass on the reviewed release commit.
- Real Telegram smoke verification passes.
- Supabase production tables and RLS behavior are verified.
- Share/join flow is verified from a second Telegram account.
- Production does not depend on demo-only identity.
- Support, monitoring, moderation, analytics, and public-safety review are complete.

Not authorized before review:

- referral incentives;
- public moderation tooling;
- analytics-driven growth loops;
- large-scale city expansion;
- paid growth experiments.

Source record: [`docs/roadmap/SPRINT_5.md`](docs/roadmap/SPRINT_5.md).

## Sport Coach validation track

Sport Coach is a bounded validation track inside Release Preparation and later trust/module decisions. It is not a universal event-role system.

Product hypothesis:

> Sport events with a confirmed coach should have a higher show-up rate and higher beginner comfort than sport events without a coach.

Primary signal:

- Show-up Rate: joined users who actually attended.

Supporting signals:

- coach badge open rate;
- join-to-chat-message rate;
- join-to-attendance-confirmation rate;
- beginner comfort yes/no;
- repeat sport attendance;
- organizer coach-request conversion.

Future Event Roles may use role names appropriate to each vertical, such as Game Master, Language Buddy, Guide, or Host. Do not normalize these roles or build a universal role marketplace before Sport Coach proves value.

## Decision gates

### Gate A — Release readiness

Evidence required:

- latest `main` quality checks;
- real Telegram smoke verification;
- production Supabase verification;
- deployment and operational readiness.

### Gate B — Product-loop stability

Evidence required:

- reliable create, share, join, chat, participant, and attendance flow;
- no unresolved release blocker in the core loop;
- sufficient organizer and participant trust signals.

### Gate C — Trust approval

Evidence required:

- reviewed trust model;
- privacy, moderation, and abuse controls;
- explicit scope approval;
- safe attendance evidence model.

### Gate D — Expansion evidence

Evidence required:

- Olomouc retention and attendance signals;
- Sport Coach validation results;
- clear module or city owner;
- measurable expansion success criteria.

### Gate E — Public growth readiness

Evidence required:

- moderation and abuse protection;
- analytics and support readiness;
- public-safety review;
- stable operations under broader usage.

## Dependency chain

1. Preserve and verify Foundation and MVP Core.
2. Complete Release Preparation and Stabilization.
3. Add Telegram notifications without violating runtime boundaries.
4. Introduce trust features only after explicit approval and stable attendance evidence.
5. Expand modules and cities only after release and product evidence.
6. Start production-growth mechanics only after operational and public-safety readiness.

## Historical sprint records

The following retained files preserve planning history and source traceability:

- [`docs/roadmap/SPRINT_0.md`](docs/roadmap/SPRINT_0.md) — Archived.
- [`docs/roadmap/SPRINT_1.md`](docs/roadmap/SPRINT_1.md) — Archived.
- [`docs/roadmap/SPRINT_2.md`](docs/roadmap/SPRINT_2.md) — Draft historical input.
- [`docs/roadmap/SPRINT_3.md`](docs/roadmap/SPRINT_3.md) — Draft historical input.
- [`docs/roadmap/SPRINT_4.md`](docs/roadmap/SPRINT_4.md) — Draft historical input.
- [`docs/roadmap/SPRINT_5.md`](docs/roadmap/SPRINT_5.md) — Draft historical input.

They remain available for audit and context, but this file controls current roadmap state, sequencing, gates, and scope.