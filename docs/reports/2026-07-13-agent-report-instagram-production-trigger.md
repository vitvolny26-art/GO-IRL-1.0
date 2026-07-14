---
title: Agent Report — Instagram production trigger
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report

## Task

Prepare the Instagram Direct channel for production validation without changing authentication, Supabase RLS, SQL, or migrations.

## Files inspected

- `api/_shared/provider-messages.ts`
- `api/_shared/provider-webhook.ts`
- `api/_shared/messenger-test-invitation.ts`
- `src/meta-messaging/payload-builders.ts`
- Meta Developers Instagram messaging settings

## Findings

- The existing Meta app exposes the legacy page-linked Instagram setup, but its authorization dialog rejects the requested legacy Instagram scopes.
- Current Instagram Login sends messages through `graph.instagram.com/{version}/me/messages`.
- The runtime already shares webhook signature verification and provider-neutral Join behavior across Meta channels.

## Changes made

- Added a reusable authenticated provider test-invitation handler.
- Preserved the existing Messenger trigger through the shared handler.
- Added the disabled-by-default `/api/instagram/test-invitation` endpoint.
- Added current Instagram Login Send API support behind `INSTAGRAM_API_MODE=instagram_login`, while retaining legacy page-linked compatibility.
- Localized Instagram invitation, Join result, calendar, and map copy into Russian.
- Added endpoint, security, regression, and payload unit tests.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (37 files, 189 tests)
- `pnpm run typecheck` — PASS
- `git diff --check` — PASS

## Risks

- Live outbound validation still requires an Instagram professional account token, webhook subscription, and a recipient who has first messaged the account.
- Meta App Review remains required before messaging users without an app role.

## Not touched

- `.env` files or committed secrets
- Supabase auth or RLS
- SQL or migrations
- WhatsApp and Messenger provider behavior beyond the tested handler reuse

## Next step

Configure the Instagram Login app credentials in Vercel, subscribe the production webhook, and complete a real invitation → Join → confirmation smoke test.
