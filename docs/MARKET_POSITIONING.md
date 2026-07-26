---
title: GO IRL Market Positioning
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-08-20
---

# GO IRL Market Positioning

Status: **current product source of truth for market positioning**
Scope: GO IRL Release Preparation, Olomouc first
Last updated: 2026-07-20

## Current lifecycle context

Closed Beta was completed on 2026-07-20. The current phase is **Release Preparation and focused post-beta stabilization**. Broad public launch is not yet claimed.

The six categories used during Closed Beta remain a proven Olomouc baseline and historical acceptance evidence. They are no longer an automatic lifecycle restriction, but category or vertical expansion still requires an explicit reviewed product decision.

## Core thesis

GO IRL must not compete as another event calendar.

**GO IRL is a Telegram-first local meetup layer for small real-life activities.**

The product turns a weak intent into a real meeting:

```text
create event -> share in Telegram -> people join -> event chat -> people show up in real life
```

The main user problem is not lack of calendars. The main problem is that people see or discuss plans online but do not reliably convert them into real-life attendance.

## Product promise

**Less scrolling. More living.**

Practical product promise:

> Create a small local meetup in under a minute, share it in Telegram, see who joined, chat with participants, and meet in real life.

## Who we are

GO IRL is:

- a Telegram Mini App for local micro-meetups;
- a structured layer above Telegram chats;
- a tool for simple real-life activities nearby;
- a lightweight social trust layer through organizer, host, participants, and event chat;
- Olomouc-first, with future expansion to Czech cities and Europe.

## Who we are not

GO IRL is not:

- an event calendar like GoOut or Eventbrite;
- a ticketing platform;
- a sport-only app like Opponent, Squaddler, or Sportual;
- a dating app;
- a heavy community CRM;
- a social feed;
- an Instagram-style content product;
- a club membership system;
- an AI recommendation product before enough real usage data exists.

## Proven Closed-Beta baseline categories

The validated Olomouc baseline is:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

Why these six:

- frequent enough;
- low-cost or free;
- easy to understand;
- good for expats/newcomers;
- work in Olomouc;
- mix sport, casual social, and intellectual/social formats.

This list remains the default release baseline. Adding or exposing categories requires a reviewed product decision and must not weaken release stability, event density, or the core attendance loop.

## MVP must-have product loop

P0 loop:

```text
open Telegram
-> see local events nearby
-> understand card in 3 seconds
-> tap Join
-> see who else joined
-> open event chat
-> show up in real life
```

P0 features:

- stable event cards;
- event creation in 30-60 seconds;
- Telegram share link;
- join state;
- participant count and capacity;
- event chat;
- basic profile/avatar;
- organizer/host visibility;
- browser mock mode for testing without Telegram.

## Release-preparation non-goals

Do not build during Release Preparation without an explicit reviewed product decision:

| Feature | Why not now |
|---|---|
| Ticketing/payments | Shifts product into Eventbrite/GoOut/Luma territory and creates legal/support risk |
| Club CRM | Too heavy before release operations are proven |
| Subscriptions/premium | No validated retention yet |
| AI recommendations | Too early without real event and attendance data |
| Complex profiles | Slows onboarding |
| Ratings/reviews | Can damage early community warmth |
| Post-event albums/feed | Increases screen time, not arrival rate |
| Direct messages | Telegram already covers this |
| Many cities | Dilutes Olomouc density |
| Big map interface | Useful later, not necessary for the core loop |
| Full recurring engine | P1 after manual repeat behavior is proven |

## Product decisions

### Positioning

Use:

> Telegram Mini App for local micro-meetups: sport, coffee, walks, board games, and language exchange.

Avoid:

> Event calendar for Olomouc.

Avoid:

> Social network for events.

Avoid:

> Sport matching app.

### Host / Coach wording

Current code may keep the Coach concept for sport-specific MVP.

Product wording should be broader where needed:

- **Organizer**: person who created the event.
- **Host**: person who will be there and helps the group start.
- **Coach**: sport-specific helper for training/newcomer support.

Do not turn Coach into a paid marketplace before the basic event loop is stable.

## Expansion strategy

### Stage 1: Olomouc release preparation

Goal:

- preserve the proven conversion from small events into real attendance;
- verify release operations before a broad public-launch decision.

Focus:

- proven six-category baseline unless a reviewed decision changes it;
- Telegram sharing;
- host trust;
- event chat;
- manual community seeding;
- support, monitoring, analytics, moderation, Vercel, Telegram, and Supabase readiness.

Primary metrics:

- created events;
- join rate;
- participant count per event;
- chat activation;
- attendance confirmation if available;
- repeat organizers;
- repeat participants.

### Stage 2: Czech expansion

Next cities only after Olomouc has density and release operations are stable:

- Prague;
- Brno;
- Ostrava;
- Plzen;
- Hradec Kralove;
- university/expat hubs.

Do not expand by empty city catalog. Expand by host/community supply.

### Stage 3: Europe

Best wedge:

- expats;
- students;
- newcomers;
- Telegram-heavy communities;
- sport and language exchange as repeatable anchors.

## Strategic guardrail

Every new feature must pass this test:

> Does this make it easier for people to leave the chat and meet in real life?

If no, it is future scope or should be rejected.
