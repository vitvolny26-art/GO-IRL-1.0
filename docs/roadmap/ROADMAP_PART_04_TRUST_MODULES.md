---
title: Roadmap Part 04 — Trust and Modules
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: Trust, real attendance, modules, discovery, and Sport Coach validation
last_review: 2026-07-29
next_review: 2026-08-09
---

# Roadmap Part 04 — Trust and Modules

Canonical index: [ROADMAP.md](../../ROADMAP.md).

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
