# Notification Data Model Design

Status: Design only. No migration, RLS or production change is included.

## Authority boundary

The TypeScript registry in `src/notifications/contracts.ts` is the application contract for notification kinds, categories, default channels, service-critical boundaries and retention. A future reviewed migration must implement these contracts without inventing parallel enums.

## Proposed tables

### `notifications`

- `id uuid primary key`
- `recipient_user_key text not null`
- `kind text not null`
- `category text not null`
- `actor_user_key text null`
- `actor_snapshot jsonb null`
- `subject_type text not null`
- `subject_id text not null`
- `payload_version integer not null default 1`
- `payload jsonb not null`
- `deep_link jsonb null`
- `deduplication_key text not null`
- `service_critical boolean not null`
- `created_at timestamptz not null`
- `read_at timestamptz null`
- `opened_at timestamptz null`
- `expires_at timestamptz null`

Required constraints:

- unique `(recipient_user_key, deduplication_key)`;
- `payload_version = 1` for the first migration;
- valid `kind` and `category` values generated from the reviewed registry;
- `opened_at` implies `read_at`;
- timestamps cannot precede `created_at`.

### `notification_preferences`

- `user_key text not null`
- `kind text not null`
- `in_app_enabled boolean not null default true`
- `channels text[] not null default '{}'`
- `muted_until timestamptz null`
- `updated_at timestamptz not null`
- primary key `(user_key, kind)`

Service-critical kinds must ignore user disable requests. This must be enforced in the service layer and covered by database verification tests; the stored row must not make a service-critical notification disappear.

### `notification_deliveries`

- `id uuid primary key`
- `notification_id uuid not null`
- `channel text not null`
- `recipient_id text null`
- `status text not null`
- `attempt_count integer not null default 0`
- `next_retry_at timestamptz null`
- `provider_message_id text null`
- `failure_code text null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `sent_at timestamptz null`

This table extends the existing dispatcher foundation and must preserve normalized provider failure evidence from PR #370.

## Proposed RLS contract

No policy is applied in this design slice.

Future reviewed policies:

- authenticated users can select only notifications where `recipient_user_key` equals their canonical user key;
- users can update only `read_at` and `opened_at` on their own notifications;
- users can read/write only their own preference rows;
- notification creation and delivery state changes are server/service-role only;
- actor snapshots and payloads must not expose private profile fields;
- no client access to provider recipient IDs or delivery failure internals.

## Deep links

Deep links are structured data, not arbitrary URLs. Supported views are defined by `NotificationDeepLink`. Runtime resolution must validate entity access again before navigation.

## Idempotency

Every producer must supply an occurrence key. The canonical deduplication key combines:

- recipient;
- notification kind;
- subject type;
- subject ID;
- occurrence key.

Retries reuse the same notification and delivery records. They must not create a second Notification Center item.

## Retention

Retention is registry-driven. Expired rows can be removed only by a reviewed service job. Delivery audit retention may differ from Notification Center retention and must be specified before migration approval.

## Migration approval gate

Before any SQL/RLS work:

1. PR #370 delivery behavior is reconciled or merged.
2. Existing reminder and event-notification schemas are inventoried.
3. Generated enum/check constraints are reviewed against the TypeScript registry.
4. RLS tests cover owner reads, read/open updates, service-only creation and private-data exclusion.
5. Verification and rollback SQL are supplied.
6. Explicit owner approval is obtained.
