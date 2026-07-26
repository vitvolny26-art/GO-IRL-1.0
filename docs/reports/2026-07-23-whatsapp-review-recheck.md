# Agent report — WhatsApp template review recheck

Date: 2026-07-23
Scope: GO IRL messaging and reminders release gate
Overall roadmap progress: 91%

## Fix

Rechecked the two production WhatsApp templates directly in WhatsApp Manager.

## Analysis

- `go_irl_event_update`: **На проверке**.
- `go_irl_event_reminder`: **На проверке**.
- Both templates show zero sends because the WhatsApp channel remains disabled.
- No live WhatsApp smoke test was started and no production provider configuration was expanded.
- Telegram and Messenger remain the only enabled reminder providers.
- Instagram remains functionally green from the completed lifecycle, opt-out and idempotency smoke tests, but stays behind its security release gate pending credential rotation and a short repeat smoke test.

## Where

- WhatsApp Manager → Message templates.
- Production reminder provider gate in Vercel remains unchanged.
- Rolling status document: Google Doc `GO IRL — Messaging & Reminders Production Status — 2026-07-23`.

## Run

Wait for both Meta template reviews to finish. Only after both become active:

1. verify the production WhatsApp account and server-only credential;
2. run one controlled inbound/outbound lifecycle smoke test;
3. verify retry, idempotency and opt-out;
4. enable WhatsApp in the provider allowlist only after the complete gate is green.

## Check

- No secrets, provider user IDs, raw payloads or private message text were recorded.
- No runtime code, database schema, RLS, auth or migrations were changed.
- No WhatsApp message was sent.

## If green

Run the controlled WhatsApp release smoke and enable the channel only after all release checks pass.

## If red

Keep WhatsApp disabled and record the Meta rejection reason without exposing customer or credential data.
