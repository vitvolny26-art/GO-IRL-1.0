---
title: GO IRL Beauty Product Brief
owner: Product Lead
status: Draft
source_of_truth: false
work_id: BEAUTY001
parent_work_id: BOOKING001
last_review: 2026-07-29
next_review: 2026-08-05
---

# GO IRL Beauty Product Brief

## Decision

GO IRL Beauty is the first bounded industry vertical inside the proposed GO IRL Booking capability. It is designed for independent beauty professionals who coordinate appointments through phone calls, notebooks, WhatsApp, Instagram, Messenger, or ad hoc calendar entries.

BEAUTY001 authorizes product discovery, workflow definition, and prototype planning only. It does not authorize production schema, SQL, migrations, RLS, authentication, secrets, provider credentials, deployment, production configuration, or production-data changes.

## Relationship to GO IRL

GO IRL Beauty remains inside the GO IRL platform because it supports the same real-world outcome: convert online coordination into a real in-person meeting. It must not be implemented as an ordinary activity or event category.

Proposed platform structure:

```text
GO IRL
├── Activities
└── Booking
    └── Beauty
```

Shared platform primitives may include identity, localization, public profile components, notifications, calendar export, links, common UI, trust, and safety. Beauty-specific booking state must remain isolated from the ordinary event join/chat model.

## Problem evidence

The initial observed professional:

- keeps bookings in a notebook and phone;
- communicates primarily through WhatsApp and phone calls;
- serves Czech clients who do not consistently use Telegram;
- manually negotiates available times;
- risks missed messages, forgotten appointments, and conflicting slots;
- lacks a reliable self-service reschedule or cancellation flow.

This is one direct discovery case. It is sufficient to define a pilot hypothesis, but not to claim broad market validation.

## Target user

Primary professional:

- independent nail technician, hairstylist, lash specialist, brow specialist, makeup artist, or similar solo beauty operator;
- based initially in Czechia;
- works alone or with no more than one assistant;
- has one primary location;
- manages appointments manually;
- does not require complex rooms, equipment, inventory, deposits, payroll, or staff rotation in the first pilot.

Primary client:

- books from a public browser link;
- does not need Telegram or a GO IRL account;
- can use Czech, Russian, or English UI;
- provides a name and one contact method;
- receives a clear booking state and a secure change link.

## Product promise

For the professional:

> One place to define services, working hours, unavailable time, and upcoming appointments without manually negotiating every slot.

For the client:

> Open a link, choose a service and available time, receive confirmation, and change the appointment without installing another app.

## Core hypotheses

Primary hypothesis:

> GO IRL Beauty reduces weekly manual appointment coordination while maintaining zero confirmed double bookings.

Supporting hypotheses:

1. Clients will use a browser booking link even when the original conversation started in WhatsApp or by phone.
2. A solo professional can maintain accurate availability with simple weekly hours and manual time blocks.
3. Manual confirmation is sufficient for the first pilot.
4. Reminders and self-service changes reduce missed appointments and repetitive messaging.
5. Beauty is a sufficiently coherent first segment to validate the wider GO IRL Booking model.

## Beauty-specific domain boundary

Beauty appointments require dedicated concepts:

- Beauty Professional;
- Beauty Service;
- Service Category;
- Service Duration;
- Preparation Instructions;
- Price;
- Buffer Time;
- Working Hours;
- Time Block;
- Appointment;
- Client Contact;
- Appointment Status;
- Cancellation Rule;
- Reminder Preference;
- optional internal note.

The module must not reuse ordinary event participant lists, capacity, public event chat, organizer approval, or attendance mechanics as the primary booking model.

## Initial service categories

The pilot may support a bounded list:

- nails;
- hair;
- lashes;
- brows;
- makeup;
- massage or body care only if the provider confirms it fits the same non-medical workflow;
- other custom beauty service.

Categories are presentation helpers, not separate architectures.

## Professional journey

### Setup

1. Enable Beauty mode.
2. Create a public professional page.
3. Add display name, location, contact policy, and short description.
4. Create services with price, duration, optional buffer, and preparation instructions.
5. Define weekly working hours.
6. Add unavailable periods.
7. Choose manual confirmation for the pilot.
8. Receive a public booking link.

### Daily operation

1. Open today or week view.
2. Review pending and confirmed appointments.
3. Confirm, decline, reschedule, or cancel.
4. Add a booking received by phone or WhatsApp.
5. Block personal or unavailable time.
6. Mark completed or no-show.

Manual entry is mandatory because a large share of the pilot professional's clients may continue to contact her outside the public link.

## Client journey

1. Open the public link in any modern browser.
2. Review professional identity, location, services, price, duration, and rules.
3. Choose one service.
4. Choose an available day and time.
5. Enter name and one approved contact method.
6. Accept the booking and privacy notices.
7. Submit the request.
8. Receive pending or confirmed status.
9. Use a bounded secure link to cancel or request another slot.

## MVP scope

### Must have

- one professional per public page;
- one location;
- service name, category, duration, price, description, preparation instructions;
- weekly working hours;
- manual time blocks;
- available-slot generation;
- manual appointment creation by the professional;
- public browser booking link;
- client name and one contact channel;
- pending, confirmed, declined, cancelled, completed, and no-show states;
- professional day and week appointment views;
- client cancellation and reschedule request link;
- clear timezone handling;
- Czech, Russian, and English capability through existing localization patterns;
- no mandatory Telegram login;
- explicit privacy and consent copy before collecting client contact data.

### Should have after the core flow is validated

- Google Calendar synchronization;
- WhatsApp confirmations and reminders after consent and provider verification;
- automatic confirmation for selected services;
- repeat-client shortcuts;
- configurable cancellation window;
- service buffers;
- basic appointment analytics;
- reminder delivery status.

### Explicitly deferred

- online payments, deposits, subscriptions, or invoicing;
- marketplace discovery and advertising;
- public ratings and reviews;
- staff, rooms, chairs, equipment, or multi-location scheduling;
- inventory and consumables;
- loyalty program;
- unified WhatsApp, Instagram, Messenger, Telegram, SMS, and email inbox;
- AI scheduling assistant;
- autonomous marketing campaigns;
- medical records or regulated health workflows;
- complex CRM automation.

## UX information architecture

Professional navigation:

```text
Beauty
├── Today
├── Calendar
├── Appointments
├── Services
├── Availability
├── Public page
└── Settings
```

Client-facing page priority:

1. professional identity and trust;
2. service selection;
3. available time;
4. price and duration;
5. location;
6. preparation and cancellation rules;
7. contact details and confirmation state.

## Critical states

The UX specification must explicitly cover:

- no services;
- no working hours;
- no available slots;
- slot became unavailable before submission;
- pending professional confirmation;
- confirmed appointment;
- professional decline;
- client cancellation;
- reschedule requested;
- appointment changed by professional;
- reminder delivery unavailable;
- invalid or expired secure change link;
- network failure;
- timezone mismatch warning;
- professional temporarily stops accepting bookings.

## Privacy and trust boundary

The public page may expose only professional-approved public information. Client contact details must not appear in public activity, chat, profile, or discovery surfaces.

Before technical implementation, the project must define:

- lawful purpose and consent copy for contact collection;
- data retention period;
- who can read client details;
- secure link expiry and revocation;
- abuse and spam protection;
- deletion and correction path;
- provider-specific WhatsApp consent requirements;
- separation from public GO IRL profile data.

## Pilot

Pilot design:

- 3 to 5 independent beauty professionals;
- Czechia-first, preferably Olomouc and nearby;
- 4 weeks;
- at least 50 real booking attempts;
- no online payments;
- manual support;
- one primary professional as the design partner;
- both public-link and manually entered appointments tracked.

## Success metrics

Primary:

- zero confirmed double bookings;
- at least 60% of pilot appointment attempts initiated through the public link by the end of the pilot;
- at least 30 minutes of reported weekly coordination time saved per professional;
- at least 3 of 5 professionals choose to continue;
- no critical client-contact privacy incident.

Secondary:

- booking completion rate;
- median professional confirmation time;
- percentage of manually entered appointments;
- cancellation and reschedule rate;
- no-show rate;
- reminder delivery success;
- client support incidents;
- weekly active professional use;
- percentage of clients completing without Telegram.

## Failure signals

Pause, narrow, or reject the experiment if:

- professionals must recreate nearly every booking manually;
- clients consistently refuse the link;
- confirmed slot conflicts occur;
- professionals cannot keep availability current;
- privacy and verification requirements outweigh pilot value;
- the solo-professional model immediately requires staff/resource scheduling;
- the work destabilizes the existing GO IRL activity loop;
- current release blockers are displaced without an explicit priority decision.

## Delivery sequence

### BEAUTY001 — Product brief

Status: Draft.

Output:

- segment decision;
- problem and hypotheses;
- module boundary;
- MVP scope;
- user journeys;
- privacy questions;
- pilot and success criteria.

### BEAUTY002 — UX specification

Required output:

- professional onboarding;
- service editor;
- availability editor;
- manual appointment creation;
- day and week calendar;
- public booking flow;
- confirmation, decline, cancellation, and rescheduling;
- empty, loading, success, conflict, and error states;
- Czech-first copy map with Russian and English fallbacks.

### BEAUTY003 — Technical architecture review

Required review:

- dedicated domain model;
- public API and secure-link boundaries;
- idempotent reservation and conflict prevention;
- browser client identity and contact verification;
- privacy, retention, and access model;
- notification and Google Calendar integration;
- rollout, observability, and rollback;
- review by Tech Lead, Security Lead, Supabase Steward, QA Lead, and Product Lead.

No schema or protected technical change is authorized by BEAUTY003 planning alone.

### BEAUTY004 — Local prototype

- browser-first mock implementation;
- local or mock data only;
- no production Supabase writes;
- no provider credentials;
- usability testing with the design partner;
- measured task completion and confusion log.

### BEAUTY005 — Approved pilot implementation

Requires explicit approval after BEAUTY002–004 evidence.

Potential implementation scope:

- reviewed schema and RLS;
- safe booking API;
- pilot professional setup;
- notifications;
- calendar integration;
- monitoring and support runbook;
- rollback plan.

## Approval gates

Before implementation begins:

- Product Owner explicitly approves GO IRL Beauty as a bounded experiment;
- BEAUTY002 UX flows are reviewed;
- BEAUTY003 architecture and privacy model are reviewed;
- exact pilot professionals and acceptance criteria are identified;
- conflict prevention is designed at the data boundary;
- protected changes receive their own explicit approval;
- the work is sequenced without silently overriding current release priorities.

## Current recommendation

Proceed with BEAUTY002 as a docs-only UX specification. Do not start database, auth, RLS, provider, calendar, or production integration work yet.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
GO IRL architecture permits distinct vertical experiences with independent data, UI, privacy, and notification rules | GH:docs/vertical-experiences.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Vertical architecture guidance on inspected main commit
A materially different booking flow must not be forced through the ordinary event model | GH:docs/vertical-experiences.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Beauty booking boundary only
The existing booking brief defines the initial beauty professional case and browser-first booking hypothesis | GH:docs/GO_IRL_BOOKING_PRODUCT_BRIEF.md@b9ad217558bae6d808a42d98785ac95826e00247 | Parent BOOKING001 branch scope only
Current roadmap keeps broad module expansion gated behind release and product evidence | GH:ROADMAP.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Product sequencing on inspected main commit
The initial notebook, phone, and WhatsApp workflow comes from the owner's supplied discovery material | USER:conversation-2026-07-29 | Initial case only; not broad market validation
