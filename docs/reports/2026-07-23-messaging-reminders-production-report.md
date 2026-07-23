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

- Production deployment after operator monitoring:
  `go-irl-1-0-jv5nct3lq-vitvolny26-5251s-projects.vercel.app`
  (`dpl_5nAnVfPVxnirHqmXEKcMNLr2aEzF`)
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

## Meta configuration status

### WhatsApp

- Template `go_irl_event_reminder`: submitted, pending Meta review.
- Template `go_irl_event_update`: submitted, pending Meta review.
- `WHATSAPP_LIFECYCLE_TEMPLATE_NAME=go_irl_event_update` added to Production and Preview as a non-secret configuration value.
- Production redeployed after the environment update.
- WhatsApp must remain disabled in `REMINDER_ENABLED_PROVIDERS` until both the relevant template and live credentials pass a real-number smoke test.

### Instagram Direct

- Inbound webhook and outbound adapter exist.
- Production enablement still needs:
  - confirmation of the connected professional account;
  - a real inbound DM to open the allowed messaging window;
  - one controlled outbound lifecycle smoke test;
  - verification that retries do not duplicate a message.

### Facebook Messenger

- Inbound webhook and outbound adapter exist.
- Production enablement still needs:
  - confirmation of the connected Facebook Page;
  - a real inbound message to open the allowed messaging window;
  - one controlled outbound lifecycle smoke test;
  - verification that retries do not duplicate a message.

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
- Run equivalent session-window tests for Instagram Direct and Messenger.
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
