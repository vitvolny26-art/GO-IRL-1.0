# GO IRL Bible

# Book IV Audit

## Modules MVP Audit

Generated: 2026-07-08

Status: Current MVP boundary / future-module containment

---

## Purpose

This audit reconciles `docs/bible/04-modules-architecture.md` with the current GO IRL MVP 1.0 / closed beta scope.

It does not rewrite the historical module vision.

It defines which module ideas are current, which are future, and which must not drive beta implementation.

---

## Current MVP module reality

GO IRL MVP 1.0 is not a full multi-module platform yet.

Current beta is:

```text
Olomouc
Telegram Mini App
six beta categories
create -> share -> join -> chat -> real attendance
```

Current canonical beta categories:

```text
Volleyball
Running
Walking
Coffee meetup
Board games
Language exchange
```

These categories are enough for closed beta.

---

## Current module interpretation

For MVP 1.0, the Bible module vision must be interpreted as:

```text
one lightweight activity system
with category-specific UX hints
not a full module registry
```

The current implementation should keep using the existing architecture unless a specific task approves a change.

Do not introduce a new platform core, plugin registry, dynamic module runtime, AI module layer, or cross-module personalization during MVP stabilization.

---

## What is current

The following concepts are compatible with MVP 1.0:

| Concept | Current interpretation |
|---|---|
| Sport entry point | Volleyball and Running are important beta categories. |
| Activities / social meetups | Walking, Coffee meetup, Board games, Language exchange are valid beta categories. |
| Category-specific event cards | Allowed only as small UX polish, not a rewrite. |
| Category-specific metadata | Allowed through existing `activity_type` / `metadata` patterns. |
| Weather-sensitive activities | Running/Walking/Volleyball can use weather context. |
| Sport Coach | Current scope is Sport-first helper/request flow, not universal roles. |

---

## What is future vision

The following parts of `04-modules-architecture.md` are future vision, not MVP 1.0:

- full Platform Core extraction;
- independent module applications;
- full Sport module product;
- full Activities module product;
- Parties module;
- Nature module;
- Learning module as separate product;
- Creative module;
- Travel module;
- Business Networking;
- Gaming LAN;
- Volunteering;
- Parents & Kids;
- Pets;
- Cars / Motorcycles;
- Religion;
- University;
- Health;
- module registration system;
- dynamic module enable/disable;
- personalized module home screen;
- cross-module intelligence;
- AI module layer;
- per-module AI prompts;
- independent UX per module as separate product surfaces.

These ideas must remain in backlog/future architecture until MVP core loop is proven.

---

## Six-category beta mapping

| Beta category | Module vision source | MVP interpretation |
|---|---|---|
| Volleyball | Sport | Sport meetup with capacity/time/place coordination. |
| Running | Sport / Nature overlap | Lightweight outdoor sport meetup; no routes or GPX. |
| Walking | Activities / Nature overlap | Low-pressure casual meetup; no full hiking module. |
| Coffee meetup | Activities | Casual social meetup; no full lifestyle module. |
| Board games | Activities | Indoor group meetup; no club CRM. |
| Language exchange | Learning | Social learning meetup; no full education platform. |

---

## Sport module boundary

Sport is the strongest current entry point.

Allowed for MVP:

- sport category display;
- time/place/capacity clarity;
- simple skill/equipment hints if already supported;
- Sport Coach request boundary;
- weather context for outdoor sport.

Not allowed as implicit MVP scope:

- full sport recommendation engine;
- league system;
- training marketplace;
- payments;
- verified coaches;
- advanced gender/age filters;
- full club/team management;
- separate sport app shell.

---

## Activities boundary

The casual social layer is valid for beta, but only in small form.

Allowed for MVP:

- Coffee meetup;
- Board games;
- Walking;
- Language exchange;
- simple activity cards;
- simple join/request states;
- temporary chat.

Not allowed as implicit MVP scope:

- image-heavy discovery feed;
- mood-based browsing engine;
- recommendation engine;
- nightlife discovery;
- large public event catalog;
- venue/ticketing workflows.

---

## Learning boundary

Language Exchange is the only current learning-like beta category.

Allowed for MVP:

- language exchange as a meetup category;
- simple description and participant note;
- temporary event chat.

Not allowed as implicit MVP scope:

- full course marketplace;
- teachers/tutors marketplace;
- online preparation system;
- certificate/achievement logic;
- programming/photography/cooking vertical expansion.

---

## Nature boundary

Walking and Running can use outdoor context.

The full Nature module is future.

Not current MVP:

- GPX routes;
- hiking route database;
- map-first product;
- emergency contact system;
- equipment checklist engine;
- camping;
- family/pet filters.

---

## Parties and nightlife boundary

Parties are not closed beta scope.

Reasons:

- different safety model;
- different content expectations;
- higher moderation burden;
- stronger event-calendar/ticketing pull;
- not necessary to prove the core loop.

Keep nightlife ideas as future market research only.

---

## AI module layer boundary

AI module layer is not MVP 1.0.

AI must not become a reason to delay closed beta.

Current MVP can use human-authored categories, simple copy, and manual QA.

Any AI event discovery, recommendation, moderation, or personalization must remain future scope until the core loop is stable.

---

## Implementation guardrails

Do not create these during MVP stabilization:

```text
src/modules/* registry rewrite
module permissions system
module marketplace
per-module routing shell
cross-module recommendation engine
AI prompt registry
new Supabase module tables
new RLS policies for modules
new background workers for modules
```

Allowed small improvements:

```text
cleaner category labels
consistent event cards
better sport metadata rendering
Weather Widget polish
Share/Join polish
Browser Demo Mode safety
Sport Coach request stabilization
Activity Chat stabilization
```

---

## Final rule

Book IV remains valuable because it shows the future platform direction.

But for MVP 1.0, this is the operative rule:

```text
GO IRL is one focused Telegram Mini App for Olomouc micro-meetups, not a multi-module platform yet.
```

The multi-module platform should be built only after the beta proves that people actually meet in real life.
