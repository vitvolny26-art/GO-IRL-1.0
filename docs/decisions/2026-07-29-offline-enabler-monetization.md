---
title: Offline Enabler Monetization Principle
owner: Product Owner
status: Approved Direction
source_of_truth: false
work_id: MONETIZATION001
decision_date: 2026-07-29
---

# Offline Enabler Monetization Principle

## Decision

GO IRL may use a low-fee business model for people and organizations that create, organize, schedule, guide, teach, host, or otherwise make real-world participation happen.

The common product category is:

> `Offline Enabler` — a person or organization whose work converts online intent into a real activity, appointment, trip, lesson, training session, or other completed offline experience.

This is a future monetization direction. It does not authorize pricing, billing, payments, subscriptions, provider onboarding, production configuration, or public commercial commitments.

## Intended payer groups

Potential Offline Enablers include:

- beauty professionals and other service providers;
- recurring or professional activity organizers;
- tour operators and guides;
- trainers, coaches, and instructors;
- teachers, tutors, mentors, and workshop leaders;
- studios, clubs, local communities, and small venues when they actively organize attendance;
- wellness and personal-service professionals;
- other future roles that reliably bring people into real-world participation.

The category is based on product behavior, not job title. A payer should receive direct operational or commercial value from GO IRL.

## User-side principle

The recommended future default is:

- participants and clients can discover, join, or book with minimal or no platform fee;
- casual non-commercial organizers should not be forced into a professional plan merely for creating an occasional activity;
- professional, recurring, or revenue-generating Offline Enablers may pay a small fee for operational capabilities.

This recommendation requires validation and is not yet an approved pricing policy.

## Value exchange

A future fee must correspond to measurable value, such as:

- public professional or organizer page;
- scheduling and availability management;
- appointment or participant management;
- reminders and notifications;
- secure cancellation and rescheduling;
- repeat-event or repeat-client tools;
- calendar integration;
- attendance and completion analytics;
- trust, verification, support, and moderation capabilities;
- reduced manual coordination;
- higher conversion from online interest to completed offline participation.

GO IRL should not charge merely for visibility or create a pay-to-win ranking system.

## Candidate commercial models for later validation

Possible models to test later:

1. low monthly subscription per active Offline Enabler;
2. free basic tier with a low-cost professional tier;
3. usage-based fee after a bounded number of completed appointments or activities;
4. optional paid operational modules;
5. transaction fee only if GO IRL later processes payments directly.

No model is selected by this decision. Pricing must be tested against retention, provider value, support cost, local purchasing power, and legal/accounting requirements.

## Product guardrails

- Monetization must not increase passive screen time.
- Ordinary participants must not become the primary payer merely for joining real life.
- Payment must not buy public trust, ranking, reviews, or safety exceptions.
- Free community activity must remain possible.
- The platform must distinguish commercial professionals from casual community organizers.
- Fees must be transparent and proportionate to delivered value.
- No subscription, payment, or billing implementation may begin without a separate approved product, legal, finance, and technical task.

## Relationship to Activities and Services

```text
GO IRL
├── Activities
│   └── professional or recurring Offline Enablers
└── Services
    └── professional Offline Enablers
```

Examples:

- Beauty professional: service catalog, availability, appointments, reminders.
- Trainer: sessions, participant capacity, schedule, attendance.
- Tour operator or guide: routes, dates, capacity, participant coordination.
- Professional organizer: recurring activities, participants, reminders, analytics.

Activities and Services may use different pricing mechanics because their value delivery and operating models differ.

## Validation requirements

Before pricing is approved, GO IRL should verify:

- which Offline Enablers receive repeat measurable value;
- how much coordination time or operational cost is saved;
- whether they earn revenue or achieve another important outcome through the platform;
- willingness to pay after real usage, not only interview interest;
- whether a subscription, usage fee, or optional module is easier to understand;
- whether the model preserves free community participation;
- support, tax, invoicing, refund, consumer-protection, and payment-provider implications.

## Governance effect

This decision adds a long-term monetization principle to the future GO IRL vision.

It does not override the current roadmap, which treats payments, subscriptions, premium plans, and paid growth as gated future scope. It does not authorize any production or public pricing change.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
Product Owner wants a future minimal fee from masters, organizers, tour operators, trainers, and other people who bring users offline | USER:conversation-2026-07-29 | Future monetization direction
Current roadmap gates payments, subscriptions, premium plans, and paid growth behind explicit review | GH:ROADMAP.md@main | Current canonical implementation boundary
GO IRL measures value through completed real-life participation rather than screen time | GH:docs/PRODUCT_PHILOSOPHY.md@main; GH:docs/GO_IRL_CONSTITUTION.md@main | Product-value alignment
