---
title: Agent Report — Trusted auth single-flight
owner: AI Fixer
status: Partial
source_of_truth: false
last_review: 2026-07-27
next_review: 2026-07-28
---

# Agent Report

## Task

Fix the bounded client-side trusted Telegram authentication race and verify the remaining Supabase JWT signing boundary without SQL, RLS, migrations, production data, merge, or deployment.

## Role

AI Fixer.

## Sources inspected

- Production Supabase API, Edge Function, and Postgres logs for project `tygfsvjkznypilfyyvdc`.
- Live `verifyTelegramInitData` Edge Function version 8.
- Supabase documentation for custom JWTs, `accessToken`, and JWT signing keys.
- ClickUp task `869e9g2qe`.
- GitHub `main` at `49e99d6784513fa99ce82094f3ed7318798e4c44`.

## Files inspected

- `src/authSession.ts`
- `src/supabase.ts`
- `src/App.tsx`
- `src/store.ts`
- `src/admin/adminSession.ts`
- `supabase/functions/verifyTelegramInitData/index.ts`

## Findings

- A real Telegram Mini App authentication request reached `verifyTelegramInitData` and returned HTTP 200.
- Concurrent calls using the same Telegram `initData` also returned HTTP 409 `replay_detected` because `initializeTrustedAuth()` had no in-flight request sharing.
- Data API requests to `activities` and `activity_members` returned HTTP 401 after session issuance.
- The frontend correctly passes the custom token through the Supabase client `accessToken` callback.
- The remaining HTTP 401 is bounded to JWT trust/signing configuration or token compatibility. The available Supabase connector does not expose signing-key or secret mutation, so synchronization was not executed or claimed.

## Changes made

- Added a module-level single-flight promise around trusted auth initialization.
- Concurrent callers now share one Edge Function request.
- A valid trusted session remains the fast path.
- Added focused tests for concurrent request sharing and cached-session reuse.

## Checks

Exact head `8597635582d8eff5eaeb7511e65c8fab22be2d53` before this report commit:

- GitHub Actions CI run `30270406326` / run number `1211` — PASS.
- Diff check — PASS.
- Test — PASS.
- Typecheck — PASS.
- Lint — PASS.
- Build — PASS.
- Vercel Preview status — success.

The report commit requires a new exact-head CI run before the branch can be described as fully green.

## Evidence ledger

Client auth verification was duplicated | Supabase Edge/API logs showed one HTTP 200 and concurrent HTTP 409 responses for `verifyTelegramInitData` | Production requests observed on 2026-07-27 for the tested Telegram client
Data access remained unauthorized | Supabase API logs showed HTTP 401 for `activities` and `activity_members` immediately after session issuance | Production Data API requests observed on 2026-07-27
Single-flight patch passed repository gates | GitHub Actions run `30270406326` completed successfully on commit `8597635582d8eff5eaeb7511e65c8fab22be2d53` | Branch code and tests before report-only commit
JWT configuration synchronization remains unverified | Supabase connector exposes logs and Edge Function inspection but no signing-key or secret mutation action | Production signing configuration for project `tygfsvjkznypilfyyvdc`

## GitHub

- Branch: `fix/trusted-auth-single-flight`
- Base: `main` at `49e99d6784513fa99ce82094f3ed7318798e4c44`
- Draft PR: `https://github.com/vitvolny26-art/GO-IRL-1.0/pull/417`
- Code/test head before report: `8597635582d8eff5eaeb7511e65c8fab22be2d53`

## ClickUp

- Task: `869e9g2qe`
- URL: `https://app.clickup.com/t/869e9g2qe`

## Google Drive

A matching report must be stored under `AI Reports/AI Fixer/` after the final exact-head CI result is known.

## Blockers

- Production JWT signing-key/secret synchronization cannot be safely executed with the currently available Supabase connector actions.
- No production deployment was authorized, so the real Telegram/Data API path cannot be re-smoked against this patch.

## Next step

Run exact-head CI after this report commit. Then synchronize the trusted signing configuration through an approved Supabase Dashboard or Management API path and perform a real Telegram smoke test before considering the authentication incident resolved.
