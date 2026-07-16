---
title: Agent Report
owner: QA Agent
status: Draft
source_of_truth: false
last_review: 2026-07-16
next_review: 2026-07-23
---

# Agent Report

## Task

Assess readiness for negative Supabase RLS checks covering organizer, joined, pending, and unrelated users without changing policies, auth, secrets, SQL migrations, or production data.

## Files inspected

- `docs/RLS.md`
- `supabase/schema.sql`
- `supabase/migration_v2_backend_foundation.sql`
- `supabase/migration_v4_trusted_telegram_auth.sql`
- `supabase/migration_v8_activity_chat.sql`
- `supabase/verify_trusted_auth.sql`
- `src/authSession.ts`
- `src/supabase.ts`
- `src/store.ts`
- `src/activityChatFeature.ts`
- `src/coachFeature.ts`
- `src/profileAvatar.ts`

## Findings

- Production writes in the core Activity flow require a trusted Telegram session.
- Browser demo mode keeps Activity, coach, chat, and avatar changes local instead of writing to production Supabase.
- Activity chat RLS allows organizers, moderators, and joined members.
- Pending and unrelated users are excluded from chat access by `go_irl_can_access_activity_chat()`.
- Private Activity visibility is restricted by JWT-backed identity helpers after migration v4.
- Existing verification SQL checks object and policy presence, but does not execute full negative user scenarios.
- A live negative RLS test was not executed because this environment has no direct Supabase SQL connection.
- No RLS, auth, secrets, SQL migration, or production data changes were made.

## Changes made

- Added this Draft readiness report only.

## Checks

- Static trusted JWT write boundary review — PASS.
- Browser demo local-only boundary review — PASS.
- Static private Activity access policy review — PASS.
- Static activity chat organizer/joined access review — PASS.
- Static pending/unrelated chat denial review — PASS.
- Live production organizer access check — NOT RUN.
- Live production joined-member access check — NOT RUN.
- Live production pending-user denial check — NOT RUN.
- Live production unrelated-user denial check — NOT RUN.
- Production data mutation — NOT PERFORMED.
- `pnpm run lint` — NOT RUN; docs-only change.
- `pnpm run build` — NOT RUN; docs-only change.
- `pnpm run test` — NOT RUN; docs-only change.

## Next step

Run one manual, rollback-only Supabase session using temporary identities and rows:

1. Confirm organizer can read the private Activity and chat.
2. Confirm a joined member can read and write chat.
3. Confirm a pending member cannot read or write chat.
4. Confirm an unrelated authenticated user cannot read the private Activity, members, chat, or messages.
5. Roll back the transaction and record only PASS/RED results.

Until those checks run, the Supabase negative RLS gate remains open.