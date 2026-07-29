---
title: Vision 2.0 Governance Reconciliation Proposal
owner: Product Lead
status: Draft
source_of_truth: false
work_id: GOVERNANCE001
parent_work_id: VISION002
decision_date: 2026-07-29
---

# Vision 2.0 Governance Reconciliation Proposal

## Purpose

Reconcile the approved future GO IRL direction — `Activities + Services`, Beauty as the first Services vertical, and low-fee monetization for professional or recurring Offline Enablers — with the current canonical product governance.

This proposal does not change `main`, current release priority, public positioning, pricing, billing, production configuration, or implementation authorization.

## Verified current state

Current canonical governance still defines GO IRL primarily as an Activities-first, Telegram-first local meetup layer:

- the active Bible Product Philosophy optimizes for real attendance and the create/share/join/chat/attend loop;
- `docs/GO_IRL_CONSTITUTION.md` defines `Activity` as the main entity and GO IRL as a platform for organizing offline activities;
- `docs/MARKET_POSITIONING.md` defines the current release product as a Telegram-first local meetup layer;
- `ROADMAP.md` keeps Services, payments, subscriptions, and premium plans outside the current authorized roadmap.

The future-direction branch now contains:

- `VISION002` — future structure with `Activities` and `Services`;
- `BEAUTY001` — Beauty approved as the first Services vertical;
- `MONETIZATION001` — future low-fee direction for professional or recurring Offline Enablers.

## Governance inconsistency discovered

Two Product Philosophy documents currently exist:

1. `docs/bible/01-foundation/01-product-philosophy.md` — metadata says `Active` and `source_of_truth: true`.
2. `docs/PRODUCT_PHILOSOPHY.md` — older narrative document referenced directly by the Constitution.

Before canonical adoption of Vision 2.0, governance must designate one canonical Product Philosophy path. The recommended action is to keep the active Bible document canonical and convert the older document into a clearly marked legacy or compatibility pointer. No deletion is proposed.

## Reconciliation principles

1. Preserve the current release product and its release gate.
2. Separate current market positioning from long-term platform vision.
3. Treat Activities and Services as distinct domains sharing a platform foundation.
4. Keep `Activity` as the main entity of the Activities domain, not the universal entity for all future GO IRL behavior.
5. Keep Beauty as the only approved Services vertical.
6. Keep Offline Enabler as a cross-domain commercial role, not a universal user role or reputation class.
7. Do not authorize pricing, billing, payments, subscriptions, production changes, or public commercial commitments through governance wording alone.
8. Do not displace unresolved release blockers with future Services or monetization work.

## Proposed canonical model

```text
GO IRL
├── Activities
│   ├── Activity
│   ├── Organizer / Host / Participant
│   ├── Join / Request / Capacity / Chat
│   └── Attendance
├── Services
│   ├── Professional / Client
│   ├── Service / Availability
│   ├── Booking
│   └── Appointment
└── Shared Platform
    ├── Identity and profiles
    ├── Cities and localization
    ├── Trust, safety, moderation, and privacy
    ├── Notifications and reminders
    ├── Analytics and real-world completion evidence
    ├── Telegram, web, and future mobile clients
    └── API, backend, database, event-driven automation
```

`Offline Enabler` is a cross-domain commercial category for a person or organization that receives repeat operational or commercial value by bringing people into completed offline participation.

## Proposed change 1 — Product Philosophy

### Canonical path

Recommended canonical file:

`docs/bible/01-foundation/01-product-philosophy.md`

Recommended Constitution reference:

`docs/bible/01-foundation/01-product-philosophy.md`

### Philosophy expansion

Preserve:

- Less scrolling. More living.
- anti-feed principle;
- real-world completion over screen time;
- local density and trust;
- MVP restraint;
- current Activities release loop.

Add a bounded future principle:

> GO IRL helps people move from intention to completed real-life action, either by joining an Activity or completing an Appointment with a trusted professional.

Add domain-specific success language:

- Activities success: a person discovered, joined, coordinated, and attended.
- Services success: a person selected, scheduled, and completed a real-world service with low coordination friction.

Add monetization philosophy:

- ordinary participants and clients are not the primary payer merely for participating;
- professional or recurring Offline Enablers may pay a small transparent fee for measurable operational value;
- payment never buys trust, ranking, reviews, safety exceptions, or pay-to-win discovery.

### Guardrail

The philosophy must explicitly state that the current product remains Activities-first until the roadmap authorizes a Services pilot.

## Proposed change 2 — Constitution

### Vision and main question

Current question:

> What interesting thing can I do today with other people?

Proposed future platform question:

> What meaningful real-life thing can I do today, and what is the simplest trusted path to make it happen?

The current meetup question remains valid for the Activities domain and current release positioning.

### Positioning

Replace the universal statement “GO IRL is a platform for organizing offline activities” with:

> GO IRL is a platform for converting online intent into completed real-life participation through Activities and, when separately authorized, Services.

### Domain entities

Define:

- `Activity` — main entity of Activities;
- `Service` — professional offer in Services;
- `Booking` — process of selecting and requesting a service and time;
- `Appointment` — resulting scheduled record;
- `Availability` — rules and blocks used to calculate bookable time.

Do not create one overloaded universal entity for Activities and Services.

### Vertical model

Keep existing Activities verticals under the Activities domain.

Add:

- Services as a separate domain;
- Beauty as the first and only approved Services vertical;
- Coaching, Lessons, Wellness, and Other Services as unapproved strategic placeholders only.

### Platform architecture

Extend shared platform concepts to support domain-specific state while preserving:

- API first;
- backend-owned business rules;
- one canonical database source;
- privacy and safety;
- domain-specific trust and moderation;
- event-driven notifications and analytics.

### Monetization governance

Add:

- Offline Enabler as a future commercial category across Activities and Services;
- no paid ranking or trust;
- free community activity must remain possible;
- pricing, subscriptions, billing, invoicing, taxes, refunds, and payment processing require separate approval and implementation governance.

## Proposed change 3 — Market Positioning

Split positioning into two explicit layers.

### Current release positioning

Keep unchanged:

> GO IRL is a Telegram-first local meetup layer for small real-life activities.

Keep current Olomouc, release-preparation, density, trust, and create/share/join/chat/attend language.

### Long-term platform positioning

Add a clearly labeled future section:

> GO IRL is building toward a real-life coordination platform with two separately governed domains: Activities and Services.

Future platform promise:

> Move from intention to a completed real-life activity or appointment with minimal coordination friction.

### Commercial positioning boundary

State that:

- current users are not being sold a subscription or payment product;
- future professional tools may be offered to validated Offline Enablers;
- no public price, tariff, commission, marketplace ranking, or paid placement is authorized;
- Services positioning must not be used in current release marketing until a pilot is separately approved.

## Proposed change 4 — Roadmap

Do not renumber or weaken current Phases 0–5.

Add two gated future tracks after Phase 5.

### Future Track A — Services and Beauty

**State:** Draft / Gated

**Product outcome:** Prove that GO IRL can reduce coordination friction for real-world service appointments without weakening the Activities product.

Proposed sequence:

1. BEAUTY001 — product definition and boundaries.
2. BEAUTY002 — UX and information architecture specification.
3. BEAUTY003 — architecture, privacy, safety, retention, and data-boundary review.
4. BEAUTY004 — local or mock-data prototype.
5. BEAUTY005 — bounded production pilot after explicit roadmap insertion and protected-change approvals.

Entry gate:

- current release gate is green or the Product Owner explicitly authorizes a non-displacing parallel documentation track;
- pilot segment and success measures are defined;
- legal, privacy, safety, support, and operational ownership are assigned;
- no protected production change occurs without separate approval.

Exit signals for a pilot:

- completed appointments;
- reduced manual coordination;
- no avoidable double booking;
- provider repeat usage;
- client completion and cancellation behavior;
- support and privacy incidents within accepted thresholds.

### Future Track B — Offline Enabler Monetization

**State:** Draft / Gated

**Product outcome:** Verify whether professional or recurring Offline Enablers receive enough repeat measurable value to support a small transparent fee.

Entry gate:

- validated repeat usage by at least one bounded Offline Enabler segment;
- evidence of saved time, reduced coordination cost, increased completion, or another measurable provider outcome;
- willingness-to-pay evidence from actual usage, not interview interest alone;
- legal, tax, invoicing, refund, consumer-protection, finance, security, and payment-provider review;
- explicit Product Owner approval of the commercial model and public price.

Candidate tests:

- low monthly subscription;
- free basic tier with a low-cost professional tier;
- usage-based threshold;
- optional paid operational modules;
- transaction fee only if GO IRL later processes payments.

Not authorized:

- public prices;
- billing implementation;
- subscriptions;
- payment processing;
- paid ranking or placement;
- charging casual community organizers merely for creating an occasional activity.

## Proposed governance order

1. Confirm the canonical Product Philosophy path.
2. Approve the wording changes in this proposal.
3. Apply a branch-only patch to Product Philosophy, Constitution, Market Positioning, and Roadmap.
4. Review the combined diff for contradictions and release-scope leakage.
5. Prepare a draft PR with documentation-only verification evidence.
6. Merge only after explicit Product Owner approval.
7. After merge, update the Google Drive governance copies and AI Instructions Index references where required.

## Acceptance criteria for the governance patch

The patch is acceptable only if:

- current release positioning remains Activities-first and Telegram-first;
- current release gates remain unchanged;
- Activities and Services are structurally separate;
- Beauty is the only approved Services vertical;
- monetization remains a validation track, not an implementation authorization;
- ordinary participants, clients, and casual community organizers are not made the default payer;
- no public price, billing, payment, SQL, RLS, auth, secret, deployment, or production-data change is implied;
- all canonical documents use consistent terminology;
- the duplicate Product Philosophy authority problem is explicitly resolved.

## Governance effect

This proposal is a draft reconciliation specification. It is not canonical governance and does not authorize merge or implementation.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
The active Bible Product Philosophy is marked Active and source_of_truth | GH:docs/bible/01-foundation/01-product-philosophy.md@main | Verified 2026-07-29
The Constitution currently references a different Product Philosophy file and defines Activity as the main entity | GH:docs/GO_IRL_CONSTITUTION.md@main | Verified 2026-07-29
Current release positioning is a Telegram-first local meetup layer | GH:docs/MARKET_POSITIONING.md@main | Verified 2026-07-29
Current roadmap is Activities-first and gates payments, subscriptions, premium plans, and broad vertical expansion | GH:ROADMAP.md@main | Verified 2026-07-29
Activities + Services, Beauty, and Offline Enabler monetization are approved future directions on the Vision branch | GH:docs/GO_IRL_PRODUCT_VISION_2_0.md@product/vision002-activities-services; GH:docs/decisions/2026-07-29-beauty-inclusion.md; GH:docs/decisions/2026-07-29-offline-enabler-monetization.md | Future direction only
