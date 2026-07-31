---
title: Admin005 Role Invitations — Implementation and Handoff
owner: Security Lead
status: Partial
source_of_truth: false
last_review: 2026-07-31
next_review: 2026-08-01
---

# Admin005 Role Invitations — Implementation and Handoff

## Task

Add admin-generated, non-personalized Telegram invitations that live for 24 hours and promote the first verified redeemer from `user` to either `organizer` or `professional` (`Мастер` in the Services UI).

## Approved scope

The owner explicitly approved repository changes to the auth/role flow and a Supabase migration. Production application, merge, deployment, configuration, secrets, RLS application, SQL execution against production, and production data changes were not approved.

## Role

Security Lead, confirmed by the owner.

## Sources inspected

- GitHub `vitvolny26-art/Go-IRL-1.1` main at base `b2cd34fbcd25ddf8ce146af8505d3fbbea2bb692`.
- Current admin session guard, Telegram trusted-auth bootstrap, role model, Supabase migrations, RLS and security documentation.
- Active Drive instruction keys: AUTHORITY, START, WORK_RULES, EVIDENCE, RESPONSE, RETRIEVAL, ROLE_REGISTRY, ROLE_ROUTING, BOOTSTRAP, ROLE_SECURITY_LEAD, CODE_GATES, and RELEASE_ENGINEER_SKILL.
- Supabase changelog for current auth, Data API, RLS, and platform breaking-change context.

## Implemented repository changes

### Admin UI

- Added an Admin005 role-invitation card to the existing protected `/admin` surface.
- Admin selects either `Организатор` or `Мастер` and receives a copyable Telegram Mini App link.
- The UI states that the first Telegram account to open the bearer link receives the role.
- No Telegram ID or username is requested from the administrator.

### Trusted Telegram auth flow

- Reused `verifyTelegramInitData`; no password, email, magic link, second auth provider, frontend secret, or frontend service-role credential was added.
- Creation revalidates Telegram `initData` and requires the creator's current database role to equal `admin`.
- Redemption obtains the recipient identity from verified Telegram `initData`.
- The returned JWT contains the newly assigned database role immediately.
- Role invitation `startapp` values are excluded from Activity invitation JWT claims.
- A cached session cannot suppress redemption of a newly opened role-invitation link.

### Token and database boundary

- Tokens contain 256 random bits and are encoded in a Telegram-safe `ri_...` start parameter.
- Only SHA-256 hashes are stored.
- Invitations expire within 24 hours and are single-use.
- Creation and redemption audit events contain role, invitation ID, and expiry only; no raw token, raw `initData`, bearer token, or full JWT.
- Redemption and role assignment are atomic and lock the invitation row.
- Only `user` can be promoted. Existing `organizer`, `professional`, `moderator`, or `admin` rows are not overwritten.
- Direct table access is revoked from `public`, `anon`, `authenticated`, and `service_role`; only the two narrowly scoped RPC functions grant `service_role` execute access.

### Role vocabulary

- `user` is the shared regular user/client database role.
- `organizer` enables the Activities organizer workspace.
- `professional` enables the Services master workspace.
- No duplicate `master` database role was introduced.

## Tests and checks

- Targeted Admin005 tests: 12 passed.
- `pnpm run typecheck`: PASS.
- `pnpm run lint`: PASS with one pre-existing `no-console` warning in `api/_shared/admin-authorization.ts`.
- `pnpm run build`: PASS with two pre-existing ineffective dynamic-import warnings.
- `pnpm run test`: PASS — 128 files, 605 tests, plus Staff OS checks.
- `git diff --check`: PASS before final publication.
- Local Supabase execution: NOT RUN. Docker Desktop/Supabase local containers were unavailable.
- Production SQL, migration application, Edge Function deployment, secrets, configuration, role data, and runtime smoke: NOT RUN / NOT CHANGED.

## Threat model

### Asset and trust boundary

The protected asset is role assignment in `public.user_roles`. The trust boundary is verified Telegram identity plus current server-side admin role for creation, and possession of a single-use bearer invitation plus verified Telegram identity for redemption.

### Primary threats

- Link forwarding or interception before intended redemption.
- Replay after redemption.
- Expired-link use.
- Non-admin creation attempt.
- Promotion to moderator/admin or an unknown role.
- Overwrite of an already elevated account.
- Raw token leakage through database rows, audit metadata, logs, frontend storage, or repository fixtures.
- Collision between role invitation start parameters and Activity invitation claims.

### Mitigations

- 256-bit random token, 24-hour maximum lifetime, single-use row lock and atomic consumption.
- Generic denial status for invalid, expired, or already consumed links.
- Current database admin role check at creation time.
- Allowlist restricted to `organizer` and `professional`.
- Conditional `user`-only upsert.
- Hash-only persistence and safe audit metadata.
- Separate role-invitation parser and null Activity invitation claim.

### Residual risk

The invitation is intentionally not bound to a recipient. The first verified Telegram account with the link receives the role. The administrator must send it privately. A future Admin006 iteration may add revocation and optional identity-bound invitations without changing the default bearer flow.

## Production work report

No production work was performed in this execution. Specifically:

- no Supabase migration was applied;
- no Edge Function was deployed;
- no Supabase/VPS/Vercel environment value was read, changed, or created;
- no production role row or invitation row was created;
- no VPS or Vercel deployment was triggered;
- no DNS, Caddy, n8n, auth configuration, secret, or production data was changed;
- no merge was performed.

The repository contains proposed production artifacts only. Runtime availability must not be claimed before approved migration application, Edge Function deployment, VPS delivery, and Telegram smoke.

## Further implementation plan

### Gate 1 — Review and merge

1. Review the migration, Edge Function extension, UI, and security tests.
2. Verify green CI on the exact PR head.
3. Obtain separate explicit merge approval.

### Gate 2 — Supabase production application

1. Obtain explicit production SQL/migration and Edge Function deployment approval.
2. Reread production migration history and current `verifyTelegramInitData` version.
3. Apply the exact reviewed migration.
4. Run `supabase/verify_admin005_role_invitations.sql` in an approved verification context and confirm rollback.
5. Deploy `verifyTelegramInitData` from the merged GitHub main.
6. Reread function version/status and migration state.

### Gate 3 — VPS delivery

1. Obtain separate VPS production deployment approval.
2. Deploy the exact GitHub main through the governed VPS workflow.
3. Verify the workflow wrapper and the real SSH exit code.
4. Confirm the production build commit on `https://goirl.realitka.pp.ua`.

### Gate 4 — Telegram smoke

1. Admin opens `/admin` from Telegram and creates an organizer invitation.
2. A regular Telegram account opens it and immediately receives `organizer` plus the organizer workspace.
3. A second account attempts the same link and receives a generic invalid response.
4. Repeat with a fresh professional invitation and confirm the Services master workspace.
5. Verify expired, malformed, and role-conflict outcomes.
6. Inspect audit rows and Edge Function logs for absence of raw tokens, raw `initData`, bearer tokens, and full JWTs.

### Later admin roadmap

1. Admin006 — invitation list and explicit revocation.
2. Admin007 — optional identity-bound invitation mode.
3. Admin108 — read-only audit view before any additional admin mutation surface.
4. Admin105 — minimal user read model.
5. Admin107 — event moderation queue.

## Durable handoff

- Active task: Admin005 Role Invitations.
- Repository: `vitvolny26-art/Go-IRL-1.1`.
- Base branch: `main` at `b2cd34fbcd25ddf8ce146af8505d3fbbea2bb692`.
- Task branch: `Admin005/role-invitations-24h`.
- Merge target: GitHub `main`.
- Deploy target: none.
- Current status: Partial until CI, PR, approved production application, and Telegram smoke are complete.
- Production changes: none.
- Next safe action: finish final checks, publish one logical commit, open a Draft PR, persist this report to Google Drive, and link evidence in ClickUp.
- Prohibited without new approval: merge, migration application, Edge Function deployment, VPS/Vercel deployment, secrets/configuration changes, RLS execution, production role/data changes, DNS/Caddy/n8n changes, and destructive operations.
