# Activity Chat Migration Compatibility Audit

Status: findings only  
Task: Com-Rev1007  
Checked: 2026-07-26

## Scope

Compare the merged Activity Chat contracts and minimal working release contracts against the current GO IRL production Supabase schema and applied migration ledger. This audit does not modify SQL, migrations, RLS, auth, secrets, production data, or configuration.

## Runtime evidence inspected

Production project: `GO IRL` (`tygfsvjkznypilfyyvdc`).

Current public schema contains:

- `activities`
- `activity_members`
- `app_users`
- `user_profiles`
- `activity_chats`
- `activity_chat_messages`

All listed tables have RLS enabled.

## Compatible foundations

| Contract requirement | Current schema | Result |
| --- | --- | --- |
| One chat per activity | `activity_chats.activity_id` is unique | Compatible |
| Activity identity | `activity_id uuid` references `activities.id` | Compatible |
| Chat identity | `activity_chats.id uuid` | Compatible with serialized contract string |
| Creator identity | `created_by_user_key text` | Compatible |
| Chat lifecycle | `active`, `expired`, `archived`, `deleted` | Exact match |
| Expiry timestamp | `expires_at timestamptz` | Compatible |
| Text message body | non-empty, max 1000 chars | Compatible with minimal release |
| Message lifecycle | `visible`, `deleted`, `hidden_by_moderator` | Compatible subset |
| Edit/delete timestamps | `edited_at`, `deleted_at` | Compatible |
| Participant source | `activity_members(activity_id, user_key)` | Usable as launch membership source |

## Gaps requiring an approved schema design

### 1. Applied migration ledger does not contain a chat-table migration

The production schema contains `activity_chats` and `activity_chat_messages`, but the applied migration list has no migration whose name records creation of these tables.

**Classification:** schema drift / provenance gap.

Do not create a replacement migration blindly. A Supabase Steward must first reconcile GitHub migration history, production object definitions, constraints, indexes, functions, triggers, grants, and RLS policies.

### 2. Membership statuses do not map directly

`activity_members.status` currently supports:

- `joined`
- `waiting`
- `pending`

Chat contracts use membership lifecycle states such as `active`, `muted`, `left`, and `removed`.

For the minimal release, only `joined` should grant participant chat access. `waiting` and `pending` must not be treated as active chat membership. Muting, leaving, and removal need either a dedicated chat-membership projection or an explicitly approved mapping.

### 3. No persistent read state

There is no current table or column for:

- last read message;
- last read timestamp;
- unread count;
- mention count.

`mark-read` and unread indicators cannot be implemented durably from the current schema alone.

### 4. No message idempotency key

`activity_chat_messages` has no client command key or uniqueness constraint for retry-safe message creation.

The minimal release `clientMessageKey` contract therefore requires an approved persistence mechanism before runtime wiring.

### 5. Message-kind and announcement gap

The current message table has no `kind` column. It cannot distinguish normal messages, announcements, and system messages as durable values.

Organizer announcements must remain disabled or be represented by a separately approved schema change.

### 6. Canonical user-key constraints are partial

Message senders and chat creators use `text` user keys, matching the platform identity format, but these columns do not expose foreign-key constraints to `app_users.user_key` in the inspected schema metadata.

Any future migration must decide whether referential integrity is enforced by FK, validated application boundary, or another documented mechanism.

### 7. Full contract features exceed the existing table

The current schema does not persist:

- replies or quotes;
- mentions;
- attachments;
- `held_for_review` message status;
- dedicated chat memberships;
- message reports.

These features remain outside the minimal working release and must not be inferred as implemented.

## Safe implementation boundary

The current schema can support a restricted read/write chat prototype only when all of the following hold:

1. exactly one chat is used per activity;
2. only `joined` activity members and the organizer are eligible;
3. messages are plain text;
4. message status is limited to the existing database values;
5. no durable unread state, idempotency, announcements, replies, mentions, attachments, or reports are claimed;
6. existing RLS behavior is independently verified before runtime enablement.

## Required next gate

Before any SQL or runtime rollout:

1. reconcile the missing migration provenance;
2. inventory current chat RLS policies, functions, triggers, grants, and indexes;
3. choose the minimum approved persistence additions for idempotency and read state;
4. produce a reviewed SQL diff;
5. run the full CI and schema verification gates on the same commit.

## Conclusion

The core activity/chat identifiers and basic text-message lifecycle are compatible. The current production schema is **not sufficient for the complete minimal-release contract** because durable read state, idempotency, message kinds, and explicit membership lifecycle are absent. The missing applied migration provenance is the primary blocker and must be resolved before schema changes or runtime rollout.
