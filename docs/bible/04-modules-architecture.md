---
title: Bible Modules Architecture
owner: Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-10
next_review: 2026-08-10
---

# Bible Modules Architecture

## Purpose

This chapter defines the current module and vertical architecture boundaries for GO IRL MVP 1.0 / MVP 1.1 beta stabilization.

It translates broad future module ideas into the current Olomouc beta scope.

It must be read together with:

- `docs/bible/04-modules-mvp-audit.md`
- `docs/bible/05-product-requirements-mvp-split.md`
- `docs/bible/08-runtime-boundaries.md`
- `docs/MVP_STABILIZATION_PLAN.md`
- `docs/SPORT_COACH_MVP.md`

## Architecture principle

Modules must support the real-life event loop:

```text
create event -> share -> join -> chat -> attend
```

A module is not valid for MVP just because it is useful in the future.

Every current module must improve at least one of:

- event clarity;
- event creation;
- event sharing;
- joining;
- trust;
- coordination;
- real attendance;
- beta QA stability.

## Current MVP module model

GO IRL currently uses a lightweight module model around activity categories and runtime panels.

The current product should be understood as:

```text
Core Activity System
        +
Six beta categories
        +
Sport-first specialization
        +
Generic fallback for non-sport categories
        +
Runtime panels: chat, coach, weather, profile/share/join
```

Do not introduce a large plugin system before beta.

## Six beta categories

Current Olomouc beta categories are:

- Volleyball;
- Running;
- Walking;
- Coffee meetup;
- Board games;
- Language exchange.

These categories are enough for closed beta.

Do not add more city categories unless product scope explicitly approves expansion.

## Core Activity System

The Core Activity System owns behavior shared by all categories:

- event card rendering;
- event details;
- create/edit activity flow;
- date/time/location display;
- capacity and participant state;
- visibility and join state;
- share/join behavior;
- organizer context;
- sync/loading/error states;
- demo mode behavior.

The core must stay stable before beta.

If a category-specific need would destabilize the core, defer it.

## Sport module boundary

Sport is the strongest MVP specialization.

Sport may include:

- sport-specific activity type;
- participant note;
- skill/format hints where implemented;
- Sport Coach request flow;
- beginner comfort copy;
- sport-specific trust and attendance support.

Sport must not become:

- paid coach marketplace;
- full training marketplace;
- fitness CRM;
- public coach rating platform;
- gym booking system;
- universal event role system.

## Sport Coach boundary

Sport Coach is MVP 1.1 scope only where implemented and approved.

Current product role:

- reduce beginner fear;
- help organizers host sport events;
- make sport events easier to join alone;
- support real attendance.

Future-only until approved:

- paid coach marketplace;
- public ratings as a complete shipped flow;
- verified coach badge;
- broad coach discovery;
- coach payments;
- coach subscriptions;
- coach ranking.

The existence of coach tables does not mean the full marketplace is shipped.

## Generic category fallback

Non-sport categories should use a simple generic fallback.

Generic fallback should support:

- clear event title;
- short description;
- date/time/location;
- capacity;
- participant state;
- join/share/chat;
- category-appropriate copy.

Generic fallback should avoid early over-specialization.

Do not build separate heavy modules for Coffee, Board Games, Walking, Running, or Language Exchange before beta unless the current flow breaks without it.

## Category-specific copy

Small category-specific copy is allowed when it reduces confusion.

Allowed examples:

- beginner-friendly sport hints;
- board games expectation text;
- language exchange format hint;
- walking/running pace note;
- coffee meetup casual framing.

Not allowed before beta:

- complex category-specific forms;
- separate data models;
- separate feed logic;
- separate permission systems;
- category-specific monetization.

## Activity Chat module

Activity Chat is a coordination module.

It exists to help participants show up, not to create a general social network.

Current boundary:

- event-specific;
- temporary;
- tied to activity access rules;
- visible where implemented;
- not direct messages;
- not global groups;
- not permanent community chat.

Future chat expansion requires moderation and safety review.

## Weather module

Weather is an attendance-support module.

It helps users decide what to wear, whether to attend, and how to prepare.

Current boundary:

- lightweight forecast;
- event-time context;
- no API keys for MVP weather;
- clear fallback outside forecast range;
- no full weather product.

Weather should not block event creation or joining.

## Share / Join module

Share and Join are core-loop modules.

They are not optional utilities.

Current boundary:

- Telegram Mini App direct links first;
- `startapp` where applicable;
- `/join/:id` fallback route;
- Open Graph preview support;
- no App Store redirect replacing Mini App behavior;
- bug report separated from share.

## Profile module

Profile is a lightweight identity/support module.

Current boundary:

- display name;
- city;
- avatar where implemented;
- basic saved profile state;
- joined/created context where available.

Profile is not yet:

- public social profile;
- dating profile;
- reputation dashboard;
- follower graph;
- creator page;
- long-form bio product.

## Browser Demo Mode module

Browser Demo Mode is a QA and onboarding module.

It must:

- open without Telegram;
- use a fake/demo user;
- show demo events for Olomouc;
- keep writes demo/local-only;
- clearly mark demo saves;
- avoid production data confusion.

Demo Mode is not a separate product line.

## Admin and moderation modules

Admin and moderation are not broad MVP UI modules yet.

Current boundary:

- backend/RLS rules are the security layer;
- frontend admin flags are not security;
- production admin behavior must not rely on publicly exposed keys;
- future moderation UI needs separate design.

Do not add public reporting, blocking, ratings, or moderation dashboards without safety review.

## Future module containment

Future module ideas may include:

- universal Event Roles;
- Game Master;
- Language Buddy;
- Host;
- Icebreaker;
- Guide;
- AI discovery;
- recommendations;
- reputation/RLI;
- tickets/payments;
- clubs;
- recurring groups;
- multi-city discovery.

These are future scope.

They must not leak into MVP implementation unless they pass roadmap review and beta guardrails.

## Module decision filter

Before adding or expanding a module, ask:

1. Does it directly improve create/share/join/chat/attend?
2. Is it required for Olomouc closed beta?
3. Does it preserve current schema/auth/RLS boundaries?
4. Does it avoid broad refactor?
5. Does it keep Demo Mode safe?
6. Can it pass lint, build, and tests?
7. Does it avoid turning GO IRL into another product?

If the answer is no, defer.

## Implementation rule

Before changing a module file, first check where it is used.

Small patches are allowed.

Large refactors, new dependencies, new schema, auth, RLS, or destructive SQL require explicit approval.

## Final rule

Modules exist to make local real-life events happen.

If a module does not help people show up in real life, it is not MVP-critical.
