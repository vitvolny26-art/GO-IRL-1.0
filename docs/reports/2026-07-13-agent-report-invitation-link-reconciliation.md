---
title: Agent Report
owner: AI Fixer / QA + UX Polish Agent
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report

## Task

Prevent invitation copy from being glued to Telegram `startapp`, require UUID-only Telegram event payloads, and show explicit errors for invalid or missing invitation events.

## Files inspected

- `src/App.tsx`
- `src/cardShare.ts`
- `src/share/*`
- `src/authSession.ts`
- `src/verticals/SportVertical.tsx`
- `src/i18n.ts`

## Findings

- The general share flow passed a `url` field to Web Share while its text already contained the same URL.
- Share targets may concatenate structured fields without preserving a separator.
- Incoming `start_param` was accepted as an arbitrary event ID and silently fell back to the home screen when invalid or missing.
- Activity invite URL generation was duplicated between generic and Sport renderers.

## Changes made

- Added a shared invitation-link module with strict UUID validation.
- Telegram `startapp` is generated only for a valid event UUID.
- Non-UUID demo events use the existing browser `/join/:id` fallback instead of an invalid Telegram payload.
- Telegram share URLs pass event URL and invitation copy in separate query parameters.
- Native/clipboard share text contains the URL exactly once and separates it from copy with a blank line.
- Invalid `startapp` and missing events show localized user-facing errors.
- Added regression tests using the reported malformed link shape.

## Checks

- `pnpm run lint`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: PASS — 32 files, 170 tests
- `pnpm run typecheck`: PASS

## Risks

- Cross-account Telegram verification still requires two real Telegram accounts and a production UUID event.
- Telegram client cache can keep an older frontend bundle until the Mini App is fully closed and reopened, but malformed payloads are now rejected explicitly.

## Not touched

- Auth trust model, Supabase RLS, migrations, secrets, webhook contracts
- PR #77, GitHub remote, Vercel deployment

## Next step

Run local gates, then verify one newly generated invitation from a second Telegram account before deployment.
