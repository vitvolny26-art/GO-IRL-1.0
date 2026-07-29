---
title: Sprint 2 - Telegram And Notifications
owner: Sprint Planner
status: Historical / Partly Implemented
source_of_truth: false
last_review: 2026-07-29
next_review: 2026-08-05
---

# Sprint 2 - Telegram And Notifications

## Status

Historical planning input, partly implemented and partly superseded by current stabilization and Com-Rev evidence.

Use current implementation and release truth from:

- `ROADMAP.md` — canonical product roadmap;
- `docs/roadmap/COM_REV_IMPLEMENTATION_ROADMAP.md` — detailed Com-Rev sequencing and verification gates;
- current GitHub `main`;
- verified production readback;
- `BACKLOG.md` and `RELEASE_NOTES.md` only as supporting planning and release records;
- `docs/bible/08-runtime-boundaries.md` for Mini App runtime constraints.

## Goal

Make GO IRL coordination feel native inside Telegram without treating the Mini App as a background worker.

## Implemented or recorded in release evidence

- Telegram `startapp` sharing exists in the product baseline.
- Server-side notification and reminder processing exists.
- Event lifecycle delivery uses a transactional outbox with retry and idempotency controls.
- Reminder scheduling, per-channel consent, suppression, and delivery monitoring are recorded as implemented.
- Telegram and Facebook Messenger were reported production-green at the inspected completion checkpoint.
- Com-Rev027 and follow-up releases added an event-bound Telegram group binding flow.
- The final Com-Rev027 production E2E and current promoted production artifact remain unverified by fresh readback.

## Remaining gated scope

- Verify the exact currently promoted production commit.
- Verify visual production restoration after the event-card revert.
- Run the complete Com-Rev027 path: preflight, organizer request, binding row, Telegram webhook, persisted invite link and chat metadata, Mini App readback.
- Verify organizer, confirmed-participant, and denied-user authorization outcomes.
- Revalidate current Telegram and Messenger smoke evidence before retaining production-green claims.
- Keep Instagram disabled until its security rotation and repeat smoke are complete.
- Keep WhatsApp production outbound disabled until Meta business, number, template, and live-send gates are complete.
- Synchronize ClickUp and the durable Com-Rev report only from fresh evidence.

## Current boundaries

- Telegram Mini App lifecycle must remain explicit.
- Closing the Mini App must be user-triggered.
- The frontend must not run background notification workers or hold provider credentials.
- Browser demo mode must not touch production Supabase.
- Production deployment, auth, secrets, RLS, SQL, and migrations require separate explicit approval.
- A passing merge or CI run does not prove the currently promoted production artifact.

## Deferred scope

The following remain future or separately gated work unless a reviewed product decision and runtime evidence authorize them:

- evening digest;
- quiet-hours and working-hours automation beyond currently proven delivery behavior;
- broad n8n engagement automation;
- autonomous campaigns;
- push delivery;
- production WhatsApp and Instagram enablement before their provider and security gates are closed.
