---
title: Coach Production RLS Inventory
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-26
---

# Coach Production RLS Inventory

## Task

Perform a read-only inventory of the production Supabase state for `coach_profiles`, `coach_requests`, and `coach_reviews`, then reconcile the Sport Coach MVP 1.1 roadmap with the canonical scope.

## Production project

- Project: `GO IRL`
- Project ref: `tygfsvjkznypilfyyvdc`
- Region: `eu-west-3`
- Status at inspection: `ACTIVE_HEALTHY`
- Inspection date: 2026-07-19

No SQL, RLS, migration, auth, secret, or production data change was made.

## Applied migration evidence

Production migration history contains:

- version: `20260704`
- name: `coach_requests_and_ratings`

This proves that a Coach migration with this version/name was applied. It does not prove that the current policy set matches either repository migration file exactly, because production currently contains overlapping policy families.

## RLS state

RLS is enabled and not forced on:

- `coach_profiles`
- `coach_requests`
- `coach_reviews`

## Critical finding: duplicate policy families

Production contains two overlapping policy families on the Coach tables:

- policies scoped to `authenticated`, with names such as `coach profiles read` and `coach requests read`;
- policies scoped to `public`, with names such as `coach_profiles_read_active` and `coach_requests_read_own`.

Because PostgreSQL permissive policies combine with OR semantics, the effective access model is the union of these policies. A corrective migration must therefore start from the actual production policy list, not from either repository migration file in isolation.

## Confirmed access gaps

### No public-safe confirmed Coach request projection

Ordinary participants and viewers cannot read a confirmed organizer request unless they are:

- the requester;
- the activity organizer/manager;
- moderator/admin.

Therefore the current frontend cannot reliably read raw `coach_requests` to show a confirmed Coach badge or assigned Coach details to all allowed viewers.

Required future solution: a public-safe batch projection that exposes only confirmed assignment summary fields and no requester key, private goal, admin note, rejection reason, participant interest, or moderation data.

### Assigned Coach has no explicit request permission

No current `coach_requests` SELECT/UPDATE policy grants access by joining `coach_profile_id` to a Coach profile owned by the current user. A real Coach inbox and accept/reject flow is not supported by the current production RLS.

### Profile owners can update server-owned trust fields

Current profile UPDATE policies authorize the whole row for the owner or moderator. They do not provide column-level protection for:

- `is_verified`;
- rating aggregates;
- moderation/trust fields.

A future backend-authoritative design must protect these fields from direct owner updates.

### Review policy exceeds canonical MVP 1.1 scope

Production includes public review reads and review insert/update policies. The canonical Sport Coach MVP 1.1 document places the full Review Flow in 1.2+.

No review SQL was changed. Review exposure and eligibility require a separate approved decision after attendance semantics exist.

## Constraints

Confirmed production constraints include:

- one Coach profile per `user_key`;
- one Coach request per `(activity_id, requester_user_key, request_type)`;
- request types: `organizer_request`, `participant_interest`;
- statuses: `pending`, `matched`, `confirmed`, `cancelled`, `completed`, `rejected`;
- foreign keys from requests/reviews to activities and Coach profiles;
- one review per `(coach_profile_id, activity_id, reviewer_user_key)`;
- rating range checks from 1 to 5.

Missing integrity rules:

- `coach_profile_id` is not required for `matched`, `confirmed`, or `completed`;
- sport-only usage is not enforced by a Coach-specific constraint;
- transition ownership is not enforced by the status constraint;
- assigned Coach acceptance is not enforced.

## Index findings

Production contains duplicate or overlapping indexes, including:

- `idx_coach_profiles_active` and `idx_coach_profiles_is_active`;
- `idx_coach_requests_activity` and `idx_coach_requests_activity_id`;
- `idx_coach_reviews_activity` and `idx_coach_reviews_activity_id`;
- `idx_coach_reviews_coach_id` and `idx_coach_reviews_profile`.

No indexes were removed. Any cleanup must be a separate reviewed migration after query usage inspection.

## Helper functions confirmed

Production definitions were inspected for:

- `go_irl_request_user_key()`;
- `go_irl_request_can_moderate()`;
- `go_irl_can_manage_activity(uuid)`.

`go_irl_can_manage_activity` authorizes moderators/admins or the matching activity organizer.

## Roadmap reconciliation decision

For Sport Coach MVP 1.1:

In scope:

- sport-only Coach request;
- organizer note through the existing `goal` field;
- participant interest;
- manual assignment foundation;
- assigned Coach accept/reject;
- confirmed-only card badge and event detail block;
- Activity Chat proximity;
- local-only browser demo with Alex.

Future 1.2+:

- Role Choice;
- Beginner Helper and Team Captain as selectable roles;
- full Review Flow;
- attendance-linked rating/feedback implementation.

Future 1.3+:

- universal Event Roles.

## Security gate

Do not implement or expose production matching, Coach confirmation, Coach inbox, public badge projection, or reviews until an explicitly approved corrective backend/RLS design exists.

The future corrective migration must be based on this production inventory and must include multi-identity verification for:

- organizer;
- joined participant;
- assigned Coach;
- outsider;
- moderator/admin.

## Changes made

- Added this read-only production inventory report.
- Reconciled `ROADMAP.md` wording with `docs/SPORT_COACH_MVP.md` in the same branch.

## Checks

- Production SQL executed: SELECT-only inventory queries.
- Application code unchanged.
- Supabase schema/RLS/data unchanged.
- `pnpm run lint`, `pnpm run build`, and `pnpm run test` were not run because this is documentation-only.

## Next step

Review and merge this documentation PR. Then prepare one separate proposed RLS/backend design without applying it. No migration should be executed until the design and rollback plan receive explicit approval.
