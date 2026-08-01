# Admin Architecture

Last verified: 2026-08-01.

The GO IRL admin panel is a bounded operational surface. It is not a general-purpose super-admin console and it must not expose deployment, secret, SQL, migration, RLS, or destructive controls in the browser.

## Authorization boundary

- `/admin/login` and every `/admin/*` route require a trusted Telegram session.
- `/api/admin/session` verifies the JWT signature, expiry, issuer, authenticated claims, a server-only admin allowlist, the embedded `admin` role, and the current role in `public.user_roles`.
- Admin actions in `verifyTelegramInitData` repeat current database-admin verification before executing protected RPCs.
- Client state and hidden UI are never the authorization source.
- Missing or invalid authorization returns the generic `access_denied` response.
- Raw Telegram `initData`, invitation bearer tokens, access tokens, JWTs, bot tokens, and service-role keys must not be logged or rendered.

`public.user_roles` is the current role source of truth. `public.admin_users` remains compatibility data and must not become a second role store.

## Implemented admin releases

### ADMIN005 — 24-hour role invitations

An administrator can create an unpersonalized Telegram invitation for either:

- `user` to `organizer`;
- `user` to `professional` (displayed as `Мастер`).

The first verified Telegram account to redeem the bearer link receives the requested role. The invitation is single-use, expires within 24 hours, stores only a SHA-256 token hash, and cannot overwrite an existing elevated role. Creation, redemption, expiry, replay, and role-conflict outcomes are enforced server-side. Successful creation and redemption write non-sensitive audit metadata.

### ADMIN006 — elevated-role management

The Roles tab lists current organizers, professionals, moderators, and administrators through protected server actions. An administrator can demote organizer, professional, or moderator to `user` after confirmation. Admin accounts are protected from this operation. A successful demotion writes an `audit_log` record.

### ADMIN007 — mobile admin navigation

The protected panel has four bottom tabs:

1. Overview
2. Roles
3. Integrations
4. Updates

### ADMIN008 — read-only integration status

The Integrations tab reports only evidence available to the protected client:

- Telegram admin-session verification;
- protected Supabase role-query state;
- embedded Vercel build metadata;
- an explicit `not connected` state for n8n.

These cards are not a full external health probe and do not reveal secrets.

### ADMIN009 — read-only update status

The Updates tab shows the embedded client commit/build timestamp and explicit disconnected states for Edge Function, migration, and release-report registries. Deploy, rollback, Edge Function update, secret rotation, and migration execution remain unavailable in the browser.

## Verified backend state

Supabase production project `tygfsvjkznypilfyyvdc` was read on 2026-08-01:

- status: `ACTIVE_HEALTHY`;
- migration `20260731233917 admin005_role_invitations` present;
- migration `20260801003640 admin006_role_management` present;
- `verifyTelegramInitData` version 17: `ACTIVE`;
- `telegramEventSupergroup` version 8: `ACTIVE`.

Repository presence alone is not deployment evidence; these statements are based on direct production metadata reads.

## Verified production topology

The requested topology `Telegram -> Vercel` is **not verified** and must not be recorded as current fact.

Direct runtime evidence on 2026-08-01 shows a split topology:

- public application URL `https://goirl.realitka.pp.ua` returns HTTP 200 from `Server: Caddy` and has no `x-vercel-id` header;
- `https://go-irl-1-1.vercel.app` returns HTTP 200 from `Server: Vercel` with an `x-vercel-id` header;
- the two HTML bodies differ;
- latest READY Vercel production deployment is `dpl_BntrDPTtWvNv6sJgZpDXWRppPAnp` at commit `e43be4ece9a5908984add70dc9dfd99cc501b2a3` (ADMIN009);
- GitHub `main` is `563b47a4b639636d5f1f6420e66d1cb6df0d1388` and includes the later lazy-admin-route merge;
- the exact Git commit served by the public Caddy endpoint is not exposed by current runtime evidence.

Therefore the safe operational model is: public Caddy/VPS runtime plus a separate Vercel production runtime with known commit drift. Changing routing or redeploying either runtime requires a separate approved release task.

## Gate A release-readiness status

Completed repository hygiene:

- PR #499 closed as superseded by merged PR #501;
- PR #500 closed as superseded by merged PR #501;
- historical Draft PR #444 closed as superseded by ADMIN006-009.

Still required before ADMIN010:

- disposable-account production smoke for organizer invitation;
- disposable-account production smoke for professional invitation;
- replay rejection;
- role-conflict rejection;
- demotion to `user`;
- corresponding non-sensitive `audit_log` evidence.

Those checks mutate production role and audit data. They are not authorized by this documentation task and require separate explicit production-data approval plus disposable Telegram identities.

## Next admin increment

ADMIN010 is a protected, read-only audit-log view. It may start only after Gate A passes. It must use a bounded server-side projection, pagination, least-privilege access, generic errors, and must never display raw authentication or invitation payloads.

## Not implemented

- browser-triggered deploy or rollback;
- browser secret/configuration management;
- browser SQL, migration, or RLS changes;
- general user bans or destructive user deletion;
- moderation dashboard;
- analytics dashboard;
- ADMIN010 audit-log UI.
