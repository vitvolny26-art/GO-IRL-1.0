---
title: GO IRL Booking Product Brief
owner: Product Lead
status: Draft
source_of_truth: false
work_id: BOOKING001
last_review: 2026-07-29
next_review: 2026-08-05
---

# GO IRL Booking Product Brief

## Decision

GO IRL Booking is a proposed service-booking vertical inside the GO IRL platform. It extends the product from group activities into scheduled one-to-one services while preserving the platform principle: help people move from online coordination to a real-life meeting.

This brief authorizes product discovery and bounded prototype planning only. It does not authorize production schema, SQL, migration, RLS, authentication, secret, deployment, provider configuration, or production-data changes.

## Problem

Independent service professionals often manage appointments through a notebook, phone calls, WhatsApp, Instagram, Messenger, and ad hoc calendar entries. This creates:

- repeated manual messaging;
- missed or forgotten appointments;
- double booking risk;
- fragmented client history;
- no reliable self-service rescheduling;
- dependence on the professional being online.

The initial observed case is a beauty professional in Czechia whose clients primarily use phone and WhatsApp rather than Telegram.

## Product hypothesis

A lightweight booking flow inside GO IRL can reduce manual coordination for independent professionals if clients can book without installing Telegram and the professional can manage availability from one place.

Primary hypothesis:

> A professional using GO IRL Booking will spend less time coordinating appointments while maintaining zero double bookings.

## Target segment

Initial segment:

- independent beauty professionals;
- solo operators or very small teams;
- Czechia-first pilot;
- appointments currently managed through phone, notebook, WhatsApp, or Google Calendar;
- no complex staff, room, inventory, or payment requirements.

Initial examples:

- nail technician;
- hairstylist;
- lash or brow specialist;
- massage therapist;
- private trainer or tutor later, if the same booking model is validated.

## Product boundary

GO IRL Booking is not a normal event category.

It must use a dedicated vertical flow because service appointments differ from events in:

- one-to-one or limited-resource capacity;
- private customer information;
- duration-based availability;
- confirmation, rescheduling, cancellation, and no-show rules;
- working hours and blocked time;
- service-specific price and preparation instructions.

Shared platform capabilities may include:

- user identity;
- public profile primitives;
- localization;
- notification infrastructure;
- calendar export;
- sharing links;
- common UI primitives;
- trust and safety controls.

Booking-specific domain concepts:

- Professional;
- Service;
- Availability Rule;
- Time Block;
- Appointment;
- Client Contact;
- Booking Status;
- Cancellation Policy;
- Reminder Preference.

## Core user journeys

### Professional setup

1. Professional enables Booking mode.
2. Creates a public service page.
3. Adds services with duration, price, and optional buffer time.
4. Defines working hours and unavailable periods.
5. Chooses manual or automatic confirmation.
6. Receives a shareable booking link.

### Client booking

1. Client opens a public web link without mandatory Telegram login.
2. Selects a service.
3. Selects an available date and time.
4. Enters name and one contact method.
5. Reviews price, location, and cancellation rules.
6. Submits the booking.
7. Receives confirmation or pending status.

### Professional management

1. Professional sees upcoming appointments in a day/week view.
2. Confirms, declines, reschedules, or cancels.
3. Blocks time manually.
4. Opens client contact details only for the relevant appointment.
5. Marks the appointment completed or no-show.

### Client change flow

1. Client opens a secure appointment link.
2. Cancels or requests another available slot.
3. Professional receives the change.
4. Both sides receive the final state.

## MVP scope

### Must have

- one professional per booking page;
- service name, duration, price, description;
- weekly working hours;
- manual blocked periods;
- generated available slots;
- public browser booking link;
- client name and one contact channel;
- pending, confirmed, cancelled, completed, and no-show states;
- professional appointment list;
- client cancellation and rescheduling link;
- confirmation and reminder event model;
- Czech, Russian, and English UI capability using the existing localization system;
- browser-safe flow that does not require Telegram.

### Should have after core validation

- Google Calendar synchronization;
- WhatsApp reminder delivery after consent and provider verification;
- recurring working-hour templates;
- service buffers;
- reusable client profiles;
- basic no-show tracking;
- booking analytics.

### Explicitly deferred

- marketplace discovery of professionals;
- subscriptions or billing;
- online payments or deposits;
- multi-location businesses;
- staff, rooms, or equipment resource scheduling;
- unified inbox for WhatsApp, Instagram, Messenger, Telegram, and SMS;
- AI scheduling assistant;
- autonomous marketing campaigns;
- public ratings and reviews;
- medical or regulated appointment workflows.

## UX structure

Proposed top-level platform structure:

```text
GO IRL
├── Activities
└── Booking
    ├── My appointments
    ├── Professional calendar
    ├── Services
    ├── Availability
    └── Public booking page
```

The client-facing public page should prioritize:

1. professional identity and trust;
2. service selection;
3. available times;
4. price and duration;
5. location;
6. cancellation rules;
7. contact and confirmation.

## Technical direction for later review

The vertical should not be implemented as ordinary activity records with overloaded metadata. A technical design review should compare:

1. dedicated booking tables;
2. reuse of shared profile and notification primitives;
3. public booking tokens with bounded access;
4. browser identity and contact verification;
5. idempotent slot reservation;
6. timezone-safe availability generation;
7. conflict prevention at the database boundary;
8. calendar-provider synchronization and retry behavior.

Any schema, SQL, migration, RLS, auth, secrets, provider credentials, or production configuration requires a separately approved technical task.

## Pilot plan

Pilot scope:

- 3 to 5 independent professionals in Olomouc or nearby;
- one vertical: beauty services;
- 4 weeks;
- at least 50 real appointment attempts;
- support handled manually during the pilot;
- no payment collection.

## Success metrics

Primary:

- zero confirmed double bookings;
- at least 60% of pilot appointments initiated through the booking link;
- at least 30 minutes of reported weekly coordination time saved per professional;
- at least 3 of 5 professionals choose to continue after the pilot.

Secondary:

- booking completion rate;
- confirmation time;
- cancellation and reschedule rate;
- no-show rate;
- reminder delivery success;
- client support incidents;
- professional weekly active use.

## Failure signals

Pause or narrow the vertical if:

- professionals continue to recreate every booking manually;
- clients refuse the public link and return to chat-only coordination;
- slot conflicts occur;
- privacy or identity requirements become disproportionate to pilot value;
- the workflow requires multi-staff resource scheduling before the solo model is validated;
- the module destabilizes the existing GO IRL activity loop.

## Delivery stages

### BOOKING001 — Product brief

Status: Draft.

Output:

- problem definition;
- target segment;
- product boundary;
- MVP scope;
- pilot metrics;
- approval gates.

### BOOKING002 — User-flow and UX specification

- professional onboarding;
- service setup;
- availability editor;
- public booking page;
- appointment management;
- cancellation and rescheduling;
- empty, loading, success, and error states.

### BOOKING003 — Technical architecture review

- domain model;
- API boundaries;
- slot locking and conflict prevention;
- privacy model;
- browser and Telegram identity paths;
- notification and calendar integration boundaries;
- migration and rollout plan.

No protected technical change is authorized at this stage.

### BOOKING004 — Local prototype

- browser-only or mock-data implementation;
- no production Supabase writes;
- no provider credentials;
- usability test with the initial professional.

### BOOKING005 — Approved pilot implementation

Requires explicit approval after BOOKING002–004 evidence.

Potential scope:

- reviewed schema and RLS;
- production-safe booking API;
- pilot professional setup;
- notification delivery;
- operational monitoring;
- rollback plan.

## Entry gates for implementation

Implementation may start only when:

- Product Owner approves GO IRL Booking as an active bounded experiment;
- BOOKING002 user flows are reviewed;
- BOOKING003 technical design is reviewed by Tech Lead, Security Lead, Supabase Steward, and QA Lead;
- privacy and consent requirements are documented;
- the work does not displace unresolved P0 release blockers without an explicit priority decision;
- exact acceptance criteria and pilot users are identified.

## Current recommendation

Proceed with BOOKING002 next. Do not start database or production integration work yet.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
GO IRL architecture supports distinct vertical experiences with their own data, UI, privacy, and notification rules | GH:docs/vertical-experiences.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Vertical architecture guidance on inspected main commit
The current product architecture warns against forcing materially different products through one universal event flow | GH:docs/vertical-experiences.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Booking boundary decision only
Current roadmap keeps major module expansion gated behind release and product evidence | GH:ROADMAP.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Product sequencing at inspected main commit
The initial problem evidence comes from a professional using notebook, phone, and WhatsApp, with many clients outside Telegram | USER:conversation-2026-07-29 | Initial discovery evidence only; not broad market validation
