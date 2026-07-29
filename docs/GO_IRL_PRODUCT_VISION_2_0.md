---
title: GO IRL Product Vision 2.0
owner: Product Owner / Product Lead
status: Draft — Reviewed
source_of_truth: false
work_id: VISION002
review_state: Reviewed with governance reconciliation required
last_review: 2026-07-29
next_review: 2026-08-12
---

# GO IRL Product Vision 2.0

## Vision

GO IRL is a real-life platform that helps people move from online intent and coordination into completed real-world action.

Mission:

> Less scrolling. More living.

The Product Owner-approved intended future structure contains two primary product domains:

1. `Activities` — people organize or join shared real-life activities.
2. `Services` — people discover, select, and schedule real-life services with professionals.

Both domains share the same platform foundation but keep separate product logic, privacy boundaries, data models, success measures, and user flows.

## Current authority boundary

This document records an approved future product direction, not the current shipped product or canonical delivery roadmap.

Current authority remains:

- `docs/PRODUCT_PHILOSOPHY.md` for the existing product philosophy;
- `docs/GO_IRL_CONSTITUTION.md` for current product and architecture governance;
- `docs/MARKET_POSITIONING.md` for current release positioning;
- `ROADMAP.md` for current sequencing, gates, and implementation authorization;
- verified `main` and runtime evidence for the current product state.

The current product remains an Activities-first, Telegram-first local meetup layer in Release Preparation and Stabilization. Services and Beauty do not override that release priority.

## Product structure

```text
GO IRL
├── Activities
│   ├── Generic Activity
│   ├── Sport
│   ├── Friends
│   ├── Food
│   ├── Culture
│   ├── Local Life
│   ├── Travel
│   └── Dating
└── Services
    ├── Beauty
    ├── Coaching
    ├── Lessons
    ├── Wellness
    └── Other Services
```

Only `Beauty` is currently approved inside Services. Coaching, Lessons, Wellness, and Other Services are strategic placeholders only. They require separate evidence, ownership, safety and privacy review, success criteria, and Product Owner approval before implementation.

## Shared platform foundation

The shared GO IRL platform may provide:

- identity and profiles;
- cities and locations;
- localization;
- trust and safety;
- reporting and moderation;
- notifications and reminders;
- public links and sharing;
- analytics;
- attendance or completion evidence where appropriate;
- shared UI primitives;
- backend APIs;
- responsive web and Telegram clients;
- future Android and iOS clients;
- event-driven automation;
- provider integrations;
- privacy, consent, retention, deletion, and audit controls.

Shared capability does not mean shared domain behavior. Activities and Services must not be forced through one universal flow or one overloaded domain entity.

## Activities domain

### Purpose

Activities help people organize or join shared real-life experiences.

Primary flow:

```text
create or discover
-> share
-> join or request
-> coordinate briefly
-> attend in real life
-> confirm participation where appropriate
```

### Core concepts

- Activity;
- Organizer;
- Host;
- Participant;
- Capacity;
- Join Request;
- Invitation;
- Waiting List;
- Activity Chat;
- vertical-specific role;
- Attendance;
- Visibility;
- Location;
- Activity Status.

### Current and future vertical status

#### Current reference and fallback

- `Generic Activity` — fallback flow for activities without a dedicated vertical.
- `Sport` — current reference vertical for specialized fields, Coach validation, recommendations, and trust support.

#### Constitution-listed future verticals

The current Constitution describes the following intended future verticals. Their presence in the long-term vision is not implementation authorization:

- `Friends` — casual social meetings and group connection flows;
- `Food` — meals, cafes, cuisine, budget, reservation context, and meeting format;
- `Culture` — cinema, concerts, exhibitions, performances, and public cultural activities;
- `Local Life` — neighborhood, city, community, and local utility activities;
- `Travel` — trips, routes, time windows, places, and travel coordination;
- `Dating` — a separate consent-first, safety-first vertical that must not reuse the ordinary join flow.

Friends, Travel, and Dating remain explicitly deferred by the current roadmap. Any future Activities vertical requires its own roadmap gate, owner, evidence, safety model, and success criteria.

## Services domain

### Purpose

Services help clients move from a need or conversation into a confirmed real-life appointment with a professional.

Primary flow:

```text
open professional page
-> select service
-> select available time
-> submit booking
-> receive confirmation
-> attend appointment
-> complete, cancel, or reschedule
```

### Approved terminology

- `Services` — top-level product domain;
- `Service` — a specific professional offer;
- `Booking` — the process of selecting and requesting a service and time;
- `Appointment` — the resulting scheduled record;
- `Availability` — rules and blocks used to calculate available time;
- `Professional` — the service provider;
- `Client` — the person receiving the service.

`Appointments / Services` must not be used as one combined architectural label. Services is the domain, Booking is a process, and Appointment is a domain entity.

### Core concepts

- Professional Profile;
- Service Catalog;
- Service Category;
- Duration;
- Price;
- Buffer Time;
- Preparation Instructions;
- Availability Rule;
- Time Block;
- Booking Request;
- Appointment;
- Client Contact;
- Confirmation;
- Cancellation;
- Rescheduling;
- Reminder;
- No-show;
- Calendar Integration;
- Contact and Consent Policy.

### Beauty

Beauty is the first and only currently approved Services vertical.

Initial bounded scope may include:

- nails;
- hair;
- lashes;
- brows;
- makeup;
- bounded non-medical body-care services;
- custom beauty services.

Beauty owns its own professional page, service catalog, availability, appointments, client privacy, booking flow, cancellation rules, reminders, and provider integrations.

Beauty must not reuse ordinary event participants, public Activity Chat, event capacity, or join-request logic as its primary model.

### Future Services verticals

The following are strategic possibilities only:

- Coaching;
- Lessons;
- Wellness;
- other professional or personal services.

Beauty evidence does not automatically authorize another Services vertical.

## Trust layer

GO IRL trust exists to make real-world interaction safer and more reliable, not to create public popularity rankings.

Potential platform trust capabilities:

- verified identity where proportionate;
- organizer or professional clarity;
- completion and attendance signals;
- report and moderation history;
- anti-spam and abuse controls;
- internal Trust Score;
- Real Life Index where reviewed;
- Community Contribution;
- personal Life Map;
- consent and privacy boundaries.

Trust models must differ by domain. A no-show at a public activity, a cancelled appointment, and professional misconduct must not be treated as the same event type or reputation signal.

## Communication layer

GO IRL communication is coordination-focused.

Activities may use temporary activity-bound chat.

Services may use appointment-bound notifications, secure change links, reminders, and provider-specific messaging after consent.

The platform must not become a generic permanent messenger.

Potential channels:

- Telegram;
- browser notifications where supported;
- email;
- WhatsApp after provider verification and consent;
- SMS only after a separate decision.

## Discovery layer

Activities discovery may use:

- city;
- date;
- interest;
- category;
- available places;
- trust and safety filters;
- bounded recommendations after evidence.

Services discovery may later use:

- vertical;
- service type;
- location;
- price range;
- availability;
- language;
- accessibility;
- trust and safety criteria.

Marketplace discovery, ranking, advertising, paid placement, and listing monetization are not authorized by this vision.

## Client surfaces

The intended platform surfaces are:

- Telegram Mini App;
- responsive web;
- future Android client;
- future iOS client;
- public Activity share pages;
- public Services booking pages;
- professional and organizer operational views;
- admin and moderation views where approved.

All clients must use the same backend rules and canonical data source.

## Platform architecture principles

- API first;
- backend-owned business rules;
- one canonical data source;
- event-driven notifications and analytics;
- privacy by default;
- safety by design;
- minimum required personal data;
- vertical-specific domain models;
- shared primitives only where behavior is genuinely shared;
- no permanent dependency on demo or local-only state;
- no production-sensitive changes without explicit approval.

## Product boundaries

GO IRL is not intended to become:

- an endless social feed;
- a generic messenger;
- a passive event calendar;
- an unbounded CRM suite;
- a public popularity contest;
- an unsafe dating product;
- an AI-first product without real usage evidence;
- a marketplace that prioritizes listings over completed real-world outcomes.

## Product success

Activities success is measured by real attendance, not views or screen time.

Services success is measured by reliable completed appointments, reduced coordination friction, and zero avoidable scheduling conflicts.

Platform-level success means:

> A person had an intention, used GO IRL to coordinate it, and completed a real-life activity or appointment.

## Delivery and sequencing

The current canonical delivery sequence remains controlled by `ROADMAP.md`.

For Services:

- BEAUTY001 product definition is approved as future product direction;
- BEAUTY002 UX specification may proceed as documentation when explicitly prioritized;
- BEAUTY003 technical architecture and privacy review may proceed without protected production changes;
- BEAUTY004 may be a local or mock-data prototype only;
- BEAUTY005 production pilot requires an explicit roadmap insertion, pilot acceptance criteria, and all protected-change approvals.

No date or production priority for Services is authorized by this vision. Beauty work must not silently displace unresolved release blockers or the current Activities release gate.

## Governance review findings

### Aligned with current governance

VISION002 is aligned with the current source-of-truth documents on:

- real-life outcomes over screen time;
- anti-feed and anti-generic-messenger principles;
- vertical-specific UX, rules, privacy, and safety;
- API-first and backend-owned business rules;
- shared platform capabilities across Telegram, web, and future mobile clients;
- privacy, consent, data minimization, moderation, and safety;
- evidence and approval gates before implementation.

### Governance conflicts requiring reconciliation

VISION002 intentionally extends three current canonical boundaries:

1. `docs/PRODUCT_PHILOSOPHY.md` says the main product question is what a person can do today "with other people" and defines Activity as the heart of the platform.
2. `docs/GO_IRL_CONSTITUTION.md` defines Activity as the main entity and positions GO IRL as a platform for organizing offline activities.
3. `docs/MARKET_POSITIONING.md` and `ROADMAP.md` currently position GO IRL as a Telegram-first local meetup layer and do not contain a Services delivery phase.

These are real governance differences, not wording-only differences.

### Required reconciliation before canonical adoption

Before VISION002 can become a source-of-truth document or be treated as fully reconciled on `main`, a dedicated governance change must review and, if approved, amend:

- Product Philosophy — broaden the main product question without weakening the anti-feed mission;
- Constitution — define `Activities` and `Services` as separate top-level domains and clarify that Activity is the main entity of the Activities domain, not necessarily the entire future platform;
- Market Positioning — preserve current release positioning while separating it from long-term platform positioning;
- Roadmap — add a gated Services/Beauty track without changing current release priorities by implication.

Until that reconciliation is reviewed and merged, VISION002 remains an approved future-direction draft and not canonical current product governance.

## Governance effect

This document consolidates the intended future product structure after Product Owner approval of Beauty and Services terminology.

It does not override current canonical governance, release gates, or runtime evidence. It does not authorize schema, SQL, migrations, RLS, authentication, secrets, provider credentials, production configuration, deployment, or production-data changes.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
GO IRL is governed by real-life outcomes, anti-feed principles, and Activity-centered current philosophy | GH:docs/PRODUCT_PHILOSOPHY.md@main; GH:docs/GO_IRL_CONSTITUTION.md@main | Current canonical philosophy and constitution reviewed 2026-07-29
Current market positioning is a Telegram-first local meetup layer for small real-life activities | GH:docs/MARKET_POSITIONING.md@main | Current release positioning reviewed 2026-07-29
Activities remain the current proven product core and release priority | GH:ROADMAP.md@main | Current canonical sequencing reviewed 2026-07-29
GO IRL supports vertical experiences with separate UX, rules, recommendations, privacy, and safety models | GH:docs/GO_IRL_CONSTITUTION.md@main | Architectural compatibility
Beauty is approved as a permanent future GO IRL vertical | GH:docs/decisions/2026-07-29-beauty-inclusion.md@de71be392f608fce9d2ebc9696c40a7eb76e9ec9 | Approved branch decision
Services is the approved domain name; Booking is a process and Appointment is the resulting entity | GH:docs/decisions/2026-07-29-beauty-inclusion.md@de71be392f608fce9d2ebc9696c40a7eb76e9ec9 | Approved terminology decision
Only Beauty is currently approved inside Services | USER:conversation-2026-07-29 | Current Product Owner decision scope
