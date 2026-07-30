---
title: Bible Product Philosophy
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-29
next_review: 2026-08-12
---

# Bible Product Philosophy

## Authority

This is the canonical Product Philosophy for GO IRL.

`docs/PRODUCT_PHILOSOPHY.md` is retained only as a legacy narrative reference and must not override this document.

## Core belief

People do not need another feed.

People need a simple bridge from intention to real-life action.

GO IRL exists because many people want to do things in real life, but the path from idea to actual attendance or completion is broken by friction:

- too much scrolling;
- unclear plans;
- low trust;
- social fear;
- fragmented chats;
- no clear host or professional;
- no simple join or booking path;
- no reminder that the goal is to show up.

## Mission

Less scrolling. More living.

This mission is not marketing decoration. It is the main product constraint.

If a feature increases time in the app but does not increase completed real-life participation, it is suspicious.

## Product promise

GO IRL helps a person answer quickly:

- What meaningful real-life thing can I do today?
- When?
- Where?
- Who is organizing or providing it?
- Can I join or book without awkward negotiation?
- Can I trust this enough to show up?

For the current Activities release, this remains the concrete question:

> What interesting thing can I do today with other people?

## Current release boundary

The current product is Activities-first, Telegram-first, and focused on small local meetups.

Until `ROADMAP.md` explicitly authorizes a Services pilot, release work must continue to prioritize:

- fast Activity creation;
- Telegram sharing;
- clear join or request flows;
- participant count and capacity;
- temporary Activity Chat;
- organizer and host trust;
- real attendance;
- release, infrastructure, safety, and operational readiness.

Future Services or monetization work must not silently displace unresolved release blockers.

## Future domain direction

The intended future platform contains two separately governed product domains:

1. `Activities` — people organize or join shared real-life activities.
2. `Services` — people discover, select, and schedule real-life services with professionals.

The domains may share identity, cities, localization, trust and safety, notifications, analytics, APIs, backend infrastructure, and clients.

They must keep separate domain logic, privacy boundaries, data models, success measures, and user flows.

`Activity` remains the main entity of the Activities domain. Services use their own concepts, including `Service`, `Availability`, `Booking`, and `Appointment`.

Beauty is the first and only approved future Services vertical. Other Services verticals require separate evidence and Product Owner approval.

## Anti-feed principle

GO IRL should not reward passive consumption.

The product should avoid:

- endless content feeds;
- vanity metrics;
- public popularity contests;
- addictive loops;
- algorithmic scrolling;
- social comparison;
- post-event content traps.

The product should reward:

- creating a real plan;
- inviting people;
- joining or booking clearly;
- coordinating briefly;
- attending or completing something in real life;
- returning because life improved offline.

## Telegram-first principle

GO IRL starts where people already coordinate: Telegram.

The app should make Telegram coordination better, not replace every social behavior with a separate network.

Telegram-first means:

- fast open from shared link;
- simple `startapp` flow;
- minimal account friction;
- Activity Chat close to the Activity;
- no unnecessary standalone social network behavior in MVP.

Telegram-first is the current release strategy, not a requirement that every future domain reuse Activity-specific behavior.

## Local-first principle

The product begins with Olomouc because local density matters more than broad catalog size.

A small city with real usage is more valuable than a large empty map.

Closed beta and release preparation should prove:

- Activity creation works;
- sharing creates joins;
- joins create useful coordination;
- coordination increases attendance;
- people are willing to return;
- operations remain safe and reliable.

## Trust principle

The hardest part is not listing options.

The hardest part is making a person comfortable enough to attend a real-life Activity or Appointment.

Trust can come from:

- clear details;
- organizer or professional clarity;
- visible and proportionate participation or availability information;
- temporary coordination close to the real-world action;
- sport coach support where appropriate;
- beginner-friendly copy;
- no surprise behavior;
- explicit privacy boundaries;
- domain-specific moderation and safety.

Trust models must differ by domain. Activity no-shows, Appointment cancellations, and professional misconduct must not be treated as the same signal.

## Small-activity principle

The current Activities product is optimized for small real-life activities, not massive events.

The release product should prefer:

- simple capacity;
- clear spots left;
- direct join;
- private join request where needed;
- short coordination window;
- real attendance.

Ticketing, large venues, paid promotion, and public event marketing remain future scope.

## Beginner comfort principle

Many users hesitate because they fear arriving alone, not knowing the rules, or feeling out of place.

GO IRL should reduce this fear through:

- Activity clarity;
- beginner-friendly category copy;
- Sport Coach for sport Activities;
- future event roles only after Sport Coach validation;
- temporary chat close to Activity details.

## MVP restraint principle

The product must resist becoming too many products at once.

During the current release phase, GO IRL is not:

- a dating app;
- a friends app;
- a travel app;
- a ticketing app;
- a club CRM;
- a city calendar;
- a generic social network;
- a general Services marketplace;
- a billing or subscription product.

It may later grow into separately governed verticals and domains, but only through explicit roadmap gates, evidence, ownership, privacy and safety review, and Product Owner approval.

## Commercial principle

A future low-fee model may serve professional or recurring `Offline Enablers` — people or organizations whose work converts online intent into completed offline participation.

Potential Offline Enablers include professional organizers, beauty professionals, trainers, guides, tour operators, instructors, teachers, studios, clubs, and other roles that receive repeat operational or commercial value from GO IRL.

Guardrails:

- ordinary participants and clients are not the primary payer merely for participating;
- casual community organizers must retain a free path for occasional Activities;
- fees must correspond to measurable operational value;
- payment must not buy trust, ranking, reviews, safety exceptions, or pay-to-win discovery;
- free community activity must remain possible;
- pricing, subscriptions, billing, invoicing, taxes, refunds, and payment processing require separate legal, finance, security, technical, and Product Owner approval.

No price or commercial model is authorized by this philosophy.

## Product quality principle

A smaller stable product is better than a larger confusing product.

Current release work should focus on:

- clear cards;
- reliable share links;
- browser demo mode;
- stable profile basics;
- safe Supabase boundaries;
- readable Activity details;
- working chat and coach areas;
- QA and operational gates before launch claims.

Future Services work must meet equivalent quality, privacy, safety, and operational standards before any production pilot.

## Success definition

Activities success means a person can say:

```text
I saw it, joined it, coordinated briefly, and actually went.
```

Future Services success means a person can say:

```text
I found the right professional, booked clearly, and completed the appointment.
```

GO IRL should be judged by completed real-life participation, not by screen time.
