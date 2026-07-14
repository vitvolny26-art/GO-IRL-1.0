---
title: Agent Report — Instagram and Messenger MVP Scaffold
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report

## Task

Extend the safe WhatsApp Phase 1 event join scaffold to Instagram Direct and Facebook Messenger.

## Files inspected

- Existing provider-neutral join types.
- WhatsApp payload builders, parser, mock webhook, tests, architecture document, and disabled endpoint.
- Existing share UI references to WhatsApp and Messenger.
- Current TypeScript, ESLint, Vite, Vercel, and reporting contracts.

## Findings

- Instagram and Messenger can share domain join results and test parsing without sharing provider identities.
- Invitation payloads need provider-specific envelopes but can use the same stable Join/Details action IDs.
- Live permissions, app review, business assets, request authenticity, and message-window rules remain production concerns.

## Changes made

- Extended `JoinProvider` with `instagram` and `messenger`.
- Added conservative Instagram and Messenger invitation payload builders.
- Added shared Meta confirmation builder with calendar/map links.
- Added mock parsing for text, quick replies, and postbacks.
- Added disabled Instagram and Messenger webhook endpoints returning `503`.
- Added architecture boundaries and 8 unit tests.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (25 files, 152 tests)
- `pnpm run typecheck` — PASS
- Isolated TypeScript compile for both endpoints — PASS

## Risks

- Meta payload details and permissions must be validated against the active test app before production use.
- No request signature validation or replay protection exists because endpoints are intentionally disabled.
- No provider identity mapping or join persistence exists.

## Not touched

- `.env`, secrets, tokens, account IDs, or production Meta configuration
- Auth, Supabase, RLS, SQL, or migrations
- Telegram or WhatsApp runtime behavior
- Existing share UI

## Next step

After explicit production approval, validate each payload in the Meta sandbox and design request authenticity, identity mapping, idempotency persistence, and shared join-service integration before enabling endpoints.
