---
title: ADMIN006-ADMIN007 Release Report
owner: Release Manager
status: Completed
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-15
---

# GO IRL 1.1 — ADMIN006 and ADMIN007 release

## Task

Verify and document the production delivery of protected admin role management and the mobile-first tabbed admin panel.

## Scope

ADMIN006 added server-backed elevated-role management:

- protected elevated-role list;
- display name, username, Telegram ID and current role;
- guarded demotion of organizer, professional and moderator to user;
- admin protection;
- confirmation before mutation;
- audit_log entry after successful demotion;
- repeated trusted Telegram session and current-admin-role verification;
- existing organizer and professional invitation creation preserved.

ADMIN007 added four bottom tabs:

1. Overview
2. Roles
3. Integrations
4. Updates

The Roles tab contains invitation creation, elevated-role listing, refresh and demotion. Integrations and Updates remain stable placeholders for later read-only runtime data.

## Files inspected

- `src/admin/AdminLoginPage.tsx`
- `src/admin/admin-login.css`
- `src/admin/roleInvitations.ts`
- `src/admin/roleInvitations.test.ts`
- `src/admin/professionalRoleRemoval.test.ts`
- `supabase/functions/verifyTelegramInitData/index.ts`
- `supabase/functions/verifyTelegramInitData/admin006.test.ts`
- `supabase/functions/verifyTelegramInitData/index.test.ts`
- `supabase/migrations/20260801001500_admin006_remove_professional_role.sql`

## GitHub evidence

- ADMIN006 merge: `f717541900c163b313056bc6204b4d47392d33ef` — PR #498.
- SQL hotfix merge: `eecf38414161b705696e838cfeb2e529a0e7e1bb` — PR #501.
- ADMIN007 merge: `57fb00094b0ddc7c2126b01ad51b0a6db6243854` — PR #502.
- Later non-product main commit: `32bed15f4a9690205d4ce6aef6eaeb8270ff1b63` — repository hygiene gate, PR #504.

## Checks

- CI 1387 — PASS.
- CI 1391 — PASS.
- CI 1393 — PASS.
- tests — PASS.
- typecheck — PASS.
- lint — PASS.
- build — PASS.

## Backend runtime

- migration applied;
- `verifyTelegramInitData` version 17 ACTIVE;
- actions `list_role_assignments` and `demote_role` available;
- client has no direct access to `user_roles`.

## Vercel production evidence

Project: `go-irl-1-1`

- deployment ID: `dpl_8GLFRsNeNbbU3dAQZrL1xgS7j3LK`;
- state: READY;
- target: production;
- Git ref: `main`;
- deployed Git SHA: `57fb00094b0ddc7c2126b01ad51b0a6db6243854`;
- build marker: `BETA 57fb000`;
- `/admin` bundle contains Overview, Roles, Integrations and Updates tabs;
- role listing, refresh, protected admin state and guarded demotion UI are present.

No repeat deployment was required. The newer `main` commit `32bed15` only adds repository hygiene checks and explicitly had deploy target `none`.

## Public runtime note

The public VPS/Caddy domain also serves a bundle containing the ADMIN006/ADMIN007 admin implementation. Its build marker resolves to `unknown`, so the Vercel deployment metadata is the authoritative exact-SHA runtime evidence for this release.

## Documentation reconciliation

The ADMIN005 report contains an older proposed roadmap where ADMIN006 and ADMIN007 had different planned meanings. That document remains historical evidence. The implemented meanings are authoritative from PR #498 and PR #502 and are recorded here.

## Result

ADMIN006 and ADMIN007 are released and production-verifiable.

## Next step

Implement ADMIN008 as a bounded read-only Integrations view for Telegram, Supabase, n8n and Vercel status. Do not add browser-triggered deployments, migrations or secret management.

## Rollback

- Frontend rollback candidate: previous READY Vercel deployment `dpl_3oW9UcJ7ZweUDF7ohwUccFUjHJMT` at `d3f0d98fceeb400b3f8429c06f446948250c443a`.
- Backend rollback requires a separately approved Supabase change and must not be attempted from the browser admin panel.
