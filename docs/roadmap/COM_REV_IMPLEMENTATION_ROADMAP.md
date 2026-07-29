---
title: Com-Rev Implementation Roadmap
owner: Sprint Planner
status: Active
source_of_truth: false
last_review: 2026-07-29
next_review: 2026-08-05
---

# Com-Rev Implementation Roadmap

This document is the detailed implementation and verification roadmap for the GO IRL messaging, reminders, notification delivery, and event-bound Telegram chat work commonly tracked as the Com-Rev series.

`ROADMAP.md` remains the canonical product roadmap. Current GitHub `main` and verified runtime readback remain higher-authority evidence than this document. Historical reports, sprint files, and ClickUp tasks do not override repository or runtime evidence.

## Current bounded status

**Overall status: Partial.**

The repository contains substantial messaging and Telegram chat implementation, but the latest production artifact and the full Com-Rev027 end-to-end flow are not yet proven by fresh readback.

Proven in repository or cited release evidence:

- server-side notification and reminder processing;
- transactional outbox delivery for event lifecycle messages;
- scheduled reminder worker;
- retries and idempotency controls;
- per-channel opt-in and opt-out behavior;
- monitoring and structured delivery status;
- Telegram and Facebook Messenger reported production-green at the inspected completion checkpoint;
- secure event-bound Telegram group binding implementation merged through Com-Rev027;
- clean CORS follow-up merged after the initial browser preflight failure;
- the regressing event-card layout release was reverted in GitHub and passed CI.

Not yet proven by current runtime evidence:

- which exact commit is presently promoted in production after the event-card revert;
- visual production restoration of the reverted event card;
- complete Com-Rev027 flow from browser preflight through Mini App readback;
- organizer, confirmed-participant, and denied-user access matrix in production;
- ClickUp synchronization against the post-merge runtime state;
- Instagram production enablement after required credential rotation;
- WhatsApp production outbound after Meta business, number, and template approval.

## Implemented architecture

### Notification and reminder delivery

The implemented delivery model is server-side. The Telegram Mini App is not a background worker and must not hold provider credentials.

The delivery path includes:

1. a domain event or reminder creates a durable delivery record;
2. a worker claims eligible work;
3. provider delivery runs with retry and idempotency controls;
4. delivery status is persisted for monitoring and duplicate prevention;
5. opt-out and suppression rules prevent unwanted delivery.

Recorded event lifecycle coverage includes join confirmation, pending state, waitlist, approval, rejection, event changes, cancellation, and reminders before an event.

### Com-Rev027 event-bound Telegram chat

Com-Rev027 introduced a short-lived, single-use binding handshake between a GO IRL activity and a Telegram group or supergroup.

The intended flow is:

1. the organizer selects **Create and bind chat**;
2. the Mini App requests a binding for the activity;
3. the server validates the GO IRL identity and organizer ownership;
4. the server creates a random token and stores only its SHA-256 hash;
5. the organizer opens the returned Telegram `startgroup` link;
6. Telegram sends a webhook update after the bot is added;
7. the server validates the webhook secret, token, expiry, requester identity, chat type, organizer admin status, and bot permissions;
8. the bot creates an invite link;
9. Telegram chat metadata and invite URL are persisted against the activity;
10. the token is marked consumed;
11. the Mini App refreshes and reads the server-side binding.

Security properties recorded for the handshake:

- raw token is not stored;
- token expires after 15 minutes;
- token is single-use;
- older unfinished tokens for the same event are removed when a new request is created;
- webhook secret comparison is constant-time;
- a conflicting existing webhook is reported rather than replaced automatically.

## Release evidence ledger

| Area | Evidence | Bounded conclusion |
|---|---|---|
| Com-Rev027 main implementation | PR #452; head `421b9fb2926ad217b5e5dd121942c73ec1d4ac82`; merge `f39936ba6840432aed4de892364714762d528d90`; CI #1276 success | Code and migration merged |
| Com-Rev027 CORS follow-up | PR #455; tested head `899e6cc0c3c923bb365356b7d1e840d8644d249d`; merge `58f40c4c51d2c81e68e74550def4e3d81969772d`; CI #1279 green | Clean follow-up merged |
| Later binding follow-ups | Com-Rev028 `e84b77b86a93b9742422141aeaddd933e6aebcc7`; Com-Rev029 `0c0ecc89185e87e30fb1dfca087ff635c8730936`; Com-Rev030 `2cf00823695e9d4db9f2607f46bb903bcff663f6`; Com-Rev031 `f3d10c2e5a234a5be82d62098c91649438a640e6` | Follow-up implementation exists on `main`; this roadmap does not independently prove runtime behavior |
| Later Telegram group flow | Com-Rev125 `1accfd0e66ddba21da4dbc56629172e23922e65d`; Com-Rev126 `340a9a85d1db19b969ebd06ceae9c0917935d6f4` | Additional group-creation flow changes exist; runtime must be re-smoked |
| Event-card regression recovery | Revert `b199088`; PR #473; merge `79350ae8d5af7a6e53d783aa83157a70b78048f6`; CI #1315 green | GitHub tree restored; production restoration still requires readback |
| Durable supporting report | Drive document `1lUjuIVIKxRdK-k4yDZkr7y7OpL1KsNAoz5mM9MQT8v8` | Supporting evidence only; status Partial |

## Active sequence

Only one stage should be active at a time.

### Stage 1 — Production artifact readback

Goal: establish the exact currently promoted production artifact before any new implementation or UI patch.

Checks:

- read the production deployment metadata;
- record the exact deployed commit SHA;
- compare it with current `main` and the revert merge;
- visually smoke the event card in the Telegram Mini App;
- record viewport, account context, timestamp, and result.

Exit signal:

- exact deployed SHA is recorded;
- event-card restoration is visually verified;
- no unresolved production mismatch remains.

This stage is read-only unless a separate production deployment or promotion approval is granted.

### Stage 2 — Com-Rev027 happy-path runtime verification

Entry gate: Stage 1 is green.

Checks:

1. trigger `create_binding` as the event organizer;
2. verify browser preflight returns the expected successful response;
3. verify the organizer request reaches the handler and returns success;
4. verify one active binding row exists with the expected activity and expiry;
5. complete the Telegram `startgroup` flow;
6. verify webhook processing;
7. verify `consumed_at` is set;
8. verify invite link and Telegram chat metadata are persisted;
9. verify the Mini App reads back and displays the bound chat.

Exit signal:

- one complete trace links the browser request, binding row, Telegram webhook, persisted chat, and Mini App readback;
- no manual database mutation is used to manufacture success.

### Stage 3 — Authorization and membership matrix

Entry gate: Stage 2 is green.

Checks:

- organizer can create and read the binding;
- confirmed participant can read or open the bound chat as intended;
- pending, rejected, blocked, removed, and unrelated users are denied;
- a non-organizer cannot create or replace the binding;
- expired and consumed tokens cannot be reused.

Exit signal:

- access outcomes are recorded for every required role;
- no authorization result depends on demo-only identity.

### Stage 4 — Reliability and operational behavior

Entry gate: Stage 3 is green.

Checks:

- repeated worker execution does not duplicate user messages;
- empty queues return success without false alerts;
- retryable provider failure is retried within the configured policy;
- permanent provider failure is retained and visible to operators;
- webhook conflict remains non-destructive;
- stale binding requests are bounded and recoverable;
- monitoring exposes overdue or failed work without leaking secrets or message content.

Exit signal:

- delivery and binding failure modes are observable and bounded;
- no provider credential is present in the client or reports.

### Stage 5 — Channel release gates

Telegram and Messenger may retain their recorded production-green state only when current smoke evidence still supports it.

Instagram remains disabled until:

- exposed credentials are rotated through an explicitly approved procedure;
- server-only token refresh is verified;
- a short lifecycle smoke passes with fresh credentials;
- the security gate is explicitly closed.

WhatsApp remains disabled until:

- Meta business verification is complete;
- a production number is registered;
- required templates are approved;
- production outbound smoke passes;
- opt-in and 24-hour-window behavior are verified.

### Stage 6 — Documentation and operational synchronization

Entry gate: preceding runtime stages have current evidence.

Actions:

- update the canonical Com-Rev report with exact deployment and E2E evidence;
- update `docs/Notifications.md` from verified state;
- update the relevant ClickUp epic and tasks through readback-confirmed writes;
- mark only individually proven items complete;
- retain unresolved provider and production gates as blockers.

Exit signal:

- GitHub, current runtime evidence, Drive report, and ClickUp describe the same bounded state;
- no document claims `Completed` while deployment or E2E evidence is missing.

## Preview-first rule for UI work

Any new event-card or Telegram-chat UI change must follow this order:

1. edit without commit;
2. run `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test`, and `git diff --check`;
3. open a live preview without publishing or deploying;
4. obtain visual approval;
5. create one final commit;
6. run GitHub Actions on the exact head;
7. merge only after green CI and explicit merge approval;
8. perform one controlled production release;
9. verify the promoted artifact by readback.

## Completion criteria

The Com-Rev implementation track may be marked `Completed` only when all of the following are directly evidenced:

- exact production commit is known;
- latest required quality checks are green on the reviewed commit;
- Telegram event-chat binding passes full E2E;
- organizer and membership authorization matrix passes;
- reminder and lifecycle delivery remain idempotent and observable;
- production channel gates are stated accurately;
- documentation and ClickUp are synchronized from fresh readback;
- no unresolved secret, auth, RLS, migration, deployment, or destructive-data approval gate remains hidden.

## Prohibited without separate explicit approval

- merge;
- production deployment or promotion;
- secret rotation;
- auth, RLS, SQL, or migration changes;
- destructive deletion;
- replacing an existing Telegram webhook;
- force push;
- declaring the track complete without deployment and E2E evidence.
