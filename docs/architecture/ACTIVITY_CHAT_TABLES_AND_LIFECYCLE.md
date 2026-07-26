# Activity Chat Tables and Lifecycle

Status: Contract specification only. This document does not authorize SQL, migration, RLS, auth, production data, configuration, or deployment changes.

## Minimal table set

- `activity_chats`: one row per activity, lifecycle state, expiry and audit timestamps.
- `activity_chat_memberships`: durable per-chat user role/status boundary.
- `activity_chat_messages`: text-first message storage with client idempotency and deterministic pagination.
- `activity_chat_read_states`: durable monotonic read position per chat member.

## Required keys

- `activity_chats.id` primary key; unique `activity_id`.
- `activity_chat_memberships(chat_id, user_key)` primary key.
- `activity_chat_messages.id` primary key; unique `(chat_id, sender_user_key, client_message_id)`.
- `activity_chat_read_states(chat_id, user_key)` primary key.

Every child record carries the owning `activity_id` or `chat_id` needed to reject cross-activity access before role evaluation.

## Required indexes

- chats by `(status, expires_at)` for lifecycle workers;
- memberships by `(activity_id, status)` and `(user_key, status)`;
- messages by `(chat_id, created_at, id)` for stable cursor pagination;
- messages by `(activity_id, created_at)` for activity-scoped audit;
- read state by `(user_key, updated_at)` for unread projections.

## Lifecycle

Allowed transitions:

- `active -> expired` when `expires_at` is reached;
- `expired -> archived` after the retention window;
- `active|expired|archived -> deleted` only through an authorized moderation path.

Reverse transitions are invalid. Deleted chats are terminal.

## Retention

- expired chats are read-only;
- archive target: 30 days after expiry;
- purge target: 90 days after archive;
- moderation evidence must be preserved until the authorized retention policy permits removal.

The exact durations remain policy values and must be approved before a production migration or worker rollout.

## Current compatibility boundary

Production currently has `activity_chats` and `activity_chat_messages`, but durable memberships, read state, message idempotency and the complete migration provenance are not verified as present. Implementation must not infer production readiness from this contract.
