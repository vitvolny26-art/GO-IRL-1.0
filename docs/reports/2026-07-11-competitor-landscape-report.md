---
title: Competitor Landscape Report
owner: Market Analyst
status: Review
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-08-11
---

# Competitor Landscape Report — GO IRL

## Status

This report is an AI-assisted market analysis input.

It is not a source of truth by itself. Any product decision from this report must be checked against:

- `docs/MARKET_POSITIONING.md`
- `docs/COMPETITOR_WATCH.md`
- `docs/market/CONTINUOUS_COMPETITOR_INTELLIGENCE.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `DOCS_INDEX.md`

GitHub remains the source of truth.

## 1. Positioning thesis: GO IRL vs market

GO IRL does not compete directly with event calendars or social feeds.

Its niche is:

```text
A lightweight structured social layer on top of Telegram.
```

Main competitor:

```text
Endless scrolling and the habit of postponing real life.
```

GO IRL answers a different question than classic event platforms.

Classic event platforms ask:

```text
What is happening in the city?
```

GO IRL asks:

```text
Who can I go with, and how do we actually meet?
```

Core import filter:

```text
Does this help people leave the chat and meet in real life faster?
```

If the answer is no, the feature stays out of beta scope.

## 2. Competitor segments

### A. Sport social apps

Reference players:

- Opponent.app
- Squaddler
- Sportual

Borrow:

- sport-specific event cards;
- skill levels;
- participant limits;
- beginner-friendly labels;
- clear sport context.

Reject:

- sport-only positioning;
- club CRM complexity;
- heavy team-management tools before beta.

### B. Messenger-based organizers

Reference player:

- Squaddle for WhatsApp

Borrow:

- no-download flow;
- simple in/out status;
- organizer time saving;
- lightweight RSVP mechanics.

Strategic interpretation:

```text
GO IRL should become for Telegram what Squaddle is for WhatsApp.
```

This is a positioning input, not a scope expansion decision.

### C. Invitation and event-page tools

Reference players:

- Partiful
- Luma
- Apple Invites

Borrow:

- strong event-page energy;
- high-quality share previews;
- clear RSVP flow;
- visible social proof: who else is going.

Reject before beta:

- post-event photo albums;
- social feeds;
- heavy guest questionnaires;
- event websites that move users away from Telegram.

### D. Community and friend-discovery platforms

Reference players:

- Meetup
- Meet5
- Timeleft

Borrow:

- trust in host/captain;
- group safety language;
- beginner-friendly event copy;
- confidence that a real person is organizing.

Reject before beta:

- paid membership;
- heavy group creation flows;
- broad discovery marketplace;
- social-network-style identity layers.

### E. Aggregators and ticketing platforms

Reference players:

- GoOut
- Eventbrite
- Facebook Events

Role for GO IRL:

```text
Supply signals, not direct product models.
```

Use them to understand local rhythm, event density, and category demand.

Do not copy:

- ticketing;
- event marketplace model;
- public ratings;
- promoter dashboards;
- commercial organizer tooling.

## 3. Feature Import Queue

### P0 — Critical for beta

These directly support the core loop:

```text
create event -> share -> join -> chat -> real attendance
```

P0 features:

- event cards that answer the key question in 3 seconds;
- one-tap Join;
- participant count and capacity;
- temporary event chat;
- Telegram sharing;
- basic organizer/profile trust;
- clear time and location;
- browser demo mode for testing without Telegram.

### P1 — After stabilization

These may improve coordination after the beta loop is stable:

- Maybe / cannot go status;
- waitlist;
- intensity or difficulty labels;
- recurring event templates;
- host badges;
- co-hosts;
- better beginner support copy.

### P2 — Scaling

These belong after proof of the Olomouc loop:

- curated meetup formats;
- partner venues;
- reputation or Trust Score;
- broader city expansion;
- deeper discovery;
- community-level analytics.

## 4. Red lines before beta

Do not build before beta:

1. Ticketing and payments.
2. AI recommendations.
3. Complex profiles.
4. Content feeds.
5. Direct messages.
6. Public ratings and reviews.
7. Club CRM.
8. Subscriptions or premium plans.
9. Broad multi-city catalog.
10. Dating/friends/travel/lifestyle verticals.

Reason:

These features increase surface area, legal/security risk, moderation burden, or scrolling behavior before the core real-life loop is proven.

## 5. Monitoring methodology

Recommended cadence:

| Review type | Cadence | Focus |
|---|---|---|
| Light review | Monthly | New mechanics, local competitors, Telegram Mini Apps, RSVP/share patterns. |
| Deep review | Quarterly | Landscape refresh, positioning drift, feature import queue, red-line validation. |
| Triggered review | As needed | New direct competitor, major Telegram platform change, beta feedback pattern. |

Priority monitoring areas:

- Telegram Mini Apps for events or communities;
- local Czech/Ostrava/Olomouc/Prague event tools;
- sport meetup coordination;
- RSVP mechanics;
- share previews;
- host verification and trust patterns;
- beginner-friendly event language.

## 6. Accepted strategic interpretation

GO IRL should follow the strategy:

```text
Lightweight Social Layer
```

Meaning:

- keep Telegram as the default social graph;
- reduce friction instead of replacing users' existing chats;
- structure the event loop just enough to make real attendance happen;
- borrow mechanics from sport/invitation/community products;
- reject feed, marketplace, CRM, and ticketing complexity before beta.

## 7. Product decisions for current beta

Accepted:

- Keep Olomouc as the beta focus.
- Keep the six canonical beta categories.
- Keep Telegram sharing as the primary growth/coordination mechanism.
- Keep the product lightweight and mobile-first.
- Treat competitors as UX pattern sources, not roadmap owners.

Rejected before beta:

- broad multi-city expansion;
- payment/ticketing;
- CRM tooling;
- AI discovery/recommendations;
- feed mechanics;
- DM replacement;
- public rating systems.

Needs future review:

- Maybe status;
- waitlist;
- recurring event templates;
- co-hosts;
- host badges;
- curated meetup formats;
- partner venues.

## 8. Next actions

1. Keep `docs/MARKET_POSITIONING.md` as the strategic filter.
2. Keep `docs/COMPETITOR_WATCH.md` focused on signals, not scope expansion.
3. Add future competitor reports under `docs/reports/`.
4. Review Feature Import Queue monthly during closed beta preparation.
5. Do not add competitor-inspired features to MVP unless they strengthen create/share/join/chat/attendance.
