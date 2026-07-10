---
title: Bible Platform Architecture
owner: Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-10
next_review: 2026-08-10
---

# Bible Platform Architecture

## Purpose

This chapter defines the current GO IRL platform architecture for MVP 1.0 / MVP 1.1 beta stabilization.

It describes how the product should be understood before changing code, but it must not override current implementation, Supabase schema, auth, RLS, or release notes.

## Architecture principle

GO IRL is a small Telegram-first local meetup application, not a broad social platform yet.

Current architecture must optimize for:

- stable Telegram Mini App runtime;
- small real-life event loop;
- Olomouc beta scope;
- safe Browser Demo Mode;
- Supabase-backed production data;
- minimal code changes before beta;
- clear boundaries between current MVP and future platform ideas.

## Current runtime layers

```text
Telegram Mini App / Browser Demo
        ↓
React + TypeScript + Vite frontend
        ↓
Client state and feature modules
        ↓
Supabase client
        ↓
Supabase database, RLS, Edge Functions, realtime where enabled
        ↓
Telegram verified identity for production paths
```

## Frontend layer

The frontend is the main application surface.

Current stack:

- React;
- TypeScript;
- Vite;
- pnpm;
- mobile-first UI;
- Telegram Mini App helpers;
- Supabase client integration.

Frontend responsibilities:

- render event feed and details;
- create and edit activities;
- join public/private activities;
- show participant states;
- expose event chat and coach panels where currently implemented;
- support share/join routes;
- support Browser Demo Mode;
- keep production/demo behavior clearly separated;
- show UX states without requiring destructive backend changes.

## State layer

Client state must remain simple and predictable.

It may coordinate:

- loaded activities;
- joined/pending participant IDs;
- selected city;
- demo profile and demo events;
- sync/loading/error states;
- selected/opened activity;
- temporary UI state.

Do not rewrite the state layer for small fixes.

Before changing store behavior, check all usages and verify the change through lint, build, and tests.

## Supabase layer

Supabase is the production backend for MVP data.

Current responsibilities:

- activities;
- participants;
- private join requests;
- profiles where implemented;
- activity chat tables where implemented;
- trusted Telegram auth verification through Edge Functions;
- RLS-protected data access.

Supabase-sensitive files and behavior are production-critical.

Do not change:

- schema;
- migrations;
- RLS;
- auth;
- Edge Function trusted auth behavior;
- secrets;
- destructive SQL;

without explicit approval.

## Trusted auth boundary

Production identity must come from verified Telegram `initData`.

High-level flow:

```text
Telegram.WebApp.initData
        ↓
Supabase Edge Function verifyTelegramInitData
        ↓
verified session / JWT
        ↓
Supabase RLS-protected access
```

`initDataUnsafe`, browser fallback identity, and demo identity are not production trust sources.

Do not weaken this boundary during UX, docs, or bugfix work.

## Browser Demo Mode

Browser Demo Mode exists for testing, onboarding, and local review outside Telegram.

Demo mode must:

- open without Telegram;
- use a fake/demo user;
- show Olomouc demo events;
- keep writes local/demo-only;
- avoid writing misleading data to production Supabase;
- clearly communicate demo save behavior.

Demo mode must not become a second production auth path.

## Telegram Mini App layer

Telegram Mini App is the primary runtime.

Current expectations:

- app opens from Telegram;
- `startapp` share links route users to target events;
- lifecycle helpers can call ready/expand/back behavior;
- Mini App must not close unexpectedly;
- closing must be an explicit user action;
- browser fallback routes must not replace Telegram-native behavior.

## Event loop architecture

The product architecture exists to support one loop:

```text
create event -> share -> participants join -> event chat -> people show up in real life
```

Every architecture decision should be tested against this loop.

If a technical idea does not improve create, share, join, chat, or attendance, it is not MVP-critical.

## Activity model boundary

The activity model is the core domain object.

It should remain stable before beta.

Current activity concerns:

- title/category/type;
- date/time;
- location/address/location URL;
- visibility;
- capacity;
- organizer;
- participant state;
- city;
- sport-specific fields where implemented;
- share/join behavior;
- chat/weather/profile links where currently implemented.

Do not add broad domain concepts unless product scope explicitly approves them.

## Vertical architecture boundary

GO IRL may grow into verticals later, but MVP must stay focused.

Current beta categories:

- Volleyball;
- Running;
- Walking;
- Coffee meetup;
- Board games;
- Language exchange.

Sport has the strongest vertical treatment in MVP 1.1.

Generic fallback must remain safe and simple for non-sport beta categories.

Future verticals must not destabilize current event creation, event cards, join flow, or share flow.

## Coach and chat boundary

Coach is Sport Coach only in MVP 1.1.

Coach and Activity Chat are trust/conversion features, not a generic marketplace or full social network.

They exist to reduce beginner fear and improve real attendance.

Future roles, reviews, paid coaching, or broad role marketplaces are future scope unless explicitly approved.

## Share and join architecture

Sharing is not a side feature. It is part of the core loop.

Current boundary:

- Telegram Mini App `startapp` links are primary;
- `/join/:id` is a browser fallback/opening route;
- iOS App Store redirect must not replace Mini App open behavior;
- Open Graph metadata supports shared event previews;
- bug reporting must not reuse share copy.

## Weather architecture

Weather supports real attendance decisions.

It should remain lightweight:

- no API keys for MVP weather;
- Open-Meteo-style public forecast boundary;
- event-time forecast where available;
- clear fallback when event is outside forecast range;
- no heavy weather platform expansion.

## Deployment architecture

Current beta deployment target is Vercel.

Netlify references are historical/secondary unless current release docs say otherwise.

Release readiness requires current quality gates and smoke checks, not historical deployment proof.

## Quality gates

For code changes, run:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

Do not claim beta-ready unless these pass on the latest relevant branch state.

Docs-only changes may skip local gates, but the report must say they were not run.

## Non-goals for current architecture

Do not introduce before beta without explicit approval:

- app-wide architecture rewrite;
- new state management system;
- new backend service;
- payment/ticketing architecture;
- public rating system;
- direct messages;
- dating or friends graph;
- AI recommendation engine;
- multi-city discovery platform;
- club CRM;
- destructive database changes.

## Architecture decision filter

Before changing architecture, ask:

1. Does this support the current real-life event loop?
2. Is it necessary for Olomouc beta?
3. Does it preserve trusted auth and RLS boundaries?
4. Does it keep demo writes safe?
5. Does it avoid large refactors?
6. Can it pass lint, build, and tests?
7. Does it avoid turning GO IRL into a different product?

If the answer is no, defer.

## Final rule

The best architecture for GO IRL 1.0 is the smallest architecture that reliably gets people from a shared event link to real attendance.
