---
title: Roadmap Part 05 — Growth and Decision Gates
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: Production growth, decision gates, dependency chain, and historical sprint references
last_review: 2026-07-29
next_review: 2026-08-09
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

Source record: [`docs/roadmap/SPRINT_5.md`](docs/roadmap/SPRINT_5.md).

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

## Dependency chain

1. Preserve and verify Foundation and MVP Core.
2. Complete Release Preparation and Stabilization.
3. Add Telegram notifications without violating runtime boundaries.
4. Introduce trust features only after explicit approval and stable attendance evidence.
5. Expand modules and cities only after release and product evidence.
6. Start production-growth mechanics only after operational and public-safety readiness.

## Historical sprint records

The following retained files preserve planning history and source traceability:

- [`docs/roadmap/SPRINT_0.md`](docs/roadmap/SPRINT_0.md) — Archived.
- [`docs/roadmap/SPRINT_1.md`](docs/roadmap/SPRINT_1.md) — Archived.
- [`docs/roadmap/SPRINT_2.md`](docs/roadmap/SPRINT_2.md) — Draft historical input.
- [`docs/roadmap/SPRINT_3.md`](docs/roadmap/SPRINT_3.md) — Draft historical input.
- [`docs/roadmap/SPRINT_4.md`](docs/roadmap/SPRINT_4.md) — Draft historical input.
- [`docs/roadmap/SPRINT_5.md`](docs/roadmap/SPRINT_5.md) — Draft historical input.

They remain available for audit and context, but this file controls current roadmap state, sequencing, gates, and scope.
