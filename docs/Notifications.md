# Notifications and Messaging Delivery

GO IRL notifications are server-side. The Telegram Mini App must not stay alive in the background, hold provider credentials, or run notification workers.

`ROADMAP.md` remains the canonical product roadmap. Detailed Com-Rev sequencing and verification gates are maintained in `docs/roadmap/COM_REV_IMPLEMENTATION_ROADMAP.md`. Current GitHub `main` and verified runtime readback override historical status statements in this document.

## Current bounded status

The messaging and reminders platform is substantially implemented, but the overall Com-Rev track remains **Partial** until current production deployment and end-to-end Telegram binding are proven.

Recorded implemented capabilities include:

- server-side reminder processing;
- protected reminder storage;
- transactional outbox delivery for event lifecycle messages;
- retry and idempotency controls;
- per-channel opt-in, opt-out, and suppression behavior;
- delivery monitoring and structured status;
- organizer approval and participant decision messages;
- event update and cancellation messages;
- calendar, map, and event-open actions in supported outbound messages.

Recorded channel state at the inspected completion checkpoint:

- Telegram: reported production-green;
- Facebook Messenger: reported production-green;
- Instagram Direct: functionally advanced but disabled behind a credential-rotation and security gate;
- WhatsApp: webhook and adapter work recorded, but production outbound disabled pending Meta business verification, production number registration, and template approval.

These channel claims require fresh smoke evidence before being presented as current production status.

## Delivery architecture

A domain event or reminder creates durable delivery work before provider delivery. A worker claims eligible records, sends through the selected provider, applies retry policy, and persists the result. Idempotency prevents repeated worker execution from producing duplicate user messages.

The frontend must not:

- store service credentials;
- send provider messages directly;
- run background notification workers;
- treat Mini App lifetime as a scheduler.

## Event lifecycle coverage

Recorded delivery coverage includes:

- join confirmation;
- pending request state;
- waitlist state;
- request approval;
- request rejection;
- event changes;
- event cancellation;
- reminders before event start.

Delivery must preserve recipients needed for cancellation or lifecycle messages before destructive event changes.

## Consent and suppression

- Delivery is opt-in where required by channel and product rules.
- Users must be able to disable notifications through one bounded preference change.
- STOP/СТОП suppression behavior must prevent unwanted Meta-channel responses.
- Quiet-hours and working-hours behavior must be stated only where current runtime evidence exists.
- Private participant data and sensitive message content must not be copied into delivery logs or reports.
- Provider identifiers and credentials must remain server-side.

## Event-bound Telegram chat

Com-Rev027 introduced a short-lived, single-use binding handshake for associating a GO IRL event with a Telegram group or supergroup.

The intended flow is:

1. organizer requests a binding;
2. server validates the GO IRL identity and organizer ownership;
3. server returns a Telegram `startgroup` link backed by a hashed, expiring token;
4. Telegram sends a webhook when the bot is added;
5. server validates the webhook secret, token, requester identity, chat type, organizer admin status, and bot permissions;
6. bot creates an invite link;
7. chat metadata and invite URL are persisted against the event;
8. the token is consumed;
9. the Mini App reads back the server-side binding.

The code and CORS follow-up were merged, but complete current production E2E remains unverified. Required evidence includes preflight success, organizer request success, binding row creation, webhook processing, `consumed_at`, persisted chat metadata, invite link, and Mini App readback.

## Authorization rules

Current verification must cover:

- organizer can create and read the binding;
- confirmed participant can access the bound chat as intended;
- pending, rejected, blocked, removed, and unrelated users are denied;
- non-organizers cannot create or replace the binding;
- expired and consumed tokens cannot be reused;
- no authorization path depends on demo-only identity.

## Reliability requirements

- Repeated worker runs must not duplicate messages.
- Empty queues must complete without false failures.
- Retryable provider errors must follow the configured retry policy.
- Permanent failures must remain visible to operators.
- Webhook conflicts must remain non-destructive.
- Monitoring must expose overdue and failed work without leaking credentials, provider payloads, or private message content.

## Channel gates

### Telegram and Messenger

Retain production-green status only after current deployment and live smoke evidence support it.

### Instagram Direct

Keep disabled until:

- exposed credentials are rotated through an explicitly approved process;
- server-only token refresh is verified;
- a short lifecycle smoke passes using fresh credentials;
- the security gate is explicitly closed.

### WhatsApp

Keep production outbound disabled until:

- Meta business verification is complete;
- a production number is registered;
- required templates are approved;
- opt-in and the 24-hour messaging window are verified;
- production outbound smoke passes.

### Email, push, and other channels

Email and push remain future channels unless separately implemented and verified. Viber and other provider references are planning input, not current implementation claims.

## Evening digest

Evening digest remains deferred unless separately approved and implemented. Its intended safety rules include opt-in, quiet hours, exclusion of private or expired events, duplicate prevention, bounded delivery logs, and no use of sensitive identifiers in ranking.

No document should claim a real digest ranking model, current digest delivery, or broad n8n engagement automation without direct runtime evidence.

## Completion boundary

This notification and messaging track may be marked complete only when:

- exact production commit is known;
- required checks are green on the reviewed commit;
- Telegram event-chat binding passes full E2E;
- authorization and membership matrix passes;
- lifecycle and reminder delivery remain idempotent and observable;
- channel release gates are accurately stated;
- Drive and ClickUp are synchronized from fresh readback;
- no required production, secret, auth, RLS, SQL, migration, or destructive-data approval is bypassed.
