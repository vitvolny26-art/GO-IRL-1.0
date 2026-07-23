# GO IRL messaging and reminders — production status

Date: 2026-07-23  
Scope: Telegram, WhatsApp, Instagram Direct, Facebook Messenger  
Repository: `vitvolny26-art/GO-IRL-1.0`

## Executive status

The provider-neutral messaging foundation is implemented and deployed.
Telegram and Messenger are intentionally enabled for scheduled and lifecycle
delivery in Production. WhatsApp lifecycle and reminder templates are submitted
to Meta and remain pending review. Instagram Direct has a connected professional
test account, but production enablement still requires a fresh app-scoped token,
published webhook access, and a complete live lifecycle smoke test.

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
- PR #319 — canonical production-status reconciliation.
- PR #320 — Messenger transactional delivery release evidence.

## Meta configuration status

### WhatsApp

- Template `go_irl_event_reminder`: submitted, still pending Meta review on
  2026-07-23.
- Template `go_irl_event_update`: submitted, still pending Meta review on
  2026-07-23.
- `WHATSAPP_LIFECYCLE_TEMPLATE_NAME=go_irl_event_update` added to Production and Preview as a non-secret configuration value.
- Production redeployed after the environment update.
- WhatsApp must remain disabled in `REMINDER_ENABLED_PROVIDERS` until both the relevant template and live credentials pass a real-number smoke test.

### Instagram Direct

- Production callback is verified at
  `https://go-irl-1-0.vercel.app/api/instagram/webhook`.
- App-level subscriptions for `messages` and `messaging_postbacks` are enabled.
- Inbound webhook and outbound adapter exist.
- A controlled DM from the secondary test account was visible in the
  professional account inbox, but the protected database audit recorded zero
  new Instagram inbound events and zero updated Instagram identities. This is
  a failed release gate, not evidence of a working production webhook.
- Root-cause reconciliation found that the current Instagram Login app
  `Go IRL-IG` had no connected account and the `yuzhaniin` Instagram Tester
  invitation was pending. The tester role has now been assigned and accepted,
  and API Setup lists `yuzhaniin` as the connected professional account.
- The app-scoped token has not yet been regenerated. Meta requires forced
  reauthentication for this security-sensitive step, and the account-level
  webhook subscription remains off while the app is unpublished.
- Any previously configured Instagram token must be treated as belonging to an
  older app until the new `Go IRL-IG` token is generated and verified. Instagram
  remains excluded from `REMINDER_ENABLED_PROVIDERS`.
- Production enablement still needs:
  - generation and server-side storage of a fresh `Go IRL-IG` token;
  - publication/app-review access for live webhook data;
  - a repeated real inbound DM after the current app is subscribed;
  - one controlled outbound lifecycle smoke test;
  - verification that retries do not duplicate a message.
- The obsolete legacy Page-permission path is no longer used for this gate.

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
  are green.
- The controlled transactional lifecycle/outbox fixture is also green:
  two attempts to enqueue the same `delivery_key` produced one outbox row;
  the production cron claimed it once, sent it through Messenger on attempt
  `1`, stored a provider message ID, and left no error.
- Messenger showed exactly one user-visible message bubble for the fixture.
  `REMINDER_ENABLED_PROVIDERS` is now scoped to Production and contains
  Telegram plus Messenger; Preview was deliberately excluded because its
  deployment does not receive production Messenger credentials.

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
- Complete forced reauthentication, generate the current `Go IRL-IG` token,
  publish/approve the required webhook access, and repeat the Instagram Direct
  session-window test.
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

Telegram and Messenger are enabled production delivery channels. WhatsApp and
Instagram Direct remain held behind explicit external release gates. This
avoids sending invalid templates, violating Meta messaging windows, or using
mismatched production identities.

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
- Messenger transactional delivery was released on production deployment
  `dpl_4P43hLg2GgCgmPM1QRVmnCaufb3g`. Before the fixture, production had zero
  pending lifecycle notifications and zero pending Messenger reminders.
- The fixture used the single consented Messenger identity from the controlled
  live test window. It did not expose or record the recipient identifier in
  this report.
- Database evidence: duplicate enqueue attempts inserted one row; final status
  `sent`, provider `messenger`, attempt count `1`, `sent_at` present, provider
  message ID present, and `last_error_code` null.
- Browser evidence: exactly one Messenger article contained the release-fixture
  message. The worker therefore proved the production path
  `outbox → claim → dispatch → finish → visible message` without a duplicate.

## Meta transport checkpoint

- WhatsApp Manager still reports `go_irl_event_reminder` and
  `go_irl_event_update` as pending review. No WhatsApp live message was sent
  and the channel was not enabled.
- Instagram inbound processing and signature verification remain green, but
  the outbound confirmation is still held behind its release gate.
- PR #326 added a server-only native Node HTTPS fallback for the narrow case
  where the standard Vercel `fetch` fails before receiving an HTTP response.
- The following production smoke isolated the transport failure to
  `ERR_INVALID_CHAR`, proving that the copied Instagram access token contained
  an invalid header character, normally a trailing line break.
- PR #327 now trims only leading and trailing token whitespace before building
  the Authorization header and rejects an empty normalized token. It does not
  expose, persist, or rewrite the credential.
- Both changes passed lint, typecheck, build, Vercel Preview, and the complete
  suite of `72` files and `366` tests. PR #327 is deployed from `main` and the
  production deployment is Ready.
- A fresh visible Instagram outbound reply after PR #327 is still required
  before the lifecycle, opt-out, retry, and idempotency gates can be marked
  green.
- Previously exposed Instagram password, Instagram App Secret, and webhook
  verification value must be rotated before the Instagram channel can be
  considered secure for final enablement.
- No access token, provider user ID, message body, or raw Meta payload is
  included in this report.

## Instagram credential checkpoint — production

- PR #329 normalized embedded whitespace and common zero-width formatting in the
  server-only Meta access token before the Authorization header is constructed.
- PR #330 restricts that header value to printable ASCII only. Both patches
  passed GitHub CI and Vercel checks, were merged, and are deployed to
  production.
- A fresh production `START` changed the backend outcome from
  `meta_transport_ERR_INVALID_CHAR` to `meta_send_failed_401`. The HTTP
  transport/header defect is therefore fixed; Meta is now rejecting the stored
  Instagram access token as invalid or expired.
- Meta API Setup confirms that the intended professional account is
  `vits.olo`, its webhook subscription is enabled, and token generation is
  available.
- Meta requires a forced interactive login to `vits.olo` before it can issue a
  fresh app-scoped token. This is the only current manual Instagram action.
- Instagram remains excluded from `REMINDER_ENABLED_PROVIDERS` until the fresh
  token is stored server-side and the live outbound, opt-out, retry, and
  idempotency gates pass.
- WhatsApp templates `go_irl_event_reminder` and `go_irl_event_update` still
  show pending review. No WhatsApp smoke test was sent and the channel was not
  enabled.
- No secret, provider identifier, message body, or raw Meta payload is included
  in this checkpoint.
