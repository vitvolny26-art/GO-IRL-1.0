---
title: GO IRL Market Positioning
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-30
next_review: 2026-08-20
---

# GO IRL Market Positioning

Status: **current product source of truth for market positioning**
Scope: GO IRL Release Preparation, Olomouc first
Last updated: 2026-07-30

## Positioning layers

This document separates:

1. **Current release positioning** — what GO IRL is now and what may be communicated for the current release.
2. **Long-term platform direction** — approved future direction that is not current release marketing or implementation authorization.

The long-term platform direction must not weaken current release scope, density, trust, operational readiness, or the Activities-first product loop.

## Current lifecycle context

Closed Beta was completed on 2026-07-20. The current phase is **Release Preparation and focused post-beta stabilization**. Broad public launch is not yet claimed.

The six categories used during Closed Beta remain a proven Olomouc baseline and historical acceptance evidence. They are no longer an automatic lifecycle restriction, but category or vertical expansion still requires an explicit reviewed product decision.

## Current release core thesis

GO IRL must not compete as another event calendar.

**GO IRL is a Telegram-first local meetup layer for small real-life activities.**

The product turns a weak intent into a real meeting:

```text
create Activity -> share in Telegram -> people join -> Activity Chat -> people show up in real life
```

The main current user problem is not lack of calendars. The main problem is that people see or discuss plans online but do not reliably convert them into real-life attendance.

## Current release product promise

**Less scrolling. More living.**

Practical product promise:

> Create a small local meetup in under a minute, share it in Telegram, see who joined, chat with participants, and meet in real life.

## Current release: who we are

GO IRL is:

- a Telegram Mini App for local micro-meetups;
- a structured layer above Telegram chats;
- a tool for simple real-life Activities nearby;
- a lightweight social trust layer through organizer, host, participants, and Activity Chat;
- Olomouc-first, with future expansion to Czech cities and Europe.

## Current release: who we are not

GO IRL is not:

- an event calendar like GoOut or Eventbrite;
- a ticketing platform;
- a sport-only app like Opponent, Squaddler, or Sportual;
- a dating app;
- a heavy community CRM;
- a social feed;
- an Instagram-style content product;
- a club membership system;
- a general Services marketplace;
- a booking, billing, payment, or subscription product;
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

This list remains the default release baseline. Adding or exposing categories requires a reviewed product decision and must not weaken release stability, Activity density, or the core attendance loop.

## MVP must-have product loop

P0 loop:

```text
open Telegram
-> see local Activities nearby
-> understand card in 3 seconds
-> tap Join
-> see who else joined
-> open Activity Chat
-> show up in real life
```

P0 features:

- stable Activity cards;
- Activity creation in 30-60 seconds;
- Telegram share link;
- join state;
- participant count and capacity;
- Activity Chat;
- basic profile/avatar;
- organizer/host visibility;
- browser mock mode for testing without Telegram.

## Release-preparation non-goals

Do not build during Release Preparation without an explicit reviewed product decision:

| Feature | Why not now |
|---|---|
| Ticketing/payments | Creates legal, finance, security, and support risk before release operations are proven |
| Services/Beauty production pilot | Requires a separate roadmap gate, privacy model, and protected-change approvals |
| Club CRM | Too heavy before release operations are proven |
| Subscriptions/premium | No validated retention or provider willingness to pay yet |
| AI recommendations | Too early without real Activity and attendance data |
| Complex profiles | Slows onboarding |
| Ratings/reviews | Can damage early community warmth and create unsafe reputation effects |
| Post-event albums/feed | Increases screen time, not arrival rate |
| Direct messages | Telegram already covers this |
| Many cities | Dilutes Olomouc density |
| Big map interface | Useful later, not necessary for the core loop |
| Full recurring engine | P1 after manual repeat behavior is proven |

## Product decisions

### Current release positioning

Use:

> Telegram Mini App for local micro-meetups: sport, coffee, walks, board games, and language exchange.

Avoid:

> Event calendar for Olomouc.

Avoid:

> Social network for events.

Avoid:

> Sport matching app.

Avoid for current release:

> Marketplace for Activities and Services.

### Host / Coach wording

Current code may keep the Coach concept for sport-specific MVP.

Product wording should be broader where needed:

- **Organizer**: person who created the Activity.
- **Host**: person who will be there and helps the group start.
- **Coach**: sport-specific helper for training/newcomer support.

Do not turn Coach into a paid marketplace before the basic Activity loop is stable and a monetization track is separately approved.

## Long-term platform direction

GO IRL is building toward a real-life coordination platform with two separately governed product domains:

1. `Activities` — people organize or join shared real-life Activities.
2. `Services` — people discover, select, and schedule real-life Services with Professionals.

Future platform promise:

> Move from intention to a completed real-life Activity or Appointment with minimal coordination friction.

The two domains may share platform capabilities such as identity, cities, localization, trust and safety, moderation, notifications, analytics, APIs, backend infrastructure, and clients.

They must retain separate domain models, user flows, privacy boundaries, trust models, and success measures.

`Activity` is the main entity of Activities. Services use `Service`, `Availability`, `Booking`, and `Appointment`.

Beauty is the first and only approved future Services vertical. Other Services verticals require separate evidence and Product Owner approval.

## Commercial positioning boundary

GO IRL may later offer low-fee professional tools to validated `Offline Enablers` — people or organizations that receive repeat operational or commercial value by bringing people into completed offline participation.

Potential Offline Enablers may include professional organizers, Beauty professionals, trainers, guides, tour operators, instructors, teachers, studios, clubs, and other approved roles.

This direction does not authorize current commercial claims.

Current boundaries:

- current participants and clients are not being sold a subscription or payment product;
- casual community organizers must retain a free path for occasional Activities;
- no public price, tariff, commission, subscription, billing, or payment processing is authorized;
- no paid ranking, paid trust, marketplace placement, or pay-to-win discovery is authorized;
- Services positioning must not be used in current release marketing until a pilot is separately approved;
- any commercial model requires usage evidence, willingness-to-pay validation, and Product Owner, legal, finance, security, and technical approval.

## Expansion strategy

### Stage 1: Olomouc release preparation

Goal:

- preserve the proven conversion from small Activities into real attendance;
- verify release operations before a broad public-launch decision.

Focus:

- proven six-category baseline unless a reviewed decision changes it;
- Telegram sharing;
- host trust;
- Activity Chat;
- manual community seeding;
- support, monitoring, analytics, moderation, Vercel, Telegram, and Supabase readiness.

Primary metrics:

- created Activities;
- join rate;
- participant count per Activity;
- chat activation;
- attendance confirmation if available;
- repeat organizers;
- repeat participants.

### Stage 2: Czech Activities expansion

Next cities only after Olomouc has density and release operations are stable:

- Prague;
- Brno;
- Ostrava;
- Plzen;
- Hradec Kralove;
- university/expat hubs.

Do not expand by empty city catalog. Expand by host/community supply.

### Stage 3: Europe Activities expansion

Best wedge:

- expats;
- students;
- newcomers;
- Telegram-heavy communities;
- sport and language exchange as repeatable anchors.

### Separate future Services validation

Services and Beauty do not inherit the Activities city-expansion sequence automatically.

A Services pilot requires its own segment, location, provider supply, privacy and safety model, support ownership, operational readiness, and success criteria.

## Strategic guardrail

For current Activities work, every new feature must pass this test:

> Does this make it easier for people to leave the chat and meet in real life?

For future Services work, the corresponding test is:

> Does this make it easier to move from service intent to a trusted completed Appointment with less coordination friction?

If neither answer is supported by evidence and an authorized roadmap stage, the work is future scope or should be rejected.
