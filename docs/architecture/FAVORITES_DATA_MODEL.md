---
title: Favorites Data Model
owner: Tech Lead
status: Proposed
source_of_truth: true after merge into main
last_review: 2026-07-26
next_review: 2026-08-09
---

# Favorites Data Model

## Decision

Favorites are private user preferences scoped to either an activity or an organizer.

This contract does not create followers, a public social graph, arbitrary direct messages, public favorite counts, recommendation ranking, or Teams.

## Subjects

- `activity`: save one activity for later access.
- `organizer`: save an organizer and optionally receive notifications when that organizer creates a new activity.

## Privacy

Favorite identities and counts are private by default. Organizers cannot inspect which users favorited them. Public counters require a separate product and privacy decision.

## Lifecycle

One active favorite may exist for each user and subject. Removal is represented as lifecycle state rather than destructive deletion so runtime design can later define audit, retention, and privacy-erasure behavior explicitly.

## Notifications

Organizer favorites may enable `social.favorite_organizer_event_created`. Delivery must use recipient-specific deduplication and respect mute preferences. Favoriting an organizer does not grant chat access or permission to contact the user.

## Compatibility

The contracts align with existing notification kinds `social.favorited` and `social.favorite_organizer_event_created`. No existing runtime type, SQL table, RLS policy, migration, auth path, or production record is changed.

## Deferred

- runtime persistence and RLS;
- favorite UI;
- recommendation use;
- public counters;
- social graph;
- Teams and team membership.
