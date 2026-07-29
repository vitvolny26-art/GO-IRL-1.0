---
title: Sprint Records Index
owner: Sprint Planner
status: Active
source_of_truth: false
canonical_roadmap_document_id: 12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw
last_review: 2026-07-26
next_review: 2026-08-09
---

# Sprint Records Index

This file maps retained Sprint 0–5 records to the canonical GO IRL Product Roadmap.

Canonical Product Roadmap:

https://docs.google.com/document/d/12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw/edit

Stable Document ID: `12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw`.

## Authority rule

- The Drive Product Roadmap controls sequencing, product gates, phase state, and authorization of future scope.
- `docs/release/CURRENT_PHASE.md` controls the current lifecycle-phase statement.
- Sprint files preserve historical execution context and gated planning inputs.
- Sprint files do not authorize implementation by themselves.
- GitHub `main` and verified runtime evidence remain authoritative for code, tests, schemas, auth, RLS, migrations, deployment, and production configuration.

## Current lifecycle state

Closed Beta completed on 2026-07-20.

Current phase:

**Release Preparation and focused post-beta stabilization**.

Broad public launch is not yet claimed.

## Roadmap-to-sprint mapping

| Canonical roadmap section | Sprint record | Record status | Interpretation |
|---|---|---|---|
| Phase 0 — Foundation | `docs/roadmap/SPRINT_0.md` | Archived | Historical foundation evidence; not current release proof. |
| Phase 1 — MVP Core | `docs/roadmap/SPRINT_1.md` | Archived | Historical core-loop scope that must be preserved and verified. |
| Active bridge — Release Preparation and Stabilization | No numbered replacement sprint | Active in canonical Roadmap | Current work: stabilize core loop, infrastructure, Sport Coach, quality, and release operations. |
| Phase 2 — Telegram and Notifications | `docs/roadmap/SPRINT_2.md` | Draft / Gated | May start only after Release Preparation exit criteria are green. |
| Phase 3 — Trust and Real Attendance | `docs/roadmap/SPRINT_3.md` | Draft / Gated | Requires stable attendance evidence and explicit privacy/moderation approval. |
| Phase 4 — Modules and Discovery | `docs/roadmap/SPRINT_4.md` | Draft / Gated | Requires Olomouc and Sport evidence plus explicit expansion approval. |
| Phase 5 — Production Growth | `docs/roadmap/SPRINT_5.md` | Draft / Gated | Requires operational, moderation, analytics, and public-safety readiness. |

## Sprint 0 — Foundation

Status: **Complete / Historical**.

Preserved outcome: safe development and release foundation.

Current caution: historical Netlify, CI, schema, or RLS notes are not current runtime evidence. Vercel and current approved Supabase verification procedures control present release decisions.

## Sprint 1 — MVP Core

Status: **Complete / Historical**.

Preserved product loop:

```text
create event -> share through Telegram -> participants join -> event chat -> people meet in real life
```

Current responsibility: preserve and verify this loop during Release Preparation.

## Active bridge — Release Preparation and Stabilization

Status: **Active**.

This bridge is not renamed to Sprint 2. It sits between historical Sprint 1 and gated future Sprint 2.

Primary workstreams:

1. Core-loop stability.
2. Infrastructure hardening.
3. Sport Coach MVP 1.1 validation.
4. Product quality and performance.
5. Release operations and real Telegram smoke verification.

Exit criteria are defined only in the canonical Drive Product Roadmap.

## Sprint 2 — Telegram and Notifications

Status: **Draft / Gated**.

Allowed direction:

- BotFather and Mini App URL verification;
- Telegram `startapp` verification;
- backend-triggered notifications;
- private-request decision notifications;
- reminders before activity start.

Not authorized before the entry gate:

- broad n8n engagement automation;
- autonomous campaigns;
- background Mini App polling;
- production configuration changes without approval.

## Sprint 3 — Trust and Real Attendance

Status: **Draft / Gated**.

Allowed direction after approval:

- attendance confirmation;
- bounded organizer verification;
- reviewed trust signals based on real participation.

Not authorized by the sprint record:

- public Trust Score;
- ratings or leaderboards;
- token/reward mechanics;
- geolocation attendance confirmation;
- complex public reputation UI.

## Sprint 4 — Modules and Discovery

Status: **Draft / Gated**.

Sport remains the reference vertical. New modules, categories, cities, or verticals require explicit reviewed product approval and evidence from the current loop.

Friends, Travel, Dating, broad lifestyle expansion, and unvalidated AI recommendations remain outside authorized scope.

## Sprint 5 — Production Growth

Status: **Draft / Gated**.

Production-growth work requires verified release operations, moderation, analytics, support, abuse protection, and public-safety readiness.

Referral incentives, paid growth, large-scale city expansion, and analytics-driven growth loops remain unauthorized until reviewed.

## Maintenance rule

When the canonical Drive Product Roadmap changes:

1. Update this mapping only when sprint interpretation changes.
2. Do not rewrite historical evidence.
3. Keep future sprint records Draft / Gated until their entry gates are proven.
4. Record implementation and runtime facts in GitHub release/runtime sources, not in sprint planning records.