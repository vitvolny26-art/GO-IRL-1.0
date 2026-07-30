---
title: Roadmap
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-30
next_review: 2026-08-12
---

# GO IRL Product Roadmap

GO IRL is currently a Telegram-first local meetup layer that helps people leave the chat and meet in real life. The product is being built as a platform, not as a one-off Mini App, so new work must remain compatible with future web, Android, and iOS clients.

The approved long-term direction contains two separately governed domains:

1. `Activities` — the current proven product core and release priority.
2. `Services` — a future gated domain, with Beauty as the first and only approved vertical.

This file is the canonical product roadmap. Historical sprint records remain in `docs/roadmap/SPRINT_0.md` through `docs/roadmap/SPRINT_5.md`, but they do not override this document.

Major product and architecture decisions must follow:

- [Canonical Product Philosophy](docs/bible/01-foundation/01-product-philosophy.md)
- [GO IRL Constitution](docs/GO_IRL_CONSTITUTION.md)
- [Market Positioning](docs/MARKET_POSITIONING.md)
- [Competitor Watch](docs/COMPETITOR_WATCH.md)
- [Sport Coach MVP](docs/SPORT_COACH_MVP.md)

## Current state

Closed Beta was completed on 2026-07-20. The active phase is **Release Preparation and Stabilization**. Broad public launch is not yet claimed.

Current proven baseline:

- Browser Mock Mode works for non-Telegram usage.
- Browser demo writes are local-only and must not touch production Supabase.
- Sport details include Coach and Activity Chat.
- Activity cards, time rendering, support flow, weather, and Telegram `startapp` sharing have working implementations.
- The core Activities product loop is present: create, share, join, chat, and meet in real life.

Current release gate:

- `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test`, and `git diff --check` must pass on reviewed changes.
- Real Telegram smoke verification is required before broad public launch.
- Supabase production tables, authentication, migrations, and RLS require manual production-sensitive verification.
- Vercel deployment, support, monitoring, analytics, and moderation readiness must be verified.
- Production must not depend on demo-only identity.
- Operational provider limits must be distinguished from code failures.

Do not claim public-launch-ready until the latest `main` and required operational checks provide direct evidence that this gate is green.

## Current product thesis and guardrails

GO IRL remains centered on the validated Olomouc Activities loop:

> Create a small local Activity in 30–60 seconds, share it through Telegram, let people join with minimal friction, coordinate in Activity Chat, and meet in real life.

Release and roadmap decisions must prioritize:

- fast Activity creation;
- Telegram sharing;
- one-tap Join or bounded request flow;
- participant count and capacity;
- Activity Chat;
- organizer and host trust;
- real attendance.

Before adding current Activities work, ask:

> Does this make it easier for people to leave the chat and meet in real life?

If the answer is not supported by evidence, the feature remains future scope.

Explicit current non-goals without a reviewed product decision:

- ticketing or payments;
- Services or Beauty production pilot;
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
3. Every future phase or track has an entry gate and an exit signal.
4. Product, safety, infrastructure, and operations must advance together.
5. Sport remains the reference Activities vertical until expansion is justified.
6. Historical completion does not prove current release readiness.
7. Deferred features require an explicit reviewed product decision.
8. Services must not reuse Activities as an overloaded universal domain model.
9. Beauty is the only approved Services vertical.
10. Monetization is a validation track, not authorization to implement billing or payments.
11. Future Services and monetization work must not silently displace unresolved Activities release blockers.

## Roadmap at a glance

| Phase or track | State | Product outcome | Primary gate |
|---|---|---|---|
| Phase 0 — Foundation | Complete / Historical | Safe development and release foundation | Historical record only |
| Phase 1 — MVP Core | Complete / Historical | Clear create-share-join-chat-meet loop | Preserve and verify the loop |
| Active bridge — Release Preparation and Stabilization | Active | Prove release, infrastructure, and operational readiness | Current `main` and runtime evidence |
| Phase 2 — Telegram and Notifications | Draft / Gated | Native Telegram coordination without Mini App background work | Release gate green |
| Phase 3 — Trust and Real Attendance | Draft / Gated | Trust signals based on real participation | Stable loop and explicit trust approval |
| Phase 4 — Modules and Discovery | Draft / Gated | Modular Activities product and evidence-based expansion | Olomouc and Sport evidence |
| Phase 5 — Production Growth | Draft / Gated | Safe broader Activities usage | Public-safety and operational readiness |
| Future Track A — Services and Beauty | Draft / Gated | Validate real-world service appointments without weakening Activities | Product, privacy, safety, and roadmap approval |
| Future Track B — Offline Enabler Monetization | Draft / Gated | Validate repeat professional value and willingness to pay | Usage evidence and commercial approvals |

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
**Goal:** Make the main Activities user journey clear, fast, and useful.

Core loop:

```text
create Activity -> share through Telegram -> participants join -> Activity Chat -> people meet in real life
```

Delivered or preserved scope:

- Activity cards communicate what, when, where, who, price, capacity, and join state.
- Home and discovery center on local Activities and categories.
- Activity creation and join/request flows remain fast and bounded.
- Organizers can edit Activities and review private requests.
- Empty, loading, success, and error states are treated as product requirements.

Guardrail: do not expand the MVP Core into social feed, direct messages, ticketing, payments, Services, or dating.

Source record: [`docs/roadmap/SPRINT_1.md`](docs/roadmap/SPRINT_1.md).

## Active bridge — Release Preparation and Stabilization

**State:** Active  
**Goal:** Verify the post-beta product, infrastructure, operations, and real Telegram flow before broader launch.

### Workstreams

1. **Core-loop stability**
   - Keep Activity cards readable and reliable.
   - Stabilize join state, participant count, chat, share, and organizer controls.
   - Ensure profile basics create enough trust to join.
   - Preserve the proven Olomouc baseline unless a reviewed product decision changes it.

2. **Infrastructure hardening**
   - Verify Supabase production readiness.
   - Keep migrations safe, repeatable, and explicitly approved.
   - Harden and document RLS for user, Activity, and chat data.
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
   - Improve Activity cards, creation, details, profile, and organizer UX only where needed for the current loop.
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
- Add reminders before Activity start.

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

- clear Activity cards;
- organizer and host information;
- participant count and capacity;
- Activity Chat;
- Sport Coach support for beginner comfort;
- Telegram share and join loop.

Entry gate:

- Current Activities loop is stable.
- Attendance evidence can be collected safely.
- Product, privacy, moderation, and abuse decisions are explicitly approved.

Not authorized by this roadmap:

- public Trust Score;
- public ratings or leaderboard;
- token or reward mechanics;
- geolocation attendance confirmation;
- complex reputation UI;
- automatic reuse of Activities trust calculations for Services.

Source record: [`docs/roadmap/SPRINT_3.md`](docs/roadmap/SPRINT_3.md).

## Phase 4 — Activities Modules and Discovery

**State:** Draft / Gated  
**Goal:** Evolve the stable Activities core into a modular product and expand only where product evidence supports it.

Planned scope:

- Keep Sport as the first reference module.
- Add module-specific cards, filters, and creation fields.
- Prepare Activities, Nature, Parties, Creative, and Learning as independently governed modules.
- Add discovery through search, quick filters, and simple matching by city, interest, date, and free spots.
- Expand cities through configuration rather than hard-coded forks.

Current boundary:

- Sport is the reference Activities vertical.
- Generic fallback remains for non-sport Activities.
- The proven Olomouc category baseline remains stable unless changed by reviewed evidence.
- No broad multi-city catalog before release and product validation.
- Services categories are outside this phase.

Entry gate:

- Release readiness is proven.
- Olomouc usage and attendance evidence justify expansion.
- Sport Coach evidence supports or rejects the event-role hypothesis.
- New module ownership, safety, and success metrics are defined.

Deferred:

- Friends, Travel, and Dating verticals;
- full city catalog;
- broad lifestyle expansion;
- Services and Beauty implementation;
- AI recommendations without validated product evidence.

Source record: [`docs/roadmap/SPRINT_4.md`](docs/roadmap/SPRINT_4.md).

## Phase 5 — Production Growth

**State:** Draft / Gated  
**Goal:** Prepare for broader public Activities usage after the core loop, release operations, and safety controls are stable.

Planned scope:

- Activation, join, share, and completed-Activity analytics.
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
- paid growth experiments;
- Services cross-sell or marketplace growth;
- monetization experiments.

Source record: [`docs/roadmap/SPRINT_5.md`](docs/roadmap/SPRINT_5.md).

## Future Track A — Services and Beauty

**State:** Draft / Gated  
**Goal:** Prove that GO IRL can reduce coordination friction for real-world service Appointments without weakening the Activities product.

This track is separate from Activities Phases 0–5.

### Approved boundary

- `Services` is the top-level future domain.
- `Beauty` is the first and only approved Services vertical.
- `Booking` is a process.
- `Appointment` is the resulting scheduled entity.
- `Availability` determines bookable time.
- Services must not use Activity participants, Activity Chat, Activity capacity, or join-request logic as their primary model.

### Sequence

1. **BEAUTY001 — Product definition and boundaries**
   - State: approved future direction.
   - Product entities, user roles, privacy boundaries, success measures, and non-goals are documented.

2. **BEAUTY002 — UX and information architecture specification**
   - Documentation only unless separately authorized.
   - Define Professional page, Service catalog, Availability, Booking, Appointment, cancellation, rescheduling, reminders, and client contact boundaries.

3. **BEAUTY003 — Architecture, privacy, safety, and retention review**
   - Define canonical data ownership, domain APIs, consent, retention, deletion, moderation, audit, and provider integration boundaries.
   - No SQL, migrations, RLS, auth, secrets, or production configuration without separate approval.

4. **BEAUTY004 — Local or mock-data prototype**
   - Local or isolated prototype only.
   - Must not write to production Supabase or create production dependencies.

5. **BEAUTY005 — Bounded production pilot**
   - Requires explicit Product Owner approval, roadmap activation, acceptance criteria, privacy and safety sign-off, support ownership, and all protected-change approvals.

### Entry gate

- Current release gate is green, or the Product Owner explicitly authorizes a non-displacing parallel documentation track.
- Pilot segment, location, provider supply, and success measures are defined.
- Legal, privacy, safety, support, and operational ownership are assigned.
- Architecture clearly separates Activities and Services.
- No protected production change occurs without separate approval.

### Pilot exit signals

- completed Appointments;
- reduced manual coordination;
- no avoidable double booking;
- Professional repeat usage;
- client completion, cancellation, and rescheduling behavior;
- acceptable privacy, safety, support, and operational incident levels.

### Not authorized

- production pilot date;
- broad Services marketplace;
- Services category expansion beyond Beauty;
- paid listing or ranking;
- public pricing;
- billing or payment processing.

## Future Track B — Offline Enabler Monetization

**State:** Draft / Gated  
**Goal:** Verify whether professional or recurring Offline Enablers receive enough repeat measurable value to support a small transparent fee.

`Offline Enabler` means a person or organization that receives repeat operational or commercial value by bringing people into completed offline participation.

Potential segments may include:

- professional or recurring Activity organizers;
- Beauty and other separately approved Service Professionals;
- trainers, coaches, instructors, teachers, and workshop leaders;
- guides and tour operators;
- studios, clubs, communities, and small venues when actively organizing participation.

### Entry gate

- validated repeat usage by at least one bounded Offline Enabler segment;
- evidence of saved coordination time, reduced operating cost, increased completion, or another measurable provider outcome;
- willingness-to-pay evidence from actual usage, not interview interest alone;
- a free path remains available for ordinary participants, clients, and casual community organizers;
- legal, tax, invoicing, refund, consumer-protection, finance, security, and payment-provider review;
- explicit Product Owner approval of the commercial model and public price.

### Candidate validation models

- low monthly subscription;
- free basic tier with a low-cost professional tier;
- usage-based fee after a bounded threshold;
- optional paid operational modules;
- transaction fee only if GO IRL later processes payments directly.

No model or price is selected by this roadmap.

### Guardrails

- ordinary participants and clients must not become the primary payer merely for participating;
- casual community organizers must retain a free path for occasional Activities;
- payment must not buy trust, ranking, reviews, moderation exceptions, or paid placement;
- free community Activity must remain possible;
- Activities and Services may use different pricing mechanics;
- fees must be transparent and tied to measurable operational value.

### Not authorized

- public prices;
- billing implementation;
- subscriptions;
- payment processing;
- production tax or invoicing configuration;
- paid ranking or placement;
- charging casual community organizers merely for creating an occasional Activity.

## Sport Coach validation track

Sport Coach is a bounded validation track inside Release Preparation and later trust/module decisions. It is not a universal event-role system or a paid marketplace.

Product hypothesis:

> Sport Activities with a confirmed Coach should have a higher show-up rate and higher beginner comfort than Sport Activities without a Coach.

Primary signal:

- Show-up Rate: joined users who actually attended.

Supporting signals:

- coach badge open rate;
- join-to-chat-message rate;
- join-to-attendance-confirmation rate;
- beginner comfort yes/no;
- repeat sport attendance;
- organizer coach-request conversion.

Future Event Roles may use role names appropriate to each Activities vertical, such as Game Master, Language Buddy, Guide, or Host. Do not normalize these roles or build a universal role marketplace before Sport Coach proves value.

## Decision gates

### Gate A — Release readiness

Evidence required:

- latest `main` quality checks;
- real Telegram smoke verification;
- production Supabase verification;
- deployment and operational readiness.

### Gate B — Activities product-loop stability

Evidence required:

- reliable create, share, join, chat, participant, and attendance flow;
- no unresolved release blocker in the core loop;
- sufficient organizer and participant trust signals.

### Gate C — Trust approval

Evidence required:

- reviewed domain-specific trust model;
- privacy, moderation, and abuse controls;
- explicit scope approval;
- safe attendance or completion evidence model.

### Gate D — Activities expansion evidence

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

### Gate F — Services pilot readiness

Evidence required:

- explicit Product Owner pilot approval;
- bounded Beauty segment and location;
- reviewed UX, architecture, privacy, safety, retention, and support model;
- domain separation from Activities;
- measurable pilot success and stop criteria;
- all required protected-change approvals.

### Gate G — Monetization validation readiness

Evidence required:

- repeat measurable value for a bounded Offline Enabler segment;
- actual usage and willingness-to-pay evidence;
- free community participation preserved;
- approved pricing hypothesis;
- legal, finance, tax, invoicing, refund, security, and payment-provider review;
- explicit Product Owner approval before public commercial commitment.

## Dependency chain

1. Preserve and verify Foundation and MVP Core.
2. Complete Release Preparation and Stabilization.
3. Add Telegram notifications without violating runtime boundaries.
4. Introduce Activities trust features only after explicit approval and stable attendance evidence.
5. Expand Activities modules and cities only after release and product evidence.
6. Start production-growth mechanics only after operational and public-safety readiness.
7. Progress Services documentation only when explicitly prioritized and non-displacing.
8. Start a Beauty production pilot only after Gate F is green.
9. Validate monetization only after a bounded Offline Enabler segment shows repeat measurable value.
10. Implement pricing, subscriptions, billing, or payments only after Gate G and all protected-change approvals are green.

## Historical sprint records

The following retained files preserve planning history and source traceability:

- [`docs/roadmap/SPRINT_0.md`](docs/roadmap/SPRINT_0.md) — Archived.
- [`docs/roadmap/SPRINT_1.md`](docs/roadmap/SPRINT_1.md) — Archived.
- [`docs/roadmap/SPRINT_2.md`](docs/roadmap/SPRINT_2.md) — Draft historical input.
- [`docs/roadmap/SPRINT_3.md`](docs/roadmap/SPRINT_3.md) — Draft historical input.
- [`docs/roadmap/SPRINT_4.md`](docs/roadmap/SPRINT_4.md) — Draft historical input.
- [`docs/roadmap/SPRINT_5.md`](docs/roadmap/SPRINT_5.md) — Draft historical input.

They remain available for audit and context, but this file controls current roadmap state, sequencing, gates, and scope.
