---
title: Review Data Model
owner: Tech Lead
status: Draft
source_of_truth: false
last_review: 2026-07-26
next_review: 2026-08-26
---

# Review Data Model

## Purpose

Define stable contracts for activity, organizer and coach reviews before any public review rollout.

## Product gate

Public publishing remains disabled. Runtime activation requires an explicit trust and moderation decision covering verified attendance, abuse handling, appeals, retention, privacy and aggregate display rules.

## Subjects

A review targets one canonical subject:

- activity;
- organizer;
- coach.

Every subject remains linked to the activity that created reviewer eligibility.

## Eligibility

Reviews require a recorded eligibility source. The default policy requires verified attendance. Organizer and coach participation are explicit sources for future bidirectional review flows, but do not activate those flows by themselves.

## Ratings

All rating dimensions use integer values from 1 to 5. Overall rating is mandatory. Optional dimensions are communication, punctuality, organization, safety and experience.

## Lifecycle

Review lifecycle states are draft, published, hidden by moderator and removed. Moderation status is tracked independently so moderation workflow does not overload publication state.

## Aggregates

Aggregates are derived projections, never authoritative review records. They track average, count, weighted value and verified-review count.

## Compatibility

The contracts preserve the current CoachReview concepts:

- activity linkage;
- reviewer user key;
- overall and communication ratings;
- punctuality and training/experience dimensions;
- tags and optional comment;
- public visibility represented through lifecycle state;
- rating average, count and weighted projections.

No existing runtime types or database fields are changed by this task.

## Moderation and reports

Review reports support spam, harassment, false information, privacy, unsafe content and other reasons. Reports have an independent review lifecycle.

## Notifications

Stable occurrence keys support the existing notification kinds `social.rating_received` and `social.review_received` without coupling contracts to a delivery implementation.

## Non-goals

- no SQL or migration;
- no RLS policy;
- no public reviews UI;
- no organizer reply UI;
- no automatic aggregate publication;
- no production rollout.
