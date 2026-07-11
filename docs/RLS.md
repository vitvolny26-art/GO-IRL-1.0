---
title: Supabase RLS Design
owner: Security Lead
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Supabase RLS Design

RLS is the core database safety layer for GO IRL. Frontend checks improve UX, but database policies must enforce real access.

## Trusted Identity Status

The legacy MVP passed identity to Supabase through a frontend-controlled request header:

```text
x-go-irl-user-key
```

That value is derived from Telegram `initDataUnsafe` or local guest storage in the browser. It is **not cryptographically trusted**. A user can forge the header through DevTools or direct REST calls and impersonate another user, organizer, or admin-like key.

Current implementation phase:

- `verifyTelegramInitData` Edge Function verifies Telegram HMAC.
- frontend uses `Telegram.WebApp.initData`, not `initDataUnsafe`, for auth.
- frontend Supabase client uses a verified JWT through `accessToken`.
- migration v4 updates RLS helpers to read `auth.jwt()` claims.
- `x-go-irl-user-key` is legacy demo mode only and must be disabled in public production.

## Principles

- RLS on every user-facing table.
- Frontend uses anon/publishable key only, but anon requests must not be trusted for identity until verified auth is implemented.
- Service role stays on backend/n8n.
- Users read/write only their own private data.
- Public Activities are readable by all.
- Private/invite Activities require organizer, confirmed participant, invite access, or admin/moderator permission.

## Table Policy Matrix

| Table | Public read | Owner read/write | Organizer | Admin/moderator | Service role |
| --- | --- | --- | --- | --- | --- |
| `users` | no | own row | no | limited | yes |
| `user_profiles` | public fields only | full own profile | no | limited | yes |
| `interests` | yes | no | no | write | yes |
| `user_interests` | no | own rows | no | limited | yes |
| `events` | public published | own organized events | own events | moderate | yes |
| `activity_members` | scoped | own membership | own Activity members | moderate | yes |
| `activity_chats` | no | member only | own Activity chat | moderate | yes |
| `activity_chat_messages` | no | member only | own Activity chat | moderate | yes |
| `notification_preferences` | no | own row | no | no raw delivery secrets | yes |
| `discovered_events` | no | no | no | review | yes |
| `admin_users` | no | no | no | admin only | yes |
| `user_roles` | no | own role | no | read/write according to role | yes |
| `audit_log` | no | no direct read | no | read | yes |

## Current Backend Foundation

`supabase/migration_v2_backend_foundation.sql` adds the production role foundation without replacing the current Activity MVP:

- `user_roles` stores `user`, `organizer`, `moderator`, and `admin`.
- `admin_users` is kept as backward compatibility and migration seed input.
- `go_irl_request_role()` reads the caller role from trusted request headers plus database state.
- `go_irl_request_can_moderate()` grants moderator/admin access for review flows.
- Activity edit/delete and participant approve/reject are enforced by RLS, not only frontend checks.
- `audit_log` records critical Activity and membership changes through database triggers.

Until Telegram `initData` validation is implemented on a trusted backend/edge layer, the `x-go-irl-user-key` header must still be treated as an unsafe MVP identity bridge, not final production identity.

## Trusted Telegram Auth Flow

1. Frontend reads raw Telegram `initData`, not `initDataUnsafe`, from `Telegram.WebApp.initData`.
2. Frontend sends `initData` to a trusted Supabase Edge Function.
3. Edge Function verifies Telegram HMAC using the bot token stored as a Supabase secret.
4. Edge Function creates or finds the user record.
5. Edge Function stores a replay hash in `telegram_auth_replay`.
6. Edge Function returns a trusted session/JWT.
7. RLS policies use `auth.jwt()` claims, not browser-provided identity headers.

## RLS Redesign Target

Current:

```text
request.headers -> x-go-irl-user-key -> RLS helpers
```

Implemented target:

```text
Telegram initData -> trusted verifier -> Supabase Auth/JWT -> auth.uid()/verified claims -> RLS
```

Future policies:

- public events readable by everyone;
- private/invite events readable only by organizer, approved participant, invite token scope, moderator, or admin;
- organizer edits only own events;
- delete only organizer or verified admin;
- approve/reject only organizer or verified moderator/admin;
- user profile private fields readable/writable only by the verified owner;
- pending users do not see private chat;
- moderator/admin role comes from server-side verified roles, never public frontend env.

## Activity Chat RLS

- Active chat members can read active chat.
- Pending users are not chat members.
- Rejected users are not chat members.
- Blocked users are excluded according to block model.
- Archived messages are hidden from normal UI.
- n8n/service role can archive eligible chats.

## Admin Enforcement

Temporary frontend allowlists are not enough for production. Real admin permissions must come from:

- trusted Telegram `initData` validation
- backend-issued claims
- Supabase Auth claims
- `admin_users` / role tables protected by RLS
- `user_roles` as the forward-compatible role table
- `audit_log` for critical changes

## Verification

Every schema migration must include:

- positive owner read/write checks
- negative unrelated-user checks
- private/invite visibility checks
- admin/moderator checks
- service-role workflow checks
