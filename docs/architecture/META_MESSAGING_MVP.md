---
title: Instagram and Messenger Event Join MVP
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Instagram and Messenger Event Join MVP

## Purpose

Extend the safe WhatsApp Phase 1 approach to Instagram Direct and Facebook Messenger without creating separate event or participant systems.

```text
invitation -> Join quick reply -> shared JoinIntent -> confirmation -> calendar/map
```

Telegram remains the primary application. WhatsApp, Instagram, and Messenger are provider identities and interaction channels over shared events, capacity rules, moderation, and future persistence.

## Phase 1 scaffold

- `JoinProvider` supports `instagram` and `messenger`.
- Invitation builders create event summaries and stable `join:<eventId>` / `details:<eventId>` quick-reply payloads.
- Confirmation builders render joined, duplicate, waitlist, and rejection results with calendar/map links.
- Mock webhook parsing recognizes text, quick replies, and postbacks.
- `api/instagram/webhook.ts` and `api/messenger/webhook.ts` are disabled and return `503`.
- No live Meta calls, access tokens, account IDs, permissions, persistence, or webhook configuration are included.

## Production approval gate

Before enabling either channel, validate current Meta payload requirements in a test app and explicitly approve:

- Instagram professional account and Facebook Page connection;
- Messenger Page permissions and Instagram messaging permissions;
- production webhook verification and request authenticity checks;
- replay/idempotency storage and provider identity mapping;
- shared join-service persistence plus any required auth/RLS/schema work;
- live Send API calls, message-window rules, app review, and business verification.

## Out of scope

- Full GO IRL UI inside Instagram or Messenger.
- Event creation, chat parity, or profile editing.
- Separate provider-specific event/participant tables.
- Enabling Meta endpoints or changing the Telegram runtime.
