# Admin Architecture

Admin tools exist to protect local communities and keep activities healthy. They must be built after backend roles and RLS are stable.

## Roles

- `user`: regular participant.
- `organizer`: creator/owner of an Activity.
- `moderator`: reviews reports, unsafe events, and chat moderation holds.
- `admin`: manages platform configuration and high-risk actions.

Current production admin entry uses trusted Telegram session verification, a server-only identity allowlist, and the role source in `public.user_roles`. The frontend shell remains a presentation layer and does not replace server authorization.

## Admin Capabilities

Future admin surfaces:

- categories
- cities
- activity types
- users
- activities
- reports
- source management
- notification/digest health
- analytics
- RLI review
- moderation queue

## Permissions

Admin permissions must be least-privilege:

- category/city management requires admin.
- report review requires moderator or admin.
- user bans require admin or elevated moderator.
- event deletion requires organizer or admin.
- participant approve/reject requires organizer, moderator, or admin.
- source management requires admin.
- analytics access must avoid raw private data.

## Safety Rules

- Admin actions must be logged.
- Admin UI must not rely only on frontend checks.
- Service-role operations stay on backend/n8n only.
- Admin panel must not expose unnecessary personal data.

## Backend Foundation

Migration v2 adds:

- `user_roles` for `user`, `organizer`, `moderator`, and `admin`.
- role-aware Supabase helper functions.
- `audit_log`.
- database audit triggers for activity and membership changes.
- verification SQL in `supabase/verify_backend_foundation.sql`.

`admin_users` remains for backward compatibility and seeds existing admins into `user_roles`.

## Current Runtime Surface

- `/admin/login` verifies the trusted Telegram session through the existing server endpoint.
- Every `/admin/*` route fails closed through the same server-side session check.
- Admin104–110 provides a responsive read-only operations shell.
- Admin105, Admin107, and Admin108 show explicit `Not connected` states instead of demo or production-looking fixtures.
- Admin106 shows only the documented role boundaries; it does not read or mutate current user roles.
- Admin109 reports only properties proved by the current authorized UI flow.
- Admin110 describes integration status and does not read or write production feature flags.

## Not Implemented Now

- no user, event, moderation, audit, or analytics read API
- no admin mutations
- no production feature-flag provider
- no service-role credential in the frontend
- no moderation or analytics dashboard backed by live data
