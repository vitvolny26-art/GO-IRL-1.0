---
title: Agent Report
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-18
---

# Agent Report

## Task

Prepare the bounded WhatsApp sharing fix for Activities and Services without changing Telegram.

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `api/meta/event-preview.ts`
- `vercel.json`
- related share and API tests

## Findings

WhatsApp fallback and native file share text used the API preview URL instead of a short public HTML landing URL.

## Changes made

- Added `/e/:id` and `/s/:slug` public landing rewrites.
- Kept the JPEG API as the internal image source.
- Switched WhatsApp native share text and fallback to short landing URLs.
- Preserved Activity ID and Service date/slug context through the landing and CTA.
- Added regression tests for both entity types.

## Checks

- `pnpm run repo:check` — PASS
- `pnpm run lint` — PASS with one pre-existing warning outside scope
- `pnpm run typecheck` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS, 676 tests plus Staff OS
- `git diff --check` — PASS

## Risks

Android and WhatsApp may vary in whether text is retained alongside a file share. The landing-only fallback remains available.

## Not touched

- Telegram share behavior
- authentication, RLS, SQL, migrations, secrets
- production deployment

## Next step

After explicit authorization, create one release commit, run GitHub Actions on the exact head, merge, and deploy only when green.
