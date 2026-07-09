# GO IRL Bible

# Book VIII

## Runtime Boundaries

Version 1.0 Draft

Status: Current MVP runtime boundary / not a migration plan

---

## Purpose

This book defines the runtime boundaries that protect GO IRL MVP from unsafe assumptions.

It exists because GO IRL runs in three different contexts:

```text
Telegram Mini App
Browser Demo Mode
Vercel / Supabase production runtime
```

A feature is not beta-ready until it behaves safely in all relevant contexts.

---

## Core rule

Runtime behavior must never pretend that demo identity is production identity.

Runtime behavior must never pretend that future schema is current schema.

Runtime behavior must never write production data from a fake/demo path.

---

## Trusted Telegram Auth boundary

Production identity must come from verified Telegram Mini App data.

Allowed production direction:

```text
Telegram WebApp initData -> verifyTelegramInitData Edge Function -> trusted session/token -> Supabase RLS/auth path
```

Not trusted for production identity:

- browser-only local user data;
- `initDataUnsafe` alone;
- arbitrary frontend headers;
- demo user id;
- hardcoded admin keys in public frontend JavaScript;
- localStorage identity.

If trusted auth is not available, production write flows must either:

- be blocked;
- stay demo/local-only;
- or be explicitly marked as private testing only.

---

## Supabase boundary

Current schema truth is controlled by:

- `supabase/schema.sql`;
- `supabase/migration_v*.sql`;
- `supabase/README.md`;
- `docs/DATABASE_SCHEMA_AUDIT.md`.

Bible database vision does not override current schema.

Do not create, alter, or drop production tables from Bible cleanup work.

Do not change RLS policies from Bible cleanup work.

Do not change auth helpers from Bible cleanup work.

Do not run destructive SQL without explicit approved Supabase task.

---

## Current data model boundary

Current MVP core data model is still based on:

```text
activities
activity_members
```

Current extension areas include migrations for:

```text
coach_profiles
coach_requests
coach_reviews
activity_chats
activity_chat_messages
app_users
telegram_auth_replay
```

Future documents may describe:

```text
users
events
user_profiles
activity_chat_members
rli_ledger
trust_events
recommendations
external event discovery
```

Those future tables are not automatically part of MVP 1.0.

---

## Browser Demo Mode boundary

Browser Demo Mode is a safety surface for development and beta demos.

Expected fake user:

```text
id: 999999
name: Vit_Test
```

Demo Mode must:

- open without Telegram;
- avoid black-screen auth failure;
- show clear demo behavior;
- keep demo writes out of production Supabase;
- clearly show save feedback when the action is demo-only.

Expected demo save message:

```text
Изменения сохранены (Демо-режим)
```

Demo Mode must not:

- use real production identity;
- grant admin powers;
- mutate production tables;
- mask a broken Telegram production path;
- be described as secure auth.

---

## Profile boundary

Profile exists to make local real-life meeting less anonymous and less confusing.

Current MVP profile scope:

- display name;
- city;
- basic avatar state;
- enough identity context to show organizer/participant information.

Profile is not current MVP scope for:

- public social profile pages;
- followers;
- dating identity;
- achievements;
- public reputation score;
- complex privacy matrix;
- full media gallery.

---

## Avatar boundary

Avatar behavior must be split by runtime.

Production direction:

```text
Supabase Storage avatars bucket -> saved profile avatar URL/state
```

Demo direction:

```text
base64/local state -> no production Supabase write
```

If production storage is not configured, avatar upload must fail safely and clearly.

If demo mode is active, avatar changes must stay local/demo-only.

---

## Activity Chat runtime boundary

Activity Chat is temporary coordination for a specific event.

Current schema audit found:

```text
migration_v8_activity_chat.sql -> expires_at = now() + interval '24 hours'
```

This is different from the future product idea:

```text
event end + 24 hours
```

Until product and Supabase decide the final rule, UI and public docs must not promise a final event-end + 24h behavior.

Safe public wording:

```text
Activity Chat is temporary and exists only for event coordination.
```

---

## Share / Join runtime boundary

Share must point toward joining the real event.

Production direction:

```text
Telegram Mini App direct link with startapp payload
```

Browser fallback direction:

```text
/join/:id
```

The browser join route is not a full ticketing landing page.

The share flow must not be reused for bug reports.

---

## Weather runtime boundary

Weather is helpful context, not core storage.

Weather must:

- use a no-key forecast source where possible;
- degrade gracefully;
- not block event creation;
- not block event join;
- not fake precision for far-future dates;
- show a clear fallback when forecast range is not available.

---

## Admin and moderation runtime boundary

Admin/moderation features are production-sensitive.

Current MVP may need owner/admin checks for safety, but broad admin products are future scope.

Do not treat these as current MVP unless explicitly implemented and tested:

- full admin dashboard;
- role marketplace admin;
- public moderation queue;
- AI moderation;
- trust score adjustments;
- user bans with appeal workflow;
- automatic cleanup jobs.

---

## QA runtime rule

Every runtime-sensitive change must be checked in the right environment.

Browser-only testing is not enough for Telegram behavior.

Telegram-only testing is not enough for Browser Demo Mode.

Supabase docs are not enough for RLS behavior.

Minimum release checks:

```text
Codespaces/local: lint/build/test
Telegram client: open/share/join
Browser: demo mode and /join route
Vercel: deployment status
Supabase: required tables/migrations verified
```

---

## Final runtime rule

If a future feature needs new auth, new RLS, new storage, new background jobs, or new production tables, it is not a small MVP polish task.

It must become a separate approved technical task.

MVP stabilization means:

```text
protect the current loop, do not expand the runtime surface accidentally.
```
