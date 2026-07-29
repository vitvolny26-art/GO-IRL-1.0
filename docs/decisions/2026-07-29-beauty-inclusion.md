---
title: Beauty Inclusion Decision
owner: Product Owner
status: Approved
source_of_truth: false
work_id: BEAUTY001
parent_work_id: BOOKING001
decision_date: 2026-07-29
---

# Beauty Inclusion Decision

## Decision

GO IRL Beauty is approved as a permanent part of the intended future GO IRL product structure.

Beauty is not treated as an optional research branch to be discarded from the product vision. It is the first approved service-booking vertical inside GO IRL Booking.

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
└── Booking
    └── Beauty
```

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

This decision changes the intended future product vision: GO IRL is not limited only to group Activities. The platform may also support bounded real-life appointment verticals under a separate Booking domain.

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
GO IRL supports vertical experiences with separate UX, rules, privacy, and safety models | GH:docs/GO_IRL_CONSTITUTION.md@a149ae21aff7165a77ce7b1dc10190341a065d21 | Architectural compatibility only
BEAUTY001 already defines the bounded Beauty booking domain and pilot sequence | GH:docs/GO_IRL_BEAUTY_PRODUCT_BRIEF.md@f68148ed54a7c5e0f297c8ffe8098c082de6f6cf | Draft branch artifact
