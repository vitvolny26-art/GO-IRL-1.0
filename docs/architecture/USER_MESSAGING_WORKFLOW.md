# User Messaging and Event Reminder Workflow

## Goal

GO IRL communicates with users through the bot/account they explicitly connected. The browser never stores provider credentials and never acts as a background notification worker.

## User-facing messages

| Trigger | Recipient | Message | Primary action |
| --- | --- | --- | --- |
| Private-event join request | Organizer | A person requested access | Review request |
| Request accepted/rejected | Applicant | Decision and event summary | Open event |
| Event changed | Confirmed participants | Changed date, time, place, or cancellation | Open updated event |
| Scheduled reminder | User who opted in | Event starts soon | Open event / map / calendar |
| Capacity becomes available | Waitlisted user | A place is available | Join |

## Reminder setup

1. The user presses the bell on an event card.
2. The user selects a lead time: 15 minutes, 1 hour, 3 hours, or 1 day.
3. The user selects Telegram, WhatsApp, Instagram, or Messenger.
4. GO IRL verifies that this provider identity is linked to the current GO IRL user and that messaging consent/window rules allow delivery.
5. The preference is stored by `(user_key, activity_id)`; changing the choice updates the existing reminder instead of creating a duplicate.
6. The UI shows an active bell. The user can edit or remove the reminder.

## Server delivery pipeline

```text
event_reminders (scheduled)
  -> due-reminder worker
  -> reload current event and membership
  -> stop if cancelled, finished, inaccessible, or reminder removed
  -> resolve linked provider identity
  -> enforce opt-in, quiet hours, and provider policy window/template
  -> build provider-neutral reminder result
  -> provider adapter (Telegram / WhatsApp / Instagram / Messenger)
  -> record sent | retryable failure | permanent failure
```

The delivery key is `reminder:{user_key}:{activity_id}:{scheduled_for}`. It must be unique so retries cannot send the same reminder twice.

## Provider behavior

- Telegram: bot message with event card, **Open event**, **Calendar**, and **Map** actions.
- WhatsApp: approved template outside the 24-hour service window; interactive message inside the window.
- Instagram: Direct reply only where Meta policy permits messaging the user; otherwise the UI must not promise delivery.
- Messenger: Page message with event preview and actions, subject to the active messaging window and permissions.

If the selected provider is not linked, GO IRL asks the user to connect it. It must not silently fall back to another messenger.

## Event changes

- Moving the event recalculates every unsent reminder from the new start time.
- Cancelling or deleting the event cancels unsent reminders.
- Leaving the event does not automatically remove a personal reminder unless product policy explicitly requires membership.
- A reminder must never expose a private event to a user who has lost access.

## Failure and privacy rules

- Provider tokens remain server-side.
- Store provider user IDs only in the protected identity table; cards and logs use internal `user_key`.
- Retry transient `429` and `5xx` failures with exponential backoff and a hard attempt limit.
- Do not retry invalid-recipient, revoked-consent, or policy-window failures.
- Logs contain event ID, internal user key, provider, timestamps, and delivery status, but not message bodies or tokens.
- Users can remove one reminder, mute one provider, or disable all bot communication.

## Current implementation boundary

The production implementation now includes:

- the event-card reminder control;
- Supabase-backed preferences with owner-scoped RLS;
- linked provider identities and explicit reminder consent;
- an atomic due-reminder worker with retries and idempotency;
- Telegram, WhatsApp, Instagram, and Messenger delivery adapters;
- a transactional event-notification outbox;
- provider opt-in/opt-out handling;
- protected health monitoring and rate-limited operator alerts.

For a trusted authenticated session, Supabase is authoritative. Local storage is only
an unauthenticated fallback and optimistic cache; it must not keep the bell active
when the server has no reminder.

Telegram is enabled in production. WhatsApp activation is gated on approved Meta
templates and a real-number smoke test. Instagram Direct and Messenger activation
is gated on an inbound message window and a live outbound smoke test. The UI must
not promise delivery through a provider that is not linked and enabled.
