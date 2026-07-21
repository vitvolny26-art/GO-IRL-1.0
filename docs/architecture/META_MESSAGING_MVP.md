---
title: Instagram and Messenger Event Join MVP
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Instagram and Messenger Event Join MVP

## Purpose

Extend the safe WhatsApp Phase 1 approach to Instagram Direct and Facebook Messenger without creating separate event or participant systems.

```text
invitation -> Join quick reply -> shared JoinIntent -> confirmation -> calendar/map
```

Telegram remains the primary application. WhatsApp, Instagram, and Messenger are provider identities and interaction channels over shared events, capacity rules, moderation, and future persistence.

## Implemented production boundary

- `JoinProvider` supports `instagram` and `messenger`.
- Invitation builders create event summaries and stable `join:<eventId>` / `details:<eventId>` quick-reply payloads.
- Rich invitations use one compact 1080x900 GO IRL JPEG standard with clean activity artwork, date, price, location, level, capacity, and visual calls to action. Weather is intentionally omitted.
- The image is served by `api/meta/event-invitation-card.ts` only when a time-limited HMAC token is valid. Tokens contain public event-card data and expire after 24 hours.
- Instagram Direct and Messenger use a native Generic Template around the image. Its native actions open the matching `/join/<eventId>` web event and a Google Calendar draft generated from that same event's date, time, duration, title, and location.
- Missing deployment origin or signing secret degrades to the existing text plus quick-reply invitation instead of blocking delivery.
- Confirmation builders render joined, duplicate, waitlist, and rejection results with calendar/map links.
- Mock webhook parsing recognizes text, quick replies, and postbacks.
- `api/instagram/webhook.ts` and `api/messenger/webhook.ts` support GET verification and signature-checked POST delivery.
- Provider identities use generic `app_users` records with opaque participant keys.
- The server-only join RPC provides atomic join, duplicate, pending, and waitlist outcomes.
- Confirmation messages include calendar/map actions and use provider-specific Graph API envelopes.
- Access tokens and account IDs remain server-only Vercel variables.

## Invitation visual boundary

The rendered image is a snapshot created when the message is sent. Its image token, title, subtitle, web-event URL, and calendar URL are all derived from the same trusted event summary. Meta controls the final button chrome, cropping, message spacing, and whether a link opens in an in-app webview or the device browser. Buttons painted inside the JPEG are visual continuity only; the provider-native Open event/Calendar actions are the interactive controls.

## Production configuration gate

Before live delivery, validate and configure:

- Instagram professional account and Facebook Page connection;
- Messenger Page permissions and Instagram messaging permissions;
- production webhook verification and request authenticity checks;
- replay/idempotency storage and provider identity mapping;
- the already-deployed shared join-service migration and Vercel server variables;
- live Send API calls, message-window rules, app review, and business verification.

## Out of scope

- Full GO IRL UI inside Instagram or Messenger.
- Event creation, chat parity, or profile editing.
- Separate provider-specific event/participant tables.
- Enabling Meta endpoints or changing the Telegram runtime.
