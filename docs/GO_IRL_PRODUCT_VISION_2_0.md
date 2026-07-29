---
title: GO IRL Product Vision 2.0
owner: Product Owner / Product Lead
status: Draft
source_of_truth: false
work_id: VISION002
last_review: 2026-07-29
next_review: 2026-08-12
---

# GO IRL Product Vision 2.0

## Vision

GO IRL is a real-life platform that helps people move from online intent and coordination into real in-person activity.

Mission:

> Less scrolling. More living.

The platform is not limited to group meetups. Its intended future structure contains two primary product domains:

1. `Activities` — people organize or join shared real-life activities.
2. `Services` — people discover, select, and schedule real-life services with professionals.

Both domains share the same platform foundation but keep separate product logic, privacy boundaries, data models, and user flows.

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

Only `Beauty` is currently approved inside Services. Other Services verticals are future placeholders and require separate reviewed decisions before implementation.

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
- mobile web and Telegram clients;
- future Android and iOS clients;
- event-driven automation;
- provider integrations;
- privacy, consent, retention, deletion, and audit controls.

Shared capability does not mean shared domain behavior. Activities and Services must not be forced through one universal flow.

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
- Activity Role;
- Attendance;
- Visibility;
- Location;
- Activity Status.

### Approved and intended verticals

#### Generic Activity

Fallback flow for activities without a dedicated vertical.

#### Sport

Reference vertical for specialized fields, roles, recommendations, and trust support.

#### Friends

Casual social meetings and group connection flows.

#### Food

Meals, cafes, cuisine, budget, reservation context, and meeting format.

#### Culture

Cinema, concerts, exhibitions, performances, and public cultural activities.

#### Local Life

Neighborhood, city, community, and local utility activities.

#### Travel

Trips, routes, time windows, places, and travel coordination.

#### Dating

A separate consent-first, safety-first vertical. It must not reuse the ordinary join flow as its primary model.

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

Beauty is the first approved Services vertical.

Initial scope may include:

- nails;
- hair;
- lashes;
- brows;
- makeup;
- bounded non-medical body-care services;
- custom beauty services.

Beauty owns its own professional page, services, schedule, appointments, client privacy, booking flow, cancellation rules, reminders, and integrations.

Beauty must not reuse ordinary event participants, public activity chat, event capacity, or join-request logic as its primary model.

### Future Services verticals

The following are strategic possibilities, not implementation authorization:

- Coaching;
- Lessons;
- Wellness;
- Other professional and personal services.

Each future vertical requires its own evidence, owner, success criteria, privacy review, safety review, and product decision.

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

Trust models may differ between Activities and Services. A no-show at a public activity, a cancelled appointment, and professional misconduct must not be treated as the same event type or reputation signal.

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

Marketplace discovery, ranking, advertising, and paid placement are not authorized by this vision alone.

## Client surfaces

The intended platform surfaces are:

- Telegram Mini App;
- responsive web;
- future Android client;
- future iOS client;
- public share and booking pages;
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
- a marketplace that prioritizes listings over real-life completion.

## Product success

Activities success is measured by real attendance, not views or screen time.

Services success is measured by reliable completed appointments, reduced coordination friction, and zero avoidable scheduling conflicts.

Platform-level success means:

> A person had an intention, used GO IRL to coordinate it, and completed a real-life activity or appointment.

## Sequencing

Current delivery order remains gated:

1. preserve and verify the existing Activities core;
2. complete release preparation and stabilization;
3. improve notifications and operational reliability;
4. add trust and attendance evidence safely;
5. expand Activities only with evidence;
6. develop Beauty through BEAUTY001–BEAUTY005;
7. add other Services verticals only after Beauty evidence;
8. expand cities and public growth only after operational and safety readiness.

## Beauty delivery track

1. BEAUTY001 — product definition.
2. BEAUTY002 — UX specification.
3. BEAUTY003 — technical architecture and privacy review.
4. BEAUTY004 — local or mock-data prototype.
5. BEAUTY005 — explicitly approved pilot implementation.

Schema, SQL, migrations, RLS, authentication, secrets, provider credentials, production configuration, deployment, and production-data changes require separate explicit approval.

## Governance effect

This document is a draft consolidation of the intended future product structure. It does not override the active canonical roadmap, current release gates, or source-of-truth governance documents until reviewed and merged through the normal approval process.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
GO IRL is a real-life platform governed by the principle that features must support real meetings | GH:docs/GO_IRL_CONSTITUTION.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Existing platform vision
GO IRL supports vertical experiences with separate UX, rules, recommendations, privacy, and safety models | GH:docs/GO_IRL_CONSTITUTION.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Vertical architecture compatibility
Activities remain the current proven product core and release priority | GH:ROADMAP.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Current canonical sequencing
Beauty is approved as a permanent future GO IRL vertical | GH:docs/decisions/2026-07-29-beauty-inclusion.md@de71be392f608fce9d2ebc9696c40a7eb76e9ec9 | Approved branch decision
Services is the approved domain name; Booking is a process and Appointment is the resulting entity | GH:docs/decisions/2026-07-29-beauty-inclusion.md@de71be392f608fce9d2ebc9696c40a7eb76e9ec9 | Approved terminology decision
Only Beauty is currently approved inside Services | USER:conversation-2026-07-29 | Current owner decision scope
