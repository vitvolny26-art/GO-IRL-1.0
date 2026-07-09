# Database Schema Audit

Generated: 2026-07-08

## Purpose

This document separates the current Supabase MVP schema from future database vision documents.

It is a documentation audit only.

No SQL was executed. No RLS, auth, secrets, or production data were changed.

## Source of truth order

| Layer | Source | Status |
|---|---|---|
| Current base schema | `supabase/schema.sql` | Current implementation baseline |
| Applied/approved migrations | `supabase/migration_v*.sql` | Current or staged schema evolution |
| Supabase runbook | `supabase/README.md` | Operational source of truth |
| Target architecture | `docs/Database.md` | Future plan, not current schema |
| Bible database chapter | `docs/bible/03-database-design.md` | Historical/future vision only |

## Current MVP schema baseline

The current MVP does not use the future `events` / `users` database model as its production baseline.

Current baseline tables from `supabase/schema.sql`:

- `public.activities`
- `public.activity_members`
- `public.admin_users`

Key current activity fields:

- `id`
- `category_id`
- `activity_ru`
- `activity_cs`
- `title_ru`
- `title_cs`
- `description_ru`
- `description_cs`
- `event_date`
- `event_time`
- `city_id`
- `address`
- `location_url`
- `participant_note`
- `activity_type`
- `metadata`
- `price`
- `capacity`
- `organizer`
- `organizer_key`
- `visibility`
- `urgent`
- `popular`
- `created_at`
- `updated_at`

## Confirmed migration areas

| Migration | Area | Tables / behavior |
|---|---|---|
| `migration_v1.sql` | Activity schema stabilization | activity fields, pending member status, indexes, update trigger, invite/public join alignment |
| `migration_v2_backend_foundation.sql` | Backend roles and audit | `user_roles`, `audit_log`, role helpers, moderator/admin RLS path |
| `migration_v3_security_hardening.sql` | DB-level validation | activity text length constraints |
| `migration_v4_trusted_telegram_auth.sql` | Trusted Telegram auth | `app_users`, `telegram_auth_replay`, JWT-claim auth helpers, authenticated-role policies |
| `migration_v7_coach_requests_and_ratings.sql` | Coach MVP | `coach_profiles`, `coach_requests`, `coach_reviews` |
| `migration_v8_activity_chat.sql` | Temporary Activity Chat | `activity_chats`, `activity_chat_messages` |

## Coach schema reality

Current migration v7 creates:

- `public.coach_profiles`
- `public.coach_requests`
- `public.coach_reviews`

Current UI boundary is still `CoachRequestPanel.tsx`.

Do not treat coach marketplace, verified coach badge, payments, or full review flow as shipped MVP scope.

## Activity Chat schema reality

Current migration v8 creates:

- `public.activity_chats`
- `public.activity_chat_messages`

Important current behavior from migration v8:

- `activity_chats.activity_id` references `public.activities(id)`, not future `events(id)`.
- `activity_chats.expires_at` is required.
- `go_irl_activity_chat_expires_at(p_activity_id)` currently returns `now() + interval '24 hours'`.
- Chat read/write is limited to organizer, joined members, or moderator path.
- Messages are visible only while the chat is active and `expires_at > now()`.

This means current implementation is a 24-hour temporary chat from chat creation time, not yet a documented `event end + 24 hours` lifecycle.

## Conflicts found

| ID | Conflict | Current safe interpretation | Required follow-up |
|---|---|---|---|
| DB-CHAT-001 | `docs/Database.md` describes future chat on `events(id)` with `auto_delete_at = activity.ends_at + 24h`, but migration v8 uses `activities(id)` and `expires_at = now() + 24h`. | Current production/staged truth is migration v8 until changed by explicit SQL task. | Decide whether MVP wants creation+24h or event-end+24h, then align SQL, code, docs. |
| DB-USERS-001 | `docs/Database.md` describes future `users` / `user_profiles`; current trusted auth migration uses `app_users`. | Do not generate `users` migration from docs/Database.md for MVP 1.1. | Future identity model requires separate design task. |
| DB-RLI-001 | `docs/Database.md` and Bible mention RLI / Trust / Community systems. | Not current MVP database scope. | Keep in future vision only. |
| DB-COACH-001 | Coach reviews exist in schema, but full review UI is not shipped MVP scope. | Treat `coach_reviews` as schema foundation, not public feature promise. | Implement review UI only in approved future task. |
| DB-DEMO-001 | Browser Demo Mode must not write production data. | Demo writes must stay local/demo-only unless trusted auth is active and explicitly intended. | Validate code paths during Browser Mock Mode task. |

## Hard rules for future agents

- Do not run SQL from documentation cleanup.
- Do not apply Bible database ideas directly.
- Do not replace `activities` with `events` during MVP stabilization.
- Do not change RLS/auth policies without explicit Supabase task approval.
- Do not treat `docs/Database.md` as current production schema.
- Use `supabase/schema.sql`, `supabase/migration_v*.sql`, and `supabase/README.md` for current schema decisions.

## Next recommended task

Update `docs/Database.md` header to clearly mark it as future architecture and link to this audit, without rewriting the whole document.
