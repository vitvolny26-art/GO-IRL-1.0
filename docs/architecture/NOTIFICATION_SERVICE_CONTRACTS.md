# Notification Service Contracts

## Purpose

Define a provider-neutral orchestration boundary between notification producers, the Notification Center model, and the existing transactional event outbox.

## Flow

1. A domain emits a `NotificationCommand` with a stable command and occurrence identity.
2. Recipient resolution determines eligible user keys without granting membership or access.
3. Registry, preference, capability, and policy evaluation produce channel decisions.
4. In-app records are persisted first.
5. External delivery intents are dispatched as best effort.
6. Every channel outcome is terminal, retryable, cancelled, or deduplicated.

## Compatibility

The existing event outbox remains valid. `legacyEventNotificationKindMap` translates its event kinds into the canonical registry. The contract does not replace the current worker, dispatcher, repository, provider-window rules, or claim/finish RPCs.

`event_changed` remains conservatively mapped to `participation.event_time_changed`; a future producer must emit explicit time/location kinds when field-level evidence is available.

## Reliability

- deduplicate before dispatch;
- idempotency is command + recipient + channel;
- persist in-app before external delivery;
- external provider failure must not remove the in-app record;
- retry scheduling is explicit and bounded;
- service-critical kinds cannot be disabled by normal preferences;
- permanent provider failure may create `system.delivery_problem`.

## Boundaries

This change does not add SQL, migrations, RLS, provider credentials, production configuration, runtime wiring, UI, jobs, or deployment changes.
