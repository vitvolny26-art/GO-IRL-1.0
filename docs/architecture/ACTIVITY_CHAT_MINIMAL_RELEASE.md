# Activity Chat Minimal Working Release

## Goal
Ship the smallest activity-scoped chat contract that can be wired later without expanding into direct messages or permanent communities.

## Release surface
- one chat per activity;
- active activity members and moderators only;
- text messages and organizer announcements;
- deterministic newest-page cursor;
- per-member read cursor;
- author edit window of 15 minutes;
- author delete window of 60 minutes;
- report-to-moderation handoff;
- read-only state after expiry.

## Explicit exclusions
Attachments, voice, mentions, arbitrary direct messages, permanent team chat, public indexing, recommendation signals and cross-activity chat are not part of this release.

## Access
Active members receive read-write access only while the chat is open. Muted members and post-expiry members are read-only. Removed users and non-members have no access. Organizer, co-organizer and moderator roles may publish announcements.

## Delivery boundary
These contracts do not implement storage, RLS, realtime subscriptions, notification delivery or UI. Existing canonical chat identity and lifecycle contracts remain authoritative.

## Safety
Runtime rollout requires a separate reviewed task covering SQL/RLS, moderation operations, abuse controls and verified end-to-end tests.
