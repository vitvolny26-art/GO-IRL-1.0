---
title: Bible Product Requirements
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-10
next_review: 2026-08-10
---

# Bible Product Requirements

## Purpose

This chapter defines the current product requirements for GO IRL MVP 1.0 / MVP 1.1 beta stabilization.

It consolidates the practical PRD boundary for closed beta without expanding the project into the full future platform.

It must be read together with:

- `docs/bible/05-product-requirements-mvp-split.md`
- `docs/bible/01-foundation/03-mvp-scope-and-market-positioning.md`
- `docs/bible/02-platform-architecture.md`
- `docs/bible/03-database-and-supabase-boundaries.md`
- `docs/bible/04-modules-architecture.md`
- `docs/bible/06-ux-interaction-guidelines.md`
- `docs/bible/08-runtime-boundaries.md`
- `docs/MVP_STABILIZATION_PLAN.md`
- `ROADMAP.md`
- `BACKLOG.md`

## Product definition

GO IRL is a Telegram-first local meetup app for small real-life events.

Current closed beta focus:

```text
Olomouc, Czechia
```

Core promise:

```text
Меньше скроллинга. Больше жизни.
```

MVP goal:

```text
Help people in Olomouc create, share, join, coordinate, and attend small real-life events through a Telegram Mini App.
```

## Core product loop

The current product exists to prove one loop:

```text
create event -> share event -> participant joins -> event chat -> people attend in real life
```

Every product requirement must support this loop.

If a feature does not support create, share, join, chat, or attendance, it is future scope.

## Primary user stories

### Organizer

As an organizer, I need to:

- create a simple local event;
- set date, time, place, category, capacity, and visibility;
- share the event through Telegram;
- see participant/join state;
- coordinate with participants;
- avoid confusing production/demo behavior.

### Participant

As a participant, I need to:

- open a shared event link;
- understand what/when/where/who quickly;
- join or request to join;
- see whether I am joined or pending;
- coordinate in event chat where available;
- feel safe enough to show up.

### Beta tester

As a beta tester, I need to:

- open the app in Telegram;
- open Browser Demo Mode when not in Telegram;
- test demo events safely;
- see clear errors and demo messages;
- report bugs without accidentally sharing event text.

## MVP 1.0 requirements

MVP 1.0 is the current closed beta baseline.

Required:

- Telegram Mini App opens;
- Browser Demo Mode opens safely outside Telegram;
- Olomouc beta activities are visible;
- user can create a local activity;
- user can share an activity;
- shared link can open target activity where routing supports it;
- participant can join or request to join;
- event cards show consistent time/date/location/action state;
- event details show enough information to attend;
- profile basics can be saved safely;
- production and demo behavior are clearly separated;
- lint/build/test are green before code release claims.

## MVP 1.1 stabilization requirements

MVP 1.1 is a stabilization layer, not a broad feature expansion.

Allowed when implemented minimally:

- Sport Coach request support for sport events;
- Activity Chat restoration/stabilization;
- Browser Demo Mode hardening;
- Event Card Time Fix;
- Profile save/avatar fix;
- Bug Report Fix;
- Weather Widget with lightweight forecast boundary;
- Share Fix with Telegram Mini App direct link;
- docs and QA readiness updates.

Do not add broad new product areas during MVP 1.1 unless explicitly approved.

## Beta categories

Closed beta categories are:

- Volleyball;
- Running;
- Walking;
- Coffee meetup;
- Board games;
- Language exchange.

These categories are enough for initial density testing.

Do not add broad city/category expansion until the local loop is proven.

## Event requirements

An event/activity must support:

- title;
- category/activity type;
- description or participant note where relevant;
- date;
- time;
- city;
- location/address/location URL;
- visibility;
- capacity;
- organizer context;
- participant/join state;
- share behavior;
- optional chat/coach/weather support where implemented.

The event model must remain stable during beta stabilization.

## Event card requirements

Event cards must be clear and consistent.

They should show:

- event title;
- category or activity type;
- date and time;
- location/city;
- participant or capacity context;
- visibility/join state;
- primary action.

There must be no empty time badge or misleading placeholder.

Time rendering must be consistent across all cards.

## Event details requirements

Event detail view must answer:

- what is happening;
- when;
- where;
- who organizes;
- who can join;
- how to join;
- whether user is joined/pending;
- how to coordinate after joining.

Primary action must stay obvious.

## Create flow requirements

Create flow must be simple.

Required:

- clear required fields;
- safe validation;
- Olomouc-first defaults where appropriate;
- category alignment with beta categories;
- no production write from demo-only paths;
- understandable success/error state.

Future-only before beta:

- recurring events;
- payments;
- ticketing;
- club CRM;
- complex organizer tooling;
- multi-step public event marketing.

## Join flow requirements

Join flow must clearly show state.

Supported states may include:

- joined;
- pending;
- full;
- owner/organizer;
- private/invite-only;
- demo-only saved state.

The UI must not contradict participant count or stored join state.

## Share requirements

Share is core product behavior.

Required direction:

- Telegram Mini App direct links first;
- event ID must be preserved;
- `/join/:id` fallback route where implemented;
- Open Graph metadata for previews where implemented;
- no iOS App Store redirect replacing Mini App opening;
- bug reporting must not reuse share copy.

## Activity Chat requirements

Activity Chat exists only for event coordination.

Requirements:

- access only for allowed participants/organizers/moderators according to current backend rules;
- clear loading/empty/error states;
- temporary-event-chat wording;
- no direct-message product promise;
- no permanent social network chat promise.

Chat expiry must follow current applied schema/code until a separate approved task changes it.

## Sport Coach requirements

Sport Coach is MVP 1.1 support for sport events.

Requirements:

- help beginner comfort;
- support organizer execution;
- keep Sport Coach separate from future generic Event Roles;
- avoid marketplace/payment/rating promises unless fully implemented and approved.

Future role names such as Game Master, Host, Guide, Language Buddy, or Icebreaker are future scope.

## Profile requirements

Profile must stay minimal.

Current requirements:

- display name;
- city;
- avatar where implemented;
- save action with correct label;
- production/demo avatar boundary;
- no public social-profile expansion before beta.

Button labels must match behavior.

A save action must not be labeled as close.

## Browser Demo Mode requirements

Browser Demo Mode must support testing without Telegram.

Required:

- fake/demo user;
- demo Olomouc events;
- local/demo-only writes;
- clear demo save message;
- no production trust claim;
- no production data pollution.

Required message:

```text
Изменения сохранены (Демо-режим)
```

## Weather requirements

Weather is attendance support.

MVP boundary:

- no API key requirement;
- lightweight event-time forecast;
- icon, temperature, condition;
- wind/rain details where surfaced;
- clear fallback for events outside forecast range.

Required fallback copy:

```text
Прогноз будет за 7 дней
```

Weather must not block core create/join/share flow.

## Bug report requirements

Bug report action must be separate from share.

Requirements:

- no copy of event share text;
- no `window.alert` as production reporting UX;
- open Telegram support link or feedback form where implemented;
- future feedback table requires separate approved task.

## Quality requirements

For code changes:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

Do not claim a release or beta state unless checks pass on the latest relevant branch.

Docs-only changes may skip local checks, but the report must state that they were not run.

## Non-goals before beta

Do not build before core loop stability:

- public RLI score;
- Community Score;
- achievements;
- full recommendation engine;
- people search;
- social graph;
- direct messages;
- full notification automation;
- attendance verification;
- automatic calendar sync;
- full review product;
- complex settings surface;
- broad module switching;
- multi-city discovery;
- AI event discovery;
- dating-style profile fields;
- club CRM;
- payments or ticketing.

## Acceptance criteria for closed beta

Closed beta PRD is satisfied when:

1. Telegram Mini App opens.
2. Browser Demo Mode opens safely.
3. User can browse Olomouc beta activities.
4. User can create an activity.
5. User can share an activity.
6. Another user can open the shared activity.
7. Join/request state works.
8. Temporary Activity Chat is accessible only to allowed users.
9. Profile basics can be saved safely.
10. Weather does not block core event flow.
11. Bug report path does not reuse share text.
12. Lint/build/test are green.
13. Vercel deployment is green.

## Product decision filter

Before adding a feature, ask:

1. Does it directly support create/share/join/chat/attend?
2. Is it required for Olomouc closed beta?
3. Does it reduce confusion or social fear?
4. Does it preserve Telegram-first behavior?
5. Does it keep demo and production separated?
6. Does it avoid schema/auth/RLS risk?
7. Can it pass quality gates without broad refactor?

If the answer is no, defer.

## Final PRD rule

The current GO IRL PRD is:

```text
Prove that people in Olomouc can use a Telegram Mini App to create, share, join, coordinate, and attend real-life events.
```

Everything else is future until the loop is stable.
