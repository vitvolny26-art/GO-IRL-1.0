---
title: Beauty Inclusion and Services Terminology Decision
owner: Product Owner
status: Approved
source_of_truth: false
work_id: BEAUTY001
parent_work_id: BOOKING001
domain: Services
decision_date: 2026-07-29
---

# Beauty Inclusion and Services Terminology Decision

## Decision

GO IRL Beauty is approved as a permanent part of the intended future GO IRL product structure.

Beauty is not treated as an optional research branch to be discarded from the product vision. It is the first approved vertical inside the GO IRL Services domain.

Approved future structure:

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
    └── Beauty
```

## Terminology

The approved product terminology is:

- `Services` — the top-level product domain for professional and personal services;
- `Beauty` — the first vertical inside Services;
- `Service` — a specific offer provided by a professional;
- `Booking` — the client process of selecting a service and an available time;
- `Appointment` — the resulting scheduled record with date, time, parties, and status;
- `Availability` — the rules and blocked periods used to calculate bookable time.

`Appointments / Services` must not be used as one combined architectural label. `Services` is the domain; `Booking` is a process; `Appointment` is a domain entity.

The historical work identifier `BOOKING001` remains unchanged for traceability. It does not define the approved long-term product-domain name.

## Product boundary

Beauty is part of GO IRL because it converts online coordination into a real in-person appointment. It must not be implemented as an ordinary Activity or reuse the public event join/chat model as its primary domain flow.

Beauty owns its own:

- professional profile and public booking page;
- services, duration, price, preparation instructions, and buffers;
- working hours and blocked time;
- appointment states;
- client contact privacy;
- confirmation, rescheduling, cancellation, reminders, and no-show rules;
- calendar and messaging integration boundaries.

Beauty may reuse shared GO IRL platform capabilities such as identity, localization, trust and safety, notifications, common UI primitives, links, analytics, and future multi-client APIs.

## Scope effect

This decision changes the intended future product vision: GO IRL is not limited only to group Activities. The platform may also support bounded real-life service verticals under a separate Services domain.

This decision does not by itself authorize immediate production implementation or override current release priorities.

## Delivery rule

The delivery path remains:

1. BEAUTY001 — product definition.
2. BEAUTY002 — UX specification.
3. BEAUTY003 — technical architecture and privacy review.
4. BEAUTY004 — local or mock-data prototype.
5. BEAUTY005 — explicitly approved pilot implementation.

Schema, SQL, migrations, RLS, authentication, secrets, provider credentials, production configuration, deployment, and production-data changes require separate explicit approval.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
Product Owner explicitly approved including Beauty in GO IRL | USER:conversation-2026-07-29 | Product-vision inclusion decision
Product Owner explicitly approved `Services` as the domain, `Booking` as the process, and `Appointment` as the resulting entity | USER:conversation-2026-07-29 | Product terminology decision
GO IRL supports vertical experiences with separate UX, rules, privacy, and safety models | GH:docs/GO_IRL_CONSTITUTION.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Architectural compatibility only
BEAUTY001 already defines the bounded Beauty service and appointment flow | GH:docs/GO_IRL_BEAUTY_PRODUCT_BRIEF.md@f68148ed54a7c5e0f297c8ffe8098c082de6f6cf | Draft branch artifact
