# Notification Center Contracts

## Purpose

Define the read model and interaction commands for Notification Center without duplicating the canonical notification record or activating runtime UI.

## Source model

`src/notifications/contracts.ts` remains authoritative for notification identity, registry, payload, subject, actor, retention and deep links. Notification Center projects those records for list consumption.

## Read model

The center exposes:

- deterministic newest-first ordering;
- stable cursor pagination using `createdAt` plus notification id;
- filters for all, unread and category;
- item states `unread`, `read` and `opened`;
- subject/day grouping with group unread counts;
- total unread count;
- safe deep-link resolution.

## State rules

`opened` has precedence over `read`, and `read` has precedence over `unread`.

Marking an item opened may also satisfy read semantics at implementation time, but the contracts preserve both timestamps for analytics and idempotency.

`mark_all_read` accepts an optional cursor boundary so clients can acknowledge only the visible historical window.

## Ordering and pagination

Items sort by `createdAt` descending, then notification id descending. Cursor pagination must use the same tuple to prevent duplicates or gaps when timestamps match.

## Visibility and retention

Expired non-critical items may be hidden from the default center projection. Service-critical records remain visible according to their canonical retention policy even after their action target has expired.

## Deep-link fallback

Missing, expired or unavailable targets resolve to Home instead of producing a broken navigation state. Opening a fallback still records the notification interaction independently from target availability.

## Boundaries

This contract does not add UI, SQL, RLS, migrations, production data, realtime subscriptions, push delivery, external-provider behavior or deployment configuration.
