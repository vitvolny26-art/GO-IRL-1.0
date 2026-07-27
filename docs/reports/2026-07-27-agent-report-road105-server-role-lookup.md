---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-27
next_review: 2026-07-28
---

# Agent Report

## Task

Fix the Road105 server-side current-role lookup that denied an authenticated dedicated administrator.

## Files inspected

- `api/_shared/admin-authorization.ts`
- `api/_shared/admin-authorization.test.ts`
- `src/admin/adminSession.ts`
- `src/authSession.ts`
- `src/singleFlight.ts`
- `supabase/functions/verifyTelegramInitData/index.ts`

## Findings

- The profile correctly recognized the trusted `admin` role and displayed the admin entry.
- The protected admin route performed an additional current-role lookup.
- That lookup sent the custom GO IRL JWT to Supabase Data API, where it could be rejected before `public.user_roles` was read.
- Current `main` already contains the Telegram authentication single-flight and idempotent replay-refresh fix.

## Changes made

- Kept local JWT signature, expiry, issuer, dedicated identity, and embedded role checks unchanged.
- Changed only the server-side current-role loader to query `public.user_roles` with the existing server-only Supabase service-role credential.
- Added a generic audited `role_lookup_failed` denial category.
- Added tests proving that the custom user JWT is not forwarded to the Data API and that lookup failures remain generic.

## Checks

- `pnpm run lint` — PASS (one pre-existing warning in `api/_shared/admin-authorization.ts`)
- `pnpm run typecheck` — PASS
- `pnpm run test` — PASS (106 files, 520 tests; Staff OS checks PASS)
- `pnpm run build` — PASS
- `git diff --check` — PASS

## Risks

- Production requires `SUPABASE_SERVICE_ROLE_KEY` to remain configured only in Vercel server-side environment. The repository already uses that variable in other serverless functions.
- A real Telegram admin smoke is still required after an approved merge and deployment.

## Not touched

Frontend secrets, Supabase configuration, Edge Function deployment, SQL, RLS, migrations, production data, and destructive operations were not changed.

## Next step

Review the Draft PR and verify the Vercel environment variable name is present without reading its value before any production deployment.
