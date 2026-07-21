---
title: Meta Public Event Actions Hardening
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-21
next_review: 2026-07-28
---

# Meta Public Event Actions Hardening

## Task

Review and harden Draft PR #282 without changing auth, RLS, SQL, migrations, secrets, or production data.

## Files inspected

- `api/_shared/provider-messages.ts`
- `api/_shared/telegram-share-event.ts`
- `api/meta/event-preview.ts`
- `api/_shared/meta-event-calendar.ts`
- Meta and WhatsApp payload builders and tests

## Findings

- Public Meta endpoints used the service-role event loader without rejecting private activities.
- Preview deployments generated action URLs for the production domain.
- The public preview accepted four languages but rendered Russian action labels for all of them.
- The new ICS generator did not have focused regression coverage.
- Exact WhatsApp two-link-button parity remains outside this PR and depends on an approved template or supported WhatsApp interaction.

## Changes made

- Reject private activities before returning share-card data; public and invite-link activities remain shareable.
- Keep action URLs on the current Vercel Preview deployment while retaining the production domain in production.
- Localize calendar and Telegram action labels for Russian, Ukrainian, Czech, and English.
- Extract the pure ICS builder and cover event facts, escaping, midnight rollover, and duration clamping.
- Serve ICS from the existing Meta preview function to stay within the Vercel Hobby limit of 12 Serverless Functions.
- Add focused visibility and Preview-origin regression tests.

## Checks

- `pnpm run lint` — PASS
- `pnpm run typecheck` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (60 files / 304 tests)

## Risks

- Android Messenger still requires physical verification that the `.ics` response opens in an installed calendar application.
- The first Preview attempt was rejected after a successful build because a separate calendar endpoint exceeded the Hobby function-count limit; the route was consolidated before the retry.
- WhatsApp invitation actions remain provider-specific and are not identical to Messenger/Instagram generic-template buttons.

## Not touched

- `.env` and secrets
- Supabase RLS, schema, SQL, migrations, and production data
- Authentication
- Production webhook configuration

## Next step

Push one consolidated commit to PR #282, wait for one Vercel Preview build, then repeat Android Messenger event-preview and calendar QA before merge.
