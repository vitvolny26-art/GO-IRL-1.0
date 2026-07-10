---
title: Bible Database and Supabase Boundaries
owner: Supabase Steward
status: Active
source_of_truth: true
last_review: 2026-07-10
next_review: 2026-08-10
---

# Bible Database and Supabase Boundaries

## Purpose

This chapter defines the current database and Supabase boundaries for GO IRL MVP 1.0 / MVP 1.1 beta stabilization.

It replaces the missing or future-only Bible database chapter for current-scope decisions.

It is a documentation boundary, not a SQL task.

No SQL, RLS, auth, secrets, migrations, or production data may be changed from this chapter.

## Source-of-truth order

For database decisions, use this order:

1. `supabase/schema.sql`
2. `supabase/migration_v*.sql`
3. `supabase/README.md`
4. `docs/DATABASE_SCHEMA_AUDIT.md`
5. this Bible chapter
6. future architecture documents such as `docs/Database.md`

If this chapter conflicts with schema, migrations, or Supabase operational docs, the implementation sources win.

## Current database model

The current MVP is built around activities, not a future `events` model.

Current base tables include:

- `public.activities`
- `public.activity_members`
- `public.admin_users`

Applied or staged migrations also define additional areas:

- backend roles and audit;
- DB-level validation;
- trusted Telegram auth;
- coach request tables;
- temporary activity chat tables.

Do not replace `activities` with `events` during MVP stabilization.

## Activities boundary

`activities` is the core event-like table for MVP.

Current activity concerns include:

- category;
- localized activity/title/description fields;
- event date and time;
- city;
- address and location URL;
- participant note;
- activity type;
- metadata;
- price;
- capacity;
- organizer;
- organizer key;
- visibility;
- urgency/popularity flags;
- created/updated timestamps.

Activity shape must stay stable before beta unless a specific task approves a change.

## Participants boundary

`activity_members` tracks join state for activities.

Current concepts include:

- user identity key;
- activity relation;
- joined state;
- pending state for invite/private join flow;
- organizer/admin/moderator paths where policies allow.

Do not introduce a new participant model without schema, code, RLS, and release review.

## Trusted Telegram auth boundary

Production identity must come from verified Telegram `initData`.

High-level production trust chain:

```text
Telegram.WebApp.initData
        -> Supabase Edge Function verifyTelegramInitData
        -> verified JWT/session claims
        -> Supabase RLS-protected access
```

`initDataUnsafe`, browser fallback identity, local demo identity, and frontend-controlled headers are not production trust sources.

Never weaken this boundary during docs cleanup, UX polish, or small bugfix work.

## RLS boundary

RLS is production-sensitive.

Do not change or disable RLS unless there is an explicit Supabase task with review.

Do not generate RLS policies from Bible text.

Do not treat future architecture docs as direct migration instructions.

Any RLS change must be verified against:

- current schema;
- existing migrations;
- trusted auth path;
- organizer/member/moderator/admin behavior;
- public/private/invite join behavior;
- regression tests or manual smoke tests.

## Migration boundary

Migrations are not documentation.

A migration file may describe a desired schema change, but it must be applied, verified, and documented before being treated as current production truth.

Rules:

- do not run SQL from Bible work;
- do not edit migration history casually;
- do not apply destructive SQL without explicit approval;
- do not assume preview/staging/production are identical;
- always verify with the matching `verify_*.sql` file where available.

## Trusted auth migration boundary

Trusted Telegram auth is tied to the Edge Function and secrets configuration.

Do not apply trusted-auth assumptions unless the Edge Function is deployed and configured.

Do not expose or record secrets in documentation.

Do not put real production admin identifiers in frontend-exposed variables.

Production should not rely on spoofable frontend identity.

## Browser Demo Mode boundary

Browser Demo Mode exists for testing and onboarding outside Telegram.

Demo mode must:

- open without Telegram;
- use a fake/demo user;
- show demo events;
- avoid writing misleading data to production Supabase;
- clearly show demo save behavior;
- never become a production auth path.

Demo writes must remain local/demo-only unless a future explicitly approved test environment says otherwise.

## Coach schema boundary

Coach MVP tables may exist as schema foundation:

- `coach_profiles`
- `coach_requests`
- `coach_reviews`

Current product interpretation:

- Sport Coach only in MVP 1.1;
- request flow may be current where implemented;
- full marketplace, payments, verified coach badge, and full review UI are future scope unless implemented and approved.

The existence of `coach_reviews` does not mean public review UX is shipped.

## Activity Chat schema boundary

Activity Chat tables may exist as temporary event coordination infrastructure:

- `activity_chats`
- `activity_chat_messages`

Current safe interpretation:

- chat belongs to `activities`, not future `events`;
- chat is temporary;
- chat read/write must respect organizer/member/moderator boundaries;
- expiry behavior must follow the applied migration until explicitly changed.

If product wants `event end + 24h` expiry, it requires a separate schema/code/docs task.

Do not silently change chat lifetime from documentation cleanup.

## Future database vision boundary

Future database ideas may include:

- `events` replacing or wrapping `activities`;
- richer user profiles;
- reputation/RLI;
- full moderation system;
- notifications;
- recommendations;
- multi-city discovery;
- paid coach marketplace;
- ticketing.

These are future architecture concepts.

They are not MVP schema unless approved through roadmap, schema design, migration, RLS review, code implementation, and release verification.

## Admin and moderation boundary

Admin/moderation behavior must remain backend/RLS-enforced.

Frontend flags may hide or show UI, but they are not security.

Production admin identity must not rely on publicly bundled frontend variables.

Before adding moderation features, define:

- who can see reports;
- who can delete or hide events;
- who can remove participants;
- what is audited;
- what is user-visible;
- what is reversible.

## Data safety rules

Hard rules:

- Do not touch `.env`.
- Do not expose secrets.
- Do not change production data from docs cleanup.
- Do not run destructive SQL.
- Do not disable RLS.
- Do not weaken trusted auth.
- Do not introduce demo writes into production.
- Do not promise shipped UX only because a table exists.

## Database decision filter

Before changing database behavior, ask:

1. Is this required for Olomouc closed beta?
2. Does it support create, share, join, chat, or attendance?
3. Is the current schema clearly insufficient?
4. Is there an approved migration path?
5. Are RLS and trusted auth implications understood?
6. Can the change be verified safely?
7. Does it avoid future-platform scope creep?

If any answer is no, defer.

## Final rule

The MVP database should remain boring, explicit, and safe.

A stable Supabase boundary that protects the real-life event loop is more valuable than a future-perfect schema that destabilizes beta.
