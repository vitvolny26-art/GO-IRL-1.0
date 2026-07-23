# GO IRL messaging and reminders — completion audit

Date: 2026-07-23  
Repository: `vitvolny26-art/GO-IRL-1.0`  
Audited production runtime commit: `70c35248c9edc0629a4c7825757c0da943936d5f`  
Audited documentation head: `34356d57db32faf6dfe0506c39d4fe57bf261b95`

## Executive status

The shared messaging and reminder platform is implemented and deployed. Telegram
and Messenger have passed the full production release gate. Instagram Direct has
passed the functional live gate but remains disabled until previously exposed
credentials are rotated and the short smoke test is repeated. WhatsApp remains
disabled because the connected account still has only a Meta test number, the
business/production number gate is incomplete, and both outbound templates are
still under review.

Progress must therefore be reported in three separate dimensions:

- Shared engineering implementation: complete.
- Fully released delivery channels: 2 of 4.
- Final cross-channel physical-device release matrix: incomplete.

The earlier `93%` figure described engineering progress including partially
completed external gates. It must not be read as proof that all four channels are
production-ready.

## Requirement-by-requirement evidence

| Requirement | Status | Authoritative evidence |
| --- | --- | --- |
| Reminder UI on event cards | Complete | Server-authoritative reminder panel, trusted-auth gate, mobile-width verification, PRs #298, #313 and #314 |
| Protected server reminder storage | Complete | `event_reminders` model and server repository |
| RLS and ownership verification | Complete | Production migrations and rollback verifiers; client writes denied; owner isolation verified |
| Due-reminder worker | Complete | Protected `/api/reminders/run`; Supabase cron invokes it every minute |
| Provider-neutral delivery | Complete | Shared reminder and lifecycle dispatchers with per-provider adapters |
| Delivery idempotency | Complete | Unique delivery keys, atomic claim/finish RPCs, durable inbound event claims |
| Retry handling | Complete | Retryable failure classification and bounded retry state |
| Transactional join/change/cancellation outbox | Complete in code | `event_notifications` queue covers join, pending, waitlist, approval, rejection, change and cancellation |
| Opt-in/opt-out | Complete for tested Meta channels | Messenger and Instagram `START`/`STOP`/ordinary-message-after-STOP live tests |
| Monitoring | Complete for service health; operator destination pending | Protected health response, queue age/failure metrics, cooldown-protected alert path |
| Telegram outbound | Released | Production delivery and event action path |
| Messenger outbound | Released | Real inbound/outbound, lifecycle outbox, opt-out and exactly-once visible delivery |
| Instagram outbound | Functionally green; security release pending | Real START/STOP/START, one lifecycle delivery, no duplicate; credential rotation still required |
| WhatsApp outbound | Blocked externally | Test WABA/test number only; two templates under review; provider remains disabled |
| Automated verification | Complete for current runtime | GitHub Actions run `30020427852`: Test, Typecheck, Lint and Build all green; latest recorded suite: 72 files / 366 tests |
| Production worker health | Complete for observed window | Deployment `dpl_AjC24hmzzMYytK4DNuMXdK9v5eAX` Ready; repeated worker calls returned 200 with empty healthy batches and no runtime errors |
| Credential hygiene | Partial | Secrets are server-only and absent from repository/logs; exposed Instagram password/App Secret still require rotation |
| Full physical-device release gate | Incomplete | The complete Telegram/WhatsApp/Instagram/Messenger event, join, calendar, map, reminder, opt-out, change and cancellation matrix has not been recorded |

## Channel release state

### Telegram

Released. Reminder and transactional delivery are enabled.

### Messenger

Released. The production path `webhook → identity → outbox → worker → visible
message` passed. Duplicate enqueue produced one row and one visible message.
Opt-out and subsequent opt-in passed.

### Instagram Direct

Functional release gate passed:

- correct professional account;
- real inbound START/STOP/START;
- opt-out respected;
- one controlled lifecycle message;
- attempt 1, no retry and no duplicate.

Security release gate remains open because credentials visible during setup must
be rotated. Instagram must remain disabled until the rotation and repeat smoke
test are complete.

### WhatsApp

Not production-ready:

- WABA contains only a Meta test number;
- production phone registration is unavailable until Meta business/phone
  verification is completed;
- `go_irl_event_reminder` is under review;
- `go_irl_event_update` is under review;
- no real-number live release test has been possible.

Webhook verification and the `messages` subscription are complete, but they do
not prove outbound production readiness.

## Manual owner actions

These actions cannot be completed safely by an autonomous agent because they
require the account owner's password, legal/business verification or a physical
device.

1. Instagram security rotation
   - Change the Instagram password for the professional account.
   - Rotate the Meta App Secret.
   - Reauthenticate the Instagram integration and generate a fresh app-scoped
     access token.
   - Store it only in the Vercel server environment.
   - Then allow one small START/STOP/START plus lifecycle smoke test.

2. WhatsApp production identity
   - Complete Meta Business verification.
   - Register a real WhatsApp Business phone number.
   - Enter the SMS or voice verification code.
   - Wait until both GO IRL templates are Active.
   - Then allow the controlled invitation, join, lifecycle, reminder,
     idempotency and opt-out smoke test.

3. Physical-device acceptance
   - On a real Android phone, test Telegram, Messenger and Instagram now.
   - Test WhatsApp only after the production-number and template gates pass.
   - For each enabled channel verify: invitation preview, exact event, join,
     confirmation, calendar, map, reminder, opt-out, event change and
     cancellation.
   - Record screenshots for failures only; never include tokens or secrets.

4. Operator alerts
   - Select the single Telegram chat that should receive production worker
     alerts. Only its server-side chat identifier should be configured.

## Safe next sequence

1. Owner completes the Instagram password and App Secret rotation.
2. Agent repeats the Instagram functional smoke and enables the channel only
   after the security gate is green.
3. Owner completes Meta Business and WhatsApp phone verification and waits for
   both templates to become Active.
4. Agent runs the WhatsApp release gate and enables the channel only when every
   check passes.
5. Owner performs the physical-device matrix; agent records and fixes any
   failures.

## Current release decision

Keep Telegram and Messenger enabled. Keep Instagram and WhatsApp disabled. Do
not claim the full roadmap complete until both external channel gates and the
physical-device matrix are green.

## Privacy boundary

This audit contains no password, access token, App Secret, verification token,
provider user identifier, phone number, raw webhook payload or private message
body.

