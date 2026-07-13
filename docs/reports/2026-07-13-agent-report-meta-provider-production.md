---
title: Agent Report — Meta Provider Production Integration
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report

## Task

Implement the production backend path for WhatsApp, Instagram Direct, and Facebook Messenger event joins.

## Files inspected

- Existing Telegram trusted-auth migration and `app_users` model.
- Existing activity/member schema, RLS policies, join behavior, calendar/map helpers, Vercel config, and Meta scaffolds.
- Remote Supabase `GO IRL` project and Vercel `go-irl-1-0` project configuration.

## Findings

- Generic `app_users` already supports provider identities without separate provider tables.
- External provider IDs must not be copied into participant `user_key` values because members can be visible to event participants.
- Capacity-safe provider joins require a database transaction, not a read-then-insert sequence in Vercel.
- Meta requires webhook verification plus `X-Hub-Signature-256` validation before payload processing.

## Changes made

- Added production GET verification and signature-checked POST handlers for all three Meta channels.
- Added provider-specific Graph API send adapters.
- Added opaque provider user keys and generic `app_users` identity resolution.
- Added atomic `go_irl_provider_join` RPC with joined, duplicate, pending, waitlist, closed, private, and missing-event outcomes.
- Restricted the RPC to `service_role` and added provider constraints/indexes.
- Added calendar/map confirmations and pending-request messaging.
- Added signature and production boundary tests.
- Documented server-only Vercel environment variables and production boundaries.
- Applied migration `20260713000000_meta_provider_join.sql` to the linked production Supabase project.
- Configured production Vercel variables for Supabase access, Meta App Secret, Graph version, and webhook verify token.
- Corrected server-function imports to explicit `.js` ESM specifiers after the first Vercel runtime smoke test exposed Node resolution failure.
- Normalized relative Vercel request URLs and rotated the webhook verify token before Meta registration after runtime diagnostics.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (30 files, 163 tests)
- `pnpm run typecheck` — PASS
- Isolated compile for all three Vercel endpoints — PASS
- `supabase db lint --linked --level warning` — PASS
- Remote migration history — PASS (`20260713000000` present locally and remotely)
- Service-role RPC smoke test — PASS (`event_not_found` for an unused UUID)
- Anonymous RPC denial — PASS (HTTP 401)

## Risks

- Live outbound delivery remains unavailable for a provider until its permanent access token and account/phone ID are configured.
- Meta app publication, business verification, message-window rules, and channel permissions are external release gates.
- Full live join testing requires a real inbound message from each configured test account.

## Not touched

- Existing Telegram authentication or RLS behavior
- Existing user-owned UI changes present in the worktree
- Secrets in repository files or frontend `VITE_*` variables

## Next step

Deploy the committed backend, register each available Meta webhook, subscribe message fields, add permanent channel credentials, and complete one live invitation/join smoke test per channel.
