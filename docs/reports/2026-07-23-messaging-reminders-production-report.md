# GO IRL messaging and reminders — production status

Date: 2026-07-23  
Scope: Telegram, WhatsApp, Instagram Direct, Facebook Messenger  
Repository: `vitvolny26-art/GO-IRL-1.0`

## Executive status

The provider-neutral messaging foundation is implemented and deployed. Telegram is the only channel intentionally enabled for scheduled reminders in production. WhatsApp lifecycle and reminder templates are submitted to Meta and remain pending review. Instagram Direct and Messenger delivery adapters are implemented, but production enablement still requires live policy-window smoke tests with the connected accounts.

Production remains safe while external approvals are incomplete: disabled channels do not receive scheduled outbound traffic, secrets remain server-side, and lifecycle delivery is handled through an idempotent database outbox with retry state.

## Completed

### Reminder product

- Event-card reminder control and reminder settings UI.
- Public and otherwise untrusted sessions cannot create a misleading local-only
  reminder: provider controls and Save remain disabled until trusted
  authentication is present.
- For trusted sessions, the server record is authoritative; stale local reminder
  state is cleared when no matching server reminder exists.
- Secure reminder persistence with RLS.
- Provider selection and provider-specific opt-in/opt-out state.
- Scheduled worker on the protected `/api/reminders/run` route.
- Retry and idempotency handling.
- Telegram outbound reminder delivery.
- `STOP`/`СТОП` and `START`/`СТАРТ` controls for supported Meta channels.
- Protected health response covering overdue reminders and lifecycle notifications.
- Best-effort Telegram operator alerts for worker failures and overdue queues.
- Atomic Supabase cooldown that prevents repeated alerts from spamming the operator.

### Transactional lifecycle messages

- Provider-neutral `event_notifications` outbox.
- Atomic claim and finish functions for the worker.
- Queueing for:
  - join confirmed;
  - join pending;
  - waitlisted;
  - request approved;
  - request rejected;
  - event changed;
  - event cancelled.
- Organizer-authorized join-request review RPC.
- Cancellation recipients are preserved before event deletion.
- Existing webhook acknowledgements avoid duplicate lifecycle messages.

### Channel adapters

- Telegram: direct message with event action button.
- WhatsApp: session text inside the customer-service window; approved template outside it.
- Instagram Direct: session-window delivery adapter.
- Messenger: session-window delivery adapter.
- Provider opt-out cancels pending delivery assigned to that provider.

### Security and data

- Supabase migration `20260723103725_event_notification_outbox.sql` applied.
- `event_notifications` has RLS enabled.
- Authenticated users can read only their own notification records.
- Client roles cannot insert, update, or delete outbox records.
- Server functions claim and finish delivery atomically.
- No access tokens or secrets are stored in the client or repository.

## Production verification

- Latest production deployment after the reminder authentication gate:
  `go-irl-1-0-e4y17j0qx-vitvolny26-5251s-projects.vercel.app`
  (`dpl_DouoTRv5yh6jiaN8Rm6MqTqMjz8t`)
- Deployment status: Ready.
- Production scheduler calls `/api/reminders/run` successfully.
- Unauthenticated health access returns `401`.
- Worker logs showed empty successful batches with zero retries and failures when no work was due.
- Database transaction smoke test queued a `join_confirmed` notification and rolled back test data.
- Lint, typecheck, build, and the full test suite passed for the runtime patches.
- Final observed suite: 71 test files, 357 tests.
- Production cron at 13:06, 13:07, and 13:08 returned `200` with zero
  retries and failures.
- Production cooldown smoke test proved first claim `true`, immediate repeated
  claim `false`, and rolled back test data.
- Operator alert state has RLS enabled; `anon` and `authenticated` have neither
  table read access nor RPC execution access.
- Automated mobile-width verification at `390×844` proved that the reminder
  panel fits without horizontal overflow. In a public unauthenticated session,
  all four providers and Save are disabled and the sign-in explanation is
  visible.

## Merged work

- PR #296 — reminder foundation.
- PR #298 — reminder persistence and UI.
- PR #299 — provider delivery groundwork.
- PR #300 — scheduling and worker integration.
- PR #302 — secure reminder persistence.
- PR #303 — provider-neutral delivery.
- PR #304 — worker reliability.
- PR #305 — production readiness.
- PR #307 — reminder opt-out and health monitoring.
- PR #308 — transactional event-notification outbox.
- PR #309 — cancellation-recipient preservation and outbox monitoring.
- PR #311 — operator alerts and protected cooldown.
- PR #312 — production monitoring verification report.
- PR #313 — server-authoritative reminder state.
- PR #314 — trusted-authentication gate and mobile reminder release check.
- PR #317 — privacy-safe Meta webhook diagnostics.
- PR #318 — durable inbound identity lifecycle and webhook idempotency.

## Meta configuration status

### WhatsApp

- Template `go_irl_event_reminder`: submitted, pending Meta review.
- Template `go_irl_event_update`: submitted, pending Meta review.
- `WHATSAPP_LIFECYCLE_TEMPLATE_NAME=go_irl_event_update` added to Production and Preview as a non-secret configuration value.
- Production redeployed after the environment update.
- WhatsApp must remain disabled in `REMINDER_ENABLED_PROVIDERS` until both the relevant template and live credentials pass a real-number smoke test.

### Instagram Direct

- Production callback is verified at
  `https://go-irl-1-0.vercel.app/api/instagram/webhook`.
- App-level subscriptions for `messages` and `messaging_postbacks` are enabled.
- Inbound webhook and outbound adapter exist.
- Production enablement still needs:
  - confirmation of the connected professional account;
  - a real inbound DM to open the allowed messaging window;
  - one controlled outbound lifecycle smoke test;
  - verification that retries do not duplicate a message.
- The Meta legacy Page-permission dialog currently requests the invalid
  `instagram_manage_messages` and `instagram_basic` scopes. The live gate stays
  closed until the professional Instagram identity is connected through the
  current permission flow.

### Facebook Messenger

- Production callback is verified at
  `https://go-irl-1-0.vercel.app/api/messenger/webhook`.
- The connected Page is `GO IRL` (`1140926245780489`).
- `messages` and `messaging_postbacks` subscriptions are active.
- A fresh real inbound Messenger message reached production deployment
  `dpl_5wjHfSkoB1ogVdLYSckVVe7VFzgV`. The privacy-safe log proved
  `entries=1`, `directMessagingEvents=1`, `actions=1`, `duplicates=0`, and
  `failures=0`; one backend welcome response was visible in the same
  conversation.
- `last_inbound_at` now updates for ordinary messages. An already revoked
  identity remains revoked when another ordinary message arrives.
- `СТОП` produced the expected confirmation and set the provider identity to
  `revoked`. A later ordinary inbound updated the 24-hour-window timestamp
  without silently re-enabling notifications. `СТАРТ` then restored `active`
  status with explicit consent.
- Durable webhook idempotency is active. Only a provider-scoped SHA-256 event
  key is stored; raw provider event IDs and payloads are not persisted.
  Production SQL verification proved first claim `true`, concurrent duplicate
  claim `false`, and post-completion claim `false`.
- The table has RLS enabled; `anon` and `authenticated` have no table access or
  RPC execution, while `service_role` can claim and complete events.
- The basic inbound/outbound, identity, idempotency, and opt-in/opt-out gates
  are green. A controlled transactional lifecycle/outbox fixture still remains
  before Messenger can be added to scheduled reminders.

## Release gates

A channel can be added to `REMINDER_ENABLED_PROVIDERS` only after all of these are green:

1. Correct production account and credential are connected.
2. Webhook signature verification succeeds.
3. Real inbound message reaches the production webhook.
4. Real outbound message reaches the intended account.
5. Join or lifecycle action produces one outbox item and one user-visible message.
6. Retry is idempotent and does not duplicate delivery.
7. Opt-out prevents new outbound messaging for that provider.
8. No secret appears in the client, logs, report, or repository.

## Remaining roadmap

### P0 — external approvals and live smoke tests

- Wait for both WhatsApp templates to become Active.
- Verify the production WhatsApp phone number and permanent system-user token match.
- Run one controlled WhatsApp invitation, join, lifecycle, reminder, and opt-out test.
- Run a session-window test for Instagram Direct after the professional account
  is connected through valid permissions.
- Run the controlled lifecycle/outbox fixture for Messenger. Its production
  webhook, reply, durable idempotency, identity refresh, and explicit
  opt-in/opt-out gates are green.
- Enable channels one at a time only after their individual release gate passes.

### P1 — physical-device QA

- Android Telegram, WhatsApp, Instagram, and Messenger.
- Validate event card, join, confirmation, calendar, map, reminder selection, opt-out, event change, and cancellation.
- Confirm app/browser transitions are channel-appropriate.
- Record screenshots and exact event/user/channel combinations used.

### P1 — operations

- Configure `REMINDER_ALERT_TELEGRAM_CHAT_ID` after a single operator identity is
  explicitly selected; alert delivery remains safely disabled until then.
- Define daily checks for outbox age and failure count.
- Add a documented credential-rotation procedure for every Meta channel.
- Record Meta App Review permissions and expiry/renewal owners.

### P2 — product follow-up

- User-visible delivery history and failure recovery.
- Reminder presets by event type.
- Organizer broadcast workflow with explicit audience and opt-out enforcement.
- Analytics for invitation → open → join → attendance by channel.

## Current decision

Telegram remains the only fully enabled scheduled-reminder channel. The code and data model for all four channels are in production, but WhatsApp, Instagram Direct, and Messenger are held behind explicit external release gates. This avoids sending invalid templates, violating Meta messaging windows, or using mismatched production identities.

## Meta webhook release evidence

- Messenger callback verification and live inbound/outbound smoke test passed on
  production deployment `dpl_9bXJaYnhPaaJEtTMZwTXCKFJKry4`.
- Instagram callback verification and subscriptions passed on production
  deployment `dpl_6nB7Su2r6rF9NYiSmYNMnCEVt2Mk`.
- The provider-specific Instagram verification value was removed after it was
  found to conflict with the already verified shared Meta webhook value.
  Instagram now uses the existing server-side fallback without exposing a
  secret to the client, repository, report, or logs.
- Meta App publication remains intentionally blocked until each channel's
  identity, permission, app-review, and live-delivery gate is green.
- Messenger lifecycle hardening was released through PR #318 on production
  deployment `dpl_5wjHfSkoB1ogVdLYSckVVe7VFzgV`.
- Validation for PR #318: lint, typecheck, build, GitHub CI, Vercel Preview,
  and the full test suite were green (`72` files, `360` tests).
- Supabase migration `provider_inbound_idempotency` is applied. The security
  advisor reported no new exposed-function warning for its service-only RPCs;
  its no-policy notice is expected because the table is intentionally
  inaccessible to client roles.
