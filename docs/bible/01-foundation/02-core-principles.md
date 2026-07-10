---
title: Bible Foundation - Core Principles
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-09
next_review: 2026-08-09
---

# Core Principles

## 1. Real life over screen time

GO IRL must optimize for real attendance, not for time spent inside the app.

A good session ends when the user has enough confidence to leave the screen and go outside.

Reject product patterns that create passive scrolling without improving the event loop.

## 2. The event loop is sacred

The core product loop is:

```text
create event -> share -> participants join -> event chat -> people show up in real life
```

Every MVP feature must support at least one part of this loop.

If a feature does not support the loop, it stays future scope.

## 3. Telegram-first, not Telegram-only forever

GO IRL starts inside Telegram because users already coordinate there.

MVP should make Telegram sharing, joining, and event coordination smoother.

Future web, Android, and iOS clients may exist later, but they must not break Telegram-first behavior before beta validation.

## 4. Local density beats empty scale

Olomouc first.

A small active local network is more valuable than a wide empty catalog.

Do not expand into many cities before the local beta proves:

- events are created;
- shared links bring joins;
- joined users chat or coordinate;
- people actually attend;
- organizers repeat.

## 5. Small events first

GO IRL is optimized for small real-life activities.

Small events need clarity, trust, capacity, and coordination more than advanced discovery.

Large venues, ticketing, paid promotion, and complex public event marketing are future scope.

## 6. Beginner comfort is a product requirement

Many users hesitate because they fear arriving alone or not knowing the format.

GO IRL must reduce that fear through:

- clear event details;
- visible participants and capacity;
- temporary event chat;
- organizer/host clarity;
- beginner-friendly copy;
- Sport Coach support for sport events.

## 7. Trust is built into the flow

Trust is not only a badge.

Trust comes from:

- clear time and place;
- real organizer context;
- consistent event cards;
- participants list;
- reliable join state;
- event chat;
- no hidden production/demo confusion;
- no surprise Mini App close.

## 8. Coach is sport-only in MVP 1.1

Coach means Sport Coach only.

Sport Coach exists to improve beginner comfort and show-up rate in sport events.

Future roles must use role names users understand immediately:

- Game Master;
- Language Buddy;
- Guide;
- Host;
- Icebreaker.

Do not turn Coach into a generic universal role during MVP 1.1.

## 9. Demo mode must be safe

Browser demo mode exists for testing and onboarding.

Demo mode must never write destructive or misleading data into production Supabase.

Demo users, demo events, and demo writes must remain clearly separated from verified Telegram production behavior.

## 10. Production identity must be trusted

Production identity comes from verified Telegram `initData` through the Supabase Edge Function and trusted session flow.

`initDataUnsafe`, local fallback identity, and browser demo identity are not production trust sources.

Do not weaken auth, RLS, or Supabase trust boundaries without explicit approval.

## 11. Stability before expansion

MVP 1.1 is a stabilization phase.

Prefer:

- bug fixes;
- UX clarity;
- QA gates;
- release readiness;
- consistent rendering;
- safe runtime boundaries.

Delay:

- large new verticals;
- payments;
- public ratings;
- direct messages;
- AI recommendations;
- broad city expansion.

## 12. Documentation must protect the product

Documentation must prevent accidental scope creep and unsafe implementation.

Every major doc should clearly state:

- status;
- owner;
- source-of-truth role;
- current vs future scope;
- known conflicts;
- review cadence.

If a document conflicts with current code, Supabase schema, release notes, or `DOCS_INDEX.md`, it must be audited before use.

## 13. Competitors are signals, not instructions

Competitor features must pass GO IRL filters.

Do not copy because another product has a feature.

Ask:

> Does this make it easier for people to meet in real life?

If not, reject or defer.

## 14. Privacy and safety come before growth

Growth features must not launch before basic safety boundaries are ready.

Report, block, moderation, privacy, and abuse protection are prerequisites for public social expansion.

Dating, direct messages, public ratings, and referral loops require explicit safety review.

## 15. The smallest stable product wins

A smaller reliable MVP is better than a larger confusing platform.

GO IRL earns future scope by proving the real-life loop first.
