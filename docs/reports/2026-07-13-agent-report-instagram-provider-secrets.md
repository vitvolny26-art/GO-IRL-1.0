---
title: Agent Report — Instagram Provider Secrets
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report — Instagram Provider Secrets

## Task

Keep the new Instagram Login app cryptographically isolated from the existing WhatsApp and Messenger Meta app.

## Files inspected

- `api/_shared/env.ts`
- `api/_shared/provider-webhook.ts`
- `api/_shared/provider-webhook.test.ts`
- `api/_shared/meta-signature.test.ts`

## Findings

- Instagram Login uses a separate Meta app and therefore a separate App Secret.
- Reusing `META_APP_SECRET` would reject valid Instagram webhook signatures.
- A provider-specific verify token avoids coupling future Instagram webhook verification to the existing Meta app.

## Changes made

- Added `INSTAGRAM_APP_SECRET` support for Instagram POST signature verification.
- Added `INSTAGRAM_VERIFY_TOKEN` support for Instagram GET webhook verification.
- Preserved the existing shared Meta variables as compatibility fallbacks.
- Added unit coverage for provider-specific verification and signature validation.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (37 files, 191 tests)
- `pnpm run typecheck` — PASS

## Risks

- Instagram remains development-only until its access token, webhook subscription, and live message smoke test pass.

## Not touched

- `.env` files
- Supabase RLS, auth, SQL, and migrations
- WhatsApp and Messenger credentials or webhook behavior

## Next step

Store the two Instagram-specific variables in Vercel, verify the production callback, then complete the outbound and inbound smoke test.
