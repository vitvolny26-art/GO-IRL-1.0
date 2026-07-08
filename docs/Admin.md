# Admin Architecture

Admin tools exist to protect local communities and keep activities healthy. They must be built after backend roles and RLS are stable.

## Roles

- `user`: regular participant.
- `organizer`: creator/owner of an Activity.
- `moderator`: reviews reports, unsafe events, and chat moderation holds.
- `admin`: manages platform configuration and high-risk actions.

Current Sprint 1 admin visibility still uses a temporary frontend allowlist, but backend enforcement now has a forward-compatible `public.user_roles` design in `supabase/migration_v2_backend_foundation.sql`. Production identity enforcement must move to trusted Telegram `initData` validation and backend/RLS claims.

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

## Not Implemented Now

- no admin runtime UI
- no new admin API
- no moderation dashboard
- no analytics dashboard
