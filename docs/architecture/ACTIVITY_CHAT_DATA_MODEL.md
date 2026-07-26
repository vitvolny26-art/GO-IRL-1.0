---
title: Activity Chat Data Model
owner: Tech Lead
status: Draft
source_of_truth: false
last_review: 2026-07-26
next_review: 2026-08-09
---

# Activity Chat Data Model

## Decision

GO IRL chat remains scoped to one activity. It is a coordination surface, not a general messenger. Arbitrary direct messages are excluded.

This document defines contracts only. It does not authorize SQL, migration, RLS, auth, storage, production-data or production-configuration changes.

## Existing compatible baseline

The current runtime already uses:

- `activity_chats` with one chat per activity;
- chat statuses `active`, `expired`, `archived`, `deleted`;
- `activity_chat_messages` with visible, deleted and moderator-hidden states;
- organizer, joined-participant and moderator access;
- time-based expiry;
- browser demo storage isolated from production Supabase.

The new contracts preserve these identifiers and status values.

## Canonical entities

### ActivityChat

One activity-scoped conversation with lifecycle and retention timestamps.

### ChatMembership

A materialized permission/read-state projection for organizer, co-organizer, participant or moderator. Runtime authorization remains grounded in trusted activity membership and organizer identity; this contract must not become an unverified client-side authority.

### ActivityChatMessage

Supports message, organizer announcement and system kinds. Replies and quotes reference stable message IDs. Mentions use user keys plus body offsets. Attachments are metadata references only; binary storage requires a separate approved design.

### ChatReadState

Tracks the last-read cursor and derived unread/mention counts. Unread counts are projections and must be recomputable from durable message and cursor state.

### ChatReport

Records message-level reports with a bounded reason catalogue and review status. Reporting does not expose moderator powers to clients.

## Lifecycle

1. Chat is created or ensured for an activity.
2. Organizer and confirmed participants may read and write while active.
3. Muted membership suppresses non-critical notifications but does not revoke access.
4. Left or removed membership loses write access; read access after departure requires an explicit privacy decision.
5. At expiry, writes stop deterministically.
6. Archived chat becomes read-only if retention policy permits.
7. Messages are deleted only through an approved retention/moderation procedure.

## Minimal Working Release

Required:

- activity scope;
- organizer and confirmed-participant access;
- text messages;
- organizer announcements;
- replies;
- unread cursor and count;
- deterministic archive state;
- own-message delete state;
- message report contract;
- notification occurrence keys.

Deferred:

- reactions;
- voice and file upload runtime;
- global search;
- permanent team chat;
- direct messages;
- cross-activity inbox;
- public moderation tooling.

## Proposed storage mapping

No migration is included. A future approved migration may extend the existing tables or add:

- `activity_chat_memberships`;
- reply/quote columns or a reference table;
- `activity_chat_mentions`;
- `activity_chat_attachments`;
- `activity_chat_read_states`;
- `activity_chat_reports`.

Before implementation, verify all current migrations and production schema. Do not rename `activity_id`, `user_key`, `chat_id` or current status values without a compatibility and RLS review.

## RLS design requirements

- trusted server-derived user identity only;
- organizer, joined participant and moderator read access;
- active organizer/joined participant write access;
- sender-only edit/delete within policy boundaries;
- moderator hide/report resolution through server-authorized operations;
- no cross-activity reads;
- attachment access inherits chat/message authorization;
- read-state rows visible and writable only by their user, except bounded operational access.

## Notification integration

Message, reply, mention and announcement events map to the Notification Registry. Deduplication occurrence keys use chat ID, message ID and event kind. Organizer announcements may be service-critical; ordinary messages, replies and mentions are not service-critical by default.

## Approval gates

Explicit owner approval is required before:

- SQL or migration changes;
- RLS changes;
- storage bucket or attachment policy changes;
- production data changes;
- retention deletion jobs;
- moderator/admin runtime operations.
