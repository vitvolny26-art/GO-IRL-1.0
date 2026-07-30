---
title: Roadmap Part 05 — Growth and Decision Gates
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: Production growth, future Services and monetization tracks, decision gates, dependency chain, and historical sprint references
last_review: 2026-07-30
next_review: 2026-08-12
---

# Roadmap Part 05 — Growth and Decision Gates

Canonical index: [ROADMAP.md](../../ROADMAP.md).

## Phase 5 — Production Growth

**State:** Draft / Gated

**Goal:** Prepare for broader public usage after the core loop, release operations, and safety controls are stable.

Planned scope:

- Activation, join, share, and completed-activity analytics.
- Reporting and moderation.
- Abuse protection.
- Referral loop.
- Web parity with Telegram Mini App behavior.

Entry gate:

- Latest quality checks pass on the reviewed release commit.
- Real Telegram smoke verification passes.
- Supabase production tables and RLS behavior are verified.
- Share/join flow is verified from a second Telegram account.
- Production does not depend on demo-only identity.
- Support, monitoring, moderation, analytics, and public-safety review are complete.

Not authorized before review:

- referral incentives;
- public moderation tooling;
- analytics-driven growth loops;
- large-scale city expansion;
- paid growth experiments.

Source record: [`SPRINT_5.md`](SPRINT_5.md).

## Future Track A — Services and Beauty

**State:** Draft / Gated

**Product outcome:** Prove that GO IRL can reduce coordination friction for real-world service appointments without weakening the Activities product or displacing unresolved release blockers.

Beauty is the first and only approved Services vertical. Coaching, Lessons, Wellness, and Other Services remain strategic placeholders and require separate approval.

Proposed sequence:

1. `BEAUTY001` — product definition and boundaries.
2. `BEAUTY002` — UX and information architecture specification.
3. `BEAUTY003` — architecture, privacy, safety, retention, and data-boundary review.
4. `BEAUTY004` — local or mock-data prototype.
5. `BEAUTY005` — bounded production pilot after explicit roadmap approval and protected-change approvals.

Entry gate:

- current release gate is green, or the Product Owner explicitly authorizes a non-displacing parallel documentation or prototype track;
- pilot segment, city, provider supply, and success measures are defined;
- legal, privacy, safety, support, and operational ownership are assigned;
- Activities and Services domain boundaries are documented;
- no SQL, migration, RLS, auth, secret, production configuration, production data, deployment, or destructive change occurs without separate explicit approval.

Pilot exit signals:

- completed Appointments;
- reduced manual coordination;
- no avoidable double booking;
- Professional repeat usage;
- Client completion, cancellation, and rescheduling behavior;
- privacy, safety, support, and operational incidents remain within explicitly accepted thresholds.

Not authorized by this track:

- production Services launch;
- additional Services verticals;
- reuse of Activity participants, public Activity Chat, capacity, or join-request logic as the primary Services model;
- public Services marketing before pilot approval;
- billing or payment processing.

## Future Track B — Offline Enabler Monetization

**State:** Draft / Gated

**Product outcome:** Verify whether professional or recurring Offline Enablers receive enough repeat measurable value to support a small transparent fee.

`Offline Enabler` means a person or organization whose work converts online intent into completed offline participation, such as a professional organizer, Beauty Professional, trainer, guide, tour operator, instructor, teacher, studio, club, or another separately approved role.

Entry gate:

- validated repeat usage by at least one bounded Offline Enabler segment;
- evidence of saved time, reduced coordination cost, increased completion, revenue support, or another measurable provider outcome;
- willingness-to-pay evidence from actual usage, not interview interest alone;
- legal, tax, invoicing, refund, consumer-protection, finance, security, and payment-provider review;
- explicit Product Owner approval of the commercial model and public price.

Candidate tests:

- low monthly subscription;
- free basic tier with a low-cost professional tier;
- usage-based threshold;
- optional paid operational modules;
- transaction fee only if GO IRL later processes payments directly.

Commercial guardrails:

- ordinary participants and Clients are not the primary payer merely for participating;
- casual community organizers retain a free path for occasional Activities;
- payment does not buy trust, ranking, reviews, moderation exceptions, safety exceptions, or paid placement;
- free community activity remains possible;
- fees must be transparent and tied to measurable operational value;
- Activities and Services may require different pricing mechanics.

Not authorized by this track:

- public prices or tariffs;
- billing implementation;
- subscriptions;
- payment processing;
- invoicing or tax configuration;
- paid ranking or placement;
- charging casual community organizers merely for creating an occasional Activity.

## Decision gates

### Gate A — Release readiness

Evidence required:

- latest `main` quality checks;
- real Telegram smoke verification;
- production Supabase verification;
- deployment and operational readiness.

### Gate B — Product-loop stability

Evidence required:

- reliable create, share, join, chat, participant, and attendance flow;
- no unresolved release blocker in the core loop;
- sufficient organizer and participant trust signals.

### Gate C — Trust approval

Evidence required:

- reviewed trust model;
- privacy, moderation, and abuse controls;
- explicit scope approval;
- safe attendance evidence model.

### Gate D — Expansion evidence

Evidence required:

- Olomouc retention and attendance signals;
- Sport Coach validation results;
- clear module or city owner;
- measurable expansion success criteria.

### Gate E — Public growth readiness

Evidence required:

- moderation and abuse protection;
- analytics and support readiness;
- public-safety review;
- stable operations under broader usage.

### Gate F — Services pilot approval

Evidence required:

- explicit Product Owner approval of the bounded Beauty pilot;
- defined pilot segment, city, provider supply, scope, and success criteria;
- reviewed Services domain model and separation from Activities;
- privacy, consent, retention, deletion, moderation, and safety model;
- support and operational ownership;
- protected production changes approved individually;
- local or mock prototype evidence reviewed before production authorization.

### Gate G — Monetization validation

Evidence required:

- repeat usage by a bounded Offline Enabler segment;
- measurable provider value;
- willingness to pay after real usage;
- selected commercial model and price explicitly approved by the Product Owner;
- legal, finance, tax, invoicing, refund, security, and payment-provider review;
- evidence that free community participation remains viable.

## Dependency chain

1. Preserve and verify Foundation and MVP Core.
2. Complete Release Preparation and Stabilization.
3. Add Telegram notifications without violating runtime boundaries.
4. Introduce trust features only after explicit approval and stable attendance evidence.
5. Expand Activities modules and cities only after release and product evidence.
6. Start production-growth mechanics only after operational and public-safety readiness.
7. Run Services documentation, review, and mock prototyping only as a non-displacing gated track.
8. Start a Beauty production pilot only after Gate F and all protected-change approvals are green.
9. Validate Offline Enabler value and willingness to pay before selecting pricing.
10. Implement or publicly announce monetization only after Gate G and separate implementation approval.

## Historical sprint records

The following retained files preserve planning history and source traceability:

- [`SPRINT_0.md`](SPRINT_0.md) — Archived.
- [`SPRINT_1.md`](SPRINT_1.md) — Archived.
- [`SPRINT_2.md`](SPRINT_2.md) — Draft historical input.
- [`SPRINT_3.md`](SPRINT_3.md) — Draft historical input.
- [`SPRINT_4.md`](SPRINT_4.md) — Draft historical input.
- [`SPRINT_5.md`](SPRINT_5.md) — Draft historical input.

They remain available for audit and context, but this file controls current growth, future Services and monetization sequencing, decision gates, dependencies, and scope.