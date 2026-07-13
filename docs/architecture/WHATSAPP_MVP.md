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

Phase 1 prepares a safe, disabled scaffold for GitHub Issue #75. Telegram remains the primary full application. WhatsApp is an additional invitation and join channel over the same event and participation rules.

## MVP flow

```text
invitation -> join -> confirmation -> calendar/map
```

1. An invitation contains the event title, date/time, location, available spots, and a stable Join reply ID.
2. Join creates a provider-neutral `JoinIntent` with an idempotency key.
3. The shared event service will eventually return `joined`, `already_joined`, `waitlisted`, or `rejected`.
4. Successful confirmation includes calendar and map actions.

Duplicate Join requests must resolve to `already_joined` and must not create another participant. A full event must resolve to `waitlisted` where supported or a clear `event_full` rejection.

## Phase 1 boundaries

- Provider-neutral join contracts live under `src/join/`.
- WhatsApp payload builders and parsers live under `src/whatsapp/`.
- `api/whatsapp/webhook.ts` is intentionally disabled and returns `503`.
- GET verification and POST parsing are available only through explicitly enabled unit-test calls.
- The scaffold makes no Meta API calls and performs no persistence.
- Flow IDs and Flow tokens are caller-supplied placeholders; none are stored in the repository.

## Phase 2 approval gate

Explicit approval is required before enabling the endpoint or adding:

- Meta credentials, permanent tokens, or production webhook configuration;
- webhook signature validation and replay protection;
- WhatsApp identity persistence or account linking;
- shared join-service persistence;
- auth, Supabase RLS, SQL, or migrations;
- live Cloud API messages or deployed WhatsApp Flows.

## Not in scope

- Event creation from WhatsApp.
- Event chat or profile parity.
- Separate WhatsApp event or participant tables.
- Messenger or Viber.
- Changes to the Telegram share/join flow.
