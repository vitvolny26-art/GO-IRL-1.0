# GO IRL Bible

# Book VII

## Beta Readiness and Operations

Version 1.0 Draft

Status: Current MVP boundary / beta operations

---

## Purpose

This book defines what it means for GO IRL to be ready for closed beta.

The beta goal is not to prove every future platform idea.

The beta goal is to prove the core loop:

```text
create event -> share event -> people join -> event chat -> people meet in real life
```

Everything else is secondary until this loop is stable.

---

## Product boundary for closed beta

GO IRL closed beta is:

```text
Telegram-first local meetup layer for Olomouc.
```

GO IRL closed beta is not:

- event calendar;
- ticketing platform;
- sport-only app;
- dating app;
- social feed;
- club CRM;
- marketplace;
- AI recommendation platform;
- multi-city event catalog.

The product slogan remains:

```text
Less scrolling. More life.
```

Russian version:

```text
Меньше скроллинга. Больше жизни.
```

---

## Olomouc beta scope

The first beta city is:

```text
Olomouc, Czech Republic
```

The beta should stay geographically narrow until the real-life loop is stable.

Canonical beta categories:

```text
Volleyball
Running
Walking
Coffee meetup
Board games
Language exchange
```

These categories are enough to test:

- sport meetups;
- casual social meetups;
- low-pressure newcomer meetings;
- indoor and outdoor scenarios;
- weather-sensitive and non-weather-sensitive events;
- small-group trust behavior.

Do not expand categories before beta stability unless there is a clear product reason.

---

## Beta-ready MVP features

A beta-ready GO IRL build must support:

1. Opening inside Telegram Mini App.
2. Opening in browser demo mode without Telegram.
3. Viewing local Olomouc activities.
4. Creating an activity.
5. Sharing an activity through Telegram-compatible link flow.
6. Opening a shared activity.
7. Joining or requesting to join according to visibility.
8. Showing participant state clearly.
9. Opening temporary Activity Chat for allowed users.
10. Supporting the Sport Coach MVP boundary without claiming future marketplace behavior.
11. Showing weather information without blocking the event flow.
12. Saving profile basics without breaking demo mode.
13. Running lint, build, and test gates before release.

---

## Telegram Mini App constraints

Production identity must come from Telegram Mini App trusted auth flow.

Browser fallback and `initDataUnsafe` are not trusted production auth.

The Mini App must:

- open reliably from Telegram;
- not close unexpectedly;
- use explicit close/back behavior;
- respect Telegram client constraints;
- avoid hidden background work assumptions;
- keep user actions obvious and reversible where possible.

Testing must happen in real Telegram clients, not browser only.

---

## Browser Demo Mode

Browser Demo Mode exists for safe development and beta demonstration.

Expected demo identity:

```text
id: 999999
name: Vit_Test
```

Demo rules:

- browser without Telegram must not show a black screen;
- demo writes must not touch production Supabase;
- demo data must stay clearly separated from production identity;
- successful demo saves should show:

```text
Изменения сохранены (Демо-режим)
```

Demo mode is not production auth.

---

## Activity Chat boundary

Activity Chat exists only to help people meet in real life.

It is not a general messenger.

Allowed MVP use cases:

- clarify arrival place;
- ask quick event questions;
- coordinate equipment;
- warn about delay;
- confirm who is coming.

Not MVP scope:

- direct messages;
- public channels;
- feed behavior;
- stickers/reactions as engagement loops;
- complex moderation console;
- permanent chat history.

Current schema audit notes that the existing migration uses temporary chat expiry from chat creation time. If product wants event-end + 24 hours, that requires a separate approved Supabase/code task.

---

## Share and join boundary

The share flow must serve the real event loop.

Expected direction:

```text
Telegram Mini App direct link -> target activity -> join/request -> chat -> real meeting
```

Share text should not push users into app-store style installation behavior.

Bug report must not reuse share text.

The `/join/:id` browser route is a fallback and preview surface, not a full public ticketing landing page.

---

## Weather boundary

Weather helps users decide whether the real-life event is practical.

Weather must not become a separate product surface.

MVP behavior:

- use Open-Meteo style no-key weather source;
- show useful forecast for events inside supported forecast range;
- for events outside forecast range, show a clear message instead of fake precision;
- weather failure must not block creating, opening, sharing, or joining an event.

---

## Sport Coach beta boundary

Sport Coach in beta is a helper for sport activities.

Current MVP scope:

- organizer can signal coach/help need;
- request state can be shown;
- Sport Coach is connected to the activity context.

Not current MVP scope:

- coach marketplace;
- payments;
- verified coach badge;
- public rating/review product;
- universal Event Roles;
- advanced role marketplace.

Future roles can exist only after Sport Coach proves value.

---

## QA gates

Before a beta release, the project must pass:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

Manual beta checks must include:

- Telegram Mini App open;
- browser demo open;
- create event;
- share event;
- open shared event;
- join/request flow;
- participant state;
- Activity Chat access;
- weather display/fallback;
- profile save;
- bug report path;
- Vercel deployment state;
- Supabase table/migration status.

No beta claim is valid if lint/build/test are red.

---

## Release gates

A beta release is allowed only when:

- latest `main` is deployed on Vercel;
- no known blocker breaks the core loop;
- Telegram trusted auth path is configured or the build is explicitly marked as private/demo-only;
- Supabase migrations required for the enabled features are applied and verified;
- Browser Demo Mode cannot write production data;
- share links do not redirect to irrelevant app-store flow;
- Activity Chat behavior is clear and temporary;
- documentation matches the actual code and schema enough to prevent wrong future patches.

---

## Non-goals before beta

Do not add before closed beta stability:

- payments;
- subscriptions;
- ticketing;
- full admin CRM;
- dating vertical;
- direct messages;
- social feed;
- RLI public score;
- AI event discovery;
- AI recommendations;
- multi-city expansion;
- complex public profiles;
- complete coach marketplace;
- big module registry rewrite.

---

## Definition of beta ready

GO IRL is beta ready when one new user can understand and complete this path without developer help:

```text
open GO IRL in Telegram -> find or create local event -> share it -> another person joins -> both can coordinate -> people meet offline
```

If that path is stable, the beta is valuable.

If that path is broken, future features do not matter yet.
