---
title: WhatsApp Event Join MVP
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# WhatsApp Event Join MVP

## Purpose

The implementation started as a disabled Phase 1 scaffold for GitHub Issue #75. Telegram remains the primary full application. WhatsApp is an additional invitation and join channel over the same event and participation rules.

## MVP flow

```text
invitation -> join -> confirmation -> calendar/map
```

1. An invitation contains the event title, date/time, location, available spots, and a stable Join reply ID.
2. Join creates a provider-neutral `JoinIntent` with an idempotency key.
3. The shared event service will eventually return `joined`, `already_joined`, `waitlisted`, or `rejected`.
4. Successful confirmation includes calendar and map actions.

Duplicate Join requests must resolve to `already_joined` and must not create another participant. A full event must resolve to `waitlisted` where supported or a clear `event_full` rejection.

## Implemented production boundary

- Provider-neutral join contracts live under `src/join/`.
- WhatsApp payload builders and parsers live under `src/whatsapp/`.
- `api/whatsapp/webhook.ts` supports Meta GET verification and signature-checked POST delivery.
- Provider identities are stored in generic `app_users`; external WhatsApp IDs are never used as public participant keys.
- `go_irl_provider_join` performs atomic, idempotent join/waitlist/request persistence under `service_role` only.
- Join confirmations include calendar and map actions and are sent through the Cloud API.
- Secrets are server-only Vercel variables and are not stored in the repository.

## Production configuration gate

The code and database path are implemented. Live delivery still requires an active WhatsApp Business number, a permanent access token, Phone Number ID, a subscribed webhook, and Meta publication/business requirements.

## Not in scope

- Event creation from WhatsApp.
- Event chat or profile parity.
- Separate WhatsApp event or participant tables.
- Messenger or Viber.
- Changes to the Telegram share/join flow.
