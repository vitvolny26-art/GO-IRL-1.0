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

## Admin005 Role Invitations

The repository implementation supports admin-created bearer invitations for two bounded role promotions:

- `user` to `organizer`;
- `user` to `professional` (shown as `Мастер` in the Services UI).

The administrator selects only the target role. Telegram supplies the recipient identity when the link is opened inside the Mini App. Invitations are deliberately not bound to an identity in advance, so the first verified Telegram account to redeem a link receives the role.

Security boundaries:

- one use only;
- maximum lifetime of 24 hours;
- 256-bit random bearer token;
- only the SHA-256 token hash is stored;
- creation requires a freshly verified Telegram identity whose current database role is `admin`;
- redemption accepts only a current `user` role and does not overwrite organizer, professional, moderator, or admin roles;
- role assignment and token consumption occur atomically;
- raw token, Telegram `initData`, bearer session, and JWT are excluded from audit metadata;
- role invitation parameters are not treated as Activity invitation claims.

Repository presence does not prove that the migration or Edge Function is deployed. Production application remains a separate approval and verification gate.

## Backend Foundation

Migration v2 adds:

- `user_roles` for `user`, `organizer`, `professional`, `moderator`, and `admin`.
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
