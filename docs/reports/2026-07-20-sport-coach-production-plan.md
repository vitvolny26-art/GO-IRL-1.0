---
title: Sport Coach Production Plan
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-07-27
---

# Sport Coach Production Plan

## Purpose

Recreate the still-valid implementation decisions from closed PR #214 without treating its 2026-07-19 implementation inventory as current fact.

## Fixed scope

For MVP 1.1:

- Coach remains sport-only;
- the core value is higher real-life attendance and beginner comfort;
- no payments, marketplace, universal Event Roles, public Trust Score, or false verification badge;
- existing Coach identifiers and table compatibility should be preserved unless a separately approved migration changes them;
- production identity must use trusted Telegram auth and Supabase RLS;
- n8n may deliver notifications but must not own Coach state transitions.

## Required production model

Use backend-authoritative transitions for:

```text
pending -> matched -> confirmed -> completed
```

Cancellation and rejection must be actor-restricted. A Coach becomes publicly confirmed only after acceptance by the assigned Coach.

## Public projection

Cards and ordinary participants must not read raw Coach request rows. Use one batch-safe projection for activity lists that exposes only confirmed public summary fields.

Do not expose requester identifiers, private goals, participant-interest rows, moderation notes, rejection reasons, or internal state history.

## Security gate

Before Coach backend, RLS, inbox, matching, confirmation, public projection, or review implementation:

- revalidate current production state read-only;
- reconcile actual policy families and grants;
- protect server-owned verification, moderation, and rating fields;
- enforce assignment integrity and actor-owned transitions;
- define rollback;
- test organizer, joined participant, assigned Coach, outsider, and moderator/admin identities;
- obtain explicit approval before applying SQL, RLS, migrations, auth, or production changes.

## Delivery order

1. Read-only production revalidation.
2. Approved backend/RLS design with rollback and identity matrix.
3. Manual matching and assigned-Coach accept/decline foundation.
4. Confirmed-only batch public summary.
5. Coach inbox and event/chat access.
6. Attendance and analytics foundation.
7. Feedback only after attendance eligibility and abuse controls exist.

## Revalidation boundary

The frontend, schema, and production findings described in closed PR #214 are historical. Inspect current `main` and current production before turning this plan into implementation work.

## Scope of this change

Documentation only. No code, SQL, RLS, migration, auth, secrets, workflow, deployment, or production data changed.
